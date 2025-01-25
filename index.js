import express from "express";
import mongoose from "mongoose";
import User from "./lib/models/user.js";
import { loadConfig } from "./lib/configLoader.js";
import config from "./crud.config.js";
import mongoSanitize from "express-mongo-sanitize";
import Joi from "joi";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerDocument from "./swagger.json" assert { type: "json" };
import swaggerUi from "swagger-ui-express";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware global
app.use(express.json());
app.use(mongoSanitize()); // Sanitiza entradas contra inyecciones de MongoDB
app.use(helmet()); // Protege contra vulnerabilidades HTTP comunes
console.log("✅ Middleware global configurado");

// Limitador de solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 solicitudes por IP
  message: "Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.",
});
app.use(limiter);

// **Swagger API Docs**
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log("📄 Swagger Docs disponibles en http://localhost:3000/api-docs");

// Aplicar middlewares definidos en la configuración
if (config.middleware && Array.isArray(config.middleware)) {
  console.log("✅ Aplicando middlewares configurados...");
  config.middleware.forEach((mw) => app.use(mw));
}

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    console.log("🔌 Intentando conectar a la base de datos...");
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URL, {
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

// Validación con Joi
const userSchema = Joi.object({
  name: Joi.string().min(3).required(), // Campo obligatorio
  email: Joi.string().email().required(), // Campo obligatorio
  age: Joi.number().integer().min(18).max(120).optional(), // Campo opcional
  address: Joi.string().optional(), // Campo opcional
  isActive: Joi.boolean().optional(), // Campo opcional
  password: Joi.string().min(6).optional(),
});

// Middleware para validar usuarios
const validateUser = (req, res, next) => {
  console.log("🔍 Validando datos del usuario:", req.body); // Datos recibidos
  const { error } = userSchema.validate(req.body);
  if (error) {
    console.error(
      "❌ Error en la validación de datos:",
      error.details[0].message
    ); // Detalle del error
    return res.status(400).json({ error: error.details[0].message });
  }
  console.log("✅ Datos validados correctamente");
  next();
};

// Configurar rutas dinámicas desde el archivo de configuración
if (config.routes && config.routes.users) {
  const { basePath } = config.routes.users;
  console.log(`✅ Configurando rutas en ${basePath}...`);

  // Ruta GET (Listar usuarios)
  // Ruta GET (Listar usuarios) con paginación y filtros
  app.get(basePath, async (req, res) => {
    console.log(`📥 Solicitud GET recibida en ${basePath}`);
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
      // Crear el filtro de búsqueda (opcional)
      const query = search ? { name: { $regex: search, $options: "i" } } : {};

      // Paginación y proyección
      const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("name email");

      // Contar el total de usuarios para el filtro
      const total = await User.countDocuments(query);

      // Responder con datos paginados
      res.json({
        data: users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
      console.log(
        `📋 Página ${page}/${Math.ceil(total / limit)}, Usuarios: ${
          users.length
        }`
      );
    } catch (err) {
      console.error("❌ Error al obtener usuarios:", err.message);
      res.status(500).json({ error: "Error al obtener usuarios." });
    }
  });

  // Ruta POST (Crear usuario)
  app.post(basePath, validateUser, async (req, res) => {
    console.log(`📥 Solicitud POST recibida en ${basePath}`);
    console.log("📦 Datos recibidos del cliente:", req.body); // Log de los datos recibidos

    try {
      const user = new User(req.body);
      console.log("🔧 Creando un nuevo usuario en la base de datos...");
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
      const user = await User.findById(req.params.id).select("name email");
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
  app.put(`${basePath}/:id`, validateUser, async (req, res) => {
    console.log(`📥 Solicitud PUT recibida en ${basePath}/${req.params.id}`);
    console.log("📦 Datos recibidos para actualización:", req.body); // Log de los datos enviados

    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Devuelve el usuario actualizado
        runValidators: true, // Ejecuta validaciones definidas en el modelo
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
      console.log("📋 Detalles del error completo:", err); // Log adicional para detalles
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

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error global:", err.message);
  res.status(500).json({ error: "Ocurrió un error inesperado." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
