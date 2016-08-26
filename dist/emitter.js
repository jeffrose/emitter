'use strict';

/**
 * JavaScript Array
 * @external Array
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array}
 */ 

/**
 * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Prm454mun3!imitive|primitive} boolean
 * @external boolean
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean}
 */ 

/**
 * JavaScript Error
 * @external Error
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error}
 */ 

/**
 * JavaScript Function
 * @external Function
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function}
 */ 
 
/**
 * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} number
 * @external number
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number}
 */ 
 
/**
 * JavaScript null
 * @external null
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null}
 */
 
/**
 * JavaScript Object
 * @external Object
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object}
 */

/**
 * JavaScript Promise
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

/**
 * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} string
 * @external string
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
 */
 
/**
 * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} symbol
 * @external symbol
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol}
 */

/**
 * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
 * @typedef {external:string|external:symbol} EventType
 */ 

/**
 * A {@link external:Function| function} bound to an emitter {@link EventType|event type}. Any data transmitted with the event will be passed into the listener as arguments.
 * @typedef {external:Function} EventListener
 * @param {...*} data The arguments passed by the `emit`.
 */

/**
 * An {@link external:Object|object} that maps {@link EventType|event types} to {@link EventListener|event listeners}.
 * @typedef {external:Object} EventMapping
 */

/**
 * A {@link external:Promise|promise} returned when an event is emitted asynchronously. It resolves with {@link EventSuccess} and rejects with {@link EventFailure}.
 * @typedef EventPromise
 */

/**
 * @callback EventSuccess
 * @param {external:boolean} status Whether or not the specified type of event had listeners.
 */

/**
 * @callback EventFailure
 * @param {external:Error} error The error thrown during listener execution.
 */

/**
 * This event is emitted _before_ an emitter destroys itself.
 * @event Emitter#:destroy
 */ 

/**
 * This event is emitted _after_ a listener is removed.
 * @event Emitter#:off
 * @type {external:string} type
 * @type {external:Function} listener
 */

/**
 * This event is emitted _before_ a listener is added.
 * @event Emitter#:on
 * @type {external:string} type
 * @type {external:Function} listener
 */

/**
 * This event is emitted once the maximum number of listeners has been exceeded for an event type.
 * @event Emitter#:maxListeners
 * @type {external:string} type
 * @type {external:Function} listener
 */

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Emitter~Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor = Null;

const
    $events       = '@@emitter/events',
    $every        = '@@emitter/every',
    $maxListeners = '@@emitter/maxListeners',
    
    hasOwnProperty = Object.prototype.hasOwnProperty,
    
    noop = function(){},
    
    API = new Null();

// Many of these functions are broken out from the prototype for the sake of optimization. The functions on the protoytype
// take a variable number of arguments and can be deoptimized as a result. These functions have a fixed number of arguments
// and therefore do not get deoptimized.

/**
 * @function Emitter~addConditionalEventListener
 * @param {Emitter} emitter The emitter on which the event would be emitted.
 * @param {EventType} type The event type.
 * @param {EventListener} listener The event callback.
 */
function addConditionalEventListener( emitter, type, listener ){
    
    function conditionalListener(){
        const done = listener.apply( emitter, arguments );
        if( done === true ){
            removeEventListener( emitter, type, conditionalListener );
        }
    }
    
    // TODO Check beyond just one level of listener references
    conditionalListener.listener = listener.listener || listener;
    
    addEventListener( emitter, type, conditionalListener, NaN );
}

/**
 * @function Emitter~addEventListener
 * @param {Emitter} emitter The emitter on which the event would be emitted.
 * @param {EventType} type The event type.
 * @param {EventListener} listener The event callback.
 * @param {external:number} index
 */
function addEventListener( emitter, type, listener, index ){
    if( typeof listener !== 'function' ){
        throw new TypeError( 'listener must be a function' );
    }
    
    // Define the event registry if it does not exist.
    defineEventsProperty( emitter, new Null() );
    
    const _events = emitter[ $events ];
    
    if( _events[ ':on' ] ){
        emitEvent( emitter, ':on', [ type, typeof listener.listener === 'function' ? listener.listener : listener ], true );
        
        // Emitting "on" may have changed the registry.
        _events[ ':on' ] = emitter[ $events ][ ':on' ];
    }
    
    // Single listener
    if( !_events[ type ] ){
        _events[ type ] = listener;
    
    // Multiple listeners
    } else if( Array.isArray( _events[ type ] ) ){
        switch( isNaN( index ) || index ){
            case true:
                _events[ type ].push( listener );
                break;
            case 0:
                _events[ type ].unshift( listener );
                break;
            default:
                _events[ type ].splice( index, 0, listener );
                break;
        }
    
    // Transition from single to multiple listeners
    } else {
        _events[ type ] = index === 0 ?
            [ listener, _events[ type ] ] :
            [ _events[ type ], listener ];
    }
    
    // Track warnings if max listeners is available
    if( 'maxListeners' in emitter && !_events[ type ].warned ){
        const max = emitter.maxListeners;
        
        if( max && max > 0 && _events[ type ].length > max ){
            emitEvent( emitter, ':maxListeners', [ type, listener ], true );
            
            // Emitting "maxListeners" may have changed the registry.
            _events[ ':maxListeners' ] = emitter[ $events ][ ':maxListeners' ];
            
            _events[ type ].warned = true;
        }
    }
    
    emitter[ $events ] = _events;
}

/**
 * @function Emitter~addFiniteEventListener
 * @param {Emitter} emitter The emitter on which the event would be emitted.
 * @param {EventType} type The event type.
 * @param {external:number} times The number times the listener will be executed before being removed.
 * @param {EventListener} listener The event callback.
 */
function addFiniteEventListener( emitter, type, times, listener ){
    
    function finiteListener(){
        listener.apply( this, arguments );
        return --times === 0;
    }
    
    finiteListener.listener = listener;
    
    addConditionalEventListener( emitter, type, finiteListener );
}

/**
 * @function Emitter~addEventMapping
 * @param {Emitter} emitter The emitter on which the event would be emitted.
 * @param {EventMapping} mapping The event mapping.
 */
function addEventMapping( emitter, mapping ){
    const
        types = Object.keys( mapping ),
        typeLength = types.length;
    
    let typeIndex = 0,
        handler, handlerIndex, handlerLength, type;
    
    for( ; typeIndex < typeLength; typeIndex += 1 ){
        type = types[ typeIndex ];
        handler = mapping[ type ];
        
        // List of listeners
        if( Array.isArray( handler ) ){
            handlerIndex = 0;
            handlerLength = handler.length;
                
            for( ; handlerIndex < handlerLength; handlerIndex += 1 ){
                addEventListener( emitter, type, handler[ handlerIndex ], NaN );
            }
        
        // Single listener
        } else {
            addEventListener( emitter, type, handler, NaN );
        }
    }
}

/**
 * @function Emitter~defineEventsProperty
 * @param {Emitter} emitter The emitter on which the property will be created.
 */ 
function defineEventsProperty( emitter, value ){
    const hasEvents = hasOwnProperty.call( emitter, $events ),
        emitterPrototype = Object.getPrototypeOf( emitter );
        
    if( !hasEvents || ( emitterPrototype && emitter[ $events ] === emitterPrototype[ $events ] ) ){
        Object.defineProperty( emitter, $events, {
            value: value,
            configurable: true,
            enumerable: false,
            writable: true
        } );
    }
}

/**
 * @function Emitter~emitAllEvents
 * @param {Emitter} emitter The emitter on which the event `type` will be emitted.
 * @param {EventType} type The event type.
 * @param {external:Array} data The data to be passed with the event.
 * @returns {external:boolean} Whether or not a listener for the given event type was executed.
 * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
 */
function emitAllEvents( emitter, type, data ){
    let executed = false,
        // If type is not a string, index will be false
        index = typeof type === 'string' && type.lastIndexOf( ':' );
    
    // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
    while( index > 0 ){
        executed = ( type && emitEvent( emitter, type, data, false ) ) || executed;
        type = type.substring( 0, index );
        index = type.lastIndexOf( ':' );
    }
    
    // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )
    executed = ( type && emitEvent( emitter, type, data, true ) ) || executed;
    
    return executed;
}

/**
 * @function Emitter~emitErrors
 * @param {Emitter} emitter The emitter on which the `errors` will be emitted.
 * @param {Array<external:Error>} errors The array of errors to be emitted.
 */
function emitErrors( emitter, errors ){
    const length = errors.length;
    for( let index = 0; index < length; index += 1 ){
        emitEvent( emitter, 'error', [ errors[ index ] ], false );
    }
}

/**
 * @function Emitter~emitEvent
 * @param {Emitter} emitter The emitter on which the event `type` will be emitted.
 * @param {EventType} type The event type.
 * @param {external:Array} data The data to be passed with the event.
 * @param {external:boolean} emitEvery Whether or not listeners for all types will be executed.
 * @returns {external:boolean} Whether or not a listener for the given event type was executed.
 * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
 */
function emitEvent( emitter, type, data, emitEvery ){
    // Define the event registry if it does not exist.
    defineEventsProperty( emitter, new Null() );
    
    const _events = emitter[ $events ];
    
    let executed = false,
        listener;
    
    if( type === 'error' && !_events.error ){
        const error = data[ 0 ];
        
        if( error instanceof Error ){
            throw error;
        } else {
            throw new Error( 'Uncaught, unspecified "error" event.' );
        }
    }
    
    // Execute listeners for the given type of event
    listener = _events[ type ];
    if( typeof listener !== 'undefined' ){
        executeListener( listener, data, emitter );
        executed = true;
    }
    
    // Execute listeners listening for all types of events
    if( emitEvery ){
        listener = _events[ $every ];
        if( typeof listener !== 'undefined' ){
            executeListener( listener, data, emitter );
            executed = true;
        }
    }
    
    return executed;
}

