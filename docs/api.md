# Emitter API

## Class

### Emitter

Creates an instance of emitter.

####`new Emitter()`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
```

####`new Emitter( bindings )`

```javascript
var greetings = {
        'hello': function(){
            console.log( 'Hello!' );
        }
    },
    
    greeter = new Emitter( greetings );
    
greeter.emit( 'hello' );
// Hello!
```

## Methods and Properties

### Emitter.defaultMaxListeners

Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.

####`Emitter.defaultMaxListeners`

```javascript
console.log( Emitter.defaultMaxListeners );
// 10
```

### Emitter.every

####`Emitter.every`

### Emitter.listenerCount

Return the number of listeners for the given event.

####`Emitter.listenerCount( emitter, type ) -> Number`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( Emitter.listenerCount( greeter, 'hello' ) );
// 1
console.log( Emitter.listenerCount( greeter, 'goodbye' ) );
// 0
```

### Emitter.prototype.clear

Remove all listeners or those for the specified event `type`.

####`Emitter.prototype.clear()`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hi', () => console.log( 'Hi!' ) );
greeter.emit( 'hello' );
// Hello!
greeter.emit( 'hi' );
// Hi!
greeter.clear();
greeter.emit( 'hello' );
greeter.emit( 'hi' );
```

####`Emitter.prototype.clear( type )`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hi', () => console.log( 'Hi!' ) );
greeter.emit( 'hello' );
// Hello!
greeter.emit( 'hi' );
// Hi!
greeter.clear( 'hello' );
greeter.emit( 'hello' );
greeter.emit( 'hi' );
// Hi!
```

### Emitter.prototype.destroy

Destroys the emitter.

####`Emitter.prototype.destroy()`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
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
greeter.emit( 'hello' );    // true
// Hello!
greeter.emit( 'goodbye' );  // false
```

####`Emitter.prototype.emit( type, ...data ) -> Boolean`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( firstName, lastName ) => console.log( `Hello, ${ firstName } ${ lastName }!` ) );
greeter.emit( 'hello', 'John', 'Smith' );
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

Execute the listeners for the given event `type` with the supplied `data`. This a lower-level function and *does not support namespaced events*.

Returns `true` if the event had listeners, `false` otherwise.

####`Emitter.prototype.emitEvent( type, data ) -> Boolean`

```javascript
var greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emitEvent( 'hello', [ 'World' ] );
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

Returns an array of listeners for the specified event.

####`Emitter.prototype.listeners( type ) -> Array`

```javascript
var hello = function(){
        console.log( 'Hello!' );
    },
    
    greeter = new Emitter();

greeter.on( 'hello', hello );
greeter.emit( 'hello' );
// Hello!

console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
// true
```

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

The maximum number of listeners. Emitter will a warning event if more than 10 listeners are added for a particular event.

####`Emitter.prototype.maxListeners`

### Emitter.prototype.off

Removes the `listener` for the specified event `type`.

####`Emitter.prototype.off( type, listener ) -> Emitter`

```javascript
function hello( name ){
    console.log( `Hello, ${ name }!` );
}

var greeter = new Emitter();
greeter.on( 'hello', hello );
greeter.emit( 'hello', 'Jeff' );
// Hello, Jeff!
greeter.off( 'hello', hello );
greeter.emit( 'hello', 'Jeff' );
```

### Emitter.prototype.on

Adds a listeners for the specified event `type`. If no `type` is given, the listener will be triggered for events of any `type`.

####`Emitter.prototype.on( listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.on( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```

####`Emitter.prototype.on( type, listener ) -> Emitter`

### Emitter.prototype.once

Adds a *one time* listener for the specified event `type`. If no `type` is given, the listener will be triggered for events of any `type`.

####`Emitter.prototype.once( listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
```

####`Emitter.prototype.once( type, listener ) -> Emitter`

```javascript
var greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```

## Events

The emitter emits internal events that provide information about its lifecycle. By convention these event types start with a `:`.

```javascript
var greeter = new Emitter();

greeter.maxListeners = 1;

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( ':on', ( greeting ) => console.log( `Greeting "${ greeting }" has a new listener.` ) );
greeter.on( ':off', ( greeting ) => console.log( `Greeting "${ greeting }" has one less listener.` ) );
greeter.on( ':destroy', () => console.log( 'Greeter destroyed' ) );

greeter.on( 'hello', () => console.log( 'Hello!' ) );
// Greeting "hello" has a new listener.
greeter.on( 'hi', () => console.log( 'Hi!' ) );
// Greeting "hi" has a new listener.
greeter.on( 'yo', () => console.log( 'Yo!' ) );
// Greeting "yo" has a new listener.

var hello = function(){
    alert( 'Hello!' );
};

greeter.on( 'hello', hello );
// Greeting "hello" has a new listener.
// Greeting "hello" has one too many!
greeter.off( 'hello', hello );
// Greeting "hello" has one less listener.

greeter.clear( 'yo' );
// Greeting "yo" has one less listener.

greeter.destroy();
// Greeter destroyed
// Greeting "hello" has one less listener.
// Greeting "hi" has one less listener.
```

###`:destroy`

This event is emitted _before_ an emitter destroys itself.

###`:maxListeners`
* `type` The event type.
* `listner` The event listener.

This event is emitted once the maximum number of listeners has been exceeded for an event type.

###`:off`
* `type` The event type.
* `listner` The event listener.

This event is emitted _after_ a listener is removed.

###`:on`
* `type` The event type.
* `listner` The event listener.

This event is emitted _before_ a listener is added.
