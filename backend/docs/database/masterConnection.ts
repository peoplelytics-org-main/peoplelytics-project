import mongoose from 'mongoose';
import dotenv from "dotenv"
dotenv.config();
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}

export const masterdbConnection = mongoose.createConnection(uri);
