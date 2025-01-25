import express from "express";
import helmet from "helmet";
import mongoSanitizeMiddleware from "./mongoSanitize.js"; // Importa el middleware

const globalMiddlewares = (app) => {
  app.use(express.json());
  mongoSanitizeMiddleware(app);
  app.use(helmet());

  console.log("✅ Middlewares globales configurados");
};

export default globalMiddlewares;
