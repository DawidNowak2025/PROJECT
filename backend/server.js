// This code is used to import backend libraries.
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// This code is used to define local JSON storage.
const DATA = path.join(__dirname, "data");
const UPLOADS = path.join(__dirname, "uploads");
const PLANTS = path.join(DATA, "plants.json");
const ZONES = path.join(DATA, "gardenZones.json");
const USERS = path.join(DATA, "users.json");
const ACTIVITY = path.join(DATA, "activityLog.json");

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA);
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);

function makeFile(file, data) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

makeFile(PLANTS, []);
makeFile(ZONES, ["Back Garden", "Front Garden", "Greenhouse", "Patio Pots", "Indoor Plants"]);
makeFile(USERS, []);
makeFile(ACTIVITY, []);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS));

// This code is used to configure image uploads.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  }
});

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function log(text) {
  const rows = read(ACTIVITY);
  rows.unshift({ id: Date.now(), date: new Date().toISOString().split("T")[0], text });
  write(ACTIVITY, rows);
}

function nextWatering(lastWatered, frequency) {
  if (!lastWatered || !frequency) return "";
  const d = new Date(lastWatered);
  d.setDate(d.getDate() + Number(frequency));
  return d.toISOString().split("T")[0];
}

function wateringStatus(date) {
  if (!date) return "No Date";
  const today = new Date().toISOString().split("T")[0];
  if (date < today) return "Overdue";
  if (date === today) return "Water Today";
  return "Upcoming";
}

function enrich(plant) {
  const nextWateringDate = nextWatering(plant.lastWatered, plant.wateringFrequency);
  return { ...plant, nextWateringDate, wateringStatus: wateringStatus(nextWateringDate) };
}

app.get("/", (req, res) => res.json({ message: "GROW MVP backend is running." }));

app.post("/api/auth/register", async (req, res) => {
  const users = read(USERS);
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });
  if (users.some((u) => u.email === email)) return res.status(409).json({ message: "Email already registered." });

  const user = { id: Date.now(), name, email, password: await bcrypt.hash(password, 10), createdAt: new Date().toISOString() };
  users.push(user);
  write(USERS, users);
  log(`New user registered: ${name}.`);
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const users = read(USERS);
  const email = (req.body.email || "").trim().toLowerCase();
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid email or password." });
  const ok = await bcrypt.compare(req.body.password || "", user.password);
  if (!ok) return res.status(401).json({ message: "Invalid email or password." });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/plants", (req, res) => res.json(read(PLANTS).map(enrich)));

app.get("/api/dashboard", (req, res) => {
  const plants = read(PLANTS).map(enrich);
  res.json({
    totalPlants: plants.length,
    waterToday: plants.filter((p) => p.wateringStatus === "Water Today").length,
    overduePlants: plants.filter((p) => p.wateringStatus === "Overdue").length,
    plantsWithIssues: plants.filter((p) => p.healthStatus !== "Healthy").length,
    gardenZonesUsed: new Set(plants.map((p) => p.gardenZone)).size
  });
});

app.post("/api/plants", upload.single("plantPhoto"), (req, res) => {
  const plants = read(PLANTS);
  const plant = {
    id: Date.now(),
    name: req.body.name || "Unnamed Plant",
    type: req.body.type || "Plant",
    gardenZone: req.body.gardenZone || "Back Garden",
    locationDescription: req.body.locationDescription || "",
    plantedDate: req.body.plantedDate || "",
    lastWatered: req.body.lastWatered || "",
    wateringFrequency: Number(req.body.wateringFrequency || 3),
    healthStatus: req.body.healthStatus || "Healthy",
    notes: req.body.notes || "",
    plantPhoto: req.file ? `/uploads/${req.file.filename}` : "",
    history: [{ date: new Date().toISOString().split("T")[0], text: "Plant record created." }]
  };
  plants.push(plant);
  write(PLANTS, plants);
  log(`${plant.name} was added.`);
  res.status(201).json(enrich(plant));
});

app.put("/api/plants/:id", upload.single("plantPhoto"), (req, res) => {
  const plants = read(PLANTS);
  const index = plants.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Plant not found." });
  const old = plants[index];
  const updated = {
    ...old,
    name: req.body.name || old.name,
    type: req.body.type || old.type,
    gardenZone: req.body.gardenZone || old.gardenZone,
    locationDescription: req.body.locationDescription || old.locationDescription,
    plantedDate: req.body.plantedDate || old.plantedDate,
    lastWatered: req.body.lastWatered || old.lastWatered,
    wateringFrequency: Number(req.body.wateringFrequency || old.wateringFrequency),
    healthStatus: req.body.healthStatus || old.healthStatus,
    notes: req.body.notes || old.notes,
    plantPhoto: req.file ? `/uploads/${req.file.filename}` : old.plantPhoto
  };
  plants[index] = updated;
  write(PLANTS, plants);
  log(`${updated.name} was updated.`);
  res.json(enrich(updated));
});

app.delete("/api/plants/:id", (req, res) => {
  const plants = read(PLANTS);
  const plant = plants.find((p) => p.id === Number(req.params.id));
  if (!plant) return res.status(404).json({ message: "Plant not found." });
  write(PLANTS, plants.filter((p) => p.id !== Number(req.params.id)));
  log(`${plant.name} was deleted.`);
  res.json({ message: "Plant deleted." });
});

app.post("/api/plants/:id/water", (req, res) => {
  const plants = read(PLANTS);
  const index = plants.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Plant not found." });
  const today = new Date().toISOString().split("T")[0];
  plants[index].lastWatered = today;
  plants[index].history = plants[index].history || [];
  plants[index].history.push({ date: today, text: "Plant watered." });
  write(PLANTS, plants);
  log(`${plants[index].name} was watered.`);
  res.json(enrich(plants[index]));
});

app.post("/api/plants/:id/history", (req, res) => {
  const plants = read(PLANTS);
  const index = plants.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Plant not found." });
  plants[index].history = plants[index].history || [];
  plants[index].history.push({ date: new Date().toISOString().split("T")[0], text: req.body.text || "No note added." });
  write(PLANTS, plants);
  log(`History note added for ${plants[index].name}.`);
  res.status(201).json(enrich(plants[index]));
});

app.get("/api/zones", (req, res) => res.json(read(ZONES)));

app.post("/api/zones", (req, res) => {
  const zones = read(ZONES);
  const zone = (req.body.zone || "").trim();
  if (!zone) return res.status(400).json({ message: "Garden zone name is required." });
  if (zones.some((z) => z.toLowerCase() === zone.toLowerCase())) return res.status(409).json({ message: "Garden zone already exists." });
  zones.push(zone);
  write(ZONES, zones);
  log(`Garden zone added: ${zone}.`);
  res.status(201).json(zones);
});

app.get("/api/activity", (req, res) => res.json(read(ACTIVITY)));

app.listen(PORT, () => console.log(`GROW MVP backend is running on http://localhost:${PORT}`));
