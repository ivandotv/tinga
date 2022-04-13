# tinga

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
