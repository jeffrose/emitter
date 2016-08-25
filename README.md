# Emitter

> A modern event emitter implementation.

Emitter.js is an event emitter based on the nodejs [EventEmitter](https://nodejs.org/api/events.html) but utilizing some of the new [features](https://github.com/lukehoban/es6features) in [ECMAScript](http://www.ecmascript.org/) 6.

## Installation

### Git

`git clone https://github.com/jeffrose/emitter emitter`

### NPM

`npm install emitter-js`

### Bower

`bower install emitter-js`

## Documentation

* [API](docs/API.md)
* [CHANGES](docs/CHANGES.md)

## Usage

Emitter.js provides both an ES5 and ES6 version as part of the distribution. If `Symbol` is not available, either natively or through a polyfill, strings prefixed with `@@` will be used to store internal references.

Additional examples can be found in the [API](docs/API.md) docs and unit tests.

### ECMAScript 6

```javascript
// Depending on the scenario the /index may not be necessary
import Emitter from '../node_modules/emitter-js/index';

let greeter = new Emitter();

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

### ECMAScript 5

```javascript
var Emitter = require( 'emitter-js' ),

    greeter = new Emitter();

greeter.on( 'hello', function( name ){
    console.log( 'Hello, ' + name + '!' ) );
} );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

## Differences from `EventEmitter`

### Emitter.js...

* Lacks [domain](https://nodejs.org/api/domain.html) support.
* Has a succint API with no backward compatibility aliases, e.g. `clear()` instead of `removeAllListeners()`.
* Has namespaced lifecycle event types, e.g. `:off` instead of `removeListener`.
* Does not use `console.log()`.

# Roadmap

* Make `maxListeners` functionality optional.
* Use `WeakMap` for private data.
* Use `Symbol` instead of `String` for API references.
* Optional asynchronous listener execution.