/**
 * Executes a listener using the internal `execute*` functions based on the number of arguments.
 * @function Emitter~executeListener
 * @param {Array<Listener>|Listener} listener
 * @param {external:Array} data
 * @param {*} scope
 */ 
function executeListener( listener, data, scope ){
    const isFunction = typeof listener === 'function';
    
    switch( data.length ){
        case 0:
            listenEmpty    ( listener, isFunction, scope );
            break;
        case 1:
            listenOne      ( listener, isFunction, scope, data[ 0 ] );
            break;
        case 2:
            listenTwo      ( listener, isFunction, scope, data[ 0 ], data[ 1 ] );
            break;
        case 3:
            listenThree    ( listener, isFunction, scope, data[ 0 ], data[ 1 ], data[ 2 ] );
            break;
        default:
            listenMany     ( listener, isFunction, scope, data );
            break;
    }
}

/**
 * @function Emitter~getEventTypes
 * @param {Emitter} emitter The emitter on which event types will be retrieved.
 * @returns {Array<EventType>} The list of event types registered to the emitter.
 */
function getEventTypes( emitter ){
    return Object.keys( emitter[ $events ] );
}

/**
 * @function Emitter~getMaxListeners
 * @param {Emitter} emitter The emitter on which max listeners will be retrieved.
 * @returns {external:number} The maximum number of listeners.
 */
function getMaxListeners( emitter ){
    return typeof emitter[ $maxListeners ] !== 'undefined' ?
        emitter[ $maxListeners ] :
        Emitter.defaultMaxListeners;
}

/**
 * Checks whether or not a value is a positive number.
 * @function Emitter~isPositiveNumber
 * @param {*} number The value to be tested.
 * @returns {external:boolean} Whether or not the value is a positive number.
 */
function isPositiveNumber( number ){
    return typeof number === 'number' && number >= 0 && !isNaN( number );
}

/**
 * Execute a listener with no arguments.
 * @function Emitter~listenEmpty
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 */
function listenEmpty( handler, isFunction, emitter ){
    const errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter );
        } catch( error ){
            errors.push( error );
        }
    } else {
        const length = handler.length,
            listeners = handler.slice();
            
        let index = 0;
        
        for( ; index < length; index += 1 ){
            try {
                listeners[ index ].call( emitter );
            } catch( error ){
                errors.push( error );
            }
        }
    }
    
    if( errors.length ){
        emitErrors( emitter, errors );
    }
}

/**
 * Execute a listener with one argument.
 * @function Emitter~listenOne
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 */
function listenOne( handler, isFunction, emitter, arg1 ){
    const errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        const length = handler.length,
            listeners = handler.slice();
        
        let index = 0;
        
        for( ; index < length; index += 1 ){
            try {
                listeners[ index ].call( emitter, arg1 );
            } catch( error ){
                errors.push( error );
            }
        }
    }
    
    if( errors.length ){
        emitErrors( emitter, errors );
    }
}

/**
 * Execute a listener with two arguments.
 * @function Emitter~listenTwo
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 * @param {*} arg2 The second argument.
 */
function listenTwo( handler, isFunction, emitter, arg1, arg2 ){
    const errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1, arg2 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        const length = handler.length,
            listeners = handler.slice();
        
        let index = 0;
        
        for( ; index < length; index += 1 ){
            try {
                listeners[ index ].call( emitter, arg1, arg2 );
            } catch( error ){
                errors.push( error );
            }
        }
    }
    
    if( errors.length ){
        emitErrors( emitter, errors );
    }
}

/**
 * Execute a listener with three arguments.
 * @function Emitter~listenThree
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 * @param {*} arg2 The second argument.
 * @param {*} arg3 The third argument.
 */
function listenThree( handler, isFunction, emitter, arg1, arg2, arg3 ){
    const errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1, arg2, arg3 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        const length = handler.length,
            listeners = handler.slice();
        
        let index = 0;
        
        for( ; index < length; index += 1 ){
            try {
                listeners[ index ].call( emitter, arg1, arg2, arg3 );
            } catch( error ){
                errors.push( error );
            }
        }
    }
    
    if( errors.length ){
        emitErrors( emitter, errors );
    }
}

/**
 * Execute a listener with four or more arguments.
 * @function Emitter~listenMany
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {external:Array} args Four or more arguments.
 */
function listenMany( handler, isFunction, emitter, args ){
    const errors = [];
    
    if( isFunction ){
        try {
            handler.apply( emitter, args );
        } catch( error ){
            errors.push( error );
        }
    } else {
        const length = handler.length,
            listeners = handler.slice();
        
        let index = 0;
        
        for( ; index < length; index += 1 ){
            try {
                listeners[ index ].apply( emitter, args );
            } catch( error ){
                errors.push( error );
            }
        }
    }
    
    if( errors.length ){
        emitErrors( emitter, errors );
    }
}

/**
 * @function Emitter~removeEventListener
 * @param {Emitter} emitter The emitter on which the event would be emitted.
 * @param {EventType} type The event type.
 * @param {EventListener} listener The event callback.
 */
function removeEventListener( emitter, type, listener ){
    // Define the event registry if it does not exist.
    defineEventsProperty( emitter, new Null() );
    
    const handler = emitter[ $events ][ type ];
    
    if( handler === listener || ( typeof handler.listener === 'function' && handler.listener === listener ) ){
        delete emitter[ $events ][ type ];
        if( emitter[ $events ][ ':off' ] ){
            emitEvent( emitter, ':off', [ type, listener ], true );
        }
    } else if( Array.isArray( handler ) ){
        let index = -1;
        
        for( let i = handler.length; i-- > 0; ){
            if( handler[ i ] === listener || ( handler[ i ].listener && handler[ i ].listener === listener ) ){
                index = i;
                break;
            }
        }
    
        if( index > -1 ){
            if( handler.length === 1 ){
                handler.length = 0;
                delete emitter[ $events ][ type ];
            } else {
                spliceList( handler, index );
            }
            
            if( emitter[ $events ][ ':off' ] ){
                emitEvent( emitter, ':off', [ type, listener ], true );
            }
        }
    }
}

/**
 * @function Emitter~setMaxListeners
 * @param {Emitter} The emitter on which the maximum number of listeners will be set.
 * @param {external:number} max The maximum number of listeners before a warning is issued.
 */
function setMaxListeners( emitter, max ){
    if( !isPositiveNumber( max ) ){
        throw new TypeError( 'max must be a positive number' );
    }
    
    Object.defineProperty( emitter, $maxListeners, {
        value: max,
        configurable: true,
        enumerable: false,
        writable: true
    } );
}

/**
 * Faster than `Array.prototype.splice`
 * @function Emitter~spliceList
 * @param {external:Array} list
 * @param {external:number} index
 */ 
function spliceList( list, index ){
    for( let i = index, j = i + 1, length = list.length; j < length; i += 1, j += 1 ){
        list[ i ] = list[ j ];
    }
    
    list.pop();
}

/**
 * Asynchronously executes a function.
 * @function Emitter~tick
 * @param {external:Function} callback The function to be executed.
 */
function tick( callback ){
    return setTimeout( callback, 0 );
}

/**
 * @function Emitter~tickAllEvents
 * @param {Emitter} emitter The emitter on which the event `type` will be asynchronously emitted.
 * @param {EventType} type The event type.
 * @param {external:Array} data The data to be passed with the event.
 * @returns {EventPromise} A promise which resolves when the listeners have completed execution but rejects if an error was thrown.
 */
function tickAllEvents( emitter, type, data ){
    return new Promise( function( resolve, reject ){
        tick( function(){
            emitAllEvents( emitter, type, data ) ? resolve() : reject();
        } );
    } );
}

/**
 * Applies a `selection` of the Emitter.js API to the `target`.
 * @function Emitter~toEmitter
 */
function toEmitter( selection, target ){
    
    // Apply the entire Emitter API
    if( selection === API ){
        asEmitter.call( target );
    
    // Apply only the selected API methods
    } else {
        let index, key, mapping, names, value;
        
        if( typeof selection === 'string' ){
            names = selection.split( ' ' );
            mapping = API;
        } else {
            names = Object.keys( selection );
            mapping = selection;
        }
        
        index = names.length;
        
        while( index-- ){
            key = names[ index ];
            value = mapping[ key ];
            
            target[ key ] = typeof value === 'function' ?
                value :
                API[ value ];
        }
    }
}

/**
 * A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, `toString()`, and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.
 * 
 * Like all functional mixins, this should be executed with [call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or [apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).
 * @mixin Emitter~asEmitter
 * @example <caption>Applying Emitter functionality</caption>
 * // Create a base object
 * const greeter = Object.create( null );
 * 
 * // Apply the mixin
 * asEmitter.call( greeter );
 * 
 * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'World' );
 * // Hello, World!
 * @example <caption>Applying chaos to your world</caption>
 * // NO!!!
 * Emitter.asEmitter(); // Madness ensues
 */
