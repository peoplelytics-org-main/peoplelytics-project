import { Schema, model } from "mongoose";
import { masterdbConnection } from "../../docs/database/masterConnection"

const superAdminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Superadmin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SuperAdmin = masterdbConnection.model("SuperAdmin", superAdminSchema);
