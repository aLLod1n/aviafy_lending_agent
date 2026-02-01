import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Function to connect to the MongoDB database
export const connectDB = () => {
  // Set the strictQuery option to false
  mongoose.set("strictQuery", false);

  const mongoUri =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL;
  if (!mongoUri || typeof mongoUri !== "string") {
    console.error(
      "MongoDB URI is missing. Set MONGO_URL or MONGODB_URI in Render Environment and redeploy."
    );
    process.exit(1);
  }
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB is connected");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });
};