function asEmitter(){
    
    /**
     * Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.
     * 
     * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
     * @function Emitter~asEmitter.at
     * @param {EventType} [type] The event type.
     * @param {external:number} index Where the listener will be added in the trigger list.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     * @fires Emitter#:on
     * @fires Emitter#:maxListeners
     */
    this.at = function( type, index, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'number' && typeof index === 'function' && typeof listener === 'undefined' ){
            listener = index;
            index = type;
            type = $every;
        }
        
        if( isPositiveNumber( index ) ){
            throw new TypeError( 'index must be a positive number' );
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        addEventListener( this, type, listener, index );
        
        return this;
    };
    
    /**
     * Remove all listeners, or those for the specified event `type`.
     * @function Emitter~asEmitter.clear
     * @param {String} [type] The event type.
     * @returns {Emitter} The emitter.
     * @example <caption>Clearing all event types</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.on( 'hi', () => console.log( 'Hi!' ) );
     * greeter.emit( 'hello' );
     * // Hello!
     * greeter.emit( 'hi' );
     * // Hi!
     * greeter.clear();
     * greeter.emit( 'hello' );
     * greeter.emit( 'hi' );
     * @example <caption>Clearing a specified event type</caption>
     * const greeter = new Emitter();
     * greeter.on( {
     *  'hello' : function(){ console.log( 'Hello!' ); },
     *  'hi'    : function(){ console.log( 'Hi!' ); }
     * } );
     * greeter.emit( 'hello' );
     * // Hello!
     * greeter.emit( 'hi' );
     * // Hi!
     * greeter.clear( 'hello' );
     * greeter.emit( 'hello' );
     * greeter.emit( 'hi' );
     * // Hi!
     */
    this.clear = function( type ){
        let handler;
        
        // No Events
        if( !this[ $events ] ){
            return this;
        }
        
        // With no "off" listeners, clearing can be simplified
        if( !this[ $events ][ ':off' ] ){
            if( arguments.length === 0 ){
                this[ $events ] = new Null();
            } else if( this[ $events ][ type ] ){
                delete this[ $events ][ type ];
            }
            
            return this;
        }
        
        // Clear all listeners
        if( arguments.length === 0 ){
            const types = getEventTypes( this );
            
            // Avoid removing "off" listeners until all other types have been removed
            for( let index = 0, length = types.length; index < length; index += 1 ){
                if( types[ index ] === ':off' ){
                    continue;
                }
                
                this.clear( types[ index ] );
            }
            
            // Manually clear "off"
            this.clear( ':off' );
            
            this[ $events ] = new Null();
            
            return this;
        }
        
        handler = this[ $events ][ type ];
        
        if( typeof handler === 'function' ){
            removeEventListener( this, type, handler );
        } else if( Array.isArray( handler ) ){
            let index = handler.length;
            
            while( index-- ){
                removeEventListener( this, type, handler[ index ] );
            }
        }
        
        delete this[ $events ][ type ];
        
        return this;
    };
    
    /**
     * Execute the listeners for the specified event `type` with the supplied arguments.
     * 
     * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
     * 
     * Returns `true` if the event had listeners, `false` otherwise.
     * @function Emitter~asEmitter.emit
     * @param {EventType} type The event type.
     * @param {...*} [data] The data passed into the listeners.
     * @returns {external:boolean} Whether or not the event had listeners.
     * @example <caption>Emitting an event</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.emit( 'hello' );    // true
     * // Hello!
     * greeter.emit( 'goodbye' );  // false
     * @example <caption>Emitting an event with data</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * @example <caption>Emitting a namespaced event</caption>
     * const greeter = new Emitter();
     * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
     * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
     * 
     * // This event will not be triggered by emitting "greeting:hello"
     * greeter.on( 'hello', ( name ) => console.log( `Hello again, ${ name }` );
     * 
     * greeter.emit( 'greeting:hi', 'Mark' );
     * // Hi, Mark!
     * // Mark was greeted.
     * 
     * greeter.emit( 'greeting:hello', 'Jeff' );
     * // Hello, Jeff!
     * // Jeff was greeted.
     */
    this.emit = function( type, ...data ){
        return emitAllEvents( this, type, data );
    };
    
    /**
     * @function Emitter~asEmitter.eventTypes
     * @returns {Array<EventType>} The list of event types registered to the emitter.
     * @example
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( `Hello` ) );
     * greeter.on( 'hi', () => console.log( `Hi` ) );
     * 
     * console.log( greeter.eventTypes() );
     * // [ 'hello', 'hi' ]
     */ 
    this.eventTypes = function(){
        return getEventTypes( this );
    };
    
    /**
     * @function Emitter~asEmitter.first
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     */
    this.first = function( type, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = $every;
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        addEventListener( this, type, listener, 0 );
        
        return this;
    };
    
    /**
     * @function Emitter~asEmitter.getMaxListeners
     * @returns {external:number} The maximum number of listeners.
     */
    this.getMaxListeners = function(){
        return getMaxListeners( this );
    };
    
    /**
     * @function Emitter~asEmitter.listenerCount
     * @param {EventType} type The event type.
     * @returns {external:number} The number of listeners for that event type within the given emitter.
     * @example
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * console.log( greeter.listenerCount( 'hello' ) );
     * // 1
     * console.log( greeter.listenerCount( 'goodbye' ) );
     * // 0
     */ 
    this.listenerCount = function( type ){
        let count;

        // Empty
        if( !this[ $events ] || !this[ $events ][ type ] ){
            count = 0;
        
        // Function
        } else if( typeof this[ $events ][ type ] === 'function' ){
            count = 1;
        
        // Array
        } else {
            count = this[ $events ][ type ].length;
        }
        
        return count;
    };
    
    /**
     * @function Emitter~asEmitter.listeners
     * @param {EventType} type The event type.
     * @returns {external:number} The number of listeners for that event type within the given emitter.
     * @example
     * const hello = function(){
     *  console.log( 'Hello!' );
     * },
     *  greeter = new Emitter();
     * 
     * greeter.on( 'hello', hello );
     * greeter.emit( 'hello' );
     * // Hello!
     * 
     * console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
     * // true
     */ 
    this.listeners = function( type ){
        let listeners;
        
        if( !this[ $events ] || !this[ $events ][ type ] ){
            listeners = [];
        } else {
            const handler = this[ $events ][ type ];
            
            if( typeof handler === 'undefined' ){
                listeners = [];
            } else if( typeof handler === 'function' ){
                listeners = [ handler ];
            } else {
                listeners = handler.slice();
            }
        }
        
        return listeners;
    };

    /**
     * Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
     * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
     * @function Emitter~asEmitter.many
     * @param {EventType} type The event type.
     * @param {external:number} times The number times the listener will be executed before being removed.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     * @example <caption>Listen to any event type a set number of times</caption>
     * const greeter = new Emitter();
     * greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
     * greeter.emit( 'hello', 'Jeff' );    // 1
     * // Greeted Jeff
     * greeter.emit( 'hi', 'Terry' );      // 2
     * // Greeted Terry
     * greeter.emit( 'yo', 'Steve' );      // 3
     * @example <caption>Listen to the specified event type a set number of times</caption>
     * const greeter = new Emitter();
     * greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'Jeff' );    // 1
     * // Hello, Jeff!
     * greeter.emit( 'hello', 'Terry' );   // 2
     * // Hello, Terry!
     * greeter.emit( 'hello', 'Steve' );   // 3
     */ 
    this.many = function( type = $every, times, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'number' && typeof times === 'function' && typeof listener === 'undefined' ){
            listener = times;
            times = type;
            type = $every;
        }
        
        if( !isPositiveNumber( times ) ){
            throw new TypeError( 'times must be a positive number' );
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        addFiniteEventListener( this, type, times, listener );
        
        return this;
    };
    
    /**
     * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
     * 
     * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
     * @function Emitter~asEmitter.off
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     * @fires Emitter#:off
     * @example <caption>Remove a listener from any event type</caption>
     * function greet( name ){
     *  console.log( `Greetings, ${ name }!` );
     * }
     * 
     * const greeter = new Emitter();
     * greeter.on( greet );
     * greeter.emit( 'hello' 'Jeff' );
     * // Greetings, Jeff!
     * greeter.emit( 'hi' 'Jeff' );
     * // Greetings, Jeff!
     * greeter.off( greet );
     * greeter.emit( 'yo', 'Jeff' );
     * @example <caption>Remove a listener from a specified event type</caption>
     * function hello( name ){
     *  console.log( `Hello, ${ name }!` );
     * }
     * 
     * const greeter = new Emitter();
     * greeter.on( 'hello', hello );
     * greeter.emit( 'hello', 'Jeff' );
     * // Hello, Jeff!
     * greeter.off( 'hello', hello );
     * greeter.emit( 'hello', 'Jeff' );
     */ 
    this.off = function( type = $every, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = $every;
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        if( !this[ $events ] || !this[ $events ][ type ] ){
            return this;
        }
        
        removeEventListener( this, type, listener );
        
        return this;
    };
    
    /**
     * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
     * 
     * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
     * @function Emitter~asEmitter.on
     * @param {EventType} [type] The event type.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     * @fires Emitter#:on
     * @fires Emitter#:maxListeners
     * @example <caption>Listen to all event types</caption>
     * const greeter = new Emitter();
     * greeter.on( () => console.log( 'Greeted' ) );
     * greeter.emit( 'hello' );
     * // Greeted
     * greeter.emit( 'goodbye' );
     * // Greeted
     * @example <caption>Listener to a specified event type</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * greeter.emit( 'hi', 'World' );
     */
    this.on = function(){
        let type = arguments[ 0 ] || $every,
            listener = arguments[ 1 ];
        
        if( typeof listener === 'undefined' ){
            
            // Type not provided, fall back to "$every"
            if( typeof type === 'function' ){
                listener = type;
                type = $every;
            
            // Plain object of event bindings
            } else if( typeof type === 'object' ){
                addEventMapping( this, type );
                
                return this;
            }
        }
        
        addEventListener( this, type, listener, NaN );
        
        return this;
    };
    
    /**
     * @function Emitter~asEmitter.once
     * @param {EventType} [type] The event type.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     * @fires Emitter#:on
     * @fires Emitter#:maxListeners
     * const greeter = new Emitter();
     * greeter.once( () => console.log( 'Greeted' ) );
     * greeter.emit( 'hello' );
     * // Greeted
     * greeter.emit( 'goodbye' );
     * @example <caption>Listen once to all event types</caption>
     * const greeter = new Emitter();
     * greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * greeter.emit( 'hello', 'World' );
     */
    this.once = function( type = $every, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = $every;
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        addFiniteEventListener( this, type, 1, listener );
        
        return this;
    };
    
    /**
     * @function Emitter~asEmitter.setMaxListeners
     * @param {external:number} max The maximum number of listeners before a warning is issued.
     * @returns {Emitter} The emitter.
     */
    this.setMaxListeners = function( max ){
        setMaxListeners( this, max );
        return this;
    };
    
    /**
     * Asynchronously emits specified event `type` with the supplied arguments. The listeners will still be synchronously executed in the specified order.
     * 
     * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
     * 
     * Returns a Promise.
     * @function Emitter~asEmitter.tick
     * @param {EventType} type The event type.
     * @param {...*} [data] The data passed into the listeners.
     * @returns {external:Promise} A promise which resolves when the listeners have completed execution but rejects if an error was thrown.
     * @example <caption>Asynchronously emitting an event</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
     * greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
     * // Hello!
     * // hello heard? true
     * // goodbye heard? false
     */
    this.tick = function( type, ...data ){
        return tickAllEvents( this, type, data );
    };
    
    /**
     * Execute the listeners for the specified event `type` with the supplied `data`.
     * 
     * Returns `true` if the event had listeners, `false` otherwise.
     * @function Emitter~asEmitter.trigger
     * @param {EventType} [type] The event type.
     * @param {external:Array} data
     * @returns {external:boolean} Whether or not the event had listeners.
     * const greeter = new Emitter();
     * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.trigger( 'hello', [ 'World' ] );
     * // Hello, World!
     * @example
     * const greeter = new Emitter();
     * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
     * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
     * 
     * greeter.trigger( 'greeting:hi', [ 'Mark' ] );
     * // Hi, Mark!
     * // Mark was greeted.
     * 
     * greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
     * // Hello, Jeff!
     * // Jeff was greeted.
     */
    this.trigger = function( type, data = [] ){
        return emitAllEvents( this, type, data );
    };
    
    /**
     * Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.
     * 
     * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
     * @function Emitter~asEmitter.until
     * @param {EventType} [type] The event type.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     * @example
     * const greeter = new Emitter();
     * greeter.until( function( name ){
     *  console.log( `Greeted ${ name }` );
     *  return name === 'Terry';
     * } );
     * greeter.emit( 'hello', 'Jeff' );
     * // Greeted Jeff
     * greeter.emit( 'goodbye', 'Terry' );
     * // Greeted Terry
     * greeter.emit( 'hi', 'Aaron' );
     * @example
     * const greeter = new Emitter();
     * greeter.until( 'hello', function( name ){
     *  console.log( `Hello, ${ name }!` );
     *  return name === 'World';
     * } );
     * greeter.emit( 'hello', 'Jeff' );
     * // Hello, Jeff!
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * greeter.emit( 'hello', 'Mark' );
     */
    this.until = function( type = $every, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = $every;
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        addConditionalEventListener( this, type, listener );
        
        return this;
    };
}

