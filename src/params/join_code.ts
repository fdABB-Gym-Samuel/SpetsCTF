export function match(value: string): boolean {
  const pattern = /[a-f0-9]{15,16}/;
  return pattern.test(value);
}

