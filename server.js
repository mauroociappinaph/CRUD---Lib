import express from "express";
import globalMiddlewares from "./middlewares/globalMiddlewares.js";
import routes from "./routes/index.js";
import cors from "cors";
import dotenv from "dotenv";
import limiter from "./config/rateLimiter.js";
dotenv.config();

export const createServer = () => {
  const app = express();

  // Configurar middlewares globales
  app.use(cors()); // Permitir solicitudes entre dominios
  app.use(express.json()); // Parsear solicitudes JSON
  globalMiddlewares(app); // Llamar a tus middlewares personalizados
  app.use(limiter);
  // Configurar rutas principales
  app.use("/api", routes);

  return app;
};
