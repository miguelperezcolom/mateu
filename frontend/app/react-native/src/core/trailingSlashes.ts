/**
 * `url` without its trailing slashes. A loop, not `url.replace(/\/+$/, '')`: that regex backtracks
 * (quadratic) on a long run of slashes that does not end the string.
 */
export const withoutTrailingSlashes = (url: string): string => {
  let end = url.length;
  while (end > 0 && url[end - 1] === '/') end--;
  return url.substring(0, end);
};
