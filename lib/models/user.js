import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  password: { type: String },
  role: { type: String },
  isActive: { type: Boolean, default: true },
});

const User = mongoose.model("User", userSchema);

export default User;
