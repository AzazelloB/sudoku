// Box-Muller with min max and skew
// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// "Normal Distribution Between 0 and 1"
export function randomBM(min = 0, max = 1, skew = 1) {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();

  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1

  if (num > 1 || num < 0) {
    num = randomBM(min, max, skew); // resample between 0 and 1 if out of range
  } else {
    num **= skew; // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}
