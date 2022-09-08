# tinga

## 5.0.0

### Major Changes

- f4e53b4: remove umd build

## 4.0.11

### Patch Changes

- 9c4486b: Fix package repository links

## 4.0.10

### Patch Changes

- fd9f5ac: switch package to type module, and update build process accordingly

## 4.0.9

### Patch Changes

- 762bc6b: docs: add link to bundlephobia
- d5185d2: Update packages and create `.mjs` file build.

## 4.0.8

### Patch Changes

- f5ae0a6: update docs

## 4.0.7

### Patch Changes

- 2a7e778: Check for window object to detect if running on the server. Apparently next checking for `processes` gives false positive in Next.js framework.

## 4.0.6

### Patch Changes

- fc7853c: fix setting up colors
- b4b156e: update docs

## 4.0.5

### Patch Changes

- 32d300f: Remove color output when running in nodejs

## 4.0.4

### Patch Changes

- e95be6d: types: make context optional in ChildConfig

## 4.0.3

### Patch Changes

- 4f75dae: freeze levels object

## 4.0.2

### Patch Changes

- 673c819: update docs

## 4.0.1

### Patch Changes

- 7dd115f: Color is no longer optional

## 4.0.0

### Major Changes

- 123c752: Fix grammar error on public method.
- a1ae24c: Change `processData` and `processRemoteData` call signatures
- cfefeea: Fix grammar errors on types

### Patch Changes

- 0b74bcf: fix order of arguments to console log

## 3.0.0

### Major Changes

- e58c1cc: Make the class the default export

### Minor Changes

- 66a3fa4: Implement child logger functionality

## 2.1.0

### Minor Changes

- 4858417: Add level "critical" to better align with the pino log levels.

## 2.0.0

### Major Changes

- 456427c: Attach logging methods directly on the prototype, so they could be overridden by child classes. This will also enable the creation of child loggers with custom logging levels in the future.

## 1.0.0

### Major Changes

- ad7d9be: Initial release