asEmitter.call( API );

/**
 * Applies the Emitter.js API to the target.
 * @function Emitter
 * @param {external:string|external:Object} [selection] A selection of the Emitter.js API that will be applied to the `target`.
 * @param {exteral:Object} target The object to which the Emitter.js API will be applied.
 * @example <caption>Applying all of the API</caption>
 * let greeter = Object.create( null );
 * Emitter( greeter );
 * greeter.on( 'hello', () => console.log( 'Hello!' ) );
 * greeter.emit( 'hello' );
 * // Hello!
 * @example <caption>Applying a selection of the API</caption>
 * let greeter = Object.create( null );
 * Emitter( 'emit on off', greeter );
 * greeter.on( 'hello', () => console.log( 'Hello!' ) );
 * greeter.emit( 'hello' );
 * // Hello!
 * @example <caption>Remapping a selection of the API</caption>
 * let greeter = Object.create( null );
 * Emitter( { fire: 'emit', addListener: 'on' }, greeter );
 * greeter.addListener( 'hello', () => console.log( 'Hello!' ) );
 * greeter.fire( 'hello' );
 * // Hello!
 */
 
/**
 * Creates an instance of emitter. If `mapping` are provided they will automatically be passed into `on()` once construction is complete.
 * @class Emitter
 * @classdesc An object that emits named events which cause functions to be executed.
 * @extends Emitter~Null
 * @mixes Emitter~asEmitter
 * @param {EventMapping} [mapping] A mapping of event types to event listeners.
 * @see {@link https://github.com/nodejs/node/blob/master/lib/events.js}
 * @example <caption>Using Emitter directly</caption>
 * const greeter = new Emitter();
 * greeter.on( 'hello', () => console.log( 'Hello!' ) );
 * greeter.emit( 'hello' );
 * // Hello!
 * @example <caption>Extending Emitter using Classical inheritance</caption>
 * class Greeter extends Emitter {
 *  constructor(){
 *      super();
 *      this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
 *  }
 * 
 *  greet( name ){
 *      this.emit( 'greet', name );
 *  }
 * }
 * 
 * const greeter = new Greeter();
 * greeter.greet( 'Jeff' );
 * // Hello, Jeff!
 * @example <caption>Extending Emitter using Prototypal inheritance</caption>
 * function Greeter(){
 *  Emitter.call( this );
 *  this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
 * }
 * Greeter.prototype = Object.create( Emitter.prototype );
 * 
 * Greeter.prototype.greet = function( name ){
 *  this.emit( 'greet', name );
 * };
 * 
 * const greeter = new Greeter();
 * greeter.greet( 'Jeff' );
 * // Hello, Jeff!
 * @example <caption>Namespaced events</caption>
 * const greeter = new Emitter();
 * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
 * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
 * greeter.emit( 'greeting:hi', 'Mark' );
 * greeter.emit( 'greeting:hello', 'Jeff' );
 * // Hi, Mark!
 * // Mark was greeted.
 * // Hello, Jeff!
 * // Jeff was greeted.
 * @example <caption>Predefined events</caption>
 * const greetings = {
 *      hello: function( name ){ console.log( `Hello, ${name}!` ),
 *      hi: function( name ){ console.log( `Hi, ${name}!` )
 *  },
 *  greeter = new Emitter( greetings );
 * 
 * greeter.emit( 'hello', 'Aaron' );
 * // Hello, Aaron!
 * @example <caption>One-time events</caption>
 * const greeter = new Emitter();
 * greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'Jeff' );
 * greeter.emit( 'hello', 'Terry' );
 * // Hello, Jeff!
 * @example <caption>Many-time events</caption>
 * const greeter = new Emitter();
 * greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'Jeff' );     // 1
 * greeter.emit( 'hello', 'Terry' );    // 2
 * greeter.emit( 'hello', 'Steve' );    // 3
 * // Hello, Jeff!
 * // Hello, Terry!
 */
export default function Emitter(){
    
    // Called as constructor
    if( typeof this !== 'undefined' && this.constructor === Emitter ){
        let mapping = arguments[ 0 ];
        typeof mapping !== 'undefined' && addEventMapping( this, mapping );
        
        Object.defineProperty( this, 'maxListeners', {
            get: function(){
                return getMaxListeners( this );
            },
            set: function( max ){
                setMaxListeners( this, max );
            },
            configurable: true,
            enumerable: false
        } );
    
    // Called as function
    } else {
        let selection = arguments[ 0 ],
            target = arguments[ 1 ];
        
        // Shift arguments
        if( typeof target === 'undefined' ){
            target = selection;
            selection = API;
        }
        
        toEmitter( selection, target );
    }
}

Object.defineProperties( Emitter, {
    /**
     * Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.
     * 
     * By default Emitter will emit a `:maxListeners` event if more than 10 listeners are added to a specific event type.
     * @member {external:number} Emitter.defaultMaxListeners=10
     * @example <caption>Changing the default maximum listeners</caption>
     * console.log( Emitter.defaultMaxListeners );
     * // 10
     * 
     * const greeter1 = new Emitter(),
     *  greeter2 = new Emitter();
     * 
     * Emitter.defaultMaxListeners = 1;
     * 
     * greeter1.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
     * greeter1.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter1.on( 'hello', () => alert( 'Hello!' ) );
     * // Greeting "hello" has one too many!
     * 
     * greeter2.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
     * greeter2.on( 'hi', () => console.log( 'Hi!' ) );
     * greeter2.on( 'hi', () => alert( 'Hi!' ) );
     * // Greeting "hi" has one too many!
     * 
     */
    defaultMaxListeners: {
        value: 10,
        configurable: true,
        enumerable: false,
        writable: true
    },
    /**
     * The symbol used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.
     * 
     * Using `Emitter.every` is typically not necessary.
     * @member {external:symbol} Emitter.every
     * @example
     * const greeter = new Emitter();
     * greeter.on( Emitter.every, () => console.log( 'Greeted' ) );
     * greeter.emit( 'hello' );
     * // Greeted
     * greeter.emit( 'goodbye' );
     * // Greeted
     */
    every: {
        value: $every,
        configurable: true,
        enumerable: false,
        writable: false
    },
    /**
     * The current version of *Emitter.js*.
     * @member {external:string} Emitter.version
     * @example
     * console.log( Emitter.version );
     * // 2.0.0
     */
    version: {
        value: '2.0.0',
        configurable: false,
        enumerable: false,
        writable: false
    }
} );

Emitter.prototype = new Null();

Emitter.prototype.constructor = Emitter;

asEmitter.call( Emitter.prototype );

/**
 * Destroys the emitter.
 * @fires Emitter#:destroy
 */
