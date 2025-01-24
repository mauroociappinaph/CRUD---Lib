#!/usr/bin/env node
import inquirer from "inquirer";
import axios from "axios";
import { faker } from "@faker-js/faker";
import { loadCache } from "./lib/schemaUtils.js";

const API_URL = "http://127.0.0.1:3000";

// Función principal del CLI
async function runCLI() {
  console.log("💻 Bienvenido al CLI Interactivo para CRUD");

  while (true) {
    const { operation } = await inquirer.prompt([
      {
        type: "list",
        name: "operation",
        message: "¿Qué operación deseas realizar?",
        choices: [
          "GET (Listar)",
          "GET (Por ID)",
          "POST (Crear)",
          "PUT (Actualizar)",
          "DELETE (Eliminar)",
          "Exit",
        ],
      },
    ]);

    // Ejecutar la operación seleccionada
    switch (operation) {
      case "GET (Listar)":
        await handleGetAll();
        break;
      case "GET (Por ID)":
        await handleGetById();
        break;
      case "POST (Crear)":
        await handleCreate();
        break;
      case "PUT (Actualizar)":
        await handleUpdate();
        break;
      case "DELETE (Eliminar)":
        await handleDelete();
        break;
      case "Exit":
        console.log("👋 Gracias por usar el CLI. ¡Hasta pronto!");
        process.exit(0);
      default:
        console.log("❌ Operación no válida.");
    }
  }
}

// Manejo de operaciones CRUD
async function handleGetAll() {
  try {
    const response = await axios.get(`${API_URL}/users`);
    console.log("📋 Usuarios encontrados:", response.data);
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
  }
}

async function handleGetById() {
  let users;
  try {
    const response = await axios.get(`${API_URL}/users`);
    users = response.data;
  } catch (err) {
    console.error("❌ Error al obtener los usuarios:", err.message);
    return;
  }

  if (users.length === 0) {
    console.log("⚠️ No hay usuarios disponibles.");
    return;
  }

  const userOptions = users.map((user) => ({
    name: `${user.name} (ID: ${user._id})`,
    value: user._id,
  }));

  userOptions.push({ name: "Go Back", value: "goBack" });

  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: "Selecciona un usuario para ver:",
      choices: userOptions,
    },
  ]);

  if (id === "goBack") return;

  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    console.log("📋 Detalles del usuario:", response.data);
  } catch (err) {
    console.error("❌ Error al obtener el usuario:", err.message);
  }
}

async function handleCreate() {
  const { autoGenerate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoGenerate",
      message: "¿Quieres generar automáticamente los datos del usuario?",
    },
  ]);

  if (!autoGenerate) {
    // Pedir datos manuales como antes
    return;
  }

  // Leer el cache para obtener el esquema
  const schemaCache = loadCache();
  const userSchema = schemaCache["User"];

  // Generar datos dinámicamente basados en el esquema
  const userData = {};
  for (const [key, value] of Object.entries(userSchema)) {
    if (key === "_id" || key === "__v") continue; // Ignorar campos internos

    switch (value.instance) {
      case "String":
        userData[key] = faker.lorem.words(2); // Generar texto aleatorio
        break;
      case "Number":
        userData[key] = faker.datatype.number({ min: 1, max: 100 }); // Número aleatorio
        break;
      case "Boolean":
        userData[key] = faker.datatype.boolean(); // Valor booleano aleatorio
        break;
      default:
        console.log(`⚠️ Tipo no soportado: ${value.instance}`);
    }
  }

  console.log("🔧 Datos generados automáticamente:", userData);

  try {
    const response = await axios.post("http://127.0.0.1:3000/users", userData);
    console.log("✅ Usuario creado:", response.data);
  } catch (err) {
    console.error(`❌ Error al crear el usuario: ${err.message}`);
  }
}

async function handleUpdate() {
  let users;
  try {
    const response = await axios.get("http://127.0.0.1:3000/users");
    users = response.data;
  } catch (err) {
    console.error("❌ Error al obtener los usuarios:", err.message);
    return;
  }

  if (users.length === 0) {
    console.log("⚠️ No hay usuarios disponibles para actualizar.");
    return;
  }

  const userOptions = users.map((user) => ({
    name: `${user.name} (ID: ${user._id})`,
    value: user._id,
  }));

  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: "Selecciona un usuario para actualizar:",
      choices: userOptions,
    },
  ]);

  const { autoGenerate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoGenerate",
      message:
        "¿Quieres generar automáticamente los datos para la actualización?",
    },
  ]);

  if (!autoGenerate) {
    // Pedir datos manuales como antes
    return;
  }

  // Leer el cache para obtener el esquema
  const schemaCache = loadCache();
  const userSchema = schemaCache["User"];

  // Generar datos dinámicamente basados en el esquema
  const updateData = {};
  for (const [key, value] of Object.entries(userSchema)) {
    if (key === "_id" || key === "__v") continue; // Ignorar campos internos

    switch (value.instance) {
      case "String":
        updateData[key] = faker.lorem.words(2); // Generar texto aleatorio
        break;
      case "Number":
        updateData[key] = faker.datatype.number({ min: 1, max: 100 }); // Número aleatorio
        break;
      case "Boolean":
        updateData[key] = faker.datatype.boolean(); // Valor booleano aleatorio
        break;
      default:
        console.log(`⚠️ Tipo no soportado: ${value.instance}`);
    }
  }

  console.log(
    "🔧 Datos generados automáticamente para la actualización:",
    updateData
  );

  try {
    const response = await axios.put(
      `http://127.0.0.1:3000/users/${id}`,
      updateData
    );
    console.log("✅ Usuario actualizado:", response.data);
  } catch (err) {
    console.error(`❌ Error al actualizar el usuario: ${err.message}`);
  }
}

async function handleDelete() {
  let users;
  try {
    const response = await axios.get(`${API_URL}/users`);
    users = response.data;
  } catch (err) {
    console.error("❌ Error al obtener los usuarios:", err.message);
    return;
  }

  if (users.length === 0) {
    console.log("⚠️ No hay usuarios disponibles para eliminar.");
    return;
  }

  const userOptions = users.map((user) => ({
    name: `${user.name} (ID: ${user._id})`,
    value: user._id,
  }));

  userOptions.push({ name: "Go Back", value: "goBack" });

  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: "Selecciona un usuario para eliminar:",
      choices: userOptions,
    },
  ]);

  if (id === "goBack") return;

  try {
    await axios.delete(`${API_URL}/users/${id}`);
    console.log("✅ Usuario eliminado exitosamente.");
  } catch (err) {
    console.error(`❌ Error al eliminar el usuario: ${err.message}`);
  }
}

// Ejecutar el CLI
runCLI();
