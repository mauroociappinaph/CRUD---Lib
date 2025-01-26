import { Router } from "express";
import { crudify } from "../lib/crudify.js"; // Importar la función crudify
import schema from "../lib/models/schemas.js"; // Importar el modelo de usuario

const router = Router();

// Crear rutas CRUD para usuarios
router.use("/users", crudify(schema.User, "Usuario"));
router.use("/companies", crudify(schema.Companie, "Compañia"));
router.use("/products", crudify(schema.Product, "Producto"));
router.use("/cards", crudify(schema.Card, "Card"));
router.use("/subCategories", crudify(schema.SubCategorie, "SubCategoría"));

export default router;