Emitter.prototype.destroy = function(){
    emitEvent( this, ':destroy', [], true );
    this.clear();
    this.destroy = this.at = this.clear = this.emit = this.eventTypes = this.first = this.getMaxListeners = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.setMaxListeners = this.tick = this.trigger = this.until = noop;
    this.toJSON = () => 'destroyed';
};

/**
 * @returns {external:Object} An plain object representation of the emitter.
 * @example
 * const greeter = new Emitter();
 * greeter.maxListeners = 5;
 * greeter.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.on( 'greet', ( name ) => console.log( `Hi, ${ name }!` ) );
 * 
 * console.log( greeter.toJSON() );
 * // { "maxListeners": 5, "listenerCount": { "greet": 2 } }
 * 
 * greeter.destroy();
 * 
 * console.log( greeter.toJSON() );
 * // "destroyed"
 */
Emitter.prototype.toJSON = function(){
    const json = new Null(),
        types = Object.keys( this[ $events ] ),
        length = types.length;
        
    let index = 0,
        type;
    
    json.maxListeners = this.maxListeners;
    json.listenerCount = new Null();
    
    for( ; index < length; index++ ){
        type = types[ index ];
        json.listenerCount[ type ] = this.listenerCount( type );
    }
    
    return json;
};

/**
 * @returns {external:string} A string representation of the emitter.
 * @example
 * const greeter = new Emitter();
 * greeter.maxListeners = 5;
 * greeter.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.on( 'greet', ( name ) => console.log( `Hi, ${ name }!` ) );
 * 
 * console.log( greeter.toString() );
 * // 'Emitter { "maxListeners": 5, "listenerCount": { "greet": 2 } }'
 * 
 * greeter.destroy();
 * 
 * console.log( greeter.toString() );
 * // 'Emitter "destroyed"'
 */
