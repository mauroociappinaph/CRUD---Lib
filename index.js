import dotenv from "dotenv";
import { createServer } from "./server.js";
import { connectDatabase } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";

dotenv.config();

const app = createServer();

// Conectar a la base de datos
connectDatabase();

// Configurar Swagger
setupSwagger(app);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
