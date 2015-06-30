# emitter-js API

### Emitter.defaultMaxListeners

####`Emitter.defaultMaxListeners`

### Emitter.every

####`Emitter.every`

### Emitter.listenerCount

####`Emitter.listenerCount()`

### Emitter.prototype.clear

####`Emitter.prototype.clear()`

####`Emitter.prototype.clear( type )`

### Emitter.prototype.defineEvents

####`Emitter.prototype.defineEvents()`

### Emitter.prototype.destroy

####`Emitter.prototype.destroy()`

### Emitter.prototype.emit

####`Emitter.prototype.emit( type, ...data ) -> Boolean`

### Emitter.prototype.emitEvent

####`Emitter.prototype.emitEvent( type, data ) -> Boolean`

### Emitter.prototype.listeners

####`Emitter.prototype.listeners( type ) -> Array`

### Emitter.prototype.many

####`Emitter.prototype.many( type, times, listener ) -> Emitter`

### Emitter.prototype.maxListeners

####`Emitter.prototype.maxListeners() -> Number`

####`Emitter.prototype.maxListeners( max ) -> Emitter`

### Emitter.prototype.off

####`Emitter.prototype.off( type, listener ) -> Emitter`

### Emitter.prototype.on

####`Emitter.prototype.on( type, listener ) -> Emitter`

### Emitter.prototype.once

####`Emitter.prototype.once( type, listener ) -> Emitter`

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
greeter.emit( 'greeting:hello', 'Jeff' );
// Hi, Mark!
// Mark was greeted.
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
greeter.emit( 'hello', 'Terry' );
// Hello, Jeff!
```

```javascript
var greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );     // 1
greeter.emit( 'hello', 'Terry' );    // 2
greeter.emit( 'hello', 'Steve' );    // 3
// Hello, Jeff!
// Hello, Terry!
```
