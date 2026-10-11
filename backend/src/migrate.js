import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Adds a column to an existing table only if it isn't already there.
// Safe to run repeatedly; never touches existing data or drops anything.
async function addColumnIfMissing(conn, table, column, definition) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, table, column]
  )
  if (rows[0].cnt > 0) {
    console.log(`Migration: ${table}.${column} already exists, skipping`)
    return
  }
  await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  console.log(`Migration: added ${table}.${column}`)
}

async function main() {
  const sqlPath = path.join(__dirname, '..', 'sql', 'schema.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  })

  // 1) Create any tables that don't exist yet (buyers, sellers, products,
  //    orders, order_items, cart, wishlist, follows). Existing tables and
  //    their data are left untouched.
  await conn.query(sql)

  // 2) Phase 2 backward-compatible migration: sellers created before Phase 2
  //    won't have shop_description yet (CREATE TABLE IF NOT EXISTS is a
  //    no-op on an already-existing table), so add it explicitly here.
  await addColumnIfMissing(conn, 'sellers', 'shop_description', 'TEXT NULL')

  await conn.end()
  console.log('Migration OK: schema applied')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
