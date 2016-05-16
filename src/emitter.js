'use strict';

/**
 * JavaScript Array
 * @external Array
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array}
 */ 

/**
 * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} boolean
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
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/external:Object}
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
 * @typedef {external:string|external:symbol} EventType
 */ 

/**
 * A function bound to an emitter event. Any data transmitted with the event will be passed into the listener as arguments.
 * @typedef {external:Function} EventListener
 * @param {...*} data The arguments passed by the `emit`.
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

var
    /**
     * @constant {external:Object} Emitter.API
     * @property {external:symbol} defineEvents Reference to {@link Emitter.asEmitter.@@defineEvents}
     * @property {external:symbol} defineMaxListeners Reference to {@link Emitter.asEmitter.@@defineMaxListeners}
     * @property {external:symbol} destroyEvents Reference to {@link Emitter.asEmitter.@@destroyEvents}
     * @property {external:symbol} destroyMaxListeners Reference to {@link Emitter.asEmitter.@@destroyMaxListeners}
     * @property {external:symbol} getMaxListeners Reference to {@link Emitter.asEmitter.@@getMaxListeners}
     * @property {external:symbol} setMaxListeners Reference to {@link Emitter.asEmitter.@@setMaxListeners}
     */
    API = {
        defineEvents        : Symbol( '@@defineEvents' ),
        defineMaxListeners  : Symbol( '@@defineMaxListeners' ),
        destroyEvents       : Symbol( '@@destroyEvents' ),
        destroyMaxListeners : Symbol( '@@destroyMaxListeners' ),
        getMaxListeners     : Symbol( '@@getMaxListeners' ),
        setMaxListeners     : Symbol( '@@setMaxListeners' )
    },
    
    $defaultMaxListeners    = Symbol( '@@defaultMaxListeners' ),
    $events                 = Symbol( '@@events' ),
    $every                  = Symbol( '@@every' ),
    $maxListeners           = Symbol( '@@maxListeners' ),
    
    noop = function(){};


// Many of these functions are broken out from the prototype for the sake of optimization. The functions on the protoytype
// take a variable number of arguments and can be deoptimized as a result. These functions have a fixed number of arguments
// and therefore do not get deoptimized.

/**
 * @function Emitter~emitErrors
 * @param {Emitter} emitter The emitter on which the `errors` will be emitted.
 * @param {Array<external:Error>} errors The array of errors to be emitted.
 */
