'use strict';

var Emitter = require( '../dist/emitter-umd' ),
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
    name: 'emit',
    maxTime: 3,
    tests: {
        'Emitter#emit': function(){
            emitter.emit( 'foo', 1, 2, 3 );
        },
        'EventEmitter#emit': function(){
            ee.emit( 'foo', [ 1, 2, 3 ] );
        }
    }
};