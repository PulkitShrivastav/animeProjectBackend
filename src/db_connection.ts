import { Pool } from "pg"

const pool: Pool = new Pool({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name,
});
console.log('connection completed', pool)
export default pool;