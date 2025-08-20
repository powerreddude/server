import mysql from 'mysql2/promise';
import 'dotenv/config'; 
import fs from 'fs';
import path from 'path';

const mysqlConnection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  port: process.env.MYSQL_PORT || 3306,
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'catan',
});

await mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

const schemaPath = path.resolve('db/schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

// Split the SQL script into individual statements
const statements = schemaSQL.split(';').map((stmt) => stmt.trim()).filter((stmt) => stmt.length > 0);

try {
  for (const statement of statements) {
    await mysqlConnection.query(statement);
  }
  console.log('Schema successfully executed');
} catch (error) {
  console.error('Error executing schema:', error);
  process.exit(1);
}

export default mysqlConnection;