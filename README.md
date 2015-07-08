# Emitter

> A modern event emitter implementation.

Emitter.js is an event emitter based on the Node [EventEmitter](https://nodejs.org/api/events.html) but utilizing many of the new [features](https://github.com/lukehoban/es6features) in [ECMAScript](http://www.ecmascript.org/) 6.

## Installation

### Git

`git clone https://github.com/jeffrose/emitter emitter`

### NPM

`npm install emitter-js`

### Bower

`bower install emitter-js`

## Documentation

* [API](docs/api.md)

## Examples

```javascript
import Emitter from '../node_modules/emitter-js/dist/emitter';

let greeter = new Emitter();

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
