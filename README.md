# Emitter

> A modern event emitter implementation.

[![npm](https://img.shields.io/npm/v/emitter-js.svg)](https://www.npmjs.com/package/emitter-js)
[![CI](https://github.com/jeffrose/emitter/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffrose/emitter/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Emitter.js is an event emitter based on the nodejs [EventEmitter](https://nodejs.org/api/events.html) but utilizing some of the new [features](https://github.com/lukehoban/es6features) in [ECMAScript](http://www.ecmascript.org/) 6.

## Installation

### NPM

`npm install emitter-js`

### Git

`git clone https://github.com/jeffrose/emitter emitter`

### Bower

`bower install emitter-js`

> **Deprecated:** [Bower](https://bower.io/) is no longer maintained and `bower.json` will be removed in Emitter.js 3.0. Use NPM instead.

## Documentation

- [API](docs/API.md)
- [CHANGES](docs/CHANGES.md)
- [ROADMAP](docs/ROADMAP.md)
- [UPGRADE](docs/UPGRADE.md)

## Usage

Emitter.js provides both an ES module and a UMD build as part of the distribution. The `main` entry point is a CommonJS module, so `require( 'emitter-js' )` and `import 'emitter-js'` both provide the constructor.

| File                  | Environment                                             |
| --------------------- | ------------------------------------------------------- |
| `dist/emitter.js`     | ES module, for bundlers and modern environments         |
| `dist/emitter-umd.js` | UMD, transpiled to ES5 for browsers and legacy runtimes |
| `index.js`            | CommonJS entry point used by `main`                     |

Additional examples can be found in the [API](docs/API.md) docs and unit tests.

### ECMAScript 2015+

```javascript
import Emitter from 'emitter-js/dist/emitter.js';

const greeter = new Emitter();

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

### ECMAScript 5

```javascript
var Emitter = require( 'emitter-js' ),
    greeter = new Emitter();

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
    var Emitter = window.emitter.default,
        greeter = new Emitter();

    greeter.on( 'hello', function( name ){
        console.log( 'Hello, ' + name + '!' );
    } );
    greeter.emit( 'hello', 'World' );
    // Hello, World!
</script>
```

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

[Apache-2.0](LICENSE)
