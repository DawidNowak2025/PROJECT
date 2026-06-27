// This code is used to import the backend libraries.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const bcrypt = require("bcryptjs");

// This code is used to create the Express application.
const app = express();
const PORT = 5000;

// This code is used to define local JSON storage paths.
const DATA_FOLDER = path.join(__dirname, "data");
const PLANTS_FILE = path.join(DATA_FOLDER, "plants.json");
const ACTIVITY_FILE = path.join(DATA_FOLDER, "activityLog.json");
const CARE_FILE = path.join(DATA_FOLDER, "careRecommendations.json");
const ZONES_FILE = path.join(DATA_FOLDER, "gardenZones.json");
const USERS_FILE = path.join(DATA_FOLDER, "users.json");
const PLANT_TYPES_FILE = path.join(DATA_FOLDER, "plantTypes.json");
const ZONE_IMAGES_FILE = path.join(DATA_FOLDER, "gardenZoneImages.json");
const UPLOADS_FOLDER = path.join(__dirname, "uploads");

// This code is used to create the data and uploads folders if they do not exist.
if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER);
}

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}

// This code is used to create default JSON files if they do not exist.
function createFileIfMissing(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

createFileIfMissing(PLANTS_FILE, []);
createFileIfMissing(ACTIVITY_FILE, []);
createFileIfMissing(CARE_FILE, {
  vegetable: {
    wateringFrequency: 3,
    sunlight: "Full sun",
    advice: "Vegetables usually need regular water and sunlight."
  },
  herb: {
    wateringFrequency: 2,
    sunlight: "Partial sun",
    advice: "Herbs grow well in pots, but soil should not fully dry."
  },
  flower: {
    wateringFrequency: 4,
    sunlight: "Mixed sunlight",
    advice: "Flowers should be checked often for dry soil and pests."
  },
  houseplant: {
    wateringFrequency: 7,
    sunlight: "Indirect light",
    advice: "Houseplants normally need less water than outdoor plants."
  },
  fruit: {
    wateringFrequency: 4,
    sunlight: "Full sun",
    advice: "Fruit plants normally need steady watering and good sunlight."
  },
  tree: {
    wateringFrequency: 7,
    sunlight: "Full or partial sun",
    advice: "Trees usually need deeper but less frequent watering."
  },
  shrub: {
    wateringFrequency: 5,
    sunlight: "Partial sun",
    advice: "Shrubs should be checked for dry soil and seasonal pruning."
  },
  succulent: {
    wateringFrequency: 14,
    sunlight: "Bright light",
    advice: "Succulents need less water and should not sit in wet soil."
  },
  default: {
    wateringFrequency: 5,
    sunlight: "Check plant label",
    advice: "No exact recommendation found."
  }
});
createFileIfMissing(ZONES_FILE, [
  "Back Garden - Left Bed",
  "Back Garden - Right Bed",
  "Greenhouse",
  "Patio Pots",
  "Front Garden",
  "Indoor Plants"
]);
createFileIfMissing(USERS_FILE, []);
createFileIfMissing(PLANT_TYPES_FILE, [
  "Vegetable",
  "Herb",
  "Flower",
  "Houseplant",
  "Fruit",
  "Tree",
  "Shrub",
  "Succulent"
]);
createFileIfMissing(ZONE_IMAGES_FILE, {});

// This code is used to allow React frontend requests and JSON request bodies.
app.use(cors());
app.use(express.json());

// This code is used to make uploaded images available in the browser.
app.use("/uploads", express.static(UPLOADS_FOLDER));

// This code is used to configure where uploaded images are stored.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + cleanName);
  }
});

// This code is used to allow common image files for uploads.
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (file.mimetype.startsWith("image/") || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      console.log("Rejected file:", file.originalname, file.mimetype);
      cb(new Error("Only image files are allowed."));
    }
  }
});

// This code is used to read JSON from a local file.
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// This code is used to write JSON into a local file.
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// This code is used to read all plants.
function readPlants() {
  return readJson(PLANTS_FILE);
}

// This code is used to save all plants.
function savePlants(plants) {
  writeJson(PLANTS_FILE, plants);
}

// This code is used to read registered local users.
function readUsers() {
  return readJson(USERS_FILE);
}

// This code is used to save registered local users.
function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

