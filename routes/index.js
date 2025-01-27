import { Router } from "express";
import { crudify } from "../lib/crudify.js"; // Importar la función crudify
import schema from "../lib/models/schemas.js"; // Importar el modelo de usuario

const router = Router();

// Iterar sobre los modelos y generar rutas CRUD dinámicas
Object.keys(schema).forEach((modelName) => {
  const model = schema[modelName];
  const path = `/${modelName.toLowerCase()}s`; // Generar el path en plural
  console.log(`📦 Generando CRUD para: ${modelName}, ruta: ${path}`);
  router.use(path, crudify(model, modelName));
});

export default router;
