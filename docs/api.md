# emitter-js API

### Emitter.defaultMaxListeners

####`Emitter.defaultMaxListeners`

### Emitter.every

####`Emitter.every`

### Emitter.listenerCount

####`Emitter.listenerCount()`

### Emitter.prototype.clear

Remove all listeners or those for the specified event `type`.

####`Emitter.prototype.clear()`

####`Emitter.prototype.clear( type )`

### Emitter.prototype.destroy

Destroys the emitter.

####`Emitter.prototype.destroy()`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' ); // true
// Hello!
greeter.destroy();
greeter.emit( 'hello' );
```

### Emitter.prototype.emit

Execute the listeners for the given event `type` with the supplied arguments. The `type` can be namespaced using `:`.

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

### Emitter.prototype.emitEvent

Execute the listeners for the given event `type` with the supplied `data`. This does not support namespaced events.

####`Emitter.prototype.emitEvent( type, data ) -> Boolean`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emitEvent( 'hello', [ 'World' ] ); // true
// Hello, World!
```

```javascript
var greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
greeter.emitEvent( 'greeting:hi', [ 'Mark' ] );
// Hi, Mark!
greeter.emitEvent( 'greeting:hello', [ 'Jeff' ] );
// Hello, Jeff!
```

### Emitter.prototype.listeners

####`Emitter.prototype.listeners( type ) -> Array`

### Emitter.prototype.many

Add a *many time* listener for the supplied `type`. If no `type` is given, the listener will be triggered for events of any `type`.

####`Emitter.prototype.many( times, listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Greeted Jeff
greeter.emit( 'hi', 'Terry' );      // 2
// Greeted Terry
greeter.emit( 'yo', 'Steve' );      // 3
```

####`Emitter.prototype.many( type, times, listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );   // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );   // 3
```

### Emitter.prototype.maxListeners

####`Emitter.prototype.maxListeners() -> Number`

####`Emitter.prototype.maxListeners( max ) -> Emitter`

### Emitter.prototype.off

Removes the `listener` for the specified event `type`.

####`Emitter.prototype.off( type, listener ) -> Emitter`

```javascript
function hello( name ){
    console.log( `Hello, ${ name }!` );
}

var greeter = new Emitter();
greeter.on( 'hello', hello );
greeter.emit( 'hello', 'Jeff' ); // true
// Hello, Jeff!
greeter.off( 'hello', hello );
greeter.emit( 'hello', 'Jeff' ); // false
```

### Emitter.prototype.on

Adds a listeners for the specified event `type`. If no `type` is given, the listener will be triggered for events of any `type`.

####`Emitter.prototype.on( listener ) -> Emitter`

####`Emitter.prototype.on( type, listener ) -> Emitter`

### Emitter.prototype.once

Adds a *one time* listener for the specified event `type`. If no `type` is given, the listener will be triggered for events of any `type`.

####`Emitter.prototype.once( listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' ); // true
// Greeted
greeter.emit( 'goodbye' ); // false
```

####`Emitter.prototype.once( type, listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' ); // true
// Hello, World!
greeter.emit( 'hello', 'World' ); // false
```