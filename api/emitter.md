## Classes

<dl>
<dt><a href="#Emitter">Emitter</a> ⇐ <code><a href="#Emitter..Null">Null</a></code></dt>
<dd><p>An object that emits named events which cause functions to be executed.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#Emitter">Emitter([selection], target)</a></dt>
<dd><p>Applies the Emitter.js API to its target.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#EventType">EventType</a> : <code><a href="#external_string">string</a></code> | <code><a href="#external_symbol">symbol</a></code></dt>
<dd><p>A <a href="#external_string">string</a> or <a href="#external_symbol">symbol</a> that represents the type of event fired by the Emitter.</p>
</dd>
<dt><a href="#EventListener">EventListener</a> : <code><a href="#external_Function">Function</a></code></dt>
<dd><p>A <a href="#external_Function">Function</a> bound to an emitter <a href="#EventType">EventType</a>. Any data transmitted with the event will be passed into the listener as arguments.</p>
</dd>
</dl>

## External

<dl>
<dt><a href="#external_Array">Array</a></dt>
<dd><p>JavaScript Array</p>
</dd>
<dt><a href="#external_boolean">boolean</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Prm454mun3!imitive">primitive</a> boolean</p>
</dd>
<dt><a href="#external_Error">Error</a></dt>
<dd><p>JavaScript Error</p>
</dd>
<dt><a href="#external_Function">Function</a></dt>
<dd><p>JavaScript Function</p>
</dd>
<dt><a href="#external_number">number</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> number</p>
</dd>
<dt><a href="#external_null">null</a></dt>
<dd><p>JavaScript null</p>
</dd>
<dt><a href="#external_Object">Object</a></dt>
<dd><p>JavaScript Object</p>
</dd>
<dt><a href="#external_Promise">Promise</a></dt>
<dd><p>JavaScript Promise</p>
</dd>
<dt><a href="#external_string">string</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> string</p>
</dd>
<dt><a href="#external_symbol">symbol</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> symbol</p>
</dd>
</dl>

<a name="Emitter"></a>

## Emitter ⇐ <code>[Null](#Emitter..Null)</code>
An object that emits named events which cause functions to be executed.

