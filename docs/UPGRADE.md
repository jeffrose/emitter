# Emitter Upgrade 1.x to 2.x

## 1.x API

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

## 2.x API

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