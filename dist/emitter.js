'use strict';

if( typeof Symbol !== 'function' ){
    throw new Error( 'Emitter requires Symbol to run.' );
}

const
    events = Symbol( '@@events' ),
    every = Symbol( '@@every' ),
    maxListeners = Symbol( '@@maxListeners' );

function onEvent( emitter, type, listener ){
    if( typeof listener !== 'function' ){
        throw new TypeError( 'listener must be a function' );
    }
    
    if( !emitter[ events ] ){
        emitter[ events ] = Object.create( null );
    } else if( emitter[ events ][ ':on' ] ){
        fireEvent( emitter, ':on', [ type, typeof listener.listener === 'function' ? listener.listener : listener ] );
    }
    
    // Single listener
    if( !emitter[ events ][ type ] ){
        emitter[ events ][ type ] = listener;
    
    // Multiple listeners
    } else if( Array.isArray( emitter[ events ][ type ] ) ){
        emitter[ events ][ type ].push( listener );
    
    // Transition from single to multiple listeners
    } else {
        emitter[ events ][ type ] = [ emitter[ events ][ type ], listener ];
    }
    
    if( !emitter[ events ][ type ].warned ){
        var max = emitter.maxListeners;
        
        if( max && max > 0 && emitter[ events ][ type ].length > max ){
            fireEvent( emitter, ':maxListeners', [ type, listener ] );
            emitter[ events ][ type ].warned = true;
        }
    }
}

function cloneList( list, index ){
    var copy = new Array( index );
    
    while( index-- ){
        copy[ index ] = list[ index ];
    }
    
    return copy;
}

function executeEmpty( handler, isFunction, emitter ){
    if( isFunction ){
        handler.call( emitter );
    } else {
        let length = handler.length,
            listeners = cloneList( handler, length );
        
        for( let i = 0; i < length; i += 1 ){
            listeners[ i ].call( emitter );
        }
    }
}

function executeOne( handler, isFunction, emitter, arg1 ){
    if( isFunction ){
        handler.call( emitter, arg1 );
    } else {
        let length = handler.length,
            listeners = cloneList( handler, length );
        
        for( let i = 0; i < length; i += 1 ){
            listeners[ i ].call( emitter, arg1 );
        }
    }
}

function executeTwo( handler, isFunction, emitter, arg1, arg2 ){
    if( isFunction ){
        handler.call( emitter, arg1, arg2 );
    } else {
        let length = handler.length,
            listeners = cloneList( handler, length );
        
        for( let i = 0; i < length; i += 1 ){
            listeners[ i ].call( emitter, arg1, arg2 );
        }
    }
}

function executeThree( handler, isFunction, emitter, arg1, arg2, arg3 ){
    if( isFunction ){
        handler.call( emitter, arg1, arg2, arg3 );
    } else {
        let length = handler.length,
            listeners = cloneList( handler, length );
        
        for( let i = 0; i < length; i += 1 ){
            listeners[ i ].call( emitter, arg1, arg2, arg3 );
        }
    }
}

function executeMany( handler, isFunction, emitter, args ){
    if( isFunction ){
        handler.apply( emitter, args );
    } else {
        let length = handler.length,
            listeners = cloneList( handler, length );
        
        for( let i = 0; i < length; i += 1 ){
            listeners[ i ].apply( emitter, args );
        }
    }
}

function executeListener( listener, data = [], scope = this ){
    var isFunction = typeof listener === 'function';
    
    switch( data.length ){
        case 0:
            executeEmpty( listener, isFunction, scope );
            break;
        case 1:
            executeOne( listener, isFunction, scope, data[ 0 ] );
            break;
        case 2:
            executeTwo( listener, isFunction, scope, data[ 0 ], data[ 1 ] );
            break;
        case 3:
            executeThree( listener, isFunction, scope, data[ 0 ], data[ 1 ], data[ 2 ] );
            break;
        default:
            executeMany( listener, isFunction, scope, data );
            break;
    }
}

function spliceList( list, index ){
    for( var i = index, j = i + 1, length = list.length; j < length; i += 1, j += 1 ){
        list[ i ] = list[ j ];
    }
    list.pop();
}

