import mongoose, { Connection } from 'mongoose';
import dotenv from "dotenv"
dotenv.config();
const connections: Record<string, Connection> = {};

export const getOrgConnection = (orgName: string) => {
  if (connections[orgName]) {
    return connections[orgName];
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const orgUri = `${uri}/org_${orgName}_db`;
  const conn = mongoose.createConnection(orgUri);

  connections[orgName] = conn;
  return conn;
};
