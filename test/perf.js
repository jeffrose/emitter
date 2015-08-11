'use strict';

var Emitter = require( '../src' ),
    EventEmitter = require( 'events' ).EventEmitter,
    emitter = new Emitter(),
    ee = new EventEmitter(),
    index = 10000;

emitter.maxListeners = index;
ee.setMaxListeners( index );
    
while( index-- ){
    ee.on( 'foo', function( one, two, three ){
        
    } );
    emitter.on( 'foo', function( one, two, three ){
        
    } );
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