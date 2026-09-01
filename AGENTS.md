<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Coding Guidelines

## Code Style

- Prioritize readability and maintainability over compactness.
- Never place multiple statements on the same line.
- Always use consistent spacing and indentation.
- Add spaces around operators and after commas.
- Break long method chains across multiple lines.
- Break complex expressions into multiple readable lines.
- Avoid minified or compressed-looking code.
- Do not unnecessarily compress object destructuring.
- Keep logical blocks visually separated with blank lines.
- Follow the project's ESLint and Prettier configuration.
- Run the formatter after modifying TypeScript, JavaScript, TSX, or JSX files.

## Logical spacing

- Separate distinct logical steps inside functions with a blank line.
- Use blank lines between:
  - guard clauses and subsequent logic;
  - variable declarations and return statements;
  - groups of related variable declarations and later processing;
  - validation, processing, and output/return stages.
- Functions should be visually readable in logical blocks, not written as one continuous block.
- Do not add excessive blank lines; use them only to separate meaningful logical sections.

## Visual grouping

- Organize functions into visually distinct logical blocks.
- Add a blank line after initial setup variables before the main operation.
- Add a blank line after multi-line expressions before subsequent declarations.
- Add a blank line between data preparation and database/API operations.
- Add a blank line between an operation and its error handling block.
- Keep closely related simple declarations together.
- Separate unrelated imports into groups when appropriate.
- Prefer semantic grouping over minimizing vertical whitespace.

## TypeScript / JavaScript

Avoid code like:

    const admin=adminClient();
    if(error)throw error;if(membership)return membership;

Prefer:

    const admin = adminClient();

    if (error) throw error;
    if (membership) return membership;

## General

- Preserve existing project architecture unless a change is necessary.
- Prefer clear variable and function names.
- Avoid unnecessary abstractions.
- Do not sacrifice readability to reduce the number of lines.
- Keep functions reasonably small and focused.
