import { Pool, types } from "pg";

// Dice a pg di restituire le DATE come stringa "YYYY-MM-DD"
// invece di convertirle in oggetti JavaScript Date (evita problemi di timezone)
types.setTypeParser(1082, (val: string) => val);
//1082 è il codice interno di PostgreSQL per il tipo DATE. Con setTypeParser stiamo dicendo:
//"quando ricevi un campo di tipo DATE, non convertirlo — restituiscilo come stringa così com'è".
//Questo risolve il problema alla radice invece di aggiustarlo campo per campo.

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
);

export default pool;
