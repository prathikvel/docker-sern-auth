/**
 * A compare function used to sort an array of objects by the array of given
 * attributes and orders.
 *
 * @param orderBys An array of strings with attributes and orders
 * @returns A compare function used to determine the order of elements
 */
export const attrSorter = <T extends Record<string, any>>(
  orderBys: `${Extract<keyof T, string>} ${"asc" | "desc"}`[]
) => {
  return (a: T, b: T) => {
    return orderBys
      .map((orderBy) => {
        const [attr, orderStr] = orderBy.split(/\s+/);
        const order = orderStr === "asc" ? 1 : -1;
        if (a[attr] > b[attr]) return order;
        if (a[attr] < b[attr]) return -order;
        return 0;
      })
      .reduce((prev, next) => (prev ? prev : next), 0);
  };
};
