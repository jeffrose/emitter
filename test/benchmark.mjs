/**
 * Benchmarks the Emitter.js API against the Node.js `EventEmitter`.
 *
 * Run with `npm run benchmark`.
 */
import { EventEmitter } from 'node:events';
import Benchmark from 'benchmark';
import Emitter from '../src/emitter.js';

const listeners = 10000,
    emitter = new Emitter(),
    eventEmitter = new EventEmitter(),
    noop = function () {};

emitter.setMaxListeners(listeners);
eventEmitter.setMaxListeners(listeners);

for (let index = 0; index < listeners; index += 1) {
    emitter.on('foo', noop);
    eventEmitter.on('foo', noop);
}

const suite = new Benchmark.Suite('EventEmitter vs. Emitter');

suite
    .add('Emitter#emit', () => {
        emitter.emit('foo');
    })
    .add('Emitter#trigger', () => {
        emitter.trigger('foo');
    })
    .add('Emitter#tick', {
        defer: true,
        fn: (deferred) => {
            emitter.tick('foo').then(
                () => deferred.resolve(),
                () => deferred.resolve()
            );
        }
    })
    .add('EventEmitter#emit', () => {
        eventEmitter.emit('foo');
    })
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', () => console.log(`Fastest is ${suite.filter('fastest').map('name')}`))
    .run({ async: true });
