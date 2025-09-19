export function match(value: string) {
    const pattern = /^(?!.*[\p{Lu}/\\\s]).{1,256}$/u;
    return pattern.test(value);
}