function emitErrors( emitter, errors ){
    for( var i = 0, length = errors.length; i < length; i += 1 ){
        emitEvent( emitter, 'error', [ errors[ i ] ] );
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
    var _events = emitter[ $events ],
        executed = false,
        listener;
    
    if( type === 'error' && !_events.error ){
        var error = data[ 0 ];
        
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
 * Execute a listener with no arguments.
 * @function Emitter~executeEmpty
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 */
function executeEmpty( handler, isFunction, emitter ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter );
        } catch( error ){
            errors.push( error );
        }
    } else {
        var length = handler.length,
            listeners = handler.slice(),
            i = 0;
        
        for( ; i < length; i += 1 ){
            try {
                listeners[ i ].call( emitter );
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
 * @function Emitter~executeOne
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 */
function executeOne( handler, isFunction, emitter, arg1 ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        var length = handler.length,
            listeners = handler.slice(),
            i = 0;
        
        for( ; i < length; i += 1 ){
            try {
                listeners[ i ].call( emitter, arg1 );
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
 * @function Emitter~executeTwo
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 * @param {*} arg2 The second argument.
 */
function executeTwo( handler, isFunction, emitter, arg1, arg2 ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1, arg2 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        var length = handler.length,
            listeners = handler.slice(),
            i = 0;
        
        for( ; i < length; i += 1 ){
            try {
                listeners[ i ].call( emitter, arg1, arg2 );
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
 * @function Emitter~executeThree
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {*} arg1 The first argument.
 * @param {*} arg2 The second argument.
 * @param {*} arg3 The third argument.
 */
function executeThree( handler, isFunction, emitter, arg1, arg2, arg3 ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1, arg2, arg3 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        var length = handler.length,
            listeners = handler.slice(),
            i = 0;
        
        for( ; i < length; i += 1 ){
            try {
                listeners[ i ].call( emitter, arg1, arg2, arg3 );
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
 * @function Emitter~executeMany
 * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
 * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
 * @param {Emitter} emitter The emitter.
 * @param {external:Array} args Four or more arguments.
 */
function executeMany( handler, isFunction, emitter, args ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.apply( emitter, args );
        } catch( error ){
            errors.push( error );
        }
    } else {
        var length = handler.length,
            listeners = handler.slice(),
            i = 0;
        
        for( ; i < length; i += 1 ){
            try {
                listeners[ i ].apply( emitter, args );
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
 * Executes a listener using the internal `execute*` functions based on the number of arguments.
 * @function Emitter~executeListener
 * @param {Array<Listener>|Listener} listener
 * @param {external:Array} data
 * @param {*} scope
 */ 
function executeListener( listener, data, scope ){
    var isFunction = typeof listener === 'function';
    
    switch( data.length ){
        case 0:
            executeEmpty    ( listener, isFunction, scope );
            break;
        case 1:
            executeOne      ( listener, isFunction, scope, data[ 0 ] );
            break;
        case 2:
            executeTwo      ( listener, isFunction, scope, data[ 0 ], data[ 1 ] );
            break;
        case 3:
            executeThree    ( listener, isFunction, scope, data[ 0 ], data[ 1 ], data[ 2 ] );
            break;
        default:
            executeMany     ( listener, isFunction, scope, data );
            break;
    }
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
 * @function Emitter~onEvent
 * @param {Emitter} emitter The emitter on which the event would be emitted.
 * @param {EventType} type The event type.
 * @param {EventListener} listener The event callback.
 * @param {external:boolean} prepend
 */
function onEvent( emitter, type, listener, prepend ){
    if( typeof listener !== 'function' ){
        throw new TypeError( 'listener must be a function' );
    }
    
    var _events = emitter[ $events ];
    
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
        prepend ?
            _events[ type ].unshift( listener ) :
            _events[ type ].push( listener );
    
    // Transition from single to multiple listeners
    } else {
        _events[ type ] = prepend ?
            [ listener, _events[ type ] ] :
            [ _events[ type ], listener ];
    }
    
    // Track warnings if max listeners is available
    if( 'maxListeners' in emitter && !_events[ type ].warned ){
        var max = emitter.maxListeners;
        
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
 * Faster than `Array.prototype.splice`
 * @function Emitter~spliceList
 * @param {external:Array} list
 * @param {external:number} index
 */ 
function spliceList( list, index ){
    for( var i = index, j = i + 1, length = list.length; j < length; i += 1, j += 1 ){
        list[ i ] = list[ j ];
    }
    
    list.pop();
}

/**
 * A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, and `toString()` and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.
 * 
 * Like all functional mixins, this should be executed with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call|`call()`} or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply|`apply()`}.
 * @mixin Emitter.asEmitter
 * @example <caption>Creating an Emitter from an empty object</caption>
 * // Create a base object
 * const greeter = Object.create( null );
 * 
 * // Initialize the mixin
 * Emitter.asEmitter.call( greeter );
 * greeter[ Emitter.API.defineEvents ]();
 * greeter[ Emitter.API.defineMaxListeners ]( 10 );
 * 
 * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'World' );
 * // Hello, World!
 * @example <caption>Epic fail</caption>
 * // NO!!!
 * Emitter.asEmitter(); // Madness ensues
 */
function asEmitter(){
    
     /**
     * Remove all listeners, or those for the specified event `type`.
     * @function Emitter.asEmitter.clear
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
        var handler;
        
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
            var types = Object.keys( this[ $events ] );
            
            // Avoid removing "off" listeners until all other types have been removed
            for( var i = 0, length = types.length; i < length; i += 1 ){
                if( types[ i ] === ':off' ){
                    continue;
                }
                
                this.clear( types[ i ] );
            }
            
            // Manually clear "off"
            this.clear( ':off' );
            
            this[ $events ] = new Null();
            
            return this;
        }
        
        handler = this[ $events ][ type ];
        
        if( typeof handler === 'function' ){
            this.off( type, handler );
        } else if( Array.isArray( handler ) ){
            var index = handler.length;
            
            while( index-- ){
                this.off( type, handler[ index ] );
            }
        }
        
        delete this[ $events ][ type ];
        
        return this;
    };
    
     /**
     * Defines the internal event registry if it does not exist and creates `destroyEvents()`. This is called within the `constructor()` and does not need to be called if using `Emitter` directly.
     * 
     * When using `Emitter.asEmitter()`, this should be used to initialize the registry of the target object. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.
     * @protected
     * @function Emitter.asEmitter.@@defineEvents
     * @param {external:Object} [bindings]
     * @example <caption>Define the event registry</caption>
     * // Create a base object
     * const greeter = Object.create( null );
     * 
     * // Initialize the mixin
     * Emitter.asEmitter.call( greeter );
     * greeter[ Emitter.API.defineEvents ]();
     * greeter[ Emitter.API.defineMaxListeners ]( 10 );
     * 
     * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * @example <caption>Define the event registry and register predefine events</caption>
     * const // Predefined events
     *  greetings = {
     *      hello: function( name ){ console.log( `Hello, ${name}!` ),
     *      hi: function( name ){ console.log( `Hi, ${name}!` )
     *  },
     *
     *  // Create a base object
     *  greeter = Object.create( null );
     * 
     * // Initialize the mixin
     * Emitter.asEmitter.call( greeter );
     * greeter[ Emitter.API.defineEvents ]( greetings );
     * greeter[ Emitter.API.defineMaxListeners ]( 10 );
     * 
     * greeter.emit( 'hello', 'Aaron' );
     * // Hello, Aaron!
     */
    this[ API.defineEvents ] = function( bindings ){
        if( !this[ $events ] || this[ $events ] === Object.getPrototypeOf( this )[ $events ] ){
            this[ $events ] = new Null();
        }
        
        /**
         * @protected
         * @function Emitter.asEmitter.@@destroyEvents
         */
        this[ API.destroyEvents ] = function(){
            if( $events in this ){
                this.clear();
                delete this[ $events ];
            }
            this[ API.defineEvents ] = this[ API.destroyEvents ] = noop;
        };
        
        if( typeof bindings === 'object' ){
            this.on( bindings );
        }
    };
    
    /**
     * @protected
     * @function Emitter.asEmitter.@@defineMaxListeners
     * @param {external:number} defaultMaxListeners
     */
    this[ API.defineMaxListeners ] = function( defaultMaxListeners ){
        if( !isPositiveNumber( defaultMaxListeners ) ){
            throw new TypeError( 'defaultMaxListeners must be a positive number' );
        }
        
        /**
         * Protected default max listeners property.
         * @protected
         * @member {external:number} Emitter#@@defaultMaxListeners
         */ 
        this[ $defaultMaxListeners ] = defaultMaxListeners;
        
        /**
         * Protected max listeners property.
         * @protected
         * @member {external:number} Emitter#@@maxListeners
         */ 
        this[ $maxListeners ] = this[ $maxListeners ] || undefined;
        
        /**
         * By default Emitters will emit a `:maxListeners` event if more than *10* listeners are added for a particular event `type`. This property allows that to be changed. Set to *0* for unlimited.
         * 
         * The getter for this property is {@link Emitter.asEmitter.@@getMaxListeners}.
         * The setter for this property is {@link Emitter.asEmitter.@@setMaxListeners}.
         * @member {external:number} Emitter#maxListeners
         * @example
         * const greeter = new Emitter();
         * 
         * greeter.maxListeners = 1;
         * 
         * greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.on( 'hello', () => alert( 'Hello!' ) );
         * // Greeting "hello" has one too many!
         */
        Object.defineProperty( this, 'maxListeners', {
            get: this[ API.getMaxListeners ],
            set: this[ API.setMaxListeners ],
            configurable: true,
            enumerable: false
        } );
        
        /**
         * @protected
         * @function Emitter.asEmitter.@@destroyMaxListeners
         */
        this[ API.destroyMaxListeners ] = function(){
            if( $maxListeners in this ){
                delete this[ $defaultMaxListeners ];
                delete this.maxListeners;
                delete this[ $maxListeners ];
            }
            this[ API.defineMaxListeners ] = this[ API.destroyMaxListeners ] = noop;
        };
    };
    
    /**
     * Execute the listeners for the specified event `type` with the supplied arguments.
     * 
     * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
     * 
     * Returns `true` if the event had listeners, `false` otherwise.
     * @function Emitter.asEmitter.emit
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
        return this.trigger( type, data );
    };
    
    /**
     * @function Emitter.asEmitter.eventTypes
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
        return Object.keys( this[ $events ] );
    };
    
    /**
     * @function Emitter.asEmitter.first
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event callback.
     * @returns {Emitter} The emitter.
     */
    this.first = function( type, listener ){
        onEvent( this, type, listener, false );
        return this;
    };
    
    /**
     * @protected
     * @function Emitter.asEmitter.@@getMaxListeners
     * @returns {external:number} The maximum number of listeners.
     */
    this[ API.getMaxListeners ] = function(){
        return typeof this[ $maxListeners ] !== 'undefined' ?
            this[ $maxListeners ] :
            this[ $defaultMaxListeners ];
    };
    
    /**
     * @function Emitter.asEmitter.listenerCount
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
        var count;

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
     * @function Emitter.asEmitter.listeners
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
        var listeners;
        
        if( !this[ $events ] || !this[ $events ][ type ] ){
            listeners = [];
        } else {
            var handler = this[ $events ][ type ];
            
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
     * @function Emitter.asEmitter.many
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
        
        if( typeof times !== 'number' ){
            throw new TypeError( 'times must be a number' );
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        function manyListener(){
            listener.apply( this, arguments );
            return --times === 0;
        }
        
        manyListener.listener = listener;
        
        return this.until( type, manyListener );
    };
    
    /**
     * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
     * 
     * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
     * @function Emitter.asEmitter.off
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
        var handler;
        
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
        
        handler = this[ $events ][ type ];
        
        if( handler === listener || ( typeof handler.listener === 'function' && handler.listener === listener ) ){
            delete this[ $events ][ type ];
            if( this[ $events ][ ':off' ] ){
                emitEvent( this, ':off', [ type, listener ], true );
            }
        } else if( Array.isArray( handler ) ){
            var index = -1;
            
            for( var i = handler.length; i-- > 0; ){
                if( handler[ i ] === listener || ( handler[ i ].listener && handler[ i ].listener === listener ) ){
                    index = i;
                    break;
                }
            }
        
            if( index < 0 ){
                return this;
            }
            
            if( handler.length === 1 ){
                handler.length = 0;
                delete this[ $events ][ type ];
            } else {
                spliceList( handler, index );
            }
            
            if( this[ $events ][ ':off' ] ){
                emitEvent( this, ':off', [ type, listener ], true );
            }
        }
        
        return this;
    };
    
    /**
     * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
     * 
     * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
     * @function Emitter.asEmitter.on
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
        var type = arguments[ 0 ] || $every,
            listener = arguments[ 1 ];
        
        if( typeof listener === 'undefined' ){
            
            // Type not provided, fall back to "$every"
            if( typeof type === 'function' ){
                listener = type;
                type = $every;
            
            // Plain object of event bindings
            } else if( typeof type === 'object' ){
                var bindings = type,
                    types = Object.keys( bindings ),
                    
                    typeIndex = 0,
                    typeLength = types.length,
                
                    handler, handlerIndex, handlerLength;
                
                for( ; typeIndex < typeLength; typeIndex += 1 ){
                    type = types[ typeIndex ];
                    handler = bindings[ type ];
                    
                    // List of listeners
                    if( Array.isArray( handler ) ){
                        handlerIndex = 0;
                        handlerLength = handler.length;
                            
                        for( ; handlerIndex < handlerLength; handlerIndex += 1 ){
                            onEvent( this, type, handler[ handlerIndex ], false );
                        }
                    
                    // Single listener
                    } else {
                        onEvent( this, type, handler, false );
                    }
                }
                
                return this;
            }
        }
        
        onEvent( this, type, listener, false );
        
        return this;
    };
    
    /**
     * @function Emitter.asEmitter.once
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
        
        return this.many( type, 1, listener );
    };
    
    /**
     * @protected
     * @function Emitter.asEmitter.@@setMaxListeners
     * @param {external:number} max The maximum number of listeners.
     * @returns {Emitter} The emitter.
     */
    this[ API.setMaxListeners ] = function( max ){
        if( !isPositiveNumber( max ) ){
            throw new TypeError( 'max must be a positive number' );
        }
        
        this[ $maxListeners ] = max;
        
        return this;
    };
    
    /**
     * Execute the listeners for the specified event `type` with the supplied `data`.
     * 
     * Returns `true` if the event had listeners, `false` otherwise.
     * @function Emitter.asEmitter.trigger
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
        var executed = false,
            // If type is not a string, index will be false
            index = typeof type === 'string' && type.lastIndexOf( ':' );
        
        // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
        while( index > 0 ){
            executed = ( type && emitEvent( this, type, data, false ) ) || executed;
            type = type.substring( 0, index );
            index = type.lastIndexOf( ':' );
        }
        
        // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )
        executed = ( type && emitEvent( this, type, data, true ) ) || executed;
        
        return executed;
    };
    
    /**
     * Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.
     * 
     * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
     * @function Emitter.asEmitter.until
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
        
        function untilListener(){
            var done = listener.apply( this, arguments );
            if( done === true ){
                this.off( type, untilListener );
            }
        }
        
        // TODO Check beyond just one level of listener references
        untilListener.listener = listener.listener || listener;
        
        onEvent( this, type, untilListener, false );
        
        return this;
    };
}

/**
 * Creates an instance of emitter. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.
 * @class Emitter
 * @classdesc An object that emits named events which cause functions to be executed.
 * @extends Emitter~Null
 * @mixes Emitter.asEmitter
 * @param {external:Object} [bindings] A mapping of event types to event listeners.
 * @see {@link https://github.com/nodejs/node/blob/master/lib/events.js}
 * @example <caption>Using Emitter directly</caption>
 * const greeter = new Emitter();
 * greeter.on( 'hello', () => console.log( 'Hello!' ) );
 * greeter.emit( 'hello' );
 * // Hello!
 * @example <caption>Inheriting from Emitter</caption>
 * function Greeter(){
 *  Emitter.call( this );
 * 
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
export default function Emitter( bindings ){
   this[ API.defineMaxListeners ]( Emitter.defaultMaxListeners );
   this[ API.defineEvents ]( bindings );
}

Object.defineProperties( Emitter, {
    API: {
        value: API,
        configurable: true,
        enumerable: false,
        writable: false
    },
    asEmitter: {
        value: asEmitter,
        configurable: true,
        enumerable: false,
        writable: false
    },
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

Emitter.prototype[ Symbol.toStringTag ] = 'Emitter';

Emitter.prototype.constructor = Emitter;

Emitter.asEmitter.call( Emitter.prototype );

/**
 * Destroys the emitter.
 * @fires Emitter#:destroy
 */
Emitter.prototype.destroy = function(){
    emitEvent( this, ':destroy', [], true );
    this[ API.destroyEvents ]();
    this[ API.destroyMaxListeners ]();
    this.destroy = this.clear = this.emit = this.first = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.trigger = this.until = noop;
    this.toJSON = function(){
        return 'destroyed';
    };
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
    var json = new Null(),
        types = Object.keys( this[ $events ] ),
        length = types.length,
        index = 0,
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