// This code is used to import the backend libraries.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// This code is used to create the Express application.
const app = express();
const PORT = 5000;

// This code is used to define local JSON storage paths for the Week 8 MVP.
const DATA_FOLDER = path.join(__dirname, "data");
const UPLOADS_FOLDER = path.join(__dirname, "uploads");
const PLANTS_FILE = path.join(DATA_FOLDER, "plants.json");
const ZONES_FILE = path.join(DATA_FOLDER, "gardenZones.json");
const ACTIVITY_FILE = path.join(DATA_FOLDER, "activityLog.json");
const CARE_FILE = path.join(DATA_FOLDER, "careRecommendations.json");
const USERS_FILE = path.join(DATA_FOLDER, "users.json");

// This code is used to create required folders if they do not exist.
if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// This code is used to create JSON files if they are missing.
function createFileIfMissing(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

createFileIfMissing(PLANTS_FILE, []);
createFileIfMissing(ZONES_FILE, [
  "Back Garden - Left Bed",
  "Back Garden - Right Bed",
  "Greenhouse",
  "Patio Pots",
  "Front Garden",
  "Indoor Plants"
]);
createFileIfMissing(ACTIVITY_FILE, []);
createFileIfMissing(USERS_FILE, []);
createFileIfMissing(CARE_FILE, {
  vegetable: {
    wateringFrequency: 3,
    sunlight: "Full sun",
    advice: "Vegetables usually need regular watering and sunlight."
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
    advice: "Trees normally need deeper but less frequent watering."
  },
  shrub: {
    wateringFrequency: 5,
    sunlight: "Partial sun",
    advice: "Shrubs should be checked for dry soil and seasonal growth."
  },
  default: {
    wateringFrequency: 5,
    sunlight: "Check plant label",
    advice: "No exact recommendation found. Use general care notes."
  }
});

// This code is used to allow frontend requests and JSON request bodies.
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_FOLDER));

// This code is used to configure uploaded image storage.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + cleanName);
  }
});

// This code is used to accept image files only.
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (file.mimetype.startsWith("image/") || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  }
});

// This code is used to read JSON from local storage.
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// This code is used to write JSON to local storage.
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// This code is used to read and save plant data.
function readPlants() {
  return readJson(PLANTS_FILE);
}

function savePlants(plants) {
  writeJson(PLANTS_FILE, plants);
}

// This code is used to read and save local users.
function readUsers() {
  return readJson(USERS_FILE);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

// This code is used to record activity events.
function addActivity(text) {
  const activity = readJson(ACTIVITY_FILE);

  activity.unshift({
    id: Date.now(),
    date: new Date().toISOString().split("T")[0],
    text: text
  });

  writeJson(ACTIVITY_FILE, activity);
}

// This code is used to calculate the next watering date.
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

// This code is used to add calculated fields to plants.
function enrichPlant(plant) {
  const nextWateringDate = calculateNextWateringDate(plant.lastWatered, plant.wateringFrequency);

  return {
    ...plant,
    nextWateringDate,
    wateringStatus: getWateringStatus(nextWateringDate)
  };
}

// This code is used to build dashboard statistics.
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

// This route is used to test that the backend is running.
app.get("/", (req, res) => {
  res.json({ message: "GROW Week 8 MVP backend is running." });
});

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
    name,
    email,
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

// This route is used to get dashboard data.
app.get("/api/dashboard", (req, res) => {
  res.json(buildDashboard(readPlants()));
});

// This route is used to get all plants.
app.get("/api/plants", (req, res) => {
  res.json(readPlants().map(enrichPlant));
});

// This route is used to get all garden zones.
app.get("/api/zones", (req, res) => {
  res.json(readJson(ZONES_FILE));
});

// This route is used to create a new garden zone.
app.post("/api/zones", (req, res) => {
  const zones = readJson(ZONES_FILE);
  const newZone = (req.body.zone || "").trim();

  if (!newZone) {
    return res.status(400).json({ message: "Garden zone name is required." });
  }

  const exists = zones.some((zone) => zone.toLowerCase() === newZone.toLowerCase());

  if (exists) {
    return res.status(409).json({ message: "Garden zone already exists." });
  }

  zones.push(newZone);
  writeJson(ZONES_FILE, zones);
  addActivity(`New garden zone was added: ${newZone}.`);

  res.status(201).json(zones);
});

// This route is used to get activity log entries.
app.get("/api/activity", (req, res) => {
  res.json(readJson(ACTIVITY_FILE));
});

// This route is used to get local care recommendation by plant type.
app.get("/api/recommendations/:type", (req, res) => {
  const care = readJson(CARE_FILE);
  const plantType = String(req.params.type || "").toLowerCase();
  res.json(care[plantType] || care.default);
});

// This route is used to create a new plant with a photo.
app.post("/api/plants", upload.fields([
  { name: "plantPhoto", maxCount: 1 },
  { name: "locationPhoto", maxCount: 1 }
]), (req, res) => {
  const plants = readPlants();
  const care = readJson(CARE_FILE);
  const plantType = req.body.type || "Vegetable";
  const recommendation = care[plantType.toLowerCase()] || care.default;

  const newPlant = {
    id: Date.now(),
    name: req.body.name || "Unnamed Plant",
    type: plantType,
    gardenZone: req.body.gardenZone || "Back Garden - Left Bed",
    locationDescription: req.body.locationDescription || "",
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

  if (!Array.isArray(plants[index].history)) {
    plants[index].history = [];
  }

  plants[index].history.push({ date: today, text: "Plant watered." });
  savePlants(plants);
  addActivity(`${plants[index].name} was watered.`);

  res.json(enrichPlant(plants[index]));
});

// This route is used to add a plant history note.
app.post("/api/plants/:id/history", (req, res) => {
  const plants = readPlants();
  const index = plants.findIndex((plant) => plant.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Plant not found." });
  }

  if (!Array.isArray(plants[index].history)) {
    plants[index].history = [];
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

// This code is used to start the backend server.
app.listen(PORT, () => {
  console.log(`GROW Week 8 MVP backend is running on http://localhost:${PORT}`);
});
