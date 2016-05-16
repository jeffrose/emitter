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

// Instantiating this is faster than explicitly calling `Object.create( null )` to get a "clean" empty object
function Container(){}
Container.prototype = Object.create( null );

var

    /**
     * @constant {external:Object} Emitter.API
     * @property {external:symbol} defineEvents Reference to {@link Emitter#defineEvents}
     * @property {external:symbol} defineMaxListeners Reference to {@link Emitter#defineMaxListeners}
     * @property {external:symbol} destroyEvents Reference to {@link Emitter#destroyEvents}
     * @property {external:symbol} destroyMaxListeners Reference to {@link Emitter#destroyMaxListeners}
     * @property {external:symbol} getMaxListeners Reference to {@link Emitter#getMaxListeners}
     * @property {external:symbol} setMaxListeners Reference to {@link Emitter#setMaxListeners}
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
 * @param {EventListener|Array<EventListener>} handler
 * @paran {external:boolean} isFunction
 * @param {Emitter} emitter
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
 * @param {EventListener|Array<EventListener>} handler
 * @paran {external:boolean} isFunction
 * @param {Emitter} emitter
 * @param {*} arg1
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
 * @param {EventListener|Array<EventListener>} handler
 * @paran {external:boolean} isFunction
 * @param {Emitter} emitter
 * @param {*} arg1
 * @param {*} arg2
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
 * @param {EventListener|Array<EventListener>} handler
 * @paran {external:boolean} isFunction
 * @param {Emitter} emitter
 * @param {*} arg1
 * @param {*} arg2
 * @param {*} arg3
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
 * @param {EventListener|Array<EventListener>} handler
 * @paran {external:boolean} isFunction
 * @param {Emitter} emitter
 * @param {external:Array} args
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
 * @param {*} number
 * @returns {external:boolean} Whether or not the value is a positive number.
 */
function isPositiveNumber( number ){
    return typeof number === 'number' && number >= 0 && !isNaN( number );
}

