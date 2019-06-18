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
    const _events = Object.hasOwnProperty.call( emitter, $events ) ? emitter[ $events ] : undefined;
    
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbWl0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IEFycmF5XHJcbiAqIEBleHRlcm5hbCBBcnJheVxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cclxuICovIFxyXG5cclxuLyoqXHJcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJtNDU0bXVuMyFpbWl0aXZlfHByaW1pdGl2ZX0gYm9vbGVhblxyXG4gKiBAZXh0ZXJuYWwgYm9vbGVhblxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxyXG4gKi8gXHJcblxyXG4vKipcclxuICogSmF2YVNjcmlwdCBFcnJvclxyXG4gKiBAZXh0ZXJuYWwgRXJyb3JcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XHJcbiAqLyBcclxuXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IEZ1bmN0aW9uXHJcbiAqIEBleHRlcm5hbCBGdW5jdGlvblxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cclxuICovIFxyXG4gXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IG51bWJlclxyXG4gKiBAZXh0ZXJuYWwgbnVtYmVyXHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cclxuICovIFxyXG4gXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IG51bGxcclxuICogQGV4dGVybmFsIG51bGxcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvbnVsbH1cclxuICovXHJcbiBcclxuLyoqXHJcbiAqIEphdmFTY3JpcHQgT2JqZWN0XHJcbiAqIEBleHRlcm5hbCBPYmplY3RcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0fVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IFByb21pc2VcclxuICogQGV4dGVybmFsIFByb21pc2VcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJvbWlzZX1cclxuICovXHJcblxyXG4vKipcclxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzdHJpbmdcclxuICogQGV4dGVybmFsIHN0cmluZ1xyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XHJcbiAqL1xyXG4gXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN5bWJvbFxyXG4gKiBAZXh0ZXJuYWwgc3ltYm9sXHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N5bWJvbH1cclxuICovXHJcblxyXG4vKipcclxuICogQSBzZXQgb2YgbWV0aG9kIHJlZmVyZW5jZXMgdG8gdGhlIEVtaXR0ZXIuanMgQVBJLlxyXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOk9iamVjdH0gQVBJUmVmZXJlbmNlXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkEgc2VsZWN0aW9uIHJlZmVyZW5jZTwvY2FwdGlvbj5cclxuICogJ2VtaXQgb2ZmIG9uIG9uY2UnXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkEgbWFwcGluZyByZWZlcmVuY2U8L2NhcHRpb24+XHJcbiAqIC8vICdlbWl0KCknIHdpbGwgYmUgbWFwcGVkIHRvICdmaXJlKCknXHJcbiAqIC8vICdvbigpJyB3aWxsIGJlIG1hcHBlZCB0byAnYWRkTGlzdGVuZXIoKSdcclxuICogLy8gJ29mZigpJyB3aWxsIGJlIG1hcHBlZCB0byAncmVtb3ZlTGlzdGVuZXIoKSdcclxuICoge1xyXG4gKiAgZmlyZTogJ2VtaXQnLFxyXG4gKiAgYWRkTGlzdGVuZXI6ICdvbicsXHJcbiAqICByZW1vdmVMaXN0ZW5lcjogJ29mZidcclxuICogfVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnwgZnVuY3Rpb259IGJvdW5kIHRvIGFuIGVtaXR0ZXIge0BsaW5rIEV2ZW50VHlwZXxldmVudCB0eXBlfS4gQW55IGRhdGEgdHJhbnNtaXR0ZWQgd2l0aCB0aGUgZXZlbnQgd2lsbCBiZSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXIgYXMgYXJndW1lbnRzLlxyXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEV2ZW50TGlzdGVuZXJcclxuICogQHBhcmFtIHsuLi4qfSBkYXRhIFRoZSBhcmd1bWVudHMgcGFzc2VkIGJ5IHRoZSBgZW1pdGAuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEFuIHtAbGluayBleHRlcm5hbDpPYmplY3R8b2JqZWN0fSB0aGF0IG1hcHMge0BsaW5rIEV2ZW50VHlwZXxldmVudCB0eXBlc30gdG8ge0BsaW5rIEV2ZW50TGlzdGVuZXJ8ZXZlbnQgbGlzdGVuZXJzfS5cclxuICogQHR5cGVkZWYge2V4dGVybmFsOk9iamVjdH0gRXZlbnRNYXBwaW5nXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEEge0BsaW5rIGV4dGVybmFsOnN0cmluZ30gb3Ige0BsaW5rIGV4dGVybmFsOnN5bWJvbH0gdGhhdCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIGV2ZW50IGZpcmVkIGJ5IHRoZSBFbWl0dGVyLlxyXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOnN5bWJvbH0gRXZlbnRUeXBlXHJcbiAqLyBcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYW4gZW1pdHRlciBkZXN0cm95cyBpdHNlbGYuXHJcbiAqIEBldmVudCBFbWl0dGVyIzpkZXN0cm95XHJcbiAqLyBcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2FmdGVyXyBhIGxpc3RlbmVyIGlzIHJlbW92ZWQuXHJcbiAqIEBldmVudCBFbWl0dGVyIzpvZmZcclxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxyXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhIGxpc3RlbmVyIGlzIGFkZGVkLlxyXG4gKiBAZXZlbnQgRW1pdHRlciM6b25cclxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxyXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgaGFzIGJlZW4gZXhjZWVkZWQgZm9yIGFuIGV2ZW50IHR5cGUuXHJcbiAqIEBldmVudCBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcclxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxyXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXHJcbiAqIEBjbGFzcyBFbWl0dGVyfk51bGxcclxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxyXG4gKi9cclxuZnVuY3Rpb24gTnVsbCgpe31cclxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XHJcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbDtcclxuXHJcbmNvbnN0XHJcbiAgICAkZXZlbnRzICAgICAgID0gJ0BAZW1pdHRlci9ldmVudHMnLFxyXG4gICAgJGV2ZXJ5ICAgICAgICA9ICdAQGVtaXR0ZXIvZXZlcnknLFxyXG4gICAgJG1heExpc3RlbmVycyA9ICdAQGVtaXR0ZXIvbWF4TGlzdGVuZXJzJyxcclxuICAgIFxyXG4gICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxyXG4gICAgXHJcbiAgICBub29wID0gZnVuY3Rpb24oKXt9LFxyXG4gICAgXHJcbiAgICBBUEkgPSBuZXcgTnVsbCgpO1xyXG5cclxuLy8gTWFueSBvZiB0aGVzZSBmdW5jdGlvbnMgYXJlIGJyb2tlbiBvdXQgZnJvbSB0aGUgcHJvdG90eXBlIGZvciB0aGUgc2FrZSBvZiBvcHRpbWl6YXRpb24uIFRoZSBmdW5jdGlvbnMgb24gdGhlIHByb3RveXR5cGVcclxuLy8gdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBhcyBhIHJlc3VsdC4gVGhlc2UgZnVuY3Rpb25zIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgYXJndW1lbnRzXHJcbi8vIGFuZCB0aGVyZWZvcmUgZG8gbm90IGdldCBkZW9wdGltaXplZC5cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXJcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAqL1xyXG5mdW5jdGlvbiBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGNvbmRpdGlvbmFsTGlzdGVuZXIoKXtcclxuICAgICAgICBjb25zdCBkb25lID0gbGlzdGVuZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3VtZW50cyApO1xyXG4gICAgICAgIGlmKCBkb25lID09PSB0cnVlICl7XHJcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRPRE8gQ2hlY2sgYmV5b25kIGp1c3Qgb25lIGxldmVsIG9mIGxpc3RlbmVyIHJlZmVyZW5jZXNcclxuICAgIGNvbmRpdGlvbmFsTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lci5saXN0ZW5lciB8fCBsaXN0ZW5lcjtcclxuICAgIFxyXG4gICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciwgTmFOICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudExpc3RlbmVyXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcclxuICovXHJcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApe1xyXG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3RcclxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XHJcbiAgICBcclxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XHJcbiAgICBcclxuICAgIGlmKCBfZXZlbnRzWyAnOm9uJyBdICl7XHJcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9uJywgWyB0eXBlLCB0eXBlb2YgbGlzdGVuZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyIF0sIGZhbHNlICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRW1pdHRpbmcgXCJvblwiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxyXG4gICAgICAgIF9ldmVudHNbICc6b24nIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b24nIF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxyXG4gICAgaWYoICFfZXZlbnRzWyB0eXBlIF0gKXtcclxuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBsaXN0ZW5lcjtcclxuICAgIFxyXG4gICAgLy8gTXVsdGlwbGUgbGlzdGVuZXJzXHJcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIF9ldmVudHNbIHR5cGUgXSApICl7XHJcbiAgICAgICAgc3dpdGNoKCBpc05hTiggaW5kZXggKSB8fCBpbmRleCApe1xyXG4gICAgICAgICAgICBjYXNlIHRydWU6XHJcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0udW5zaGlmdCggbGlzdGVuZXIgKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnNwbGljZSggaW5kZXgsIDAsIGxpc3RlbmVyICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICBcclxuICAgIC8vIFRyYW5zaXRpb24gZnJvbSBzaW5nbGUgdG8gbXVsdGlwbGUgbGlzdGVuZXJzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGluZGV4ID09PSAwID9cclxuICAgICAgICAgICAgWyBsaXN0ZW5lciwgX2V2ZW50c1sgdHlwZSBdIF0gOlxyXG4gICAgICAgICAgICBbIF9ldmVudHNbIHR5cGUgXSwgbGlzdGVuZXIgXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gVHJhY2sgd2FybmluZ3MgaWYgbWF4IGxpc3RlbmVycyBpcyBhdmFpbGFibGVcclxuICAgIGlmKCAnbWF4TGlzdGVuZXJzJyBpbiBlbWl0dGVyICYmICFfZXZlbnRzWyB0eXBlIF0ud2FybmVkICl7XHJcbiAgICAgICAgY29uc3QgbWF4ID0gZW1pdHRlci5tYXhMaXN0ZW5lcnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIG1heCAmJiBtYXggPiAwICYmIF9ldmVudHNbIHR5cGUgXS5sZW5ndGggPiBtYXggKXtcclxuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm1heExpc3RlbmVycycsIFsgdHlwZSwgbGlzdGVuZXIgXSwgZmFsc2UgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEVtaXR0aW5nIFwibWF4TGlzdGVuZXJzXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXHJcbiAgICAgICAgICAgIF9ldmVudHNbICc6bWF4TGlzdGVuZXJzJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm1heExpc3RlbmVycycgXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS53YXJuZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZW1pdHRlclsgJGV2ZW50cyBdID0gX2V2ZW50cztcclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEZpbml0ZUV2ZW50TGlzdGVuZXJcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXHJcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gKi9cclxuZnVuY3Rpb24gYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgdGltZXMsIGxpc3RlbmVyICl7XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIGZpbml0ZUxpc3RlbmVyKCl7XHJcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xyXG4gICAgICAgIHJldHVybiAtLXRpbWVzID09PSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5pdGVMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyO1xyXG4gICAgXHJcbiAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGZpbml0ZUxpc3RlbmVyICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudE1hcHBpbmdcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gbWFwcGluZyBUaGUgZXZlbnQgbWFwcGluZy5cclxuICovXHJcbmZ1bmN0aW9uIGFkZEV2ZW50TWFwcGluZyggZW1pdHRlciwgbWFwcGluZyApe1xyXG4gICAgY29uc3RcclxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCBtYXBwaW5nICksXHJcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcclxuICAgIFxyXG4gICAgbGV0IHR5cGVJbmRleCA9IDAsXHJcbiAgICAgICAgaGFuZGxlciwgaGFuZGxlckluZGV4LCBoYW5kbGVyTGVuZ3RoLCB0eXBlO1xyXG4gICAgXHJcbiAgICBmb3IoIDsgdHlwZUluZGV4IDwgdHlwZUxlbmd0aDsgdHlwZUluZGV4ICs9IDEgKXtcclxuICAgICAgICB0eXBlID0gdHlwZXNbIHR5cGVJbmRleCBdO1xyXG4gICAgICAgIGhhbmRsZXIgPSBtYXBwaW5nWyB0eXBlIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gTGlzdCBvZiBsaXN0ZW5lcnNcclxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XHJcbiAgICAgICAgICAgIGhhbmRsZXJJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGhhbmRsZXJMZW5ndGggPSBoYW5kbGVyLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IoIDsgaGFuZGxlckluZGV4IDwgaGFuZGxlckxlbmd0aDsgaGFuZGxlckluZGV4ICs9IDEgKXtcclxuICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXJbIGhhbmRsZXJJbmRleCBdLCBOYU4gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXIsIE5hTiApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmRlZmluZUV2ZW50c1Byb3BlcnR5XHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgcHJvcGVydHkgd2lsbCBiZSBjcmVhdGVkLlxyXG4gKi8gXHJcbmZ1bmN0aW9uIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCB2YWx1ZSApe1xyXG4gICAgY29uc3QgaGFzRXZlbnRzID0gaGFzT3duUHJvcGVydHkuY2FsbCggZW1pdHRlciwgJGV2ZW50cyApLFxyXG4gICAgICAgIGVtaXR0ZXJQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIGVtaXR0ZXIgKTtcclxuICAgICAgICBcclxuICAgIGlmKCAhaGFzRXZlbnRzIHx8ICggZW1pdHRlclByb3RvdHlwZSAmJiBlbWl0dGVyWyAkZXZlbnRzIF0gPT09IGVtaXR0ZXJQcm90b3R5cGVbICRldmVudHMgXSApICl7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkZXZlbnRzLCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcclxuICAgICAgICB9ICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0QWxsRXZlbnRzXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxyXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cclxuICovXHJcbmZ1bmN0aW9uIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcclxuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxyXG4gICAgICAgIC8vIElmIHR5cGUgaXMgbm90IGEgc3RyaW5nLCBpbmRleCB3aWxsIGJlIGZhbHNlXHJcbiAgICAgICAgaW5kZXggPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XHJcbiAgICBcclxuICAgIC8vIE5hbWVzcGFjZWQgZXZlbnQsIGUuZy4gRW1pdCBcImZvbzpiYXI6cXV4XCIsIHRoZW4gXCJmb286YmFyXCJcclxuICAgIHdoaWxlKCBpbmRleCA+IDAgKXtcclxuICAgICAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGZhbHNlICkgKSB8fCBleGVjdXRlZDtcclxuICAgICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoIDAsIGluZGV4ICk7XHJcbiAgICAgICAgaW5kZXggPSB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gRW1pdCBzaW5nbGUgZXZlbnQgb3IgdGhlIG5hbWVzcGFjZWQgZXZlbnQgcm9vdCwgZS5nLiBcImZvb1wiLCBcIjpiYXJcIiwgU3ltYm9sKCBcIkBAcXV4XCIgKVxyXG4gICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCB0eXBlICE9PSAkZXZlcnkgKSApIHx8IGV4ZWN1dGVkO1xyXG4gICAgXHJcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXJyb3JzXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgYGVycm9yc2Agd2lsbCBiZSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0FycmF5PGV4dGVybmFsOkVycm9yPn0gZXJyb3JzIFRoZSBhcnJheSBvZiBlcnJvcnMgdG8gYmUgZW1pdHRlZC5cclxuICovXHJcbmZ1bmN0aW9uIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApe1xyXG4gICAgY29uc3QgbGVuZ3RoID0gZXJyb3JzLmxlbmd0aDtcclxuICAgIGZvciggbGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcclxuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICdlcnJvcicsIFsgZXJyb3JzWyBpbmRleCBdIF0sIGZhbHNlICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXZlbnRcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gZW1pdEV2ZXJ5IFdoZXRoZXIgb3Igbm90IGxpc3RlbmVycyBmb3IgYWxsIHR5cGVzIHdpbGwgYmUgZXhlY3V0ZWQuXHJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXHJcbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxyXG4gKi9cclxuZnVuY3Rpb24gZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBlbWl0RXZlcnkgKXtcclxuICAgIGNvbnN0IF9ldmVudHMgPSBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbCggZW1pdHRlciwgJGV2ZW50cyApID8gZW1pdHRlclsgJGV2ZW50cyBdIDogdW5kZWZpbmVkO1xyXG4gICAgXHJcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcclxuICAgICAgICBsaXN0ZW5lcjtcclxuICAgIFxyXG4gICAgaWYoIHR5cGVvZiBfZXZlbnRzICE9PSAndW5kZWZpbmVkJyApe1xyXG4gICAgICAgIGlmKCB0eXBlID09PSAnZXJyb3InICYmICFfZXZlbnRzLmVycm9yICl7XHJcbiAgICAgICAgICAgIGlmKCBkYXRhWyAwIF0gaW5zdGFuY2VvZiBFcnJvciApe1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZGF0YVsgMCBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiB0eXBlIG9mIGV2ZW50XHJcbiAgICAgICAgbGlzdGVuZXIgPSBfZXZlbnRzWyB0eXBlIF07XHJcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xyXG4gICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGxpc3RlbmluZyBmb3IgYWxsIHR5cGVzIG9mIGV2ZW50c1xyXG4gICAgICAgIGlmKCBlbWl0RXZlcnkgKXtcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSBfZXZlbnRzWyAkZXZlcnkgXTtcclxuICAgICAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcclxuICAgICAgICAgICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xyXG59XHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSBsaXN0ZW5lciB1c2luZyB0aGUgaW50ZXJuYWwgYGV4ZWN1dGUqYCBmdW5jdGlvbnMgYmFzZWQgb24gdGhlIG51bWJlciBvZiBhcmd1bWVudHMuXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVMaXN0ZW5lclxyXG4gKiBAcGFyYW0ge0FycmF5PExpc3RlbmVyPnxMaXN0ZW5lcn0gbGlzdGVuZXJcclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxyXG4gKiBAcGFyYW0geyp9IHNjb3BlXHJcbiAqLyBcclxuZnVuY3Rpb24gZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgc2NvcGUgKXtcclxuICAgIGNvbnN0IGlzRnVuY3Rpb24gPSB0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbic7XHJcbiAgICBcclxuICAgIHN3aXRjaCggZGF0YS5sZW5ndGggKXtcclxuICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgIGxpc3RlbkVtcHR5ICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgbGlzdGVuT25lICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGxpc3RlblR3byAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIGxpc3RlblRocmVlICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSwgZGF0YVsgMiBdICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGxpc3Rlbk1hbnkgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0RXZlbnRUeXBlc1xyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggZXZlbnQgdHlwZXMgd2lsbCBiZSByZXRyaWV2ZWQuXHJcbiAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlcyggZW1pdHRlciApe1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCBlbWl0dGVyWyAkZXZlbnRzIF0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldE1heExpc3RlbmVyc1xyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggbWF4IGxpc3RlbmVycyB3aWxsIGJlIHJldHJpZXZlZC5cclxuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cclxuICovXHJcbmZ1bmN0aW9uIGdldE1heExpc3RlbmVycyggZW1pdHRlciApe1xyXG4gICAgcmV0dXJuIHR5cGVvZiBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gIT09ICd1bmRlZmluZWQnID9cclxuICAgICAgICBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gOlxyXG4gICAgICAgIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5pc1Bvc2l0aXZlTnVtYmVyXHJcbiAqIEBwYXJhbSB7Kn0gbnVtYmVyIFRoZSB2YWx1ZSB0byBiZSB0ZXN0ZWQuXHJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1Bvc2l0aXZlTnVtYmVyKCBudW1iZXIgKXtcclxuICAgIHJldHVybiB0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyAmJiBudW1iZXIgPj0gMCAmJiAhaXNOYU4oIG51bWJlciApO1xyXG59XHJcblxyXG4vKipcclxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggbm8gYXJndW1lbnRzLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5FbXB0eVxyXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cclxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBsaXN0ZW5FbXB0eSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciApe1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBcclxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyICk7XHJcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIgKTtcclxuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xyXG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggb25lIGFyZ3VtZW50LlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5PbmVcclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxyXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxyXG4gKi9cclxuZnVuY3Rpb24gbGlzdGVuT25lKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxICl7XHJcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICAgIFxyXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcclxuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xyXG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcclxuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHR3byBhcmd1bWVudHMuXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblR3b1xyXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cclxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXHJcbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXHJcbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxyXG4gKi9cclxuZnVuY3Rpb24gbGlzdGVuVHdvKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyICl7XHJcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICAgIFxyXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcclxuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xyXG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcclxuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHRocmVlIGFyZ3VtZW50cy5cclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVGhyZWVcclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxyXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxyXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cclxuICogQHBhcmFtIHsqfSBhcmczIFRoZSB0aGlyZCBhcmd1bWVudC5cclxuICovXHJcbmZ1bmN0aW9uIGxpc3RlblRocmVlKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICl7XHJcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICAgIFxyXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcclxuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xyXG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcclxuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIGZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk1hbnlcclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBhcmdzIEZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXHJcbiAqL1xyXG5mdW5jdGlvbiBsaXN0ZW5NYW55KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmdzICl7XHJcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICAgIFxyXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XHJcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcclxuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xyXG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+cmVtb3ZlRXZlbnRMaXN0ZW5lclxyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXHJcbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cclxuICovXHJcbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XHJcbiAgICBjb25zdCBoYW5kbGVyID0gZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XHJcbiAgICBcclxuICAgIGlmKCBoYW5kbGVyID09PSBsaXN0ZW5lciB8fCAoIHR5cGVvZiBoYW5kbGVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcclxuICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XHJcbiAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcclxuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xyXG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciggbGV0IGkgPSBoYW5kbGVyLmxlbmd0aDsgaS0tID4gMDsgKXtcclxuICAgICAgICAgICAgaWYoIGhhbmRsZXJbIGkgXSA9PT0gbGlzdGVuZXIgfHwgKCBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgJiYgaGFuZGxlclsgaSBdLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgIGlmKCBpbmRleCA+IC0xICl7XHJcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyLmxlbmd0aCA9PT0gMSApe1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlci5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3BsaWNlTGlzdCggaGFuZGxlciwgaW5kZXggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcclxuICAgICAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIGZhbHNlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zZXRNYXhMaXN0ZW5lcnNcclxuICogQHBhcmFtIHtFbWl0dGVyfSBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIHdpbGwgYmUgc2V0LlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gbWF4IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVmb3JlIGEgd2FybmluZyBpcyBpc3N1ZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIsIG1heCApe1xyXG4gICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCBtYXggKSApe1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdtYXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkbWF4TGlzdGVuZXJzLCB7XHJcbiAgICAgICAgdmFsdWU6IG1heCxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgd3JpdGFibGU6IHRydWVcclxuICAgIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZhc3RlciB0aGFuIGBBcnJheS5wcm90b3R5cGUuc3BsaWNlYFxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zcGxpY2VMaXN0XHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGxpc3RcclxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XHJcbiAqLyBcclxuZnVuY3Rpb24gc3BsaWNlTGlzdCggbGlzdCwgaW5kZXggKXtcclxuICAgIGZvciggbGV0IGkgPSBpbmRleCwgaiA9IGkgKyAxLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaiA8IGxlbmd0aDsgaSArPSAxLCBqICs9IDEgKXtcclxuICAgICAgICBsaXN0WyBpIF0gPSBsaXN0WyBqIF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxpc3QucG9wKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBc3luY2hyb25vdXNseSBleGVjdXRlcyBhIGZ1bmN0aW9uLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC5cclxuICovXHJcbmZ1bmN0aW9uIHRpY2soIGNhbGxiYWNrICl7XHJcbiAgICByZXR1cm4gc2V0VGltZW91dCggY2FsbGJhY2ssIDAgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tBbGxFdmVudHNcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBhc3luY2hyb25vdXNseSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXHJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cclxuICovXHJcbmZ1bmN0aW9uIHRpY2tBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApe1xyXG4gICAgICAgIHRpY2soIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKSA/IHJlc29sdmUoKSA6IHJlamVjdCgpO1xyXG4gICAgICAgIH0gKTtcclxuICAgIH0gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFwcGxpZXMgYSBgc2VsZWN0aW9uYCBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIGB0YXJnZXRgLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50b0VtaXR0ZXJcclxuICogQHBhcmFtIHtBUElSZWZlcmVuY2V9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSS5cclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IHRhcmdldCBUaGUgb2JqZWN0IG9uIHdoaWNoIHRoZSBBUEkgd2lsbCBiZSBhcHBsaWVkLlxyXG4gKi9cclxuZnVuY3Rpb24gdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApe1xyXG4gICAgXHJcbiAgICAvLyBBcHBseSB0aGUgZW50aXJlIEVtaXR0ZXIgQVBJXHJcbiAgICBpZiggc2VsZWN0aW9uID09PSBBUEkgKXtcclxuICAgICAgICBhc0VtaXR0ZXIuY2FsbCggdGFyZ2V0ICk7XHJcbiAgICBcclxuICAgIC8vIEFwcGx5IG9ubHkgdGhlIHNlbGVjdGVkIEFQSSBtZXRob2RzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBpbmRleCwga2V5LCBtYXBwaW5nLCBuYW1lcywgdmFsdWU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHR5cGVvZiBzZWxlY3Rpb24gPT09ICdzdHJpbmcnICl7XHJcbiAgICAgICAgICAgIG5hbWVzID0gc2VsZWN0aW9uLnNwbGl0KCAnICcgKTtcclxuICAgICAgICAgICAgbWFwcGluZyA9IEFQSTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuYW1lcyA9IE9iamVjdC5rZXlzKCBzZWxlY3Rpb24gKTtcclxuICAgICAgICAgICAgbWFwcGluZyA9IHNlbGVjdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaW5kZXggPSBuYW1lcy5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcclxuICAgICAgICAgICAga2V5ID0gbmFtZXNbIGluZGV4IF07XHJcbiAgICAgICAgICAgIHZhbHVlID0gbWFwcGluZ1sga2V5IF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0YXJnZXRbIGtleSBdID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID9cclxuICAgICAgICAgICAgICAgIHZhbHVlIDpcclxuICAgICAgICAgICAgICAgIEFQSVsgdmFsdWUgXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGZ1bmN0aW9uYWwgbWl4aW4gdGhhdCBwcm92aWRlcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gaXRzIHRhcmdldC4gVGhlIGBjb25zdHJ1Y3RvcigpYCwgYGRlc3Ryb3koKWAsIGB0b0pTT04oKWAsIGB0b1N0cmluZygpYCwgYW5kIHN0YXRpYyBwcm9wZXJ0aWVzIG9uIGBFbWl0dGVyYCBhcmUgbm90IHByb3ZpZGVkLiBUaGlzIG1peGluIGlzIHVzZWQgdG8gcG9wdWxhdGUgdGhlIGBwcm90b3R5cGVgIG9mIGBFbWl0dGVyYC5cclxuICogXHJcbiAqIExpa2UgYWxsIGZ1bmN0aW9uYWwgbWl4aW5zLCB0aGlzIHNob3VsZCBiZSBleGVjdXRlZCB3aXRoIFtjYWxsKCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2NhbGwpIG9yIFthcHBseSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9hcHBseSkuXHJcbiAqIEBtaXhpbiBFbWl0dGVyfmFzRW1pdHRlclxyXG4gKiBAc2luY2UgMS4xLjBcclxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgRW1pdHRlciBmdW5jdGlvbmFsaXR5PC9jYXB0aW9uPlxyXG4gKiAvLyBDcmVhdGUgYSBiYXNlIG9iamVjdFxyXG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xyXG4gKiBcclxuICogLy8gQXBwbHkgdGhlIG1peGluXHJcbiAqIGFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XHJcbiAqIFxyXG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xyXG4gKiAvLyBIZWxsbywgV29ybGQhXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGNoYW9zIHRvIHlvdXIgd29ybGQ8L2NhcHRpb24+XHJcbiAqIC8vIE5PISEhXHJcbiAqIGFzRW1pdHRlcigpOyAvLyBNYWRuZXNzIGVuc3Vlc1xyXG4gKi9cclxuZnVuY3Rpb24gYXNFbWl0dGVyKCl7XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCBhdCB0aGUgc3BlY2lmaWVkIGBpbmRleGAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cclxuICAgICAqIFxyXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5hdFxyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleCBXaGVyZSB0aGUgbGlzdGVuZXIgd2lsbCBiZSBhZGRlZCBpbiB0aGUgdHJpZ2dlciBsaXN0LlxyXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMi4wLjBcclxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxyXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xyXG4gICAgICovXHJcbiAgICB0aGlzLmF0ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGluZGV4LCBsaXN0ZW5lciApe1xyXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGluZGV4ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSBpbmRleDtcclxuICAgICAgICAgICAgaW5kZXggPSB0eXBlO1xyXG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIGluZGV4ICkgKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2luZGV4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuY2xlYXJcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIC8vIEhlbGxvIVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XHJcbiAgICAgKiAvLyBIaSFcclxuICAgICAqIGdyZWV0ZXIuY2xlYXIoKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCB7XHJcbiAgICAgKiAgJ2hlbGxvJyA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApOyB9LFxyXG4gICAgICogICdoaScgICAgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hpIScgKTsgfVxyXG4gICAgICogfSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAgICAgKiAvLyBIZWxsbyFcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xyXG4gICAgICogLy8gSGkhXHJcbiAgICAgKiBncmVldGVyLmNsZWFyKCAnaGVsbG8nICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xyXG4gICAgICogLy8gSGkhXHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiggdHlwZSApe1xyXG4gICAgICAgIGxldCBoYW5kbGVyO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vIEV2ZW50c1xyXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdICl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBXaXRoIG5vIFwib2ZmXCIgbGlzdGVuZXJzLCBjbGVhcmluZyBjYW4gYmUgc2ltcGxpZmllZFxyXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xyXG4gICAgICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xyXG4gICAgICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2xlYXIgYWxsIGxpc3RlbmVyc1xyXG4gICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XHJcbiAgICAgICAgICAgIGNvbnN0IHR5cGVzID0gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQXZvaWQgcmVtb3ZpbmcgXCJvZmZcIiBsaXN0ZW5lcnMgdW50aWwgYWxsIG90aGVyIHR5cGVzIGhhdmUgYmVlbiByZW1vdmVkXHJcbiAgICAgICAgICAgIGZvciggbGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHR5cGVzWyBpbmRleCBdID09PSAnOm9mZicgKXtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhciggdHlwZXNbIGluZGV4IF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gTWFudWFsbHkgY2xlYXIgXCJvZmZcIlxyXG4gICAgICAgICAgICB0aGlzLmNsZWFyKCAnOm9mZicgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyICk7XHJcbiAgICAgICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gaGFuZGxlci5sZW5ndGg7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlclsgaW5kZXggXSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuXHJcbiAgICAgKiBcclxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxyXG4gICAgICogXHJcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZW1pdFxyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxyXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudDwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApOyAgICAvLyB0cnVlXHJcbiAgICAgKiAvLyBIZWxsbyFcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7ICAvLyBmYWxzZVxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQgd2l0aCBkYXRhPC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcclxuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGEgbmFtZXNwYWNlZCBldmVudDwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xyXG4gICAgICogXHJcbiAgICAgKiAvLyBUaGlzIGV2ZW50IHdpbGwgbm90IGJlIHRyaWdnZXJlZCBieSBlbWl0dGluZyBcImdyZWV0aW5nOmhlbGxvXCJcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8gYWdhaW4sICR7IG5hbWUgfWAgKTtcclxuICAgICAqIFxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcclxuICAgICAqIC8vIEhpLCBNYXJrIVxyXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cclxuICAgICAqIFxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcclxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cclxuICAgICAqL1xyXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuICAgICAgICBsZXQgZGF0YSA9IFtdLFxyXG4gICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBsZW5ndGggPiAxICl7XHJcbiAgICAgICAgICAgIGRhdGEgPSBBcnJheSggbGVuZ3RoIC0gMSApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yKCBsZXQga2V5ID0gMTsga2V5IDwgbGVuZ3RoOyBrZXkrKyApe1xyXG4gICAgICAgICAgICAgICAgZGF0YVsga2V5IC0gMSBdID0gYXJndW1lbnRzWyBrZXkgXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZW1pdEFsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZXZlbnRUeXBlc1xyXG4gICAgICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMi4wLjBcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCBgSGVsbG9gICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCBgSGlgICkgKTtcclxuICAgICAqIFxyXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZXZlbnRUeXBlcygpICk7XHJcbiAgICAgKiAvLyBbICdoZWxsbycsICdoaScgXVxyXG4gICAgICovIFxyXG4gICAgdGhpcy5ldmVudFR5cGVzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZmlyc3RcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMi4wLjBcclxuICAgICAqL1xyXG4gICAgdGhpcy5maXJzdCA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xyXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcclxuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgMCApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZXQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmdldE1heExpc3RlbmVyc1xyXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cclxuICAgICAqIEBzaW5jZSAyLjAuMFxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogXHJcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xyXG4gICAgICogLy8gMTBcclxuICAgICAqIFxyXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDUgKTtcclxuICAgICAqIFxyXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZ2V0TWF4TGlzdGVuZXJzKCkgKTtcclxuICAgICAqIC8vIDVcclxuICAgICAqL1xyXG4gICAgdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyQ291bnRcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnaGVsbG8nICkgKTtcclxuICAgICAqIC8vIDFcclxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdnb29kYnllJyApICk7XHJcbiAgICAgKiAvLyAwXHJcbiAgICAgKi8gXHJcbiAgICB0aGlzLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbiggdHlwZSApe1xyXG4gICAgICAgIGxldCBjb3VudDtcclxuXHJcbiAgICAgICAgLy8gRW1wdHlcclxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcclxuICAgICAgICAgICAgY291bnQgPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEZ1bmN0aW9uXHJcbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gPT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgY291bnQgPSAxO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEFycmF5XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY291bnQgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBjb3VudDtcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyc1xyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGhlbGxvID0gZnVuY3Rpb24oKXtcclxuICAgICAqICBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTtcclxuICAgICAqIH0sXHJcbiAgICAgKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIC8vIEhlbGxvIVxyXG4gICAgICogXHJcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lcnMoICdoZWxsbycgKVsgMCBdID09PSBoZWxsbyApO1xyXG4gICAgICogLy8gdHJ1ZVxyXG4gICAgICovIFxyXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiggdHlwZSApe1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbIGhhbmRsZXIgXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSAqbWFueSB0aW1lKiBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC4gQWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIGludm9rZWQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgYHRpbWVzYCwgaXQgaXMgcmVtb3ZlZC5cclxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubWFueVxyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cclxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYW55IGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm1hbnkoIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICkgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcclxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnVGVycnknICk7ICAgICAgLy8gMlxyXG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnU3RldmUnICk7ICAgICAgLy8gM1xyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxyXG4gICAgICogLy8gSGVsbG8sIEplZmYhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAvLyAyXHJcbiAgICAgKiAvLyBIZWxsbywgVGVycnkhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAvLyAzXHJcbiAgICAgKi8gXHJcbiAgICB0aGlzLm1hbnkgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgdGltZXMsIGxpc3RlbmVyICl7XHJcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xyXG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRpbWVzO1xyXG4gICAgICAgICAgICB0aW1lcyA9IHR5cGU7XHJcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggdGltZXMgKSApe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndGltZXMgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgYGxpc3RlbmVyYCBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiBpdCBpcyBhc3N1bWVkIHRoZSBgbGlzdGVuZXJgIGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyBgdHlwZWAuXHJcbiAgICAgKiBcclxuICAgICAqIElmIGFueSBzaW5nbGUgbGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgbXVsdGlwbGUgdGltZXMgZm9yIHRoZSBzcGVjaWZpZWQgYHR5cGVgLCB0aGVuIGBlbWl0dGVyLm9mZigpYCBtdXN0IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byByZW1vdmUgZWFjaCBpbnN0YW5jZS5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vZmZcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvZmZcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYW55IGV2ZW50IHR5cGU8L2NhcHRpb24+XHJcbiAgICAgKiBmdW5jdGlvbiBncmVldCggbmFtZSApe1xyXG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRpbmdzLCAkeyBuYW1lIH0hYCApO1xyXG4gICAgICogfVxyXG4gICAgICogXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oIGdyZWV0ICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgJ0plZmYnICk7XHJcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgJ0plZmYnICk7XHJcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXHJcbiAgICAgKiBncmVldGVyLm9mZiggZ3JlZXQgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ0plZmYnICk7XHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XHJcbiAgICAgKiBmdW5jdGlvbiBoZWxsbyggbmFtZSApe1xyXG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XHJcbiAgICAgKiB9XHJcbiAgICAgKiBcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XHJcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcclxuICAgICAqIGdyZWV0ZXIub2ZmKCAnaGVsbG8nLCBoZWxsbyApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcclxuICAgICAqLyBcclxuICAgIHRoaXMub2ZmID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XHJcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xyXG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxyXG4gICAgICogXHJcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxyXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIC8vIEdyZWV0ZWRcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XHJcbiAgICAgKiAvLyBHcmVldGVkXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW5lciB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcclxuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1dvcmxkJyApO1xyXG4gICAgICovXHJcbiAgICB0aGlzLm9uID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBsZXQgdHlwZSA9IGFyZ3VtZW50c1sgMCBdIHx8ICRldmVyeSxcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSBhcmd1bWVudHNbIDEgXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVHlwZSBub3QgcHJvdmlkZWQsIGZhbGwgYmFjayB0byBcIiRldmVyeVwiXHJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xyXG4gICAgICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFBsYWluIG9iamVjdCBvZiBldmVudCBiaW5kaW5nc1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApe1xyXG4gICAgICAgICAgICAgICAgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCB0eXBlICk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBOYU4gKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uY2VcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXHJcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub25jZSggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIC8vIEdyZWV0ZWRcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gb25jZSB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XHJcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcclxuICAgICAqL1xyXG4gICAgdGhpcy5vbmNlID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XHJcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xyXG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIDEsIGxpc3RlbmVyICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnNldE1heExpc3RlbmVyc1xyXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDIuMC4wXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIuc2V0TWF4TGlzdGVuZXJzKCAxICk7XHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xyXG4gICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXHJcbiAgICAgKi9cclxuICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oIG1heCApe1xyXG4gICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEFzeW5jaHJvbm91c2x5IGVtaXRzIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLiBUaGUgbGlzdGVuZXJzIHdpbGwgc3RpbGwgYmUgc3luY2hyb25vdXNseSBleGVjdXRlZCBpbiB0aGUgc3BlY2lmaWVkIG9yZGVyLlxyXG4gICAgICogXHJcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cclxuICAgICAqIFxyXG4gICAgICogUmV0dXJucyB7QGxpbmsgZXh0ZXJuYWw6UHJvbWlzZXxwcm9taXNlfSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRpY2tcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cclxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cclxuICAgICAqIEBzaW5jZSAyLjAuMFxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+QXN5bmNocm9ub3VzbHkgZW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgKiBncmVldGVyLnRpY2soICdoZWxsbycgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdoZWxsbyBoZWFyZD8gJywgaGVhcmQgKSApO1xyXG4gICAgICogZ3JlZXRlci50aWNrKCAnZ29vZGJ5ZScgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdnb29kYnllIGhlYXJkPyAnLCBoZWFyZCApICk7XHJcbiAgICAgKiAvLyBIZWxsbyFcclxuICAgICAqIC8vIGhlbGxvIGhlYXJkPyB0cnVlXHJcbiAgICAgKiAvLyBnb29kYnllIGhlYXJkPyBmYWxzZVxyXG4gICAgICovXHJcbiAgICB0aGlzLnRpY2sgPSBmdW5jdGlvbiggdHlwZSApe1xyXG4gICAgICAgIGxldCBkYXRhID0gW10sXHJcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGxlbmd0aCA+IDEgKXtcclxuICAgICAgICAgICAgZGF0YSA9IEFycmF5KCBsZW5ndGggLSAxICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IoIGxldCBrZXkgPSAxOyBrZXkgPCBsZW5ndGg7IGtleSsrICl7XHJcbiAgICAgICAgICAgICAgICBkYXRhWyBrZXkgLSAxIF0gPSBhcmd1bWVudHNbIGtleSBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aWNrQWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYGRhdGFgLlxyXG4gICAgICogXHJcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudHJpZ2dlclxyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcclxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnaGVsbG8nLCBbICdXb3JsZCcgXSApO1xyXG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xyXG4gICAgICogXHJcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoaScsIFsgJ01hcmsnIF0gKTtcclxuICAgICAqIC8vIEhpLCBNYXJrIVxyXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cclxuICAgICAqIFxyXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGVsbG8nLCBbICdKZWZmJyBdICk7XHJcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcclxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXHJcbiAgICAgKi9cclxuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcclxuICAgICAgICByZXR1cm4gZW1pdEFsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkICp1bnRpbCogdGhlIGBsaXN0ZW5lcmAgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cclxuICAgICAqIFxyXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci51bnRpbFxyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDEuMi4wXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLnVudGlsKCBmdW5jdGlvbiggbmFtZSApe1xyXG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICk7XHJcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdUZXJyeSc7XHJcbiAgICAgKiB9ICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xyXG4gICAgICogLy8gR3JlZXRlZCBKZWZmXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJywgJ1RlcnJ5JyApO1xyXG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnQWFyb24nICk7XHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLnVudGlsKCAnaGVsbG8nLCBmdW5jdGlvbiggbmFtZSApe1xyXG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XHJcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdXb3JsZCc7XHJcbiAgICAgKiB9ICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xyXG4gICAgICogLy8gSGVsbG8sIEplZmYhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcclxuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ01hcmsnICk7XHJcbiAgICAgKi9cclxuICAgIHRoaXMudW50aWwgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcclxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcclxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xyXG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XHJcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxufVxyXG5cclxuYXNFbWl0dGVyLmNhbGwoIEFQSSApO1xyXG5cclxuLyoqXHJcbiAqIEFwcGxpZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSB0YXJnZXQuXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyXHJcbiAqIEBwYXJhbSB7QVBJUmVmZXJlbmNlfSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGB0YXJnZXRgLlxyXG4gKiBAcGFyYW0ge2V4dGVyYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCB0byB3aGljaCB0aGUgRW1pdHRlci5qcyBBUEkgd2lsbCBiZSBhcHBsaWVkLlxyXG4gKiBAc2luY2UgMi4wLjBcclxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYWxsIG9mIHRoZSBBUEk8L2NhcHRpb24+XHJcbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xyXG4gKiBFbWl0dGVyKCBncmVldGVyICk7XHJcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xyXG4gKiAvLyBIZWxsbyFcclxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cclxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XHJcbiAqIEVtaXR0ZXIoICdlbWl0IG9uIG9mZicsIGdyZWV0ZXIgKTtcclxuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcclxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAqIC8vIEhlbGxvIVxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1hcHBpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cclxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XHJcbiAqIEVtaXR0ZXIoIHsgZmlyZTogJ2VtaXQnLCBhZGRMaXN0ZW5lcjogJ29uJyB9LCBncmVldGVyICk7XHJcbiAqIGdyZWV0ZXIuYWRkTGlzdGVuZXIoICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAqIGdyZWV0ZXIuZmlyZSggJ2hlbGxvJyApO1xyXG4gKiAvLyBIZWxsbyFcclxuICovXHJcbiBcclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZW1pdHRlci4gSWYgYG1hcHBpbmdgIGFyZSBwcm92aWRlZCB0aGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSBwYXNzZWQgaW50byBgb24oKWAgb25jZSBjb25zdHJ1Y3Rpb24gaXMgY29tcGxldGUuXHJcbiAqIEBjbGFzcyBFbWl0dGVyXHJcbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBbbWFwcGluZ10gQSBtYXBwaW5nIG9mIGV2ZW50IHR5cGVzIHRvIGV2ZW50IGxpc3RlbmVycy5cclxuICogQGNsYXNzZGVzYyBBbiBvYmplY3QgdGhhdCBlbWl0cyBuYW1lZCBldmVudHMgd2hpY2ggY2F1c2UgZnVuY3Rpb25zIHRvIGJlIGV4ZWN1dGVkLlxyXG4gKiBAZXh0ZW5kcyBFbWl0dGVyfk51bGxcclxuICogQG1peGVzIEVtaXR0ZXJ+YXNFbWl0dGVyXHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9saWIvZXZlbnRzLmpzfVxyXG4gKiBAc2luY2UgMS4wLjBcclxuICogQGV4YW1wbGUgPGNhcHRpb24+VXNpbmcgRW1pdHRlciBkaXJlY3RseTwvY2FwdGlvbj5cclxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xyXG4gKiAvLyBIZWxsbyFcclxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgQ2xhc3NpY2FsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxyXG4gKiBjbGFzcyBHcmVldGVyIGV4dGVuZHMgRW1pdHRlciB7XHJcbiAqICBjb25zdHJ1Y3Rvcigpe1xyXG4gKiAgICAgIHN1cGVyKCk7XHJcbiAqICAgICAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiAgfVxyXG4gKiBcclxuICogIGdyZWV0KCBuYW1lICl7XHJcbiAqICAgICAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XHJcbiAqICB9XHJcbiAqIH1cclxuICogXHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xyXG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcclxuICogLy8gSGVsbG8sIEplZmYhXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIFByb3RvdHlwYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XHJcbiAqIGZ1bmN0aW9uIEdyZWV0ZXIoKXtcclxuICogIEVtaXR0ZXIuY2FsbCggdGhpcyApO1xyXG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiB9XHJcbiAqIEdyZWV0ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRW1pdHRlci5wcm90b3R5cGUgKTtcclxuICogXHJcbiAqIEdyZWV0ZXIucHJvdG90eXBlLmdyZWV0ID0gZnVuY3Rpb24oIG5hbWUgKXtcclxuICogIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xyXG4gKiB9O1xyXG4gKiBcclxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XHJcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xyXG4gKiAvLyBIZWxsbywgSmVmZiFcclxuICogQGV4YW1wbGUgPGNhcHRpb24+TmFtZXNwYWNlZCBldmVudHM8L2NhcHRpb24+XHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcclxuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xyXG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xyXG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xyXG4gKiAvLyBIaSwgTWFyayFcclxuICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cclxuICogLy8gSGVsbG8sIEplZmYhXHJcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlByZWRlZmluZWQgZXZlbnRzPC9jYXB0aW9uPlxyXG4gKiBjb25zdCBncmVldGluZ3MgPSB7XHJcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxyXG4gKiAgICAgIGhpOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhpLCAke25hbWV9IWAgKVxyXG4gKiAgfSxcclxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XHJcbiAqIFxyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdBYXJvbicgKTtcclxuICogLy8gSGVsbG8sIEFhcm9uIVxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5PbmUtdGltZSBldmVudHM8L2NhcHRpb24+XHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcclxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7XHJcbiAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5NYW55LXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxyXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgICAvLyAxXHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgICAvLyAyXHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXHJcbiAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gKiAvLyBIZWxsbywgVGVycnkhXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFbWl0dGVyKCl7XHJcbiAgICBcclxuICAgIC8vIENhbGxlZCBhcyBjb25zdHJ1Y3RvclxyXG4gICAgaWYoIHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbnN0cnVjdG9yID09PSBFbWl0dGVyICl7XHJcbiAgICAgICAgbGV0IG1hcHBpbmcgPSBhcmd1bWVudHNbIDAgXTtcclxuICAgICAgICBcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXJzIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmVudCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRoYXQgdG8gYmUgY2hhbmdlZC4gU2V0IHRvICoqMCoqIGZvciB1bmxpbWl0ZWQuXHJcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyI21heExpc3RlbmVyc1xyXG4gICAgICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICAgICAqIEBleGFtcGxlXHJcbiAgICAgICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgICAgICogXHJcbiAgICAgICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubWF4TGlzdGVuZXJzICk7XHJcbiAgICAgICAgICogLy8gMTBcclxuICAgICAgICAgKiBcclxuICAgICAgICAgKiBncmVldGVyLm1heExpc3RlbmVycyA9IDE7XHJcbiAgICAgICAgICogXHJcbiAgICAgICAgICogZ3JlZXRlci5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xyXG4gICAgICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcclxuICAgICAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcclxuICAgICAgICAgKi9cclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdtYXhMaXN0ZW5lcnMnLCB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiggbWF4ICl7XHJcbiAgICAgICAgICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHR5cGVvZiBtYXBwaW5nICE9PSAndW5kZWZpbmVkJyAmJiBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIG1hcHBpbmcgKTtcclxuICAgIFxyXG4gICAgLy8gQ2FsbGVkIGFzIGZ1bmN0aW9uXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBzZWxlY3Rpb24gPSBhcmd1bWVudHNbIDAgXSxcclxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAxIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IHNlbGVjdGlvbjtcclxuICAgICAgICAgICAgc2VsZWN0aW9uID0gQVBJO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0b0VtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciBhbGwgZW1pdHRlcnMuIFVzZSBgZW1pdHRlci5tYXhMaXN0ZW5lcnNgIHRvIHNldCB0aGUgbWF4aW11bSBvbiBhIHBlci1pbnN0YW5jZSBiYXNpcy5cclxuICAgICAqIFxyXG4gICAgICogQnkgZGVmYXVsdCBFbWl0dGVyIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmVudCBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZSBhZGRlZCB0byBhIHNwZWNpZmljIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycz0xMFxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DaGFuZ2luZyB0aGUgZGVmYXVsdCBtYXhpbXVtIGxpc3RlbmVyczwvY2FwdGlvbj5cclxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgKTtcclxuICAgICAqIC8vIDEwXHJcbiAgICAgKiBcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIxID0gbmV3IEVtaXR0ZXIoKSxcclxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBcclxuICAgICAqIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDE7XHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIxLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XHJcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcclxuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xyXG4gICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XHJcbiAgICAgKiBncmVldGVyMi5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coICdIaSEnICkgKTtcclxuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBhbGVydCggJ0hpIScgKSApO1xyXG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXHJcbiAgICAgKi9cclxuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnM6IHtcclxuICAgICAgICB2YWx1ZTogMTAsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiBBbiBpZCB1c2VkIHRvIGxpc3RlbiBmb3IgZXZlbnRzIG9mIGFueSBgdHlwZWAuIEZvciBfbW9zdF8gbWV0aG9kcywgd2hlbiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhpcyBpcyB0aGUgZGVmYXVsdC5cclxuICAgICAqIFxyXG4gICAgICogTGlzdGVuZXIgYm91bmQgdG8gZXZlcnkgZXZlbnQgd2lsbCAqKm5vdCoqIGV4ZWN1dGUgZm9yIEVtaXR0ZXIgbGlmZWN5Y2xlIGV2ZW50cywgbGlrZSBgOm1heExpc3RlbmVyc2AuXHJcbiAgICAgKiBcclxuICAgICAqIFVzaW5nIGBFbWl0dGVyLmV2ZXJ5YCBpcyB0eXBpY2FsbHkgbm90IG5lY2Vzc2FyeS5cclxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN5bWJvbH0gRW1pdHRlci5ldmVyeVxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCBFbWl0dGVyLmV2ZXJ5LCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xyXG4gICAgICogLy8gR3JlZXRlZFxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcclxuICAgICAqIC8vIEdyZWV0ZWRcclxuICAgICAqL1xyXG4gICAgZXZlcnk6IHtcclxuICAgICAgICB2YWx1ZTogJGV2ZXJ5LFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB3cml0YWJsZTogZmFsc2VcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgKkVtaXR0ZXIuanMqLlxyXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBFbWl0dGVyLnZlcnNpb25cclxuICAgICAqIEBzaW5jZSAxLjEuMlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLnZlcnNpb24gKTtcclxuICAgICAqIC8vIDIuMC4wXHJcbiAgICAgKi9cclxuICAgIHZlcnNpb246IHtcclxuICAgICAgICB2YWx1ZTogJzIuMC4wJyxcclxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxyXG4gICAgfVxyXG59ICk7XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVtaXR0ZXI7XHJcblxyXG5hc0VtaXR0ZXIuY2FsbCggRW1pdHRlci5wcm90b3R5cGUgKTtcclxuXHJcbi8qKlxyXG4gKiBEZXN0cm95cyB0aGUgZW1pdHRlci5cclxuICogQHNpbmNlIDEuMC4wXHJcbiAqIEBmaXJlcyBFbWl0dGVyIzpkZXN0cm95XHJcbiAqL1xyXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcclxuICAgIGVtaXRFdmVudCggdGhpcywgJzpkZXN0cm95JywgW10sIGZhbHNlICk7XHJcbiAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICBkZWxldGUgdGhpcy5tYXhMaXN0ZW5lcnM7XHJcbiAgICB0aGlzLmRlc3Ryb3kgPSB0aGlzLmF0ID0gdGhpcy5jbGVhciA9IHRoaXMuZW1pdCA9IHRoaXMuZXZlbnRUeXBlcyA9IHRoaXMuZmlyc3QgPSB0aGlzLmdldE1heExpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJDb3VudCA9IHRoaXMubGlzdGVuZXJzID0gdGhpcy5tYW55ID0gdGhpcy5vZmYgPSB0aGlzLm9uID0gdGhpcy5vbmNlID0gdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSB0aGlzLnRpY2sgPSB0aGlzLnRyaWdnZXIgPSB0aGlzLnVudGlsID0gbm9vcDtcclxuICAgIHRoaXMudG9KU09OID0gKCkgPT4gJ2Rlc3Ryb3llZCc7XHJcbn07XHJcblxyXG4vKipcclxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQW4gcGxhaW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxyXG4gKiBAc2luY2UgMS4zLjBcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcclxuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIFxyXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xyXG4gKiAvLyB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH1cclxuICogXHJcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xyXG4gKiBcclxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcclxuICogLy8gXCJkZXN0cm95ZWRcIlxyXG4gKi9cclxuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcclxuICAgIGNvbnN0IGpzb24gPSBuZXcgTnVsbCgpLFxyXG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIHRoaXNbICRldmVudHMgXSApLFxyXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcclxuICAgICAgICBcclxuICAgIGxldCBpbmRleCA9IDAsXHJcbiAgICAgICAgdHlwZTtcclxuICAgIFxyXG4gICAganNvbi5tYXhMaXN0ZW5lcnMgPSB0aGlzLm1heExpc3RlbmVycztcclxuICAgIGpzb24ubGlzdGVuZXJDb3VudCA9IG5ldyBOdWxsKCk7XHJcbiAgICBcclxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xyXG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcclxuICAgICAgICBqc29uLmxpc3RlbmVyQ291bnRbIHR5cGUgXSA9IHRoaXMubGlzdGVuZXJDb3VudCggdHlwZSApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4ganNvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cclxuICogQHNpbmNlIDEuMy4wXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XHJcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiBcclxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xyXG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXHJcbiAqIFxyXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcclxuICogXHJcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvU3RyaW5nKCkgKTtcclxuICogLy8gJ0VtaXR0ZXIgXCJkZXN0cm95ZWRcIidcclxuICovXHJcbkVtaXR0ZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcclxuICAgIHJldHVybiBgJHsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIH0gJHsgSlNPTi5zdHJpbmdpZnkoIHRoaXMudG9KU09OKCkgKSB9YC50cmltKCk7XHJcbn07Il0sImZpbGUiOiJlbWl0dGVyLmpzIn0=
