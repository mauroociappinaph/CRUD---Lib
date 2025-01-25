import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadConfig() {
  const configPath = path.join(__dirname, "../crud.config.js");

  try {
    const config = await import(configPath);
    console.log("✅ Configuración cargada exitosamente.");
    return config.default; // Importa el objeto "default"
  } catch (err) {
    console.error("❌ Error al cargar `crud.config.js`:", err.message);
    process.exit(1);
  }
}