// This code is used to add automatic activity log entries.
function addActivity(text) {
  const activity = readJson(ACTIVITY_FILE);
  activity.unshift({
    id: Date.now(),
    date: new Date().toISOString().split("T")[0],
    text: text
  });
  writeJson(ACTIVITY_FILE, activity);
}

// This code is used to convert plant type display names into JSON keys.
function normaliseTypeKey(typeName) {
  return String(typeName || "").trim().toLowerCase();
}

// This code is used to calculate next watering date.
function calculateNextWateringDate(lastWatered, frequency) {
  if (!lastWatered || !frequency) {
    return "";
  }

  const date = new Date(lastWatered);
  date.setDate(date.getDate() + Number(frequency));
  return date.toISOString().split("T")[0];
}

// This code is used to calculate watering status.
function getWateringStatus(nextWateringDate) {
  if (!nextWateringDate) {
    return "No Date";
  }

  const today = new Date().toISOString().split("T")[0];

  if (nextWateringDate < today) {
    return "Overdue";
  }

  if (nextWateringDate === today) {
    return "Water Today";
  }

  return "Upcoming";
}

// This code is used to add calculated tracker fields to plant records.
function enrichPlant(plant) {
  const nextWateringDate = calculateNextWateringDate(plant.lastWatered, plant.wateringFrequency);

  return {
    ...plant,
    nextWateringDate,
    wateringStatus: getWateringStatus(nextWateringDate)
  };
}

// This code is used to create dashboard summary data.
function buildDashboard(plants) {
  const enrichedPlants = plants.map(enrichPlant);

  return {
    totalPlants: enrichedPlants.length,
    waterToday: enrichedPlants.filter((plant) => plant.wateringStatus === "Water Today").length,
    overduePlants: enrichedPlants.filter((plant) => plant.wateringStatus === "Overdue").length,
    plantsWithIssues: enrichedPlants.filter((plant) => plant.healthStatus !== "Healthy").length,
    gardenZonesUsed: new Set(enrichedPlants.map((plant) => plant.gardenZone)).size
  };
}

// This code is used to create simple rule-based plant care assistant advice.
function buildPlantAdvice(plant) {
  let priority = "Low";
  let advice = "This plant looks stable at the moment.";
  let nextAction = "Continue normal care and monitor growth.";
  const reasons = [];

  if (plant.wateringStatus === "Overdue") {
    priority = "High";
    advice = "This plant is overdue for watering.";
    nextAction = "Check the soil and water the plant if the soil is dry.";
    reasons.push("watering is overdue");
  }

  if (plant.wateringStatus === "Water Today") {
    priority = priority === "High" ? "High" : "Medium";
    advice = "This plant is scheduled for watering today.";
    nextAction = "Water the plant today unless the soil is already wet.";
    reasons.push("watering is due today");
  }

  if (plant.healthStatus && plant.healthStatus !== "Healthy") {
    priority = "High";
    advice = `${advice} The health status is marked as ${plant.healthStatus}.`;
    nextAction = `${nextAction} Inspect leaves, soil and possible pest problems.`;
    reasons.push(`health status is ${plant.healthStatus}`);
  }

  const notes = String(plant.notes || "").toLowerCase();

  if (notes.includes("dry")) {
    priority = "High";
    advice = `${advice} The notes mention dryness.`;
    nextAction = `${nextAction} Check if the watering frequency should be reduced in days.`;
    reasons.push("notes mention dry condition");
  }

  if (notes.includes("yellow")) {
    priority = priority === "High" ? "High" : "Medium";
    advice = `${advice} Yellow leaves can be a sign of stress, overwatering or lack of nutrients.`;
    nextAction = `${nextAction} Check drainage, soil moisture and sunlight.`;
    reasons.push("notes mention yellow leaves");
  }

  if (notes.includes("pest")) {
    priority = "High";
    advice = `${advice} The notes mention a possible pest issue.`;
    nextAction = `${nextAction} Inspect the plant carefully and remove affected leaves if needed.`;
    reasons.push("notes mention pests");
  }

  if (plant.type && normaliseTypeKey(plant.type) === "succulent" && plant.wateringFrequency < 7) {
    priority = priority === "High" ? "High" : "Medium";
    advice = `${advice} Succulents usually do not need frequent watering.`;
    nextAction = `${nextAction} Make sure the soil dries between watering.`;
    reasons.push("succulent has frequent watering");
  }

  if (reasons.length === 0) {
    reasons.push("watering status, health status and notes show no urgent issue");
  }

  return {
    plantId: plant.id,
    plantName: plant.name,
    gardenZone: plant.gardenZone,
    plantType: plant.type,
    healthStatus: plant.healthStatus,
    wateringStatus: plant.wateringStatus,
    nextWateringDate: plant.nextWateringDate,
    priority,
    advice,
    nextAction,
    reason: `Based on ${reasons.join(", ")}.`
  };
}

