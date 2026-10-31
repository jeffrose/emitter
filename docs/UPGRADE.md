# Emitter Upgrade

## 2.0 to 2.1

No changes are required to upgrade from 2.0 to 2.1. The following defects were fixed, which changes the behavior of code that relied on them:

- `eventTypes()` and `toJSON()` threw a `TypeError` before the first listener was added, they now describe an empty emitter.
- `emit( 'error' )` and `trigger( 'error' )` silently returned `false` when the emitter never had a listener. An `error` event without an `error` listener now always throws.
- A `:maxListeners` event could be emitted for a single listener whose `length` (the number of declared parameters) exceeded the maximum number of listeners, and a `warned` property was added to that listener.
- `off()` and `clear( type )` removed listeners from an inherited event registry, e.g. of a prototype, which affected other emitters.
- `many( type, 0, listener )` registered a listener that was never removed.
- Extending `Emitter` with the `class` syntax (e.g. `class Greeter extends Emitter`) threw a `TypeError`.

## 1.x to 2.x

### 1.x API

```javascript
var target = Object.create( null );

// Initialization
Emitter.asEmitter.call( target );
target.defineEvents();
target.defineMaxListeners( 10 );

// Listener count
Emitter.listenerCount( target, 'hello' );

// Casting
target.toJSON();
target.toString();
```

### 2.x API

```javascript
var target = Object.create( null );

// Initialization
Emitter( target );

// Listener count
target.listenerCount( 'hello' );

// Casting
target.toJSON = function(){
    // ...
};
target.toString = function(){
    // ...
};
target.toJSON();
target.toString();
```
