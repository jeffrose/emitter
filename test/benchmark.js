'use strict';

var Emitter = require( '../dist/emitter-umd' ).default,
    EventEmitter = require( 'events' ).EventEmitter,
    emitter = new Emitter(),
    ee = new EventEmitter(),
    index = 10000,
    noop = function(){};

emitter.maxListeners = index;
ee.setMaxListeners( index );
    
while( index-- ){
    ee.on( 'foo', noop );
    emitter.on( 'foo', noop );
}

module.exports = {
    name: 'EventEmitter vs. Emitter',
    maxTime: 5,
    tests: {
        'Emitter#emit': function(){
            emitter.emit( 'foo' );
        },
        'Emitter#tick': {
            defer: true,
            fn: function( deferred ){
                emitter.tick( 'foo' ).then( function(){
                    deferred.resolve();
                } );
            }
        },
        'Emitter#trigger': function(){
            emitter.trigger( 'foo' );
        },
        'EventEmitter#emit': function(){
            ee.emit( 'foo' );
        }
    }
};