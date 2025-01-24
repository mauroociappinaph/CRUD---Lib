import express from "express";
import mongoose from "mongoose";
import User from "./lib/models/user.js";
import { detectSchemaChanges } from "./lib/schemaUtils.js";
import { loadConfig } from "./lib/configLoader.js";

const app = express();
const config = loadConfig(); // Cargar configuración

// Middleware global
app.use(express.json());

// Aplicar middleware definido en la configuración
if (config.middleware && Array.isArray(config.middleware)) {
  config.middleware.forEach((mw) => app.use(mw));
}

async function connectToDatabase() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect("mongodb://localhost:27017/crud-lib", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🗄️ Conectado a la base de datos MongoDB");

    // Detectar cambios en el esquema
    detectSchemaChanges("User", User.schema);
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
    process.exit(1);
  }
}

connectToDatabase();

// Configurar rutas dinámicas desde el archivo de configuración
if (config.routes && config.routes.users) {
  const { basePath, enablePagination } = config.routes.users;

  // Ruta GET (Listar usuarios)
  app.get(basePath, async (req, res) => {
    const { page = 1, limit = config.pagination?.defaultLimit || 10 } =
      req.query;
    const skip = (page - 1) * limit;

    try {
      const query = {};

      // Aplicar filtros definidos en la configuración
      if (config.filters?.allow) {
        for (const filter of config.filters.allow) {
          if (req.query[filter]) query[filter] = req.query[filter];
        }
      }

      // Consulta con paginación (si está habilitada)
      const users = await User.find(query)
        .limit(enablePagination ? parseInt(limit) : 0)
        .skip(enablePagination ? skip : 0);
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Ruta POST (Crear usuario)
  app.post(basePath, async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
