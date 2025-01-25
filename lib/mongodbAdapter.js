import mongoose from "mongoose";

// Configuración adicional para MongoDB (opcional)
mongoose.set("strictQuery", true); // Evita la advertencia de Mongoose 7

// Conectar a MongoDB
export const connectMongoDB = async (uri) => {
  if (!uri) {
    throw new Error("❌ Error: MongoDB URI no está definido.");
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🗄️ Conectado a MongoDB con éxito.");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};

// Utilidad para cerrar la conexión (útil en pruebas)
export const closeMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 Conexión a MongoDB cerrada.");
  } catch (error) {
    console.error("❌ Error al cerrar MongoDB:", error.message);
  }
};
