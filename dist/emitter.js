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
 * A set of method references to the Emitter.js API.
 * @typedef {external:string|external:Object} APIReference
 * @example <caption>A selection reference</caption>
 * 'emit off on once'
 * @example <caption>A mapping reference</caption>
 * // 'emit()' will be mapped to 'fire()'
 * // 'on()' will be mapped to 'addListener()'
 * // 'off()' will be mapped to 'removeListener()'
 * {
 *  fire: 'emit',
 *  addListener: 'on',
 *  removeListener: 'off'
 * }
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
 * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
 * @typedef {external:string|external:symbol} EventType
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
 * @returns {external:Promise} A promise which *resolves* if the event had listeners, *rejects* otherwise.
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
 * @param {APIReference} [selection] A selection of the Emitter.js API.
 * @param {external:Object} target The object on which the API will be applied.
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
 * asEmitter(); // Madness ensues
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
     * @since 2.0.0
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
     * @since 1.0.0
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
     * @since 1.0.0
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
    this.emit = function( type ){
        let data = [],
            length = arguments.length;
        
        if( length > 1 ){
            data = Array( length - 1 );
            
            for( let key = 1; key < length; key++ ){
                data[ key - 1 ] = arguments[ key ];
            }
        }
        
        return emitAllEvents( this, type, data );
        /*
        // This logic will change once Emitter.every becomes a Symbol
        
        if( typeof type === 'string' ){
            let index = type.lastIndexOf( ':' );
            
            return index === -1 ?
                emitEvent( this, type, data, type === $every ) :
                emitAllEvents( this, type, data );
        } else {
            return emitEvent( this, type, data, false );
        }
        */
    };
    
    /**
     * @function Emitter~asEmitter.eventTypes
     * @returns {Array<EventType>} The list of event types registered to the emitter.
     * @since 2.0.0
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
     * @since 2.0.0
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
     * By default Emitter will emit a `:maxListeners` evet if more than **10** listeners are added for a particular event `type`. This method returns the current value.
     * @function Emitter~asEmitter.getMaxListeners
     * @returns {external:number} The maximum number of listeners.
     * @since 2.0.0
     * @example
     * const greeter = new Emitter();
     * 
     * console.log( greeter.getMaxListeners() );
     * // 10
     * 
     * greeter.setMaxListeners( 5 );
     * 
     * console.log( greeter.getMaxListeners() );
     * // 5
     */
    this.getMaxListeners = function(){
        return getMaxListeners( this );
    };
    
    /**
     * @function Emitter~asEmitter.listenerCount
     * @param {EventType} type The event type.
     * @returns {external:number} The number of listeners for that event type within the given emitter.
     * @since 1.0.0
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
     * @since 1.0.0
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
     * @since 1.0.0
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
     * @since 1.0.0
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
     * @since 1.0.0
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
     * @since 1.0.0
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
     * By default Emitter will emit a `:maxListeners` evet if more than **10** listeners are added for a particular event `type`. This method allows that to be changed. Set to **0** for unlimited.
     * @function Emitter~asEmitter.setMaxListeners
     * @param {external:number} max The maximum number of listeners before a warning is issued.
     * @returns {Emitter} The emitter.
     * @since 2.0.0
     * @example
     * const greeter = new Emitter();
     * 
     * greeter.setMaxListeners( 1 );
     * 
     * greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.on( 'hello', () => alert( 'Hello!' ) );
     * // Greeting "hello" has one too many!
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
     * Returns {@link external:Promise|promise} which *resolves* if the event had listeners, *rejects* otherwise.
     * @function Emitter~asEmitter.tick
     * @param {EventType} type The event type.
     * @param {...*} [data] The data passed into the listeners.
     * @returns {external:Promise} A promise which *resolves* if the event had listeners, *rejects* otherwise.
     * @since 2.0.0
     * @example <caption>Asynchronously emitting an event</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
     * greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
     * // Hello!
     * // hello heard? true
     * // goodbye heard? false
     */
    this.tick = function( type ){
        let data = [],
            length = arguments.length;
        
        if( length > 1 ){
            data = Array( length - 1 );
            
            for( let key = 1; key < length; key++ ){
                data[ key - 1 ] = arguments[ key ];
            }
        }
        
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
     * @since 1.0.0
     * @example
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
     * @since 1.2.0
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
 * @param {APIReference} [selection] A selection of the Emitter.js API that will be applied to the `target`.
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
 * @param {EventMapping} [mapping] A mapping of event types to event listeners.
 * @classdesc An object that emits named events which cause functions to be executed.
 * @extends Emitter~Null
 * @mixes Emitter~asEmitter
 * @see {@link https://github.com/nodejs/node/blob/master/lib/events.js}
 * @since 1.0.0
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
        
        /**
         * By default Emitters will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This property allows that to be changed. Set to **0** for unlimited.
         * @member {external:number} Emitter#maxListeners
         * @since 1.0.0
         * @example
         * const greeter = new Emitter();
         * 
         * console.log( greeter.maxListeners );
         * // 10
         * 
         * greeter.maxListeners = 1;
         * 
         * greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.on( 'hello', () => alert( 'Hello!' ) );
         * // Greeting "hello" has one too many!
         */
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
     * @since 1.0.0
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
     * @since 1.0.0
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
     * @since 1.1.2
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbWl0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEFycmF5XG4gKiBAZXh0ZXJuYWwgQXJyYXlcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5fVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJtNDU0bXVuMyFpbWl0aXZlfHByaW1pdGl2ZX0gYm9vbGVhblxuICogQGV4dGVybmFsIGJvb2xlYW5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Jvb2xlYW59XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBFcnJvclxuICogQGV4dGVybmFsIEVycm9yXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvcn1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEZ1bmN0aW9uXG4gKiBAZXh0ZXJuYWwgRnVuY3Rpb25cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9ufVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IG51bWJlclxuICogQGV4dGVybmFsIG51bWJlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyfVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IG51bGxcbiAqIEBleHRlcm5hbCBudWxsXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9udWxsfVxuICovXG4gXG4vKipcbiAqIEphdmFTY3JpcHQgT2JqZWN0XG4gKiBAZXh0ZXJuYWwgT2JqZWN0XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3R9XG4gKi9cblxuLyoqXG4gKiBKYXZhU2NyaXB0IFByb21pc2VcbiAqIEBleHRlcm5hbCBQcm9taXNlXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm9taXNlfVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzdHJpbmdcbiAqIEBleHRlcm5hbCBzdHJpbmdcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZ31cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN5bWJvbFxuICogQGV4dGVybmFsIHN5bWJvbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3ltYm9sfVxuICovXG5cbi8qKlxuICogQSBzZXQgb2YgbWV0aG9kIHJlZmVyZW5jZXMgdG8gdGhlIEVtaXR0ZXIuanMgQVBJLlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpPYmplY3R9IEFQSVJlZmVyZW5jZVxuICogQGV4YW1wbGUgPGNhcHRpb24+QSBzZWxlY3Rpb24gcmVmZXJlbmNlPC9jYXB0aW9uPlxuICogJ2VtaXQgb2ZmIG9uIG9uY2UnXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BIG1hcHBpbmcgcmVmZXJlbmNlPC9jYXB0aW9uPlxuICogLy8gJ2VtaXQoKScgd2lsbCBiZSBtYXBwZWQgdG8gJ2ZpcmUoKSdcbiAqIC8vICdvbigpJyB3aWxsIGJlIG1hcHBlZCB0byAnYWRkTGlzdGVuZXIoKSdcbiAqIC8vICdvZmYoKScgd2lsbCBiZSBtYXBwZWQgdG8gJ3JlbW92ZUxpc3RlbmVyKCknXG4gKiB7XG4gKiAgZmlyZTogJ2VtaXQnLFxuICogIGFkZExpc3RlbmVyOiAnb24nLFxuICogIHJlbW92ZUxpc3RlbmVyOiAnb2ZmJ1xuICogfVxuICovXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258IGZ1bmN0aW9ufSBib3VuZCB0byBhbiBlbWl0dGVyIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZX0uIEFueSBkYXRhIHRyYW5zbWl0dGVkIHdpdGggdGhlIGV2ZW50IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVyIGFzIGFyZ3VtZW50cy5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHsuLi4qfSBkYXRhIFRoZSBhcmd1bWVudHMgcGFzc2VkIGJ5IHRoZSBgZW1pdGAuXG4gKi9cblxuLyoqXG4gKiBBbiB7QGxpbmsgZXh0ZXJuYWw6T2JqZWN0fG9iamVjdH0gdGhhdCBtYXBzIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZXN9IHRvIHtAbGluayBFdmVudExpc3RlbmVyfGV2ZW50IGxpc3RlbmVyc30uXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6T2JqZWN0fSBFdmVudE1hcHBpbmdcbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOnN0cmluZ30gb3Ige0BsaW5rIGV4dGVybmFsOnN5bWJvbH0gdGhhdCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIGV2ZW50IGZpcmVkIGJ5IHRoZSBFbWl0dGVyLlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpzeW1ib2x9IEV2ZW50VHlwZVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhbiBlbWl0dGVyIGRlc3Ryb3lzIGl0c2VsZi5cbiAqIEBldmVudCBFbWl0dGVyIzpkZXN0cm95XG4gKi8gXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9hZnRlcl8gYSBsaXN0ZW5lciBpcyByZW1vdmVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9mZlxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGEgbGlzdGVuZXIgaXMgYWRkZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b25cbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgaGFzIGJlZW4gZXhjZWVkZWQgZm9yIGFuIGV2ZW50IHR5cGUuXG4gKiBAZXZlbnQgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIEVtaXR0ZXJ+TnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5mdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGw7XG5cbmNvbnN0XG4gICAgJGV2ZW50cyAgICAgICA9ICdAQGVtaXR0ZXIvZXZlbnRzJyxcbiAgICAkZXZlcnkgICAgICAgID0gJ0BAZW1pdHRlci9ldmVyeScsXG4gICAgJG1heExpc3RlbmVycyA9ICdAQGVtaXR0ZXIvbWF4TGlzdGVuZXJzJyxcbiAgICBcbiAgICBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgXG4gICAgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcbiAgICBcbiAgICBBUEkgPSBuZXcgTnVsbCgpO1xuXG4vLyBNYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyBhcmUgYnJva2VuIG91dCBmcm9tIHRoZSBwcm90b3R5cGUgZm9yIHRoZSBzYWtlIG9mIG9wdGltaXphdGlvbi4gVGhlIGZ1bmN0aW9ucyBvbiB0aGUgcHJvdG95dHlwZVxuLy8gdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBhcyBhIHJlc3VsdC4gVGhlc2UgZnVuY3Rpb25zIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgYXJndW1lbnRzXG4vLyBhbmQgdGhlcmVmb3JlIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQuXG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gY29uZGl0aW9uYWxMaXN0ZW5lcigpe1xuICAgICAgICBjb25zdCBkb25lID0gbGlzdGVuZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3VtZW50cyApO1xuICAgICAgICBpZiggZG9uZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE8gQ2hlY2sgYmV5b25kIGp1c3Qgb25lIGxldmVsIG9mIGxpc3RlbmVyIHJlZmVyZW5jZXNcbiAgICBjb25kaXRpb25hbExpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXIubGlzdGVuZXIgfHwgbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciwgTmFOICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKXtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgfVxuICAgIFxuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGlmKCBfZXZlbnRzWyAnOm9uJyBdICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvbicsIFsgdHlwZSwgdHlwZW9mIGxpc3RlbmVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgIFxuICAgICAgICAvLyBFbWl0dGluZyBcIm9uXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgIF9ldmVudHNbICc6b24nIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b24nIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgIGlmKCAhX2V2ZW50c1sgdHlwZSBdICl7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGxpc3RlbmVyO1xuICAgIFxuICAgIC8vIE11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggX2V2ZW50c1sgdHlwZSBdICkgKXtcbiAgICAgICAgc3dpdGNoKCBpc05hTiggaW5kZXggKSB8fCBpbmRleCApe1xuICAgICAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS51bnNoaWZ0KCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0uc3BsaWNlKCBpbmRleCwgMCwgbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIFxuICAgIC8vIFRyYW5zaXRpb24gZnJvbSBzaW5nbGUgdG8gbXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gaW5kZXggPT09IDAgP1xuICAgICAgICAgICAgWyBsaXN0ZW5lciwgX2V2ZW50c1sgdHlwZSBdIF0gOlxuICAgICAgICAgICAgWyBfZXZlbnRzWyB0eXBlIF0sIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYWNrIHdhcm5pbmdzIGlmIG1heCBsaXN0ZW5lcnMgaXMgYXZhaWxhYmxlXG4gICAgaWYoICdtYXhMaXN0ZW5lcnMnIGluIGVtaXR0ZXIgJiYgIV9ldmVudHNbIHR5cGUgXS53YXJuZWQgKXtcbiAgICAgICAgY29uc3QgbWF4ID0gZW1pdHRlci5tYXhMaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggbWF4ICYmIG1heCA+IDAgJiYgX2V2ZW50c1sgdHlwZSBdLmxlbmd0aCA+IG1heCApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm1heExpc3RlbmVycycsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBFbWl0dGluZyBcIm1heExpc3RlbmVyc1wiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICAgICAgX2V2ZW50c1sgJzptYXhMaXN0ZW5lcnMnIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6bWF4TGlzdGVuZXJzJyBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBlbWl0dGVyWyAkZXZlbnRzIF0gPSBfZXZlbnRzO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEZpbml0ZUV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gZmluaXRlTGlzdGVuZXIoKXtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICByZXR1cm4gLS10aW1lcyA9PT0gMDtcbiAgICB9XG4gICAgXG4gICAgZmluaXRlTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICBcbiAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGZpbml0ZUxpc3RlbmVyICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRNYXBwaW5nXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gbWFwcGluZyBUaGUgZXZlbnQgbWFwcGluZy5cbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRNYXBwaW5nKCBlbWl0dGVyLCBtYXBwaW5nICl7XG4gICAgY29uc3RcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggbWFwcGluZyApLFxuICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZXMubGVuZ3RoO1xuICAgIFxuICAgIGxldCB0eXBlSW5kZXggPSAwLFxuICAgICAgICBoYW5kbGVyLCBoYW5kbGVySW5kZXgsIGhhbmRsZXJMZW5ndGgsIHR5cGU7XG4gICAgXG4gICAgZm9yKCA7IHR5cGVJbmRleCA8IHR5cGVMZW5ndGg7IHR5cGVJbmRleCArPSAxICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgdHlwZUluZGV4IF07XG4gICAgICAgIGhhbmRsZXIgPSBtYXBwaW5nWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICAvLyBMaXN0IG9mIGxpc3RlbmVyc1xuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICBoYW5kbGVySW5kZXggPSAwO1xuICAgICAgICAgICAgaGFuZGxlckxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCA7IGhhbmRsZXJJbmRleCA8IGhhbmRsZXJMZW5ndGg7IGhhbmRsZXJJbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgaGFuZGxlclsgaGFuZGxlckluZGV4IF0sIE5hTiApO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyLCBOYU4gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5kZWZpbmVFdmVudHNQcm9wZXJ0eVxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBwcm9wZXJ0eSB3aWxsIGJlIGNyZWF0ZWQuXG4gKi8gXG5mdW5jdGlvbiBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgdmFsdWUgKXtcbiAgICBjb25zdCBoYXNFdmVudHMgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKCBlbWl0dGVyLCAkZXZlbnRzICksXG4gICAgICAgIGVtaXR0ZXJQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIGVtaXR0ZXIgKTtcbiAgICAgICAgXG4gICAgaWYoICFoYXNFdmVudHMgfHwgKCBlbWl0dGVyUHJvdG90eXBlICYmIGVtaXR0ZXJbICRldmVudHMgXSA9PT0gZW1pdHRlclByb3RvdHlwZVsgJGV2ZW50cyBdICkgKXtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkZXZlbnRzLCB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0gKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEFsbEV2ZW50c1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEFsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApe1xuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICAvLyBJZiB0eXBlIGlzIG5vdCBhIHN0cmluZywgaW5kZXggd2lsbCBiZSBmYWxzZVxuICAgICAgICBpbmRleCA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICBcbiAgICAvLyBOYW1lc3BhY2VkIGV2ZW50LCBlLmcuIEVtaXQgXCJmb286YmFyOnF1eFwiLCB0aGVuIFwiZm9vOmJhclwiXG4gICAgd2hpbGUoIGluZGV4ID4gMCApe1xuICAgICAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGZhbHNlICkgKSB8fCBleGVjdXRlZDtcbiAgICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKCAwLCBpbmRleCApO1xuICAgICAgICBpbmRleCA9IHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIH1cbiAgICBcbiAgICAvLyBFbWl0IHNpbmdsZSBldmVudCBvciB0aGUgbmFtZXNwYWNlZCBldmVudCByb290LCBlLmcuIFwiZm9vXCIsIFwiOmJhclwiLCBTeW1ib2woIFwiQEBxdXhcIiApXG4gICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCB0cnVlICkgKSB8fCBleGVjdXRlZDtcbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEVycm9yc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBgZXJyb3JzYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0FycmF5PGV4dGVybmFsOkVycm9yPn0gZXJyb3JzIFRoZSBhcnJheSBvZiBlcnJvcnMgdG8gYmUgZW1pdHRlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICl7XG4gICAgY29uc3QgbGVuZ3RoID0gZXJyb3JzLmxlbmd0aDtcbiAgICBmb3IoIGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJ2Vycm9yJywgWyBlcnJvcnNbIGluZGV4IF0gXSwgZmFsc2UgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEV2ZW50XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBlbWl0RXZlcnkgV2hldGhlciBvciBub3QgbGlzdGVuZXJzIGZvciBhbGwgdHlwZXMgd2lsbCBiZSBleGVjdXRlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBlbWl0RXZlcnkgKXtcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XG4gICAgXG4gICAgY29uc3QgX2V2ZW50cyA9IGVtaXR0ZXJbICRldmVudHMgXTtcbiAgICBcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgbGlzdGVuZXI7XG4gICAgXG4gICAgaWYoIHR5cGUgPT09ICdlcnJvcicgJiYgIV9ldmVudHMuZXJyb3IgKXtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBkYXRhWyAwIF07XG4gICAgICAgIFxuICAgICAgICBpZiggZXJyb3IgaW5zdGFuY2VvZiBFcnJvciApe1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBmb3IgdGhlIGdpdmVuIHR5cGUgb2YgZXZlbnRcbiAgICBsaXN0ZW5lciA9IF9ldmVudHNbIHR5cGUgXTtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgbGlzdGVuaW5nIGZvciBhbGwgdHlwZXMgb2YgZXZlbnRzXG4gICAgaWYoIGVtaXRFdmVyeSApe1xuICAgICAgICBsaXN0ZW5lciA9IF9ldmVudHNbICRldmVyeSBdO1xuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGxpc3RlbmVyIHVzaW5nIHRoZSBpbnRlcm5hbCBgZXhlY3V0ZSpgIGZ1bmN0aW9ucyBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVMaXN0ZW5lclxuICogQHBhcmFtIHtBcnJheTxMaXN0ZW5lcj58TGlzdGVuZXJ9IGxpc3RlbmVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gKiBAcGFyYW0geyp9IHNjb3BlXG4gKi8gXG5mdW5jdGlvbiBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBzY29wZSApe1xuICAgIGNvbnN0IGlzRnVuY3Rpb24gPSB0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbic7XG4gICAgXG4gICAgc3dpdGNoKCBkYXRhLmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBsaXN0ZW5FbXB0eSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpc3Rlbk9uZSAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsaXN0ZW5Ud28gICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBsaXN0ZW5UaHJlZSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0sIGRhdGFbIDIgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsaXN0ZW5NYW55ICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldEV2ZW50VHlwZXNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCBldmVudCB0eXBlcyB3aWxsIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBnZXRFdmVudFR5cGVzKCBlbWl0dGVyICl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCBlbWl0dGVyWyAkZXZlbnRzIF0gKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRNYXhMaXN0ZW5lcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCBtYXggbGlzdGVuZXJzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gIT09ICd1bmRlZmluZWQnID9cbiAgICAgICAgZW1pdHRlclsgJG1heExpc3RlbmVycyBdIDpcbiAgICAgICAgRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+aXNQb3NpdGl2ZU51bWJlclxuICogQHBhcmFtIHsqfSBudW1iZXIgVGhlIHZhbHVlIHRvIGJlIHRlc3RlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKi9cbmZ1bmN0aW9uIGlzUG9zaXRpdmVOdW1iZXIoIG51bWJlciApe1xuICAgIHJldHVybiB0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyAmJiBudW1iZXIgPj0gMCAmJiAhaXNOYU4oIG51bWJlciApO1xufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG5vIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlbkVtcHR5XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuRW1wdHkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG9uZSBhcmd1bWVudC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk9uZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5PbmUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdHdvIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblR3b1xuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblR3byggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0aHJlZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5UaHJlZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzMgVGhlIHRoaXJkIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5UaHJlZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBmb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuTWFueVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBhcmdzIEZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk1hbnkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZ3MgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5yZW1vdmVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBoYW5kbGVyID0gZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgXG4gICAgaWYoIGhhbmRsZXIgPT09IGxpc3RlbmVyIHx8ICggdHlwZW9mIGhhbmRsZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiYgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgXG4gICAgICAgIGZvciggbGV0IGkgPSBoYW5kbGVyLmxlbmd0aDsgaS0tID4gMDsgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyWyBpIF0gPT09IGxpc3RlbmVyIHx8ICggaGFuZGxlclsgaSBdLmxpc3RlbmVyICYmIGhhbmRsZXJbIGkgXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiggaW5kZXggPiAtMSApe1xuICAgICAgICAgICAgaWYoIGhhbmRsZXIubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3BsaWNlTGlzdCggaGFuZGxlciwgaW5kZXggKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c2V0TWF4TGlzdGVuZXJzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgd2lsbCBiZSBzZXQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gbWF4IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVmb3JlIGEgd2FybmluZyBpcyBpc3N1ZWQuXG4gKi9cbmZ1bmN0aW9uIHNldE1heExpc3RlbmVycyggZW1pdHRlciwgbWF4ICl7XG4gICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCBtYXggKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbWF4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgfVxuICAgIFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJG1heExpc3RlbmVycywge1xuICAgICAgICB2YWx1ZTogbWF4LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBGYXN0ZXIgdGhhbiBgQXJyYXkucHJvdG90eXBlLnNwbGljZWBcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNwbGljZUxpc3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGxpc3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovIFxuZnVuY3Rpb24gc3BsaWNlTGlzdCggbGlzdCwgaW5kZXggKXtcbiAgICBmb3IoIGxldCBpID0gaW5kZXgsIGogPSBpICsgMSwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGogPCBsZW5ndGg7IGkgKz0gMSwgaiArPSAxICl7XG4gICAgICAgIGxpc3RbIGkgXSA9IGxpc3RbIGogXTtcbiAgICB9XG4gICAgXG4gICAgbGlzdC5wb3AoKTtcbn1cblxuLyoqXG4gKiBBc3luY2hyb25vdXNseSBleGVjdXRlcyBhIGZ1bmN0aW9uLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dGlja1xuICogQHBhcmFtIHtleHRlcm5hbDpGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxuICovXG5mdW5jdGlvbiB0aWNrKCBjYWxsYmFjayApe1xuICAgIHJldHVybiBzZXRUaW1lb3V0KCBjYWxsYmFjaywgMCApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tBbGxFdmVudHNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZX0gQSBwcm9taXNlIHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIHRpY2tBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKXtcbiAgICAgICAgdGljayggZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKSA/IHJlc29sdmUoKSA6IHJlamVjdCgpO1xuICAgICAgICB9ICk7XG4gICAgfSApO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgYSBgc2VsZWN0aW9uYCBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIGB0YXJnZXRgLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dG9FbWl0dGVyXG4gKiBAcGFyYW0ge0FQSVJlZmVyZW5jZX0gW3NlbGVjdGlvbl0gQSBzZWxlY3Rpb24gb2YgdGhlIEVtaXR0ZXIuanMgQVBJLlxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IHRhcmdldCBUaGUgb2JqZWN0IG9uIHdoaWNoIHRoZSBBUEkgd2lsbCBiZSBhcHBsaWVkLlxuICovXG5mdW5jdGlvbiB0b0VtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICl7XG4gICAgXG4gICAgLy8gQXBwbHkgdGhlIGVudGlyZSBFbWl0dGVyIEFQSVxuICAgIGlmKCBzZWxlY3Rpb24gPT09IEFQSSApe1xuICAgICAgICBhc0VtaXR0ZXIuY2FsbCggdGFyZ2V0ICk7XG4gICAgXG4gICAgLy8gQXBwbHkgb25seSB0aGUgc2VsZWN0ZWQgQVBJIG1ldGhvZHNcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaW5kZXgsIGtleSwgbWFwcGluZywgbmFtZXMsIHZhbHVlO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBzZWxlY3Rpb24gPT09ICdzdHJpbmcnICl7XG4gICAgICAgICAgICBuYW1lcyA9IHNlbGVjdGlvbi5zcGxpdCggJyAnICk7XG4gICAgICAgICAgICBtYXBwaW5nID0gQVBJO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmFtZXMgPSBPYmplY3Qua2V5cyggc2VsZWN0aW9uICk7XG4gICAgICAgICAgICBtYXBwaW5nID0gc2VsZWN0aW9uO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpbmRleCA9IG5hbWVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICBrZXkgPSBuYW1lc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhbHVlID0gbWFwcGluZ1sga2V5IF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRhcmdldFsga2V5IF0gPSB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgICAgIHZhbHVlIDpcbiAgICAgICAgICAgICAgICBBUElbIHZhbHVlIF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbmFsIG1peGluIHRoYXQgcHJvdmlkZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIGl0cyB0YXJnZXQuIFRoZSBgY29uc3RydWN0b3IoKWAsIGBkZXN0cm95KClgLCBgdG9KU09OKClgLCBgdG9TdHJpbmcoKWAsIGFuZCBzdGF0aWMgcHJvcGVydGllcyBvbiBgRW1pdHRlcmAgYXJlIG5vdCBwcm92aWRlZC4gVGhpcyBtaXhpbiBpcyB1c2VkIHRvIHBvcHVsYXRlIHRoZSBgcHJvdG90eXBlYCBvZiBgRW1pdHRlcmAuXG4gKiBcbiAqIExpa2UgYWxsIGZ1bmN0aW9uYWwgbWl4aW5zLCB0aGlzIHNob3VsZCBiZSBleGVjdXRlZCB3aXRoIFtjYWxsKCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2NhbGwpIG9yIFthcHBseSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9hcHBseSkuXG4gKiBAbWl4aW4gRW1pdHRlcn5hc0VtaXR0ZXJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIEVtaXR0ZXIgZnVuY3Rpb25hbGl0eTwvY2FwdGlvbj5cbiAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogXG4gKiAvLyBBcHBseSB0aGUgbWl4aW5cbiAqIGFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XG4gKiBcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICogLy8gSGVsbG8sIFdvcmxkIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgY2hhb3MgdG8geW91ciB3b3JsZDwvY2FwdGlvbj5cbiAqIC8vIE5PISEhXG4gKiBhc0VtaXR0ZXIoKTsgLy8gTWFkbmVzcyBlbnN1ZXNcbiAqL1xuZnVuY3Rpb24gYXNFbWl0dGVyKCl7XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCBhdCB0aGUgc3BlY2lmaWVkIGBpbmRleGAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5hdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4IFdoZXJlIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGFkZGVkIGluIHRoZSB0cmlnZ2VyIGxpc3QuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKi9cbiAgICB0aGlzLmF0ID0gZnVuY3Rpb24oIHR5cGUsIGluZGV4LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgaW5kZXggPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCBpc1Bvc2l0aXZlTnVtYmVyKCBpbmRleCApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnaW5kZXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmNsZWFyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coICdIaSEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCB7XG4gICAgICogICdoZWxsbycgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTsgfSxcbiAgICAgKiAgJ2hpJyAgICA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGkhJyApOyB9XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKi9cbiAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGhhbmRsZXI7XG4gICAgICAgIFxuICAgICAgICAvLyBObyBFdmVudHNcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXaXRoIG5vIFwib2ZmXCIgbGlzdGVuZXJzLCBjbGVhcmluZyBjYW4gYmUgc2ltcGxpZmllZFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDbGVhciBhbGwgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICBjb25zdCB0eXBlcyA9IGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQXZvaWQgcmVtb3ZpbmcgXCJvZmZcIiBsaXN0ZW5lcnMgdW50aWwgYWxsIG90aGVyIHR5cGVzIGhhdmUgYmVlbiByZW1vdmVkXG4gICAgICAgICAgICBmb3IoIGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBpZiggdHlwZXNbIGluZGV4IF0gPT09ICc6b2ZmJyApe1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhciggdHlwZXNbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTWFudWFsbHkgY2xlYXIgXCJvZmZcIlxuICAgICAgICAgICAgdGhpcy5jbGVhciggJzpvZmYnICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXIgKTtcbiAgICAgICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXJbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy5cbiAgICAgKiBcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmVtaXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApOyAgICAvLyB0cnVlXG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTsgIC8vIGZhbHNlXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQgd2l0aCBkYXRhPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYSBuYW1lc3BhY2VkIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICAgICAqIFxuICAgICAqIC8vIFRoaXMgZXZlbnQgd2lsbCBub3QgYmUgdHJpZ2dlcmVkIGJ5IGVtaXR0aW5nIFwiZ3JlZXRpbmc6aGVsbG9cIlxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8gYWdhaW4sICR7IG5hbWUgfWAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICAgICAqIC8vIEhpLCBNYXJrIVxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBkYXRhID0gW10sXG4gICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgaWYoIGxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgIGRhdGEgPSBBcnJheSggbGVuZ3RoIC0gMSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIGxldCBrZXkgPSAxOyBrZXkgPCBsZW5ndGg7IGtleSsrICl7XG4gICAgICAgICAgICAgICAgZGF0YVsga2V5IC0gMSBdID0gYXJndW1lbnRzWyBrZXkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICAgICAgLypcbiAgICAgICAgLy8gVGhpcyBsb2dpYyB3aWxsIGNoYW5nZSBvbmNlIEVtaXR0ZXIuZXZlcnkgYmVjb21lcyBhIFN5bWJvbFxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyApe1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBpbmRleCA9PT0gLTEgP1xuICAgICAgICAgICAgICAgIGVtaXRFdmVudCggdGhpcywgdHlwZSwgZGF0YSwgdHlwZSA9PT0gJGV2ZXJ5ICkgOlxuICAgICAgICAgICAgICAgIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBlbWl0RXZlbnQoIHRoaXMsIHR5cGUsIGRhdGEsIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5ldmVudFR5cGVzXG4gICAgICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coIGBIaWAgKSApO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmV2ZW50VHlwZXMoKSApO1xuICAgICAqIC8vIFsgJ2hlbGxvJywgJ2hpJyBdXG4gICAgICovIFxuICAgIHRoaXMuZXZlbnRUeXBlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZmlyc3RcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICovXG4gICAgdGhpcy5maXJzdCA9IGZ1bmN0aW9uKCB0eXBlLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCAwICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmdldE1heExpc3RlbmVyc1xuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDUgKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xuICAgICAqIC8vIDVcbiAgICAgKi9cbiAgICB0aGlzLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lckNvdW50XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdoZWxsbycgKSApO1xuICAgICAqIC8vIDFcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnZ29vZGJ5ZScgKSApO1xuICAgICAqIC8vIDBcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGNvdW50O1xuXG4gICAgICAgIC8vIEVtcHR5XG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgY291bnQgPSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gRnVuY3Rpb25cbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycmF5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudCA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGVsbG8gPSBmdW5jdGlvbigpe1xuICAgICAqICBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTtcbiAgICAgKiB9LFxuICAgICAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVycyggJ2hlbGxvJyApWyAwIF0gPT09IGhlbGxvICk7XG4gICAgICogLy8gdHJ1ZVxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVycyA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBsaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gWyBoYW5kbGVyIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhICptYW55IHRpbWUqIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLiBBZnRlciB0aGUgbGlzdGVuZXIgaXMgaW52b2tlZCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBgdGltZXNgLCBpdCBpcyByZW1vdmVkLlxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm1hbnlcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFueSBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnVGVycnknICk7ICAgICAgLy8gMlxuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdTdGV2ZScgKTsgICAgICAvLyAzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgIC8vIDJcbiAgICAgKiAvLyBIZWxsbywgVGVycnkhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgLy8gM1xuICAgICAqLyBcbiAgICB0aGlzLm1hbnkgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRpbWVzO1xuICAgICAgICAgICAgdGltZXMgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCB0aW1lcyApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndGltZXMgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgdGltZXMsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGBsaXN0ZW5lcmAgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gaXQgaXMgYXNzdW1lZCB0aGUgYGxpc3RlbmVyYCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIElmIGFueSBzaW5nbGUgbGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgbXVsdGlwbGUgdGltZXMgZm9yIHRoZSBzcGVjaWZpZWQgYHR5cGVgLCB0aGVuIGBlbWl0dGVyLm9mZigpYCBtdXN0IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byByZW1vdmUgZWFjaCBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub2ZmXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvZmZcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGFueSBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGdyZWV0KCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRpbmdzLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdKZWZmJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBoZWxsbyggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKi8gXG4gICAgdGhpcy5vZmYgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub25cbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuZXIgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub24gPSBmdW5jdGlvbigpe1xuICAgICAgICBsZXQgdHlwZSA9IGFyZ3VtZW50c1sgMCBdIHx8ICRldmVyeSxcbiAgICAgICAgICAgIGxpc3RlbmVyID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUeXBlIG5vdCBwcm92aWRlZCwgZmFsbCBiYWNrIHRvIFwiJGV2ZXJ5XCJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3Qgb2YgZXZlbnQgYmluZGluZ3NcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICl7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCB0eXBlICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBOYU4gKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uY2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gb25jZSB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub25jZSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIDEsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5zZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gbWF4IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVmb3JlIGEgd2FybmluZyBpcyBpc3N1ZWQuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDEgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqL1xuICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oIG1heCApe1xuICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGVtaXRzIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLiBUaGUgbGlzdGVuZXJzIHdpbGwgc3RpbGwgYmUgc3luY2hyb25vdXNseSBleGVjdXRlZCBpbiB0aGUgc3BlY2lmaWVkIG9yZGVyLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMge0BsaW5rIGV4dGVybmFsOlByb21pc2V8cHJvbWlzZX0gd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudGlja1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkFzeW5jaHJvbm91c2x5IGVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnaGVsbG8nICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnaGVsbG8gaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdnb29kYnllJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2dvb2RieWUgaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiAvLyBoZWxsbyBoZWFyZD8gdHJ1ZVxuICAgICAqIC8vIGdvb2RieWUgaGVhcmQ/IGZhbHNlXG4gICAgICovXG4gICAgdGhpcy50aWNrID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGRhdGEgPSBbXSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICBpZiggbGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgZGF0YSA9IEFycmF5KCBsZW5ndGggLSAxICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggbGV0IGtleSA9IDE7IGtleSA8IGxlbmd0aDsga2V5KysgKXtcbiAgICAgICAgICAgICAgICBkYXRhWyBrZXkgLSAxIF0gPSBhcmd1bWVudHNbIGtleSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGlja0FsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBgZGF0YWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50cmlnZ2VyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2hlbGxvJywgWyAnV29ybGQnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoaScsIFsgJ01hcmsnIF0gKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhlbGxvJywgWyAnSmVmZicgXSApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy50cmlnZ2VyID0gZnVuY3Rpb24oIHR5cGUsIGRhdGEgPSBbXSApe1xuICAgICAgICByZXR1cm4gZW1pdEFsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgdGhhdCB3aWxsIGJlIHRyaWdnZXJlZCAqdW50aWwqIHRoZSBgbGlzdGVuZXJgIHJldHVybnMgYHRydWVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudW50aWxcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnVGVycnknO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnLCAnVGVycnknICk7XG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ0Fhcm9uJyApO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggJ2hlbGxvJywgZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdXb3JsZCc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ01hcmsnICk7XG4gICAgICovXG4gICAgdGhpcy51bnRpbCA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59XG5cbmFzRW1pdHRlci5jYWxsKCBBUEkgKTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byB0aGUgdGFyZ2V0LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJcbiAqIEBwYXJhbSB7QVBJUmVmZXJlbmNlfSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGB0YXJnZXRgLlxuICogQHBhcmFtIHtleHRlcmFsOk9iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3QgdG8gd2hpY2ggdGhlIEVtaXR0ZXIuanMgQVBJIHdpbGwgYmUgYXBwbGllZC5cbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGFsbCBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCBncmVldGVyICk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoICdlbWl0IG9uIG9mZicsIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+UmVtYXBwaW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoIHsgZmlyZTogJ2VtaXQnLCBhZGRMaXN0ZW5lcjogJ29uJyB9LCBncmVldGVyICk7XG4gKiBncmVldGVyLmFkZExpc3RlbmVyKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5maXJlKCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqL1xuIFxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGVtaXR0ZXIuIElmIGBtYXBwaW5nYCBhcmUgcHJvdmlkZWQgdGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcGFzc2VkIGludG8gYG9uKClgIG9uY2UgY29uc3RydWN0aW9uIGlzIGNvbXBsZXRlLlxuICogQGNsYXNzIEVtaXR0ZXJcbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBbbWFwcGluZ10gQSBtYXBwaW5nIG9mIGV2ZW50IHR5cGVzIHRvIGV2ZW50IGxpc3RlbmVycy5cbiAqIEBjbGFzc2Rlc2MgQW4gb2JqZWN0IHRoYXQgZW1pdHMgbmFtZWQgZXZlbnRzIHdoaWNoIGNhdXNlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZC5cbiAqIEBleHRlbmRzIEVtaXR0ZXJ+TnVsbFxuICogQG1peGVzIEVtaXR0ZXJ+YXNFbWl0dGVyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2V2ZW50cy5qc31cbiAqIEBzaW5jZSAxLjAuMFxuICogQGV4YW1wbGUgPGNhcHRpb24+VXNpbmcgRW1pdHRlciBkaXJlY3RseTwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5FeHRlbmRpbmcgRW1pdHRlciB1c2luZyBDbGFzc2ljYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBjbGFzcyBHcmVldGVyIGV4dGVuZHMgRW1pdHRlciB7XG4gKiAgY29uc3RydWN0b3IoKXtcbiAqICAgICAgc3VwZXIoKTtcbiAqICAgICAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogIH1cbiAqIFxuICogIGdyZWV0KCBuYW1lICl7XG4gKiAgICAgIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xuICogIH1cbiAqIH1cbiAqIFxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgUHJvdG90eXBhbCBpbmhlcml0YW5jZTwvY2FwdGlvbj5cbiAqIGZ1bmN0aW9uIEdyZWV0ZXIoKXtcbiAqICBFbWl0dGVyLmNhbGwoIHRoaXMgKTtcbiAqICB0aGlzLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiB9XG4gKiBHcmVldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEVtaXR0ZXIucHJvdG90eXBlICk7XG4gKiBcbiAqIEdyZWV0ZXIucHJvdG90eXBlLmdyZWV0ID0gZnVuY3Rpb24oIG5hbWUgKXtcbiAqICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqIH07XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk5hbWVzcGFjZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAqIC8vIEhpLCBNYXJrIVxuICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAqIEBleGFtcGxlIDxjYXB0aW9uPlByZWRlZmluZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRpbmdzID0ge1xuICogICAgICBoZWxsbzogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIZWxsbywgJHtuYW1lfSFgICksXG4gKiAgICAgIGhpOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhpLCAke25hbWV9IWAgKVxuICogIH0sXG4gKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCBncmVldGluZ3MgKTtcbiAqIFxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnQWFyb24nICk7XG4gKiAvLyBIZWxsbywgQWFyb24hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5PbmUtdGltZSBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5NYW55LXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgICAvLyAxXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAgLy8gMlxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgIC8vIDNcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSGVsbG8sIFRlcnJ5IVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFbWl0dGVyKCl7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGNvbnN0cnVjdG9yXG4gICAgaWYoIHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbnN0cnVjdG9yID09PSBFbWl0dGVyICl7XG4gICAgICAgIGxldCBtYXBwaW5nID0gYXJndW1lbnRzWyAwIF07XG4gICAgICAgIHR5cGVvZiBtYXBwaW5nICE9PSAndW5kZWZpbmVkJyAmJiBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIG1hcHBpbmcgKTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXJzIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmVudCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRoYXQgdG8gYmUgY2hhbmdlZC4gU2V0IHRvICoqMCoqIGZvciB1bmxpbWl0ZWQuXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlciNtYXhMaXN0ZW5lcnNcbiAgICAgICAgICogQHNpbmNlIDEuMC4wXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAgICAgKiBcbiAgICAgICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubWF4TGlzdGVuZXJzICk7XG4gICAgICAgICAqIC8vIDEwXG4gICAgICAgICAqIFxuICAgICAgICAgKiBncmVldGVyLm1heExpc3RlbmVycyA9IDE7XG4gICAgICAgICAqIFxuICAgICAgICAgKiBncmVldGVyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGFsZXJ0KCAnSGVsbG8hJyApICk7XG4gICAgICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAgICAgKi9cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnbWF4TGlzdGVuZXJzJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBtYXggKXtcbiAgICAgICAgICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgICAgIH0gKTtcbiAgICBcbiAgICAvLyBDYWxsZWQgYXMgZnVuY3Rpb25cbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc2VsZWN0aW9uID0gYXJndW1lbnRzWyAwIF0sXG4gICAgICAgICAgICB0YXJnZXQgPSBhcmd1bWVudHNbIDEgXTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50c1xuICAgICAgICBpZiggdHlwZW9mIHRhcmdldCA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRhcmdldCA9IHNlbGVjdGlvbjtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IEFQSTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApO1xuICAgIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIEVtaXR0ZXIsIHtcbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBkZWZhdWx0IG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgYWxsIGVtaXR0ZXJzLiBVc2UgYGVtaXR0ZXIubWF4TGlzdGVuZXJzYCB0byBzZXQgdGhlIG1heGltdW0gb24gYSBwZXItaW5zdGFuY2UgYmFzaXMuXG4gICAgICogXG4gICAgICogQnkgZGVmYXVsdCBFbWl0dGVyIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmVudCBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZSBhZGRlZCB0byBhIHNwZWNpZmljIGV2ZW50IHR5cGUuXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM9MTBcbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DaGFuZ2luZyB0aGUgZGVmYXVsdCBtYXhpbXVtIGxpc3RlbmVyczwvY2FwdGlvbj5cbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzICk7XG4gICAgICogLy8gMTBcbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyMSA9IG5ldyBFbWl0dGVyKCksXG4gICAgICogIGdyZWV0ZXIyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIxLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjEub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlcjEub24oICdoZWxsbycsICgpID0+IGFsZXJ0KCAnSGVsbG8hJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICogXG4gICAgICogZ3JlZXRlcjIub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyMi5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coICdIaSEnICkgKTtcbiAgICAgKiBncmVldGVyMi5vbiggJ2hpJywgKCkgPT4gYWxlcnQoICdIaSEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhpXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKi9cbiAgICBkZWZhdWx0TWF4TGlzdGVuZXJzOiB7XG4gICAgICAgIHZhbHVlOiAxMCxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBzeW1ib2wgdXNlZCB0byBsaXN0ZW4gZm9yIGV2ZW50cyBvZiBhbnkgYHR5cGVgLiBGb3IgX21vc3RfIG1ldGhvZHMsIHdoZW4gbm8gYHR5cGVgIGlzIGdpdmVuIHRoaXMgaXMgdGhlIGRlZmF1bHQuXG4gICAgICogXG4gICAgICogVXNpbmcgYEVtaXR0ZXIuZXZlcnlgIGlzIHR5cGljYWxseSBub3QgbmVjZXNzYXJ5LlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN5bWJvbH0gRW1pdHRlci5ldmVyeVxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggRW1pdHRlci5ldmVyeSwgKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqL1xuICAgIGV2ZXJ5OiB7XG4gICAgICAgIHZhbHVlOiAkZXZlcnksXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgdmVyc2lvbiBvZiAqRW1pdHRlci5qcyouXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBFbWl0dGVyLnZlcnNpb25cbiAgICAgKiBAc2luY2UgMS4xLjJcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLnZlcnNpb24gKTtcbiAgICAgKiAvLyAyLjAuMFxuICAgICAqL1xuICAgIHZlcnNpb246IHtcbiAgICAgICAgdmFsdWU6ICcyLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9XG59ICk7XG5cbkVtaXR0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuRW1pdHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbWl0dGVyO1xuXG5hc0VtaXR0ZXIuY2FsbCggRW1pdHRlci5wcm90b3R5cGUgKTtcblxuLyoqXG4gKiBEZXN0cm95cyB0aGUgZW1pdHRlci5cbiAqIEBmaXJlcyBFbWl0dGVyIzpkZXN0cm95XG4gKi9cbkVtaXR0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIGVtaXRFdmVudCggdGhpcywgJzpkZXN0cm95JywgW10sIHRydWUgKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5kZXN0cm95ID0gdGhpcy5hdCA9IHRoaXMuY2xlYXIgPSB0aGlzLmVtaXQgPSB0aGlzLmV2ZW50VHlwZXMgPSB0aGlzLmZpcnN0ID0gdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyQ291bnQgPSB0aGlzLmxpc3RlbmVycyA9IHRoaXMubWFueSA9IHRoaXMub2ZmID0gdGhpcy5vbiA9IHRoaXMub25jZSA9IHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gdGhpcy50aWNrID0gdGhpcy50cmlnZ2VyID0gdGhpcy51bnRpbCA9IG5vb3A7XG4gICAgdGhpcy50b0pTT04gPSAoKSA9PiAnZGVzdHJveWVkJztcbn07XG5cbi8qKlxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQW4gcGxhaW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xuICogLy8geyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9XG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xuICogLy8gXCJkZXN0cm95ZWRcIlxuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIGNvbnN0IGpzb24gPSBuZXcgTnVsbCgpLFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCB0aGlzWyAkZXZlbnRzIF0gKSxcbiAgICAgICAgbGVuZ3RoID0gdHlwZXMubGVuZ3RoO1xuICAgICAgICBcbiAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICB0eXBlO1xuICAgIFxuICAgIGpzb24ubWF4TGlzdGVuZXJzID0gdGhpcy5tYXhMaXN0ZW5lcnM7XG4gICAganNvbi5saXN0ZW5lckNvdW50ID0gbmV3IE51bGwoKTtcbiAgICBcbiAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgdHlwZSA9IHR5cGVzWyBpbmRleCBdO1xuICAgICAgICBqc29uLmxpc3RlbmVyQ291bnRbIHR5cGUgXSA9IHRoaXMubGlzdGVuZXJDb3VudCggdHlwZSApO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVtaXR0ZXIuXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvU3RyaW5nKCkgKTtcbiAqIC8vICdFbWl0dGVyIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfSdcbiAqIFxuICogZ3JlZXRlci5kZXN0cm95KCk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvU3RyaW5nKCkgKTtcbiAqIC8vICdFbWl0dGVyIFwiZGVzdHJveWVkXCInXG4gKi9cbkVtaXR0ZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gYCR7IHRoaXMuY29uc3RydWN0b3IubmFtZSB9ICR7IEpTT04uc3RyaW5naWZ5KCB0aGlzLnRvSlNPTigpICkgfWAudHJpbSgpO1xufTsiXSwiZmlsZSI6ImVtaXR0ZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==