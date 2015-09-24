'use strict';

const
    // Reference to the global scope
    root = Function( 'return this' )(),

    Symbol = 'Symbol' in root ?
        root.Symbol :
        // Shim the Symbol API
        ( function(){
            function Symbol( description ){
                if( typeof description !== 'string' ){
                    throw new TypeError( 'description must be a string' );    
                }
                
                return description;
            }
            
            Symbol.toStringTag = Symbol( '@@toStringTag' );
            
            return Symbol;
        }() ),
    
    noop = function(){},
    
    events = Symbol( '@@events' ),
    every = Symbol( '@@every' ),
    maxListeners = Symbol( '@@maxListeners' );

// Many of these functions are broken out from the prototype for the sake of optimization. The functions on the protoytype
// take a variable number of arguments and can be deoptimized as a result. These functions have a fixed number of arguments
// and therefore do not get deoptimized.

/**
 * @function emitErrors
 * @param {Emitter} emitter
 * @param {Array<Error>} errors
 */
function emitErrors( emitter, errors ){
    for( var i = 0, length = errors.length; i < length; i += 1 ){
        emitEvent( emitter, 'error', [ errors[ i ] ] );
    }
}

/**
 * @function emitEvent
 * @param {Emitter} emitter
 * @param {*} type
 * @param {Array} data
 * @param {Boolean} emitEvery
 * @returns {Boolean} Whether or not a listener for the given event type was executed.
 * @throws {Error} If `type` is `error` and no listeners are subscribed.
 */
function emitEvent( emitter, type, data, emitEvery ){
    var _events = emitter[ events ],
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
        listener = _events[ every ];
        if( typeof listener !== 'undefined' ){
            executeListener( listener, data, emitter );
            executed = true;
        }
    }
    
    return executed;
}

