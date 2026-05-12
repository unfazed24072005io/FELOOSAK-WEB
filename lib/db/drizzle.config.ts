import { defineConfig } from "drizzle-kit"; 
import path from "path"; 
import { fileURLToPath } from "url"; 
import { dirname } from "path"; 
 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename); 
 
if (!process.env.DATABASE_URL) { 
  throw new Error("DATABASE_URL, ensure the database is provisioned"); 
} 
 
export default defineConfig({ 
  schema: path.join(__dirname, "./src/schema/index.ts"), 
  dialect: "postgresql", 
  dbCredentials: { 
    url: process.env.DATABASE_URL, 
  }, 
}); 