function fireEvent( emitter, type, data ){
    var executed = false,
        listener;
    
    if( !emitter[ events ] ){
        emitter[ events ] = Object.create( null );
    }
    
    if( type === 'error' && !emitter[ events ].error ){
        var error = data[ 0 ];
        
        if( error instanceof Error ){
            throw error;
        } else {
            throw Error( 'Uncaught, unspecified "error" event.' );
        }
        
        return executed;
    }
    
    // Execute listeners for the given type of event
    listener = emitter[ events ][ type ];
    if( typeof listener !== 'undefined' ){
        executeListener( listener, data, emitter );
        executed = true;
    }
    
    // Execute listeners listening for all types of events
    listener = emitter[ events ][ every ];
    if( typeof listener !== 'undefined' ){
        executeListener( listener, data, emitter );
        executed = true;
    }
    
    return executed;
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
    if( !this[ events ] || this[ events ] === Object.getPrototypeOf( this )[ events ] ){
        this[ events ] = Object.create( null );
    }
    
    this[ maxListeners ] = this[ maxListeners ] || undefined;
    
    Object.defineProperty( this, 'maxListeners', {
        get: function(){
            return typeof this[ maxListeners ] !== 'undefined' ?
                this[ maxListeners ] :
                Emitter.defaultMaxListeners;
        },
        set: function( max ){
            if( typeof max !== 'number' || max < 0 || isNaN( max ) ){
                throw TypeError( 'max must be a positive number' );
            }
            
            this[ maxListeners ] = max;
        },
        configurable: true,
        enumerable: false
    } );
    
    if( typeof bindings === 'object' ){
        this.on( bindings );
    }
}

Emitter.listenerCount = function( emitter, type ){
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
};

Object.defineProperties( Emitter, {
    defaultMaxListeners: {
        value: 10,
        configurable: true,
        enumerable: false,
        writable: true
    },
    every: {
        value: every,
        configurable: true,
        enumerable: false,
        writable: false
    }
} );

Emitter.prototype = Object.create( null );

Emitter.prototype[ Symbol.toStringTag ] = 'Emitter';

Emitter.prototype.constructor = Emitter;

Emitter.prototype.clear = function( type ){
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
    
    if( arguments.length === 0 ){
        // Clear all listeners except "off"
        for( let eventType in this[ events ] ){
            if( eventType === ':off' ){
                continue;
            }
            
            this.clear( eventType );
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
        handler.forEach( listener => this.off( type, listener ) );
    }
    
    delete this[ events ][ type ];
    
    return this;
};

Emitter.prototype.destroy = function(){
    fireEvent( this, ':destroy' );
    this.clear();
    delete this[ events ];
    delete this[ maxListeners ];
    delete this.maxListeners;
    this.clear = this.destroy = this.emit = this.emitEvent = this.listeners = this.many = this.off = this.on = this.once = function(){};
};

Emitter.prototype.emit = function( type, ...data ){
    return this.emitEvent( type, data );
};

Emitter.prototype.emitEvent = function( type, data = [] ){
    var executed = false,
        // If type is not a string, index will be false
        index = typeof type === 'string' && type.lastIndexOf( ':' );
    
    // Single event, e.g. "foo", ":bar", Symbol( "@@qux" )
    if( typeof index !== 'number' || index === 0 || index === -1 ){
        executed = fireEvent( this, type, data );
        
    // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar", then "foo"
    } else {
        let namespacedType = type;
        
        // Optimize under the assumption that most namespaces will only be one level deep, e.g. "foo:bar"
        executed = fireEvent( this, namespacedType, data ) || executed;
        namespacedType = namespacedType.substring( 0, index );
        index = namespacedType.lastIndexOf( ':' );
        
        // Longer namespaces will fall into the loop, e.g. "foo:bar:qux"
        while( index !== -1 ){
            executed = ( namespacedType && fireEvent( this, namespacedType, data ) ) || executed;
            namespacedType = namespacedType.substring( 0, index );
            index = namespacedType.lastIndexOf( ':' );
        }
        
        // Emit namespace root, e.g. "foo"
        executed = ( namespacedType && fireEvent( this, namespacedType, data ) ) || executed;
    }
    
    return executed;
};

Emitter.prototype.listeners = function( type ){
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
            listeners = cloneList( handler, handler.length );
        }
    }
    
    return listeners;
};

Emitter.prototype.many = function( type = every, times, listener ){
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

Emitter.prototype.off = function( type = every, listener ){
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
            fireEvent( this, ':off', [ type, listener ] );
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
            fireEvent( this, ':off', [ type, listener ] );
        }
    }
    
    return this;
};

Emitter.prototype.on = function( type = every, listener ){
    if( typeof listener === 'undefined' ){
        
        // Type not provided, fall back to "every"
        if( typeof type === 'function' ){
            listener = type;
            type = every;
        
        // Plain object of event bindings
        } else if( typeof type === 'object' ){
            let listeners;
            
            for( let eventType in type ){
                listeners = type[ eventType ];
                
                if( Array.isArray( listeners ) ){
                    for( let i = 0, length = listeners.length; i < length; i += 1 ){
                        onEvent( this, eventType, listeners[ i ] );
                    }   
                } else {
                    onEvent( this, eventType, listeners );
                }
            }
            
            return this;
        }
    }
    
    onEvent( this, type, listener );
    
    return this;
};

Emitter.prototype.once = function( type = every, listener ){
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