import dotenv from "dotenv";
import { connectMongoDB } from "../lib/mongodbAdapter.js";

dotenv.config();

/**
 * Conecta a la base de datos MongoDB utilizando la URI en la variable de entorno MONGO_URL.
 * Si no se puede conectar, imprime un mensaje de error y sale del proceso con código de estado 1.
 */
export const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URL;

  try {
    await connectMongoDB(mongoUri);
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    process.exit(1);
  }
};
