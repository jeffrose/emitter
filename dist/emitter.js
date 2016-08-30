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
    
    // Define the event registry if it does not exist
    defineEventsProperty( emitter, new Null() );
    
    const _events = emitter[ $events ];
    
    if( _events[ ':on' ] ){
        emitEvent( emitter, ':on', [ type, typeof listener.listener === 'function' ? listener.listener : listener ], false );
        
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
            emitEvent( emitter, ':maxListeners', [ type, listener ], false );
            
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
    executed = ( type && emitEvent( emitter, type, data, type !== $every ) ) || executed;
    
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
    const _events = emitter[ $events ];
    
    let executed = false,
        listener;
    
    if( typeof _events !== 'undefined' ){
        if( type === 'error' && !_events.error ){
            if( data[ 0 ] instanceof Error ){
                throw data[ 0 ];
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
    const handler = emitter[ $events ][ type ];
    
    if( handler === listener || ( typeof handler.listener === 'function' && handler.listener === listener ) ){
        delete emitter[ $events ][ type ];
        if( emitter[ $events ][ ':off' ] ){
            emitEvent( emitter, ':off', [ type, listener ], false );
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
                emitEvent( emitter, ':off', [ type, listener ], false );
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
 * @since 1.1.0
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
    this.at = function( type = $every, index, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'number' && typeof index === 'function' && typeof listener === 'undefined' ){
            listener = index;
            index = type;
            type = $every;
        }
        
        if( !isPositiveNumber( index ) ){
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
    this.first = function( type = $every, listener ){
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
 * @since 2.0.0
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
        
        typeof mapping !== 'undefined' && addEventMapping( this, mapping );
    
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
     * An id used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.
     * 
     * Listener bound to every event will **not** execute for Emitter lifecycle events, like `:maxListeners`.
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
 * @since 1.0.0
 * @fires Emitter#:destroy
 */
Emitter.prototype.destroy = function(){
    emitEvent( this, ':destroy', [], false );
    this.clear();
    delete this.maxListeners;
    this.destroy = this.at = this.clear = this.emit = this.eventTypes = this.first = this.getMaxListeners = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.setMaxListeners = this.tick = this.trigger = this.until = noop;
    this.toJSON = () => 'destroyed';
};

/**
 * @returns {external:Object} An plain object representation of the emitter.
 * @since 1.3.0
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
 * @since 1.3.0
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbWl0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEFycmF5XG4gKiBAZXh0ZXJuYWwgQXJyYXlcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5fVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJtNDU0bXVuMyFpbWl0aXZlfHByaW1pdGl2ZX0gYm9vbGVhblxuICogQGV4dGVybmFsIGJvb2xlYW5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Jvb2xlYW59XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBFcnJvclxuICogQGV4dGVybmFsIEVycm9yXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvcn1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEZ1bmN0aW9uXG4gKiBAZXh0ZXJuYWwgRnVuY3Rpb25cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9ufVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IG51bWJlclxuICogQGV4dGVybmFsIG51bWJlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyfVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IG51bGxcbiAqIEBleHRlcm5hbCBudWxsXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9udWxsfVxuICovXG4gXG4vKipcbiAqIEphdmFTY3JpcHQgT2JqZWN0XG4gKiBAZXh0ZXJuYWwgT2JqZWN0XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3R9XG4gKi9cblxuLyoqXG4gKiBKYXZhU2NyaXB0IFByb21pc2VcbiAqIEBleHRlcm5hbCBQcm9taXNlXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm9taXNlfVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzdHJpbmdcbiAqIEBleHRlcm5hbCBzdHJpbmdcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZ31cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN5bWJvbFxuICogQGV4dGVybmFsIHN5bWJvbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3ltYm9sfVxuICovXG5cbi8qKlxuICogQSBzZXQgb2YgbWV0aG9kIHJlZmVyZW5jZXMgdG8gdGhlIEVtaXR0ZXIuanMgQVBJLlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpPYmplY3R9IEFQSVJlZmVyZW5jZVxuICogQGV4YW1wbGUgPGNhcHRpb24+QSBzZWxlY3Rpb24gcmVmZXJlbmNlPC9jYXB0aW9uPlxuICogJ2VtaXQgb2ZmIG9uIG9uY2UnXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BIG1hcHBpbmcgcmVmZXJlbmNlPC9jYXB0aW9uPlxuICogLy8gJ2VtaXQoKScgd2lsbCBiZSBtYXBwZWQgdG8gJ2ZpcmUoKSdcbiAqIC8vICdvbigpJyB3aWxsIGJlIG1hcHBlZCB0byAnYWRkTGlzdGVuZXIoKSdcbiAqIC8vICdvZmYoKScgd2lsbCBiZSBtYXBwZWQgdG8gJ3JlbW92ZUxpc3RlbmVyKCknXG4gKiB7XG4gKiAgZmlyZTogJ2VtaXQnLFxuICogIGFkZExpc3RlbmVyOiAnb24nLFxuICogIHJlbW92ZUxpc3RlbmVyOiAnb2ZmJ1xuICogfVxuICovXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258IGZ1bmN0aW9ufSBib3VuZCB0byBhbiBlbWl0dGVyIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZX0uIEFueSBkYXRhIHRyYW5zbWl0dGVkIHdpdGggdGhlIGV2ZW50IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVyIGFzIGFyZ3VtZW50cy5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHsuLi4qfSBkYXRhIFRoZSBhcmd1bWVudHMgcGFzc2VkIGJ5IHRoZSBgZW1pdGAuXG4gKi9cblxuLyoqXG4gKiBBbiB7QGxpbmsgZXh0ZXJuYWw6T2JqZWN0fG9iamVjdH0gdGhhdCBtYXBzIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZXN9IHRvIHtAbGluayBFdmVudExpc3RlbmVyfGV2ZW50IGxpc3RlbmVyc30uXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6T2JqZWN0fSBFdmVudE1hcHBpbmdcbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOnN0cmluZ30gb3Ige0BsaW5rIGV4dGVybmFsOnN5bWJvbH0gdGhhdCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIGV2ZW50IGZpcmVkIGJ5IHRoZSBFbWl0dGVyLlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpzeW1ib2x9IEV2ZW50VHlwZVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhbiBlbWl0dGVyIGRlc3Ryb3lzIGl0c2VsZi5cbiAqIEBldmVudCBFbWl0dGVyIzpkZXN0cm95XG4gKi8gXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9hZnRlcl8gYSBsaXN0ZW5lciBpcyByZW1vdmVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9mZlxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGEgbGlzdGVuZXIgaXMgYWRkZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b25cbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgaGFzIGJlZW4gZXhjZWVkZWQgZm9yIGFuIGV2ZW50IHR5cGUuXG4gKiBAZXZlbnQgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIEVtaXR0ZXJ+TnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5mdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGw7XG5cbmNvbnN0XG4gICAgJGV2ZW50cyAgICAgICA9ICdAQGVtaXR0ZXIvZXZlbnRzJyxcbiAgICAkZXZlcnkgICAgICAgID0gJ0BAZW1pdHRlci9ldmVyeScsXG4gICAgJG1heExpc3RlbmVycyA9ICdAQGVtaXR0ZXIvbWF4TGlzdGVuZXJzJyxcbiAgICBcbiAgICBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgXG4gICAgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcbiAgICBcbiAgICBBUEkgPSBuZXcgTnVsbCgpO1xuXG4vLyBNYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyBhcmUgYnJva2VuIG91dCBmcm9tIHRoZSBwcm90b3R5cGUgZm9yIHRoZSBzYWtlIG9mIG9wdGltaXphdGlvbi4gVGhlIGZ1bmN0aW9ucyBvbiB0aGUgcHJvdG95dHlwZVxuLy8gdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBhcyBhIHJlc3VsdC4gVGhlc2UgZnVuY3Rpb25zIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgYXJndW1lbnRzXG4vLyBhbmQgdGhlcmVmb3JlIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQuXG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gY29uZGl0aW9uYWxMaXN0ZW5lcigpe1xuICAgICAgICBjb25zdCBkb25lID0gbGlzdGVuZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3VtZW50cyApO1xuICAgICAgICBpZiggZG9uZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE8gQ2hlY2sgYmV5b25kIGp1c3Qgb25lIGxldmVsIG9mIGxpc3RlbmVyIHJlZmVyZW5jZXNcbiAgICBjb25kaXRpb25hbExpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXIubGlzdGVuZXIgfHwgbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciwgTmFOICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKXtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgfVxuICAgIFxuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3RcbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgaWYoIF9ldmVudHNbICc6b24nIF0gKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9uJywgWyB0eXBlLCB0eXBlb2YgbGlzdGVuZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyIF0sIGZhbHNlICk7XG4gICAgICAgIFxuICAgICAgICAvLyBFbWl0dGluZyBcIm9uXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgIF9ldmVudHNbICc6b24nIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b24nIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgIGlmKCAhX2V2ZW50c1sgdHlwZSBdICl7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGxpc3RlbmVyO1xuICAgIFxuICAgIC8vIE11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggX2V2ZW50c1sgdHlwZSBdICkgKXtcbiAgICAgICAgc3dpdGNoKCBpc05hTiggaW5kZXggKSB8fCBpbmRleCApe1xuICAgICAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS51bnNoaWZ0KCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0uc3BsaWNlKCBpbmRleCwgMCwgbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIFxuICAgIC8vIFRyYW5zaXRpb24gZnJvbSBzaW5nbGUgdG8gbXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gaW5kZXggPT09IDAgP1xuICAgICAgICAgICAgWyBsaXN0ZW5lciwgX2V2ZW50c1sgdHlwZSBdIF0gOlxuICAgICAgICAgICAgWyBfZXZlbnRzWyB0eXBlIF0sIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYWNrIHdhcm5pbmdzIGlmIG1heCBsaXN0ZW5lcnMgaXMgYXZhaWxhYmxlXG4gICAgaWYoICdtYXhMaXN0ZW5lcnMnIGluIGVtaXR0ZXIgJiYgIV9ldmVudHNbIHR5cGUgXS53YXJuZWQgKXtcbiAgICAgICAgY29uc3QgbWF4ID0gZW1pdHRlci5tYXhMaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggbWF4ICYmIG1heCA+IDAgJiYgX2V2ZW50c1sgdHlwZSBdLmxlbmd0aCA+IG1heCApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm1heExpc3RlbmVycycsIFsgdHlwZSwgbGlzdGVuZXIgXSwgZmFsc2UgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRW1pdHRpbmcgXCJtYXhMaXN0ZW5lcnNcIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgICAgIF9ldmVudHNbICc6bWF4TGlzdGVuZXJzJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm1heExpc3RlbmVycycgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZW1pdHRlclsgJGV2ZW50cyBdID0gX2V2ZW50cztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRGaW5pdGVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGZpbml0ZUxpc3RlbmVyKCl7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgcmV0dXJuIC0tdGltZXMgPT09IDA7XG4gICAgfVxuICAgIFxuICAgIGZpbml0ZUxpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBmaW5pdGVMaXN0ZW5lciApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TWFwcGluZ1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudE1hcHBpbmd9IG1hcHBpbmcgVGhlIGV2ZW50IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50TWFwcGluZyggZW1pdHRlciwgbWFwcGluZyApe1xuICAgIGNvbnN0XG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIG1hcHBpbmcgKSxcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICBcbiAgICBsZXQgdHlwZUluZGV4ID0gMCxcbiAgICAgICAgaGFuZGxlciwgaGFuZGxlckluZGV4LCBoYW5kbGVyTGVuZ3RoLCB0eXBlO1xuICAgIFxuICAgIGZvciggOyB0eXBlSW5kZXggPCB0eXBlTGVuZ3RoOyB0eXBlSW5kZXggKz0gMSApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIHR5cGVJbmRleCBdO1xuICAgICAgICBoYW5kbGVyID0gbWFwcGluZ1sgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgLy8gTGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgaGFuZGxlckluZGV4ID0gMDtcbiAgICAgICAgICAgIGhhbmRsZXJMZW5ndGggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggOyBoYW5kbGVySW5kZXggPCBoYW5kbGVyTGVuZ3RoOyBoYW5kbGVySW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXJbIGhhbmRsZXJJbmRleCBdLCBOYU4gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgaGFuZGxlciwgTmFOICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZGVmaW5lRXZlbnRzUHJvcGVydHlcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgcHJvcGVydHkgd2lsbCBiZSBjcmVhdGVkLlxuICovIFxuZnVuY3Rpb24gZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIHZhbHVlICl7XG4gICAgY29uc3QgaGFzRXZlbnRzID0gaGFzT3duUHJvcGVydHkuY2FsbCggZW1pdHRlciwgJGV2ZW50cyApLFxuICAgICAgICBlbWl0dGVyUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCBlbWl0dGVyICk7XG4gICAgICAgIFxuICAgIGlmKCAhaGFzRXZlbnRzIHx8ICggZW1pdHRlclByb3RvdHlwZSAmJiBlbWl0dGVyWyAkZXZlbnRzIF0gPT09IGVtaXR0ZXJQcm90b3R5cGVbICRldmVudHMgXSApICl7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJGV2ZW50cywge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9ICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRBbGxFdmVudHNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgLy8gSWYgdHlwZSBpcyBub3QgYSBzdHJpbmcsIGluZGV4IHdpbGwgYmUgZmFsc2VcbiAgICAgICAgaW5kZXggPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgXG4gICAgLy8gTmFtZXNwYWNlZCBldmVudCwgZS5nLiBFbWl0IFwiZm9vOmJhcjpxdXhcIiwgdGhlbiBcImZvbzpiYXJcIlxuICAgIHdoaWxlKCBpbmRleCA+IDAgKXtcbiAgICAgICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBmYWxzZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgICAgIHR5cGUgPSB0eXBlLnN1YnN0cmluZyggMCwgaW5kZXggKTtcbiAgICAgICAgaW5kZXggPSB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRW1pdCBzaW5nbGUgZXZlbnQgb3IgdGhlIG5hbWVzcGFjZWQgZXZlbnQgcm9vdCwgZS5nLiBcImZvb1wiLCBcIjpiYXJcIiwgU3ltYm9sKCBcIkBAcXV4XCIgKVxuICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgdHlwZSAhPT0gJGV2ZXJ5ICkgKSB8fCBleGVjdXRlZDtcbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEVycm9yc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBgZXJyb3JzYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0FycmF5PGV4dGVybmFsOkVycm9yPn0gZXJyb3JzIFRoZSBhcnJheSBvZiBlcnJvcnMgdG8gYmUgZW1pdHRlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICl7XG4gICAgY29uc3QgbGVuZ3RoID0gZXJyb3JzLmxlbmd0aDtcbiAgICBmb3IoIGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJ2Vycm9yJywgWyBlcnJvcnNbIGluZGV4IF0gXSwgZmFsc2UgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEV2ZW50XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBlbWl0RXZlcnkgV2hldGhlciBvciBub3QgbGlzdGVuZXJzIGZvciBhbGwgdHlwZXMgd2lsbCBiZSBleGVjdXRlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBlbWl0RXZlcnkgKXtcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcjtcbiAgICBcbiAgICBpZiggdHlwZW9mIF9ldmVudHMgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGlmKCB0eXBlID09PSAnZXJyb3InICYmICFfZXZlbnRzLmVycm9yICl7XG4gICAgICAgICAgICBpZiggZGF0YVsgMCBdIGluc3RhbmNlb2YgRXJyb3IgKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBkYXRhWyAwIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBmb3IgdGhlIGdpdmVuIHR5cGUgb2YgZXZlbnRcbiAgICAgICAgbGlzdGVuZXIgPSBfZXZlbnRzWyB0eXBlIF07XG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGxpc3RlbmluZyBmb3IgYWxsIHR5cGVzIG9mIGV2ZW50c1xuICAgICAgICBpZiggZW1pdEV2ZXJ5ICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IF9ldmVudHNbICRldmVyeSBdO1xuICAgICAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgICAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGxpc3RlbmVyIHVzaW5nIHRoZSBpbnRlcm5hbCBgZXhlY3V0ZSpgIGZ1bmN0aW9ucyBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVMaXN0ZW5lclxuICogQHBhcmFtIHtBcnJheTxMaXN0ZW5lcj58TGlzdGVuZXJ9IGxpc3RlbmVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gKiBAcGFyYW0geyp9IHNjb3BlXG4gKi8gXG5mdW5jdGlvbiBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBzY29wZSApe1xuICAgIGNvbnN0IGlzRnVuY3Rpb24gPSB0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbic7XG4gICAgXG4gICAgc3dpdGNoKCBkYXRhLmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBsaXN0ZW5FbXB0eSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpc3Rlbk9uZSAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsaXN0ZW5Ud28gICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBsaXN0ZW5UaHJlZSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0sIGRhdGFbIDIgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsaXN0ZW5NYW55ICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldEV2ZW50VHlwZXNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCBldmVudCB0eXBlcyB3aWxsIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBnZXRFdmVudFR5cGVzKCBlbWl0dGVyICl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCBlbWl0dGVyWyAkZXZlbnRzIF0gKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRNYXhMaXN0ZW5lcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCBtYXggbGlzdGVuZXJzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gIT09ICd1bmRlZmluZWQnID9cbiAgICAgICAgZW1pdHRlclsgJG1heExpc3RlbmVycyBdIDpcbiAgICAgICAgRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+aXNQb3NpdGl2ZU51bWJlclxuICogQHBhcmFtIHsqfSBudW1iZXIgVGhlIHZhbHVlIHRvIGJlIHRlc3RlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKi9cbmZ1bmN0aW9uIGlzUG9zaXRpdmVOdW1iZXIoIG51bWJlciApe1xuICAgIHJldHVybiB0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyAmJiBudW1iZXIgPj0gMCAmJiAhaXNOYU4oIG51bWJlciApO1xufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG5vIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlbkVtcHR5XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuRW1wdHkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG9uZSBhcmd1bWVudC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk9uZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5PbmUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdHdvIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblR3b1xuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblR3byggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0aHJlZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5UaHJlZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzMgVGhlIHRoaXJkIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5UaHJlZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBmb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuTWFueVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBhcmdzIEZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk1hbnkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZ3MgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5yZW1vdmVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIGNvbnN0IGhhbmRsZXIgPSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICBcbiAgICBpZiggaGFuZGxlciA9PT0gbGlzdGVuZXIgfHwgKCB0eXBlb2YgaGFuZGxlci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJiBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgXG4gICAgICAgIGZvciggbGV0IGkgPSBoYW5kbGVyLmxlbmd0aDsgaS0tID4gMDsgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyWyBpIF0gPT09IGxpc3RlbmVyIHx8ICggaGFuZGxlclsgaSBdLmxpc3RlbmVyICYmIGhhbmRsZXJbIGkgXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiggaW5kZXggPiAtMSApe1xuICAgICAgICAgICAgaWYoIGhhbmRsZXIubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3BsaWNlTGlzdCggaGFuZGxlciwgaW5kZXggKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCBmYWxzZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIHdpbGwgYmUgc2V0LlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICovXG5mdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIsIG1heCApe1xuICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggbWF4ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ21heCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgIH1cbiAgICBcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRtYXhMaXN0ZW5lcnMsIHtcbiAgICAgICAgdmFsdWU6IG1heCxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9ICk7XG59XG5cbi8qKlxuICogRmFzdGVyIHRoYW4gYEFycmF5LnByb3RvdHlwZS5zcGxpY2VgXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zcGxpY2VMaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBsaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqLyBcbmZ1bmN0aW9uIHNwbGljZUxpc3QoIGxpc3QsIGluZGV4ICl7XG4gICAgZm9yKCBsZXQgaSA9IGluZGV4LCBqID0gaSArIDEsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBqIDwgbGVuZ3RoOyBpICs9IDEsIGogKz0gMSApe1xuICAgICAgICBsaXN0WyBpIF0gPSBsaXN0WyBqIF07XG4gICAgfVxuICAgIFxuICAgIGxpc3QucG9wKCk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgZXhlY3V0ZXMgYSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC5cbiAqL1xuZnVuY3Rpb24gdGljayggY2FsbGJhY2sgKXtcbiAgICByZXR1cm4gc2V0VGltZW91dCggY2FsbGJhY2ssIDAgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrQWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiB0aWNrQWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICl7XG4gICAgICAgIHRpY2soIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICkgPyByZXNvbHZlKCkgOiByZWplY3QoKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgYHNlbGVjdGlvbmAgb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRvRW1pdHRlclxuICogQHBhcmFtIHtBUElSZWZlcmVuY2V9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCBvbiB3aGljaCB0aGUgQVBJIHdpbGwgYmUgYXBwbGllZC5cbiAqL1xuZnVuY3Rpb24gdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApe1xuICAgIFxuICAgIC8vIEFwcGx5IHRoZSBlbnRpcmUgRW1pdHRlciBBUElcbiAgICBpZiggc2VsZWN0aW9uID09PSBBUEkgKXtcbiAgICAgICAgYXNFbWl0dGVyLmNhbGwoIHRhcmdldCApO1xuICAgIFxuICAgIC8vIEFwcGx5IG9ubHkgdGhlIHNlbGVjdGVkIEFQSSBtZXRob2RzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGluZGV4LCBrZXksIG1hcHBpbmcsIG5hbWVzLCB2YWx1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2Ygc2VsZWN0aW9uID09PSAnc3RyaW5nJyApe1xuICAgICAgICAgICAgbmFtZXMgPSBzZWxlY3Rpb24uc3BsaXQoICcgJyApO1xuICAgICAgICAgICAgbWFwcGluZyA9IEFQSTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hbWVzID0gT2JqZWN0LmtleXMoIHNlbGVjdGlvbiApO1xuICAgICAgICAgICAgbWFwcGluZyA9IHNlbGVjdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBuYW1lcy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAga2V5ID0gbmFtZXNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IG1hcHBpbmdbIGtleSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0YXJnZXRbIGtleSBdID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgICAgICB2YWx1ZSA6XG4gICAgICAgICAgICAgICAgQVBJWyB2YWx1ZSBdO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgZnVuY3Rpb25hbCBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byBpdHMgdGFyZ2V0LiBUaGUgYGNvbnN0cnVjdG9yKClgLCBgZGVzdHJveSgpYCwgYHRvSlNPTigpYCwgYHRvU3RyaW5nKClgLCBhbmQgc3RhdGljIHByb3BlcnRpZXMgb24gYEVtaXR0ZXJgIGFyZSBub3QgcHJvdmlkZWQuIFRoaXMgbWl4aW4gaXMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgYHByb3RvdHlwZWAgb2YgYEVtaXR0ZXJgLlxuICogXG4gKiBMaWtlIGFsbCBmdW5jdGlvbmFsIG1peGlucywgdGhpcyBzaG91bGQgYmUgZXhlY3V0ZWQgd2l0aCBbY2FsbCgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9jYWxsKSBvciBbYXBwbHkoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYXBwbHkpLlxuICogQG1peGluIEVtaXR0ZXJ+YXNFbWl0dGVyXG4gKiBAc2luY2UgMS4xLjBcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIEVtaXR0ZXIgZnVuY3Rpb25hbGl0eTwvY2FwdGlvbj5cbiAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogXG4gKiAvLyBBcHBseSB0aGUgbWl4aW5cbiAqIGFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XG4gKiBcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICogLy8gSGVsbG8sIFdvcmxkIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgY2hhb3MgdG8geW91ciB3b3JsZDwvY2FwdGlvbj5cbiAqIC8vIE5PISEhXG4gKiBhc0VtaXR0ZXIoKTsgLy8gTWFkbmVzcyBlbnN1ZXNcbiAqL1xuZnVuY3Rpb24gYXNFbWl0dGVyKCl7XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCBhdCB0aGUgc3BlY2lmaWVkIGBpbmRleGAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5hdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4IFdoZXJlIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGFkZGVkIGluIHRoZSB0cmlnZ2VyIGxpc3QuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKi9cbiAgICB0aGlzLmF0ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGluZGV4LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgaW5kZXggPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggaW5kZXggKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2luZGV4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5jbGVhclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhcigpO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbigge1xuICAgICAqICAnaGVsbG8nIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIZWxsbyEnICk7IH0sXG4gICAgICogICdoaScgICAgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hpIScgKTsgfVxuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICovXG4gICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBoYW5kbGVyO1xuICAgICAgICBcbiAgICAgICAgLy8gTm8gRXZlbnRzXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2l0aCBubyBcIm9mZlwiIGxpc3RlbmVycywgY2xlYXJpbmcgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgYWxsIGxpc3RlbmVyc1xuICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgY29uc3QgdHlwZXMgPSBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEF2b2lkIHJlbW92aW5nIFwib2ZmXCIgbGlzdGVuZXJzIHVudGlsIGFsbCBvdGhlciB0eXBlcyBoYXZlIGJlZW4gcmVtb3ZlZFxuICAgICAgICAgICAgZm9yKCBsZXQgaW5kZXggPSAwLCBsZW5ndGggPSB0eXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgaWYoIHR5cGVzWyBpbmRleCBdID09PSAnOm9mZicgKXtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoIHR5cGVzWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGNsZWFyIFwib2ZmXCJcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoICc6b2ZmJyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyICk7XG4gICAgICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5lbWl0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTsgICAgLy8gdHJ1ZVxuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7ICAvLyBmYWxzZVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50IHdpdGggZGF0YTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGEgbmFtZXNwYWNlZCBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiAvLyBUaGlzIGV2ZW50IHdpbGwgbm90IGJlIHRyaWdnZXJlZCBieSBlbWl0dGluZyBcImdyZWV0aW5nOmhlbGxvXCJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvIGFnYWluLCAkeyBuYW1lIH1gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgZGF0YSA9IFtdLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIGlmKCBsZW5ndGggPiAxICl7XG4gICAgICAgICAgICBkYXRhID0gQXJyYXkoIGxlbmd0aCAtIDEgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCBsZXQga2V5ID0gMTsga2V5IDwgbGVuZ3RoOyBrZXkrKyApe1xuICAgICAgICAgICAgICAgIGRhdGFbIGtleSAtIDEgXSA9IGFyZ3VtZW50c1sga2V5IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZXZlbnRUeXBlc1xuICAgICAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coIGBIZWxsb2AgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCBgSGlgICkgKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5ldmVudFR5cGVzKCkgKTtcbiAgICAgKiAvLyBbICdoZWxsbycsICdoaScgXVxuICAgICAqLyBcbiAgICB0aGlzLmV2ZW50VHlwZXMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmZpcnN0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqL1xuICAgIHRoaXMuZmlyc3QgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgMCApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZXQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5nZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZ2V0TWF4TGlzdGVuZXJzKCkgKTtcbiAgICAgKiAvLyAxMFxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuc2V0TWF4TGlzdGVuZXJzKCA1ICk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZ2V0TWF4TGlzdGVuZXJzKCkgKTtcbiAgICAgKiAvLyA1XG4gICAgICovXG4gICAgdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJDb3VudFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnaGVsbG8nICkgKTtcbiAgICAgKiAvLyAxXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2dvb2RieWUnICkgKTtcbiAgICAgKiAvLyAwXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBjb3VudDtcblxuICAgICAgICAvLyBFbXB0eVxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGNvdW50ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHRoaXNbICRldmVudHMgXVsgdHlwZSBdID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgIFxuICAgICAgICAvLyBBcnJheVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY291bnQgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhlbGxvID0gZnVuY3Rpb24oKXtcbiAgICAgKiAgY29uc29sZS5sb2coICdIZWxsbyEnICk7XG4gICAgICogfSxcbiAgICAgKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lcnMoICdoZWxsbycgKVsgMCBdID09PSBoZWxsbyApO1xuICAgICAqIC8vIHRydWVcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgbGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFsgaGFuZGxlciBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSAqbWFueSB0aW1lKiBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC4gQWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIGludm9rZWQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgYHRpbWVzYCwgaXQgaXMgcmVtb3ZlZC5cbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5tYW55XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbnkgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1RlcnJ5JyApOyAgICAgIC8vIDJcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnU3RldmUnICk7ICAgICAgLy8gM1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAvLyAyXG4gICAgICogLy8gSGVsbG8sIFRlcnJ5IVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgIC8vIDNcbiAgICAgKi8gXG4gICAgdGhpcy5tYW55ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aW1lcztcbiAgICAgICAgICAgIHRpbWVzID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggdGltZXMgKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3RpbWVzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBgbGlzdGVuZXJgIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIGl0IGlzIGFzc3VtZWQgdGhlIGBsaXN0ZW5lcmAgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBJZiBhbnkgc2luZ2xlIGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgdGhlbiBgZW1pdHRlci5vZmYoKWAgbXVzdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gcmVtb3ZlIGVhY2ggaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9mZlxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b2ZmXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhbnkgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBncmVldCggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0aW5ncywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnSmVmZicgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gaGVsbG8oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICovIFxuICAgIHRoaXMub2ZmID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IHR5cGUgPSBhcmd1bWVudHNbIDAgXSB8fCAkZXZlcnksXG4gICAgICAgICAgICBsaXN0ZW5lciA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVHlwZSBub3QgcHJvdmlkZWQsIGZhbGwgYmFjayB0byBcIiRldmVyeVwiXG4gICAgICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0IG9mIGV2ZW50IGJpbmRpbmdzXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TWFwcGluZyggdGhpcywgdHlwZSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgTmFOICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vbmNlXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIG9uY2UgdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uY2UgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCAxLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZXQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIG1ldGhvZCBhbGxvd3MgdGhhdCB0byBiZSBjaGFuZ2VkLiBTZXQgdG8gKiowKiogZm9yIHVubGltaXRlZC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuc2V0TWF4TGlzdGVuZXJzKCAxICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKi9cbiAgICB0aGlzLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCBtYXggKXtcbiAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBlbWl0cyBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy4gVGhlIGxpc3RlbmVycyB3aWxsIHN0aWxsIGJlIHN5bmNocm9ub3VzbHkgZXhlY3V0ZWQgaW4gdGhlIHNwZWNpZmllZCBvcmRlci5cbiAgICAgKiBcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIHtAbGluayBleHRlcm5hbDpQcm9taXNlfHByb21pc2V9IHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRpY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5Bc3luY2hyb25vdXNseSBlbWl0dGluZyBhbiBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIudGljayggJ2hlbGxvJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2hlbGxvIGhlYXJkPyAnLCBoZWFyZCApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnZ29vZGJ5ZScgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdnb29kYnllIGhlYXJkPyAnLCBoZWFyZCApICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogLy8gaGVsbG8gaGVhcmQ/IHRydWVcbiAgICAgKiAvLyBnb29kYnllIGhlYXJkPyBmYWxzZVxuICAgICAqL1xuICAgIHRoaXMudGljayA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBkYXRhID0gW10sXG4gICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgaWYoIGxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgIGRhdGEgPSBBcnJheSggbGVuZ3RoIC0gMSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIGxldCBrZXkgPSAxOyBrZXkgPCBsZW5ndGg7IGtleSsrICl7XG4gICAgICAgICAgICAgICAgZGF0YVsga2V5IC0gMSBdID0gYXJndW1lbnRzWyBrZXkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRpY2tBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYGRhdGFgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudHJpZ2dlclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdoZWxsbycsIFsgJ1dvcmxkJyBdICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoZWxsbycsIFsgJ0plZmYnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWQgKnVudGlsKiB0aGUgYGxpc3RlbmVyYCByZXR1cm5zIGB0cnVlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnVudGlsXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1RlcnJ5JztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJywgJ1RlcnJ5JyApO1xuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdBYXJvbicgKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoICdoZWxsbycsIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnV29ybGQnO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdNYXJrJyApO1xuICAgICAqL1xuICAgIHRoaXMudW50aWwgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufVxuXG5hc0VtaXR0ZXIuY2FsbCggQVBJICk7XG5cbi8qKlxuICogQXBwbGllcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIHRhcmdldC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyXG4gKiBAcGFyYW0ge0FQSVJlZmVyZW5jZX0gW3NlbGVjdGlvbl0gQSBzZWxlY3Rpb24gb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBwYXJhbSB7ZXh0ZXJhbDpPYmplY3R9IHRhcmdldCBUaGUgb2JqZWN0IHRvIHdoaWNoIHRoZSBFbWl0dGVyLmpzIEFQSSB3aWxsIGJlIGFwcGxpZWQuXG4gKiBAc2luY2UgMi4wLjBcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGFsbCBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCBncmVldGVyICk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoICdlbWl0IG9uIG9mZicsIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+UmVtYXBwaW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoIHsgZmlyZTogJ2VtaXQnLCBhZGRMaXN0ZW5lcjogJ29uJyB9LCBncmVldGVyICk7XG4gKiBncmVldGVyLmFkZExpc3RlbmVyKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5maXJlKCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqL1xuIFxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGVtaXR0ZXIuIElmIGBtYXBwaW5nYCBhcmUgcHJvdmlkZWQgdGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcGFzc2VkIGludG8gYG9uKClgIG9uY2UgY29uc3RydWN0aW9uIGlzIGNvbXBsZXRlLlxuICogQGNsYXNzIEVtaXR0ZXJcbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBbbWFwcGluZ10gQSBtYXBwaW5nIG9mIGV2ZW50IHR5cGVzIHRvIGV2ZW50IGxpc3RlbmVycy5cbiAqIEBjbGFzc2Rlc2MgQW4gb2JqZWN0IHRoYXQgZW1pdHMgbmFtZWQgZXZlbnRzIHdoaWNoIGNhdXNlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZC5cbiAqIEBleHRlbmRzIEVtaXR0ZXJ+TnVsbFxuICogQG1peGVzIEVtaXR0ZXJ+YXNFbWl0dGVyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2V2ZW50cy5qc31cbiAqIEBzaW5jZSAxLjAuMFxuICogQGV4YW1wbGUgPGNhcHRpb24+VXNpbmcgRW1pdHRlciBkaXJlY3RseTwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5FeHRlbmRpbmcgRW1pdHRlciB1c2luZyBDbGFzc2ljYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBjbGFzcyBHcmVldGVyIGV4dGVuZHMgRW1pdHRlciB7XG4gKiAgY29uc3RydWN0b3IoKXtcbiAqICAgICAgc3VwZXIoKTtcbiAqICAgICAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogIH1cbiAqIFxuICogIGdyZWV0KCBuYW1lICl7XG4gKiAgICAgIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xuICogIH1cbiAqIH1cbiAqIFxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgUHJvdG90eXBhbCBpbmhlcml0YW5jZTwvY2FwdGlvbj5cbiAqIGZ1bmN0aW9uIEdyZWV0ZXIoKXtcbiAqICBFbWl0dGVyLmNhbGwoIHRoaXMgKTtcbiAqICB0aGlzLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiB9XG4gKiBHcmVldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEVtaXR0ZXIucHJvdG90eXBlICk7XG4gKiBcbiAqIEdyZWV0ZXIucHJvdG90eXBlLmdyZWV0ID0gZnVuY3Rpb24oIG5hbWUgKXtcbiAqICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqIH07XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk5hbWVzcGFjZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAqIC8vIEhpLCBNYXJrIVxuICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAqIEBleGFtcGxlIDxjYXB0aW9uPlByZWRlZmluZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRpbmdzID0ge1xuICogICAgICBoZWxsbzogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIZWxsbywgJHtuYW1lfSFgICksXG4gKiAgICAgIGhpOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhpLCAke25hbWV9IWAgKVxuICogIH0sXG4gKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCBncmVldGluZ3MgKTtcbiAqIFxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnQWFyb24nICk7XG4gKiAvLyBIZWxsbywgQWFyb24hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5PbmUtdGltZSBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5NYW55LXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgICAvLyAxXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAgLy8gMlxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgIC8vIDNcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSGVsbG8sIFRlcnJ5IVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFbWl0dGVyKCl7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGNvbnN0cnVjdG9yXG4gICAgaWYoIHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbnN0cnVjdG9yID09PSBFbWl0dGVyICl7XG4gICAgICAgIGxldCBtYXBwaW5nID0gYXJndW1lbnRzWyAwIF07XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQnkgZGVmYXVsdCBFbWl0dGVycyB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIHByb3BlcnR5IGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIjbWF4TGlzdGVuZXJzXG4gICAgICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgICAgICogXG4gICAgICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLm1heExpc3RlbmVycyApO1xuICAgICAgICAgKiAvLyAxMFxuICAgICAgICAgKiBcbiAgICAgICAgICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSAxO1xuICAgICAgICAgKiBcbiAgICAgICAgICogZ3JlZXRlci5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgICAgICovXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heExpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgICAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG4gICAgICAgIFxuICAgICAgICB0eXBlb2YgbWFwcGluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCBtYXBwaW5nICk7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGZ1bmN0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IGFyZ3VtZW50c1sgMCBdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHNcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0YXJnZXQgPSBzZWxlY3Rpb247XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBBUEk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZGVmYXVsdCBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBlbWl0dGVycy4gVXNlIGBlbWl0dGVyLm1heExpc3RlbmVyc2AgdG8gc2V0IHRoZSBtYXhpbXVtIG9uIGEgcGVyLWluc3RhbmNlIGJhc2lzLlxuICAgICAqIFxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPTEwXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlcjEgPSBuZXcgRW1pdHRlcigpLFxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGFsZXJ0KCAnSGkhJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICovXG4gICAgZGVmYXVsdE1heExpc3RlbmVyczoge1xuICAgICAgICB2YWx1ZTogMTAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBbiBpZCB1c2VkIHRvIGxpc3RlbiBmb3IgZXZlbnRzIG9mIGFueSBgdHlwZWAuIEZvciBfbW9zdF8gbWV0aG9kcywgd2hlbiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhpcyBpcyB0aGUgZGVmYXVsdC5cbiAgICAgKiBcbiAgICAgKiBMaXN0ZW5lciBib3VuZCB0byBldmVyeSBldmVudCB3aWxsICoqbm90KiogZXhlY3V0ZSBmb3IgRW1pdHRlciBsaWZlY3ljbGUgZXZlbnRzLCBsaWtlIGA6bWF4TGlzdGVuZXJzYC5cbiAgICAgKiBcbiAgICAgKiBVc2luZyBgRW1pdHRlci5ldmVyeWAgaXMgdHlwaWNhbGx5IG5vdCBuZWNlc3NhcnkuXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3ltYm9sfSBFbWl0dGVyLmV2ZXJ5XG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBFbWl0dGVyLmV2ZXJ5LCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICovXG4gICAgZXZlcnk6IHtcbiAgICAgICAgdmFsdWU6ICRldmVyeSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mICpFbWl0dGVyLmpzKi5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEVtaXR0ZXIudmVyc2lvblxuICAgICAqIEBzaW5jZSAxLjEuMlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIudmVyc2lvbiApO1xuICAgICAqIC8vIDIuMC4wXG4gICAgICovXG4gICAgdmVyc2lvbjoge1xuICAgICAgICB2YWx1ZTogJzIuMC4wJyxcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH1cbn0gKTtcblxuRW1pdHRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5FbWl0dGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVtaXR0ZXI7XG5cbmFzRW1pdHRlci5jYWxsKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuXG4vKipcbiAqIERlc3Ryb3lzIHRoZSBlbWl0dGVyLlxuICogQHNpbmNlIDEuMC4wXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCBmYWxzZSApO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICBkZWxldGUgdGhpcy5tYXhMaXN0ZW5lcnM7XG4gICAgdGhpcy5kZXN0cm95ID0gdGhpcy5hdCA9IHRoaXMuY2xlYXIgPSB0aGlzLmVtaXQgPSB0aGlzLmV2ZW50VHlwZXMgPSB0aGlzLmZpcnN0ID0gdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyQ291bnQgPSB0aGlzLmxpc3RlbmVycyA9IHRoaXMubWFueSA9IHRoaXMub2ZmID0gdGhpcy5vbiA9IHRoaXMub25jZSA9IHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gdGhpcy50aWNrID0gdGhpcy50cmlnZ2VyID0gdGhpcy51bnRpbCA9IG5vb3A7XG4gICAgdGhpcy50b0pTT04gPSAoKSA9PiAnZGVzdHJveWVkJztcbn07XG5cbi8qKlxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQW4gcGxhaW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQHNpbmNlIDEuMy4wXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XG4gKiAvLyB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH1cbiAqIFxuICogZ3JlZXRlci5kZXN0cm95KCk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XG4gKiAvLyBcImRlc3Ryb3llZFwiXG4gKi9cbkVtaXR0ZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc3QganNvbiA9IG5ldyBOdWxsKCksXG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIHRoaXNbICRldmVudHMgXSApLFxuICAgICAgICBsZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgICAgIFxuICAgIGxldCBpbmRleCA9IDAsXG4gICAgICAgIHR5cGU7XG4gICAgXG4gICAganNvbi5tYXhMaXN0ZW5lcnMgPSB0aGlzLm1heExpc3RlbmVycztcbiAgICBqc29uLmxpc3RlbmVyQ291bnQgPSBuZXcgTnVsbCgpO1xuICAgIFxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIGluZGV4IF07XG4gICAgICAgIGpzb24ubGlzdGVuZXJDb3VudFsgdHlwZSBdID0gdGhpcy5saXN0ZW5lckNvdW50KCB0eXBlICk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBzaW5jZSAxLjMuMFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciBcImRlc3Ryb3llZFwiJ1xuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGAkeyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgfSAkeyBKU09OLnN0cmluZ2lmeSggdGhpcy50b0pTT04oKSApIH1gLnRyaW0oKTtcbn07Il0sImZpbGUiOiJlbWl0dGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=