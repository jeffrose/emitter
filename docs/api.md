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

Execute the listeners for the given type with the supplied arguments.

Returns `true` if the event had listeners, `false` otherwise.

####`Emitter.prototype.emit( type ) -> Boolean`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' ); // true
// Hello!
greeter.emit( 'goodbye' ); // false
```

####`Emitter.prototype.emit( type, ...data ) -> Boolean`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' ); // true
// Hello, World!
```

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( firstName, lastName ) => console.log( `Hello, ${ firstName } ${ lastName }!` ) );
greeter.emit( 'hello', 'John', 'Smith' ); // true
// Hello, John Smith!
```

### Emitter.prototype.emitEvent

####`Emitter.prototype.emitEvent( type, data ) -> Boolean`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emitEvent( 'hello', [ 'World' ] ); // true
// Hello, World!
```

### Emitter.prototype.listeners

####`Emitter.prototype.listeners( type ) -> Array`

### Emitter.prototype.many

####`Emitter.prototype.many( times, listener ) -> Emitter`

####`Emitter.prototype.many( type, times, listener ) -> Emitter`

### Emitter.prototype.maxListeners

####`Emitter.prototype.maxListeners() -> Number`

####`Emitter.prototype.maxListeners( max ) -> Emitter`

### Emitter.prototype.off

####`Emitter.prototype.off( type, listener ) -> Emitter`

### Emitter.prototype.on

####`Emitter.prototype.on( listener ) -> Emitter`

####`Emitter.prototype.on( type, listener ) -> Emitter`

### Emitter.prototype.once

####`Emitter.prototype.once( listener ) -> Emitter`

####`Emitter.prototype.once( type, listener ) -> Emitter`
