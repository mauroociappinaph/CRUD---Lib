import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";

const globalMiddlewares = (app) => {
  app.use(express.json()); // Manejo de JSON en solicitudes
  app.use(mongoSanitize()); // Sanitización contra inyección
  app.use(helmet()); // Seguridad HTTP
  console.log("✅ Middlewares globales configurados");
};

export default globalMiddlewares;
