import { Router } from "express";
import { crudify } from "../lib/crudify.js"; // Importar la función crudify
import User from "../lib/models/user.js"; // Importar el modelo de usuario

const router = Router();

// Crear rutas CRUD para usuarios
router.use("/users", crudify(User, "Usuario"));

export default router;