Emitter.prototype.toString = function(){
    return `${ this.constructor.name } ${ JSON.stringify( this.toJSON() ) }`.trim();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbWl0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEFycmF5XG4gKiBAZXh0ZXJuYWwgQXJyYXlcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5fVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJtNDU0bXVuMyFpbWl0aXZlfHByaW1pdGl2ZX0gYm9vbGVhblxuICogQGV4dGVybmFsIGJvb2xlYW5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Jvb2xlYW59XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBFcnJvclxuICogQGV4dGVybmFsIEVycm9yXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvcn1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEZ1bmN0aW9uXG4gKiBAZXh0ZXJuYWwgRnVuY3Rpb25cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9ufVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IG51bWJlclxuICogQGV4dGVybmFsIG51bWJlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyfVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IG51bGxcbiAqIEBleHRlcm5hbCBudWxsXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9udWxsfVxuICovXG4gXG4vKipcbiAqIEphdmFTY3JpcHQgT2JqZWN0XG4gKiBAZXh0ZXJuYWwgT2JqZWN0XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3R9XG4gKi9cblxuLyoqXG4gKiBKYXZhU2NyaXB0IFByb21pc2VcbiAqIEBleHRlcm5hbCBQcm9taXNlXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm9taXNlfVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzdHJpbmdcbiAqIEBleHRlcm5hbCBzdHJpbmdcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZ31cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN5bWJvbFxuICogQGV4dGVybmFsIHN5bWJvbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3ltYm9sfVxuICovXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6c3RyaW5nfSBvciB7QGxpbmsgZXh0ZXJuYWw6c3ltYm9sfSB0aGF0IHJlcHJlc2VudHMgdGhlIHR5cGUgb2YgZXZlbnQgZmlyZWQgYnkgdGhlIEVtaXR0ZXIuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOnN5bWJvbH0gRXZlbnRUeXBlXG4gKi8gXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258IGZ1bmN0aW9ufSBib3VuZCB0byBhbiBlbWl0dGVyIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZX0uIEFueSBkYXRhIHRyYW5zbWl0dGVkIHdpdGggdGhlIGV2ZW50IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVyIGFzIGFyZ3VtZW50cy5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHsuLi4qfSBkYXRhIFRoZSBhcmd1bWVudHMgcGFzc2VkIGJ5IHRoZSBgZW1pdGAuXG4gKi9cblxuLyoqXG4gKiBBbiB7QGxpbmsgZXh0ZXJuYWw6T2JqZWN0fG9iamVjdH0gdGhhdCBtYXBzIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZXN9IHRvIHtAbGluayBFdmVudExpc3RlbmVyfGV2ZW50IGxpc3RlbmVyc30uXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6T2JqZWN0fSBFdmVudE1hcHBpbmdcbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOlByb21pc2V8cHJvbWlzZX0gcmV0dXJuZWQgd2hlbiBhbiBldmVudCBpcyBlbWl0dGVkIGFzeW5jaHJvbm91c2x5LiBJdCByZXNvbHZlcyB3aXRoIHtAbGluayBFdmVudFN1Y2Nlc3N9IGFuZCByZWplY3RzIHdpdGgge0BsaW5rIEV2ZW50RmFpbHVyZX0uXG4gKiBAdHlwZWRlZiBFdmVudFByb21pc2VcbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBFdmVudFN1Y2Nlc3NcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gc3RhdHVzIFdoZXRoZXIgb3Igbm90IHRoZSBzcGVjaWZpZWQgdHlwZSBvZiBldmVudCBoYWQgbGlzdGVuZXJzLlxuICovXG5cbi8qKlxuICogQGNhbGxiYWNrIEV2ZW50RmFpbHVyZVxuICogQHBhcmFtIHtleHRlcm5hbDpFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRocm93biBkdXJpbmcgbGlzdGVuZXIgZXhlY3V0aW9uLlxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGFuIGVtaXR0ZXIgZGVzdHJveXMgaXRzZWxmLlxuICogQGV2ZW50IEVtaXR0ZXIjOmRlc3Ryb3lcbiAqLyBcblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2FmdGVyXyBhIGxpc3RlbmVyIGlzIHJlbW92ZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b2ZmXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYSBsaXN0ZW5lciBpcyBhZGRlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvblxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIG9uY2UgdGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBoYXMgYmVlbiBleGNlZWRlZCBmb3IgYW4gZXZlbnQgdHlwZS5cbiAqIEBldmVudCBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgRW1pdHRlcn5OdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbDtcblxuY29uc3RcbiAgICAkZXZlbnRzICAgICAgID0gJ0BAZW1pdHRlci9ldmVudHMnLFxuICAgICRldmVyeSAgICAgICAgPSAnQEBlbWl0dGVyL2V2ZXJ5JyxcbiAgICAkbWF4TGlzdGVuZXJzID0gJ0BAZW1pdHRlci9tYXhMaXN0ZW5lcnMnLFxuICAgIFxuICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICBcbiAgICBub29wID0gZnVuY3Rpb24oKXt9LFxuICAgIFxuICAgIEFQSSA9IG5ldyBOdWxsKCk7XG5cbi8vIE1hbnkgb2YgdGhlc2UgZnVuY3Rpb25zIGFyZSBicm9rZW4gb3V0IGZyb20gdGhlIHByb3RvdHlwZSBmb3IgdGhlIHNha2Ugb2Ygb3B0aW1pemF0aW9uLiBUaGUgZnVuY3Rpb25zIG9uIHRoZSBwcm90b3l0eXBlXG4vLyB0YWtlIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGFzIGEgcmVzdWx0LiBUaGVzZSBmdW5jdGlvbnMgaGF2ZSBhIGZpeGVkIG51bWJlciBvZiBhcmd1bWVudHNcbi8vIGFuZCB0aGVyZWZvcmUgZG8gbm90IGdldCBkZW9wdGltaXplZC5cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIgKXtcbiAgICBcbiAgICBmdW5jdGlvbiBjb25kaXRpb25hbExpc3RlbmVyKCl7XG4gICAgICAgIGNvbnN0IGRvbmUgPSBsaXN0ZW5lci5hcHBseSggZW1pdHRlciwgYXJndW1lbnRzICk7XG4gICAgICAgIGlmKCBkb25lID09PSB0cnVlICl7XG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBjb25kaXRpb25hbExpc3RlbmVyICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETyBDaGVjayBiZXlvbmQganVzdCBvbmUgbGV2ZWwgb2YgbGlzdGVuZXIgcmVmZXJlbmNlc1xuICAgIGNvbmRpdGlvbmFsTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lci5saXN0ZW5lciB8fCBsaXN0ZW5lcjtcbiAgICBcbiAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBjb25kaXRpb25hbExpc3RlbmVyLCBOYU4gKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApe1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgaWYoIF9ldmVudHNbICc6b24nIF0gKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9uJywgWyB0eXBlLCB0eXBlb2YgbGlzdGVuZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEVtaXR0aW5nIFwib25cIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgX2V2ZW50c1sgJzpvbicgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzpvbicgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgaWYoICFfZXZlbnRzWyB0eXBlIF0gKXtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gbGlzdGVuZXI7XG4gICAgXG4gICAgLy8gTXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBfZXZlbnRzWyB0eXBlIF0gKSApe1xuICAgICAgICBzd2l0Y2goIGlzTmFOKCBpbmRleCApIHx8IGluZGV4ICl7XG4gICAgICAgICAgICBjYXNlIHRydWU6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnVuc2hpZnQoIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5zcGxpY2UoIGluZGV4LCAwLCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgXG4gICAgLy8gVHJhbnNpdGlvbiBmcm9tIHNpbmdsZSB0byBtdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBpbmRleCA9PT0gMCA/XG4gICAgICAgICAgICBbIGxpc3RlbmVyLCBfZXZlbnRzWyB0eXBlIF0gXSA6XG4gICAgICAgICAgICBbIF9ldmVudHNbIHR5cGUgXSwgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gVHJhY2sgd2FybmluZ3MgaWYgbWF4IGxpc3RlbmVycyBpcyBhdmFpbGFibGVcbiAgICBpZiggJ21heExpc3RlbmVycycgaW4gZW1pdHRlciAmJiAhX2V2ZW50c1sgdHlwZSBdLndhcm5lZCApe1xuICAgICAgICBjb25zdCBtYXggPSBlbWl0dGVyLm1heExpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCBtYXggJiYgbWF4ID4gMCAmJiBfZXZlbnRzWyB0eXBlIF0ubGVuZ3RoID4gbWF4ICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6bWF4TGlzdGVuZXJzJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEVtaXR0aW5nIFwibWF4TGlzdGVuZXJzXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgICAgICBfZXZlbnRzWyAnOm1heExpc3RlbmVycycgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzptYXhMaXN0ZW5lcnMnIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVtaXR0ZXJbICRldmVudHMgXSA9IF9ldmVudHM7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRmluaXRlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICBcbiAgICBmdW5jdGlvbiBmaW5pdGVMaXN0ZW5lcigpe1xuICAgICAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIHJldHVybiAtLXRpbWVzID09PSAwO1xuICAgIH1cbiAgICBcbiAgICBmaW5pdGVMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgZmluaXRlTGlzdGVuZXIgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudE1hcHBpbmdcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBtYXBwaW5nIFRoZSBldmVudCBtYXBwaW5nLlxuICovXG5mdW5jdGlvbiBhZGRFdmVudE1hcHBpbmcoIGVtaXR0ZXIsIG1hcHBpbmcgKXtcbiAgICBjb25zdFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCBtYXBwaW5nICksXG4gICAgICAgIHR5cGVMZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgXG4gICAgbGV0IHR5cGVJbmRleCA9IDAsXG4gICAgICAgIGhhbmRsZXIsIGhhbmRsZXJJbmRleCwgaGFuZGxlckxlbmd0aCwgdHlwZTtcbiAgICBcbiAgICBmb3IoIDsgdHlwZUluZGV4IDwgdHlwZUxlbmd0aDsgdHlwZUluZGV4ICs9IDEgKXtcbiAgICAgICAgdHlwZSA9IHR5cGVzWyB0eXBlSW5kZXggXTtcbiAgICAgICAgaGFuZGxlciA9IG1hcHBpbmdbIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIC8vIExpc3Qgb2YgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGhhbmRsZXJJbmRleCA9IDA7XG4gICAgICAgICAgICBoYW5kbGVyTGVuZ3RoID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIDsgaGFuZGxlckluZGV4IDwgaGFuZGxlckxlbmd0aDsgaGFuZGxlckluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyWyBoYW5kbGVySW5kZXggXSwgTmFOICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXIsIE5hTiApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmRlZmluZUV2ZW50c1Byb3BlcnR5XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIHByb3BlcnR5IHdpbGwgYmUgY3JlYXRlZC5cbiAqLyBcbmZ1bmN0aW9uIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCB2YWx1ZSApe1xuICAgIGNvbnN0IGhhc0V2ZW50cyA9IGhhc093blByb3BlcnR5LmNhbGwoIGVtaXR0ZXIsICRldmVudHMgKSxcbiAgICAgICAgZW1pdHRlclByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiggZW1pdHRlciApO1xuICAgICAgICBcbiAgICBpZiggIWhhc0V2ZW50cyB8fCAoIGVtaXR0ZXJQcm90b3R5cGUgJiYgZW1pdHRlclsgJGV2ZW50cyBdID09PSBlbWl0dGVyUHJvdG90eXBlWyAkZXZlbnRzIF0gKSApe1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRldmVudHMsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0QWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIC8vIElmIHR5cGUgaXMgbm90IGEgc3RyaW5nLCBpbmRleCB3aWxsIGJlIGZhbHNlXG4gICAgICAgIGluZGV4ID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIFxuICAgIC8vIE5hbWVzcGFjZWQgZXZlbnQsIGUuZy4gRW1pdCBcImZvbzpiYXI6cXV4XCIsIHRoZW4gXCJmb286YmFyXCJcbiAgICB3aGlsZSggaW5kZXggPiAwICl7XG4gICAgICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZmFsc2UgKSApIHx8IGV4ZWN1dGVkO1xuICAgICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoIDAsIGluZGV4ICk7XG4gICAgICAgIGluZGV4ID0gdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVtaXQgc2luZ2xlIGV2ZW50IG9yIHRoZSBuYW1lc3BhY2VkIGV2ZW50IHJvb3QsIGUuZy4gXCJmb29cIiwgXCI6YmFyXCIsIFN5bWJvbCggXCJAQHF1eFwiIClcbiAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIHRydWUgKSApIHx8IGV4ZWN1dGVkO1xuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXJyb3JzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGBlcnJvcnNgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7QXJyYXk8ZXh0ZXJuYWw6RXJyb3I+fSBlcnJvcnMgVGhlIGFycmF5IG9mIGVycm9ycyB0byBiZSBlbWl0dGVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKXtcbiAgICBjb25zdCBsZW5ndGggPSBlcnJvcnMubGVuZ3RoO1xuICAgIGZvciggbGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnZXJyb3InLCBbIGVycm9yc1sgaW5kZXggXSBdLCBmYWxzZSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXZlbnRcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGVtaXRFdmVyeSBXaGV0aGVyIG9yIG5vdCBsaXN0ZW5lcnMgZm9yIGFsbCB0eXBlcyB3aWxsIGJlIGV4ZWN1dGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGVtaXRFdmVyeSApe1xuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcjtcbiAgICBcbiAgICBpZiggdHlwZSA9PT0gJ2Vycm9yJyAmJiAhX2V2ZW50cy5lcnJvciApe1xuICAgICAgICBjb25zdCBlcnJvciA9IGRhdGFbIDAgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCBlcnJvciBpbnN0YW5jZW9mIEVycm9yICl7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gdHlwZSBvZiBldmVudFxuICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgdHlwZSBdO1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBsaXN0ZW5pbmcgZm9yIGFsbCB0eXBlcyBvZiBldmVudHNcbiAgICBpZiggZW1pdEV2ZXJ5ICl7XG4gICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgJGV2ZXJ5IF07XG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbGlzdGVuZXIgdXNpbmcgdGhlIGludGVybmFsIGBleGVjdXRlKmAgZnVuY3Rpb25zIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZUxpc3RlbmVyXG4gKiBAcGFyYW0ge0FycmF5PExpc3RlbmVyPnxMaXN0ZW5lcn0gbGlzdGVuZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7Kn0gc2NvcGVcbiAqLyBcbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIHNjb3BlICl7XG4gICAgY29uc3QgaXNGdW5jdGlvbiA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJztcbiAgICBcbiAgICBzd2l0Y2goIGRhdGEubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGxpc3RlbkVtcHR5ICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgbGlzdGVuT25lICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxpc3RlblR3byAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGxpc3RlblRocmVlICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSwgZGF0YVsgMiBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxpc3Rlbk1hbnkgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0RXZlbnRUeXBlc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIGV2ZW50IHR5cGVzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50VHlwZXMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoIGVtaXR0ZXJbICRldmVudHMgXSApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIG1heCBsaXN0ZW5lcnMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgICBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gOlxuICAgICAgICBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5pc1Bvc2l0aXZlTnVtYmVyXG4gKiBAcGFyYW0geyp9IG51bWJlciBUaGUgdmFsdWUgdG8gYmUgdGVzdGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqL1xuZnVuY3Rpb24gaXNQb3NpdGl2ZU51bWJlciggbnVtYmVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInICYmIG51bWJlciA+PSAwICYmICFpc05hTiggbnVtYmVyICk7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggbm8gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuRW1wdHlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5FbXB0eSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggb25lIGFyZ3VtZW50LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuT25lXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk9uZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0d28gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVHdvXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVHdvKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHRocmVlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblRocmVlXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMyBUaGUgdGhpcmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblRocmVlKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIGZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5NYW55XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGFyZ3MgRm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTWFueSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJncyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnJlbW92ZUV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgLy8gRGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IGhhbmRsZXIgPSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICBcbiAgICBpZiggaGFuZGxlciA9PT0gbGlzdGVuZXIgfHwgKCB0eXBlb2YgaGFuZGxlci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJiBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBcbiAgICAgICAgZm9yKCBsZXQgaSA9IGhhbmRsZXIubGVuZ3RoOyBpLS0gPiAwOyApe1xuICAgICAgICAgICAgaWYoIGhhbmRsZXJbIGkgXSA9PT0gbGlzdGVuZXIgfHwgKCBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgJiYgaGFuZGxlclsgaSBdLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXG4gICAgICAgIGlmKCBpbmRleCA+IC0xICl7XG4gICAgICAgICAgICBpZiggaGFuZGxlci5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcGxpY2VMaXN0KCBoYW5kbGVyLCBpbmRleCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zZXRNYXhMaXN0ZW5lcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyB3aWxsIGJlIHNldC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cbiAqL1xuZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyLCBtYXggKXtcbiAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIG1heCApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdtYXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICB9XG4gICAgXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkbWF4TGlzdGVuZXJzLCB7XG4gICAgICAgIHZhbHVlOiBtYXgsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSApO1xufVxuXG4vKipcbiAqIEZhc3RlciB0aGFuIGBBcnJheS5wcm90b3R5cGUuc3BsaWNlYFxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c3BsaWNlTGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gbGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi8gXG5mdW5jdGlvbiBzcGxpY2VMaXN0KCBsaXN0LCBpbmRleCApe1xuICAgIGZvciggbGV0IGkgPSBpbmRleCwgaiA9IGkgKyAxLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaiA8IGxlbmd0aDsgaSArPSAxLCBqICs9IDEgKXtcbiAgICAgICAgbGlzdFsgaSBdID0gbGlzdFsgaiBdO1xuICAgIH1cbiAgICBcbiAgICBsaXN0LnBvcCgpO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGV4ZWN1dGVzIGEgZnVuY3Rpb24uXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRpY2soIGNhbGxiYWNrICl7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoIGNhbGxiYWNrLCAwICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dGlja0FsbEV2ZW50c1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBhc3luY2hyb25vdXNseSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtFdmVudFByb21pc2V9IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZSBsaXN0ZW5lcnMgaGF2ZSBjb21wbGV0ZWQgZXhlY3V0aW9uIGJ1dCByZWplY3RzIGlmIGFuIGVycm9yIHdhcyB0aHJvd24uXG4gKi9cbmZ1bmN0aW9uIHRpY2tBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKXtcbiAgICAgICAgdGljayggZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKSA/IHJlc29sdmUoKSA6IHJlamVjdCgpO1xuICAgICAgICB9ICk7XG4gICAgfSApO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgYSBgc2VsZWN0aW9uYCBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIGB0YXJnZXRgLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dG9FbWl0dGVyXG4gKi9cbmZ1bmN0aW9uIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKXtcbiAgICBcbiAgICAvLyBBcHBseSB0aGUgZW50aXJlIEVtaXR0ZXIgQVBJXG4gICAgaWYoIHNlbGVjdGlvbiA9PT0gQVBJICl7XG4gICAgICAgIGFzRW1pdHRlci5jYWxsKCB0YXJnZXQgKTtcbiAgICBcbiAgICAvLyBBcHBseSBvbmx5IHRoZSBzZWxlY3RlZCBBUEkgbWV0aG9kc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBpbmRleCwga2V5LCBtYXBwaW5nLCBuYW1lcywgdmFsdWU7XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIHNlbGVjdGlvbiA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgICAgIG5hbWVzID0gc2VsZWN0aW9uLnNwbGl0KCAnICcgKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBBUEk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lcyA9IE9iamVjdC5rZXlzKCBzZWxlY3Rpb24gKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBzZWxlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gbmFtZXMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgIGtleSA9IG5hbWVzWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSBtYXBwaW5nWyBrZXkgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgICAgdmFsdWUgOlxuICAgICAgICAgICAgICAgIEFQSVsgdmFsdWUgXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uYWwgbWl4aW4gdGhhdCBwcm92aWRlcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gaXRzIHRhcmdldC4gVGhlIGBjb25zdHJ1Y3RvcigpYCwgYGRlc3Ryb3koKWAsIGB0b0pTT04oKWAsIGB0b1N0cmluZygpYCwgYW5kIHN0YXRpYyBwcm9wZXJ0aWVzIG9uIGBFbWl0dGVyYCBhcmUgbm90IHByb3ZpZGVkLiBUaGlzIG1peGluIGlzIHVzZWQgdG8gcG9wdWxhdGUgdGhlIGBwcm90b3R5cGVgIG9mIGBFbWl0dGVyYC5cbiAqIFxuICogTGlrZSBhbGwgZnVuY3Rpb25hbCBtaXhpbnMsIHRoaXMgc2hvdWxkIGJlIGV4ZWN1dGVkIHdpdGggW2NhbGwoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vY2FsbCkgb3IgW2FwcGx5KCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2FwcGx5KS5cbiAqIEBtaXhpbiBFbWl0dGVyfmFzRW1pdHRlclxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgRW1pdHRlciBmdW5jdGlvbmFsaXR5PC9jYXB0aW9uPlxuICogLy8gQ3JlYXRlIGEgYmFzZSBvYmplY3RcbiAqIGNvbnN0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBcbiAqIC8vIEFwcGx5IHRoZSBtaXhpblxuICogYXNFbWl0dGVyLmNhbGwoIGdyZWV0ZXIgKTtcbiAqIFxuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gKiAvLyBIZWxsbywgV29ybGQhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBjaGFvcyB0byB5b3VyIHdvcmxkPC9jYXB0aW9uPlxuICogLy8gTk8hISFcbiAqIEVtaXR0ZXIuYXNFbWl0dGVyKCk7IC8vIE1hZG5lc3MgZW5zdWVzXG4gKi9cbmZ1bmN0aW9uIGFzRW1pdHRlcigpe1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuYXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleCBXaGVyZSB0aGUgbGlzdGVuZXIgd2lsbCBiZSBhZGRlZCBpbiB0aGUgdHJpZ2dlciBsaXN0LlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICovXG4gICAgdGhpcy5hdCA9IGZ1bmN0aW9uKCB0eXBlLCBpbmRleCwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGluZGV4ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggaXNQb3NpdGl2ZU51bWJlciggaW5kZXggKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2luZGV4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5jbGVhclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhcigpO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbigge1xuICAgICAqICAnaGVsbG8nIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIZWxsbyEnICk7IH0sXG4gICAgICogICdoaScgICAgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hpIScgKTsgfVxuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICovXG4gICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBoYW5kbGVyO1xuICAgICAgICBcbiAgICAgICAgLy8gTm8gRXZlbnRzXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2l0aCBubyBcIm9mZlwiIGxpc3RlbmVycywgY2xlYXJpbmcgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgYWxsIGxpc3RlbmVyc1xuICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgY29uc3QgdHlwZXMgPSBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEF2b2lkIHJlbW92aW5nIFwib2ZmXCIgbGlzdGVuZXJzIHVudGlsIGFsbCBvdGhlciB0eXBlcyBoYXZlIGJlZW4gcmVtb3ZlZFxuICAgICAgICAgICAgZm9yKCBsZXQgaW5kZXggPSAwLCBsZW5ndGggPSB0eXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgaWYoIHR5cGVzWyBpbmRleCBdID09PSAnOm9mZicgKXtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoIHR5cGVzWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGNsZWFyIFwib2ZmXCJcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoICc6b2ZmJyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyICk7XG4gICAgICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5lbWl0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTsgICAgLy8gdHJ1ZVxuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7ICAvLyBmYWxzZVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50IHdpdGggZGF0YTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGEgbmFtZXNwYWNlZCBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiAvLyBUaGlzIGV2ZW50IHdpbGwgbm90IGJlIHRyaWdnZXJlZCBieSBlbWl0dGluZyBcImdyZWV0aW5nOmhlbGxvXCJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvIGFnYWluLCAkeyBuYW1lIH1gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiggdHlwZSwgLi4uZGF0YSApe1xuICAgICAgICByZXR1cm4gZW1pdEFsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmV2ZW50VHlwZXNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8RXZlbnRUeXBlPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCBgSGVsbG9gICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggYEhpYCApICk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZXZlbnRUeXBlcygpICk7XG4gICAgICogLy8gWyAnaGVsbG8nLCAnaGknIF1cbiAgICAgKi8gXG4gICAgdGhpcy5ldmVudFR5cGVzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5maXJzdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0ID0gZnVuY3Rpb24oIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIDAgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmdldE1heExpc3RlbmVyc1xuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gICAgICovXG4gICAgdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJDb3VudFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnaGVsbG8nICkgKTtcbiAgICAgKiAvLyAxXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2dvb2RieWUnICkgKTtcbiAgICAgKiAvLyAwXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBjb3VudDtcblxuICAgICAgICAvLyBFbXB0eVxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGNvdW50ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHRoaXNbICRldmVudHMgXVsgdHlwZSBdID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgIFxuICAgICAgICAvLyBBcnJheVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY291bnQgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhlbGxvID0gZnVuY3Rpb24oKXtcbiAgICAgKiAgY29uc29sZS5sb2coICdIZWxsbyEnICk7XG4gICAgICogfSxcbiAgICAgKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lcnMoICdoZWxsbycgKVsgMCBdID09PSBoZWxsbyApO1xuICAgICAqIC8vIHRydWVcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgbGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFsgaGFuZGxlciBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSAqbWFueSB0aW1lKiBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC4gQWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIGludm9rZWQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgYHRpbWVzYCwgaXQgaXMgcmVtb3ZlZC5cbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5tYW55XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbnkgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1RlcnJ5JyApOyAgICAgIC8vIDJcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnU3RldmUnICk7ICAgICAgLy8gM1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAvLyAyXG4gICAgICogLy8gSGVsbG8sIFRlcnJ5IVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgIC8vIDNcbiAgICAgKi8gXG4gICAgdGhpcy5tYW55ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aW1lcztcbiAgICAgICAgICAgIHRpbWVzID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggdGltZXMgKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3RpbWVzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBgbGlzdGVuZXJgIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIGl0IGlzIGFzc3VtZWQgdGhlIGBsaXN0ZW5lcmAgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBJZiBhbnkgc2luZ2xlIGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgdGhlbiBgZW1pdHRlci5vZmYoKWAgbXVzdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gcmVtb3ZlIGVhY2ggaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9mZlxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b2ZmXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhbnkgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBncmVldCggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0aW5ncywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnSmVmZicgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gaGVsbG8oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICovIFxuICAgIHRoaXMub2ZmID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IHR5cGUgPSBhcmd1bWVudHNbIDAgXSB8fCAkZXZlcnksXG4gICAgICAgICAgICBsaXN0ZW5lciA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVHlwZSBub3QgcHJvdmlkZWQsIGZhbGwgYmFjayB0byBcIiRldmVyeVwiXG4gICAgICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0IG9mIGV2ZW50IGJpbmRpbmdzXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TWFwcGluZyggdGhpcywgdHlwZSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgTmFOICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vbmNlXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIG9uY2UgdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uY2UgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCAxLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKi9cbiAgICB0aGlzLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCBtYXggKXtcbiAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBlbWl0cyBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy4gVGhlIGxpc3RlbmVycyB3aWxsIHN0aWxsIGJlIHN5bmNocm9ub3VzbHkgZXhlY3V0ZWQgaW4gdGhlIHNwZWNpZmllZCBvcmRlci5cbiAgICAgKiBcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudGlja1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZSBsaXN0ZW5lcnMgaGF2ZSBjb21wbGV0ZWQgZXhlY3V0aW9uIGJ1dCByZWplY3RzIGlmIGFuIGVycm9yIHdhcyB0aHJvd24uXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+QXN5bmNocm9ub3VzbHkgZW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdoZWxsbycgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdoZWxsbyBoZWFyZD8gJywgaGVhcmQgKSApO1xuICAgICAqIGdyZWV0ZXIudGljayggJ2dvb2RieWUnICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnZ29vZGJ5ZSBoZWFyZD8gJywgaGVhcmQgKSApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIC8vIGhlbGxvIGhlYXJkPyB0cnVlXG4gICAgICogLy8gZ29vZGJ5ZSBoZWFyZD8gZmFsc2VcbiAgICAgKi9cbiAgICB0aGlzLnRpY2sgPSBmdW5jdGlvbiggdHlwZSwgLi4uZGF0YSApe1xuICAgICAgICByZXR1cm4gdGlja0FsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBgZGF0YWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50cmlnZ2VyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdoZWxsbycsIFsgJ1dvcmxkJyBdICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoZWxsbycsIFsgJ0plZmYnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWQgKnVudGlsKiB0aGUgYGxpc3RlbmVyYCByZXR1cm5zIGB0cnVlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnVudGlsXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1RlcnJ5JztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJywgJ1RlcnJ5JyApO1xuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdBYXJvbicgKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoICdoZWxsbycsIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnV29ybGQnO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdNYXJrJyApO1xuICAgICAqL1xuICAgIHRoaXMudW50aWwgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufVxuXG5hc0VtaXR0ZXIuY2FsbCggQVBJICk7XG5cbi8qKlxuICogQXBwbGllcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIHRhcmdldC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpPYmplY3R9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSSB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgYHRhcmdldGAuXG4gKiBAcGFyYW0ge2V4dGVyYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCB0byB3aGljaCB0aGUgRW1pdHRlci5qcyBBUEkgd2lsbCBiZSBhcHBsaWVkLlxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYWxsIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggJ2VtaXQgb24gb2ZmJywgZ3JlZXRlciApO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1hcHBpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggeyBmaXJlOiAnZW1pdCcsIGFkZExpc3RlbmVyOiAnb24nIH0sIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIuYWRkTGlzdGVuZXIoICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmZpcmUoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICovXG4gXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZW1pdHRlci4gSWYgYG1hcHBpbmdgIGFyZSBwcm92aWRlZCB0aGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSBwYXNzZWQgaW50byBgb24oKWAgb25jZSBjb25zdHJ1Y3Rpb24gaXMgY29tcGxldGUuXG4gKiBAY2xhc3MgRW1pdHRlclxuICogQGNsYXNzZGVzYyBBbiBvYmplY3QgdGhhdCBlbWl0cyBuYW1lZCBldmVudHMgd2hpY2ggY2F1c2UgZnVuY3Rpb25zIHRvIGJlIGV4ZWN1dGVkLlxuICogQGV4dGVuZHMgRW1pdHRlcn5OdWxsXG4gKiBAbWl4ZXMgRW1pdHRlcn5hc0VtaXR0ZXJcbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBbbWFwcGluZ10gQSBtYXBwaW5nIG9mIGV2ZW50IHR5cGVzIHRvIGV2ZW50IGxpc3RlbmVycy5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9saWIvZXZlbnRzLmpzfVxuICogQGV4YW1wbGUgPGNhcHRpb24+VXNpbmcgRW1pdHRlciBkaXJlY3RseTwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5FeHRlbmRpbmcgRW1pdHRlciB1c2luZyBDbGFzc2ljYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBjbGFzcyBHcmVldGVyIGV4dGVuZHMgRW1pdHRlciB7XG4gKiAgY29uc3RydWN0b3IoKXtcbiAqICAgICAgc3VwZXIoKTtcbiAqICAgICAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogIH1cbiAqIFxuICogIGdyZWV0KCBuYW1lICl7XG4gKiAgICAgIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xuICogIH1cbiAqIH1cbiAqIFxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgUHJvdG90eXBhbCBpbmhlcml0YW5jZTwvY2FwdGlvbj5cbiAqIGZ1bmN0aW9uIEdyZWV0ZXIoKXtcbiAqICBFbWl0dGVyLmNhbGwoIHRoaXMgKTtcbiAqICB0aGlzLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiB9XG4gKiBHcmVldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEVtaXR0ZXIucHJvdG90eXBlICk7XG4gKiBcbiAqIEdyZWV0ZXIucHJvdG90eXBlLmdyZWV0ID0gZnVuY3Rpb24oIG5hbWUgKXtcbiAqICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqIH07XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk5hbWVzcGFjZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAqIC8vIEhpLCBNYXJrIVxuICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAqIEBleGFtcGxlIDxjYXB0aW9uPlByZWRlZmluZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRpbmdzID0ge1xuICogICAgICBoZWxsbzogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIZWxsbywgJHtuYW1lfSFgICksXG4gKiAgICAgIGhpOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhpLCAke25hbWV9IWAgKVxuICogIH0sXG4gKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCBncmVldGluZ3MgKTtcbiAqIFxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnQWFyb24nICk7XG4gKiAvLyBIZWxsbywgQWFyb24hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5PbmUtdGltZSBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5NYW55LXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgICAvLyAxXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAgLy8gMlxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgIC8vIDNcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSGVsbG8sIFRlcnJ5IVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFbWl0dGVyKCl7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGNvbnN0cnVjdG9yXG4gICAgaWYoIHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbnN0cnVjdG9yID09PSBFbWl0dGVyICl7XG4gICAgICAgIGxldCBtYXBwaW5nID0gYXJndW1lbnRzWyAwIF07XG4gICAgICAgIHR5cGVvZiBtYXBwaW5nICE9PSAndW5kZWZpbmVkJyAmJiBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIG1hcHBpbmcgKTtcbiAgICAgICAgXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heExpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgICAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGZ1bmN0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IGFyZ3VtZW50c1sgMCBdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHNcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0YXJnZXQgPSBzZWxlY3Rpb247XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBBUEk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZGVmYXVsdCBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBlbWl0dGVycy4gVXNlIGBlbWl0dGVyLm1heExpc3RlbmVyc2AgdG8gc2V0IHRoZSBtYXhpbXVtIG9uIGEgcGVyLWluc3RhbmNlIGJhc2lzLlxuICAgICAqIFxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPTEwXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlcjEgPSBuZXcgRW1pdHRlcigpLFxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGFsZXJ0KCAnSGkhJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICogXG4gICAgICovXG4gICAgZGVmYXVsdE1heExpc3RlbmVyczoge1xuICAgICAgICB2YWx1ZTogMTAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3ltYm9sIHVzZWQgdG8gbGlzdGVuIGZvciBldmVudHMgb2YgYW55IGB0eXBlYC4gRm9yIF9tb3N0XyBtZXRob2RzLCB3aGVuIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGlzIGlzIHRoZSBkZWZhdWx0LlxuICAgICAqIFxuICAgICAqIFVzaW5nIGBFbWl0dGVyLmV2ZXJ5YCBpcyB0eXBpY2FsbHkgbm90IG5lY2Vzc2FyeS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzeW1ib2x9IEVtaXR0ZXIuZXZlcnlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIEVtaXR0ZXIuZXZlcnksICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKi9cbiAgICBldmVyeToge1xuICAgICAgICB2YWx1ZTogJGV2ZXJ5LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgKkVtaXR0ZXIuanMqLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gRW1pdHRlci52ZXJzaW9uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci52ZXJzaW9uICk7XG4gICAgICogLy8gMi4wLjBcbiAgICAgKi9cbiAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHZhbHVlOiAnMi4wLjAnLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfVxufSApO1xuXG5FbWl0dGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbkVtaXR0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW1pdHRlcjtcblxuYXNFbWl0dGVyLmNhbGwoIEVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCB0cnVlICk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZGVzdHJveSA9IHRoaXMuYXQgPSB0aGlzLmNsZWFyID0gdGhpcy5lbWl0ID0gdGhpcy5ldmVudFR5cGVzID0gdGhpcy5maXJzdCA9IHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lckNvdW50ID0gdGhpcy5saXN0ZW5lcnMgPSB0aGlzLm1hbnkgPSB0aGlzLm9mZiA9IHRoaXMub24gPSB0aGlzLm9uY2UgPSB0aGlzLnNldE1heExpc3RlbmVycyA9IHRoaXMudGljayA9IHRoaXMudHJpZ2dlciA9IHRoaXMudW50aWwgPSBub29wO1xuICAgIHRoaXMudG9KU09OID0gKCkgPT4gJ2Rlc3Ryb3llZCc7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfVxuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIFwiZGVzdHJveWVkXCJcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICBjb25zdCBqc29uID0gbmV3IE51bGwoKSxcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICksXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgdHlwZTtcbiAgICBcbiAgICBqc29uLm1heExpc3RlbmVycyA9IHRoaXMubWF4TGlzdGVuZXJzO1xuICAgIGpzb24ubGlzdGVuZXJDb3VudCA9IG5ldyBOdWxsKCk7XG4gICAgXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciBcImRlc3Ryb3llZFwiJ1xuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGAkeyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgfSAkeyBKU09OLnN0cmluZ2lmeSggdGhpcy50b0pTT04oKSApIH1gLnRyaW0oKTtcbn07Il0sImZpbGUiOiJlbWl0dGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=