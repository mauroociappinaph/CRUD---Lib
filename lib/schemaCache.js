import fs from "fs";
import path from "path";

// Ruta al archivo de cache
const CACHE_PATH = path.join(process.cwd(), "schema-cache.json");

// Leer el cache actual
export function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  const rawData = fs.readFileSync(CACHE_PATH);
  return JSON.parse(rawData);
}

// Guardar el cache actualizado
export function saveCache(data) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}
