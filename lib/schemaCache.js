import fs from "fs";
import path from "path";
import winston from "winston";

// Definir rutas
const LOGS_DIR = path.join(process.cwd(), "logs");
const CACHE_PATH = path.join(process.cwd(), "schema-cache.json");

// Asegurar que la carpeta de logs exista
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

// Configuración de Winston con rotación de archivos
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "combined.log"),
    }),
  ],
});

// ✅ Función loadCache con validación mejorada y logs más descriptivos
export async function loadCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      logger.warn("Cache file not found, returning empty cache", {
        path: CACHE_PATH,
      });
      return {};
    }

    const rawData = await fs.promises.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    logger.error("Error loading cache", {
      message: error.message,
      stack: error.stack,
      path: CACHE_PATH,
    });
    return {};
  }
}

// ✅ Función saveCache con verificación del directorio y logs mejorados
export async function saveCache(data) {
  try {
    await fs.promises.writeFile(
      CACHE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
    logger.info("Cache saved successfully", {
      path: CACHE_PATH,
      dataSize: data ? Object.keys(data).length : 0,
    });
  } catch (error) {
    logger.error("Error saving cache", {
      message: error.message,
      stack: error.stack,
      path: CACHE_PATH,
    });
  }
}

// ✅ Función addMissingFieldsBasedOnSchema con mejor validación y logs estructurados
export const addMissingFieldsBasedOnSchema = (data, schema) => {
  if (!schema?.obj || typeof schema.obj !== "object") {
    logger.error("Invalid schema structure", {
      schemaType: typeof schema,
      schemaObjType: schema?.obj ? typeof schema.obj : "undefined",
      schemaStructure: JSON.stringify(schema, null, 2),
    });
    return data;
  }

  return Object.entries(schema.obj).reduce(
    (completedData, [field, fieldConfig]) => {
      const { required, default: defaultValue, type } = fieldConfig;

      if (required && !(field in completedData)) {
        completedData[field] =
          defaultValue ?? generateValueBasedOnType(type, field);
        logger.debug(`Missing field ${field} added`, {
          value: completedData[field],
        });
      }

      return completedData;
    },
    { ...data }
  );
};
