# Emitter

> A modern event emitter implementation.

[![npm](https://img.shields.io/npm/v/emitter-js.svg)](https://www.npmjs.com/package/emitter-js)
[![CI](https://github.com/jeffrose/emitter/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffrose/emitter/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Emitter.js is an event emitter in the spirit of the Node.js [EventEmitter](https://nodejs.org/api/events.html), with a small API and some useful extras: namespaced event types, listeners bound to every event, and helpers for one-time, many-time and conditional subscriptions.

## Installation

```sh
npm install emitter-js
```

Or clone the repository:

```sh
git clone https://github.com/jeffrose/emitter emitter
```

## Documentation

- [API](docs/API.md)
- [CHANGES](docs/CHANGES.md)
- [ROADMAP](docs/ROADMAP.md)
- [UPGRADE](docs/UPGRADE.md)

## Usage

The package ships three builds:

| File                  | Environment                                             |
| --------------------- | ------------------------------------------------------- |
| `dist/emitter.js`     | ES module, for bundlers and modern runtimes             |
| `dist/emitter-umd.js` | UMD, transpiled to ES5 for browsers and legacy runtimes |
| `index.js`            | CommonJS entry point used by `main`                     |

`require( 'emitter-js' )` and `import 'emitter-js'` both provide the constructor.

### ES modules

```javascript
import Emitter from 'emitter-js/dist/emitter.js';

const greeter = new Emitter();

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

### CommonJS

```javascript
const Emitter = require( 'emitter-js' );
const greeter = new Emitter();

greeter.on( 'hello', function( name ){
    console.log( 'Hello, ' + name + '!' );
} );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

### Browser

The UMD build registers a global named `emitter`, which exposes the constructor as `default`:

```html
<script src="node_modules/emitter-js/dist/emitter-umd.js"></script>
<script>
    const Emitter = window.emitter.default;
    const greeter = new Emitter();

    greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
    greeter.emit( 'hello', 'World' );
    // Hello, World!
</script>
```

Additional examples can be found in the [API](docs/API.md) docs and the unit tests.

## Differences from `EventEmitter`

### Emitter.js...

- Lacks [domain](https://nodejs.org/api/domain.html) support.
- Has a succinct API with no backward compatibility aliases, e.g. `clear()` instead of `removeAllListeners()`.
- Has namespaced event types, e.g. emitting `greeting:hello` also emits `greeting`, and `:off` instead of `removeListener`.
- Supports listeners for every event type with [`Emitter.every`](docs/API.md#Emitter.every).
- Provides `once()`, `many()`, `until()`, `first()` and `at()` helpers for common subscription patterns.
- Executes every listener for an event before re-emitting the errors thrown by them as `error` events.
- Does not use `console.log()`.

## Development

The development environment requires Node.js 22.18 or newer.

```sh
npm install
npm test              # build the distribution and run the test suite against the source and the distribution
npm run coverage      # run the test suite with coverage
npm run build         # rebuild the dist/ files
npm run build:docs    # regenerate docs/API.md from the JSDoc annotations
npm run lint          # ESLint
npm run format        # Prettier
npm run benchmark     # benchmark against the Node.js EventEmitter
```

The `dist/` directory is committed, so a release consists of updating the version, rebuilding the distribution and regenerating the documentation.

## License

[MIT](LICENSE)
