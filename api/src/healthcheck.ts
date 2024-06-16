import { sql } from "kysely";
import { db } from "./config/database";

/** Function that responds to health status. */
type HealthcheckFn = (healthy: boolean) => never;

/** The port the server is currently running on. */
// Fix: Importing `PORT` from `index.ts` causes the server to run.
// Current workaround is duplicate code, but look for better solution.
const PORT = process.env.API_PORT || 3000;

/**
 * Returns a promise of all health conditions to monitor. This checks
 * the connection to the database and if the server is running.
 *
 * @returns A promise of all health conditions to monitor
 */
const check = () => {
  return Promise.all([
    sql`select 1`.execute(db),
    fetch(`http://localhost:${PORT}`),
  ]);
};

/**
 * Exits the program successfully if the given status is healthy and
 * unsuccessfully if not.
 *
 * @param healthy If the server is healthy
 * @returns Exits successfully if healthy and unsuccessfully if not
 */
const exit: HealthcheckFn = (healthy: boolean) => {
  return healthy ? process.exit(0) : process.exit(1);
};

/**
 * Handles the check if the promise is resolved.
 *
 * @param healthcheck A function to handle the healthcheck
 * @returns A function that handles successful connections
 */
const handleSuccessfulConnection = (healthcheck: HealthcheckFn) => {
  return () => healthcheck(true);
};

/**
 * Handles the check if the promise is rejected.
 *
 * @param healthcheck A function to handle the healthcheck
 * @returns A function that handles unsuccessful connections
 */
const handleUnsuccessfulConnection = (healthcheck: HealthcheckFn) => {
  return () => healthcheck(false);
};

check()
  .then(handleSuccessfulConnection(exit))
  .catch(handleUnsuccessfulConnection(exit));
