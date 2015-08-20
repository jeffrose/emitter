'use strict';

function printStatus( fn ){
    switch( %GetOptimizationStatus( fn ) ){
        case 1: console.log("Function is optimized"); break;
        case 2: console.log("Function is not optimized"); break;
        case 3: console.log("Function is always optimized"); break;
        case 4: console.log("Function is never optimized"); break;
        case 6: console.log("Function is maybe deoptimized"); break;
    }
}

var Emitter = require( '../dist/emitter-umd' ),
    emitter = new Emitter(),
    index = 10000,
    noop = function(){};

emitter.maxListeners = index;
    
while( index-- ){
    emitter.on( 'foo', noop );
}

emitter.emit( 'foo' );
emitter.emit( 'foo' );

%OptimizeFunctionOnNextCall( emitter.emit );

emitter.emit( 'foo' );

printStatus( emitter.emit );