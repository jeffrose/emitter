import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

use(sinonChai);
use(chaiAsPromised);

/**
 * Describes the Emitter.js behavioral contract. The suite is executed against both the source and the
 * distribution builds, see `emitter.test.mjs` and `dist.test.mjs`.
 *
 * @param {Function} Emitter The Emitter implementation under test.
 * @param {string} label The name of the suite, which identifies the implementation under test.
 */
export default function describeEmitter(Emitter, label) {
    describe(label, () => {
        it('should be a function', () => {
            expect(Emitter).to.be.a('function');
        });

        it('should have static functions and properties', () => {
            expect(Emitter.every).to.be.a('string');
            expect(Emitter.defaultMaxListeners).to.be.a('number');
            expect(Emitter.version).to.be.a('string');
        });

        describe('as a constructor', () => {
            it('should have a prototype', () => {
                expect(Emitter.prototype).to.be.an('object');
                expect(Emitter.prototype.constructor).to.be.a('function');
            });

            it('should create instances', () => {
                const emitter = new Emitter();
                expect(typeof emitter).to.equal('object');
                expect(emitter).to.be.an.instanceof(Emitter);
            });

            describe('emitter', () => {
                let emitter;

                beforeEach(() => (emitter = new Emitter()));

                afterEach(() => {
                    emitter.destroy();
                    emitter = undefined;
                });

                it('should have functions and properties', () => {
                    expect(emitter.clear).to.be.a('function');
                    expect(emitter.destroy).to.be.a('function');
                    expect(emitter.emit).to.be.a('function');
                    expect(emitter.eventTypes).to.be.a('function');
                    expect(emitter.first).to.be.a('function');
                    expect(emitter.getMaxListeners).to.be.a('function');
                    expect(emitter.listenerCount).to.be.a('function');
                    expect(emitter.listeners).to.be.a('function');
                    expect(emitter.many).to.be.a('function');
                    expect(emitter.off).to.be.a('function');
                    expect(emitter.on).to.be.a('function');
                    expect(emitter.once).to.be.a('function');
                    expect(emitter.setMaxListeners).to.be.a('function');
                    expect(emitter.tick).to.be.a('function');
                    expect(emitter.toJSON).to.be.a('function');
                    expect(emitter.toString).to.be.a('function');
                    expect(emitter.trigger).to.be.a('function');
                    expect(emitter.until).to.be.a('function');
                    expect(emitter.maxListeners).to.be.a('number');
                });

                it('should provide event subscription', () => {
                    const events = [],
                        listeners = [],
                        onFoo = sinon.spy(),
                        onFooToo = sinon.spy(),
                        onFooFirst = sinon.spy(),
                        onBar = sinon.spy();

                    emitter.on(':on', (event, listener) => {
                        events.push(event);
                        listeners.push(listener);
                    });

                    emitter.on('foo', onFoo);

                    emitter.on({
                        foo: onFooToo,
                        bar: onBar
                    });

                    emitter.emit('foo');
                    emitter.emit('bar');

                    expect(onFoo).to.have.been.calledOnce;
                    expect(onFooToo).to.have.been.calledOnce;
                    expect(onBar).to.have.been.calledOnce;

                    expect(events).to.deep.equal(['foo', 'foo', 'bar']);
                    expect(listeners).to.deep.equal([onFoo, onFooToo, onBar]);

                    expect(emitter.listeners('foo')[0]).to.equal(onFoo);
                    expect(emitter.listeners('foo')[1]).to.equal(onFooToo);

                    expect(() => emitter.on('foo')).to.throw(TypeError);

                    emitter.first('foo', onFooFirst);

                    expect(emitter.listeners('foo')[0]).to.equal(onFooFirst);
                    expect(emitter.listeners('foo')[1]).to.equal(onFoo);
                    expect(emitter.listeners('foo')[2]).to.equal(onFooToo);

                    expect(() => emitter.first('foo')).to.throw(TypeError);
                });

                it('should provide event subscription at construction time', () => {
                    const events = [],
                        listeners = [],
                        onFoo = sinon.spy(),
                        onFooToo = sinon.spy(),
                        onBar = sinon.spy();

                    emitter = new Emitter({
                        ':on': (event, listener) => {
                            events.push(event);
                            listeners.push(listener);
                        },
                        foo: [onFoo, onFooToo],
                        bar: onBar
                    });

                    emitter.emit('foo');
                    emitter.emit('bar');

                    expect(onFoo).to.have.been.calledOnce;
                    expect(onFooToo).to.have.been.calledOnce;
                    expect(onBar).to.have.been.calledOnce;

                    expect(events).to.deep.equal(['foo', 'foo', 'bar']);
                    expect(listeners).to.deep.equal([onFoo, onFooToo, onBar]);

                    expect(emitter.listeners('foo')[0]).to.equal(onFoo);
                    expect(emitter.listeners('foo')[1]).to.equal(onFooToo);

                    expect(() => emitter.on('foo')).to.throw(TypeError);
                });

                it('should support namespaced event types', () => {
                    const onFoo = sinon.spy(),
                        onBar = sinon.spy(),
                        onQux = sinon.spy();

                    emitter.on('foo', onFoo);
                    emitter.on('foo:bar', onBar);
                    emitter.on('foo:bar:qux', onQux);

                    emitter.emit('foo:bar:qux', 1, 2, 3);

                    expect(onFoo).to.have.been.calledWith(1, 2, 3);
                    expect(onBar).to.have.been.calledWith(1, 2, 3);
                    expect(onQux).to.have.been.calledWith(1, 2, 3);

                    emitter.trigger('foo:bar:qux', [4, 5, 6]);

                    expect(onFoo).to.have.been.calledWith(4, 5, 6);
                    expect(onBar).to.have.been.calledWith(4, 5, 6);
                    expect(onQux).to.have.been.calledWith(4, 5, 6);

                    expect(onFoo).to.have.been.calledTwice;
                    expect(onBar).to.have.been.calledTwice;
                    expect(onQux).to.have.been.calledTwice;
                });

                it('should emit events differently based on the number of arguments', () => {
                    const test = Symbol('@@test'),
                        onEmit = sinon.spy();

                    emitter.on('test', onEmit);
                    emitter.on(test, onEmit);

                    emitter.emit('test');
                    emitter.emit('test', 0);
                    emitter.emit('test', 1, 2);
                    emitter.emit('test', 3, 4, 5);
                    emitter.trigger('test', [6, 7, 8, 9]);
                    emitter.emit(test);

                    expect(onEmit).to.have.been.calledWith();
                    expect(onEmit).to.have.been.calledWith(0);
                    expect(onEmit).to.have.been.calledWith(1, 2);
                    expect(onEmit).to.have.been.calledWith(3, 4, 5);
                    expect(onEmit).to.have.been.calledWith(6, 7, 8, 9);
                    expect(onEmit).to.have.callCount(6);

                    expect(() => emitter.emit('error')).to.throw(Error);
                    expect(() => emitter.emit('error', new Error('test error'))).to.throw(Error);
                });

                it('should emit own events only', () => {
                    const getHuman = (parent) => {
                            function Human() {}
                            Human.prototype = parent || emitter;
                            Emitter(Human.prototype);
                            return new Human();
                        },
                        onEmit = sinon.spy(),
                        parent = getHuman();

                    parent.child = getHuman(parent);

                    expect(parent.clear).to.be.a('function');
                    expect(parent.emit).to.be.a('function');
                    expect(parent.eventTypes).to.be.a('function');
                    expect(parent.first).to.be.a('function');
                    expect(parent.getMaxListeners).to.be.a('function');
                    expect(parent.listenerCount).to.be.a('function');
                    expect(parent.listeners).to.be.a('function');
                    expect(parent.many).to.be.a('function');
                    expect(parent.off).to.be.a('function');
                    expect(parent.on).to.be.a('function');
                    expect(parent.once).to.be.a('function');
                    expect(parent.setMaxListeners).to.be.a('function');
                    expect(parent.trigger).to.be.a('function');
                    expect(parent.until).to.be.a('function');

                    expect(parent.child.clear).to.be.a('function');
                    expect(parent.child.emit).to.be.a('function');
                    expect(parent.child.eventTypes).to.be.a('function');
                    expect(parent.child.first).to.be.a('function');
                    expect(parent.child.getMaxListeners).to.be.a('function');
                    expect(parent.child.listenerCount).to.be.a('function');
                    expect(parent.child.listeners).to.be.a('function');
                    expect(parent.child.many).to.be.a('function');
                    expect(parent.child.off).to.be.a('function');
                    expect(parent.child.on).to.be.a('function');
                    expect(parent.child.once).to.be.a('function');
                    expect(parent.child.setMaxListeners).to.be.a('function');
                    expect(parent.child.trigger).to.be.a('function');
                    expect(parent.child.until).to.be.a('function');

                    parent.on('test', onEmit);

                    parent.emit('test', 1);
                    expect(onEmit).to.have.been.calledWith(1);

                    parent.child.emit('test', 2);
                    expect(onEmit).to.not.have.been.calledWith(2);
                });

                it('should catch errors in bad listeners', () => {
                    const onEmit = sinon.spy(),
                        onError = sinon.spy(),
                        badListenerError = new Error('Bad listener');

                    emitter.on('test', () => {
                        throw badListenerError;
                    });
                    emitter.on('test', onEmit);

                    emitter.on('error', onError);

                    emitter.emit('test');

                    expect(onError).to.have.been.calledOnce;
                    expect(onError).to.have.been.calledWith(badListenerError);
                    expect(onEmit).to.have.been.calledOnce;

                    emitter.off('error', onError);

                    expect(() => emitter.emit('test')).to.throw(badListenerError);
                    expect(onEmit).to.have.been.calledTwice;
                });

                it('should provide asynchronous event emission', () => {
                    const onEmit = sinon.spy();

                    emitter.on('test', onEmit);

                    expect(emitter.tick('test', 1, 2, 3)).to.be.fulfilled;
                    expect(emitter.tick('none', 4, 5, 6)).to.be.rejected;
                });

                it('should provide a way to unsubscribe', () => {
                    const onAll = sinon.spy(),
                        onEmit = sinon.spy(),
                        onEmitToo = sinon.spy(),
                        onOff = sinon.spy();

                    emitter.on(':off', onOff);

                    emitter.on('test', onEmit);
                    emitter.on('test', onEmitToo);

                    emitter.on(onAll);

                    emitter.emit('test', 1, 2, 3);
                    emitter.off('test', onEmit);
                    emitter.emit('test', 4, 5, 6);
                    emitter.off('test', onEmitToo);

                    emitter.off(onAll);

                    emitter.off('undefined', onEmit);

                    expect(onEmit).to.have.been.calledWith(1, 2, 3);
                    expect(onEmit).to.have.been.calledOnce;

                    expect(onEmitToo).to.have.been.calledWith(1, 2, 3);
                    expect(onEmitToo).to.have.been.calledWith(4, 5, 6);
                    expect(onEmitToo).to.have.been.calledTwice;

                    expect(() => emitter.off('test')).to.throw(TypeError);

                    expect(onOff).to.have.been.calledWith('test', onEmit);
                    expect(onOff).to.have.been.calledWith('test', onEmitToo);
                    expect(onOff).to.have.been.calledThrice;
                });

                it('should provide one-time event subscription', () => {
                    const onEmit = sinon.spy();

                    emitter.once('test', onEmit);

                    emitter.emit('test', 1, 2, 3);
                    emitter.emit('test', 4, 5, 6);

                    expect(onEmit).to.have.been.calledWith(1, 2, 3);
                    expect(onEmit).to.have.been.calledOnce;

                    expect(() => emitter.once('test')).to.throw(TypeError);
                });

                it('should provide many-time event subscription', () => {
                    const onEmit = sinon.spy();

                    emitter.many('test', 2, onEmit);

                    emitter.emit('test', 1, 2, 3);
                    emitter.emit('test', 4, 5, 6);
                    emitter.emit('test', 7, 8, 9);

                    expect(onEmit).to.have.been.calledWith(1, 2, 3);
                    expect(onEmit).to.have.been.calledWith(4, 5, 6);
                    expect(onEmit).to.have.been.calledTwice;

                    expect(() => emitter.many('test', 2)).to.throw(TypeError);
                    expect(() => emitter.many('test')).to.throw(TypeError);
                });

                it('should allow unsubscribing early from a many-time event', () => {
                    const onEmit = sinon.spy();

                    emitter.many('test', 5, onEmit);

                    emitter.emit('test', 1, 2);
                    emitter.emit('test', 3, 4);
                    emitter.emit('test', 5, 6);

                    emitter.off('test', onEmit);

                    emitter.emit('test', 7, 8);
                    emitter.emit('test', 9, 0);

                    expect(onEmit).to.have.been.calledThrice;
                });

                it('should provide conditional event subscription', () => {
                    let onEmit = sinon.spy();

                    emitter.until('test', (first, second, third) => {
                        onEmit(first, second, third);
                        return third === 6;
                    });

                    emitter.emit('test', 1, 2, 3);
                    emitter.emit('test', 4, 5, 6);
                    emitter.emit('test', 7, 8, 9);

                    expect(onEmit).to.have.been.calledWith(1, 2, 3);
                    expect(onEmit).to.have.been.calledWith(4, 5, 6);
                    expect(onEmit).to.have.been.calledTwice;

                    let count = 0;
                    onEmit = sinon.spy();

                    emitter.until(() => {
                        onEmit();
                        return ++count === 2;
                    });

                    emitter.emit('foo');
                    emitter.emit('bar');
                    emitter.emit('baz');

                    expect(onEmit).to.have.been.calledTwice;

                    expect(() => emitter.until('test')).to.throw(TypeError);
                });

                it('should provide a way to listen to every event', () => {
                    const atEmit = sinon.spy(),
                        onEmit = sinon.spy(),
                        onceEmit = sinon.spy(),
                        firstEmit = sinon.spy(),
                        manyEmit = sinon.spy();

                    emitter.many(2, manyEmit);
                    emitter.many(Emitter.every, 2, manyEmit);
                    emitter.many(undefined, 2, manyEmit);

                    emitter.on(onEmit);
                    emitter.on(Emitter.every, onEmit);
                    emitter.on(undefined, onEmit);

                    emitter.at(1, atEmit);
                    emitter.at(Emitter.every, 1, atEmit);
                    emitter.at(undefined, 1, atEmit);

                    emitter.first(firstEmit);
                    emitter.first(Emitter.every, firstEmit);
                    emitter.first(undefined, firstEmit);

                    emitter.once(onceEmit);
                    emitter.once(Emitter.every, onceEmit);
                    emitter.once(undefined, onceEmit);

                    emitter.emit('foo');
                    emitter.emit('bar');

                    emitter.clear(Emitter.every);

                    emitter.emit('qux');

                    expect(atEmit).to.have.callCount(6);
                    expect(firstEmit).to.have.callCount(6);
                    expect(manyEmit).to.have.callCount(6);
                    expect(onEmit).to.have.callCount(6);
                    expect(onceEmit).to.have.callCount(3);
                });

                it('should emit events when listeners are added and removed', () => {
                    const noop = function () {},
                        onNewListener = sinon.spy(),
                        onRemoveListener = sinon.spy();

                    emitter.on(':on', onNewListener);
                    emitter.on(':off', onRemoveListener);

                    emitter.once('test', noop);

                    emitter.emit('test');

                    expect(onNewListener).to.have.been.calledWith('test');
                    expect(onNewListener).to.have.been.calledWith(':off');
                    expect(onNewListener).to.have.been.calledTwice;

                    expect(onRemoveListener).to.have.been.calledWith('test');
                    expect(onRemoveListener).to.have.been.calledOnce;
                });

                it('should provide a listener count', () => {
                    const noop = function () {};

                    emitter.on('test', noop);
                    emitter.on('test', noop);

                    emitter.emit('empty');

                    expect(emitter.listenerCount('test')).to.equal(2);
                    expect(emitter.listenerCount('empty')).to.equal(0);
                    expect(emitter.listenerCount('undefined')).to.equal(0);
                });

                it('should limit the number of subscriptions', () => {
                    const noop = function () {},
                        onMaxListeners = sinon.spy();

                    emitter.on(':maxListeners', onMaxListeners);

                    // The default max listeners is 10
                    emitter.on('test', noop); // 1
                    emitter.on('test', noop); // 2
                    emitter.on('test', noop); // 3
                    emitter.on('test', noop); // 4
                    emitter.on('test', noop); // 5
                    emitter.on('test', noop); // 6
                    emitter.on('test', noop); // 7
                    emitter.on('test', noop); // 8
                    emitter.on('test', noop); // 9
                    emitter.on('test', noop); // 10
                    emitter.on('test', noop); // 11

                    expect(onMaxListeners).to.have.been.calledWith('test');
                    expect(onMaxListeners).to.have.been.calledOnce;
                });

                it('should set the maximum number of subscriptions', () => {
                    const noop = function () {},
                        onMaxListeners = sinon.spy();

                    emitter.setMaxListeners(3);

                    expect(emitter.getMaxListeners()).to.equal(3);

                    emitter.maxListeners = 2;

                    expect(emitter.getMaxListeners()).to.equal(2);

                    emitter.on(':maxListeners', onMaxListeners);

                    emitter.on('test', noop); // 1
                    emitter.on('test', noop); // 2
                    emitter.on('test', noop); // 3

                    expect(onMaxListeners).to.have.been.calledWith('test');
                    expect(onMaxListeners).to.have.been.calledOnce;

                    expect(() => (emitter.maxListeners = 'a')).to.throw(TypeError);
                });

                it('should provide a clean JSON and String representation', () => {
                    const noop = function () {};

                    let json, string;

                    emitter.maxListeners = 5;
                    emitter.on('test', noop);
                    emitter.on('test', noop);

                    json = emitter.toJSON();
                    string = emitter.toString();

                    // toJSON()
                    expect(json).to.have.property('maxListeners');
                    expect(json.maxListeners).to.be.a('Number');
                    expect(json.maxListeners).to.equal(5);
                    expect(json).to.have.property('listenerCount');
                    expect(json.listenerCount).to.be.an('Object');
                    expect(json.listenerCount).to.have.property('test');
                    expect(json.listenerCount.test).to.be.a('Number');

                    // toString()
                    expect(string).to.match(/^Emitter {.+}$/);
                    expect(string).to.match(/"test":2/);
                    expect(string).to.match(/"maxListeners":5/);

                    emitter.destroy();

                    json = emitter.toJSON();
                    string = emitter.toString();

                    expect(json).to.equal('destroyed');
                    expect(string).to.match(/^Emitter "destroyed"$/);
                });

                it('should provide listener count', () => {
                    const noop = function () {};
                    let count;

                    count = emitter.listenerCount('test');

                    expect(count).to.equal(0);
                    expect(count).to.equal(emitter.listeners('test').length);

                    emitter.on('test', noop);
                    count = emitter.listenerCount('test');

                    expect(count).to.equal(1);
                    expect(count).to.equal(emitter.listeners('test').length);

                    emitter.on('test', noop);
                    count = emitter.listenerCount('test');

                    expect(count).to.equal(2);
                    expect(count).to.equal(emitter.listeners('test').length);

                    emitter.on('test', noop);
                    count = emitter.listenerCount('test');

                    expect(count).to.equal(3);
                    expect(count).to.equal(emitter.listeners('test').length);

                    emitter.clear('test');
                    count = emitter.listenerCount('test');

                    expect(count).to.equal(0);
                    expect(count).to.equal(emitter.listeners('test').length);
                });

                it('should provide a list of event types', () => {
                    const onEmit = sinon.spy();

                    emitter.on('foo', onEmit);
                    emitter.on('bar', onEmit);

                    expect(emitter.eventTypes().length).to.equal(2);
                });
            });
        });

        describe('event types', () => {
            let emitter;

            beforeEach(() => (emitter = new Emitter()));

            afterEach(() => emitter.destroy());

            it('should support symbol event types', () => {
                const type = Symbol('test'),
                    onEmit = sinon.spy();

                emitter.on(type, onEmit);

                expect(emitter.emit(type, 1)).to.equal(true);
                expect(emitter.listenerCount(type)).to.equal(1);

                emitter.off(type, onEmit);

                expect(emitter.emit(type, 2)).to.equal(false);
            });

            it('should treat values other than symbols as strings', () => {
                const onEmit = sinon.spy();

                emitter.on(42, onEmit);

                expect(emitter.emit('42')).to.equal(true);
                expect(emitter.listenerCount('42')).to.equal(1);
                expect(onEmit).to.have.been.calledOnce;
            });

            it('should execute every listeners once for a namespaced event', () => {
                const onFoo = sinon.spy(),
                    onBar = sinon.spy(),
                    onQux = sinon.spy(),
                    onEvery = sinon.spy();

                emitter.on('foo', onFoo);
                emitter.on('foo:bar', onBar);
                emitter.on('foo:bar:qux', onQux);
                emitter.on(Emitter.every, onEvery);

                expect(emitter.emit('foo:bar:qux', 1)).to.equal(true);

                expect(onFoo).to.have.been.calledWith(1);
                expect(onBar).to.have.been.calledWith(1);
                expect(onQux).to.have.been.calledWith(1);

                // Every listeners execute for the root event only
                expect(onEvery).to.have.been.calledOnce;
            });

            it('should not execute every listeners for lifecycle events', () => {
                const onEvery = sinon.spy();

                emitter.on(onEvery);
                emitter.on('foo', () => {});
                emitter.once('bar', () => {});
                emitter.emit('foo');

                emitter.setMaxListeners(1);
                emitter.on('baz', () => {});
                emitter.on('baz', () => {});

                // Only the "foo" event, which was emitted explicitly, is seen by the every listener
                expect(onEvery).to.have.been.calledOnce;
                expect(onEvery).to.have.been.calledWith();
            });

            it('should provide the id for listening to every event', () => {
                const onEvery = sinon.spy();

                expect(Emitter.every).to.be.a('string');

                emitter.on(Emitter.every, onEvery);
                emitter.emit('anything', 1);
                emitter.emit('anything:else', 2);

                expect(onEvery).to.have.been.calledWith(1);
                expect(onEvery).to.have.been.calledWith(2);
                expect(onEvery).to.have.been.calledTwice;
            });
        });

        describe('listener management', () => {
            let emitter;

            beforeEach(() => (emitter = new Emitter()));

            afterEach(() => emitter.destroy());

            it('should add listeners at a given index', () => {
                const calls = [],
                    one = () => calls.push('one'),
                    two = () => calls.push('two'),
                    three = () => calls.push('three');

                emitter.on('test', one);
                emitter.at('test', 1, two);
                emitter.at('test', 0, three);

                expect(emitter.listeners('test')).to.deep.equal([three, one, two]);

                emitter.emit('test');

                expect(calls).to.deep.equal(['three', 'one', 'two']);
            });

            it('should prepend listeners with first()', () => {
                const calls = [],
                    one = () => calls.push('one'),
                    two = () => calls.push('two');

                emitter.on('test', one);
                emitter.first('test', two);
                emitter.emit('test');

                expect(calls).to.deep.equal(['two', 'one']);
            });

            it('should return a copy of the listeners', () => {
                const listener = () => {};

                emitter.on('test', listener);

                const listeners = emitter.listeners('test');

                listeners.push(() => {});

                expect(listeners).to.have.length(2);
                expect(emitter.listeners('test')).to.deep.equal([listener]);
            });

            it('should clear a single event type', () => {
                emitter.on('foo', () => {});
                emitter.on('bar', () => {});

                emitter.clear('foo');

                expect(emitter.listenerCount('foo')).to.equal(0);
                expect(emitter.listenerCount('bar')).to.equal(1);
                expect(emitter.eventTypes()).to.deep.equal(['bar']);
            });

            it('should ignore listeners that were never added', () => {
                emitter.on('test', () => {});

                expect(() => emitter.off('test', () => {})).to.not.throw();
                expect(() => emitter.off('missing', () => {})).to.not.throw();
                expect(emitter.listenerCount('test')).to.equal(1);
            });

            it('should remove once, many and until listeners by their original reference', () => {
                const once = sinon.spy(),
                    many = sinon.spy(),
                    until = sinon.spy();

                emitter.once('test', once);
                emitter.many('test', 5, many);
                emitter.until('test', until);

                expect(emitter.listenerCount('test')).to.equal(3);

                emitter.emit('test');
                emitter.off('test', once);
                emitter.off('test', many);
                emitter.off('test', until);
                emitter.emit('test');

                expect(once).to.have.been.calledOnce;
                expect(many).to.have.been.calledOnce;
                expect(until).to.have.been.calledOnce;
                expect(emitter.listenerCount('test')).to.equal(0);
            });

            it('should snapshot the listeners when an event is emitted', () => {
                const calls = [],
                    added = () => calls.push('added'),
                    removed = () => calls.push('removed');

                emitter.on('test', () => {
                    calls.push('first');
                    emitter.off('test', removed);
                    emitter.on('test', added);
                });
                emitter.on('test', removed);
                emitter.emit('test');

                expect(calls).to.deep.equal(['first', 'removed']);

                calls.length = 0;
                emitter.emit('test');

                expect(calls).to.deep.equal(['first', 'added']);
            });
        });

        describe('listener invocation', () => {
            let emitter;

            beforeEach(() => (emitter = new Emitter()));

            afterEach(() => emitter.destroy());

            it('should invoke multiple listeners with one argument', () => {
                const first = sinon.spy(),
                    second = sinon.spy();

                emitter.on('test', first);
                emitter.on('test', second);
                emitter.emit('test', 1);

                expect(first).to.have.been.calledWith(1);
                expect(second).to.have.been.calledWith(1);
            });

            it('should invoke multiple listeners with two arguments', () => {
                const first = sinon.spy(),
                    second = sinon.spy();

                emitter.on('test', first);
                emitter.on('test', second);
                emitter.emit('test', 1, 2);

                expect(first).to.have.been.calledWith(1, 2);
                expect(second).to.have.been.calledWith(1, 2);
            });

            it('should invoke multiple listeners with three arguments', () => {
                const first = sinon.spy(),
                    second = sinon.spy();

                emitter.on('test', first);
                emitter.on('test', second);
                emitter.emit('test', 1, 2, 3);

                expect(first).to.have.been.calledWith(1, 2, 3);
                expect(second).to.have.been.calledWith(1, 2, 3);
            });

            it('should invoke multiple listeners with four or more arguments', () => {
                const first = sinon.spy(),
                    second = sinon.spy();

                emitter.on('test', first);
                emitter.on('test', second);
                emitter.trigger('test', [1, 2, 3, 4, 5]);

                expect(first).to.have.been.calledWith(1, 2, 3, 4, 5);
                expect(second).to.have.been.calledWith(1, 2, 3, 4, 5);
            });

            it('should emit an error thrown by a listener regardless of the number of arguments', () => {
                const arities = [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]];

                for (const data of arities) {
                    for (const listenerCount of [1, 2]) {
                        const emitter = new Emitter(),
                            error = new Error('boom'),
                            onError = sinon.spy(),
                            failing = sinon.spy(() => {
                                throw error;
                            }),
                            survivor = sinon.spy();

                        emitter.on('error', onError);
                        emitter.on('test', failing);

                        if (listenerCount === 2) {
                            emitter.on('test', survivor);
                        }

                        emitter.trigger('test', data);

                        expect(onError).to.have.been.calledOnce;
                        expect(onError).to.have.been.calledWith(error);
                        expect(failing).to.have.been.calledWith(...data);

                        if (listenerCount === 2) {
                            expect(survivor).to.have.been.calledWith(...data);
                        }

                        emitter.destroy();
                    }
                }
            });

            it('should validate the index and the listener of at()', () => {
                expect(() => emitter.at('test', 'a', () => {})).to.throw(TypeError, 'index must be a positive number');
                expect(() => emitter.at('test', -1, () => {})).to.throw(TypeError, 'index must be a positive number');
                expect(() => emitter.at('test', 1, 'a')).to.throw(TypeError, 'listener must be a function');
            });

            it('should emit :off for every listener that is cleared', () => {
                const onOff = sinon.spy(),
                    first = () => {},
                    second = () => {};

                emitter.on(':off', onOff);
                emitter.on('test', first);
                emitter.on('test', second);
                emitter.clear('test');

                expect(onOff).to.have.been.calledWith('test', first);
                expect(onOff).to.have.been.calledWith('test', second);
                expect(onOff).to.have.been.calledTwice;
                expect(emitter.listenerCount('test')).to.equal(0);
            });
        });

        describe('error events', () => {
            let emitter;

            beforeEach(() => (emitter = new Emitter()));

            afterEach(() => emitter.destroy());

            it('should emit an error event for every error thrown by a listener', () => {
                const onError = sinon.spy(),
                    first = new Error('first'),
                    second = new Error('second');

                emitter.on('error', onError);
                emitter.on('test', () => {
                    throw first;
                });
                emitter.on('test', () => {
                    throw second;
                });
                emitter.on('test', () => {});

                expect(emitter.emit('test')).to.equal(true);
                expect(onError).to.have.been.calledWith(first);
                expect(onError).to.have.been.calledWith(second);
                expect(onError).to.have.been.calledTwice;
            });

            it('should throw the first error when there is no error listener', () => {
                const error = new Error('boom');

                emitter.on('test', () => {
                    throw error;
                });

                expect(() => emitter.emit('test')).to.throw(error);
            });

            it('should execute every listeners for error events', () => {
                const onError = sinon.spy(),
                    onEvery = sinon.spy();

                emitter.on('error', onError);
                emitter.on(Emitter.every, onEvery);
                emitter.emit('error', 'not an error');

                expect(onError).to.have.been.calledWith('not an error');
                expect(onEvery).to.have.been.calledWith('not an error');
            });
        });

        describe('inheritance', () => {
            it('should support class inheritance', () => {
                class Greeter extends Emitter {
                    constructor() {
                        super();
                        this.on('greet', (name) => (this.greeting = `Hello, ${name}!`));
                    }
                }

                const greeter = new Greeter();

                expect(greeter).to.be.an.instanceof(Emitter);
                expect(greeter.maxListeners).to.equal(Emitter.defaultMaxListeners);
                expect(greeter.emit('greet', 'World')).to.equal(true);
                expect(greeter.greeting).to.equal('Hello, World!');
            });

            it('should support prototypal inheritance', () => {
                function Greeter() {
                    Emitter.call(this);
                    this.on('greet', (name) => (this.greeting = `Hello, ${name}!`));
                }
                Greeter.prototype = Object.create(Emitter.prototype);

                Greeter.prototype.greet = function (name) {
                    return this.emit('greet', name);
                };

                const greeter = new Greeter();

                expect(greeter).to.be.an.instanceof(Emitter);
                expect(greeter.maxListeners).to.equal(Emitter.defaultMaxListeners);
                expect(greeter.greet('World')).to.equal(true);
                expect(greeter.greeting).to.equal('Hello, World!');
            });

            it('should not share listeners between instances of a subclass', () => {
                class Greeter extends Emitter {}

                const one = new Greeter(),
                    two = new Greeter(),
                    onEmit = sinon.spy();

                one.on('greet', onEmit);
                two.emit('greet');

                expect(onEmit).to.not.have.been.called;
                expect(one.listenerCount('greet')).to.equal(1);
                expect(two.listenerCount('greet')).to.equal(0);
            });
        });

        describe('destroy', () => {
            it('should emit the :destroy event before the listeners are cleared', () => {
                const emitter = new Emitter(),
                    onDestroy = sinon.spy(),
                    counts = [];

                emitter.on(':destroy', onDestroy);
                emitter.on(':destroy', () => counts.push(emitter.listenerCount('test')));
                emitter.on('test', () => {});

                expect(emitter.listenerCount('test')).to.equal(1);
                expect(emitter.toJSON().listenerCount.test).to.equal(1);

                emitter.destroy();

                expect(onDestroy).to.have.been.calledOnce;
                expect(counts).to.deep.equal([1]);
                expect(emitter.toJSON()).to.equal('destroyed');
            });

            it('should provide no-op methods after being destroyed', () => {
                const emitter = new Emitter();

                emitter.destroy();

                expect(emitter.emit('test')).to.be.undefined;
                expect(emitter.listenerCount('test')).to.be.undefined;
                expect(() => emitter.destroy()).to.not.throw();
                expect(emitter.toJSON()).to.equal('destroyed');
                expect(emitter.toString()).to.equal('Emitter "destroyed"');
            });

            it('should destroy an emitter without listeners', () => {
                expect(() => new Emitter().destroy()).to.not.throw();
            });
        });

        describe('tick', () => {
            it('should emit asynchronously', async () => {
                const emitter = new Emitter(),
                    onEmit = sinon.spy();

                emitter.on('test', onEmit);

                const promise = emitter.tick('test', 1);

                expect(onEmit).to.not.have.been.called;

                await promise;

                expect(onEmit).to.have.been.calledWith(1);
            });

            it('should resolve when the event had listeners', async () => {
                const emitter = new Emitter();

                emitter.on('test', () => {});

                await expect(emitter.tick('test')).to.be.fulfilled;
            });

            it('should reject when the event had no listeners', async () => {
                const emitter = new Emitter();

                await expect(emitter.tick('test')).to.be.rejected;
            });
        });

        describe('max listeners', () => {
            it('should warn once per event type', () => {
                const emitter = new Emitter(),
                    onMaxListeners = sinon.spy();

                emitter.setMaxListeners(1);
                emitter.on(':maxListeners', onMaxListeners);
                emitter.on('test', () => {});
                emitter.on('test', () => {});
                emitter.on('test', () => {});
                emitter.on('other', () => {});
                emitter.on('other', () => {});

                expect(onMaxListeners).to.have.been.calledTwice;
                expect(onMaxListeners).to.have.been.calledWith('test');
                expect(onMaxListeners).to.have.been.calledWith('other');
            });

            it('should warn again after the event type is cleared', () => {
                const emitter = new Emitter(),
                    onMaxListeners = sinon.spy();

                emitter.setMaxListeners(1);
                emitter.on(':maxListeners', onMaxListeners);
                emitter.on('test', () => {});
                emitter.on('test', () => {});
                emitter.clear('test');
                emitter.on('test', () => {});
                emitter.on('test', () => {});

                expect(onMaxListeners).to.have.been.calledTwice;
            });

            it('should not warn for a single listener based on its arity', () => {
                const emitter = new Emitter(),
                    onMaxListeners = sinon.spy(),
                    listener = (one, two, three) => one + two + three;

                emitter.setMaxListeners(2);
                emitter.on(':maxListeners', onMaxListeners);
                emitter.on('test', listener);

                expect(onMaxListeners).to.not.have.been.called;
                expect(listener).to.not.have.property('warned');
            });

            it('should not recurse when a :maxListeners listener adds listeners', () => {
                const emitter = new Emitter(),
                    onMaxListeners = sinon.spy((type) => emitter.on(type, () => {}));

                emitter.setMaxListeners(1);
                emitter.on(':maxListeners', onMaxListeners);
                emitter.on('test', () => {});
                emitter.on('test', () => {});

                expect(onMaxListeners).to.have.been.calledOnce;
            });

            it('should never warn when the maximum is zero', () => {
                const emitter = new Emitter(),
                    onMaxListeners = sinon.spy();

                emitter.setMaxListeners(0);
                emitter.on(':maxListeners', onMaxListeners);

                for (let index = 0; index < 20; index += 1) {
                    emitter.on('test', () => {});
                }

                expect(onMaxListeners).to.not.have.been.called;
                expect(emitter.listenerCount('test')).to.equal(20);
            });

            it('should use the default maximum listeners', () => {
                const original = Emitter.defaultMaxListeners;

                try {
                    Emitter.defaultMaxListeners = 1;

                    expect(new Emitter().getMaxListeners()).to.equal(1);
                    expect(new Emitter().maxListeners).to.equal(1);
                } finally {
                    Emitter.defaultMaxListeners = original;
                }
            });
        });

        describe('regressions', () => {
            it('should provide a list of event types and a JSON representation without listeners', () => {
                const emitter = new Emitter(),
                    json = emitter.toJSON();

                expect(emitter.eventTypes()).to.deep.equal([]);
                expect(json.maxListeners).to.equal(Emitter.defaultMaxListeners);
                expect(Object.keys(json.listenerCount)).to.deep.equal([]);
                expect(emitter.toString()).to.equal(
                    `Emitter {"maxListeners":${Emitter.defaultMaxListeners},"listenerCount":{}}`
                );
            });

            it('should throw for an error event on an emitter without listeners', () => {
                expect(() => new Emitter().emit('error')).to.throw('Uncaught, unspecified "error" event.');
                expect(() => new Emitter().emit('error', new Error('boom'))).to.throw('boom');
            });

            it('should not remove a listener of an inherited registry', () => {
                const parent = new Emitter(),
                    child = Object.create(parent),
                    onEmit = sinon.spy();

                parent.on('test', onEmit);
                child.off('test', onEmit);

                expect(parent.listenerCount('test')).to.equal(1);
                expect(parent.emit('test')).to.equal(true);
                expect(onEmit).to.have.been.calledOnce;
            });

            it('should not clear an event type of an inherited registry', () => {
                const parent = new Emitter(),
                    child = Object.create(parent);

                parent.on('test', () => {});
                child.clear('test');

                expect(parent.listenerCount('test')).to.equal(1);
            });

            it('should never execute a many-time listener registered for zero times', () => {
                const emitter = new Emitter(),
                    onEmit = sinon.spy();

                emitter.many('test', 0, onEmit);
                emitter.emit('test');

                expect(onEmit).to.not.have.been.called;
                expect(emitter.listenerCount('test')).to.equal(0);
            });

            it('should remove a conditional listener after its event type was cleared', () => {
                const emitter = new Emitter();

                let result;

                emitter.until('test', () => {
                    emitter.clear('test');
                    return false;
                });
                emitter.until('test', () => true);

                expect(() => {
                    result = emitter.emit('test');
                }).to.not.throw();
                expect(result).to.equal(true);
            });

            it('should not restore a registry that an :on listener cleared', () => {
                const emitter = new Emitter();

                emitter.on(':on', (type) => {
                    if (type === 'bar') {
                        emitter.clear();
                    }
                });
                emitter.on('foo', () => {});
                emitter.on('bar', () => {});

                expect(emitter.eventTypes()).to.deep.equal(['bar']);
                expect(emitter.listenerCount('foo')).to.equal(0);
                expect(emitter.listenerCount('bar')).to.equal(1);
            });
        });

        describe('as a mixin', () => {
            let emitter;

            beforeEach(() => (emitter = Object.create(null)));

            afterEach(() => (emitter = undefined));

            it('should mix in functionality to instances', () => {
                Emitter(emitter);

                expect(emitter.clear).to.be.a('function');
                expect(emitter.emit).to.be.a('function');
                expect(emitter.eventTypes).to.be.a('function');
                expect(emitter.first).to.be.a('function');
                expect(emitter.getMaxListeners).to.be.a('function');
                expect(emitter.listenerCount).to.be.a('function');
                expect(emitter.listeners).to.be.a('function');
                expect(emitter.many).to.be.a('function');
                expect(emitter.off).to.be.a('function');
                expect(emitter.on).to.be.a('function');
                expect(emitter.once).to.be.a('function');
                expect(emitter.setMaxListeners).to.be.a('function');
                expect(emitter.tick).to.be.a('function');
                expect(emitter.trigger).to.be.a('function');
                expect(emitter.until).to.be.a('function');

                const onEmit = sinon.spy();

                emitter.on('test', onEmit);
                emitter.emit('test', 123);

                expect(onEmit).to.have.been.calledWith(123);
            });

            it('should mix in functionality to prototypes', () => {
                function Events() {}
                Events.prototype = emitter;
                Emitter(Events.prototype);

                const one = new Events(),
                    two = new Events(),
                    onEmit = sinon.spy();

                expect(one.clear).to.be.a('function');
                expect(one.emit).to.be.a('function');
                expect(one.eventTypes).to.be.a('function');
                expect(one.first).to.be.a('function');
                expect(one.getMaxListeners).to.be.a('function');
                expect(one.listenerCount).to.be.a('function');
                expect(one.listeners).to.be.a('function');
                expect(one.many).to.be.a('function');
                expect(one.off).to.be.a('function');
                expect(one.on).to.be.a('function');
                expect(one.once).to.be.a('function');
                expect(one.setMaxListeners).to.be.a('function');
                expect(one.trigger).to.be.a('function');
                expect(one.until).to.be.a('function');

                expect(two.clear).to.be.a('function');
                expect(two.emit).to.be.a('function');
                expect(two.eventTypes).to.be.a('function');
                expect(two.first).to.be.a('function');
                expect(two.getMaxListeners).to.be.a('function');
                expect(two.listenerCount).to.be.a('function');
                expect(two.listeners).to.be.a('function');
                expect(two.many).to.be.a('function');
                expect(two.off).to.be.a('function');
                expect(two.on).to.be.a('function');
                expect(two.once).to.be.a('function');
                expect(two.setMaxListeners).to.be.a('function');
                expect(two.trigger).to.be.a('function');
                expect(two.until).to.be.a('function');

                one.on('one', onEmit);
                two.on('two', onEmit);

                expect(one.listenerCount('one')).to.equal(1);
                expect(one.listenerCount('two')).to.equal(0);
                expect(two.listenerCount('one')).to.equal(0);
                expect(two.listenerCount('two')).to.equal(1);
            });

            it('should mix in selected functionality', () => {
                Emitter('emit on once off', emitter);

                expect(emitter.clear).to.be.undefined;
                expect(emitter.emit).to.be.a('function');
                expect(emitter.eventTypes).to.be.undefined;
                expect(emitter.first).to.be.undefined;
                expect(emitter.getMaxListeners).to.be.undefined;
                expect(emitter.listenerCount).to.be.undefined;
                expect(emitter.listeners).to.be.undefined;
                expect(emitter.many).to.be.undefined;
                expect(emitter.off).to.be.a('function');
                expect(emitter.on).to.be.a('function');
                expect(emitter.once).to.be.a('function');
                expect(emitter.setMaxListeners).to.be.undefined;
                expect(emitter.trigger).to.be.undefined;
                expect(emitter.until).to.be.undefined;

                const onEmit = sinon.spy();

                emitter.on('test', onEmit);
                emitter.emit('test', 123);

                expect(onEmit).to.have.been.calledWith(123);
            });

            it('should mix in mapped functionality', () => {
                Emitter(
                    {
                        fireEvent: 'emit',
                        addEventListener: 'on',
                        removeEventListener: 'off'
                    },
                    emitter
                );

                expect(emitter.clear).to.be.undefined;
                expect(emitter.emit).to.be.undefined;
                expect(emitter.eventTypes).to.be.undefined;
                expect(emitter.first).to.be.undefined;
                expect(emitter.getMaxListeners).to.be.undefined;
                expect(emitter.listenerCount).to.be.undefined;
                expect(emitter.listeners).to.be.undefined;
                expect(emitter.many).to.be.undefined;
                expect(emitter.off).to.be.undefined;
                expect(emitter.on).to.be.undefined;
                expect(emitter.once).to.be.undefined;
                expect(emitter.setMaxListeners).to.be.undefined;
                expect(emitter.trigger).to.be.undefined;
                expect(emitter.until).to.be.undefined;
                expect(emitter.fireEvent).to.be.a('function');
                expect(emitter.addEventListener).to.be.a('function');
                expect(emitter.removeEventListener).to.be.a('function');

                const onEmit = sinon.spy();

                emitter.addEventListener('test', onEmit);
                emitter.fireEvent('test', 123);

                expect(onEmit).to.have.been.calledWith(123);
            });
        });
    });
}
