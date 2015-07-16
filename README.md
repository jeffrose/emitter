# Emitter

> A modern event emitter implementation.

Emitter.js is an event emitter based on the nodejs [EventEmitter](https://nodejs.org/api/events.html) but utilizing many of the new [features](https://github.com/lukehoban/es6features) in [ECMAScript](http://www.ecmascript.org/) 6.

## Installation

### Git

`git clone https://github.com/jeffrose/emitter emitter`

### NPM

`npm install emitter-js`

### Bower

`bower install emitter-js`

## Documentation

* [API](docs/API.md)

## Usage

Emitter.js provides both an ES5 and ES6 version as part of the distribution.

Additional examples can be found in the [API](docs/API.md) docs and unit tests.

### ECMAScript 6

```javascript
import Emitter from '../node_modules/emitter-js/dist/emitter';

let greeter = new Emitter();

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

### ECMAScript 5

The ES5 version of Emitter.js requires a `Symbol` polyfill to run.

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

Emitter.js...

* Lacks [domain](https://nodejs.org/api/domain.html) support.
* Has a modern API with no backward compatibility aliases, e.g. `clear()` instead of `removeAllListeners()`.
* Has modern lifecycle event types, e.g. `:off` instead of `removeListener`.
* Does not use `console.log()`.