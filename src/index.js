'use strict';

const
    events = Symbol( '@@events' ),
    every = Symbol( '@@every' ),
    maxListeners = Symbol( '@@maxListeners' );

function executeListener( listener, data = [], scope = this ){
    if( typeof listener === 'function' ){
        switch( data.length ){
            case 0:
                listener.call( scope );
                break;
            case 1:
                listener.call( scope, data[ 0 ] );
                break;
            case 2:
                listener.call( scope, data[ 0 ], data[ 1 ] );
                break;
            default:
                listener.apply( scope, data );
        }
    } else if( Array.isArray( listener ) ){
        let listeners;
        
        listeners = listener.slice();
        
        for( let i = 0, length = listeners.length; i < length; i++ ){
            listeners[ i ].apply( scope, data );
        }
    }
}

/**
 * @class Emitter
 * @extends null
 * @param {Object} [bindings]
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
    this.defineEvents();
    
    this[ maxListeners ] = this[ maxListeners ] || undefined;
    
    if( typeof bindings === 'object' ){
        this.on( bindings );
    }
    
    this.emit( ':construct' );
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
        enumerable: true,
        writable: true
    },
    every: {
        value: every,
        configurable: false,
        enumerable: true,
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
    
    // With no "off" lifecycle listeners, clearing can be simplified
    if( !this[ events ][ ':off' ] ){
        if( arguments.length === 0 ){
            this[ events ] = Object.create( null );
        } else if( this[ events ][ type ] ){
            delete this[ events ][ type ];
        }
        
        return this;
    }
    
    if( arguments.length === 0 ){
        // Clear all listeners except "off" and lifecycle
        for( let eventType in this[ events ] ){
            if( eventType === ':off' ){
                continue;
            }
            
            this.clear( eventType );
        }
        
        // Manually clear "off" and lifecycle listeners
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

Emitter.prototype.defineEvents = function(){
    if( !this[ events ] || this[ events ] === Object.getPrototypeOf( this )[ events ] ){
        this[ events ] = Object.create( null );
    }
};

Emitter.prototype.destroy = function(){
    this.emit( ':destroy' );
    this.clear();
    delete this[ events ];
    delete this[ maxListeners ];
};

Emitter.prototype.emit = function( type, ...data ){
    var executed = false;
    
    // Namespaced event
    if( typeof type === 'string' && type.indexOf( ':' ) !== -1 ){
        let eventType = type;
        
        // e.g. Emit "foo:bar:qux", then "foo:bar", then "foo"
        while( eventType.indexOf( ':' ) !== -1 ){
            executed = this.emitEvent( eventType, data ) || executed;
            eventType = eventType.substring( 0, eventType.lastIndexOf( ':' ) );
        }
        
        executed = ( eventType && this.emitEvent( eventType, data ) ) || executed;
        
    // Single event
    } else {
        executed = this.emitEvent( type, data );
    }
    
    return executed;
};

Emitter.prototype.emitEvent = function( type, data = [] ){
    var executed = false,
        listener;
    
    this.defineEvents();
    
    if( type === 'error' && !this[ events ].error ){
        var error = data[ 0 ];
        
        if( error instanceof Error ){
            throw error;
        } else {
            throw Error( 'Uncaught, unspecified "error" event.' );
        }
        
        return executed;
    }
    
    // Execute listeners for the given type of event
    listener = this[ events ][ type ];
    if( typeof listener !== 'undefined' ){
        executeListener( listener, data, this );
        executed = true;
    }
    
    // Execute listeners listening for all types of events
    listener = this[ events ][ every ];
    if( typeof listener !== 'undefined' ){
        executeListener( listener, data, this );
        executed = true;
    }
    
    return executed;
};

Emitter.prototype.listeners = function( type ){
    var listeners;
    
    if( !this[ events ] || !this[ events ][ type ] ){
        listeners = [];
    } else if( typeof this[ events ][ type ] === 'function' ){
        listeners = [ this[ events ][ type ] ];
    } else {
        listeners = this[ events ][ type ].slice();
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
    
    this.on( type, manyListener );
    
    return this;
};

Emitter.prototype.maxListeners = function( max ){
    // Setter
    if( arguments.length ){
        if( typeof max !== 'number' || max < 0 || isNaN( max ) ){
            throw TypeError( 'max must be a positive number' );
        }
        
        this[ maxListeners ] = max;
        
        return this;
    
    // Getter
    } else {
        return this[ maxListeners ];
    }
};

Emitter.prototype.off = function( type = every, listener ){
    var handler, index;
    
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
    index = -1;
    
    if( handler === listener || ( typeof handler.listener === 'function' && handler.listener === listener ) ){
        delete this[ events ][ type ];
        if( this[ events ][ ':off' ] ){
            this.emit( ':off', type, listener );
        }
    } else if( Array.isArray( handler ) ){
        for( let i = handler.length; i-- > 0; ){
            if( handler[ i ] === listener || ( handler[ i ].listener && handler[ i ].listener === listener ) ){
                index = i;
                break;
            }
        }
    }
    
    if( index < 0 ){
        return this;
    }
    
    if( handler.length === 1 ){
        handler.length = 0;
        delete this[ events ][ type ];
    } else {
        handler.splice( index, 1 );
    }
    
    if( this[ events ][ ':off' ] ){
        this.emit( ':off', type, listener );
    }
    
    return this;
};

Emitter.prototype.on = function( type = every, listener ){
    if( typeof listener === 'undefined' ){
        
        // Type not provided, fall back to "every"
        if( typeof type === 'function' ){
            listener = type;
            type = every;
        }
        
        // Plain object of event bindings
        if( typeof type === 'object' && ( type.constructor === Object || typeof type.constructor === 'undefined' ) ){
            for( let eventType in type ){
                this.on( eventType, type[ eventType ] );
            }
            
            return this;
        }
    }
    
    if( typeof listener !== 'function' ){
        throw new TypeError( 'listener must be a function' );
    }
    
    this.defineEvents();
    
    if( this[ events ][ ':on' ] ){
        this.emit( ':on', type, typeof listener.listener === 'function' ? listener.listener : listener );
    }
    
    // Single listener
    if( !this[ events ][ type ] ){
        this[ events ][ type ] = listener;
    
    // Multiple listeners
    } else if( Array.isArray( this[ events ][ type ] ) ){
        this[ events ][ type ].push( listener );
    
    // Transition from single to multiple listeners
    } else {
        this[ events ][ type ] = [ this[ events ][ type ], listener ];
    }
    
    if( Array.isArray( this[ events ][ type ] ) && !this[ events ][ type ].warned ){
        var max = typeof this[ maxListeners ] !== 'undefined' ?
                this[ maxListeners ] :
                Emitter.defaultMaxListeners;
        
        if( max && max > 0 && this[ events ][ type ].length > max ){
            this.emit( ':maxListeners', type, listener );
            this[ events ][ type ].warned = true;
        }
    }
    
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