// This route is used to register a new local user.
app.post("/api/auth/register", async (req, res) => {
  const users = readUsers();
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({ message: "This email is already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({
    message: "User registered successfully.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

// This route is used to log in an existing local user.
app.post("/api/auth/login", async (req, res) => {
  const users = readUsers();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  const user = users.find((item) => item.email === email);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({
    message: "Login successful.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// This route is used to view registered users without passwords for local testing.
app.get("/api/auth/users", (req, res) => {
  const users = readUsers().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  }));

  res.json(users);
});

// This route is used to test the backend.
app.get("/", (req, res) => {
  res.json({ message: "GROW Garden Tracker backend is running." });
});

// This route is used to get dashboard data.
app.get("/api/dashboard", (req, res) => {
  res.json(buildDashboard(readPlants()));
});

// This route is used to get all plants.
app.get("/api/plants", (req, res) => {
  res.json(readPlants().map(enrichPlant));
});

// This route is used to get all plant types.
app.get("/api/plant-types", (req, res) => {
  res.json(readJson(PLANT_TYPES_FILE));
});

// This route is used to create a new plant type.
app.post("/api/plant-types", (req, res) => {
  const plantTypes = readJson(PLANT_TYPES_FILE);
  const newType = (req.body.type || "").trim();

  if (!newType) {
    return res.status(400).json({ message: "Plant type name is required." });
  }

  const typeExists = plantTypes.some((type) => type.toLowerCase() === newType.toLowerCase());

  if (typeExists) {
    return res.status(409).json({ message: "Plant type already exists." });
  }

  plantTypes.push(newType);
  writeJson(PLANT_TYPES_FILE, plantTypes);

  const care = readJson(CARE_FILE);
  const key = normaliseTypeKey(newType);

  if (!care[key]) {
    care[key] = {
      wateringFrequency: 5,
      sunlight: "Check plant label",
      advice: `No detailed recommendation found for ${newType}. Please check the plant label.`
    };
    writeJson(CARE_FILE, care);
  }

  addActivity(`New plant type was added: ${newType}.`);
  res.status(201).json(plantTypes);
});

// This route is used to rename an existing plant type.
app.put("/api/plant-types/:type", (req, res) => {
  const oldType = decodeURIComponent(req.params.type);
  const newType = (req.body.type || "").trim();
  const plantTypes = readJson(PLANT_TYPES_FILE);

  if (!newType) {
    return res.status(400).json({ message: "New plant type name is required." });
  }

  const oldIndex = plantTypes.findIndex((type) => type.toLowerCase() === oldType.toLowerCase());

  if (oldIndex === -1) {
    return res.status(404).json({ message: "Plant type not found." });
  }

  const duplicate = plantTypes.some((type) => type.toLowerCase() === newType.toLowerCase() && type.toLowerCase() !== oldType.toLowerCase());

  if (duplicate) {
    return res.status(409).json({ message: "Plant type already exists." });
  }

  plantTypes[oldIndex] = newType;
  writeJson(PLANT_TYPES_FILE, plantTypes);

  const plants = readPlants().map((plant) => {
    if (String(plant.type || "").toLowerCase() === oldType.toLowerCase()) {
      return { ...plant, type: newType };
    }

    return plant;
  });

  savePlants(plants);
  addActivity(`Plant type was renamed from ${oldType} to ${newType}.`);
  res.json(plantTypes);
});

// This route is used to delete an unused plant type.
app.delete("/api/plant-types/:type", (req, res) => {
  const typeToDelete = decodeURIComponent(req.params.type);
  const plantTypes = readJson(PLANT_TYPES_FILE);
  const plants = readPlants();

  const isUsed = plants.some((plant) => String(plant.type || "").toLowerCase() === typeToDelete.toLowerCase());

  if (isUsed) {
    return res.status(400).json({ message: "This plant type is used by existing plants and cannot be deleted." });
  }

  const filteredTypes = plantTypes.filter((type) => type.toLowerCase() !== typeToDelete.toLowerCase());

  if (filteredTypes.length === plantTypes.length) {
    return res.status(404).json({ message: "Plant type not found." });
  }

  writeJson(PLANT_TYPES_FILE, filteredTypes);
  addActivity(`Plant type was deleted: ${typeToDelete}.`);
  res.json(filteredTypes);
});

// This route is used to get garden zones.
app.get("/api/zones", (req, res) => {
  res.json(readJson(ZONES_FILE));
});

// This route is used to get all uploaded garden zone photos.
app.get("/api/zone-images", (req, res) => {
  res.json(readJson(ZONE_IMAGES_FILE));
});

// This route is used to upload or replace a photo for one garden zone.
app.post("/api/zones/:zone/photo", upload.single("zonePhoto"), (req, res) => {
  const zoneName = decodeURIComponent(req.params.zone);
  const zones = readJson(ZONES_FILE);

  if (!zones.includes(zoneName)) {
    return res.status(404).json({ message: "Garden zone not found." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Zone photo is required." });
  }

  const zoneImages = readJson(ZONE_IMAGES_FILE);
  zoneImages[zoneName] = `/uploads/${req.file.filename}`;
  writeJson(ZONE_IMAGES_FILE, zoneImages);

  addActivity(`Photo was uploaded for garden zone: ${zoneName}.`);
  res.status(201).json(zoneImages);
});

// This route is used to create a new garden zone.
app.post("/api/zones", (req, res) => {
  const zones = readJson(ZONES_FILE);
  const newZone = (req.body.zone || "").trim();

  if (!newZone) {
    return res.status(400).json({ message: "Garden zone name is required." });
  }

  const zoneExists = zones.some((zone) => zone.toLowerCase() === newZone.toLowerCase());

  if (zoneExists) {
    return res.status(409).json({ message: "Garden zone already exists." });
  }

  zones.push(newZone);
  writeJson(ZONES_FILE, zones);
  addActivity(`New garden zone was added: ${newZone}.`);

  res.status(201).json(zones);
});

// This route is used to rename an existing garden zone.
app.put("/api/zones/:zone", (req, res) => {
  const oldZone = decodeURIComponent(req.params.zone);
  const newZone = (req.body.zone || "").trim();
  const zones = readJson(ZONES_FILE);

  if (!newZone) {
    return res.status(400).json({ message: "New garden zone name is required." });
  }

  const oldIndex = zones.findIndex((zone) => zone.toLowerCase() === oldZone.toLowerCase());

  if (oldIndex === -1) {
    return res.status(404).json({ message: "Garden zone not found." });
  }

  const duplicate = zones.some((zone) => zone.toLowerCase() === newZone.toLowerCase() && zone.toLowerCase() !== oldZone.toLowerCase());

  if (duplicate) {
    return res.status(409).json({ message: "Garden zone already exists." });
  }

  zones[oldIndex] = newZone;
  writeJson(ZONES_FILE, zones);

  const zoneImages = readJson(ZONE_IMAGES_FILE);
  if (zoneImages[oldZone]) {
    zoneImages[newZone] = zoneImages[oldZone];
    delete zoneImages[oldZone];
    writeJson(ZONE_IMAGES_FILE, zoneImages);
  }

  const plants = readPlants().map((plant) => {
    if (plant.gardenZone === oldZone) {
      return { ...plant, gardenZone: newZone };
    }

    return plant;
  });

  savePlants(plants);
  addActivity(`Garden zone was renamed from ${oldZone} to ${newZone}.`);
  res.json(zones);
});

// This route is used to delete an unused garden zone.
app.delete("/api/zones/:zone", (req, res) => {
  const zoneToDelete = decodeURIComponent(req.params.zone);
  const zones = readJson(ZONES_FILE);
  const plants = readPlants();

  const isUsed = plants.some((plant) => plant.gardenZone === zoneToDelete);

  if (isUsed) {
    return res.status(400).json({ message: "This garden zone is used by existing plants and cannot be deleted." });
  }

  const filteredZones = zones.filter((zone) => zone !== zoneToDelete);

  if (filteredZones.length === zones.length) {
    return res.status(404).json({ message: "Garden zone not found." });
  }

  writeJson(ZONES_FILE, filteredZones);

  const zoneImages = readJson(ZONE_IMAGES_FILE);
  delete zoneImages[zoneToDelete];
  writeJson(ZONE_IMAGES_FILE, zoneImages);

  addActivity(`Garden zone was deleted: ${zoneToDelete}.`);
  res.json(filteredZones);
});

// This route is used to get activity log entries.
app.get("/api/activity", (req, res) => {
  res.json(readJson(ACTIVITY_FILE));
});

// This route is used to get recommendation by plant type from local JSON.
app.get("/api/recommendations/:type", (req, res) => {
  const care = readJson(CARE_FILE);
  const plantType = normaliseTypeKey(req.params.type);
  res.json(care[plantType] || care.default);
});

// This route is used to create a new plant with plant and location photos.
app.post("/api/plants", upload.fields([
  { name: "plantPhoto", maxCount: 1 },
  { name: "locationPhoto", maxCount: 1 }
]), (req, res) => {
  const plants = readPlants();
  const care = readJson(CARE_FILE);
  const plantType = req.body.type || "Vegetable";
  const recommendation = care[normaliseTypeKey(plantType)] || care.default;

  const newPlant = {
    id: Date.now(),
    name: req.body.name || "Unnamed Plant",
    type: plantType,
    gardenZone: req.body.gardenZone || "Back Garden - Left Bed",
    locationDescription: req.body.locationDescription || "",
    markerX: req.body.markerX || "",
    markerY: req.body.markerY || "",
    plantedDate: req.body.plantedDate || "",
    lastWatered: req.body.lastWatered || "",
    wateringFrequency: Number(req.body.wateringFrequency || recommendation.wateringFrequency),
    healthStatus: req.body.healthStatus || "Healthy",
    notes: req.body.notes || "",
    plantPhoto: req.files.plantPhoto ? `/uploads/${req.files.plantPhoto[0].filename}` : "",
    locationPhoto: req.files.locationPhoto ? `/uploads/${req.files.locationPhoto[0].filename}` : "",
    history: [
      {
        date: new Date().toISOString().split("T")[0],
        text: "Plant record created."
      }
    ]
  };

  plants.push(newPlant);
  savePlants(plants);
  addActivity(`${newPlant.name} was added to ${newPlant.gardenZone}.`);

  res.status(201).json(enrichPlant(newPlant));
});

// This route is used to update an existing plant.
app.put("/api/plants/:id", upload.fields([
  { name: "plantPhoto", maxCount: 1 },
  { name: "locationPhoto", maxCount: 1 }
]), (req, res) => {
  const plants = readPlants();
  const index = plants.findIndex((plant) => plant.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Plant not found." });
  }

  const oldPlant = plants[index];

  const updatedPlant = {
    ...oldPlant,
    name: req.body.name || oldPlant.name,
    type: req.body.type || oldPlant.type,
    gardenZone: req.body.gardenZone || oldPlant.gardenZone,
    locationDescription: req.body.locationDescription || oldPlant.locationDescription,
    markerX: req.body.markerX || oldPlant.markerX || "",
    markerY: req.body.markerY || oldPlant.markerY || "",
    plantedDate: req.body.plantedDate || oldPlant.plantedDate,
    lastWatered: req.body.lastWatered || oldPlant.lastWatered,
    wateringFrequency: Number(req.body.wateringFrequency || oldPlant.wateringFrequency),
    healthStatus: req.body.healthStatus || oldPlant.healthStatus,
    notes: req.body.notes || oldPlant.notes,
    plantPhoto: req.files.plantPhoto ? `/uploads/${req.files.plantPhoto[0].filename}` : oldPlant.plantPhoto,
    locationPhoto: req.files.locationPhoto ? `/uploads/${req.files.locationPhoto[0].filename}` : oldPlant.locationPhoto
  };

  plants[index] = updatedPlant;
  savePlants(plants);
  addActivity(`${updatedPlant.name} was updated.`);

  res.json(enrichPlant(updatedPlant));
});

// This route is used to delete a plant.
app.delete("/api/plants/:id", (req, res) => {
  const plants = readPlants();
  const plantToDelete = plants.find((plant) => plant.id === Number(req.params.id));
  const filteredPlants = plants.filter((plant) => plant.id !== Number(req.params.id));

  if (!plantToDelete) {
    return res.status(404).json({ message: "Plant not found." });
  }

  savePlants(filteredPlants);
  addActivity(`${plantToDelete.name} was deleted from the tracker.`);
  res.json({ message: "Plant deleted successfully." });
});

// This route is used to mark a plant as watered today.
app.post("/api/plants/:id/water", (req, res) => {
  const plants = readPlants();
  const index = plants.findIndex((plant) => plant.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Plant not found." });
  }

  const today = new Date().toISOString().split("T")[0];
  plants[index].lastWatered = today;
  plants[index].history.push({ date: today, text: "Plant watered." });

  savePlants(plants);
  addActivity(`${plants[index].name} was watered.`);
  res.json(enrichPlant(plants[index]));
});

// This route is used to add a history note.
app.post("/api/plants/:id/history", (req, res) => {
  const plants = readPlants();
  const index = plants.findIndex((plant) => plant.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Plant not found." });
  }

  const historyItem = {
    date: req.body.date || new Date().toISOString().split("T")[0],
    text: req.body.text || "No note added."
  };

  plants[index].history.push(historyItem);
  savePlants(plants);
  addActivity(`History note added for ${plants[index].name}.`);

  res.status(201).json(enrichPlant(plants[index]));
});

// This route is used to generate smart plant care advice for one plant.
app.get("/api/assistant/plant/:id", (req, res) => {
  const plants = readPlants().map(enrichPlant);
  const plant = plants.find((item) => item.id === Number(req.params.id));

  if (!plant) {
    return res.status(404).json({ message: "Plant not found." });
  }

  res.json(buildPlantAdvice(plant));
});

// This route is used to generate smart plant care advice for all plants.
app.get("/api/assistant/all", (req, res) => {
  const advice = readPlants()
    .map(enrichPlant)
    .map(buildPlantAdvice)
    .sort((a, b) => {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  res.json(advice);
});

// This route is used to get plant knowledge from Wikipedia REST API.
app.get("/api/wiki/:plant", async (req, res) => {
  const plantName = encodeURIComponent(req.params.plant.trim());

  if (!plantName) {
    return res.status(400).json({ message: "Plant name is required." });
  }

  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${plantName}`,
      {
        headers: {
          "User-Agent": "GROW-Garden-Tracker/1.0"
        }
      }
    );

    res.json({
      title: response.data.title,
      description: response.data.description || "No short description available.",
      extract: response.data.extract || "No plant information available.",
      image: response.data.thumbnail?.source || response.data.originalimage?.source || "",
      url: response.data.content_urls?.desktop?.page || ""
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not fetch plant information from Wikipedia.",
      details: error.response?.data || error.message
    });
  }
});

// This route is used to get current weather from OpenWeather API.
app.get("/api/weather/current", async (req, res) => {
  const city = (req.query.city || process.env.DEFAULT_WEATHER_CITY || "Dublin").trim();

  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(500).json({ message: "OpenWeather API key is missing in backend .env file." });
  }

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric"
      }
    });

    const weather = response.data;
    const description = weather.weather?.[0]?.description || "";
    const main = weather.weather?.[0]?.main || "";
    const rain = weather.rain?.["1h"] || weather.rain?.["3h"] || 0;
    const humidity = weather.main?.humidity || 0;
    const temperature = weather.main?.temp || 0;

    let wateringAdvice = "Normal watering can continue.";
    if (main.toLowerCase().includes("rain") || rain > 0) {
      wateringAdvice = "Rain is detected, so watering can probably be skipped today.";
    } else if (temperature >= 22 && humidity < 55) {
      wateringAdvice = "Weather is warm and dry, so plants may need extra checking today.";
    } else if (humidity > 80) {
      wateringAdvice = "Humidity is high, so soil may stay wet for longer.";
    }

    res.json({
      city: weather.name,
      country: weather.sys?.country,
      temperature,
      humidity,
      condition: main,
      description,
      rain,
      wateringAdvice
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not fetch weather from OpenWeather API.",
      details: error.response?.data || error.message
    });
  }
});

// This route is used to combine local plant data with weather-based watering advice.
app.get("/api/weather/watering-advice", async (req, res) => {
  const city = (req.query.city || process.env.DEFAULT_WEATHER_CITY || "Dublin").trim();

  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(500).json({ message: "OpenWeather API key is missing in backend .env file." });
  }

  try {
    const weatherResponse = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric"
      }
    });

    const weather = weatherResponse.data;
    const main = weather.weather?.[0]?.main || "";
    const rain = weather.rain?.["1h"] || weather.rain?.["3h"] || 0;
    const plants = readPlants().map(enrichPlant);

    const advice = plants.map((plant) => {
      let priority = "Low";
      let recommendation = "No action needed today.";

      if (plant.wateringStatus === "Overdue") {
        priority = "High";
        recommendation = "This plant is overdue and should be checked.";
      }

      if (plant.wateringStatus === "Water Today") {
        priority = "Medium";
        recommendation = "This plant is scheduled for watering today.";
      }

      if (main.toLowerCase().includes("rain") || rain > 0) {
        if (priority === "Medium") {
          priority = "Low";
          recommendation = "Rain is detected, so watering may be skipped today.";
        }

        if (priority === "High") {
          recommendation = "Plant is overdue, but rain is detected. Check soil before watering.";
        }
      }

      if (plant.healthStatus !== "Healthy") {
        priority = "High";
        recommendation = `${recommendation} Health status also needs attention: ${plant.healthStatus}.`;
      }

      return {
        id: plant.id,
        name: plant.name,
        gardenZone: plant.gardenZone,
        healthStatus: plant.healthStatus,
        wateringStatus: plant.wateringStatus,
        nextWateringDate: plant.nextWateringDate,
        priority,
        recommendation
      };
    });

    res.json({
      city: weather.name,
      condition: main,
      temperature: weather.main?.temp,
      humidity: weather.main?.humidity,
      rain,
      advice
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not create weather watering advice.",
      details: error.response?.data || error.message
    });
  }
});

// This route is used to export local JSON data as a backup file.
app.get("/api/export-data", (req, res) => {
  const backup = {
    exportedAt: new Date().toISOString(),
    plants: readJson(PLANTS_FILE),
    activityLog: readJson(ACTIVITY_FILE),
    careRecommendations: readJson(CARE_FILE),
    gardenZones: readJson(ZONES_FILE),
    gardenZoneImages: readJson(ZONE_IMAGES_FILE),
    plantTypes: readJson(PLANT_TYPES_FILE),
    users: readUsers().map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }))
  };

  res.setHeader("Content-Disposition", "attachment; filename=grow-garden-backup.json");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(backup, null, 2));
});


// This route is used to restore local JSON data from a backup file.
app.post("/api/import-data", upload.single("backupFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Backup JSON file is required." });
  }

  try {
    const backupPath = req.file.path;
    const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));

    if (!backup || typeof backup !== "object") {
      return res.status(400).json({ message: "Invalid backup file." });
    }

    if (Array.isArray(backup.plants)) {
      writeJson(PLANTS_FILE, backup.plants);
    }

    if (Array.isArray(backup.activityLog)) {
      writeJson(ACTIVITY_FILE, backup.activityLog);
    }

    if (backup.careRecommendations && typeof backup.careRecommendations === "object") {
      writeJson(CARE_FILE, backup.careRecommendations);
    }

    if (Array.isArray(backup.gardenZones)) {
      writeJson(ZONES_FILE, backup.gardenZones);
    }

    if (backup.gardenZoneImages && typeof backup.gardenZoneImages === "object") {
      writeJson(ZONE_IMAGES_FILE, backup.gardenZoneImages);
    }

    if (Array.isArray(backup.plantTypes)) {
      writeJson(PLANT_TYPES_FILE, backup.plantTypes);
    }

    addActivity("Data was restored from JSON backup.");

    fs.unlinkSync(backupPath);

    res.json({
      message: "Backup restored successfully.",
      restored: {
        plants: Array.isArray(backup.plants),
        activityLog: Array.isArray(backup.activityLog),
        careRecommendations: !!backup.careRecommendations,
        gardenZones: Array.isArray(backup.gardenZones),
        gardenZoneImages: !!backup.gardenZoneImages,
        plantTypes: Array.isArray(backup.plantTypes)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not restore backup file.",
      details: error.message
    });
  }
});

// This code is used to start the backend server.
app.listen(PORT, () => {
  console.log(`GROW backend server is running on http://localhost:${PORT}`);
});
