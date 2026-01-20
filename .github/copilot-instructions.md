# GitHub Copilot Instructions

## Project Overview

SpetsCTF is a CTF and wargames platform, meant to organize the annual SpetsCTF,
as well as provide students a simple way to practise on previous years'
challenges.

## CRITICAL: Package Manager

**NEVER USE NPM UNDER ANY CIRCUMSTANCES**

This project uses **bun** exclusively for all package management and build operations. There are NO exceptions to this rule.

**DO NOT:**

- Suggest `npm install`, `npm run`, `npm ci`, or ANY `npm` commands
- Reference `package-lock.json` or npm-specific configurations
- Use npm scripts or npm-related tooling
- Suggest installing packages with npm

**ALWAYS USE:**

- `bun install` for installing dependencies
- `bun add <package>` for adding dependencies
- `bun remove <package>` for removing dependencies
- `bun run <script>` or `bun <script>` for running scripts
- `bun.lock` as the lockfile (not package-lock.json)

If you find yourself suggesting npm, STOP and use bun instead.

There is ONE exception: we allow using `@sveltejs/adapter-node` to build a `node`-compatible production server.

## Technology Stack

- **SvelteKit** - Application framework (using **Svelte 5**)
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling framework (using Vite plugin)
- **Bun** - Package manager and JavaScript runtime
- **Kysely** - Type-safe SQL query builder for TypeScript
- **PostgreSQL** - Database (local instance in dev)
- **Nix** - Development environments and reproducible builds
- **svelte-adapter-bun** - SvelteKit adapter for Bun runtime

## Development Workflow

### Environment Setup

This project uses Nix for reproducible development environments. All development should occur within the Nix development shell.

```bash
# Enter development environment
nix develop

# Start development server (uses Makefile)
make dev

# Format code
nix fmt

# Run CI checks locally
nix flake check
```

### Building

```bash
# Production build (uses Nix)
nix build
```

**Critical**: Nix builds only include Git-tracked files. Unstaged or uncommitted files will NOT be included in the build. If a build fails due to missing files that exist locally, they need to be staged or committed.

### Nix Flakes

- This is a Nix flakes project
- Users must have `nix-command` and `flakes` enabled in their Nix configuration
- All builds and development environments are managed through flakes

## Coding Conventions

When generating code for this project:

- **Use Svelte 5 syntax exclusively** - This includes runes (`$state`, `$derived`, `$effect`, `$props`), snippets, and the new event handling syntax
- Follow SvelteKit best practices and file structure conventions
- Use Tailwind CSS utility classes for styling (avoid custom CSS when possible)
- Ensure all code is compatible with the Bun runtime
- Write code that will pass `nix fmt` formatting checks
- Consider suggesting `nix fmt` after generating significant code changes

### Svelte 5 Specifics

- Use runes for reactivity: `$state()`, `$derived()`, `$effect()`
- Use `$props()` for component props instead of `export let`
- Use snippets (`{#snippet name()}...{/snippet}`) instead of slots where appropriate
- Event handlers use `onclick` instead of `on:click` (lowercase, no colon)
- No stores are needed for local component state - use `$state()` instead
- Use `resolve()` for any navigation element - for example, do `<a href={resolve("/")}>...</a>` instead of `<a href="/">...</a>`, since the resolve function is typed, avoiding 404 errors

## File Tracking Reminder

Since Nix builds only include Git-tracked files, when creating new files that should be included in production builds, remind the user to:

1. Stage the files with `git add`
1. Or commit them with `git commit`

New files that are not tracked by Git will be silently excluded from Nix builds.