**Kind**: global class  
**Extends:** <code>[Null](#Emitter..Null)</code>  
**Mixes**: <code>[asEmitter](#Emitter..asEmitter)</code>  
**See**: [https://github.com/nodejs/node/blob/master/lib/events.js](https://github.com/nodejs/node/blob/master/lib/events.js)  

* [Emitter](#Emitter) ⇐ <code>[Null](#Emitter..Null)</code>
    * [new Emitter([mapping])](#new_Emitter_new)
    * _instance_
        * [.destroy()](#Emitter+destroy)
        * [.toJSON()](#Emitter+toJSON) ⇒ <code>[Object](#external_Object)</code>
        * [.toString()](#Emitter+toString) ⇒ <code>[string](#external_string)</code>
        * [.at([type], index, listener)](#Emitter+at) ⇒ <code>[Emitter](#Emitter)</code>
        * [.clear([type])](#Emitter+clear) ⇒ <code>[Emitter](#Emitter)</code>
        * [.emit(type, [...data])](#Emitter+emit) ⇒ <code>[boolean](#external_boolean)</code>
        * [.eventTypes()](#Emitter+eventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
        * [.first(type, listener)](#Emitter+first) ⇒ <code>[Emitter](#Emitter)</code>
        * [.getMaxListeners()](#Emitter+getMaxListeners)
        * [.listenerCount(type)](#Emitter+listenerCount) ⇒ <code>[number](#external_number)</code>
        * [.listeners(type)](#Emitter+listeners) ⇒ <code>[number](#external_number)</code>
        * [.many(type, times, listener)](#Emitter+many) ⇒ <code>[Emitter](#Emitter)</code>
        * [.off(type, listener)](#Emitter+off) ⇒ <code>[Emitter](#Emitter)</code>
        * [.on([type], listener)](#Emitter+on) ⇒ <code>[Emitter](#Emitter)</code>
        * [.once([type], listener)](#Emitter+once) ⇒ <code>[Emitter](#Emitter)</code>
        * [.setMaxListeners()](#Emitter+setMaxListeners)
        * [.tick(type, [...data])](#Emitter+tick) ⇒ <code>[Promise](#external_Promise)</code>
        * [.trigger([type], data)](#Emitter+trigger) ⇒ <code>[boolean](#external_boolean)</code>
        * [.until([type], listener)](#Emitter+until) ⇒ <code>[Emitter](#Emitter)</code>
        * [":destroy"](#Emitter+event__destroy)
        * [":off"](#Emitter+event__off)
        * [":on"](#Emitter+event__on)
        * [":maxListeners"](#Emitter+event__maxListeners)
    * _static_
        * [.defaultMaxListeners](#Emitter.defaultMaxListeners) : <code>[number](#external_number)</code>
        * [.every](#Emitter.every) : <code>[symbol](#external_symbol)</code>
        * [.version](#Emitter.version) : <code>[string](#external_string)</code>
    * _inner_
        * [~Null](#Emitter..Null) ⇐ <code>[null](#external_null)</code>
            * [new Null()](#new_Emitter..Null_new)
        * [~asEmitter](#Emitter..asEmitter)
            * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ <code>[Emitter](#Emitter)</code>
            * [.clear([type])](#Emitter..asEmitter.clear) ⇒ <code>[Emitter](#Emitter)</code>
            * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ <code>[boolean](#external_boolean)</code>
            * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
            * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ <code>[Emitter](#Emitter)</code>
            * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners)
            * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ <code>[number](#external_number)</code>
            * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ <code>[number](#external_number)</code>
            * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ <code>[Emitter](#Emitter)</code>
            * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ <code>[Emitter](#Emitter)</code>
            * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ <code>[Emitter](#Emitter)</code>
            * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ <code>[Emitter](#Emitter)</code>
            * [.setMaxListeners()](#Emitter..asEmitter.setMaxListeners)
            * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ <code>[Promise](#external_Promise)</code>
            * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ <code>[boolean](#external_boolean)</code>
            * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ <code>[Emitter](#Emitter)</code>
        * [~addConditionalEventListener(emitter, type, listener)](#Emitter..addConditionalEventListener)
        * [~addEventListener(emitter, type, listener, index)](#Emitter..addEventListener)
        * [~addFiniteEventListener(emitter, type, times, listener)](#Emitter..addFiniteEventListener)
        * [~addEventMapping(emitter, mapping)](#Emitter..addEventMapping)
        * [~defineEventsProperty(emitter)](#Emitter..defineEventsProperty)
        * [~emitAllEvents(emitter, type, data)](#Emitter..emitAllEvents) ⇒ <code>[boolean](#external_boolean)</code>
        * [~emitErrors(emitter, errors)](#Emitter..emitErrors)
        * [~emitEvent(emitter, type, data, emitEvery)](#Emitter..emitEvent) ⇒ <code>[boolean](#external_boolean)</code>
        * [~executeListener(listener, data, scope)](#Emitter..executeListener)
        * [~getEventTypes(emitter)](#Emitter..getEventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
        * [~getMaxListeners(emitter)](#Emitter..getMaxListeners) ⇒ <code>[number](#external_number)</code>
        * [~isPositiveNumber(number)](#Emitter..isPositiveNumber) ⇒ <code>[boolean](#external_boolean)</code>
        * [~listenEmpty(handler, isFunction, emitter)](#Emitter..listenEmpty)
        * [~listenOne(handler, isFunction, emitter, arg1)](#Emitter..listenOne)
        * [~listenTwo(handler, isFunction, emitter, arg1, arg2)](#Emitter..listenTwo)
        * [~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)](#Emitter..listenThree)
        * [~listenMany(handler, isFunction, emitter, args)](#Emitter..listenMany)
        * [~removeEventListener(emitter, type, listener)](#Emitter..removeEventListener)
        * [~setMaxListeners()](#Emitter..setMaxListeners)
        * [~spliceList(list, index)](#Emitter..spliceList)
        * [~toEmitter()](#Emitter..toEmitter)

<a name="new_Emitter_new"></a>

### new Emitter([mapping])
Creates an instance of emitter. If `mapping` are provided they will automatically be passed into `on()` once construction is complete.


| Param | Type | Description |
| --- | --- | --- |
| [mapping] | <code>[Object](#external_Object)</code> | A mapping of event types to event listeners. |

**Example** *(Using Emitter directly)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
```
**Example** *(Extending Emitter using Classical inheritance)*  
```js
class Greeter extends Emitter {
 constructor(){
     super();
     this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
 }

 greet( name ){
     this.emit( 'greet', name );
 }
}

const greeter = new Greeter();
greeter.greet( 'Jeff' );
// Hello, Jeff!
```
**Example** *(Extending Emitter using Prototypal inheritance)*  
```js
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
**Example** *(Namespaced events)*  
```js
const greeter = new Emitter();
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
**Example** *(Predefined events)*  
```js
const greetings = {
     hello: function( name ){ console.log( `Hello, ${name}!` ),
     hi: function( name ){ console.log( `Hi, ${name}!` )
 },
 greeter = new Emitter( greetings );

greeter.emit( 'hello', 'Aaron' );
// Hello, Aaron!
```
**Example** *(One-time events)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );
greeter.emit( 'hello', 'Terry' );
// Hello, Jeff!
```
**Example** *(Many-time events)*  
```js
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );     // 1
greeter.emit( 'hello', 'Terry' );    // 2
greeter.emit( 'hello', 'Steve' );    // 3
// Hello, Jeff!
// Hello, Terry!
```
<a name="Emitter+destroy"></a>

### emitter.destroy()
Destroys the emitter.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Emits**: <code>[:destroy](#Emitter+event__destroy)</code>  
<a name="Emitter+toJSON"></a>

### emitter.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[Object](#external_Object)</code> - An plain object representation of the emitter.  
**Example**  
```js
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
<a name="Emitter+toString"></a>

### emitter.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the emitter.  
**Example**  
```js
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
<a name="Emitter+at"></a>

### emitter.at([type], index, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[at](#Emitter..asEmitter.at)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| index | <code>[number](#external_number)</code> | Where the listener will be added in the trigger list. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter+clear"></a>

### emitter.clear([type]) ⇒ <code>[Emitter](#Emitter)</code>
Remove all listeners, or those for the specified event `type`.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[clear](#Emitter..asEmitter.clear)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>String</code> | The event type. |

**Example** *(Clearing all event types)*  
```js
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
**Example** *(Clearing a specified event type)*  
```js
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
<a name="Emitter+emit"></a>

### emitter.emit(type, [...data]) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[emit](#Emitter..asEmitter.emit)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );    // true
// Hello!
greeter.emit( 'goodbye' );  // false
```
**Example** *(Emitting an event with data)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
**Example** *(Emitting a namespaced event)*  
```js
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
<a name="Emitter+eventTypes"></a>

### emitter.eventTypes() ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[eventTypes](#Emitter..asEmitter.eventTypes)</code>  
**Returns**: <code>[Array.&lt;EventType&gt;](#EventType)</code> - The list of event types registered to the emitter.  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter+first"></a>

### emitter.first(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[first](#Emitter..asEmitter.first)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter+getMaxListeners"></a>

### emitter.getMaxListeners()
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[getMaxListeners](#Emitter..asEmitter.getMaxListeners)</code>  
<a name="Emitter+listenerCount"></a>

### emitter.listenerCount(type) ⇒ <code>[number](#external_number)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[listenerCount](#Emitter..asEmitter.listenerCount)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( greeter.listenerCount( 'hello' ) );
// 1
console.log( greeter.listenerCount( 'goodbye' ) );
// 0
```
<a name="Emitter+listeners"></a>

### emitter.listeners(type) ⇒ <code>[number](#external_number)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[listeners](#Emitter..asEmitter.listeners)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const hello = function(){
 console.log( 'Hello!' );
},
 greeter = new Emitter();

greeter.on( 'hello', hello );
greeter.emit( 'hello' );
// Hello!

console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
// true
```
<a name="Emitter+many"></a>

### emitter.many(type, times, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[many](#Emitter..asEmitter.many)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| times | <code>[number](#external_number)</code> | The number times the listener will be executed before being removed. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to any event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Greeted Jeff
greeter.emit( 'hi', 'Terry' );      // 2
// Greeted Terry
greeter.emit( 'yo', 'Steve' );      // 3
```
**Example** *(Listen to the specified event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );   // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );   // 3
```
<a name="Emitter+off"></a>

### emitter.off(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[off](#Emitter..asEmitter.off)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:off](#Emitter+event__off)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Remove a listener from any event type)*  
```js
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
**Example** *(Remove a listener from a specified event type)*  
```js
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
<a name="Emitter+on"></a>

### emitter.on([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[on](#Emitter..asEmitter.on)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to all event types)*  
```js
const greeter = new Emitter();
greeter.on( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```
**Example** *(Listener to a specified event type)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hi', 'World' );
```
<a name="Emitter+once"></a>

### emitter.once([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[once](#Emitter..asEmitter.once)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>Emitter#:maxListeners
const greeter = new Emitter();
greeter.once( () =&gt; console.log( &#x27;Greeted&#x27; ) );
greeter.emit( &#x27;hello&#x27; );
// Greeted
greeter.emit( &#x27;goodbye&#x27; );event:</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter+setMaxListeners"></a>

### emitter.setMaxListeners()
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[setMaxListeners](#Emitter..asEmitter.setMaxListeners)</code>  
<a name="Emitter+tick"></a>

### emitter.tick(type, [...data]) ⇒ <code>[Promise](#external_Promise)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns a Promise.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[tick](#Emitter..asEmitter.tick)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Asynchronously emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
// Hello!
// hello heard? true
// goodbye heard? false
```
<a name="Emitter+trigger"></a>

### emitter.trigger([type], data) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[trigger](#Emitter..asEmitter.trigger)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> |  |

**Example**  
```js
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
<a name="Emitter+until"></a>

### emitter.until([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[until](#Emitter..asEmitter.until)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example**  
```js
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
**Example**  
```js
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
<a name="Emitter+event__destroy"></a>

### ":destroy"
This event is emitted _before_ an emitter destroys itself.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter+event__off"></a>

### ":off"
This event is emitted _after_ a listener is removed.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter+event__on"></a>

### ":on"
This event is emitted _before_ a listener is added.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter+event__maxListeners"></a>

### ":maxListeners"
This event is emitted once the maximum number of listeners has been exceeded for an event type.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter.defaultMaxListeners"></a>

### Emitter.defaultMaxListeners : <code>[number](#external_number)</code>
Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.

By default Emitter will emit a `:maxListeners` event if more than 10 listeners are added to a specific event type.

**Kind**: static property of <code>[Emitter](#Emitter)</code>  
**Default**: <code>10</code>  
**Example** *(Changing the default maximum listeners)*  
```js
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
<a name="Emitter.every"></a>

### Emitter.every : <code>[symbol](#external_symbol)</code>
The symbol used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.

Using `Emitter.every` is typically not necessary.

**Kind**: static property of <code>[Emitter](#Emitter)</code>  
**Example**  
```js
const greeter = new Emitter();
greeter.on( Emitter.every, () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```
<a name="Emitter.version"></a>

### Emitter.version : <code>[string](#external_string)</code>
The current version of *Emitter.js*.

**Kind**: static property of <code>[Emitter](#Emitter)</code>  
**Example**  
```js
console.log( Emitter.version );
// 2.0.0
```
<a name="Emitter..Null"></a>

### Emitter~Null ⇐ <code>[null](#external_null)</code>
**Kind**: inner class of <code>[Emitter](#Emitter)</code>  
**Extends:** <code>[null](#external_null)</code>  
<a name="new_Emitter..Null_new"></a>

#### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="Emitter..asEmitter"></a>

### Emitter~asEmitter
**Kind**: inner mixin of <code>[Emitter](#Emitter)</code>  

* [~asEmitter](#Emitter..asEmitter)
    * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ <code>[Emitter](#Emitter)</code>
    * [.clear([type])](#Emitter..asEmitter.clear) ⇒ <code>[Emitter](#Emitter)</code>
    * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ <code>[boolean](#external_boolean)</code>
    * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
    * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ <code>[Emitter](#Emitter)</code>
    * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners)
    * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ <code>[number](#external_number)</code>
    * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ <code>[number](#external_number)</code>
    * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ <code>[Emitter](#Emitter)</code>
    * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ <code>[Emitter](#Emitter)</code>
    * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ <code>[Emitter](#Emitter)</code>
    * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ <code>[Emitter](#Emitter)</code>
    * [.setMaxListeners()](#Emitter..asEmitter.setMaxListeners)
    * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ <code>[Promise](#external_Promise)</code>
    * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ <code>[boolean](#external_boolean)</code>
    * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ <code>[Emitter](#Emitter)</code>

<a name="Emitter..asEmitter.at"></a>

#### asEmitter.at([type], index, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| index | <code>[number](#external_number)</code> | Where the listener will be added in the trigger list. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..asEmitter.clear"></a>

#### asEmitter.clear([type]) ⇒ <code>[Emitter](#Emitter)</code>
Remove all listeners, or those for the specified event `type`.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>String</code> | The event type. |

**Example** *(Clearing all event types)*  
```js
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
**Example** *(Clearing a specified event type)*  
```js
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
<a name="Emitter..asEmitter.emit"></a>

#### asEmitter.emit(type, [...data]) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );    // true
// Hello!
greeter.emit( 'goodbye' );  // false
```
**Example** *(Emitting an event with data)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
**Example** *(Emitting a namespaced event)*  
```js
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
<a name="Emitter..asEmitter.eventTypes"></a>

#### asEmitter.eventTypes() ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Array.&lt;EventType&gt;](#EventType)</code> - The list of event types registered to the emitter.  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter..asEmitter.first"></a>

#### asEmitter.first(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..asEmitter.getMaxListeners"></a>

#### asEmitter.getMaxListeners()
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
<a name="Emitter..asEmitter.listenerCount"></a>

#### asEmitter.listenerCount(type) ⇒ <code>[number](#external_number)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( greeter.listenerCount( 'hello' ) );
// 1
console.log( greeter.listenerCount( 'goodbye' ) );
// 0
```
<a name="Emitter..asEmitter.listeners"></a>

#### asEmitter.listeners(type) ⇒ <code>[number](#external_number)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const hello = function(){
 console.log( 'Hello!' );
},
 greeter = new Emitter();

greeter.on( 'hello', hello );
greeter.emit( 'hello' );
// Hello!

console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
// true
```
<a name="Emitter..asEmitter.many"></a>

#### asEmitter.many(type, times, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| times | <code>[number](#external_number)</code> | The number times the listener will be executed before being removed. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to any event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Greeted Jeff
greeter.emit( 'hi', 'Terry' );      // 2
// Greeted Terry
greeter.emit( 'yo', 'Steve' );      // 3
```
**Example** *(Listen to the specified event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );   // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );   // 3
```
<a name="Emitter..asEmitter.off"></a>

#### asEmitter.off(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:off](#Emitter+event__off)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Remove a listener from any event type)*  
```js
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
**Example** *(Remove a listener from a specified event type)*  
```js
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
<a name="Emitter..asEmitter.on"></a>

#### asEmitter.on([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to all event types)*  
```js
const greeter = new Emitter();
greeter.on( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```
**Example** *(Listener to a specified event type)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hi', 'World' );
```
<a name="Emitter..asEmitter.once"></a>

#### asEmitter.once([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>Emitter#:maxListeners
const greeter = new Emitter();
greeter.once( () =&gt; console.log( &#x27;Greeted&#x27; ) );
greeter.emit( &#x27;hello&#x27; );
// Greeted
greeter.emit( &#x27;goodbye&#x27; );event:</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter..asEmitter.setMaxListeners"></a>

#### asEmitter.setMaxListeners()
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
<a name="Emitter..asEmitter.tick"></a>

#### asEmitter.tick(type, [...data]) ⇒ <code>[Promise](#external_Promise)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns a Promise.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Asynchronously emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
// Hello!
// hello heard? true
// goodbye heard? false
```
<a name="Emitter..asEmitter.trigger"></a>

#### asEmitter.trigger([type], data) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> |  |

**Example**  
```js
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
<a name="Emitter..asEmitter.until"></a>

#### asEmitter.until([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example**  
```js
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
**Example**  
```js
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
<a name="Emitter..addConditionalEventListener"></a>

### Emitter~addConditionalEventListener(emitter, type, listener)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..addEventListener"></a>

### Emitter~addEventListener(emitter, type, listener, index)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |
| index | <code>[number](#external_number)</code> |  |

<a name="Emitter..addFiniteEventListener"></a>

### Emitter~addFiniteEventListener(emitter, type, times, listener)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| times | <code>[number](#external_number)</code> | The number times the listener will be executed before being removed. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..addEventMapping"></a>

### Emitter~addEventMapping(emitter, mapping)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| mapping | <code>[Object](#external_Object)</code> | The event mapping. |

<a name="Emitter..defineEventsProperty"></a>

### Emitter~defineEventsProperty(emitter)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the property will be created. |

<a name="Emitter..emitAllEvents"></a>

### Emitter~emitAllEvents(emitter, type, data) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not a listener for the given event type was executed.  
**Throws**:

- <code>[Error](#external_Error)</code> If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event `type` will be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> | The data to be passed with the event. |

<a name="Emitter..emitErrors"></a>

### Emitter~emitErrors(emitter, errors)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the `errors` will be emitted. |
| errors | <code>[Array.&lt;Error&gt;](#external_Error)</code> | The array of errors to be emitted. |

<a name="Emitter..emitEvent"></a>

### Emitter~emitEvent(emitter, type, data, emitEvery) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not a listener for the given event type was executed.  
**Throws**:

- <code>[Error](#external_Error)</code> If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event `type` will be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> | The data to be passed with the event. |
| emitEvery | <code>[boolean](#external_boolean)</code> | Whether or not listeners for all types will be executed. |

<a name="Emitter..executeListener"></a>

### Emitter~executeListener(listener, data, scope)
Executes a listener using the internal `execute*` functions based on the number of arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type |
| --- | --- |
| listener | <code>Array.&lt;Listener&gt;</code> &#124; <code>Listener</code> | 
| data | <code>[Array](#external_Array)</code> | 
| scope | <code>\*</code> | 

<a name="Emitter..getEventTypes"></a>

### Emitter~getEventTypes(emitter) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[Array.&lt;EventType&gt;](#EventType)</code> - The list of event types registered to the emitter.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which event types will be retrieved. |

<a name="Emitter..getMaxListeners"></a>

### Emitter~getMaxListeners(emitter) ⇒ <code>[number](#external_number)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[number](#external_number)</code> - The maximum number of listeners.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which max listeners will be retrieved. |

<a name="Emitter..isPositiveNumber"></a>

### Emitter~isPositiveNumber(number) ⇒ <code>[boolean](#external_boolean)</code>
Checks whether or not a value is a positive number.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the value is a positive number.  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>\*</code> | The value to be tested. |

<a name="Emitter..listenEmpty"></a>

### Emitter~listenEmpty(handler, isFunction, emitter)
Execute a listener with no arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |

<a name="Emitter..listenOne"></a>

### Emitter~listenOne(handler, isFunction, emitter, arg1)
Execute a listener with one argument.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| arg1 | <code>\*</code> | The first argument. |

<a name="Emitter..listenTwo"></a>

### Emitter~listenTwo(handler, isFunction, emitter, arg1, arg2)
Execute a listener with two arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |

<a name="Emitter..listenThree"></a>

### Emitter~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)
Execute a listener with three arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |
| arg3 | <code>\*</code> | The third argument. |

<a name="Emitter..listenMany"></a>

### Emitter~listenMany(handler, isFunction, emitter, args)
Execute a listener with four or more arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| args | <code>[Array](#external_Array)</code> | Four or more arguments. |

<a name="Emitter..removeEventListener"></a>

### Emitter~removeEventListener(emitter, type, listener)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..setMaxListeners"></a>

### Emitter~setMaxListeners()
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
<a name="Emitter..spliceList"></a>

### Emitter~spliceList(list, index)
Faster than `Array.prototype.splice`

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type |
| --- | --- |
| list | <code>[Array](#external_Array)</code> | 
| index | <code>[number](#external_number)</code> | 

<a name="Emitter..toEmitter"></a>

### Emitter~toEmitter()
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
<a name="Emitter"></a>

## Emitter([selection], target)
Applies the Emitter.js API to its target.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [selection] | <code>[string](#external_string)</code> &#124; <code>[Object](#external_Object)</code> | A selection of the Emitter.js API that will be applied to the `target`. |
| target | <code>exteral:Object</code> | The object to which the Emitter.js API will be applied. |

**Example** *(Applying all of the API)*  
```js
let greeter = Object.create( null );
Emitter( greeter );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
```
**Example** *(Applying a selection of the API)*  
```js
let greeter = Object.create( null );
Emitter( 'emit on off', greeter );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
```
**Example** *(Remapping a selection of the API)*  
```js
let greeter = Object.create( null );
Emitter( { fire: 'emit', addListener: 'on' }, greeter );
greeter.addListener( 'hello', () => console.log( 'Hello!' ) );
greeter.fire( 'hello' );
// Hello!
```

* [Emitter([selection], target)](#Emitter)
    * [new Emitter([mapping])](#new_Emitter_new)
    * _instance_
        * [.destroy()](#Emitter+destroy)
        * [.toJSON()](#Emitter+toJSON) ⇒ <code>[Object](#external_Object)</code>
        * [.toString()](#Emitter+toString) ⇒ <code>[string](#external_string)</code>
        * [.at([type], index, listener)](#Emitter+at) ⇒ <code>[Emitter](#Emitter)</code>
        * [.clear([type])](#Emitter+clear) ⇒ <code>[Emitter](#Emitter)</code>
        * [.emit(type, [...data])](#Emitter+emit) ⇒ <code>[boolean](#external_boolean)</code>
        * [.eventTypes()](#Emitter+eventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
        * [.first(type, listener)](#Emitter+first) ⇒ <code>[Emitter](#Emitter)</code>
        * [.getMaxListeners()](#Emitter+getMaxListeners)
        * [.listenerCount(type)](#Emitter+listenerCount) ⇒ <code>[number](#external_number)</code>
        * [.listeners(type)](#Emitter+listeners) ⇒ <code>[number](#external_number)</code>
        * [.many(type, times, listener)](#Emitter+many) ⇒ <code>[Emitter](#Emitter)</code>
        * [.off(type, listener)](#Emitter+off) ⇒ <code>[Emitter](#Emitter)</code>
        * [.on([type], listener)](#Emitter+on) ⇒ <code>[Emitter](#Emitter)</code>
        * [.once([type], listener)](#Emitter+once) ⇒ <code>[Emitter](#Emitter)</code>
        * [.setMaxListeners()](#Emitter+setMaxListeners)
        * [.tick(type, [...data])](#Emitter+tick) ⇒ <code>[Promise](#external_Promise)</code>
        * [.trigger([type], data)](#Emitter+trigger) ⇒ <code>[boolean](#external_boolean)</code>
        * [.until([type], listener)](#Emitter+until) ⇒ <code>[Emitter](#Emitter)</code>
        * [":destroy"](#Emitter+event__destroy)
        * [":off"](#Emitter+event__off)
        * [":on"](#Emitter+event__on)
        * [":maxListeners"](#Emitter+event__maxListeners)
    * _static_
        * [.defaultMaxListeners](#Emitter.defaultMaxListeners) : <code>[number](#external_number)</code>
        * [.every](#Emitter.every) : <code>[symbol](#external_symbol)</code>
        * [.version](#Emitter.version) : <code>[string](#external_string)</code>
    * _inner_
        * [~Null](#Emitter..Null) ⇐ <code>[null](#external_null)</code>
            * [new Null()](#new_Emitter..Null_new)
        * [~asEmitter](#Emitter..asEmitter)
            * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ <code>[Emitter](#Emitter)</code>
            * [.clear([type])](#Emitter..asEmitter.clear) ⇒ <code>[Emitter](#Emitter)</code>
            * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ <code>[boolean](#external_boolean)</code>
            * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
            * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ <code>[Emitter](#Emitter)</code>
            * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners)
            * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ <code>[number](#external_number)</code>
            * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ <code>[number](#external_number)</code>
            * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ <code>[Emitter](#Emitter)</code>
            * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ <code>[Emitter](#Emitter)</code>
            * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ <code>[Emitter](#Emitter)</code>
            * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ <code>[Emitter](#Emitter)</code>
            * [.setMaxListeners()](#Emitter..asEmitter.setMaxListeners)
            * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ <code>[Promise](#external_Promise)</code>
            * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ <code>[boolean](#external_boolean)</code>
            * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ <code>[Emitter](#Emitter)</code>
        * [~addConditionalEventListener(emitter, type, listener)](#Emitter..addConditionalEventListener)
        * [~addEventListener(emitter, type, listener, index)](#Emitter..addEventListener)
        * [~addFiniteEventListener(emitter, type, times, listener)](#Emitter..addFiniteEventListener)
        * [~addEventMapping(emitter, mapping)](#Emitter..addEventMapping)
        * [~defineEventsProperty(emitter)](#Emitter..defineEventsProperty)
        * [~emitAllEvents(emitter, type, data)](#Emitter..emitAllEvents) ⇒ <code>[boolean](#external_boolean)</code>
        * [~emitErrors(emitter, errors)](#Emitter..emitErrors)
        * [~emitEvent(emitter, type, data, emitEvery)](#Emitter..emitEvent) ⇒ <code>[boolean](#external_boolean)</code>
        * [~executeListener(listener, data, scope)](#Emitter..executeListener)
        * [~getEventTypes(emitter)](#Emitter..getEventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
        * [~getMaxListeners(emitter)](#Emitter..getMaxListeners) ⇒ <code>[number](#external_number)</code>
        * [~isPositiveNumber(number)](#Emitter..isPositiveNumber) ⇒ <code>[boolean](#external_boolean)</code>
        * [~listenEmpty(handler, isFunction, emitter)](#Emitter..listenEmpty)
        * [~listenOne(handler, isFunction, emitter, arg1)](#Emitter..listenOne)
        * [~listenTwo(handler, isFunction, emitter, arg1, arg2)](#Emitter..listenTwo)
        * [~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)](#Emitter..listenThree)
        * [~listenMany(handler, isFunction, emitter, args)](#Emitter..listenMany)
        * [~removeEventListener(emitter, type, listener)](#Emitter..removeEventListener)
        * [~setMaxListeners()](#Emitter..setMaxListeners)
        * [~spliceList(list, index)](#Emitter..spliceList)
        * [~toEmitter()](#Emitter..toEmitter)

<a name="new_Emitter_new"></a>

### new Emitter([mapping])
Creates an instance of emitter. If `mapping` are provided they will automatically be passed into `on()` once construction is complete.


| Param | Type | Description |
| --- | --- | --- |
| [mapping] | <code>[Object](#external_Object)</code> | A mapping of event types to event listeners. |

**Example** *(Using Emitter directly)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );
// Hello!
```
**Example** *(Extending Emitter using Classical inheritance)*  
```js
class Greeter extends Emitter {
 constructor(){
     super();
     this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
 }

 greet( name ){
     this.emit( 'greet', name );
 }
}

const greeter = new Greeter();
greeter.greet( 'Jeff' );
// Hello, Jeff!
```
**Example** *(Extending Emitter using Prototypal inheritance)*  
```js
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
**Example** *(Namespaced events)*  
```js
const greeter = new Emitter();
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
**Example** *(Predefined events)*  
```js
const greetings = {
     hello: function( name ){ console.log( `Hello, ${name}!` ),
     hi: function( name ){ console.log( `Hi, ${name}!` )
 },
 greeter = new Emitter( greetings );

greeter.emit( 'hello', 'Aaron' );
// Hello, Aaron!
```
**Example** *(One-time events)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );
greeter.emit( 'hello', 'Terry' );
// Hello, Jeff!
```
**Example** *(Many-time events)*  
```js
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );     // 1
greeter.emit( 'hello', 'Terry' );    // 2
greeter.emit( 'hello', 'Steve' );    // 3
// Hello, Jeff!
// Hello, Terry!
```
<a name="Emitter+destroy"></a>

### emitter.destroy()
Destroys the emitter.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Emits**: <code>[:destroy](#Emitter+event__destroy)</code>  
<a name="Emitter+toJSON"></a>

### emitter.toJSON() ⇒ <code>[Object](#external_Object)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[Object](#external_Object)</code> - An plain object representation of the emitter.  
**Example**  
```js
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
<a name="Emitter+toString"></a>

### emitter.toString() ⇒ <code>[string](#external_string)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[string](#external_string)</code> - A string representation of the emitter.  
**Example**  
```js
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
<a name="Emitter+at"></a>

### emitter.at([type], index, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[at](#Emitter..asEmitter.at)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| index | <code>[number](#external_number)</code> | Where the listener will be added in the trigger list. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter+clear"></a>

### emitter.clear([type]) ⇒ <code>[Emitter](#Emitter)</code>
Remove all listeners, or those for the specified event `type`.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[clear](#Emitter..asEmitter.clear)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>String</code> | The event type. |

**Example** *(Clearing all event types)*  
```js
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
**Example** *(Clearing a specified event type)*  
```js
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
<a name="Emitter+emit"></a>

### emitter.emit(type, [...data]) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[emit](#Emitter..asEmitter.emit)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );    // true
// Hello!
greeter.emit( 'goodbye' );  // false
```
**Example** *(Emitting an event with data)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
**Example** *(Emitting a namespaced event)*  
```js
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
<a name="Emitter+eventTypes"></a>

### emitter.eventTypes() ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[eventTypes](#Emitter..asEmitter.eventTypes)</code>  
**Returns**: <code>[Array.&lt;EventType&gt;](#EventType)</code> - The list of event types registered to the emitter.  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter+first"></a>

### emitter.first(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[first](#Emitter..asEmitter.first)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter+getMaxListeners"></a>

### emitter.getMaxListeners()
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[getMaxListeners](#Emitter..asEmitter.getMaxListeners)</code>  
<a name="Emitter+listenerCount"></a>

### emitter.listenerCount(type) ⇒ <code>[number](#external_number)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[listenerCount](#Emitter..asEmitter.listenerCount)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( greeter.listenerCount( 'hello' ) );
// 1
console.log( greeter.listenerCount( 'goodbye' ) );
// 0
```
<a name="Emitter+listeners"></a>

### emitter.listeners(type) ⇒ <code>[number](#external_number)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[listeners](#Emitter..asEmitter.listeners)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const hello = function(){
 console.log( 'Hello!' );
},
 greeter = new Emitter();

greeter.on( 'hello', hello );
greeter.emit( 'hello' );
// Hello!

console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
// true
```
<a name="Emitter+many"></a>

### emitter.many(type, times, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[many](#Emitter..asEmitter.many)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| times | <code>[number](#external_number)</code> | The number times the listener will be executed before being removed. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to any event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Greeted Jeff
greeter.emit( 'hi', 'Terry' );      // 2
// Greeted Terry
greeter.emit( 'yo', 'Steve' );      // 3
```
**Example** *(Listen to the specified event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );   // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );   // 3
```
<a name="Emitter+off"></a>

### emitter.off(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[off](#Emitter..asEmitter.off)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:off](#Emitter+event__off)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Remove a listener from any event type)*  
```js
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
**Example** *(Remove a listener from a specified event type)*  
```js
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
<a name="Emitter+on"></a>

### emitter.on([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[on](#Emitter..asEmitter.on)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to all event types)*  
```js
const greeter = new Emitter();
greeter.on( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```
**Example** *(Listener to a specified event type)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hi', 'World' );
```
<a name="Emitter+once"></a>

### emitter.once([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[once](#Emitter..asEmitter.once)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>Emitter#:maxListeners
const greeter = new Emitter();
greeter.once( () =&gt; console.log( &#x27;Greeted&#x27; ) );
greeter.emit( &#x27;hello&#x27; );
// Greeted
greeter.emit( &#x27;goodbye&#x27; );event:</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter+setMaxListeners"></a>

### emitter.setMaxListeners()
**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[setMaxListeners](#Emitter..asEmitter.setMaxListeners)</code>  
<a name="Emitter+tick"></a>

### emitter.tick(type, [...data]) ⇒ <code>[Promise](#external_Promise)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns a Promise.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[tick](#Emitter..asEmitter.tick)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Asynchronously emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
// Hello!
// hello heard? true
// goodbye heard? false
```
<a name="Emitter+trigger"></a>

### emitter.trigger([type], data) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[trigger](#Emitter..asEmitter.trigger)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> |  |

**Example**  
```js
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
<a name="Emitter+until"></a>

### emitter.until([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of <code>[Emitter](#Emitter)</code>  
**Mixes**: <code>[until](#Emitter..asEmitter.until)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example**  
```js
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
**Example**  
```js
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
<a name="Emitter+event__destroy"></a>

### ":destroy"
This event is emitted _before_ an emitter destroys itself.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter+event__off"></a>

### ":off"
This event is emitted _after_ a listener is removed.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter+event__on"></a>

### ":on"
This event is emitted _before_ a listener is added.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter+event__maxListeners"></a>

### ":maxListeners"
This event is emitted once the maximum number of listeners has been exceeded for an event type.

**Kind**: event emitted by <code>[Emitter](#Emitter)</code>  
<a name="Emitter.defaultMaxListeners"></a>

### Emitter.defaultMaxListeners : <code>[number](#external_number)</code>
Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.

By default Emitter will emit a `:maxListeners` event if more than 10 listeners are added to a specific event type.

**Kind**: static property of <code>[Emitter](#Emitter)</code>  
**Default**: <code>10</code>  
**Example** *(Changing the default maximum listeners)*  
```js
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
<a name="Emitter.every"></a>

### Emitter.every : <code>[symbol](#external_symbol)</code>
The symbol used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.

Using `Emitter.every` is typically not necessary.

**Kind**: static property of <code>[Emitter](#Emitter)</code>  
**Example**  
```js
const greeter = new Emitter();
greeter.on( Emitter.every, () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```
<a name="Emitter.version"></a>

### Emitter.version : <code>[string](#external_string)</code>
The current version of *Emitter.js*.

**Kind**: static property of <code>[Emitter](#Emitter)</code>  
**Example**  
```js
console.log( Emitter.version );
// 2.0.0
```
<a name="Emitter..Null"></a>

### Emitter~Null ⇐ <code>[null](#external_null)</code>
**Kind**: inner class of <code>[Emitter](#Emitter)</code>  
**Extends:** <code>[null](#external_null)</code>  
<a name="new_Emitter..Null_new"></a>

#### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="Emitter..asEmitter"></a>

### Emitter~asEmitter
**Kind**: inner mixin of <code>[Emitter](#Emitter)</code>  

* [~asEmitter](#Emitter..asEmitter)
    * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ <code>[Emitter](#Emitter)</code>
    * [.clear([type])](#Emitter..asEmitter.clear) ⇒ <code>[Emitter](#Emitter)</code>
    * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ <code>[boolean](#external_boolean)</code>
    * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
    * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ <code>[Emitter](#Emitter)</code>
    * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners)
    * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ <code>[number](#external_number)</code>
    * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ <code>[number](#external_number)</code>
    * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ <code>[Emitter](#Emitter)</code>
    * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ <code>[Emitter](#Emitter)</code>
    * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ <code>[Emitter](#Emitter)</code>
    * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ <code>[Emitter](#Emitter)</code>
    * [.setMaxListeners()](#Emitter..asEmitter.setMaxListeners)
    * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ <code>[Promise](#external_Promise)</code>
    * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ <code>[boolean](#external_boolean)</code>
    * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ <code>[Emitter](#Emitter)</code>

<a name="Emitter..asEmitter.at"></a>

#### asEmitter.at([type], index, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| index | <code>[number](#external_number)</code> | Where the listener will be added in the trigger list. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..asEmitter.clear"></a>

#### asEmitter.clear([type]) ⇒ <code>[Emitter](#Emitter)</code>
Remove all listeners, or those for the specified event `type`.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>String</code> | The event type. |

**Example** *(Clearing all event types)*  
```js
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
**Example** *(Clearing a specified event type)*  
```js
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
<a name="Emitter..asEmitter.emit"></a>

#### asEmitter.emit(type, [...data]) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emit( 'hello' );    // true
// Hello!
greeter.emit( 'goodbye' );  // false
```
**Example** *(Emitting an event with data)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
**Example** *(Emitting a namespaced event)*  
```js
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
<a name="Emitter..asEmitter.eventTypes"></a>

#### asEmitter.eventTypes() ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Array.&lt;EventType&gt;](#EventType)</code> - The list of event types registered to the emitter.  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter..asEmitter.first"></a>

#### asEmitter.first(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..asEmitter.getMaxListeners"></a>

#### asEmitter.getMaxListeners()
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
<a name="Emitter..asEmitter.listenerCount"></a>

#### asEmitter.listenerCount(type) ⇒ <code>[number](#external_number)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
console.log( greeter.listenerCount( 'hello' ) );
// 1
console.log( greeter.listenerCount( 'goodbye' ) );
// 0
```
<a name="Emitter..asEmitter.listeners"></a>

#### asEmitter.listeners(type) ⇒ <code>[number](#external_number)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[number](#external_number)</code> - The number of listeners for that event type within the given emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |

**Example**  
```js
const hello = function(){
 console.log( 'Hello!' );
},
 greeter = new Emitter();

greeter.on( 'hello', hello );
greeter.emit( 'hello' );
// Hello!

console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
// true
```
<a name="Emitter..asEmitter.many"></a>

#### asEmitter.many(type, times, listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| times | <code>[number](#external_number)</code> | The number times the listener will be executed before being removed. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to any event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Greeted Jeff
greeter.emit( 'hi', 'Terry' );      // 2
// Greeted Terry
greeter.emit( 'yo', 'Steve' );      // 3
```
**Example** *(Listen to the specified event type a set number of times)*  
```js
const greeter = new Emitter();
greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'Jeff' );    // 1
// Hello, Jeff!
greeter.emit( 'hello', 'Terry' );   // 2
// Hello, Terry!
greeter.emit( 'hello', 'Steve' );   // 3
```
<a name="Emitter..asEmitter.off"></a>

#### asEmitter.off(type, listener) ⇒ <code>[Emitter](#Emitter)</code>
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:off](#Emitter+event__off)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Remove a listener from any event type)*  
```js
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
**Example** *(Remove a listener from a specified event type)*  
```js
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
<a name="Emitter..asEmitter.on"></a>

#### asEmitter.on([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>[:maxListeners](#Emitter+event__maxListeners)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen to all event types)*  
```js
const greeter = new Emitter();
greeter.on( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
// Greeted
```
**Example** *(Listener to a specified event type)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hi', 'World' );
```
<a name="Emitter..asEmitter.once"></a>

#### asEmitter.once([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  
**Emits**: <code>[:on](#Emitter+event__on)</code>, <code>Emitter#:maxListeners
const greeter = new Emitter();
greeter.once( () =&gt; console.log( &#x27;Greeted&#x27; ) );
greeter.emit( &#x27;hello&#x27; );
// Greeted
greeter.emit( &#x27;goodbye&#x27; );event:</code>  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter..asEmitter.setMaxListeners"></a>

#### asEmitter.setMaxListeners()
**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
<a name="Emitter..asEmitter.tick"></a>

#### asEmitter.tick(type, [...data]) ⇒ <code>[Promise](#external_Promise)</code>
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns a Promise.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>[EventType](#EventType)</code> | The event type. |
| [...data] | <code>\*</code> | The data passed into the listeners. |

**Example** *(Asynchronously emitting an event)*  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
// Hello!
// hello heard? true
// goodbye heard? false
```
<a name="Emitter..asEmitter.trigger"></a>

#### asEmitter.trigger([type], data) ⇒ <code>[boolean](#external_boolean)</code>
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the event had listeners.
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> |  |

**Example**  
```js
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
<a name="Emitter..asEmitter.until"></a>

#### asEmitter.until([type], listener) ⇒ <code>[Emitter](#Emitter)</code>
Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of <code>[asEmitter](#Emitter..asEmitter)</code>  
**Returns**: <code>[Emitter](#Emitter)</code> - The emitter.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

**Example**  
```js
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
**Example**  
```js
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
<a name="Emitter..addConditionalEventListener"></a>

### Emitter~addConditionalEventListener(emitter, type, listener)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..addEventListener"></a>

### Emitter~addEventListener(emitter, type, listener, index)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |
| index | <code>[number](#external_number)</code> |  |

<a name="Emitter..addFiniteEventListener"></a>

### Emitter~addFiniteEventListener(emitter, type, times, listener)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| times | <code>[number](#external_number)</code> | The number times the listener will be executed before being removed. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..addEventMapping"></a>

### Emitter~addEventMapping(emitter, mapping)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| mapping | <code>[Object](#external_Object)</code> | The event mapping. |

<a name="Emitter..defineEventsProperty"></a>

### Emitter~defineEventsProperty(emitter)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the property will be created. |

<a name="Emitter..emitAllEvents"></a>

### Emitter~emitAllEvents(emitter, type, data) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not a listener for the given event type was executed.  
**Throws**:

- <code>[Error](#external_Error)</code> If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event `type` will be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> | The data to be passed with the event. |

<a name="Emitter..emitErrors"></a>

### Emitter~emitErrors(emitter, errors)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the `errors` will be emitted. |
| errors | <code>[Array.&lt;Error&gt;](#external_Error)</code> | The array of errors to be emitted. |

<a name="Emitter..emitEvent"></a>

### Emitter~emitEvent(emitter, type, data, emitEvery) ⇒ <code>[boolean](#external_boolean)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not a listener for the given event type was executed.  
**Throws**:

- <code>[Error](#external_Error)</code> If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event `type` will be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| data | <code>[Array](#external_Array)</code> | The data to be passed with the event. |
| emitEvery | <code>[boolean](#external_boolean)</code> | Whether or not listeners for all types will be executed. |

<a name="Emitter..executeListener"></a>

### Emitter~executeListener(listener, data, scope)
Executes a listener using the internal `execute*` functions based on the number of arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type |
| --- | --- |
| listener | <code>Array.&lt;Listener&gt;</code> &#124; <code>Listener</code> | 
| data | <code>[Array](#external_Array)</code> | 
| scope | <code>\*</code> | 

<a name="Emitter..getEventTypes"></a>

### Emitter~getEventTypes(emitter) ⇒ <code>[Array.&lt;EventType&gt;](#EventType)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[Array.&lt;EventType&gt;](#EventType)</code> - The list of event types registered to the emitter.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which event types will be retrieved. |

<a name="Emitter..getMaxListeners"></a>

### Emitter~getMaxListeners(emitter) ⇒ <code>[number](#external_number)</code>
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[number](#external_number)</code> - The maximum number of listeners.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which max listeners will be retrieved. |

<a name="Emitter..isPositiveNumber"></a>

### Emitter~isPositiveNumber(number) ⇒ <code>[boolean](#external_boolean)</code>
Checks whether or not a value is a positive number.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
**Returns**: <code>[boolean](#external_boolean)</code> - Whether or not the value is a positive number.  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>\*</code> | The value to be tested. |

<a name="Emitter..listenEmpty"></a>

### Emitter~listenEmpty(handler, isFunction, emitter)
Execute a listener with no arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |

<a name="Emitter..listenOne"></a>

### Emitter~listenOne(handler, isFunction, emitter, arg1)
Execute a listener with one argument.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| arg1 | <code>\*</code> | The first argument. |

<a name="Emitter..listenTwo"></a>

### Emitter~listenTwo(handler, isFunction, emitter, arg1, arg2)
Execute a listener with two arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |

<a name="Emitter..listenThree"></a>

### Emitter~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)
Execute a listener with three arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |
| arg3 | <code>\*</code> | The third argument. |

<a name="Emitter..listenMany"></a>

### Emitter~listenMany(handler, isFunction, emitter, args)
Execute a listener with four or more arguments.

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>[EventListener](#EventListener)</code> &#124; <code>[Array.&lt;EventListener&gt;](#EventListener)</code> | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | <code>[boolean](#external_boolean)</code> | Whether or not the `handler` is a [function](#external_Function). |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter. |
| args | <code>[Array](#external_Array)</code> | Four or more arguments. |

<a name="Emitter..removeEventListener"></a>

### Emitter~removeEventListener(emitter, type, listener)
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type | Description |
| --- | --- | --- |
| emitter | <code>[Emitter](#Emitter)</code> | The emitter on which the event would be emitted. |
| type | <code>[EventType](#EventType)</code> | The event type. |
| listener | <code>[EventListener](#EventListener)</code> | The event callback. |

<a name="Emitter..setMaxListeners"></a>

### Emitter~setMaxListeners()
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
<a name="Emitter..spliceList"></a>

### Emitter~spliceList(list, index)
Faster than `Array.prototype.splice`

**Kind**: inner method of <code>[Emitter](#Emitter)</code>  

| Param | Type |
| --- | --- |
| list | <code>[Array](#external_Array)</code> | 
| index | <code>[number](#external_number)</code> | 

<a name="Emitter..toEmitter"></a>

### Emitter~toEmitter()
**Kind**: inner method of <code>[Emitter](#Emitter)</code>  
<a name="EventType"></a>

## EventType : <code>[string](#external_string)</code> &#124; <code>[symbol](#external_symbol)</code>
A [string](#external_string) or [symbol](#external_symbol) that represents the type of event fired by the Emitter.

**Kind**: global typedef  
<a name="EventListener"></a>

## EventListener : <code>[Function](#external_Function)</code>
A [Function](#external_Function) bound to an emitter [EventType](#EventType). Any data transmitted with the event will be passed into the listener as arguments.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| ...data | <code>\*</code> | The arguments passed by the `emit`. |

<a name="external_Array"></a>

## Array
JavaScript Array

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)  
<a name="external_boolean"></a>

## boolean
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Prm454mun3!imitive) boolean

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)  
<a name="external_Error"></a>

## Error
JavaScript Error

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)  
<a name="external_Function"></a>

## Function
JavaScript Function

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)  
<a name="external_number"></a>

## number
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) number

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)  
<a name="external_null"></a>

## null
JavaScript null

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)  
<a name="external_Object"></a>

## Object
JavaScript Object

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)  
<a name="external_Promise"></a>

## Promise
JavaScript Promise

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)  
<a name="external_string"></a>

## string
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) string

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)  
<a name="external_symbol"></a>

## symbol
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) symbol

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)  
