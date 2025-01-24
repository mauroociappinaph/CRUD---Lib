import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";

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

// Función para agregar el campo faltante basado en el esquema
export function addMissingFieldsBasedOnSchema(userData) {
  const schemaCache = loadCache();
  const userSchema = schemaCache["User"];

  if (!userSchema) {
    console.warn("⚠️ No se encontró el esquema para 'User' en el cache.");
    return userData;
  }

  // Verificar si `password` es requerido en el esquema
  if (userSchema["password"] && userSchema["password"].isRequired) {
    if (!userData.password) {
      userData.password = faker.internet.password(); // Generar contraseña si falta
      console.log(
        "🔑 Campo 'password' agregado automáticamente:",
        userData.password
      );
    }
  }

  return userData;
}
