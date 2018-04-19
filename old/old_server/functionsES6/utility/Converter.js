/* Takes in date with form yyyymmdd and returns yyyy-mm-dd */
export function expandDate(date) {
  return date.slice(0,4) + "-" + date.slice(4,6) + "-" + date.slice(6);
}
