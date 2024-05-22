import { Database } from "../models";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";

const { DB_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      database: MYSQL_DATABASE,
      host: DB_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      connectionLimit: 10,
    }),
  }),
});
