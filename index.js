require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { HoldingsModel } = require("./models/HoldingsModel");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");
const AuthRoute = require("./AuthRoute");

const port = process.env.PORT || 3001;
const uri = process.env.MONGO_URI;

const app = express();

// --- Middleware Setup ---
const allowedOrigins = ["https://dashboardzerodha-1.onrender.com", "http://localhost:5174","https://backendzerodha-3xet.onrender.com"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
// No need for body-parser, express.json() handles it
app.use(express.json());

// --- Data Seeding Routes (for setup) ---

app.get("/addHoldings", async (req, res) => {
  // FIX: Removed buggy and redundant forEach loop
  try {
    const tempHoldings = [
      { name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
      { name: "HDFCBANK", qty: 2, avg: 1383.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
      { name: "HINDUNILVR", qty: 1, avg: 2335.85, price: 2417.4, net: "+3.49%", day: "+0.21%" },
      { name: "INFY", qty: 1, avg: 1350.5, price: 1555.45, net: "+15.18%", day: "-1.60%", isLoss: true },
      { name: "ITC", qty: 5, avg: 202.0, price: 207.9, net: "+2.92%", day: "+0.80%" },
      // ... add other holdings if needed
    ];
    console.log("MS")
    await HoldingsModel.insertMany(tempHoldings);
    res.status(200).send("Holdings inserted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting holdings");
  }
});
app.get("/ping", (req, res) => res.send("pong"));

app.get("/addPositions", async (req, res) => {
  // IMPROVEMENT: Switched to efficient insertMany and added error handling
  try {
    const tempPositions = [
      { product: "CNC", name: "EVEREADY", qty: 2, avg: 316.27, price: 312.35, net: "+0.58%", day: "-1.24%", isLoss: true },
      { product: "CNC", name: "JUBLFOOD", qty: 1, avg: 3124.75, price: 3082.65, net: "+10.04%", day: "-1.35%", isLoss: true },
    ];
    await PositionsModel.insertMany(tempPositions);
    res.status(200).send("Positions inserted successfully!");
  } catch (error) {
    console.error("Error inserting positions:", error);
    res.status(500).send("Error inserting positions");
  }
});

// --- API Routes ---

app.get("/allHoldings", async (req, res) => {
  // IMPROVEMENT: Added error handling
  try {
    const allHoldings = await HoldingsModel.find({});
    res.status(200).json(allHoldings);
  } catch (error) {
    console.error("Failed to fetch holdings:", error);
    res.status(500).send("Server error while fetching holdings");
  }
});

app.get("/allPositions", async (req, res) => {
  // IMPROVEMENT: Added error handling
  try {
    const allPositions = await PositionsModel.find({});
    res.status(200).json(allPositions);
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    res.status(500).send("Server error while fetching positions");
  }
});

app.get("/allOrders", async (req, res) => {
  // IMPROVEMENT: Added error handling
  try {
    const allOrders = await OrdersModel.find({});
    res.status(200).json(allOrders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).send("Server error while fetching orders");
  }
});

app.post("/newOrder", async (req, res) => {
  const { name, qty, price, mode } = req.body;

  try {
    await OrdersModel.findOneAndUpdate(
      { name, mode },
      { $inc: { qty: qty }, $set: { price: price } },
      { upsert: true, new: true }
    );

    const existing = await HoldingsModel.findOne({ name });

    if (mode === "BUY") {
      if (existing) {
        const totalQty = existing.qty + qty;
        const newAvg = (existing.qty * existing.avg + qty * price) / totalQty;
        existing.qty = totalQty;
        existing.avg = newAvg;
        existing.price = price;
        await existing.save();
      } else {
        await HoldingsModel.create({ name, qty, avg: price, price, net: "+0%", day: "+0%" });
      }
    }

    if (mode === "SELL") {
      if (!existing || existing.qty < qty) {
        return res.status(400).send("Not enough stock to sell");
      }
      existing.qty -= qty;
      if (existing.qty === 0) {
        await HoldingsModel.deleteOne({ name });
      } else {
        await existing.save();
      }
    }

    res.status(200).send("Order and Holdings updated successfully!");
  } catch (err) {
    console.error("Order update error:", err);
    res.status(500).send("Server error");
  }
});

// --- Auth Routes ---
app.use("/", AuthRoute);

// --- Server Startup ---
const startServer = async () => {
  // IMPROVEMENT: Connect to DB before the server starts listening
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB!");

    app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${port}`);
});
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();