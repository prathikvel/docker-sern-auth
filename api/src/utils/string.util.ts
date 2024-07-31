/**
 * Converts a string from camelCase to snake_case.
 *
 * @param str The camelCase string to convert
 * @returns The newly converted snake_case string
 */
export const convertCamelToSnake = (str: string) => {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1_").toLowerCase();
};

/**
 * Converts a string from snake_case to camelCase.
 *
 * @param str The snake_case string to convert
 * @returns The newly converted camelCase string
 */
export const convertSnakeToCamel = (str: string) => {
  return str.replace(/(?!^)_(.)/g, (_, char) => char.toUpperCase());
};
