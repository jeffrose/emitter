# Emitter API

## Class

### Emitter

Creates an instance of emitter. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.

####`new Emitter()`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
```

```javascript
function Greeter(){
    Emitter.call( this );
    
    this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
}

Greeter.prototype = Object.create( Emitter.prototype );

Greeter.prototype.greet = function( name ){
    this.emit( 'greet', name );
};

const greeter = new Greeter();
greeter.greet( 'Jeff' );
// Hello, Jeff!
```

####`new Emitter( bindings )`

```javascript
var greetings = {
        'greet': function(){
            console.log( 'Hello!' );
        }
    },
    
    greeter = new Emitter( greetings );
    
greeter.emit( 'greet' );
// Hello!
```

```javascript
var greetings = {
        'greet': [
            function(){ console.log( 'Hello!'   ); },
            function(){ console.log( 'Hi!'      ); },
            function(){ console.log( 'Yo!'      ); }
        ]
    },
    
    greeter = new Emitter( greetings );
    
greeter.emit( 'greet' );
// Hello!
// Hi!
// Yo!
```

## Methods and Properties

### Emitter.asEmitter

A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()` and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.

Like all functional mixins, this should be executed with [call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or [apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).

####`Emitter.asEmitter()`

```javascript
// Create a base object
const greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents();
greeter.defineMaxListeners( 10 );

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

```javascript
var // Predefined events
    greetings = {
        hello: function( name ){ console.log( `Hello, ${name}!` ),
        hi: function( name ){ console.log( `Hi, ${name}!` )
    },

    // Create a base object
    greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents( greetings );
greeter.defineMaxListeners( 10 );

greeter.emit( 'hello', 'Aaron' );
// Hello, Aaron!
```

```javascript
// NO!!!
Emitter.asEmitter(); // Madness ensues
```

### Emitter.defaultMaxListeners

Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.

####`Emitter.defaultMaxListeners`

```javascript
console.log( Emitter.defaultMaxListeners );
// 10

const greeter1 = new Emitter(),
    greeter2 = new Emitter();

Emitter.defaultMaxListeners = 1;

greeter1.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter1.on( 'hello', () => console.log( 'Hello!' ) );
greeter1.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!

greeter2.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter2.on( 'hi', () => console.log( 'Hi!' ) );
greeter2.on( 'hi', () => alert( 'Hi!' ) );
// Greeting "hi" has one too many!
```

### Emitter.every

The symbol used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.

####`Emitter.every`

```javascript
const greeter = new Emitter();
greeter.on( Emitter.every, () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```

### Emitter.listenerCount

Return the number of listeners for the event type on the given emitter.

####`Emitter.listenerCount( emitter, type ) -> Number`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( Emitter.listenerCount( greeter, 'hello' ) );
// 1
console.log( Emitter.listenerCount( greeter, 'goodbye' ) );
// 0
```

### Emitter.version

The current version of *Emitter.js*.

####`Emitter.version`

```javascript
console.log( Emitter.version );
// 1.1.2
```

### Emitter.prototype.clear

Remove all listeners, or those for the specified event `type`.

####`Emitter.prototype.clear()`

```javascript
const greeter = new Emitter();
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
const greeter = new Emitter();
greeter.on( {
    'hello' : function(){ console.log( 'Hello!' ); },
    'hi'    : function(){ console.log( 'Hi!' ); }
} );
greeter.emit( 'hello' );
// Hello!
greeter.emit( 'hi' );
// Hi!
greeter.clear( 'hello' );
greeter.emit( 'hello' );
greeter.emit( 'hi' );
// Hi!
```

### Emitter.prototype.defineEvents

Defines the internal event registry if it does not exist and creates `destroyEvents()`. This is called within the `constructor()` and does not need to be called if using `Emitter` directly.

When using `Emitter.asEmitter()`, this should be used to initialize the registry of the target object. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.

####`Emitter.prototype.defineEvents()`

```javascript
// Create a base object
const greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents();
greeter.defineMaxListeners( 10 );

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

####`Emitter.prototype.defineEvents( bindings )`

```javascript
const // Predefined events
    greetings = {
        hello: function( name ){ console.log( `Hello, ${name}!` ),
        hi: function( name ){ console.log( `Hi, ${name}!` )
    },

    // Create a base object
    greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents( greetings );
greeter.defineMaxListeners( 10 );

greeter.emit( 'hello', 'Aaron' );
// Hello, Aaron!
```

### Emitter.prototype.defineMaxListeners

Defines the maximum listener managment API including `destroyMaxListeners()` and the `maxListeners` property. This is called within the `constructor()` and does not need to be called if using `Emitter` directly.

When using `Emitter.asEmitter()`, this should be used to initialize maximum listener management on the target object. If it is not called the number of listeners will not be tracked.

####`Emitter.prototype.defineMaxListeners( defaultMaxListeners )`

```javascript
// Create a base object
const greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents();
greeter.defineMaxListeners( 10 );

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

### Emitter.prototype.destroy

Destroys the emitter.

####`Emitter.prototype.destroy()`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
greeter.destroy();
greeter.emit( 'hello' );
```

### Emitter.prototype.destroyEvents

Destroys the internal event registry if it exists. This is called within `destroy()` and does not need to be called if using `Emitter` directly.

When using `Emitter.asEmitter()`, this should be used to clean up the registry of the target object. This function does not exist if `defineEvents()` was not called.

####`Emitter.prototype.destroyEvents()`

```javascript
// Create a base object
const greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents();
greeter.defineMaxListeners( 10 );
greeter.destroy = function(){
    this.destroyEvents();
    this.destroyMaxListeners();
};

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!

greeter.destroy();
greeter.emit( 'hello', 'Jason' );
```

### Emitter.prototype.destroyMaxListeners

Destroys the maximum listener managment API if it exists. This is called within `destroy()` and does not need to be called if using `Emitter` directly.

When using `Emitter.asEmitter()`, this should be used to clean up the maximum listener managment of the target object. This function does not exist if `defineMaxListeners()` was not called.

####`Emitter.prototype.destroyMaxListeners()`

```javascript
// Create a base object
const greeter = Object.create( null );

// Initialize the mixin
Emitter.asEmitter.call( greeter );
greeter.defineEvents();
greeter.defineMaxListeners( 10 );
greeter.destroy = function(){
    this.destroyEvents();
    this.destroyMaxListeners();
};

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!

greeter.destroy();
greeter.emit( 'hello', 'Jason' );
```

### Emitter.prototype.emit

Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise.

####`Emitter.prototype.emit( type ) -> Boolean`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );    // true
// Hello!
greeter.emit( 'goodbye' );  // false
```

####`Emitter.prototype.emit( type, ...data ) -> Boolean`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```

```javascript
const greeter = new Emitter();
greeter.on( 'hello', ( firstName, lastName ) => console.log( `Hello, ${ firstName } ${ lastName }!` ) );
greeter.emit( 'hello', 'John', 'Smith' );
// Hello, John Smith!
```

```javascript
const greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );

// This event will not be triggered by emitting "greeting:hello"
greeter.on( 'hello', ( name ) => console.log( `Hello again, ${ name }` );

greeter.emit( 'greeting:hi', 'Mark' );
// Hi, Mark!
// Mark was greeted.

greeter.emit( 'greeting:hello', 'Jeff' );
// Hello, Jeff!
// Jeff was greeted.
```

### Emitter.prototype.listenerCount

Return the number of listeners for the given event type.

####`Emitter.prototype.listenerCount( type ) -> Number`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( greeter.listenerCount( 'hello' ) );
// 1
console.log( greeter.listenerCount( 'goodbye' ) );
// 0
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

Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

####`Emitter.prototype.many( times, listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Greeted Jeff
greeter.emit( 'hi', 'Terry' );      // 2
// Greeted Terry
greeter.emit( 'yo', 'Steve' );      // 3
```

####`Emitter.prototype.many( type, times, listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );   // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );   // 3
```

### Emitter.prototype.maxListeners

By default Emitters will emit a `:maxListeners` event if more than *10* listeners are added for a particular event `type`. This property allows that to be changed. Set to *0* for unlimited.

####`Emitter.prototype.maxListeners`

```javascript
const greeter = new Emitter();

greeter.maxListeners = 1;

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```

### Emitter.prototype.off

Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

####`Emitter.prototype.off( listener ) -> Emitter`

```javascript
function greet( name ){
    console.log( `Greetings, ${ name }!` );
}

const greeter = new Emitter();
greeter.on( greet );
greeter.emit( 'hello' 'Jeff' );
// Greetings, Jeff!
greeter.emit( 'hi' 'Jeff' );
// Greetings, Jeff!
greeter.off( greet );
greeter.emit( 'yo', 'Jeff' );
```

####`Emitter.prototype.off( type, listener ) -> Emitter`

```javascript
function hello( name ){
    console.log( `Hello, ${ name }!` );
}

const greeter = new Emitter();
greeter.on( 'hello', hello );
greeter.emit( 'hello', 'Jeff' );
// Hello, Jeff!
greeter.off( 'hello', hello );
greeter.emit( 'hello', 'Jeff' );
```

### Emitter.prototype.on

Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

####`Emitter.prototype.on( listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.on( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```

####`Emitter.prototype.on( type, listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hi', 'World' );
```

### Emitter.prototype.once

Adds a *one time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked, it is removed.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

####`Emitter.prototype.once( listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
```

####`Emitter.prototype.once( type, listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```

### Emitter.prototype.toJSON

####`Emitter.prototype.toJSON() -> Object`

```javascript
const greeter = new Emitter();
greeter.maxListeners = 5;
greeter.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greet', ( name ) => console.log( `Hi, ${ name }!` ) );

console.log( greeter.toJSON() );
// { "maxListeners": 5, "listenerCount": { "greet": 2 } }

greeter.destroy();

console.log( greeter.toJSON() );
// "destroyed"
```

### Emitter.prototype.toString

####`Emitter.prototype.toString() -> Object`

```javascript
const greeter = new Emitter();
greeter.maxListeners = 5;
greeter.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greet', ( name ) => console.log( `Hi, ${ name }!` ) );

console.log( greeter.toString() );
// 'Emitter { "maxListeners": 5, "listenerCount": { "greet": 2 } }'

greeter.destroy();

console.log( greeter.toString() );
// 'Emitter "destroyed"'
```

### Emitter.prototype.trigger

Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise.

####`Emitter.prototype.trigger( type, data ) -> Boolean`

```javascript
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!
```

```javascript
const greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );

greeter.trigger( 'greeting:hi', [ 'Mark' ] );
// Hi, Mark!
// Mark was greeted.

greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
// Hello, Jeff!
// Jeff was greeted.
```

### Emitter.prototype.until

Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

####`Emitter.prototype.until( listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.until( function( name ){
    console.log( `Greeted ${ name }` );
    return name === 'Terry';
} );
greeter.emit( 'hello', 'Jeff' );
// Greeted Jeff
greeter.emit( 'goodbye', 'Terry' );
// Greeted Terry
greeter.emit( 'hi', 'Aaron' );
```

####`Emitter.prototype.until( type, listener ) -> Emitter`

```javascript
const greeter = new Emitter();
greeter.until( 'hello', function( name ){
    console.log( `Hello, ${ name }!` );
    return name === 'World';
} );
greeter.emit( 'hello', 'Jeff' );
// Hello, Jeff!
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'Mark' );
```

## Events

When an `Emitter` experiences an error, it typically emits an `error` event. If there is no listener for it, then an `Error` is thrown.

Emitters emit certain events that provide information about its lifecycle. By convention these event types start with a `:`.

```javascript
const greeter = new Emitter();

greeter.maxListeners = 1;

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( ':on', ( greeting ) => console.log( `Greeting "${ greeting }" has more listeners.` ) );
greeter.on( ':off', ( greeting ) => console.log( `Greeting "${ greeting }" has fewer listeners.` ) );
greeter.on( ':destroy', () => console.log( 'Greeter destroyed' ) );

greeter.on( 'hello', () => console.log( 'Hello!' ) );
// Greeting "hello" has more listeners.
greeter.on( 'hi', () => console.log( 'Hi!' ) );
// Greeting "hi" has more listeners.
greeter.on( 'yo', () => console.log( 'Yo!' ) );
// Greeting "yo" has more listeners.

var hello = function(){
    alert( 'Hello!' );
};

greeter.on( 'hello', hello );
// Greeting "hello" has more listeners.
// Greeting "hello" has one too many!
greeter.off( 'hello', hello );
// Greeting "hello" has fewer listeners.

greeter.clear( 'yo' );
// Greeting "yo" has fewer listeners.

greeter.destroy();
// Greeter destroyed
// Greeting "hello" has fewer listeners.
// Greeting "hi" has fewer listeners.
```

###`:destroy`

This event is emitted _before_ an emitter destroys itself.

###`:maxListeners`
* `type` The event type.
* `listener` The event listener.

This event is emitted once the maximum number of listeners has been exceeded for an event type.

###`:off`
* `type` The event type.
* `listener` The event listener.

This event is emitted _after_ a listener is removed.

###`:on`
* `type` The event type.
* `listener` The event listener.

This event is emitted _before_ a listener is added.
