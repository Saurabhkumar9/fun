// load env variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { clerkMiddleware, requireAuth } = require("@clerk/express");
const { clerkWebhooks } = require("./controllers/webhooks.controller");
const connection = require("./db/db");
const { createCheckoutSession,  webhookController } = require("./controllers/payment.controller");

const app = express();

// CORS setup
app.use(
  cors({
    origin: "*",       
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


app.use(clerkMiddleware());

// JSON parsing middleware
app.use(express.json());

// Basic route to test server
app.get("/", (req, res) => {
  res.json({ message: "Backend run successful." });
});

// Clerk webhook route
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);


app.post('/payment', createCheckoutSession);

app.post('/stripe', express.raw({type: 'application/json'}), webhookController);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Connect to MongoDB and start server
connection()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running at port: ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!!!", err);
  });
