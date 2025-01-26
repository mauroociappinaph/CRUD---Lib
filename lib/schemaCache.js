import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";

// Ruta al archivo de cache
const CACHE_PATH = path.join(process.cwd(), "schema-cache.json");

// Leer el cache actual
export function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  const rawData = fs.readFileSync(CACHE_PATH, "utf-8");
  return JSON.parse(rawData);
}

// Guardar el cache actualizado
export function saveCache(data) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Función para agregar campos faltantes basados en el esquema
export const addMissingFieldsBasedOnSchema = (data, schema) => {
  const completedData = { ...data }; // Copia los datos existentes

  for (const field in schema.obj) {
    const fieldConfig = schema.obj[field];
    const { required, default: defaultValue, type } = fieldConfig;

    // Si el campo es requerido y no está presente en los datos
    if (required && !(field in completedData)) {
      // Si hay un valor por defecto en el esquema, úsalo
      if (defaultValue !== undefined) {
        completedData[field] = defaultValue;
      } else {
        // Genera un valor automáticamente según el tipo de dato
        completedData[field] = generateValueBasedOnType(type, field);
      }
    }
  }

  return completedData;
};

// Función auxiliar para generar valores basados en el tipo de dato
const generateValueBasedOnType = (type, fieldName = "") => {
  if (!type) return "Default Value"; // Valor predeterminado si no hay tipo definido

  switch (type.name) {
    case "String":
      if (fieldName.toLowerCase() === "name") {
        // Generar un nombre completo realista
        return faker.name.fullName();
      } else if (fieldName.toLowerCase() === "email") {
        // Generar un email basado en el nombre
        const fullName = faker.name.fullName().toLowerCase().replace(/ /g, ".");
        return `${fullName}@example.com`;
      } else if (fieldName.toLowerCase() === "address") {
        // Generar una dirección realista
        return `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`;
      } else {
        // Valor por defecto para otros strings
        return faker.lorem.words(2);
      }
    case "Number":
      if (fieldName.toLowerCase() === "age") {
        // Generar una edad entre 18 y 100 años
        return faker.number.int({ min: 18, max: 100 });
      } else {
        // Generar números genéricos
        return faker.number.int({ min: 1, max: 100 });
      }
    case "Boolean":
      // Valor booleano
      return faker.datatype.boolean();
    case "Date":
      // Fecha futura
      return faker.date.future();
    case "Array":
      // Array de ejemplo
      return ["Elemento 1", "Elemento 2"];
    case "Object":
      // Objeto de ejemplo
      return { key: "value" };
    default:
      // Valor genérico para tipos desconocidos
      return `Generated ${type.name}`;
  }
};
