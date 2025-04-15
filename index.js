import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "./config/corsOptions.js";
dotenv.config();

import lendingPageBotRoute from "./routes/lendingPageBot.routes.js";
connectDB();

const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/lendingPageMessages", lendingPageBotRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
