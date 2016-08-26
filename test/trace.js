'use strict';

function printStatus( fn ){
    switch( %GetOptimizationStatus( fn ) ){
        case 1: console.log( chalk.green( 'Function is optimized' ) ); break;
        case 2: console.log( chalk.yellow( 'Function is not optimized' ) ); break;
        case 3: console.log( chalk.green( 'Function is always optimized' ) ); break;
        case 4: console.log( chalk.red(  'Function is never optimized' ) ); break;
        case 6: console.log( chalk.yellow( 'Function is maybe deoptimized' ) ); break;
        case 7: console.log( chalk.green( 'Function is optimized by TurboFan' ) ); break;
        default: console.log( chalk.blue( 'Unknown optimization status' ) ); break;
    }
}

const
    chalk = require( 'chalk' ),
    Emitter = require( '../dist/emitter-umd' ).default,
    
    emitter = new Emitter(),
    noop = function(){};

emitter.on( 'foo', noop );
emitter.on( 'foo', noop );

%OptimizeFunctionOnNextCall( emitter.on );

emitter.on( 'foo', noop );

console.log( chalk.bold( 'Emitter#on' ) );
printStatus( emitter.on );

emitter.emit( 'foo' );
emitter.emit( 'foo' );

%OptimizeFunctionOnNextCall( emitter.emit );

emitter.emit( 'foo' );

console.log( chalk.bold( 'Emitter#emit' ) );
printStatus( emitter.emit );