# emitter-js

> A modern event emitter implementation.

## Installation

### Git

`git clone https://github.com/jeffrose/event-emitter event-emitter`

### NPM

`npm install emitter-js`

### Bower

`bower install emitter-js`

## Learn More

* [API docs](docs/api.md)

## Examples

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

```javascript
var greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
greeter.emit( 'greeting:hi', 'Mark' );
// Hi, Mark!
// Mark was greeted.
greeter.emit( 'greeting:hello', 'Jeff' );
// Hello, Jeff!
// Jeff was greeted.
```

```javascript
var greetings = {
 hello: function( name ){ console.log( `Hello, ${name}!` ),
 hi: function( name ){ console.log( `Hi, ${name}!` )
};
var greeter = new Emitter( greetings );
greeter.emit( 'hello', 'Aaron' );
// Hello, Aaron!
```

```javascript
var greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );
```

```javascript
var greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );     // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );    // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );    // 3
```
