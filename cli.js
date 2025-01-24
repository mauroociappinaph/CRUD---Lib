#!/usr/bin/env node
import inquirer from "inquirer";
import axios from "axios";
import { faker } from "@faker-js/faker";
const API_URL = "http://localhost:3000/api/users";
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

// Función para listar todos los usuarios
async function handleGetAll() {
  try {
    const response = await axios.get(API_URL);
    console.log("📋 Usuarios encontrados:", response.data);
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
  }
}

// Función para obtener un usuario por ID
async function handleGetById() {
  let users;
  try {
    const response = await axios.get(API_URL);
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
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("📋 Detalles del usuario:", response.data);
  } catch (err) {
    console.error("❌ Error al obtener el usuario:", err.message);
  }
}

// Función para crear un usuario
async function handleCreate() {
  const { autoGenerate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoGenerate",
      message: "¿Quieres generar automáticamente los datos del usuario?",
    },
  ]);

  let userData;

  if (autoGenerate) {
    userData = {
      name: faker.lorem.words(2),
      email: faker.internet.email(),
      age: faker.number.int({ min: 1, max: 100 }),
      address: faker.address.streetAddress(),
      isActive: faker.datatype.boolean(),
    };
    console.log("🔧 Datos generados automáticamente:", userData);
  } else {
    const { name, email, age, address, isActive } = await inquirer.prompt([
      { type: "input", name: "name", message: "Nombre del usuario:" },
      { type: "input", name: "email", message: "Email del usuario:" },
      { type: "input", name: "age", message: "Edad del usuario:" },
      { type: "input", name: "address", message: "Dirección del usuario:" },
      {
        type: "confirm",
        name: "isActive",
        message: "¿El usuario está activo?",
        default: true,
      },
    ]);
    userData = { name, email, age: parseInt(age), address, isActive };
  }

  try {
    const response = await axios.post(API_URL, userData);
    console.log("✅ Usuario creado:", response.data);
  } catch (err) {
    console.error(`❌ Error al crear el usuario: ${err.message}`);
  }
}

// Otras funciones (`handleUpdate`, `handleDelete`) funcionan de forma similar.

runCLI();
