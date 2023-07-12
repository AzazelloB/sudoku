export const enumKeys = (obj: Record<string, number | string>) => {
  return Object.keys(obj).map((x) => parseInt(x, 10)).filter((x) => !Number.isNaN(x));
};
