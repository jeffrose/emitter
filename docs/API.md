## Classes

<dl>
<dt><a href="#Emitter">Emitter</a> ⇐ <code><a href="#Emitter..Null">Null</a></code></dt>
<dd><p>An object that emits named events which cause functions to be executed.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#Emitter">Emitter([selection], target)</a></dt>
<dd><p>Applies the Emitter.js API to the target.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#APIReference">APIReference</a> : <code><a href="#external_string">string</a></code> | <code><a href="#external_Object">Object</a></code></dt>
<dd><p>A set of method references to the Emitter.js API.</p>
</dd>
<dt><a href="#EventListener">EventListener</a> : <code><a href="#external_Function">Function</a></code></dt>
<dd><p>A <a href="#external_Function"> function</a> bound to an emitter <a href="#EventType">event type</a>. Any data transmitted with the event will be passed into the listener as arguments.</p>
</dd>
<dt><a href="#EventMapping">EventMapping</a> : <code><a href="#external_Object">Object</a></code></dt>
<dd><p>An <a href="#external_Object">object</a> that maps <a href="#EventType">event types</a> to <a href="#EventListener">event listeners</a>.</p>
</dd>
<dt><a href="#EventType">EventType</a> : <code><a href="#external_string">string</a></code> | <code><a href="#external_symbol">symbol</a></code></dt>
<dd><p>A <a href="#external_string">string</a> or <a href="#external_symbol">symbol</a> that represents the type of event fired by the Emitter. Values other than a <code>string</code> or a <code>symbol</code> are coerced to a <code>string</code>, since they are used as the keys of the event registry.</p>
</dd>
</dl>

## External

<dl>
<dt><a href="#external_Array">Array</a></dt>
<dd><p>JavaScript Array</p>
</dd>
<dt><a href="#external_boolean">boolean</a></dt>
<dd><p>JavaScript <a href="https://developer.mozilla.org/en-US/docs/Glossary/Primitive">primitive</a> boolean</p>
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

## Emitter ⇐ [<code>Null</code>](#Emitter..Null)
An object that emits named events which cause functions to be executed.

