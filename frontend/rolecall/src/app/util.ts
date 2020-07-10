/**
 * Takes a router string and formats it to match
 * the router's internal url string
 */
export function cleanRouterString(input: string) {
  if (input.length > 1 && input.endsWith('/')) {
    input = input.substr(0, input.length - 1);
  }
  if (input.length > 1 && !input.startsWith('/')) {
    input = '/' + input;
  }
  return input;
}
