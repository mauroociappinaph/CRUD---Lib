import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";

// Ruta al archivo de cache
const CACHE_PATH = path.join(process.cwd(), "schema-cache.json");

// Leer el cache actual con manejo de errores
export async function loadCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return {};
    const rawData = await fs.promises.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error loading cache:", error);
    return {};
  }
}

// Guardar el cache actualizado con manejo de errores
export async function saveCache(data) {
  try {
    await fs.promises.writeFile(
      CACHE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error saving cache:", error);
  }
}

// Agregar campos faltantes basados en el esquema
export const addMissingFieldsBasedOnSchema = (data, schema) => {
  if (!schema?.obj || typeof schema.obj !== "object") {
    console.error("Invalid schema provided.");
    return data;
  }

  return Object.entries(schema.obj).reduce(
    (completedData, [field, fieldConfig]) => {
      const { required, default: defaultValue, type } = fieldConfig;

      if (required && !(field in completedData)) {
        completedData[field] =
          defaultValue ?? generateValueBasedOnType(type, field);
      }

      return completedData;
    },
    { ...data }
  );
};

// Generar valores basados en el tipo de dato
const generateValueBasedOnType = (type, fieldName = "") => {
  if (!type) return "Default Value";

  const lowerField = fieldName.toLowerCase();

  const stringMappings = {
    name: () => faker.person.fullName(),
    email: () =>
      `${faker.person.firstName().toLowerCase()}.${faker.person
        .lastName()
        .toLowerCase()}@example.com`,
    address: () =>
      `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
    default: () => faker.lorem.words(2),
  };

  const numberMappings = {
    age: () => faker.number.int({ min: 18, max: 100 }),
    default: () => faker.number.int({ min: 1, max: 100 }),
  };

  const typeGenerators = {
    String: () => stringMappings[lowerField]?.() ?? stringMappings.default(),
    Number: () => numberMappings[lowerField]?.() ?? numberMappings.default(),
    Boolean: () => faker.datatype.boolean(),
    Date: () => faker.date.future(),
    Array: () => ["Elemento 1", "Elemento 2"],
    Object: () => ({ key: "value" }),
  };

  return typeGenerators[type.name]
    ? typeGenerators[type.name]()
    : `Generated ${type.name}`;
};
