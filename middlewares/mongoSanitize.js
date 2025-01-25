import mongoSanitize from "express-mongo-sanitize";

const mongoSanitizeMiddleware = (app) => {
  // Configuración básica del middleware
  app.use(
    mongoSanitize({
      replaceWith: "_", // Reemplaza caracteres prohibidos con "_"
    })
  );

  console.log("✅ Middleware mongoSanitize configurado.");
};

export default mongoSanitizeMiddleware;
