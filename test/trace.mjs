/**
 * Prints the V8 optimization status of the hot paths of the Emitter.js API.
 *
 * Run with `npm run trace`, which passes the `--allow-natives-syntax` flag that is required by the
 * `%GetOptimizationStatus()` and `%OptimizeFunctionOnNextCall()` intrinsics.
 */
import chalk from 'chalk';
import Emitter from '../src/emitter.js';

// V8 returns a bitfield from `%GetOptimizationStatus()`, see the `OptimizationStatus` enum in
// https://github.com/v8/v8/blob/main/src/runtime/runtime.h
const STATUS = {
        isFunction: 1 << 0,
        neverOptimize: 1 << 1,
        alwaysOptimize: 1 << 2,
        maybeDeopted: 1 << 3,
        optimized: 1 << 4,
        maglevized: 1 << 5,
        turboFanned: 1 << 6,
        interpreted: 1 << 7,
        markedForOptimization: 1 << 8,
        markedForConcurrentOptimization: 1 << 9,
        optimizingConcurrently: 1 << 10,
        isExecuting: 1 << 11,
        topmostFrameIsTurboFanned: 1 << 12,
        liteMode: 1 << 13,
        markedForDeoptimization: 1 << 14,
        baseline: 1 << 15,
        topmostFrameIsInterpreted: 1 << 16,
        topmostFrameIsBaseline: 1 << 17,
        isLazy: 1 << 18,
        topmostFrameIsMaglev: 1 << 19,
        optimizeOnNextCallOptimizesToMaglev: 1 << 20
    },
    GREEN = new Set(['alwaysOptimize', 'baseline', 'maglevized', 'optimized', 'turboFanned']),
    RED = new Set(['neverOptimize', 'maybeDeopted', 'markedForDeoptimization']);

function printStatus(name, fn) {
    const status = %GetOptimizationStatus(fn),
        flags = Object.keys(STATUS).filter((flag) => status & STATUS[flag]),
        color = (flag) => (GREEN.has(flag) ? chalk.green(flag) : RED.has(flag) ? chalk.red(flag) : chalk.yellow(flag));

    console.log(chalk.bold(name), `(${status})`);

    for (const flag of flags) {
        console.log(`  ${color(flag)}`);
    }
}

const emitter = new Emitter(),
    noop = function () {};

emitter.on('foo', noop);
emitter.on('foo', noop);

%OptimizeFunctionOnNextCall(emitter.on);

emitter.on('foo', noop);

printStatus('Emitter#on', emitter.on);

emitter.emit('foo');
emitter.emit('foo');

%OptimizeFunctionOnNextCall(emitter.emit);

emitter.emit('foo');

printStatus('Emitter#emit', emitter.emit);
