const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

function normalizeUser(payload) {
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim();
  const age = Number(payload?.age);

  if (!name || !email || Number.isNaN(age)) {
    throw new Error("Name, email, and a valid age are required.");
  }

  return { name, email, age };
}

function buildUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
  };
}

async function seedUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany([
      { id: 1, name: "Rahul Rajput", email: "rahul@gmail.com", age: 24 },
      { id: 2, name: "Saloni Rana", email: "saloni@gmail.com", age: 23 },
      { id: 3, name: "Sandhya Rana", email: "sandhya@gmail.com", age: 22 },
      { id: 4, name: "Sandhya", email: "sandhya123@gmail.com", age: 25 },
    ]);
    console.log("Seed data inserted into MongoDB.");
  }
}

async function startServer() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add your MongoDB URL to backend/.env");
  }

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected successfully.");
  await seedUsers();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

app.get("/", (req, res) => {
  res.send("Server is Running...");
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).sort({ id: 1 });
    res.json(users.map(buildUserResponse));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const normalized = normalizeUser(req.body);
    const lastUser = await User.findOne({}, { id: 1 }).sort({ id: -1 });
    const nextId = (lastUser?.id || 0) + 1;
    const user = await User.create({ id: req.body?.id ?? nextId, ...normalized });
    res.status(201).json(buildUserResponse(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const normalized = normalizeUser(req.body);
    const user = await User.findOneAndUpdate(
      { id },
      { $set: normalized },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(buildUserResponse(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deletedUser = await User.findOneAndDelete({ id });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(buildUserResponse(deletedUser));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});