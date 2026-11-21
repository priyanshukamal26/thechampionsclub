const { Client } = require('pg');

const connectionString = "postgresql://postgres:eo8wEtDNXFYmwenf@db.fvagpcmqapwddyyxhwlz.supabase.co:5432/postgres";

async function testConnection() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Successfully connected to Supabase PostgreSQL!");
    const res = await client.query("SELECT version();");
    console.log("PostgreSQL Version:", res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testConnection();
