import mongoose, { Connection } from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const connections: Record<string, Connection> = {};

export const getOrgConnection = async (orgId: string) => {
  // Reuse existing connection if ready
  if (connections[orgId]) {
    const existing = connections[orgId];
    if (existing.readyState === 1) return existing; // already connected

    // Wait if it's currently connecting
    if (existing.readyState === 2) {
      await new Promise<void>((resolve) => {
        existing.once("connected", () => resolve());
      });
      return existing;
    }
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  // ✅ Fix: Only prefix with "org_" if not already present
  const safeName = orgId.startsWith("org_") ? orgId : `org_${orgId}`;

  const orgUri = `${uri.replace("/master_db", "")}/${safeName}`;

  // Create a new connection
  const conn = mongoose.createConnection(orgUri, {
    autoCreate: true,
    autoIndex: true,
  });

  // Wait for successful connection
  await new Promise<void>((resolve, reject) => {
    conn.once("connected", () => {
      console.log(`✅ Connected to organization DB: ${safeName}_db`);
      resolve();
    });
    conn.once("error", (err) => {
      console.error(`❌ Connection error for ${safeName}:`, err);
      reject(err);
    });
  });

  connections[orgId] = conn;
  return conn;
};
