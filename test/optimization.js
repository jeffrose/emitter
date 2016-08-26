'use strict';

function printStatus( fn ){
    switch( %GetOptimizationStatus( fn ) ){
        case 1: console.log( "Function is optimized"); break;
        case 2: console.log("Function is not optimized"); break;
        case 3: console.log("Function is always optimized"); break;
        case 4: console.log("Function is never optimized"); break;
        case 6: console.log("Function is maybe deoptimized"); break;
    }
}

var Emitter = require( '../dist/emitter-umd' ).default,
    emitter = new Emitter(),
    index = 1000,
    noop = function(){};

emitter.maxListeners = index;
    
while( index-- ){
    emitter.on( 'foo', noop );
}

%OptimizeFunctionOnNextCall( emitter.on );

emitter.on( 'foo', noop );

console.log( 'Emitter#on' );
printStatus( emitter.on );

emitter.emit( 'foo' );
emitter.emit( 'foo' );

%OptimizeFunctionOnNextCall( emitter.emit );

emitter.emit( 'foo' );

console.log( 'Emitter#emit' );
printStatus( emitter.emit );