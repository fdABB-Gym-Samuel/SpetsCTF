# SpetsCTF code style guidelines

## TypeScript and SvelteKit check
TypeScript should be used where applicable. Strive to minimize the amount of errors reported by running `npm run check`. Type errors which are unfeasable to correct, and are known to work, may be suppressed with comments, at the discretion of a maintainer.

## Formatting
Every commit submitted as a PR must be formatted with Prettier.
```bash
npm run format
```

The in-tree `.prettierrc` contains details about how the code should be formatted. 

## Naming conventions
- Variables in TypeScript files use lower camelCase (first letter of first word in lower case, first letter in every other word Capitalized).
- Interfaces, types and classes should use upper CamelCase (first letter of every word Capitalized), also known as PascalCase.
- Typescript files should be in lowercase. They should be grouped in relevant categories in the `src/lib/` folder (available through the `$lib` alias).
- Svelte components should be named according to PascalCase. Usually, they should be placed in `src/lib/components/`.
