import dotenv from "dotenv";
import { connectMongoDB } from "../lib/mongodbAdapter.js";

dotenv.config();

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URL;

  try {
    await connectMongoDB(mongoUri);
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    process.exit(1);
  }
};
