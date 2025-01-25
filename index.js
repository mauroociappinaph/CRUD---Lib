import express from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";
import globalMiddlewares from "./middlewares/globalMiddlewares.js";
import routes from "./routes/index.js";

dotenv.config();
const app = express();

// Configurar middlewares globales
globalMiddlewares(app);

// Conectar a la base de datos
connectDatabase();

// Configurar Swagger
setupSwagger(app);

// Configurar rutas principales
app.use("/api", routes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
