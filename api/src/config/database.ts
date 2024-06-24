import { Database } from "@/models";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect, CamelCasePlugin } from "kysely";

const { NODE_ENV, DB_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } =
  process.env;

let database = MYSQL_DATABASE;
if (NODE_ENV === "test") {
  database = `test_${database}`;
}

export const pool = createPool({
  database,
  host: DB_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  connectionLimit: 10,
});

export const db = new Kysely<Database>({
  dialect: new MysqlDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});