/**
 * @function Emitter~onEvent
 * @param {Emitter} emitter
 * @param {EventType} type type
 * @param {EventListener} listener
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
 * const greeter = Object.create( null ),
 *  eAPI = Emitter.API;
 * 
 * // Initialize the mixin
 * Emitter.asEmitter.call( greeter );
 * greeter[ eAPI.defineEvents ]();
 * greeter[ eAPI.defineMaxListeners ]( 10 );
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
                this[ $events ] = new Container();
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
            
            this[ $events ] = new Container();
            
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
     * const greeter = Object.create( null ),
     *  eAPI = Emitter.API;
     * 
     * // Initialize the mixin
     * Emitter.asEmitter.call( greeter );
     * greeter[ eAPI.defineEvents ]();
     * greeter[ eAPI.defineMaxListeners ]( 10 );
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
     *  greeter = Object.create( null ),
     *  
     *  eAPI = Emitter.API;
     * 
     * // Initialize the mixin
     * Emitter.asEmitter.call( greeter );
     * greeter[ eAPI.defineEvents ]( greetings );
     * greeter[ eAPI.defineMaxListeners ]( 10 );
     * 
     * greeter.emit( 'hello', 'Aaron' );
     * // Hello, Aaron!
     */
    this[ API.defineEvents ] = function( bindings ){
        if( !this[ $events ] || this[ $events ] === Object.getPrototypeOf( this )[ $events ] ){
            this[ $events ] = new Container();
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
         * Protected default max listeners property
         * @protected
         * @member {external:number} Emitter#@@defaultMaxListeners
         */ 
        this[ $defaultMaxListeners ] = defaultMaxListeners;
        
        /**
         * Protected max listeners property
         * @protected
         * @member {external:number} Emitter#@@maxListeners
         */ 
        this[ $maxListeners ] = this[ $maxListeners ] || undefined;
        
        /**
         * Public max listeners property
         * @member {external:number} Emitter#maxListeners
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
     * @returns {Array<external:string>} The list of event types registered to the emitter.
     */ 
    this.eventTypes = function(){
        return Object.keys( this[ $events ] );
    };
    
    /**
     * @function Emitter.asEmitter.first
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event listener.
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
     * @param {EventListener} listener The event listener.
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
     * @param {EventListener} listener The event listener.
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
     * @param {EventListener} listener The event listener.
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
     * @param {EventListener} listener
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
 * @extends null
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

Emitter.prototype = new Container();

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
    var json = new Container(),
        types = Object.keys( this[ $events ] ),
        length = types.length,
        index = 0,
        type;
    
    json.maxListeners = this.maxListeners;
    json.listenerCount = new Container();
    
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbWl0dGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEFycmF5XG4gKiBAZXh0ZXJuYWwgQXJyYXlcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5fVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gYm9vbGVhblxuICogQGV4dGVybmFsIGJvb2xlYW5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Jvb2xlYW59XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBFcnJvclxuICogQGV4dGVybmFsIEVycm9yXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvcn1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEZ1bmN0aW9uXG4gKiBAZXh0ZXJuYWwgRnVuY3Rpb25cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9ufVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IG51bWJlclxuICogQGV4dGVybmFsIG51bWJlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyfVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxuICogQGV4dGVybmFsIE9iamVjdFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZXh0ZXJuYWw6T2JqZWN0fVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXG4gKiBAZXh0ZXJuYWwgc3RyaW5nXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XG4gKi8gXG4gXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3ltYm9sXG4gKiBAZXh0ZXJuYWwgc3ltYm9sXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TeW1ib2x9XG4gKi8gXG5cbi8qKlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpzeW1ib2x9IEV2ZW50VHlwZVxuICovIFxuXG4vKipcbiAqIEEgZnVuY3Rpb24gYm91bmQgdG8gYW4gZW1pdHRlciBldmVudC4gQW55IGRhdGEgdHJhbnNtaXR0ZWQgd2l0aCB0aGUgZXZlbnQgd2lsbCBiZSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXIgYXMgYXJndW1lbnRzLlxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0gey4uLip9IGRhdGEgVGhlIGFyZ3VtZW50cyBwYXNzZWQgYnkgdGhlIGBlbWl0YC5cbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhbiBlbWl0dGVyIGRlc3Ryb3lzIGl0c2VsZi5cbiAqIEBldmVudCBFbWl0dGVyIzpkZXN0cm95XG4gKi8gXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9hZnRlcl8gYSBsaXN0ZW5lciBpcyByZW1vdmVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9mZlxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGEgbGlzdGVuZXIgaXMgYWRkZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b25cbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgaGFzIGJlZW4gZXhjZWVkZWQgZm9yIGFuIGV2ZW50IHR5cGUuXG4gKiBAZXZlbnQgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLy8gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYCB0byBnZXQgYSBcImNsZWFuXCIgZW1wdHkgb2JqZWN0XG5mdW5jdGlvbiBDb250YWluZXIoKXt9XG5Db250YWluZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuXG52YXJcblxuICAgIC8qKlxuICAgICAqIEBjb25zdGFudCB7ZXh0ZXJuYWw6T2JqZWN0fSBFbWl0dGVyLkFQSVxuICAgICAqIEBwcm9wZXJ0eSB7ZXh0ZXJuYWw6c3ltYm9sfSBkZWZpbmVFdmVudHMgUmVmZXJlbmNlIHRvIHtAbGluayBFbWl0dGVyI2RlZmluZUV2ZW50c31cbiAgICAgKiBAcHJvcGVydHkge2V4dGVybmFsOnN5bWJvbH0gZGVmaW5lTWF4TGlzdGVuZXJzIFJlZmVyZW5jZSB0byB7QGxpbmsgRW1pdHRlciNkZWZpbmVNYXhMaXN0ZW5lcnN9XG4gICAgICogQHByb3BlcnR5IHtleHRlcm5hbDpzeW1ib2x9IGRlc3Ryb3lFdmVudHMgUmVmZXJlbmNlIHRvIHtAbGluayBFbWl0dGVyI2Rlc3Ryb3lFdmVudHN9XG4gICAgICogQHByb3BlcnR5IHtleHRlcm5hbDpzeW1ib2x9IGRlc3Ryb3lNYXhMaXN0ZW5lcnMgUmVmZXJlbmNlIHRvIHtAbGluayBFbWl0dGVyI2Rlc3Ryb3lNYXhMaXN0ZW5lcnN9XG4gICAgICogQHByb3BlcnR5IHtleHRlcm5hbDpzeW1ib2x9IGdldE1heExpc3RlbmVycyBSZWZlcmVuY2UgdG8ge0BsaW5rIEVtaXR0ZXIjZ2V0TWF4TGlzdGVuZXJzfVxuICAgICAqIEBwcm9wZXJ0eSB7ZXh0ZXJuYWw6c3ltYm9sfSBzZXRNYXhMaXN0ZW5lcnMgUmVmZXJlbmNlIHRvIHtAbGluayBFbWl0dGVyI3NldE1heExpc3RlbmVyc31cbiAgICAgKi9cbiAgICBBUEkgPSB7XG4gICAgICAgIGRlZmluZUV2ZW50cyAgICAgICAgOiBTeW1ib2woICdAQGRlZmluZUV2ZW50cycgKSxcbiAgICAgICAgZGVmaW5lTWF4TGlzdGVuZXJzICA6IFN5bWJvbCggJ0BAZGVmaW5lTWF4TGlzdGVuZXJzJyApLFxuICAgICAgICBkZXN0cm95RXZlbnRzICAgICAgIDogU3ltYm9sKCAnQEBkZXN0cm95RXZlbnRzJyApLFxuICAgICAgICBkZXN0cm95TWF4TGlzdGVuZXJzIDogU3ltYm9sKCAnQEBkZXN0cm95TWF4TGlzdGVuZXJzJyApLFxuICAgICAgICBnZXRNYXhMaXN0ZW5lcnMgICAgIDogU3ltYm9sKCAnQEBnZXRNYXhMaXN0ZW5lcnMnICksXG4gICAgICAgIHNldE1heExpc3RlbmVycyAgICAgOiBTeW1ib2woICdAQHNldE1heExpc3RlbmVycycgKVxuICAgIH0sXG4gICAgXG4gICAgJGRlZmF1bHRNYXhMaXN0ZW5lcnMgICAgPSBTeW1ib2woICdAQGRlZmF1bHRNYXhMaXN0ZW5lcnMnICksXG4gICAgJGV2ZW50cyAgICAgICAgICAgICAgICAgPSBTeW1ib2woICdAQGV2ZW50cycgKSxcbiAgICAkZXZlcnkgICAgICAgICAgICAgICAgICA9IFN5bWJvbCggJ0BAZXZlcnknICksXG4gICAgJG1heExpc3RlbmVycyAgICAgICAgICAgPSBTeW1ib2woICdAQG1heExpc3RlbmVycycgKSxcbiAgICBcbiAgICBub29wID0gZnVuY3Rpb24oKXt9O1xuXG5cbi8vIE1hbnkgb2YgdGhlc2UgZnVuY3Rpb25zIGFyZSBicm9rZW4gb3V0IGZyb20gdGhlIHByb3RvdHlwZSBmb3IgdGhlIHNha2Ugb2Ygb3B0aW1pemF0aW9uLiBUaGUgZnVuY3Rpb25zIG9uIHRoZSBwcm90b3l0eXBlXG4vLyB0YWtlIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGFzIGEgcmVzdWx0LiBUaGVzZSBmdW5jdGlvbnMgaGF2ZSBhIGZpeGVkIG51bWJlciBvZiBhcmd1bWVudHNcbi8vIGFuZCB0aGVyZWZvcmUgZG8gbm90IGdldCBkZW9wdGltaXplZC5cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXJyb3JzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGBlcnJvcnNgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7QXJyYXk8ZXh0ZXJuYWw6RXJyb3I+fSBlcnJvcnMgVGhlIGFycmF5IG9mIGVycm9ycyB0byBiZSBlbWl0dGVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKXtcbiAgICBmb3IoIHZhciBpID0gMCwgbGVuZ3RoID0gZXJyb3JzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSArPSAxICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJ2Vycm9yJywgWyBlcnJvcnNbIGkgXSBdICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFdmVudFxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gZW1pdEV2ZXJ5IFdoZXRoZXIgb3Igbm90IGxpc3RlbmVycyBmb3IgYWxsIHR5cGVzIHdpbGwgYmUgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZW1pdEV2ZXJ5ICl7XG4gICAgdmFyIF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF0sXG4gICAgICAgIGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIGxpc3RlbmVyO1xuICAgIFxuICAgIGlmKCB0eXBlID09PSAnZXJyb3InICYmICFfZXZlbnRzLmVycm9yICl7XG4gICAgICAgIHZhciBlcnJvciA9IGRhdGFbIDAgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCBlcnJvciBpbnN0YW5jZW9mIEVycm9yICl7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gdHlwZSBvZiBldmVudFxuICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgdHlwZSBdO1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBsaXN0ZW5pbmcgZm9yIGFsbCB0eXBlcyBvZiBldmVudHNcbiAgICBpZiggZW1pdEV2ZXJ5ICl7XG4gICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgJGV2ZXJ5IF07XG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG5vIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVFbXB0eVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyXG4gKiBAcGFyYW4ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb25cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlclxuICovXG5mdW5jdGlvbiBleGVjdXRlRW1wdHkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIgKXtcbiAgICB2YXIgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCksXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpIDwgbGVuZ3RoOyBpICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpIF0uY2FsbCggZW1pdHRlciApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggb25lIGFyZ3VtZW50LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZU9uZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyXG4gKiBAcGFyYW4ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb25cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlclxuICogQHBhcmFtIHsqfSBhcmcxXG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGVPbmUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEgKXtcbiAgICB2YXIgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCksXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpIDwgbGVuZ3RoOyBpICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpIF0uY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdHdvIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVUd29cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlclxuICogQHBhcmFuIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7Kn0gYXJnMVxuICogQHBhcmFtIHsqfSBhcmcyXG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGVUd28oIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKXtcbiAgICB2YXIgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCksXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpIDwgbGVuZ3RoOyBpICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpIF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdGhyZWUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZVRocmVlXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXJcbiAqIEBwYXJhbiB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvblxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyXG4gKiBAcGFyYW0geyp9IGFyZzFcbiAqIEBwYXJhbSB7Kn0gYXJnMlxuICogQHBhcmFtIHsqfSBhcmczXG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGVUaHJlZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApe1xuICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKSxcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGkgPCBsZW5ndGg7IGkgKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGkgXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBmb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZU1hbnlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlclxuICogQHBhcmFuIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGFyZ3NcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZU1hbnkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZ3MgKXtcbiAgICB2YXIgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaSA8IGxlbmd0aDsgaSArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaSBdLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGxpc3RlbmVyIHVzaW5nIHRoZSBpbnRlcm5hbCBgZXhlY3V0ZSpgIGZ1bmN0aW9ucyBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVMaXN0ZW5lclxuICogQHBhcmFtIHtBcnJheTxMaXN0ZW5lcj58TGlzdGVuZXJ9IGxpc3RlbmVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gKiBAcGFyYW0geyp9IHNjb3BlXG4gKi8gXG5mdW5jdGlvbiBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBzY29wZSApe1xuICAgIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nO1xuICAgIFxuICAgIHN3aXRjaCggZGF0YS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgZXhlY3V0ZUVtcHR5ICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZXhlY3V0ZU9uZSAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBleGVjdXRlVHdvICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgZXhlY3V0ZVRocmVlICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSwgZGF0YVsgMiBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGV4ZWN1dGVNYW55ICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+aXNQb3NpdGl2ZU51bWJlclxuICogQHBhcmFtIHsqfSBudW1iZXJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKi9cbmZ1bmN0aW9uIGlzUG9zaXRpdmVOdW1iZXIoIG51bWJlciApe1xuICAgIHJldHVybiB0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyAmJiBudW1iZXIgPj0gMCAmJiAhaXNOYU4oIG51bWJlciApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfm9uRXZlbnRcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgdHlwZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lclxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBwcmVwZW5kXG4gKi9cbmZ1bmN0aW9uIG9uRXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kICl7XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIH1cbiAgICBcbiAgICB2YXIgX2V2ZW50cyA9IGVtaXR0ZXJbICRldmVudHMgXTtcbiAgICBcbiAgICBpZiggX2V2ZW50c1sgJzpvbicgXSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b24nLCBbIHR5cGUsIHR5cGVvZiBsaXN0ZW5lci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICBcbiAgICAgICAgLy8gRW1pdHRpbmcgXCJvblwiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICBfZXZlbnRzWyAnOm9uJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9uJyBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICBpZiggIV9ldmVudHNbIHR5cGUgXSApe1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBsaXN0ZW5lcjtcbiAgICBcbiAgICAvLyBNdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIF9ldmVudHNbIHR5cGUgXSApICl7XG4gICAgICAgIHByZXBlbmQgP1xuICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnVuc2hpZnQoIGxpc3RlbmVyICkgOlxuICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XG4gICAgXG4gICAgLy8gVHJhbnNpdGlvbiBmcm9tIHNpbmdsZSB0byBtdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBwcmVwZW5kID9cbiAgICAgICAgICAgIFsgbGlzdGVuZXIsIF9ldmVudHNbIHR5cGUgXSBdIDpcbiAgICAgICAgICAgIFsgX2V2ZW50c1sgdHlwZSBdLCBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBUcmFjayB3YXJuaW5ncyBpZiBtYXggbGlzdGVuZXJzIGlzIGF2YWlsYWJsZVxuICAgIGlmKCAnbWF4TGlzdGVuZXJzJyBpbiBlbWl0dGVyICYmICFfZXZlbnRzWyB0eXBlIF0ud2FybmVkICl7XG4gICAgICAgIHZhciBtYXggPSBlbWl0dGVyLm1heExpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCBtYXggJiYgbWF4ID4gMCAmJiBfZXZlbnRzWyB0eXBlIF0ubGVuZ3RoID4gbWF4ICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6bWF4TGlzdGVuZXJzJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEVtaXR0aW5nIFwibWF4TGlzdGVuZXJzXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgICAgICBfZXZlbnRzWyAnOm1heExpc3RlbmVycycgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzptYXhMaXN0ZW5lcnMnIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVtaXR0ZXJbICRldmVudHMgXSA9IF9ldmVudHM7XG59XG5cbi8qKlxuICogRmFzdGVyIHRoYW4gYEFycmF5LnByb3RvdHlwZS5zcGxpY2VgXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zcGxpY2VMaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBsaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqLyBcbmZ1bmN0aW9uIHNwbGljZUxpc3QoIGxpc3QsIGluZGV4ICl7XG4gICAgZm9yKCB2YXIgaSA9IGluZGV4LCBqID0gaSArIDEsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBqIDwgbGVuZ3RoOyBpICs9IDEsIGogKz0gMSApe1xuICAgICAgICBsaXN0WyBpIF0gPSBsaXN0WyBqIF07XG4gICAgfVxuICAgIFxuICAgIGxpc3QucG9wKCk7XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbmFsIG1peGluIHRoYXQgcHJvdmlkZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIGl0cyB0YXJnZXQuIFRoZSBgY29uc3RydWN0b3IoKWAsIGBkZXN0cm95KClgLCBgdG9KU09OKClgLCBhbmQgYHRvU3RyaW5nKClgIGFuZCBzdGF0aWMgcHJvcGVydGllcyBvbiBgRW1pdHRlcmAgYXJlIG5vdCBwcm92aWRlZC4gVGhpcyBtaXhpbiBpcyB1c2VkIHRvIHBvcHVsYXRlIHRoZSBgcHJvdG90eXBlYCBvZiBgRW1pdHRlcmAuXG4gKiBcbiAqIExpa2UgYWxsIGZ1bmN0aW9uYWwgbWl4aW5zLCB0aGlzIHNob3VsZCBiZSBleGVjdXRlZCB3aXRoIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9jYWxsfGBjYWxsKClgfSBvciB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYXBwbHl8YGFwcGx5KClgfS5cbiAqIEBtaXhpbiBFbWl0dGVyLmFzRW1pdHRlclxuICogQGV4YW1wbGUgPGNhcHRpb24+Q3JlYXRpbmcgYW4gRW1pdHRlciBmcm9tIGFuIGVtcHR5IG9iamVjdDwvY2FwdGlvbj5cbiAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApLFxuICogIGVBUEkgPSBFbWl0dGVyLkFQSTtcbiAqIFxuICogLy8gSW5pdGlhbGl6ZSB0aGUgbWl4aW5cbiAqIEVtaXR0ZXIuYXNFbWl0dGVyLmNhbGwoIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXJbIGVBUEkuZGVmaW5lRXZlbnRzIF0oKTtcbiAqIGdyZWV0ZXJbIGVBUEkuZGVmaW5lTWF4TGlzdGVuZXJzIF0oIDEwICk7XG4gKiBcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICogLy8gSGVsbG8sIFdvcmxkIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXBpYyBmYWlsPC9jYXB0aW9uPlxuICogLy8gTk8hISFcbiAqIEVtaXR0ZXIuYXNFbWl0dGVyKCk7IC8vIE1hZG5lc3MgZW5zdWVzXG4gKi9cbmZ1bmN0aW9uIGFzRW1pdHRlcigpe1xuICAgIFxuICAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5jbGVhclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhcigpO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbigge1xuICAgICAqICAnaGVsbG8nIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIZWxsbyEnICk7IH0sXG4gICAgICogICdoaScgICAgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hpIScgKTsgfVxuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICovXG4gICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIHZhciBoYW5kbGVyO1xuICAgICAgICBcbiAgICAgICAgLy8gTm8gRXZlbnRzXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2l0aCBubyBcIm9mZlwiIGxpc3RlbmVycywgY2xlYXJpbmcgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBDb250YWluZXIoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDbGVhciBhbGwgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICB2YXIgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEF2b2lkIHJlbW92aW5nIFwib2ZmXCIgbGlzdGVuZXJzIHVudGlsIGFsbCBvdGhlciB0eXBlcyBoYXZlIGJlZW4gcmVtb3ZlZFxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDAsIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSArPSAxICl7XG4gICAgICAgICAgICAgICAgaWYoIHR5cGVzWyBpIF0gPT09ICc6b2ZmJyApe1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhciggdHlwZXNbIGkgXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYW51YWxseSBjbGVhciBcIm9mZlwiXG4gICAgICAgICAgICB0aGlzLmNsZWFyKCAnOm9mZicgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IENvbnRhaW5lcigpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aGlzLm9mZiggdHlwZSwgaGFuZGxlciApO1xuICAgICAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgdGhpcy5vZmYoIHR5cGUsIGhhbmRsZXJbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAgLyoqXG4gICAgICogRGVmaW5lcyB0aGUgaW50ZXJuYWwgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QgYW5kIGNyZWF0ZXMgYGRlc3Ryb3lFdmVudHMoKWAuIFRoaXMgaXMgY2FsbGVkIHdpdGhpbiB0aGUgYGNvbnN0cnVjdG9yKClgIGFuZCBkb2VzIG5vdCBuZWVkIHRvIGJlIGNhbGxlZCBpZiB1c2luZyBgRW1pdHRlcmAgZGlyZWN0bHkuXG4gICAgICogXG4gICAgICogV2hlbiB1c2luZyBgRW1pdHRlci5hc0VtaXR0ZXIoKWAsIHRoaXMgc2hvdWxkIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZSB0aGUgcmVnaXN0cnkgb2YgdGhlIHRhcmdldCBvYmplY3QuIElmIGBiaW5kaW5nc2AgYXJlIHByb3ZpZGVkIHRoZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHBhc3NlZCBpbnRvIGBvbigpYCBvbmNlIGNvbnN0cnVjdGlvbiBpcyBjb21wbGV0ZS5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLkBAZGVmaW5lRXZlbnRzXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IFtiaW5kaW5nc11cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5EZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5PC9jYXB0aW9uPlxuICAgICAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gICAgICogY29uc3QgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKSxcbiAgICAgKiAgZUFQSSA9IEVtaXR0ZXIuQVBJO1xuICAgICAqIFxuICAgICAqIC8vIEluaXRpYWxpemUgdGhlIG1peGluXG4gICAgICogRW1pdHRlci5hc0VtaXR0ZXIuY2FsbCggZ3JlZXRlciApO1xuICAgICAqIGdyZWV0ZXJbIGVBUEkuZGVmaW5lRXZlbnRzIF0oKTtcbiAgICAgKiBncmVldGVyWyBlQVBJLmRlZmluZU1heExpc3RlbmVycyBdKCAxMCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBhbmQgcmVnaXN0ZXIgcHJlZGVmaW5lIGV2ZW50czwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCAvLyBQcmVkZWZpbmVkIGV2ZW50c1xuICAgICAqICBncmVldGluZ3MgPSB7XG4gICAgICogICAgICBoZWxsbzogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIZWxsbywgJHtuYW1lfSFgICksXG4gICAgICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAgICAgKiAgfSxcbiAgICAgKlxuICAgICAqICAvLyBDcmVhdGUgYSBiYXNlIG9iamVjdFxuICAgICAqICBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApLFxuICAgICAqICBcbiAgICAgKiAgZUFQSSA9IEVtaXR0ZXIuQVBJO1xuICAgICAqIFxuICAgICAqIC8vIEluaXRpYWxpemUgdGhlIG1peGluXG4gICAgICogRW1pdHRlci5hc0VtaXR0ZXIuY2FsbCggZ3JlZXRlciApO1xuICAgICAqIGdyZWV0ZXJbIGVBUEkuZGVmaW5lRXZlbnRzIF0oIGdyZWV0aW5ncyApO1xuICAgICAqIGdyZWV0ZXJbIGVBUEkuZGVmaW5lTWF4TGlzdGVuZXJzIF0oIDEwICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnQWFyb24nICk7XG4gICAgICogLy8gSGVsbG8sIEFhcm9uIVxuICAgICAqL1xuICAgIHRoaXNbIEFQSS5kZWZpbmVFdmVudHMgXSA9IGZ1bmN0aW9uKCBiaW5kaW5ncyApe1xuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCB0aGlzWyAkZXZlbnRzIF0gPT09IE9iamVjdC5nZXRQcm90b3R5cGVPZiggdGhpcyApWyAkZXZlbnRzIF0gKXtcbiAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBDb250YWluZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLkBAZGVzdHJveUV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1sgQVBJLmRlc3Ryb3lFdmVudHMgXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiggJGV2ZW50cyBpbiB0aGlzICl7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzWyBBUEkuZGVmaW5lRXZlbnRzIF0gPSB0aGlzWyBBUEkuZGVzdHJveUV2ZW50cyBdID0gbm9vcDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgYmluZGluZ3MgPT09ICdvYmplY3QnICl7XG4gICAgICAgICAgICB0aGlzLm9uKCBiaW5kaW5ncyApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLkBAZGVmaW5lTWF4TGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGRlZmF1bHRNYXhMaXN0ZW5lcnNcbiAgICAgKi9cbiAgICB0aGlzWyBBUEkuZGVmaW5lTWF4TGlzdGVuZXJzIF0gPSBmdW5jdGlvbiggZGVmYXVsdE1heExpc3RlbmVycyApe1xuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIGRlZmF1bHRNYXhMaXN0ZW5lcnMgKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2RlZmF1bHRNYXhMaXN0ZW5lcnMgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3RlY3RlZCBkZWZhdWx0IG1heCBsaXN0ZW5lcnMgcHJvcGVydHlcbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIjQEBkZWZhdWx0TWF4TGlzdGVuZXJzXG4gICAgICAgICAqLyBcbiAgICAgICAgdGhpc1sgJGRlZmF1bHRNYXhMaXN0ZW5lcnMgXSA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogUHJvdGVjdGVkIG1heCBsaXN0ZW5lcnMgcHJvcGVydHlcbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIjQEBtYXhMaXN0ZW5lcnNcbiAgICAgICAgICovIFxuICAgICAgICB0aGlzWyAkbWF4TGlzdGVuZXJzIF0gPSB0aGlzWyAkbWF4TGlzdGVuZXJzIF0gfHwgdW5kZWZpbmVkO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFB1YmxpYyBtYXggbGlzdGVuZXJzIHByb3BlcnR5XG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlciNtYXhMaXN0ZW5lcnNcbiAgICAgICAgICovXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heExpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGdldDogdGhpc1sgQVBJLmdldE1heExpc3RlbmVycyBdLFxuICAgICAgICAgICAgc2V0OiB0aGlzWyBBUEkuc2V0TWF4TGlzdGVuZXJzIF0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIuQEBkZXN0cm95TWF4TGlzdGVuZXJzXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzWyBBUEkuZGVzdHJveU1heExpc3RlbmVycyBdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCAkbWF4TGlzdGVuZXJzIGluIHRoaXMgKXtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1sgJGRlZmF1bHRNYXhMaXN0ZW5lcnMgXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5tYXhMaXN0ZW5lcnM7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRtYXhMaXN0ZW5lcnMgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXNbIEFQSS5kZWZpbmVNYXhMaXN0ZW5lcnMgXSA9IHRoaXNbIEFQSS5kZXN0cm95TWF4TGlzdGVuZXJzIF0gPSBub29wO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5lbWl0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTsgICAgLy8gdHJ1ZVxuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7ICAvLyBmYWxzZVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50IHdpdGggZGF0YTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGEgbmFtZXNwYWNlZCBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiAvLyBUaGlzIGV2ZW50IHdpbGwgbm90IGJlIHRyaWdnZXJlZCBieSBlbWl0dGluZyBcImdyZWV0aW5nOmhlbGxvXCJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvIGFnYWluLCAkeyBuYW1lIH1gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiggdHlwZSwgLi4uZGF0YSApe1xuICAgICAgICByZXR1cm4gdGhpcy50cmlnZ2VyKCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIuZXZlbnRUeXBlc1xuICAgICAqIEByZXR1cm5zIHtBcnJheTxleHRlcm5hbDpzdHJpbmc+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICAgICAqLyBcbiAgICB0aGlzLmV2ZW50VHlwZXMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoIHRoaXNbICRldmVudHMgXSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLmZpcnN0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqL1xuICAgIHRoaXMuZmlyc3QgPSBmdW5jdGlvbiggdHlwZSwgbGlzdGVuZXIgKXtcbiAgICAgICAgb25FdmVudCggdGhpcywgdHlwZSwgbGlzdGVuZXIsIGZhbHNlICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5AQGdldE1heExpc3RlbmVyc1xuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gICAgICovXG4gICAgdGhpc1sgQVBJLmdldE1heExpc3RlbmVycyBdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzWyAkbWF4TGlzdGVuZXJzIF0gIT09ICd1bmRlZmluZWQnID9cbiAgICAgICAgICAgIHRoaXNbICRtYXhMaXN0ZW5lcnMgXSA6XG4gICAgICAgICAgICB0aGlzWyAkZGVmYXVsdE1heExpc3RlbmVycyBdO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLmxpc3RlbmVyQ291bnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2hlbGxvJyApICk7XG4gICAgICogLy8gMVxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdnb29kYnllJyApICk7XG4gICAgICogLy8gMFxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICB2YXIgY291bnQ7XG5cbiAgICAgICAgLy8gRW1wdHlcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBjb3VudCA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyBGdW5jdGlvblxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgY291bnQgPSAxO1xuICAgICAgICBcbiAgICAgICAgLy8gQXJyYXlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvdW50ID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0ubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIubGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoZWxsbyA9IGZ1bmN0aW9uKCl7XG4gICAgICogIGNvbnNvbGUubG9nKCAnSGVsbG8hJyApO1xuICAgICAqIH0sXG4gICAgICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJzKCAnaGVsbG8nIClbIDAgXSA9PT0gaGVsbG8gKTtcbiAgICAgKiAvLyB0cnVlXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJzID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgdmFyIGxpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gWyBoYW5kbGVyIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhICptYW55IHRpbWUqIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLiBBZnRlciB0aGUgbGlzdGVuZXIgaXMgaW52b2tlZCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBgdGltZXNgLCBpdCBpcyByZW1vdmVkLlxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLm1hbnlcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFueSBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnVGVycnknICk7ICAgICAgLy8gMlxuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdTdGV2ZScgKTsgICAgICAvLyAzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgIC8vIDJcbiAgICAgKiAvLyBIZWxsbywgVGVycnkhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgLy8gM1xuICAgICAqLyBcbiAgICB0aGlzLm1hbnkgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRpbWVzO1xuICAgICAgICAgICAgdGltZXMgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiB0aW1lcyAhPT0gJ251bWJlcicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICd0aW1lcyBtdXN0IGJlIGEgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBtYW55TGlzdGVuZXIoKXtcbiAgICAgICAgICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgICAgIHJldHVybiAtLXRpbWVzID09PSAwO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBtYW55TGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLnVudGlsKCB0eXBlLCBtYW55TGlzdGVuZXIgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGBsaXN0ZW5lcmAgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gaXQgaXMgYXNzdW1lZCB0aGUgYGxpc3RlbmVyYCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIElmIGFueSBzaW5nbGUgbGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgbXVsdGlwbGUgdGltZXMgZm9yIHRoZSBzcGVjaWZpZWQgYHR5cGVgLCB0aGVuIGBlbWl0dGVyLm9mZigpYCBtdXN0IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byByZW1vdmUgZWFjaCBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIub2ZmXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvZmZcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGFueSBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGdyZWV0KCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRpbmdzLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdKZWZmJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBoZWxsbyggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKi8gXG4gICAgdGhpcy5vZmYgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgdmFyIGhhbmRsZXI7XG4gICAgICAgIFxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCBoYW5kbGVyID09PSBsaXN0ZW5lciB8fCAoIHR5cGVvZiBoYW5kbGVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIGlmKCB0aGlzWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICAgICAgZW1pdEV2ZW50KCB0aGlzLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSBoYW5kbGVyLmxlbmd0aDsgaS0tID4gMDsgKXtcbiAgICAgICAgICAgICAgICBpZiggaGFuZGxlclsgaSBdID09PSBsaXN0ZW5lciB8fCAoIGhhbmRsZXJbIGkgXS5saXN0ZW5lciAmJiBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAgICAgaWYoIGluZGV4IDwgMCApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggaGFuZGxlci5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcGxpY2VMaXN0KCBoYW5kbGVyLCBpbmRleCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgICAgIGVtaXRFdmVudCggdGhpcywgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIub25cbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuZXIgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub24gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50c1sgMCBdIHx8ICRldmVyeSxcbiAgICAgICAgICAgIGxpc3RlbmVyID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUeXBlIG5vdCBwcm92aWRlZCwgZmFsbCBiYWNrIHRvIFwiJGV2ZXJ5XCJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3Qgb2YgZXZlbnQgYmluZGluZ3NcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICl7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggYmluZGluZ3MgKSxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR5cGVJbmRleCA9IDAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVMZW5ndGggPSB0eXBlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIsIGhhbmRsZXJJbmRleCwgaGFuZGxlckxlbmd0aDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IoIDsgdHlwZUluZGV4IDwgdHlwZUxlbmd0aDsgdHlwZUluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IHR5cGVzWyB0eXBlSW5kZXggXTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlciA9IGJpbmRpbmdzWyB0eXBlIF07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBMaXN0IG9mIGxpc3RlbmVyc1xuICAgICAgICAgICAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVySW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKCA7IGhhbmRsZXJJbmRleCA8IGhhbmRsZXJMZW5ndGg7IGhhbmRsZXJJbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FdmVudCggdGhpcywgdHlwZSwgaGFuZGxlclsgaGFuZGxlckluZGV4IF0sIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXZlbnQoIHRoaXMsIHR5cGUsIGhhbmRsZXIsIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIG9uRXZlbnQoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIub25jZVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gb25jZSB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub25jZSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLm1hbnkoIHR5cGUsIDEsIGxpc3RlbmVyICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLkBAc2V0TWF4TGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKi9cbiAgICB0aGlzWyBBUEkuc2V0TWF4TGlzdGVuZXJzIF0gPSBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggbWF4ICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdtYXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpc1sgJG1heExpc3RlbmVycyBdID0gbWF4O1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGBkYXRhYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLnRyaWdnZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2hlbGxvJywgWyAnV29ybGQnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoaScsIFsgJ01hcmsnIF0gKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhlbGxvJywgWyAnSmVmZicgXSApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy50cmlnZ2VyID0gZnVuY3Rpb24oIHR5cGUsIGRhdGEgPSBbXSApe1xuICAgICAgICB2YXIgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgICAgIC8vIElmIHR5cGUgaXMgbm90IGEgc3RyaW5nLCBpbmRleCB3aWxsIGJlIGZhbHNlXG4gICAgICAgICAgICBpbmRleCA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIE5hbWVzcGFjZWQgZXZlbnQsIGUuZy4gRW1pdCBcImZvbzpiYXI6cXV4XCIsIHRoZW4gXCJmb286YmFyXCJcbiAgICAgICAgd2hpbGUoIGluZGV4ID4gMCApe1xuICAgICAgICAgICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCB0aGlzLCB0eXBlLCBkYXRhLCBmYWxzZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgICAgICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoIDAsIGluZGV4ICk7XG4gICAgICAgICAgICBpbmRleCA9IHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBFbWl0IHNpbmdsZSBldmVudCBvciB0aGUgbmFtZXNwYWNlZCBldmVudCByb290LCBlLmcuIFwiZm9vXCIsIFwiOmJhclwiLCBTeW1ib2woIFwiQEBxdXhcIiApXG4gICAgICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggdGhpcywgdHlwZSwgZGF0YSwgdHJ1ZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZXhlY3V0ZWQ7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkICp1bnRpbCogdGhlIGBsaXN0ZW5lcmAgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci51bnRpbFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdUZXJyeSc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScsICdUZXJyeScgKTtcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnQWFyb24nICk7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCAnaGVsbG8nLCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1dvcmxkJztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnTWFyaycgKTtcbiAgICAgKi9cbiAgICB0aGlzLnVudGlsID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gdW50aWxMaXN0ZW5lcigpe1xuICAgICAgICAgICAgdmFyIGRvbmUgPSBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgICAgICBpZiggZG9uZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmKCB0eXBlLCB1bnRpbExpc3RlbmVyICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFRPRE8gQ2hlY2sgYmV5b25kIGp1c3Qgb25lIGxldmVsIG9mIGxpc3RlbmVyIHJlZmVyZW5jZXNcbiAgICAgICAgdW50aWxMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyLmxpc3RlbmVyIHx8IGxpc3RlbmVyO1xuICAgICAgICBcbiAgICAgICAgb25FdmVudCggdGhpcywgdHlwZSwgdW50aWxMaXN0ZW5lciwgZmFsc2UgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBlbWl0dGVyLiBJZiBgYmluZGluZ3NgIGFyZSBwcm92aWRlZCB0aGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSBwYXNzZWQgaW50byBgb24oKWAgb25jZSBjb25zdHJ1Y3Rpb24gaXMgY29tcGxldGUuXG4gKiBAY2xhc3MgRW1pdHRlclxuICogQGNsYXNzZGVzYyBBbiBvYmplY3QgdGhhdCBlbWl0cyBuYW1lZCBldmVudHMgd2hpY2ggY2F1c2UgZnVuY3Rpb25zIHRvIGJlIGV4ZWN1dGVkLlxuICogQGV4dGVuZHMgbnVsbFxuICogQG1peGVzIEVtaXR0ZXIuYXNFbWl0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gW2JpbmRpbmdzXSBBIG1hcHBpbmcgb2YgZXZlbnQgdHlwZXMgdG8gZXZlbnQgbGlzdGVuZXJzLlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL2xpYi9ldmVudHMuanN9XG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5Vc2luZyBFbWl0dGVyIGRpcmVjdGx5PC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkluaGVyaXRpbmcgZnJvbSBFbWl0dGVyPC9jYXB0aW9uPlxuICogZnVuY3Rpb24gR3JlZXRlcigpe1xuICogIEVtaXR0ZXIuY2FsbCggdGhpcyApO1xuICogXG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogfVxuICogR3JlZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuICogXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gKiAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiB9O1xuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5OYW1lc3BhY2VkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gKiAvLyBIaSwgTWFyayFcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0aW5ncyA9IHtcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAqICB9LFxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XG4gKiBcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICogLy8gSGVsbG8sIEFhcm9uIVxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgIC8vIDJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEhlbGxvLCBUZXJyeSFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlciggYmluZGluZ3MgKXtcbiAgIHRoaXNbIEFQSS5kZWZpbmVNYXhMaXN0ZW5lcnMgXSggRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzICk7XG4gICB0aGlzWyBBUEkuZGVmaW5lRXZlbnRzIF0oIGJpbmRpbmdzICk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XG4gICAgQVBJOiB7XG4gICAgICAgIHZhbHVlOiBBUEksXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgYXNFbWl0dGVyOiB7XG4gICAgICAgIHZhbHVlOiBhc0VtaXR0ZXIsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZGVmYXVsdCBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBlbWl0dGVycy4gVXNlIGBlbWl0dGVyLm1heExpc3RlbmVyc2AgdG8gc2V0IHRoZSBtYXhpbXVtIG9uIGEgcGVyLWluc3RhbmNlIGJhc2lzLlxuICAgICAqIFxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPTEwXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlcjEgPSBuZXcgRW1pdHRlcigpLFxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGFsZXJ0KCAnSGkhJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICogXG4gICAgICovXG4gICAgZGVmYXVsdE1heExpc3RlbmVyczoge1xuICAgICAgICB2YWx1ZTogMTAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3ltYm9sIHVzZWQgdG8gbGlzdGVuIGZvciBldmVudHMgb2YgYW55IGB0eXBlYC4gRm9yIF9tb3N0XyBtZXRob2RzLCB3aGVuIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGlzIGlzIHRoZSBkZWZhdWx0LlxuICAgICAqIFxuICAgICAqIFVzaW5nIGBFbWl0dGVyLmV2ZXJ5YCBpcyB0eXBpY2FsbHkgbm90IG5lY2Vzc2FyeS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzeW1ib2x9IEVtaXR0ZXIuZXZlcnlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIEVtaXR0ZXIuZXZlcnksICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKi9cbiAgICBldmVyeToge1xuICAgICAgICB2YWx1ZTogJGV2ZXJ5LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgKkVtaXR0ZXIuanMqLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gRW1pdHRlci52ZXJzaW9uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci52ZXJzaW9uICk7XG4gICAgICogLy8gMi4wLjBcbiAgICAgKi9cbiAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHZhbHVlOiAnMi4wLjAnLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfVxufSApO1xuXG5FbWl0dGVyLnByb3RvdHlwZSA9IG5ldyBDb250YWluZXIoKTtcblxuRW1pdHRlci5wcm90b3R5cGVbIFN5bWJvbC50b1N0cmluZ1RhZyBdID0gJ0VtaXR0ZXInO1xuXG5FbWl0dGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVtaXR0ZXI7XG5cbkVtaXR0ZXIuYXNFbWl0dGVyLmNhbGwoIEVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCB0cnVlICk7XG4gICAgdGhpc1sgQVBJLmRlc3Ryb3lFdmVudHMgXSgpO1xuICAgIHRoaXNbIEFQSS5kZXN0cm95TWF4TGlzdGVuZXJzIF0oKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSB0aGlzLmNsZWFyID0gdGhpcy5lbWl0ID0gdGhpcy5maXJzdCA9IHRoaXMubGlzdGVuZXJDb3VudCA9IHRoaXMubGlzdGVuZXJzID0gdGhpcy5tYW55ID0gdGhpcy5vZmYgPSB0aGlzLm9uID0gdGhpcy5vbmNlID0gdGhpcy50cmlnZ2VyID0gdGhpcy51bnRpbCA9IG5vb3A7XG4gICAgdGhpcy50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gJ2Rlc3Ryb3llZCc7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQHJldHVybnMge2V4dGVybmFsOk9iamVjdH0gQW4gcGxhaW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xuICogLy8geyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9XG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xuICogLy8gXCJkZXN0cm95ZWRcIlxuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIHZhciBqc29uID0gbmV3IENvbnRhaW5lcigpLFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCB0aGlzWyAkZXZlbnRzIF0gKSxcbiAgICAgICAgbGVuZ3RoID0gdHlwZXMubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIHR5cGU7XG4gICAgXG4gICAganNvbi5tYXhMaXN0ZW5lcnMgPSB0aGlzLm1heExpc3RlbmVycztcbiAgICBqc29uLmxpc3RlbmVyQ291bnQgPSBuZXcgQ29udGFpbmVyKCk7XG4gICAgXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciBcImRlc3Ryb3llZFwiJ1xuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGAkeyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgfSAkeyBKU09OLnN0cmluZ2lmeSggdGhpcy50b0pTT04oKSApIH1gLnRyaW0oKTtcbn07Il0sImZpbGUiOiJlbWl0dGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=