**Kind**: global class  
**Extends**: [<code>Null</code>](#Emitter..Null)  
**Mixes**: [<code>asEmitter</code>](#Emitter..asEmitter)  
**See**: [https://github.com/nodejs/node/blob/main/lib/events.js](https://github.com/nodejs/node/blob/main/lib/events.js)  
**Since**: 1.0.0  

* [Emitter](#Emitter) ⇐ [<code>Null</code>](#Emitter..Null)
    * [new Emitter([mapping])](#new_Emitter_new)
    * _instance_
        * [.maxListeners](#Emitter+maxListeners) : [<code>number</code>](#external_number)
        * [.destroy()](#Emitter+destroy)
        * [.toJSON()](#Emitter+toJSON) ⇒ [<code>Object</code>](#external_Object)
        * [.toString()](#Emitter+toString) ⇒ [<code>string</code>](#external_string)
        * [.at([type], index, listener)](#Emitter+at) ⇒ [<code>Emitter</code>](#Emitter)
        * [.clear([type])](#Emitter+clear) ⇒ [<code>Emitter</code>](#Emitter)
        * [.emit(type, [...data])](#Emitter+emit) ⇒ [<code>boolean</code>](#external_boolean)
        * [.eventTypes()](#Emitter+eventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
        * [.first(type, listener)](#Emitter+first) ⇒ [<code>Emitter</code>](#Emitter)
        * [.getMaxListeners()](#Emitter+getMaxListeners) ⇒ [<code>number</code>](#external_number)
        * [.listenerCount(type)](#Emitter+listenerCount) ⇒ [<code>number</code>](#external_number)
        * [.listeners(type)](#Emitter+listeners) ⇒ [<code>number</code>](#external_number)
        * [.many(type, times, listener)](#Emitter+many) ⇒ [<code>Emitter</code>](#Emitter)
        * [.off(type, listener)](#Emitter+off) ⇒ [<code>Emitter</code>](#Emitter)
        * [.on([type], listener)](#Emitter+on) ⇒ [<code>Emitter</code>](#Emitter)
        * [.once([type], listener)](#Emitter+once) ⇒ [<code>Emitter</code>](#Emitter)
        * [.setMaxListeners(max)](#Emitter+setMaxListeners) ⇒ [<code>Emitter</code>](#Emitter)
        * [.tick(type, [...data])](#Emitter+tick) ⇒ [<code>Promise</code>](#external_Promise)
        * [.trigger([type], data)](#Emitter+trigger) ⇒ [<code>boolean</code>](#external_boolean)
        * [.until([type], listener)](#Emitter+until) ⇒ [<code>Emitter</code>](#Emitter)
        * [":destroy"](#Emitter+event__destroy)
        * [":off"](#Emitter+event__off)
        * [":on"](#Emitter+event__on)
        * [":maxListeners"](#Emitter+event__maxListeners)
    * _static_
        * [.defaultMaxListeners](#Emitter.defaultMaxListeners) : [<code>number</code>](#external_number)
        * [.every](#Emitter.every) : [<code>symbol</code>](#external_symbol)
        * [.version](#Emitter.version) : [<code>string</code>](#external_string)
    * _inner_
        * [~Null](#Emitter..Null) ⇐ [<code>null</code>](#external_null)
            * [new Null()](#new_Emitter..Null_new)
        * [~asEmitter](#Emitter..asEmitter)
            * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ [<code>Emitter</code>](#Emitter)
            * [.clear([type])](#Emitter..asEmitter.clear) ⇒ [<code>Emitter</code>](#Emitter)
            * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ [<code>boolean</code>](#external_boolean)
            * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
            * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ [<code>Emitter</code>](#Emitter)
            * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners) ⇒ [<code>number</code>](#external_number)
            * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ [<code>number</code>](#external_number)
            * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ [<code>number</code>](#external_number)
            * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ [<code>Emitter</code>](#Emitter)
            * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ [<code>Emitter</code>](#Emitter)
            * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ [<code>Emitter</code>](#Emitter)
            * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ [<code>Emitter</code>](#Emitter)
            * [.setMaxListeners(max)](#Emitter..asEmitter.setMaxListeners) ⇒ [<code>Emitter</code>](#Emitter)
            * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ [<code>Promise</code>](#external_Promise)
            * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ [<code>boolean</code>](#external_boolean)
            * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ [<code>Emitter</code>](#Emitter)
        * [~addConditionalEventListener(emitter, type, listener)](#Emitter..addConditionalEventListener)
        * [~addEventListener(emitter, type, listener, index)](#Emitter..addEventListener)
        * [~warnMaxListeners(emitter, type, listener)](#Emitter..warnMaxListeners)
        * [~hasWarned(emitter, type)](#Emitter..hasWarned) ⇒ [<code>boolean</code>](#external_boolean)
        * [~markWarned(emitter, type)](#Emitter..markWarned)
        * [~resetWarned(emitter, [type])](#Emitter..resetWarned)
        * [~addFiniteEventListener(emitter, type, times, listener)](#Emitter..addFiniteEventListener)
        * [~addEventMapping(emitter, mapping)](#Emitter..addEventMapping)
        * [~defineEventsProperty(emitter)](#Emitter..defineEventsProperty)
        * [~emitAllEvents(emitter, type, data)](#Emitter..emitAllEvents) ⇒ [<code>boolean</code>](#external_boolean)
        * [~emitErrors(emitter, errors)](#Emitter..emitErrors)
        * [~emitEvent(emitter, type, data, emitEvery)](#Emitter..emitEvent) ⇒ [<code>boolean</code>](#external_boolean)
        * [~executeListener(listener, data, scope)](#Emitter..executeListener)
        * [~getEventTypes(emitter)](#Emitter..getEventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
        * [~getMaxListeners(emitter)](#Emitter..getMaxListeners) ⇒ [<code>number</code>](#external_number)
        * [~isPositiveNumber(number)](#Emitter..isPositiveNumber) ⇒ [<code>boolean</code>](#external_boolean)
        * [~listenEmpty(handler, isFunction, emitter)](#Emitter..listenEmpty)
        * [~listenOne(handler, isFunction, emitter, arg1)](#Emitter..listenOne)
        * [~listenTwo(handler, isFunction, emitter, arg1, arg2)](#Emitter..listenTwo)
        * [~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)](#Emitter..listenThree)
        * [~listenMany(handler, isFunction, emitter, args)](#Emitter..listenMany)
        * [~removeEventListener(emitter, type, listener)](#Emitter..removeEventListener)
        * [~setMaxListeners(The, max)](#Emitter..setMaxListeners)
        * [~spliceList(list, index)](#Emitter..spliceList)
        * [~tick(callback)](#Emitter..tick)
        * [~tickAllEvents(emitter, type, data)](#Emitter..tickAllEvents) ⇒ [<code>Promise</code>](#external_Promise)
        * [~toEmitter([selection], target)](#Emitter..toEmitter)

<a name="new_Emitter_new"></a>

### new Emitter([mapping])
Creates an instance of emitter. If `mapping` are provided they will automatically be passed into `on()` once construction is complete.

Emitter can be extended, either with the `class` syntax or with a constructor function. The parent constructor must be executed before any listeners are subscribed, which is done with `super()` in a `class` and with `Emitter.call( this )` in a constructor function.


| Param | Type | Description |
| --- | --- | --- |
| [mapping] | [<code>EventMapping</code>](#EventMapping) | A mapping of event types to event listeners. |

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
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );
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
     hello: function( name ){ console.log( `Hello, ${ name }!` ); },
     hi: function( name ){ console.log( `Hi, ${ name }!` ); }
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
<a name="Emitter+maxListeners"></a>

### emitter.maxListeners : [<code>number</code>](#external_number)
By default Emitters will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This property allows that to be changed. Set to **0** for unlimited.

**Kind**: instance property of [<code>Emitter</code>](#Emitter)  
**Since**: 1.0.0  
**Example**  
```js
const greeter = new Emitter();

console.log( greeter.maxListeners );
// 10

greeter.maxListeners = 1;

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```
<a name="Emitter+destroy"></a>

### emitter.destroy()
Destroys the emitter.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Emits**: [<code>:destroy</code>](#Emitter+event__destroy)  
**Since**: 1.0.0  
<a name="Emitter+toJSON"></a>

### emitter.toJSON() ⇒ [<code>Object</code>](#external_Object)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>Object</code>](#external_Object) - A plain object representation of the emitter.  
**Since**: 1.3.0  
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

### emitter.toString() ⇒ [<code>string</code>](#external_string)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>string</code>](#external_string) - A string representation of the emitter.  
**Since**: 1.3.0  
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

### emitter.at([type], index, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>at</code>](#Emitter..asEmitter.at)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| index | [<code>number</code>](#external_number) | Where the listener will be added in the trigger list. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter+clear"></a>

### emitter.clear([type]) ⇒ [<code>Emitter</code>](#Emitter)
Remove all listeners, or those for the specified event `type`.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>clear</code>](#Emitter..asEmitter.clear)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>string</code>](#external_string) | The event type. |

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

### emitter.emit(type, [...data]) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>emit</code>](#Emitter..asEmitter.emit)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

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

### emitter.eventTypes() ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>eventTypes</code>](#Emitter..asEmitter.eventTypes)  
**Returns**: [<code>Array.&lt;EventType&gt;</code>](#EventType) - The list of event types registered to the emitter.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter+first"></a>

### emitter.first(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>first</code>](#Emitter..asEmitter.first)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter+getMaxListeners"></a>

### emitter.getMaxListeners() ⇒ [<code>number</code>](#external_number)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method returns the current value.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>getMaxListeners</code>](#Emitter..asEmitter.getMaxListeners)  
**Returns**: [<code>number</code>](#external_number) - The maximum number of listeners.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();

console.log( greeter.getMaxListeners() );
// 10

greeter.setMaxListeners( 5 );

console.log( greeter.getMaxListeners() );
// 5
```
<a name="Emitter+listenerCount"></a>

### emitter.listenerCount(type) ⇒ [<code>number</code>](#external_number)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>listenerCount</code>](#Emitter..asEmitter.listenerCount)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

### emitter.listeners(type) ⇒ [<code>number</code>](#external_number)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>listeners</code>](#Emitter..asEmitter.listeners)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

### emitter.many(type, times, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

The `times` must be a positive number. A listener for `0` times is never executed and is not added.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>many</code>](#Emitter..asEmitter.many)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| times | [<code>number</code>](#external_number) | The number times the listener will be executed before being removed. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

### emitter.off(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>off</code>](#Emitter..asEmitter.off)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:off</code>](#Emitter+event__off)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

### emitter.on([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>on</code>](#Emitter..asEmitter.on)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

### emitter.once([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>once</code>](#Emitter..asEmitter.once)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

**Example** *(Listen once to any event type)*  
```js
const greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
```
**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter+setMaxListeners"></a>

### emitter.setMaxListeners(max) ⇒ [<code>Emitter</code>](#Emitter)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method allows that to be changed. Set to **0** for unlimited.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>setMaxListeners</code>](#Emitter..asEmitter.setMaxListeners)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| max | [<code>number</code>](#external_number) | The maximum number of listeners before a warning is issued. |

**Example**  
```js
const greeter = new Emitter();

greeter.setMaxListeners( 1 );

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```
<a name="Emitter+tick"></a>

### emitter.tick(type, [...data]) ⇒ [<code>Promise</code>](#external_Promise)
Asynchronously emits specified event `type` with the supplied arguments. The listeners will still be synchronously executed in the specified order.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns [promise](#external_Promise) which *resolves* if the event had listeners, *rejects* otherwise.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>tick</code>](#Emitter..asEmitter.tick)  
**Returns**: [<code>Promise</code>](#external_Promise) - A promise which *resolves* if the event had listeners, *rejects* otherwise.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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

### emitter.trigger([type], data) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>trigger</code>](#Emitter..asEmitter.trigger)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) |  |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!
```
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

greeter.trigger( 'greeting:hi', [ 'Mark' ] );
// Hi, Mark!
// Mark was greeted.

greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
// Hello, Jeff!
// Jeff was greeted.
```
<a name="Emitter+until"></a>

### emitter.until([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>until</code>](#Emitter..asEmitter.until)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.2.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter+event__off"></a>

### ":off"
This event is emitted _after_ a listener is removed.

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter+event__on"></a>

### ":on"
This event is emitted _before_ a listener is added.

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter+event__maxListeners"></a>

### ":maxListeners"
This event is emitted once the maximum number of listeners has been exceeded for an event type. It is emitted at most once per event `type`, until the listeners for that `type` are cleared.

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter.defaultMaxListeners"></a>

### Emitter.defaultMaxListeners : [<code>number</code>](#external_number)
Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.

By default Emitter will emit a `:maxListeners` event if more than 10 listeners are added to a specific event type.

**Kind**: static property of [<code>Emitter</code>](#Emitter)  
**Default**: <code>10</code>  
**Since**: 1.0.0  
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

### Emitter.every : [<code>symbol</code>](#external_symbol)
An id used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.

Listener bound to every event will **not** execute for Emitter lifecycle events, like `:maxListeners`.

Using `Emitter.every` is typically not necessary.

**Kind**: static property of [<code>Emitter</code>](#Emitter)  
**Since**: 1.0.0  
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

### Emitter.version : [<code>string</code>](#external_string)
The current version of *Emitter.js*.

**Kind**: static property of [<code>Emitter</code>](#Emitter)  
**Since**: 1.1.2  
**Example**  
```js
console.log( Emitter.version );
// 2.1.0
```
<a name="Emitter..Null"></a>

### Emitter~Null ⇐ [<code>null</code>](#external_null)
**Kind**: inner class of [<code>Emitter</code>](#Emitter)  
**Extends**: [<code>null</code>](#external_null)  
<a name="new_Emitter..Null_new"></a>

#### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="Emitter..asEmitter"></a>

### Emitter~asEmitter
A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, `toString()`, and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.

Like all functional mixins, this should be executed with [call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or [apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).

**Kind**: inner mixin of [<code>Emitter</code>](#Emitter)  
**Since**: 1.1.0  
**Example** *(Applying Emitter functionality)*  
```js
// Create a base object
const greeter = Object.create( null );

// Apply the mixin with the public API
Emitter( greeter );

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
**Example** *(Applying chaos to your world)*  
```js
// NO!!!
asEmitter(); // Madness ensues
```

* [~asEmitter](#Emitter..asEmitter)
    * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ [<code>Emitter</code>](#Emitter)
    * [.clear([type])](#Emitter..asEmitter.clear) ⇒ [<code>Emitter</code>](#Emitter)
    * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ [<code>boolean</code>](#external_boolean)
    * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
    * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ [<code>Emitter</code>](#Emitter)
    * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners) ⇒ [<code>number</code>](#external_number)
    * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ [<code>number</code>](#external_number)
    * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ [<code>number</code>](#external_number)
    * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ [<code>Emitter</code>](#Emitter)
    * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ [<code>Emitter</code>](#Emitter)
    * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ [<code>Emitter</code>](#Emitter)
    * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ [<code>Emitter</code>](#Emitter)
    * [.setMaxListeners(max)](#Emitter..asEmitter.setMaxListeners) ⇒ [<code>Emitter</code>](#Emitter)
    * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ [<code>Promise</code>](#external_Promise)
    * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ [<code>boolean</code>](#external_boolean)
    * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ [<code>Emitter</code>](#Emitter)

<a name="Emitter..asEmitter.at"></a>

#### asEmitter.at([type], index, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| index | [<code>number</code>](#external_number) | Where the listener will be added in the trigger list. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..asEmitter.clear"></a>

#### asEmitter.clear([type]) ⇒ [<code>Emitter</code>](#Emitter)
Remove all listeners, or those for the specified event `type`.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>string</code>](#external_string) | The event type. |

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

#### asEmitter.emit(type, [...data]) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

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

#### asEmitter.eventTypes() ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Array.&lt;EventType&gt;</code>](#EventType) - The list of event types registered to the emitter.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter..asEmitter.first"></a>

#### asEmitter.first(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..asEmitter.getMaxListeners"></a>

#### asEmitter.getMaxListeners() ⇒ [<code>number</code>](#external_number)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method returns the current value.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>number</code>](#external_number) - The maximum number of listeners.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();

console.log( greeter.getMaxListeners() );
// 10

greeter.setMaxListeners( 5 );

console.log( greeter.getMaxListeners() );
// 5
```
<a name="Emitter..asEmitter.listenerCount"></a>

#### asEmitter.listenerCount(type) ⇒ [<code>number</code>](#external_number)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

#### asEmitter.listeners(type) ⇒ [<code>number</code>](#external_number)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

#### asEmitter.many(type, times, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

The `times` must be a positive number. A listener for `0` times is never executed and is not added.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| times | [<code>number</code>](#external_number) | The number times the listener will be executed before being removed. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

#### asEmitter.off(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:off</code>](#Emitter+event__off)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

#### asEmitter.on([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

#### asEmitter.once([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

**Example** *(Listen once to any event type)*  
```js
const greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
```
**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter..asEmitter.setMaxListeners"></a>

#### asEmitter.setMaxListeners(max) ⇒ [<code>Emitter</code>](#Emitter)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method allows that to be changed. Set to **0** for unlimited.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| max | [<code>number</code>](#external_number) | The maximum number of listeners before a warning is issued. |

**Example**  
```js
const greeter = new Emitter();

greeter.setMaxListeners( 1 );

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```
<a name="Emitter..asEmitter.tick"></a>

#### asEmitter.tick(type, [...data]) ⇒ [<code>Promise</code>](#external_Promise)
Asynchronously emits specified event `type` with the supplied arguments. The listeners will still be synchronously executed in the specified order.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns [promise](#external_Promise) which *resolves* if the event had listeners, *rejects* otherwise.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Promise</code>](#external_Promise) - A promise which *resolves* if the event had listeners, *rejects* otherwise.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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

#### asEmitter.trigger([type], data) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) |  |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!
```
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

greeter.trigger( 'greeting:hi', [ 'Mark' ] );
// Hi, Mark!
// Mark was greeted.

greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
// Hello, Jeff!
// Jeff was greeted.
```
<a name="Emitter..asEmitter.until"></a>

#### asEmitter.until([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.2.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..addEventListener"></a>

### Emitter~addEventListener(emitter, type, listener, index)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |
| index | [<code>number</code>](#external_number) |  |

<a name="Emitter..warnMaxListeners"></a>

### Emitter~warnMaxListeners(emitter, type, listener)
Emits the `:maxListeners` event when the number of listeners for an event `type` exceeds the maximum
number of listeners. The event is emitted at most once per event `type`, until the listeners for that
`type` are cleared.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Emits**: [<code>:maxListeners</code>](#Emitter+event__maxListeners)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the listener was added. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..hasWarned"></a>

### Emitter~hasWarned(emitter, type) ⇒ [<code>boolean</code>](#external_boolean)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether a `:maxListeners` event has already been emitted for the event type.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |
| type | [<code>EventType</code>](#EventType) | The event type. |

<a name="Emitter..markWarned"></a>

### Emitter~markWarned(emitter, type)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |
| type | [<code>EventType</code>](#EventType) | The event type. |

<a name="Emitter..resetWarned"></a>

### Emitter~resetWarned(emitter, [type])
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |
| [type] | [<code>EventType</code>](#EventType) | The event type, or every event type when omitted. |

<a name="Emitter..addFiniteEventListener"></a>

### Emitter~addFiniteEventListener(emitter, type, times, listener)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| times | [<code>number</code>](#external_number) | The number times the listener will be executed before being removed. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..addEventMapping"></a>

### Emitter~addEventMapping(emitter, mapping)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| mapping | [<code>EventMapping</code>](#EventMapping) | The event mapping. |

<a name="Emitter..defineEventsProperty"></a>

### Emitter~defineEventsProperty(emitter)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the property will be created. |

<a name="Emitter..emitAllEvents"></a>

### Emitter~emitAllEvents(emitter, type, data) ⇒ [<code>boolean</code>](#external_boolean)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not a listener for the given event type was executed.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event `type` will be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) | The data to be passed with the event. |

<a name="Emitter..emitErrors"></a>

### Emitter~emitErrors(emitter, errors)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the `errors` will be emitted. |
| errors | [<code>Array.&lt;Error&gt;</code>](#external_Error) | The array of errors to be emitted. |

<a name="Emitter..emitEvent"></a>

### Emitter~emitEvent(emitter, type, data, emitEvery) ⇒ [<code>boolean</code>](#external_boolean)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not a listener for the given event type was executed.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event `type` will be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) | The data to be passed with the event. |
| emitEvery | [<code>boolean</code>](#external_boolean) | Whether or not listeners for all types will be executed. |

<a name="Emitter..executeListener"></a>

### Emitter~executeListener(listener, data, scope)
Executes a listener using the internal `execute*` functions based on the number of arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type |
| --- | --- |
| listener | <code>Array.&lt;Listener&gt;</code> \| <code>Listener</code> | 
| data | [<code>Array</code>](#external_Array) | 
| scope | <code>\*</code> | 

<a name="Emitter..getEventTypes"></a>

### Emitter~getEventTypes(emitter) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>Array.&lt;EventType&gt;</code>](#EventType) - The list of event types registered to the emitter.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which event types will be retrieved. |

<a name="Emitter..getMaxListeners"></a>

### Emitter~getMaxListeners(emitter) ⇒ [<code>number</code>](#external_number)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>number</code>](#external_number) - The maximum number of listeners.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |

<a name="Emitter..isPositiveNumber"></a>

### Emitter~isPositiveNumber(number) ⇒ [<code>boolean</code>](#external_boolean)
Checks whether or not a value is a positive number.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the value is a positive number.  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>\*</code> | The value to be tested. |

<a name="Emitter..listenEmpty"></a>

### Emitter~listenEmpty(handler, isFunction, emitter)
Execute a listener with no arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |

<a name="Emitter..listenOne"></a>

### Emitter~listenOne(handler, isFunction, emitter, arg1)
Execute a listener with one argument.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| arg1 | <code>\*</code> | The first argument. |

<a name="Emitter..listenTwo"></a>

### Emitter~listenTwo(handler, isFunction, emitter, arg1, arg2)
Execute a listener with two arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |

<a name="Emitter..listenThree"></a>

### Emitter~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)
Execute a listener with three arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |
| arg3 | <code>\*</code> | The third argument. |

<a name="Emitter..listenMany"></a>

### Emitter~listenMany(handler, isFunction, emitter, args)
Execute a listener with four or more arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| args | [<code>Array</code>](#external_Array) | Four or more arguments. |

<a name="Emitter..removeEventListener"></a>

### Emitter~removeEventListener(emitter, type, listener)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..setMaxListeners"></a>

### Emitter~setMaxListeners(The, max)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| The | [<code>Emitter</code>](#Emitter) | emitter on which the maximum number of listeners will be set. |
| max | [<code>number</code>](#external_number) | The maximum number of listeners before a warning is issued. |

<a name="Emitter..spliceList"></a>

### Emitter~spliceList(list, index)
Faster than `Array.prototype.splice`

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type |
| --- | --- |
| list | [<code>Array</code>](#external_Array) | 
| index | [<code>number</code>](#external_number) | 

<a name="Emitter..tick"></a>

### Emitter~tick(callback)
Asynchronously executes a function.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>Function</code>](#external_Function) | The function to be executed. |

<a name="Emitter..tickAllEvents"></a>

### Emitter~tickAllEvents(emitter, type, data) ⇒ [<code>Promise</code>](#external_Promise)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>Promise</code>](#external_Promise) - A promise which *resolves* if the event had listeners, *rejects* otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event `type` will be asynchronously emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) | The data to be passed with the event. |

<a name="Emitter..toEmitter"></a>

### Emitter~toEmitter([selection], target)
Applies a `selection` of the Emitter.js API to the `target`.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [selection] | [<code>APIReference</code>](#APIReference) | A selection of the Emitter.js API. |
| target | [<code>Object</code>](#external_Object) | The object on which the API will be applied. |

<a name="Emitter"></a>

## Emitter([selection], target)
Applies the Emitter.js API to the target.

**Kind**: global function  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [selection] | [<code>APIReference</code>](#APIReference) | A selection of the Emitter.js API that will be applied to the `target`. |
| target | [<code>Object</code>](#external_Object) | The object to which the Emitter.js API will be applied. |

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
        * [.maxListeners](#Emitter+maxListeners) : [<code>number</code>](#external_number)
        * [.destroy()](#Emitter+destroy)
        * [.toJSON()](#Emitter+toJSON) ⇒ [<code>Object</code>](#external_Object)
        * [.toString()](#Emitter+toString) ⇒ [<code>string</code>](#external_string)
        * [.at([type], index, listener)](#Emitter+at) ⇒ [<code>Emitter</code>](#Emitter)
        * [.clear([type])](#Emitter+clear) ⇒ [<code>Emitter</code>](#Emitter)
        * [.emit(type, [...data])](#Emitter+emit) ⇒ [<code>boolean</code>](#external_boolean)
        * [.eventTypes()](#Emitter+eventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
        * [.first(type, listener)](#Emitter+first) ⇒ [<code>Emitter</code>](#Emitter)
        * [.getMaxListeners()](#Emitter+getMaxListeners) ⇒ [<code>number</code>](#external_number)
        * [.listenerCount(type)](#Emitter+listenerCount) ⇒ [<code>number</code>](#external_number)
        * [.listeners(type)](#Emitter+listeners) ⇒ [<code>number</code>](#external_number)
        * [.many(type, times, listener)](#Emitter+many) ⇒ [<code>Emitter</code>](#Emitter)
        * [.off(type, listener)](#Emitter+off) ⇒ [<code>Emitter</code>](#Emitter)
        * [.on([type], listener)](#Emitter+on) ⇒ [<code>Emitter</code>](#Emitter)
        * [.once([type], listener)](#Emitter+once) ⇒ [<code>Emitter</code>](#Emitter)
        * [.setMaxListeners(max)](#Emitter+setMaxListeners) ⇒ [<code>Emitter</code>](#Emitter)
        * [.tick(type, [...data])](#Emitter+tick) ⇒ [<code>Promise</code>](#external_Promise)
        * [.trigger([type], data)](#Emitter+trigger) ⇒ [<code>boolean</code>](#external_boolean)
        * [.until([type], listener)](#Emitter+until) ⇒ [<code>Emitter</code>](#Emitter)
        * [":destroy"](#Emitter+event__destroy)
        * [":off"](#Emitter+event__off)
        * [":on"](#Emitter+event__on)
        * [":maxListeners"](#Emitter+event__maxListeners)
    * _static_
        * [.defaultMaxListeners](#Emitter.defaultMaxListeners) : [<code>number</code>](#external_number)
        * [.every](#Emitter.every) : [<code>symbol</code>](#external_symbol)
        * [.version](#Emitter.version) : [<code>string</code>](#external_string)
    * _inner_
        * [~Null](#Emitter..Null) ⇐ [<code>null</code>](#external_null)
            * [new Null()](#new_Emitter..Null_new)
        * [~asEmitter](#Emitter..asEmitter)
            * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ [<code>Emitter</code>](#Emitter)
            * [.clear([type])](#Emitter..asEmitter.clear) ⇒ [<code>Emitter</code>](#Emitter)
            * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ [<code>boolean</code>](#external_boolean)
            * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
            * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ [<code>Emitter</code>](#Emitter)
            * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners) ⇒ [<code>number</code>](#external_number)
            * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ [<code>number</code>](#external_number)
            * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ [<code>number</code>](#external_number)
            * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ [<code>Emitter</code>](#Emitter)
            * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ [<code>Emitter</code>](#Emitter)
            * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ [<code>Emitter</code>](#Emitter)
            * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ [<code>Emitter</code>](#Emitter)
            * [.setMaxListeners(max)](#Emitter..asEmitter.setMaxListeners) ⇒ [<code>Emitter</code>](#Emitter)
            * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ [<code>Promise</code>](#external_Promise)
            * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ [<code>boolean</code>](#external_boolean)
            * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ [<code>Emitter</code>](#Emitter)
        * [~addConditionalEventListener(emitter, type, listener)](#Emitter..addConditionalEventListener)
        * [~addEventListener(emitter, type, listener, index)](#Emitter..addEventListener)
        * [~warnMaxListeners(emitter, type, listener)](#Emitter..warnMaxListeners)
        * [~hasWarned(emitter, type)](#Emitter..hasWarned) ⇒ [<code>boolean</code>](#external_boolean)
        * [~markWarned(emitter, type)](#Emitter..markWarned)
        * [~resetWarned(emitter, [type])](#Emitter..resetWarned)
        * [~addFiniteEventListener(emitter, type, times, listener)](#Emitter..addFiniteEventListener)
        * [~addEventMapping(emitter, mapping)](#Emitter..addEventMapping)
        * [~defineEventsProperty(emitter)](#Emitter..defineEventsProperty)
        * [~emitAllEvents(emitter, type, data)](#Emitter..emitAllEvents) ⇒ [<code>boolean</code>](#external_boolean)
        * [~emitErrors(emitter, errors)](#Emitter..emitErrors)
        * [~emitEvent(emitter, type, data, emitEvery)](#Emitter..emitEvent) ⇒ [<code>boolean</code>](#external_boolean)
        * [~executeListener(listener, data, scope)](#Emitter..executeListener)
        * [~getEventTypes(emitter)](#Emitter..getEventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
        * [~getMaxListeners(emitter)](#Emitter..getMaxListeners) ⇒ [<code>number</code>](#external_number)
        * [~isPositiveNumber(number)](#Emitter..isPositiveNumber) ⇒ [<code>boolean</code>](#external_boolean)
        * [~listenEmpty(handler, isFunction, emitter)](#Emitter..listenEmpty)
        * [~listenOne(handler, isFunction, emitter, arg1)](#Emitter..listenOne)
        * [~listenTwo(handler, isFunction, emitter, arg1, arg2)](#Emitter..listenTwo)
        * [~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)](#Emitter..listenThree)
        * [~listenMany(handler, isFunction, emitter, args)](#Emitter..listenMany)
        * [~removeEventListener(emitter, type, listener)](#Emitter..removeEventListener)
        * [~setMaxListeners(The, max)](#Emitter..setMaxListeners)
        * [~spliceList(list, index)](#Emitter..spliceList)
        * [~tick(callback)](#Emitter..tick)
        * [~tickAllEvents(emitter, type, data)](#Emitter..tickAllEvents) ⇒ [<code>Promise</code>](#external_Promise)
        * [~toEmitter([selection], target)](#Emitter..toEmitter)

<a name="new_Emitter_new"></a>

### new Emitter([mapping])
Creates an instance of emitter. If `mapping` are provided they will automatically be passed into `on()` once construction is complete.

Emitter can be extended, either with the `class` syntax or with a constructor function. The parent constructor must be executed before any listeners are subscribed, which is done with `super()` in a `class` and with `Emitter.call( this )` in a constructor function.


| Param | Type | Description |
| --- | --- | --- |
| [mapping] | [<code>EventMapping</code>](#EventMapping) | A mapping of event types to event listeners. |

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
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );
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
     hello: function( name ){ console.log( `Hello, ${ name }!` ); },
     hi: function( name ){ console.log( `Hi, ${ name }!` ); }
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
<a name="Emitter+maxListeners"></a>

### emitter.maxListeners : [<code>number</code>](#external_number)
By default Emitters will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This property allows that to be changed. Set to **0** for unlimited.

**Kind**: instance property of [<code>Emitter</code>](#Emitter)  
**Since**: 1.0.0  
**Example**  
```js
const greeter = new Emitter();

console.log( greeter.maxListeners );
// 10

greeter.maxListeners = 1;

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```
<a name="Emitter+destroy"></a>

### emitter.destroy()
Destroys the emitter.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Emits**: [<code>:destroy</code>](#Emitter+event__destroy)  
**Since**: 1.0.0  
<a name="Emitter+toJSON"></a>

### emitter.toJSON() ⇒ [<code>Object</code>](#external_Object)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>Object</code>](#external_Object) - A plain object representation of the emitter.  
**Since**: 1.3.0  
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

### emitter.toString() ⇒ [<code>string</code>](#external_string)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>string</code>](#external_string) - A string representation of the emitter.  
**Since**: 1.3.0  
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

### emitter.at([type], index, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>at</code>](#Emitter..asEmitter.at)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| index | [<code>number</code>](#external_number) | Where the listener will be added in the trigger list. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter+clear"></a>

### emitter.clear([type]) ⇒ [<code>Emitter</code>](#Emitter)
Remove all listeners, or those for the specified event `type`.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>clear</code>](#Emitter..asEmitter.clear)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>string</code>](#external_string) | The event type. |

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

### emitter.emit(type, [...data]) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>emit</code>](#Emitter..asEmitter.emit)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

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

### emitter.eventTypes() ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>eventTypes</code>](#Emitter..asEmitter.eventTypes)  
**Returns**: [<code>Array.&lt;EventType&gt;</code>](#EventType) - The list of event types registered to the emitter.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter+first"></a>

### emitter.first(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>first</code>](#Emitter..asEmitter.first)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter+getMaxListeners"></a>

### emitter.getMaxListeners() ⇒ [<code>number</code>](#external_number)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method returns the current value.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>getMaxListeners</code>](#Emitter..asEmitter.getMaxListeners)  
**Returns**: [<code>number</code>](#external_number) - The maximum number of listeners.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();

console.log( greeter.getMaxListeners() );
// 10

greeter.setMaxListeners( 5 );

console.log( greeter.getMaxListeners() );
// 5
```
<a name="Emitter+listenerCount"></a>

### emitter.listenerCount(type) ⇒ [<code>number</code>](#external_number)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>listenerCount</code>](#Emitter..asEmitter.listenerCount)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

### emitter.listeners(type) ⇒ [<code>number</code>](#external_number)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>listeners</code>](#Emitter..asEmitter.listeners)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

### emitter.many(type, times, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

The `times` must be a positive number. A listener for `0` times is never executed and is not added.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>many</code>](#Emitter..asEmitter.many)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| times | [<code>number</code>](#external_number) | The number times the listener will be executed before being removed. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

### emitter.off(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>off</code>](#Emitter..asEmitter.off)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:off</code>](#Emitter+event__off)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

### emitter.on([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>on</code>](#Emitter..asEmitter.on)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

### emitter.once([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>once</code>](#Emitter..asEmitter.once)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

**Example** *(Listen once to any event type)*  
```js
const greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
```
**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter+setMaxListeners"></a>

### emitter.setMaxListeners(max) ⇒ [<code>Emitter</code>](#Emitter)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method allows that to be changed. Set to **0** for unlimited.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>setMaxListeners</code>](#Emitter..asEmitter.setMaxListeners)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| max | [<code>number</code>](#external_number) | The maximum number of listeners before a warning is issued. |

**Example**  
```js
const greeter = new Emitter();

greeter.setMaxListeners( 1 );

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```
<a name="Emitter+tick"></a>

### emitter.tick(type, [...data]) ⇒ [<code>Promise</code>](#external_Promise)
Asynchronously emits specified event `type` with the supplied arguments. The listeners will still be synchronously executed in the specified order.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns [promise](#external_Promise) which *resolves* if the event had listeners, *rejects* otherwise.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>tick</code>](#Emitter..asEmitter.tick)  
**Returns**: [<code>Promise</code>](#external_Promise) - A promise which *resolves* if the event had listeners, *rejects* otherwise.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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

### emitter.trigger([type], data) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>trigger</code>](#Emitter..asEmitter.trigger)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) |  |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!
```
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

greeter.trigger( 'greeting:hi', [ 'Mark' ] );
// Hi, Mark!
// Mark was greeted.

greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
// Hello, Jeff!
// Jeff was greeted.
```
<a name="Emitter+until"></a>

### emitter.until([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: instance method of [<code>Emitter</code>](#Emitter)  
**Mixes**: [<code>until</code>](#Emitter..asEmitter.until)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.2.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter+event__off"></a>

### ":off"
This event is emitted _after_ a listener is removed.

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter+event__on"></a>

### ":on"
This event is emitted _before_ a listener is added.

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter+event__maxListeners"></a>

### ":maxListeners"
This event is emitted once the maximum number of listeners has been exceeded for an event type. It is emitted at most once per event `type`, until the listeners for that `type` are cleared.

**Kind**: event emitted by [<code>Emitter</code>](#Emitter)  
<a name="Emitter.defaultMaxListeners"></a>

### Emitter.defaultMaxListeners : [<code>number</code>](#external_number)
Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.

By default Emitter will emit a `:maxListeners` event if more than 10 listeners are added to a specific event type.

**Kind**: static property of [<code>Emitter</code>](#Emitter)  
**Default**: <code>10</code>  
**Since**: 1.0.0  
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

### Emitter.every : [<code>symbol</code>](#external_symbol)
An id used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.

Listener bound to every event will **not** execute for Emitter lifecycle events, like `:maxListeners`.

Using `Emitter.every` is typically not necessary.

**Kind**: static property of [<code>Emitter</code>](#Emitter)  
**Since**: 1.0.0  
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

### Emitter.version : [<code>string</code>](#external_string)
The current version of *Emitter.js*.

**Kind**: static property of [<code>Emitter</code>](#Emitter)  
**Since**: 1.1.2  
**Example**  
```js
console.log( Emitter.version );
// 2.1.0
```
<a name="Emitter..Null"></a>

### Emitter~Null ⇐ [<code>null</code>](#external_null)
**Kind**: inner class of [<code>Emitter</code>](#Emitter)  
**Extends**: [<code>null</code>](#external_null)  
<a name="new_Emitter..Null_new"></a>

#### new Null()
A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.

<a name="Emitter..asEmitter"></a>

### Emitter~asEmitter
A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, `toString()`, and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.

Like all functional mixins, this should be executed with [call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or [apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).

**Kind**: inner mixin of [<code>Emitter</code>](#Emitter)  
**Since**: 1.1.0  
**Example** *(Applying Emitter functionality)*  
```js
// Create a base object
const greeter = Object.create( null );

// Apply the mixin with the public API
Emitter( greeter );

greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
```
**Example** *(Applying chaos to your world)*  
```js
// NO!!!
asEmitter(); // Madness ensues
```

* [~asEmitter](#Emitter..asEmitter)
    * [.at([type], index, listener)](#Emitter..asEmitter.at) ⇒ [<code>Emitter</code>](#Emitter)
    * [.clear([type])](#Emitter..asEmitter.clear) ⇒ [<code>Emitter</code>](#Emitter)
    * [.emit(type, [...data])](#Emitter..asEmitter.emit) ⇒ [<code>boolean</code>](#external_boolean)
    * [.eventTypes()](#Emitter..asEmitter.eventTypes) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
    * [.first(type, listener)](#Emitter..asEmitter.first) ⇒ [<code>Emitter</code>](#Emitter)
    * [.getMaxListeners()](#Emitter..asEmitter.getMaxListeners) ⇒ [<code>number</code>](#external_number)
    * [.listenerCount(type)](#Emitter..asEmitter.listenerCount) ⇒ [<code>number</code>](#external_number)
    * [.listeners(type)](#Emitter..asEmitter.listeners) ⇒ [<code>number</code>](#external_number)
    * [.many(type, times, listener)](#Emitter..asEmitter.many) ⇒ [<code>Emitter</code>](#Emitter)
    * [.off(type, listener)](#Emitter..asEmitter.off) ⇒ [<code>Emitter</code>](#Emitter)
    * [.on([type], listener)](#Emitter..asEmitter.on) ⇒ [<code>Emitter</code>](#Emitter)
    * [.once([type], listener)](#Emitter..asEmitter.once) ⇒ [<code>Emitter</code>](#Emitter)
    * [.setMaxListeners(max)](#Emitter..asEmitter.setMaxListeners) ⇒ [<code>Emitter</code>](#Emitter)
    * [.tick(type, [...data])](#Emitter..asEmitter.tick) ⇒ [<code>Promise</code>](#external_Promise)
    * [.trigger([type], data)](#Emitter..asEmitter.trigger) ⇒ [<code>boolean</code>](#external_boolean)
    * [.until([type], listener)](#Emitter..asEmitter.until) ⇒ [<code>Emitter</code>](#Emitter)

<a name="Emitter..asEmitter.at"></a>

#### asEmitter.at([type], index, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| index | [<code>number</code>](#external_number) | Where the listener will be added in the trigger list. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..asEmitter.clear"></a>

#### asEmitter.clear([type]) ⇒ [<code>Emitter</code>](#Emitter)
Remove all listeners, or those for the specified event `type`.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>string</code>](#external_string) | The event type. |

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

#### asEmitter.emit(type, [...data]) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied arguments.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

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

#### asEmitter.eventTypes() ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Array.&lt;EventType&gt;</code>](#EventType) - The list of event types registered to the emitter.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', () => console.log( `Hello` ) );
greeter.on( 'hi', () => console.log( `Hi` ) );

console.log( greeter.eventTypes() );
// [ 'hello', 'hi' ]
```
<a name="Emitter..asEmitter.first"></a>

#### asEmitter.first(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..asEmitter.getMaxListeners"></a>

#### asEmitter.getMaxListeners() ⇒ [<code>number</code>](#external_number)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method returns the current value.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>number</code>](#external_number) - The maximum number of listeners.  
**Since**: 2.0.0  
**Example**  
```js
const greeter = new Emitter();

console.log( greeter.getMaxListeners() );
// 10

greeter.setMaxListeners( 5 );

console.log( greeter.getMaxListeners() );
// 5
```
<a name="Emitter..asEmitter.listenerCount"></a>

#### asEmitter.listenerCount(type) ⇒ [<code>number</code>](#external_number)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

#### asEmitter.listeners(type) ⇒ [<code>number</code>](#external_number)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>number</code>](#external_number) - The number of listeners for that event type within the given emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |

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

#### asEmitter.many(type, times, listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

The `times` must be a positive number. A listener for `0` times is never executed and is not added.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| times | [<code>number</code>](#external_number) | The number times the listener will be executed before being removed. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

#### asEmitter.off(type, listener) ⇒ [<code>Emitter</code>](#Emitter)
Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.

If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:off</code>](#Emitter+event__off)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

#### asEmitter.on([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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

#### asEmitter.once([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Emits**: [<code>:on</code>](#Emitter+event__on), [<code>:maxListeners</code>](#Emitter+event__maxListeners)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

**Example** *(Listen once to any event type)*  
```js
const greeter = new Emitter();
greeter.once( () => console.log( 'Greeted' ) );
greeter.emit( 'hello' );
// Greeted
greeter.emit( 'goodbye' );
```
**Example** *(Listen once to all event types)*  
```js
const greeter = new Emitter();
greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.emit( 'hello', 'World' );
// Hello, World!
greeter.emit( 'hello', 'World' );
```
<a name="Emitter..asEmitter.setMaxListeners"></a>

#### asEmitter.setMaxListeners(max) ⇒ [<code>Emitter</code>](#Emitter)
By default Emitter will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This method allows that to be changed. Set to **0** for unlimited.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| max | [<code>number</code>](#external_number) | The maximum number of listeners before a warning is issued. |

**Example**  
```js
const greeter = new Emitter();

greeter.setMaxListeners( 1 );

greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.on( 'hello', () => alert( 'Hello!' ) );
// Greeting "hello" has one too many!
```
<a name="Emitter..asEmitter.tick"></a>

#### asEmitter.tick(type, [...data]) ⇒ [<code>Promise</code>](#external_Promise)
Asynchronously emits specified event `type` with the supplied arguments. The listeners will still be synchronously executed in the specified order.

The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.

Returns [promise](#external_Promise) which *resolves* if the event had listeners, *rejects* otherwise.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Promise</code>](#external_Promise) - A promise which *resolves* if the event had listeners, *rejects* otherwise.  
**Since**: 2.0.0  

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>EventType</code>](#EventType) | The event type. |
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

#### asEmitter.trigger([type], data) ⇒ [<code>boolean</code>](#external_boolean)
Execute the listeners for the specified event `type` with the supplied `data`.

Returns `true` if the event had listeners, `false` otherwise. An `error` event without an `error` listener always throws, whether or not other listeners are registered.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the event had listeners.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no `error` listener is registered.

**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) |  |

**Example**  
```js
const greeter = new Emitter();
greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.trigger( 'hello', [ 'World' ] );
// Hello, World!
```
**Example**  
```js
const greeter = new Emitter();
greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` ) );

greeter.trigger( 'greeting:hi', [ 'Mark' ] );
// Hi, Mark!
// Mark was greeted.

greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
// Hello, Jeff!
// Jeff was greeted.
```
<a name="Emitter..asEmitter.until"></a>

#### asEmitter.until([type], listener) ⇒ [<code>Emitter</code>](#Emitter)
Adds a listener for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.

No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.

**Kind**: static method of [<code>asEmitter</code>](#Emitter..asEmitter)  
**Returns**: [<code>Emitter</code>](#Emitter) - The emitter.  
**Since**: 1.2.0  

| Param | Type | Description |
| --- | --- | --- |
| [type] | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

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
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..addEventListener"></a>

### Emitter~addEventListener(emitter, type, listener, index)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |
| index | [<code>number</code>](#external_number) |  |

<a name="Emitter..warnMaxListeners"></a>

### Emitter~warnMaxListeners(emitter, type, listener)
Emits the `:maxListeners` event when the number of listeners for an event `type` exceeds the maximum
number of listeners. The event is emitted at most once per event `type`, until the listeners for that
`type` are cleared.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Emits**: [<code>:maxListeners</code>](#Emitter+event__maxListeners)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the listener was added. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..hasWarned"></a>

### Emitter~hasWarned(emitter, type) ⇒ [<code>boolean</code>](#external_boolean)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether a `:maxListeners` event has already been emitted for the event type.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |
| type | [<code>EventType</code>](#EventType) | The event type. |

<a name="Emitter..markWarned"></a>

### Emitter~markWarned(emitter, type)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |
| type | [<code>EventType</code>](#EventType) | The event type. |

<a name="Emitter..resetWarned"></a>

### Emitter~resetWarned(emitter, [type])
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |
| [type] | [<code>EventType</code>](#EventType) | The event type, or every event type when omitted. |

<a name="Emitter..addFiniteEventListener"></a>

### Emitter~addFiniteEventListener(emitter, type, times, listener)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| times | [<code>number</code>](#external_number) | The number times the listener will be executed before being removed. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..addEventMapping"></a>

### Emitter~addEventMapping(emitter, mapping)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| mapping | [<code>EventMapping</code>](#EventMapping) | The event mapping. |

<a name="Emitter..defineEventsProperty"></a>

### Emitter~defineEventsProperty(emitter)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the property will be created. |

<a name="Emitter..emitAllEvents"></a>

### Emitter~emitAllEvents(emitter, type, data) ⇒ [<code>boolean</code>](#external_boolean)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not a listener for the given event type was executed.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event `type` will be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) | The data to be passed with the event. |

<a name="Emitter..emitErrors"></a>

### Emitter~emitErrors(emitter, errors)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the `errors` will be emitted. |
| errors | [<code>Array.&lt;Error&gt;</code>](#external_Error) | The array of errors to be emitted. |

<a name="Emitter..emitEvent"></a>

### Emitter~emitEvent(emitter, type, data, emitEvery) ⇒ [<code>boolean</code>](#external_boolean)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not a listener for the given event type was executed.  
**Throws**:

- [<code>Error</code>](#external_Error) If `type` is `error` and no listeners are subscribed.


| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event `type` will be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) | The data to be passed with the event. |
| emitEvery | [<code>boolean</code>](#external_boolean) | Whether or not listeners for all types will be executed. |

<a name="Emitter..executeListener"></a>

### Emitter~executeListener(listener, data, scope)
Executes a listener using the internal `execute*` functions based on the number of arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type |
| --- | --- |
| listener | <code>Array.&lt;Listener&gt;</code> \| <code>Listener</code> | 
| data | [<code>Array</code>](#external_Array) | 
| scope | <code>\*</code> | 

<a name="Emitter..getEventTypes"></a>

### Emitter~getEventTypes(emitter) ⇒ [<code>Array.&lt;EventType&gt;</code>](#EventType)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>Array.&lt;EventType&gt;</code>](#EventType) - The list of event types registered to the emitter.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which event types will be retrieved. |

<a name="Emitter..getMaxListeners"></a>

### Emitter~getMaxListeners(emitter) ⇒ [<code>number</code>](#external_number)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>number</code>](#external_number) - The maximum number of listeners.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which max listeners will be retrieved. |

<a name="Emitter..isPositiveNumber"></a>

### Emitter~isPositiveNumber(number) ⇒ [<code>boolean</code>](#external_boolean)
Checks whether or not a value is a positive number.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>boolean</code>](#external_boolean) - Whether or not the value is a positive number.  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>\*</code> | The value to be tested. |

<a name="Emitter..listenEmpty"></a>

### Emitter~listenEmpty(handler, isFunction, emitter)
Execute a listener with no arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |

<a name="Emitter..listenOne"></a>

### Emitter~listenOne(handler, isFunction, emitter, arg1)
Execute a listener with one argument.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| arg1 | <code>\*</code> | The first argument. |

<a name="Emitter..listenTwo"></a>

### Emitter~listenTwo(handler, isFunction, emitter, arg1, arg2)
Execute a listener with two arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |

<a name="Emitter..listenThree"></a>

### Emitter~listenThree(handler, isFunction, emitter, arg1, arg2, arg3)
Execute a listener with three arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| arg1 | <code>\*</code> | The first argument. |
| arg2 | <code>\*</code> | The second argument. |
| arg3 | <code>\*</code> | The third argument. |

<a name="Emitter..listenMany"></a>

### Emitter~listenMany(handler, isFunction, emitter, args)
Execute a listener with four or more arguments.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| handler | [<code>EventListener</code>](#EventListener) \| [<code>Array.&lt;EventListener&gt;</code>](#EventListener) | One or more [listeners](#EventListener) that will be executed on the `emitter`. |
| isFunction | [<code>boolean</code>](#external_boolean) | Whether or not the `handler` is a [function](#external_Function). |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter. |
| args | [<code>Array</code>](#external_Array) | Four or more arguments. |

<a name="Emitter..removeEventListener"></a>

### Emitter~removeEventListener(emitter, type, listener)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event would be emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| listener | [<code>EventListener</code>](#EventListener) | The event callback. |

<a name="Emitter..setMaxListeners"></a>

### Emitter~setMaxListeners(The, max)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| The | [<code>Emitter</code>](#Emitter) | emitter on which the maximum number of listeners will be set. |
| max | [<code>number</code>](#external_number) | The maximum number of listeners before a warning is issued. |

<a name="Emitter..spliceList"></a>

### Emitter~spliceList(list, index)
Faster than `Array.prototype.splice`

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type |
| --- | --- |
| list | [<code>Array</code>](#external_Array) | 
| index | [<code>number</code>](#external_number) | 

<a name="Emitter..tick"></a>

### Emitter~tick(callback)
Asynchronously executes a function.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| callback | [<code>Function</code>](#external_Function) | The function to be executed. |

<a name="Emitter..tickAllEvents"></a>

### Emitter~tickAllEvents(emitter, type, data) ⇒ [<code>Promise</code>](#external_Promise)
**Kind**: inner method of [<code>Emitter</code>](#Emitter)  
**Returns**: [<code>Promise</code>](#external_Promise) - A promise which *resolves* if the event had listeners, *rejects* otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| emitter | [<code>Emitter</code>](#Emitter) | The emitter on which the event `type` will be asynchronously emitted. |
| type | [<code>EventType</code>](#EventType) | The event type. |
| data | [<code>Array</code>](#external_Array) | The data to be passed with the event. |

<a name="Emitter..toEmitter"></a>

### Emitter~toEmitter([selection], target)
Applies a `selection` of the Emitter.js API to the `target`.

**Kind**: inner method of [<code>Emitter</code>](#Emitter)  

| Param | Type | Description |
| --- | --- | --- |
| [selection] | [<code>APIReference</code>](#APIReference) | A selection of the Emitter.js API. |
| target | [<code>Object</code>](#external_Object) | The object on which the API will be applied. |

<a name="APIReference"></a>

## APIReference : [<code>string</code>](#external_string) \| [<code>Object</code>](#external_Object)
A set of method references to the Emitter.js API.

**Kind**: global typedef  
**Example** *(A selection reference)*  
```js
'emit off on once'
```
**Example** *(A mapping reference)*  
```js
// 'emit()' will be mapped to 'fire()'
// 'on()' will be mapped to 'addListener()'
// 'off()' will be mapped to 'removeListener()'
{
 fire: 'emit',
 addListener: 'on',
 removeListener: 'off'
}
```
<a name="EventListener"></a>

## EventListener : [<code>Function</code>](#external_Function)
A [ function](#external_Function) bound to an emitter [event type](#EventType). Any data transmitted with the event will be passed into the listener as arguments.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| ...data | <code>\*</code> | The arguments passed by the `emit`. |

<a name="EventMapping"></a>

## EventMapping : [<code>Object</code>](#external_Object)
An [object](#external_Object) that maps [event types](#EventType) to [event listeners](#EventListener).

**Kind**: global typedef  
<a name="EventType"></a>

## EventType : [<code>string</code>](#external_string) \| [<code>symbol</code>](#external_symbol)
A [string](#external_string) or [symbol](#external_symbol) that represents the type of event fired by the Emitter. Values other than a `string` or a `symbol` are coerced to a `string`, since they are used as the keys of the event registry.

**Kind**: global typedef  
<a name="external_Array"></a>

## Array
JavaScript Array

**Kind**: global external  
**See**: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)  
<a name="external_boolean"></a>

## boolean
JavaScript [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) boolean

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