function executeEmpty( handler, isFunction, emitter ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter );
        } catch( error ){
            errors.push( error );
        }
    } else {
        let length = handler.length,
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

function executeOne( handler, isFunction, emitter, arg1 ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        let length = handler.length,
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

function executeTwo( handler, isFunction, emitter, arg1, arg2 ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1, arg2 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        let length = handler.length,
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

function executeThree( handler, isFunction, emitter, arg1, arg2, arg3 ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.call( emitter, arg1, arg2, arg3 );
        } catch( error ){
            errors.push( error );
        }
    } else {
        let length = handler.length,
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

function executeMany( handler, isFunction, emitter, args ){
    var errors = [];
    
    if( isFunction ){
        try {
            handler.apply( emitter, args );
        } catch( error ){
            errors.push( error );
        }
    } else {
        let length = handler.length,
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
 * @function executeListener
 * @param {Array|Function} listener
 * @param {Array} data
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
 * @function isPositiveNumber
 * @param {*} number
 * @returns {Boolean} Whether or not the value is a positive number.
 */
function isPositiveNumber( number ){
    return typeof number === 'number' && number >= 0 && !isNaN( number );
}

/**
 * @function listenerCount
 * @param {Emitter} emitter
 * @param {*} type
 * @returns {Number} The number of listeners for that event type within the given emitter.
 */ 
function listenerCount( emitter, type ){
    var count;

    // Empty
    if( !emitter[ events ] || !emitter[ events ][ type ] ){
        count = 0;
    
    // Function
    } else if( typeof emitter[ events ][ type ] === 'function' ){
        count = 1;
    
    // Array
    } else {
        count = emitter[ events ][ type ].length;
    }
    
    return count;
}

/**
 * @function onEvent
 * @param {Emitter} emitter
 * @param {*} type type
 * @param {Function} listener
 */
function onEvent( emitter, type, listener ){
    if( typeof listener !== 'function' ){
        throw new TypeError( 'listener must be a function' );
    }
    
    var _events = emitter[ events ];
    
    if( _events[ ':on' ] ){
        emitEvent( emitter, ':on', [ type, typeof listener.listener === 'function' ? listener.listener : listener ], true );
        
        // Emitting "on" may have changed the registry.
        _events[ ':on' ] = emitter[ events ][ ':on' ];
    }
    
    // Single listener
    if( !_events[ type ] ){
        _events[ type ] = listener;
    
    // Multiple listeners
    } else if( Array.isArray( _events[ type ] ) ){
        _events[ type ].push( listener );
    
    // Transition from single to multiple listeners
    } else {
        _events[ type ] = [ _events[ type ], listener ];
    }
    
    // Track warnings if max listeners is available
    if( 'maxListeners' in emitter && !_events[ type ].warned ){
        let max = emitter.maxListeners;
        
        if( max && max > 0 && _events[ type ].length > max ){
            emitEvent( emitter, ':maxListeners', [ type, listener ], true );
            
            // Emitting "maxListeners" may have changed the registry.
            _events[ ':maxListeners' ] = emitter[ events ][ ':maxListeners' ];
            
            _events[ type ].warned = true;
        }
    }
    
    emitter[ events ] = _events;
}

/**
 * Faster than Array.prototype.splice
 * @function spliceList
 * @param {Array} list
 * @param {Number} index
 */ 
function spliceList( list, index ){
    for( var i = index, j = i + 1, length = list.length; j < length; i += 1, j += 1 ){
        list[ i ] = list[ j ];
    }
    
    list.pop();
}

/**
 * @mixin asEmitter
 * @example
 * // Simple events
 * var greeter = Object.create( null );
 * asEmitter.call( greeter );
 * greeter.defineEvents();
 * greeter.defineMaxListeners( 10 );
 * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'World' );
 * // Hello, World!
 * @example
 * // Namespaced events
 * var greeter = Object.create( null );
 * asEmitter.call( greeter );
 * greeter.defineEvents();
 * greeter.defineMaxListeners( 10 );
 * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
 * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
 * greeter.emit( 'greeting:hi', 'Mark' );
 * greeter.emit( 'greeting:hello', 'Jeff' );
 * // Hi, Mark!
 * // Mark was greeted.
 * // Hello, Jeff!
 * // Jeff was greeted.
 * @example
 * // Predefined events
 * var greetings = {
 *  hello: function( name ){ console.log( `Hello, ${name}!` ),
 *  hi: function( name ){ console.log( `Hi, ${name}!` )
 * };
 * var greeter = Object.create( null );
 * asEmitter.call( greeter );
 * greeter.defineEvents( greetings );
 * greeter.defineMaxListeners( 10 );
 * greeter.emit( 'hello', 'Aaron' );
 * // Hello, Aaron!
 * @example
 * One-time events
 * var greeter = Object.create( null );
 * asEmitter.call( greeter );
 * greeter.defineEvents();
 * greeter.defineMaxListeners( 10 );
 * greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'Jeff' );
 * greeter.emit( 'hello', 'Terry' );
 * // Hello, Jeff!
 * @example
 * Many-time events
 * var greeter = Object.create( null );
 * asEmitter.call( greeter );
 * greeter.defineEvents();
 * greeter.defineMaxListeners( 10 );
 * greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'Jeff' );     // 1
 * greeter.emit( 'hello', 'Terry' );    // 2
 * greeter.emit( 'hello', 'Steve' );    // 3
 * // Hello, Jeff!
 * // Hello, Terry!
 */
function asEmitter(){
    this.clear = function( type ){
        var handler;
        
        // No Events
        if( !this[ events ] ){
            return this;
        }
        
        // With no "off" listeners, clearing can be simplified
        if( !this[ events ][ ':off' ] ){
            if( arguments.length === 0 ){
                this[ events ] = Object.create( null );
            } else if( this[ events ][ type ] ){
                delete this[ events ][ type ];
            }
            
            return this;
        }
        
        // Clear all listeners
        if( arguments.length === 0 ){
            let types = Object.keys( this[ events ] );
            
            // Avoid removing "off" listeners until all other types have been removed
            for( let i = 0, length = types.length; i < length; i += 1 ){
                if( types[ i ] === ':off' ){
                    continue;
                }
                
                this.clear( types[ i ] );
            }
            
            // Manually clear "off"
            this.clear( ':off' );
            
            this[ events ] = Object.create( null );
            
            return this;
        }
        
        handler = this[ events ][ type ];
        
        if( typeof handler === 'function' ){
            this.off( type, handler );
        } else if( Array.isArray( handler ) ){
            let index = handler.length;
            
            while( index-- ){
                this.off( type, handler[ index ] );
            }
        }
        
        delete this[ events ][ type ];
        
        return this;
    };
    
    this.defineEvents = function( bindings ){
        if( !this[ events ] || this[ events ] === Object.getPrototypeOf( this )[ events ] ){
            this[ events ] = Object.create( null );
        }
        
        this.destroyEvents = function(){
            if( events in this ){
                this.clear();
                delete this[ events ];
            }
            this.defineEvents = this.destroyEvents = noop;
        };
        
        if( typeof bindings === 'object' ){
            this.on( bindings );
        }
    };
    
    this.defineMaxListeners = function( defaultMaxListeners ){
        if( !isPositiveNumber( defaultMaxListeners ) ){
            throw new TypeError( 'defaultMaxListeners must be a positive number' );
        }
        
        this[ maxListeners ] = this[ maxListeners ] || undefined;
        
        Object.defineProperty( this, 'maxListeners', {
            get: function(){
                return typeof this[ maxListeners ] !== 'undefined' ?
                    this[ maxListeners ] :
                    defaultMaxListeners;
            },
            set: function( max ){
                if( !isPositiveNumber( max ) ){
                    throw new TypeError( 'max must be a positive number' );
                }
                
                this[ maxListeners ] = max;
            },
            configurable: true,
            enumerable: false
        } );
        
        this.destroyMaxListeners = function(){
            if( maxListeners in this ){
                delete this.maxListeners;
                delete this[ maxListeners ];
            }
            this.defineMaxListeners = this.destroyMaxListeners = noop;
        };
    };
    
    this.emit = function( type, ...data ){
        return this.trigger( type, data );
    };
    
    this.listenerCount = function( type ){
        return listenerCount( this, type );
    };
    
    this.listeners = function( type ){
        var listeners;
        
        if( !this[ events ] || !this[ events ][ type ] ){
            listeners = [];
        } else {
            let handler = this[ events ][ type ];
            
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
    
    this.many = function( type = every, times, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'number' && typeof times === 'function' && typeof listener === 'undefined' ){
            listener = times;
            times = type;
            type = every;
        }
        
        if( typeof times !== 'number' ){
            throw new TypeError( 'times must be a number' );
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        function manyListener(){
            if( --times === 0 ){
                this.off( type, manyListener );
            }
            listener.apply( this, arguments );
        }
        
        manyListener.listener = listener;
        
        onEvent( this, type, manyListener );
        
        return this;
    };
    
    this.off = function( type = every, listener ){
        var handler;
        
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = every;
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        if( !this[ events ] || !this[ events ][ type ] ){
            return this;
        }
        
        handler = this[ events ][ type ];
        
        if( handler === listener || ( typeof handler.listener === 'function' && handler.listener === listener ) ){
            delete this[ events ][ type ];
            if( this[ events ][ ':off' ] ){
                emitEvent( this, ':off', [ type, listener ], true );
            }
        } else if( Array.isArray( handler ) ){
            let index = -1;
            
            for( let i = handler.length; i-- > 0; ){
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
                delete this[ events ][ type ];
            } else {
                spliceList( handler, index );
            }
            
            if( this[ events ][ ':off' ] ){
                emitEvent( this, ':off', [ type, listener ], true );
            }
        }
        
        return this;
    };
    
    this.on = function(){
        var type = arguments[ 0 ] || every,
            listener = arguments[ 1 ];
        
        if( typeof listener === 'undefined' ){
            
            // Type not provided, fall back to "every"
            if( typeof type === 'function' ){
                listener = type;
                type = every;
            
            // Plain object of event bindings
            } else if( typeof type === 'object' ){
                let bindings = type,
                    types = Object.keys( bindings ),
                    
                    typeIndex = 0,
                    typeLength = types.length,
                
                    handler;
                
                for( ; typeIndex < typeLength; typeIndex += 1 ){
                    type = types[ typeIndex ];
                    handler = bindings[ type ];
                    
                    // List of listeners
                    if( Array.isArray( handler ) ){
                        let handlerIndex = 0,
                            handlerLength = handler.length;
                            
                        for( ; handlerIndex < handlerLength; handlerIndex += 1 ){
                            onEvent( this, type, handler[ handlerIndex ] );
                        }
                    
                    // Single listener
                    } else {
                        onEvent( this, type, handler );
                    }
                }
                
                return this;
            }
        }
        
        onEvent( this, type, listener );
        
        return this;
    };
    
    this.once = function( type = every, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = every;
        }
        
        if( typeof listener !== 'function' ){
            throw new TypeError( 'listener must be a function' );
        }
        
        return this.many( type, 1, listener );
    };
    
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
    
    this.until = function( type = every, listener ){
        // Shift arguments if type is not provided
        if( typeof type === 'function' && typeof listener === 'undefined' ){
            listener = type;
            type = every;
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
        
        untilListener.listener = listener;
        
        onEvent( this, type, untilListener );
        
        return this;
    };
}

/**
 * @class Emitter
 * @extends null
 * @param {Object} [bindings]
 * @see {@link https://github.com/joyent/node/blob/master/lib/events.js}
 * @see {@link https://github.com/nodejs/io.js/blob/master/lib/events.js}
 * @example
 * // Simple events
 * var greeter = new Emitter();
 * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'World' );
 * // Hello, World!
 * @example
 * // Namespaced events
 * var greeter = new Emitter();
 * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
 * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
 * greeter.emit( 'greeting:hi', 'Mark' );
 * greeter.emit( 'greeting:hello', 'Jeff' );
 * // Hi, Mark!
 * // Mark was greeted.
 * // Hello, Jeff!
 * // Jeff was greeted.
 * @example
 * // Predefined events
 * var greetings = {
 *  hello: function( name ){ console.log( `Hello, ${name}!` ),
 *  hi: function( name ){ console.log( `Hi, ${name}!` )
 * };
 * var greeter = new Emitter( greetings );
 * greeter.emit( 'hello', 'Aaron' );
 * // Hello, Aaron!
 * @example
 * One-time events
 * var greeter = new Emitter();
 * greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'Jeff' );
 * greeter.emit( 'hello', 'Terry' );
 * // Hello, Jeff!
 * @example
 * Many-time events
 * var greeter = new Emitter();
 * greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
 * greeter.emit( 'hello', 'Jeff' );     // 1
 * greeter.emit( 'hello', 'Terry' );    // 2
 * greeter.emit( 'hello', 'Steve' );    // 3
 * // Hello, Jeff!
 * // Hello, Terry!
 */
export default function Emitter( bindings ){
   this.defineMaxListeners( Emitter.defaultMaxListeners );
   this.defineEvents( bindings );
}

Object.defineProperties( Emitter, {
    asEmitter: {
        value: asEmitter,
        configurable: true,
        enumerable: false,
        writable: false
    },
    // By default Emitter will emit a ":maxListeners" event if more than 10
    // listeners are added to it.
    defaultMaxListeners: {
        value: 10,
        configurable: true,
        enumerable: false,
        writable: true
    },
    // The event type used to listen to all types of events.
    every: {
        value: every,
        configurable: true,
        enumerable: false,
        writable: false
    },
    listenerCount: {
        value: listenerCount,
        configurable: true,
        enumerable: false,
        writable: false
    },
    version: {
        value: '1.2.1',
        configurable: false,
        enumerable: false,
        writable: false
    }
} );

Emitter.prototype = Object.create( null );

Emitter.prototype[ Symbol.toStringTag ] = 'Emitter';

Emitter.prototype.constructor = Emitter;

asEmitter.call( Emitter.prototype );

Emitter.prototype.destroy = function(){
    emitEvent( this, ':destroy', [], true );
    this.destroyEvents();
    this.destroyMaxListeners();
    this.clear = this.destroy = this.emit = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.trigger = this.until = noop;
};
