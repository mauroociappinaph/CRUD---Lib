import mongoose from "mongoose";

// Esquema de Usuario
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    address: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["admin", "user", "moderator"],
      default: "user",
    },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // Agrega createdAt y updatedAt automáticamente
);

// Esquema de Producto
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategorie",
        required: true,
      },
    ], // Relación con SubCategorie
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Esquema de Compañía
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Esquema de SubCategorías
const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    parentCategory: { type: String, required: true }, // Relación con categoría principal
  },
  { timestamps: true }
);

// Esquema de Cartas (Cards)
const cardsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategorie",
        required: true,
      },
    ], // Relación con SubCategorie
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const transporterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Exportar esquemas con relaciones y mejoras
const schemas = {
  User: mongoose.model("User", userSchema),
  Product: mongoose.model("Product", productSchema),
  Company: mongoose.model("Company", companySchema),
  SubCategorie: mongoose.model("SubCategorie", subCategorySchema),
  Card: mongoose.model("Card", cardsSchema),
  Transporter: mongoose.model("Transporter", transporterSchema),
};

export default schemas;
