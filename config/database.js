import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDatabase = async () => {
  if (!process.env.MONGO_URL) {
    console.error("❌ Variable de entorno MONGO_URL no configurada");
    process.exit(1); // Termina la ejecución si la variable de entorno no está configurada
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🗄️ Conectado a la base de datos MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1); // Termina la ejecución si falla la conexión
  }
};
