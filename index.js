import express from "express";
import mongoose from "mongoose";
import User from "./lib/models/user.js";
import { loadConfig } from "./lib/configLoader.js";
import config from "./crud.config.js";
import mongoSanitize from "express-mongo-sanitize";

// Middleware para sanitizar entradas

const app = express();

// Middleware global
app.use(express.json());
app.use(mongoSanitize());
console.log("✅ Middleware global configurado");

// Aplicar middleware definido en la configuración
if (config.middleware && Array.isArray(config.middleware)) {
  console.log("✅ Aplicando middlewares configurados...");
  config.middleware.forEach((mw) => app.use(mw));
}

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    console.log("🔌 Intentando conectar a la base de datos...");
    mongoose.set("strictQuery", false);
    await mongoose.connect("mongodb://localhost:27017/crud-lib", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🗄️ Conectado a la base de datos MongoDB");
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
    process.exit(1);
  }
}

connectToDatabase();

// Configurar rutas dinámicas desde el archivo de configuración
if (config.routes && config.routes.users) {
  const { basePath } = config.routes.users;
  console.log(`✅ Configurando rutas en ${basePath}...`);

  // Ruta GET (Listar usuarios)
  app.get(basePath, async (req, res) => {
    console.log(`📥 Solicitud GET recibida en ${basePath}`);
    try {
      const users = await User.find();
      console.log(`📋 Usuarios encontrados: ${users.length}`);
      res.json(users);
    } catch (err) {
      console.error("❌ Error al obtener usuarios:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Ruta POST (Crear usuario)
  app.post(basePath, async (req, res) => {
    console.log(`📥 Solicitud POST recibida en ${basePath}`);
    console.log("📦 Datos recibidos:", req.body);
    try {
      const user = new User(req.body);
      await user.save();
      console.log("✅ Usuario creado exitosamente:", user);
      res.status(201).json(user);
    } catch (err) {
      console.error("❌ Error al crear el usuario:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // Ruta GET (Por ID)
  app.get(`${basePath}/:id`, async (req, res) => {
    console.log(
      `📥 Solicitud GET por ID recibida en ${basePath}/${req.params.id}`
    );
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        console.warn(`⚠️ Usuario con ID ${req.params.id} no encontrado`);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      console.log("📋 Usuario encontrado:", user);
      res.json(user);
    } catch (err) {
      console.error("❌ Error al obtener el usuario:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Ruta PUT (Actualizar usuario)
  app.put(`${basePath}/:id`, async (req, res) => {
    console.log(`📥 Solicitud PUT recibida en ${basePath}/${req.params.id}`);
    console.log("📦 Datos para actualizar:", req.body);
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        console.warn(
          `⚠️ Usuario con ID ${req.params.id} no encontrado para actualizar`
        );
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      console.log("✅ Usuario actualizado exitosamente:", user);
      res.json(user);
    } catch (err) {
      console.error("❌ Error al actualizar el usuario:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // Ruta DELETE (Eliminar usuario)
  app.delete(`${basePath}/:id`, async (req, res) => {
    console.log(`📥 Solicitud DELETE recibida en ${basePath}/${req.params.id}`);
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        console.warn(
          `⚠️ Usuario con ID ${req.params.id} no encontrado para eliminar`
        );
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      console.log("✅ Usuario eliminado exitosamente:", user);
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (err) {
      console.error("❌ Error al eliminar el usuario:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
} else {
  console.warn(
    "⚠️ No se encontraron rutas configuradas en config.routes.users"
  );
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
