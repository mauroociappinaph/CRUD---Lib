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
