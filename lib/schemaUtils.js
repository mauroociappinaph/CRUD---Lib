import fs from "fs";
import path from "path";

// Ruta del archivo de cache
const CACHE_PATH = path.join(process.cwd(), "schema-cache.json");

// Función para cargar el cache desde el archivo
export function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  const rawData = fs.readFileSync(CACHE_PATH);
  return JSON.parse(rawData);
}

// Función para guardar el cache actualizado
export function saveCache(data) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}

// Función para detectar cambios en el esquema
export function detectSchemaChanges(modelName, schema) {
  const cache = loadCache();
  const previousSchema = cache[modelName] || {};

  // Obtener las claves del esquema actual
  const currentSchemaKeys = Object.keys(schema.paths);

  // Detectar cambios en el esquema
  const addedFields = currentSchemaKeys.filter(
    (key) => !(key in previousSchema)
  );
  const removedFields = Object.keys(previousSchema).filter(
    (key) => !currentSchemaKeys.includes(key)
  );

  // Si hay cambios, actualizar el cache
  if (addedFields.length > 0 || removedFields.length > 0) {
    cache[modelName] = schema.paths;
    saveCache(cache);
    console.log(`🔄 Cambios detectados en el esquema de ${modelName}:`);
    if (addedFields.length > 0)
      console.log(`➕ Campos añadidos: ${addedFields.join(", ")}`);
    if (removedFields.length > 0)
      console.log(`➖ Campos eliminados: ${removedFields.join(", ")}`);
  } else {
    console.log(`✅ El esquema de ${modelName} no tiene cambios.`);
  }
}

// Función para cargar dinámicamente los modelos
export function loadModels() {
  const models = {};
  const modelsPath = path.resolve(__dirname, "models"); // Ruta de la carpeta `models`

  // Leer todos los archivos en la carpeta `models`
  fs.readdirSync(modelsPath).forEach((file) => {
    if (file.endsWith(".js") && file !== "index.js") {
      const modelName = file.replace(".js", ""); // Eliminar la extensión del archivo
      const model = require(path.join(modelsPath, file)); // Usar require para importar el modelo
      models[modelName] = model.default || model; // Soporte para export default o export nombrado
    }
  });

  return models;
}
