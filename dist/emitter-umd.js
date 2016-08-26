(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.emitter = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    /**
     * JavaScript Array
     * @external Array
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array}
     */

    /**
     * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Prm454mun3!imitive|primitive} boolean
     * @external boolean
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean}
     */

    /**
     * JavaScript Error
     * @external Error
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error}
     */

    /**
     * JavaScript Function
     * @external Function
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function}
     */

    /**
     * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} number
     * @external number
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number}
     */

    /**
     * JavaScript null
     * @external null
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null}
     */

    /**
     * JavaScript Object
     * @external Object
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object}
     */

    /**
     * JavaScript Promise
     * @external Promise
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
     */

    /**
     * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} string
     * @external string
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
     */

    /**
     * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} symbol
     * @external symbol
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol}
     */

    /**
     * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
     * @typedef {external:string|external:symbol} EventType
     */

    /**
     * A {@link external:Function| function} bound to an emitter {@link EventType|event type}. Any data transmitted with the event will be passed into the listener as arguments.
     * @typedef {external:Function} EventListener
     * @param {...*} data The arguments passed by the `emit`.
     */

    /**
     * An {@link external:Object|object} that maps {@link EventType|event types} to {@link EventListener|event listeners}.
     * @typedef {external:Object} EventMapping
     */

    /**
     * A {@link external:Promise|promise} returned when an event is emitted asynchronously. It resolves with {@link EventSuccess} and rejects with {@link EventFailure}.
     * @typedef EventPromise
     */

    /**
     * @callback EventSuccess
     * @param {external:boolean} status Whether or not the specified type of event had listeners.
     */

    /**
     * @callback EventFailure
     * @param {external:Error} error The error thrown during listener execution.
     */

    /**
     * This event is emitted _before_ an emitter destroys itself.
     * @event Emitter#:destroy
     */

    /**
     * This event is emitted _after_ a listener is removed.
     * @event Emitter#:off
     * @type {external:string} type
     * @type {external:Function} listener
     */

    /**
     * This event is emitted _before_ a listener is added.
     * @event Emitter#:on
     * @type {external:string} type
     * @type {external:Function} listener
     */

    /**
     * This event is emitted once the maximum number of listeners has been exceeded for an event type.
     * @event Emitter#:maxListeners
     * @type {external:string} type
     * @type {external:Function} listener
     */

    /**
     * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
     * @class Emitter~Null
     * @extends external:null
     */

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Emitter;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    function Null() {}
    Null.prototype = Object.create(null);
    Null.prototype.constructor = Null;

    var $events = '@@emitter/events',
        $every = '@@emitter/every',
        $maxListeners = '@@emitter/maxListeners',
        hasOwnProperty = Object.prototype.hasOwnProperty,
        noop = function noop() {},
        API = new Null();

    // Many of these functions are broken out from the prototype for the sake of optimization. The functions on the protoytype
    // take a variable number of arguments and can be deoptimized as a result. These functions have a fixed number of arguments
    // and therefore do not get deoptimized.

    /**
     * @function Emitter~addConditionalEventListener
     * @param {Emitter} emitter The emitter on which the event would be emitted.
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event callback.
     */
    function addConditionalEventListener(emitter, type, listener) {

        function conditionalListener() {
            var done = listener.apply(emitter, arguments);
            if (done === true) {
                removeEventListener(emitter, type, conditionalListener);
            }
        }

        // TODO Check beyond just one level of listener references
        conditionalListener.listener = listener.listener || listener;

        addEventListener(emitter, type, conditionalListener, NaN);
    }

    /**
     * @function Emitter~addEventListener
     * @param {Emitter} emitter The emitter on which the event would be emitted.
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event callback.
     * @param {external:number} index
     */
    function addEventListener(emitter, type, listener, index) {
        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }

        // Define the event registry if it does not exist.
        defineEventsProperty(emitter, new Null());

        var _events = emitter[$events];

        if (_events[':on']) {
            emitEvent(emitter, ':on', [type, typeof listener.listener === 'function' ? listener.listener : listener], true);

            // Emitting "on" may have changed the registry.
            _events[':on'] = emitter[$events][':on'];
        }

        // Single listener
        if (!_events[type]) {
            _events[type] = listener;

            // Multiple listeners
        } else if (Array.isArray(_events[type])) {
            switch (isNaN(index) || index) {
                case true:
                    _events[type].push(listener);
                    break;
                case 0:
                    _events[type].unshift(listener);
                    break;
                default:
                    _events[type].splice(index, 0, listener);
                    break;
            }

            // Transition from single to multiple listeners
        } else {
            _events[type] = index === 0 ? [listener, _events[type]] : [_events[type], listener];
        }

        // Track warnings if max listeners is available
        if ('maxListeners' in emitter && !_events[type].warned) {
            var max = emitter.maxListeners;

            if (max && max > 0 && _events[type].length > max) {
                emitEvent(emitter, ':maxListeners', [type, listener], true);

                // Emitting "maxListeners" may have changed the registry.
                _events[':maxListeners'] = emitter[$events][':maxListeners'];

                _events[type].warned = true;
            }
        }

        emitter[$events] = _events;
    }

    /**
     * @function Emitter~addFiniteEventListener
     * @param {Emitter} emitter The emitter on which the event would be emitted.
     * @param {EventType} type The event type.
     * @param {external:number} times The number times the listener will be executed before being removed.
     * @param {EventListener} listener The event callback.
     */
    function addFiniteEventListener(emitter, type, times, listener) {

        function finiteListener() {
            listener.apply(this, arguments);
            return --times === 0;
        }

        finiteListener.listener = listener;

        addConditionalEventListener(emitter, type, finiteListener);
    }

    /**
     * @function Emitter~addEventMapping
     * @param {Emitter} emitter The emitter on which the event would be emitted.
     * @param {EventMapping} mapping The event mapping.
     */
    function addEventMapping(emitter, mapping) {
        var types = Object.keys(mapping),
            typeLength = types.length;

        var typeIndex = 0,
            handler = void 0,
            handlerIndex = void 0,
            handlerLength = void 0,
            type = void 0;

        for (; typeIndex < typeLength; typeIndex += 1) {
            type = types[typeIndex];
            handler = mapping[type];

            // List of listeners
            if (Array.isArray(handler)) {
                handlerIndex = 0;
                handlerLength = handler.length;

                for (; handlerIndex < handlerLength; handlerIndex += 1) {
                    addEventListener(emitter, type, handler[handlerIndex], NaN);
                }

                // Single listener
            } else {
                addEventListener(emitter, type, handler, NaN);
            }
        }
    }

    /**
     * @function Emitter~defineEventsProperty
     * @param {Emitter} emitter The emitter on which the property will be created.
     */
    function defineEventsProperty(emitter, value) {
        var hasEvents = hasOwnProperty.call(emitter, $events),
            emitterPrototype = Object.getPrototypeOf(emitter);

        if (!hasEvents || emitterPrototype && emitter[$events] === emitterPrototype[$events]) {
            Object.defineProperty(emitter, $events, {
                value: value,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }

    /**
     * @function Emitter~emitAllEvents
     * @param {Emitter} emitter The emitter on which the event `type` will be emitted.
     * @param {EventType} type The event type.
     * @param {external:Array} data The data to be passed with the event.
     * @returns {external:boolean} Whether or not a listener for the given event type was executed.
     * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
     */
    function emitAllEvents(emitter, type, data) {
        var executed = false,

        // If type is not a string, index will be false
        index = typeof type === 'string' && type.lastIndexOf(':');

        // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
        while (index > 0) {
            executed = type && emitEvent(emitter, type, data, false) || executed;
            type = type.substring(0, index);
            index = type.lastIndexOf(':');
        }

        // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )
        executed = type && emitEvent(emitter, type, data, true) || executed;

        return executed;
    }

    /**
     * @function Emitter~emitErrors
     * @param {Emitter} emitter The emitter on which the `errors` will be emitted.
     * @param {Array<external:Error>} errors The array of errors to be emitted.
     */
    function emitErrors(emitter, errors) {
        var length = errors.length;
        for (var index = 0; index < length; index += 1) {
            emitEvent(emitter, 'error', [errors[index]], false);
        }
    }

    /**
     * @function Emitter~emitEvent
     * @param {Emitter} emitter The emitter on which the event `type` will be emitted.
     * @param {EventType} type The event type.
     * @param {external:Array} data The data to be passed with the event.
     * @param {external:boolean} emitEvery Whether or not listeners for all types will be executed.
     * @returns {external:boolean} Whether or not a listener for the given event type was executed.
     * @throws {external:Error} If `type` is `error` and no listeners are subscribed.
     */
    function emitEvent(emitter, type, data, emitEvery) {
        // Define the event registry if it does not exist.
        defineEventsProperty(emitter, new Null());

        var _events = emitter[$events];

        var executed = false,
            listener = void 0;

        if (type === 'error' && !_events.error) {
            var error = data[0];

            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Uncaught, unspecified "error" event.');
            }
        }

        // Execute listeners for the given type of event
        listener = _events[type];
        if (typeof listener !== 'undefined') {
            executeListener(listener, data, emitter);
            executed = true;
        }

        // Execute listeners listening for all types of events
        if (emitEvery) {
            listener = _events[$every];
            if (typeof listener !== 'undefined') {
                executeListener(listener, data, emitter);
                executed = true;
            }
        }

        return executed;
    }

    /**
     * Executes a listener using the internal `execute*` functions based on the number of arguments.
     * @function Emitter~executeListener
     * @param {Array<Listener>|Listener} listener
     * @param {external:Array} data
     * @param {*} scope
     */
    function executeListener(listener, data, scope) {
        var isFunction = typeof listener === 'function';

        switch (data.length) {
            case 0:
                listenEmpty(listener, isFunction, scope);
                break;
            case 1:
                listenOne(listener, isFunction, scope, data[0]);
                break;
            case 2:
                listenTwo(listener, isFunction, scope, data[0], data[1]);
                break;
            case 3:
                listenThree(listener, isFunction, scope, data[0], data[1], data[2]);
                break;
            default:
                listenMany(listener, isFunction, scope, data);
                break;
        }
    }

    /**
     * @function Emitter~getEventTypes
     * @param {Emitter} emitter The emitter on which event types will be retrieved.
     * @returns {Array<EventType>} The list of event types registered to the emitter.
     */
    function getEventTypes(emitter) {
        return Object.keys(emitter[$events]);
    }

    /**
     * @function Emitter~getMaxListeners
     * @param {Emitter} emitter The emitter on which max listeners will be retrieved.
     * @returns {external:number} The maximum number of listeners.
     */
    function getMaxListeners(emitter) {
        return typeof emitter[$maxListeners] !== 'undefined' ? emitter[$maxListeners] : Emitter.defaultMaxListeners;
    }

    /**
     * Checks whether or not a value is a positive number.
     * @function Emitter~isPositiveNumber
     * @param {*} number The value to be tested.
     * @returns {external:boolean} Whether or not the value is a positive number.
     */
    function isPositiveNumber(number) {
        return typeof number === 'number' && number >= 0 && !isNaN(number);
    }

    /**
     * Execute a listener with no arguments.
     * @function Emitter~listenEmpty
     * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
     * @param {Emitter} emitter The emitter.
     */
    function listenEmpty(handler, isFunction, emitter) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice();

            var index = 0;

            for (; index < length; index += 1) {
                try {
                    listeners[index].call(emitter);
                } catch (error) {
                    errors.push(error);
                }
            }
        }

        if (errors.length) {
            emitErrors(emitter, errors);
        }
    }

    /**
     * Execute a listener with one argument.
     * @function Emitter~listenOne
     * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
     * @param {Emitter} emitter The emitter.
     * @param {*} arg1 The first argument.
     */
    function listenOne(handler, isFunction, emitter, arg1) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter, arg1);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice();

            var index = 0;

            for (; index < length; index += 1) {
                try {
                    listeners[index].call(emitter, arg1);
                } catch (error) {
                    errors.push(error);
                }
            }
        }

        if (errors.length) {
            emitErrors(emitter, errors);
        }
    }

    /**
     * Execute a listener with two arguments.
     * @function Emitter~listenTwo
     * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
     * @param {Emitter} emitter The emitter.
     * @param {*} arg1 The first argument.
     * @param {*} arg2 The second argument.
     */
    function listenTwo(handler, isFunction, emitter, arg1, arg2) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter, arg1, arg2);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice();

            var index = 0;

            for (; index < length; index += 1) {
                try {
                    listeners[index].call(emitter, arg1, arg2);
                } catch (error) {
                    errors.push(error);
                }
            }
        }

        if (errors.length) {
            emitErrors(emitter, errors);
        }
    }

    /**
     * Execute a listener with three arguments.
     * @function Emitter~listenThree
     * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
     * @param {Emitter} emitter The emitter.
     * @param {*} arg1 The first argument.
     * @param {*} arg2 The second argument.
     * @param {*} arg3 The third argument.
     */
    function listenThree(handler, isFunction, emitter, arg1, arg2, arg3) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter, arg1, arg2, arg3);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice();

            var index = 0;

            for (; index < length; index += 1) {
                try {
                    listeners[index].call(emitter, arg1, arg2, arg3);
                } catch (error) {
                    errors.push(error);
                }
            }
        }

        if (errors.length) {
            emitErrors(emitter, errors);
        }
    }

    /**
     * Execute a listener with four or more arguments.
     * @function Emitter~listenMany
     * @param {EventListener|Array<EventListener>} handler One or more {@link EventListener|listeners} that will be executed on the `emitter`.
     * @param {external:boolean} isFunction Whether or not the `handler` is a {@link external:Function|function}.
     * @param {Emitter} emitter The emitter.
     * @param {external:Array} args Four or more arguments.
     */
    function listenMany(handler, isFunction, emitter, args) {
        var errors = [];

        if (isFunction) {
            try {
                handler.apply(emitter, args);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice();

            var index = 0;

            for (; index < length; index += 1) {
                try {
                    listeners[index].apply(emitter, args);
                } catch (error) {
                    errors.push(error);
                }
            }
        }

        if (errors.length) {
            emitErrors(emitter, errors);
        }
    }

    /**
     * @function Emitter~removeEventListener
     * @param {Emitter} emitter The emitter on which the event would be emitted.
     * @param {EventType} type The event type.
     * @param {EventListener} listener The event callback.
     */
    function removeEventListener(emitter, type, listener) {
        // Define the event registry if it does not exist.
        defineEventsProperty(emitter, new Null());

        var handler = emitter[$events][type];

        if (handler === listener || typeof handler.listener === 'function' && handler.listener === listener) {
            delete emitter[$events][type];
            if (emitter[$events][':off']) {
                emitEvent(emitter, ':off', [type, listener], true);
            }
        } else if (Array.isArray(handler)) {
            var index = -1;

            for (var i = handler.length; i-- > 0;) {
                if (handler[i] === listener || handler[i].listener && handler[i].listener === listener) {
                    index = i;
                    break;
                }
            }

            if (index > -1) {
                if (handler.length === 1) {
                    handler.length = 0;
                    delete emitter[$events][type];
                } else {
                    spliceList(handler, index);
                }

                if (emitter[$events][':off']) {
                    emitEvent(emitter, ':off', [type, listener], true);
                }
            }
        }
    }

    /**
     * @function Emitter~setMaxListeners
     * @param {Emitter} The emitter on which the maximum number of listeners will be set.
     * @param {external:number} max The maximum number of listeners before a warning is issued.
     */
    function setMaxListeners(emitter, max) {
        if (!isPositiveNumber(max)) {
            throw new TypeError('max must be a positive number');
        }

        Object.defineProperty(emitter, $maxListeners, {
            value: max,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }

    /**
     * Faster than `Array.prototype.splice`
     * @function Emitter~spliceList
     * @param {external:Array} list
     * @param {external:number} index
     */
    function spliceList(list, index) {
        for (var i = index, j = i + 1, length = list.length; j < length; i += 1, j += 1) {
            list[i] = list[j];
        }

        list.pop();
    }

    /**
     * Asynchronously executes a function.
     * @function Emitter~tick
     * @param {external:Function} callback The function to be executed.
     */
    function tick(callback) {
        return setTimeout(callback, 0);
    }

    /**
     * @function Emitter~tickAllEvents
     * @param {Emitter} emitter The emitter on which the event `type` will be asynchronously emitted.
     * @param {EventType} type The event type.
     * @param {external:Array} data The data to be passed with the event.
     * @returns {EventPromise} A promise which resolves when the listeners have completed execution but rejects if an error was thrown.
     */
    function tickAllEvents(emitter, type, data) {
        return new Promise(function (resolve, reject) {
            tick(function () {
                emitAllEvents(emitter, type, data) ? resolve() : reject();
            });
        });
    }

    /**
     * Applies a `selection` of the Emitter.js API to the `target`.
     * @function Emitter~toEmitter
     */
    function toEmitter(selection, target) {

        // Apply the entire Emitter API
        if (selection === API) {
            asEmitter.call(target);

            // Apply only the selected API methods
        } else {
            var index = void 0,
                key = void 0,
                mapping = void 0,
                names = void 0,
                value = void 0;

            if (typeof selection === 'string') {
                names = selection.split(' ');
                mapping = API;
            } else {
                names = Object.keys(selection);
                mapping = selection;
            }

            index = names.length;

            while (index--) {
                key = names[index];
                value = mapping[key];

                target[key] = typeof value === 'function' ? value : API[value];
            }
        }
    }

    /**
     * A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, `toString()`, and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.
     * 
     * Like all functional mixins, this should be executed with [call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or [apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).
     * @mixin Emitter~asEmitter
     * @example <caption>Applying Emitter functionality</caption>
     * // Create a base object
     * const greeter = Object.create( null );
     * 
     * // Apply the mixin
     * asEmitter.call( greeter );
     * 
     * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * @example <caption>Applying chaos to your world</caption>
     * // NO!!!
     * Emitter.asEmitter(); // Madness ensues
     */
    function asEmitter() {

        /**
         * Adds a listener for the specified event `type` at the specified `index`. If no `type` is given the listener will be triggered any event `type`.
         * 
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @function Emitter~asEmitter.at
         * @param {EventType} [type] The event type.
         * @param {external:number} index Where the listener will be added in the trigger list.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         * @fires Emitter#:on
         * @fires Emitter#:maxListeners
         */
        this.at = function (type, index, listener) {
            // Shift arguments if type is not provided
            if (typeof type === 'number' && typeof index === 'function' && typeof listener === 'undefined') {
                listener = index;
                index = type;
                type = $every;
            }

            if (isPositiveNumber(index)) {
                throw new TypeError('index must be a positive number');
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addEventListener(this, type, listener, index);

            return this;
        };

        /**
         * Remove all listeners, or those for the specified event `type`.
         * @function Emitter~asEmitter.clear
         * @param {String} [type] The event type.
         * @returns {Emitter} The emitter.
         * @example <caption>Clearing all event types</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.on( 'hi', () => console.log( 'Hi!' ) );
         * greeter.emit( 'hello' );
         * // Hello!
         * greeter.emit( 'hi' );
         * // Hi!
         * greeter.clear();
         * greeter.emit( 'hello' );
         * greeter.emit( 'hi' );
         * @example <caption>Clearing a specified event type</caption>
         * const greeter = new Emitter();
         * greeter.on( {
         *  'hello' : function(){ console.log( 'Hello!' ); },
         *  'hi'    : function(){ console.log( 'Hi!' ); }
         * } );
         * greeter.emit( 'hello' );
         * // Hello!
         * greeter.emit( 'hi' );
         * // Hi!
         * greeter.clear( 'hello' );
         * greeter.emit( 'hello' );
         * greeter.emit( 'hi' );
         * // Hi!
         */
        this.clear = function (type) {
            var handler = void 0;

            // No Events
            if (!this[$events]) {
                return this;
            }

            // With no "off" listeners, clearing can be simplified
            if (!this[$events][':off']) {
                if (arguments.length === 0) {
                    this[$events] = new Null();
                } else if (this[$events][type]) {
                    delete this[$events][type];
                }

                return this;
            }

            // Clear all listeners
            if (arguments.length === 0) {
                var types = getEventTypes(this);

                // Avoid removing "off" listeners until all other types have been removed
                for (var index = 0, length = types.length; index < length; index += 1) {
                    if (types[index] === ':off') {
                        continue;
                    }

                    this.clear(types[index]);
                }

                // Manually clear "off"
                this.clear(':off');

                this[$events] = new Null();

                return this;
            }

            handler = this[$events][type];

            if (typeof handler === 'function') {
                removeEventListener(this, type, handler);
            } else if (Array.isArray(handler)) {
                var _index = handler.length;

                while (_index--) {
                    removeEventListener(this, type, handler[_index]);
                }
            }

            delete this[$events][type];

            return this;
        };

        /**
         * Execute the listeners for the specified event `type` with the supplied arguments.
         * 
         * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
         * 
         * Returns `true` if the event had listeners, `false` otherwise.
         * @function Emitter~asEmitter.emit
         * @param {EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @returns {external:boolean} Whether or not the event had listeners.
         * @example <caption>Emitting an event</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.emit( 'hello' );    // true
         * // Hello!
         * greeter.emit( 'goodbye' );  // false
         * @example <caption>Emitting an event with data</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.emit( 'hello', 'World' );
         * // Hello, World!
         * @example <caption>Emitting a namespaced event</caption>
         * const greeter = new Emitter();
         * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
         * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
         * 
         * // This event will not be triggered by emitting "greeting:hello"
         * greeter.on( 'hello', ( name ) => console.log( `Hello again, ${ name }` );
         * 
         * greeter.emit( 'greeting:hi', 'Mark' );
         * // Hi, Mark!
         * // Mark was greeted.
         * 
         * greeter.emit( 'greeting:hello', 'Jeff' );
         * // Hello, Jeff!
         * // Jeff was greeted.
         */
        this.emit = function (type) {
            for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                data[_key - 1] = arguments[_key];
            }

            return emitAllEvents(this, type, data);
        };

        /**
         * @function Emitter~asEmitter.eventTypes
         * @returns {Array<EventType>} The list of event types registered to the emitter.
         * @example
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( `Hello` ) );
         * greeter.on( 'hi', () => console.log( `Hi` ) );
         * 
         * console.log( greeter.eventTypes() );
         * // [ 'hello', 'hi' ]
         */
        this.eventTypes = function () {
            return getEventTypes(this);
        };

        /**
         * @function Emitter~asEmitter.first
         * @param {EventType} type The event type.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         */
        this.first = function (type, listener) {
            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addEventListener(this, type, listener, 0);

            return this;
        };

        /**
         * @function Emitter~asEmitter.getMaxListeners
         * @returns {external:number} The maximum number of listeners.
         */
        this.getMaxListeners = function () {
            return getMaxListeners(this);
        };

        /**
         * @function Emitter~asEmitter.listenerCount
         * @param {EventType} type The event type.
         * @returns {external:number} The number of listeners for that event type within the given emitter.
         * @example
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * console.log( greeter.listenerCount( 'hello' ) );
         * // 1
         * console.log( greeter.listenerCount( 'goodbye' ) );
         * // 0
         */
        this.listenerCount = function (type) {
            var count = void 0;

            // Empty
            if (!this[$events] || !this[$events][type]) {
                count = 0;

                // Function
            } else if (typeof this[$events][type] === 'function') {
                count = 1;

                // Array
            } else {
                count = this[$events][type].length;
            }

            return count;
        };

        /**
         * @function Emitter~asEmitter.listeners
         * @param {EventType} type The event type.
         * @returns {external:number} The number of listeners for that event type within the given emitter.
         * @example
         * const hello = function(){
         *  console.log( 'Hello!' );
         * },
         *  greeter = new Emitter();
         * 
         * greeter.on( 'hello', hello );
         * greeter.emit( 'hello' );
         * // Hello!
         * 
         * console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
         * // true
         */
        this.listeners = function (type) {
            var listeners = void 0;

            if (!this[$events] || !this[$events][type]) {
                listeners = [];
            } else {
                var handler = this[$events][type];

                if (typeof handler === 'undefined') {
                    listeners = [];
                } else if (typeof handler === 'function') {
                    listeners = [handler];
                } else {
                    listeners = handler.slice();
                }
            }

            return listeners;
        };

        /**
         * Adds a *many time* listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`. After the listener is invoked the specified number of `times`, it is removed.
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @function Emitter~asEmitter.many
         * @param {EventType} type The event type.
         * @param {external:number} times The number times the listener will be executed before being removed.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         * @example <caption>Listen to any event type a set number of times</caption>
         * const greeter = new Emitter();
         * greeter.many( 2, ( name ) => console.log( `Greeted ${ name }` ) );
         * greeter.emit( 'hello', 'Jeff' );    // 1
         * // Greeted Jeff
         * greeter.emit( 'hi', 'Terry' );      // 2
         * // Greeted Terry
         * greeter.emit( 'yo', 'Steve' );      // 3
         * @example <caption>Listen to the specified event type a set number of times</caption>
         * const greeter = new Emitter();
         * greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.emit( 'hello', 'Jeff' );    // 1
         * // Hello, Jeff!
         * greeter.emit( 'hello', 'Terry' );   // 2
         * // Hello, Terry!
         * greeter.emit( 'hello', 'Steve' );   // 3
         */
        this.many = function () {
            var type = arguments.length <= 0 || arguments[0] === undefined ? $every : arguments[0];
            var times = arguments[1];
            var listener = arguments[2];

            // Shift arguments if type is not provided
            if (typeof type === 'number' && typeof times === 'function' && typeof listener === 'undefined') {
                listener = times;
                times = type;
                type = $every;
            }

            if (!isPositiveNumber(times)) {
                throw new TypeError('times must be a positive number');
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addFiniteEventListener(this, type, times, listener);

            return this;
        };

        /**
         * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
         * 
         * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
         * @function Emitter~asEmitter.off
         * @param {EventType} type The event type.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         * @fires Emitter#:off
         * @example <caption>Remove a listener from any event type</caption>
         * function greet( name ){
         *  console.log( `Greetings, ${ name }!` );
         * }
         * 
         * const greeter = new Emitter();
         * greeter.on( greet );
         * greeter.emit( 'hello' 'Jeff' );
         * // Greetings, Jeff!
         * greeter.emit( 'hi' 'Jeff' );
         * // Greetings, Jeff!
         * greeter.off( greet );
         * greeter.emit( 'yo', 'Jeff' );
         * @example <caption>Remove a listener from a specified event type</caption>
         * function hello( name ){
         *  console.log( `Hello, ${ name }!` );
         * }
         * 
         * const greeter = new Emitter();
         * greeter.on( 'hello', hello );
         * greeter.emit( 'hello', 'Jeff' );
         * // Hello, Jeff!
         * greeter.off( 'hello', hello );
         * greeter.emit( 'hello', 'Jeff' );
         */
        this.off = function () {
            var type = arguments.length <= 0 || arguments[0] === undefined ? $every : arguments[0];
            var listener = arguments[1];

            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            if (!this[$events] || !this[$events][type]) {
                return this;
            }

            removeEventListener(this, type, listener);

            return this;
        };

        /**
         * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
         * 
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @function Emitter~asEmitter.on
         * @param {EventType} [type] The event type.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         * @fires Emitter#:on
         * @fires Emitter#:maxListeners
         * @example <caption>Listen to all event types</caption>
         * const greeter = new Emitter();
         * greeter.on( () => console.log( 'Greeted' ) );
         * greeter.emit( 'hello' );
         * // Greeted
         * greeter.emit( 'goodbye' );
         * // Greeted
         * @example <caption>Listener to a specified event type</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.emit( 'hello', 'World' );
         * // Hello, World!
         * greeter.emit( 'hi', 'World' );
         */
        this.on = function () {
            var type = arguments[0] || $every,
                listener = arguments[1];

            if (typeof listener === 'undefined') {

                // Type not provided, fall back to "$every"
                if (typeof type === 'function') {
                    listener = type;
                    type = $every;

                    // Plain object of event bindings
                } else if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object') {
                    addEventMapping(this, type);

                    return this;
                }
            }

            addEventListener(this, type, listener, NaN);

            return this;
        };

        /**
         * @function Emitter~asEmitter.once
         * @param {EventType} [type] The event type.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         * @fires Emitter#:on
         * @fires Emitter#:maxListeners
         * const greeter = new Emitter();
         * greeter.once( () => console.log( 'Greeted' ) );
         * greeter.emit( 'hello' );
         * // Greeted
         * greeter.emit( 'goodbye' );
         * @example <caption>Listen once to all event types</caption>
         * const greeter = new Emitter();
         * greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.emit( 'hello', 'World' );
         * // Hello, World!
         * greeter.emit( 'hello', 'World' );
         */
        this.once = function () {
            var type = arguments.length <= 0 || arguments[0] === undefined ? $every : arguments[0];
            var listener = arguments[1];

            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addFiniteEventListener(this, type, 1, listener);

            return this;
        };

        /**
         * @function Emitter~asEmitter.setMaxListeners
         * @param {external:number} max The maximum number of listeners before a warning is issued.
         * @returns {Emitter} The emitter.
         */
        this.setMaxListeners = function (max) {
            setMaxListeners(this, max);
            return this;
        };

        /**
         * Asynchronously emits specified event `type` with the supplied arguments. The listeners will still be synchronously executed in the specified order.
         * 
         * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
         * 
         * Returns a Promise.
         * @function Emitter~asEmitter.tick
         * @param {EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @returns {external:Promise} A promise which resolves when the listeners have completed execution but rejects if an error was thrown.
         * @example <caption>Asynchronously emitting an event</caption>
         * const greeter = new Emitter();
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.tick( 'hello' ).then( ( heard ) => console.log( 'hello heard? ', heard ) );
         * greeter.tick( 'goodbye' ).then( ( heard ) => console.log( 'goodbye heard? ', heard ) );
         * // Hello!
         * // hello heard? true
         * // goodbye heard? false
         */
        this.tick = function (type) {
            for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                data[_key2 - 1] = arguments[_key2];
            }

            return tickAllEvents(this, type, data);
        };

        /**
         * Execute the listeners for the specified event `type` with the supplied `data`.
         * 
         * Returns `true` if the event had listeners, `false` otherwise.
         * @function Emitter~asEmitter.trigger
         * @param {EventType} [type] The event type.
         * @param {external:Array} data
         * @returns {external:boolean} Whether or not the event had listeners.
         * const greeter = new Emitter();
         * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.trigger( 'hello', [ 'World' ] );
         * // Hello, World!
         * @example
         * const greeter = new Emitter();
         * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
         * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
         * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
         * 
         * greeter.trigger( 'greeting:hi', [ 'Mark' ] );
         * // Hi, Mark!
         * // Mark was greeted.
         * 
         * greeter.trigger( 'greeting:hello', [ 'Jeff' ] );
         * // Hello, Jeff!
         * // Jeff was greeted.
         */
        this.trigger = function (type) {
            var data = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            return emitAllEvents(this, type, data);
        };

        /**
         * Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.
         * 
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @function Emitter~asEmitter.until
         * @param {EventType} [type] The event type.
         * @param {EventListener} listener The event callback.
         * @returns {Emitter} The emitter.
         * @example
         * const greeter = new Emitter();
         * greeter.until( function( name ){
         *  console.log( `Greeted ${ name }` );
         *  return name === 'Terry';
         * } );
         * greeter.emit( 'hello', 'Jeff' );
         * // Greeted Jeff
         * greeter.emit( 'goodbye', 'Terry' );
         * // Greeted Terry
         * greeter.emit( 'hi', 'Aaron' );
         * @example
         * const greeter = new Emitter();
         * greeter.until( 'hello', function( name ){
         *  console.log( `Hello, ${ name }!` );
         *  return name === 'World';
         * } );
         * greeter.emit( 'hello', 'Jeff' );
         * // Hello, Jeff!
         * greeter.emit( 'hello', 'World' );
         * // Hello, World!
         * greeter.emit( 'hello', 'Mark' );
         */
        this.until = function () {
            var type = arguments.length <= 0 || arguments[0] === undefined ? $every : arguments[0];
            var listener = arguments[1];

            // Shift arguments if type is not provided
            if (typeof type === 'function' && typeof listener === 'undefined') {
                listener = type;
                type = $every;
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            addConditionalEventListener(this, type, listener);

            return this;
        };
    }

    asEmitter.call(API);

    /**
     * Applies the Emitter.js API to the target.
     * @function Emitter
     * @param {external:string|external:Object} [selection] A selection of the Emitter.js API that will be applied to the `target`.
     * @param {exteral:Object} target The object to which the Emitter.js API will be applied.
     * @example <caption>Applying all of the API</caption>
     * let greeter = Object.create( null );
     * Emitter( greeter );
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.emit( 'hello' );
     * // Hello!
     * @example <caption>Applying a selection of the API</caption>
     * let greeter = Object.create( null );
     * Emitter( 'emit on off', greeter );
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.emit( 'hello' );
     * // Hello!
     * @example <caption>Remapping a selection of the API</caption>
     * let greeter = Object.create( null );
     * Emitter( { fire: 'emit', addListener: 'on' }, greeter );
     * greeter.addListener( 'hello', () => console.log( 'Hello!' ) );
     * greeter.fire( 'hello' );
     * // Hello!
     */

    /**
     * Creates an instance of emitter. If `mapping` are provided they will automatically be passed into `on()` once construction is complete.
     * @class Emitter
     * @classdesc An object that emits named events which cause functions to be executed.
     * @extends Emitter~Null
     * @mixes Emitter~asEmitter
     * @param {EventMapping} [mapping] A mapping of event types to event listeners.
     * @see {@link https://github.com/nodejs/node/blob/master/lib/events.js}
     * @example <caption>Using Emitter directly</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.emit( 'hello' );
     * // Hello!
     * @example <caption>Extending Emitter using Classical inheritance</caption>
     * class Greeter extends Emitter {
     *  constructor(){
     *      super();
     *      this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
     *  }
     * 
     *  greet( name ){
     *      this.emit( 'greet', name );
     *  }
     * }
     * 
     * const greeter = new Greeter();
     * greeter.greet( 'Jeff' );
     * // Hello, Jeff!
     * @example <caption>Extending Emitter using Prototypal inheritance</caption>
     * function Greeter(){
     *  Emitter.call( this );
     *  this.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
     * }
     * Greeter.prototype = Object.create( Emitter.prototype );
     * 
     * Greeter.prototype.greet = function( name ){
     *  this.emit( 'greet', name );
     * };
     * 
     * const greeter = new Greeter();
     * greeter.greet( 'Jeff' );
     * // Hello, Jeff!
     * @example <caption>Namespaced events</caption>
     * const greeter = new Emitter();
     * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
     * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
     * greeter.emit( 'greeting:hi', 'Mark' );
     * greeter.emit( 'greeting:hello', 'Jeff' );
     * // Hi, Mark!
     * // Mark was greeted.
     * // Hello, Jeff!
     * // Jeff was greeted.
     * @example <caption>Predefined events</caption>
     * const greetings = {
     *      hello: function( name ){ console.log( `Hello, ${name}!` ),
     *      hi: function( name ){ console.log( `Hi, ${name}!` )
     *  },
     *  greeter = new Emitter( greetings );
     * 
     * greeter.emit( 'hello', 'Aaron' );
     * // Hello, Aaron!
     * @example <caption>One-time events</caption>
     * const greeter = new Emitter();
     * greeter.once( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'Jeff' );
     * greeter.emit( 'hello', 'Terry' );
     * // Hello, Jeff!
     * @example <caption>Many-time events</caption>
     * const greeter = new Emitter();
     * greeter.many( 'hello', 2, ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'Jeff' );     // 1
     * greeter.emit( 'hello', 'Terry' );    // 2
     * greeter.emit( 'hello', 'Steve' );    // 3
     * // Hello, Jeff!
     * // Hello, Terry!
     */
    function Emitter() {

        // Called as constructor
        if (typeof this !== 'undefined' && this.constructor === Emitter) {
            var mapping = arguments[0];
            typeof mapping !== 'undefined' && addEventMapping(this, mapping);

            Object.defineProperty(this, 'maxListeners', {
                get: function get() {
                    return getMaxListeners(this);
                },
                set: function set(max) {
                    setMaxListeners(this, max);
                },
                configurable: true,
                enumerable: false
            });

            // Called as function
        } else {
            var selection = arguments[0],
                target = arguments[1];

            // Shift arguments
            if (typeof target === 'undefined') {
                target = selection;
                selection = API;
            }

            toEmitter(selection, target);
        }
    }

    Object.defineProperties(Emitter, {
        /**
         * Sets the default maximum number of listeners for all emitters. Use `emitter.maxListeners` to set the maximum on a per-instance basis.
         * 
         * By default Emitter will emit a `:maxListeners` event if more than 10 listeners are added to a specific event type.
         * @member {external:number} Emitter.defaultMaxListeners=10
         * @example <caption>Changing the default maximum listeners</caption>
         * console.log( Emitter.defaultMaxListeners );
         * // 10
         * 
         * const greeter1 = new Emitter(),
         *  greeter2 = new Emitter();
         * 
         * Emitter.defaultMaxListeners = 1;
         * 
         * greeter1.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
         * greeter1.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter1.on( 'hello', () => alert( 'Hello!' ) );
         * // Greeting "hello" has one too many!
         * 
         * greeter2.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
         * greeter2.on( 'hi', () => console.log( 'Hi!' ) );
         * greeter2.on( 'hi', () => alert( 'Hi!' ) );
         * // Greeting "hi" has one too many!
         * 
         */
        defaultMaxListeners: {
            value: 10,
            configurable: true,
            enumerable: false,
            writable: true
        },
        /**
         * The symbol used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.
         * 
         * Using `Emitter.every` is typically not necessary.
         * @member {external:symbol} Emitter.every
         * @example
         * const greeter = new Emitter();
         * greeter.on( Emitter.every, () => console.log( 'Greeted' ) );
         * greeter.emit( 'hello' );
         * // Greeted
         * greeter.emit( 'goodbye' );
         * // Greeted
         */
        every: {
            value: $every,
            configurable: true,
            enumerable: false,
            writable: false
        },
        /**
         * The current version of *Emitter.js*.
         * @member {external:string} Emitter.version
         * @example
         * console.log( Emitter.version );
         * // 2.0.0
         */
        version: {
            value: '2.0.0',
            configurable: false,
            enumerable: false,
            writable: false
        }
    });

    Emitter.prototype = new Null();

    Emitter.prototype.constructor = Emitter;

    asEmitter.call(Emitter.prototype);

    /**
     * Destroys the emitter.
     * @fires Emitter#:destroy
     */
    Emitter.prototype.destroy = function () {
        emitEvent(this, ':destroy', [], true);
        this.clear();
        this.destroy = this.at = this.clear = this.emit = this.eventTypes = this.first = this.getMaxListeners = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.setMaxListeners = this.tick = this.trigger = this.until = noop;
        this.toJSON = function () {
            return 'destroyed';
        };
    };

    /**
     * @returns {external:Object} An plain object representation of the emitter.
     * @example
     * const greeter = new Emitter();
     * greeter.maxListeners = 5;
     * greeter.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.on( 'greet', ( name ) => console.log( `Hi, ${ name }!` ) );
     * 
     * console.log( greeter.toJSON() );
     * // { "maxListeners": 5, "listenerCount": { "greet": 2 } }
     * 
     * greeter.destroy();
     * 
     * console.log( greeter.toJSON() );
     * // "destroyed"
     */
    Emitter.prototype.toJSON = function () {
        var json = new Null(),
            types = Object.keys(this[$events]),
            length = types.length;

        var index = 0,
            type = void 0;

        json.maxListeners = this.maxListeners;
        json.listenerCount = new Null();

        for (; index < length; index++) {
            type = types[index];
            json.listenerCount[type] = this.listenerCount(type);
        }

        return json;
    };

    /**
     * @returns {external:string} A string representation of the emitter.
     * @example
     * const greeter = new Emitter();
     * greeter.maxListeners = 5;
     * greeter.on( 'greet', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.on( 'greet', ( name ) => console.log( `Hi, ${ name }!` ) );
     * 
     * console.log( greeter.toString() );
     * // 'Emitter { "maxListeners": 5, "listenerCount": { "greet": 2 } }'
     * 
     * greeter.destroy();
     * 
     * console.log( greeter.toString() );
     * // 'Emitter "destroyed"'
     */
    Emitter.prototype.toString = function () {
        return (this.constructor.name + ' ' + JSON.stringify(this.toJSON())).trim();
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7OztBQUtBOzs7Ozs7QUFNQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7Ozs7O3NCQTR6Q3dCQSxPOzs7Ozs7OztBQXZ6Q3hCLGFB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SUFBTCxHQUFZLEtBQUt5QixPQUFMLEdBQWUsS0FBS0MsS0FBTCxHQUFhOUcsSUFBMVA7QUFDQSxhQUFLcUgsTUFBTCxHQUFjO0FBQUEsbUJBQU0sV0FBTjtBQUFBLFNBQWQ7QUFDSCxLQUxEOztBQU9BOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBL0gsWUFBUUUsU0FBUixDQUFrQjZILE1BQWxCLEdBQTJCLFlBQVU7QUFDakMsWUFBTUMsT0FBTyxJQUFJL0gsSUFBSixFQUFiO0FBQUEsWUFDSTBDLFFBQVF4QyxPQUFPeUMsSUFBUCxDQUFhLEtBQU10QyxPQUFOLENBQWIsQ0FEWjtBQUFBLFlBRUkrQixTQUFTTSxNQUFNTixNQUZuQjs7QUFJQSxZQUFJZCxRQUFRLENBQVo7QUFBQSxZQUNJVCxhQURKOztBQUdBa0gsYUFBSzVGLFlBQUwsR0FBb0IsS0FBS0EsWUFBekI7QUFDQTRGLGFBQUtmLGFBQUwsR0FBcUIsSUFBSWhILElBQUosRUFBckI7O0FBRUEsZUFBT3NCLFFBQVFjLE1BQWYsRUFBdUJkLE9BQXZCLEVBQWdDO0FBQzVCVCxtQkFBTzZCLE1BQU9wQixLQUFQLENBQVA7QUFDQXlHLGlCQUFLZixhQUFMLENBQW9CbkcsSUFBcEIsSUFBNkIsS0FBS21HLGFBQUwsQ0FBb0JuRyxJQUFwQixDQUE3QjtBQUNIOztBQUVELGVBQU9rSCxJQUFQO0FBQ0gsS0FqQkQ7O0FBbUJBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBaEksWUFBUUUsU0FBUixDQUFrQitILFFBQWxCLEdBQTZCLFlBQVU7QUFDbkMsZUFBTyxDQUFJLEtBQUs1SCxXQUFMLENBQWlCNkgsSUFBckIsU0FBK0JDLEtBQUtDLFNBQUwsQ0FBZ0IsS0FBS0wsTUFBTCxFQUFoQixDQUEvQixFQUFrRU0sSUFBbEUsRUFBUDtBQUNILEtBRkQiLCJmaWxlIjoiZW1pdHRlci11bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSmF2YVNjcmlwdCBBcnJheVxuICogQGV4dGVybmFsIEFycmF5XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1BybTQ1NG11bjMhaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cbiAqIEBleHRlcm5hbCBib29sZWFuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRXJyb3JcbiAqIEBleHRlcm5hbCBFcnJvclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxuICogQGV4dGVybmFsIEZ1bmN0aW9uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcbiAqIEBleHRlcm5hbCBudW1iZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCBudWxsXG4gKiBAZXh0ZXJuYWwgbnVsbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvbnVsbH1cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxuICogQGV4dGVybmFsIE9iamVjdFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0fVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCBQcm9taXNlXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJvbWlzZX1cbiAqL1xuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXG4gKiBAZXh0ZXJuYWwgc3RyaW5nXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XG4gKi9cbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzeW1ib2xcbiAqIEBleHRlcm5hbCBzeW1ib2xcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N5bWJvbH1cbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOnN0cmluZ30gb3Ige0BsaW5rIGV4dGVybmFsOnN5bWJvbH0gdGhhdCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIGV2ZW50IGZpcmVkIGJ5IHRoZSBFbWl0dGVyLlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpzeW1ib2x9IEV2ZW50VHlwZVxuICovIFxuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufCBmdW5jdGlvbn0gYm91bmQgdG8gYW4gZW1pdHRlciB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGV9LiBBbnkgZGF0YSB0cmFuc21pdHRlZCB3aXRoIHRoZSBldmVudCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lciBhcyBhcmd1bWVudHMuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7Li4uKn0gZGF0YSBUaGUgYXJndW1lbnRzIHBhc3NlZCBieSB0aGUgYGVtaXRgLlxuICovXG5cbi8qKlxuICogQW4ge0BsaW5rIGV4dGVybmFsOk9iamVjdHxvYmplY3R9IHRoYXQgbWFwcyB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGVzfSB0byB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxldmVudCBsaXN0ZW5lcnN9LlxuICogQHR5cGVkZWYge2V4dGVybmFsOk9iamVjdH0gRXZlbnRNYXBwaW5nXG4gKi9cblxuLyoqXG4gKiBBIHtAbGluayBleHRlcm5hbDpQcm9taXNlfHByb21pc2V9IHJldHVybmVkIHdoZW4gYW4gZXZlbnQgaXMgZW1pdHRlZCBhc3luY2hyb25vdXNseS4gSXQgcmVzb2x2ZXMgd2l0aCB7QGxpbmsgRXZlbnRTdWNjZXNzfSBhbmQgcmVqZWN0cyB3aXRoIHtAbGluayBFdmVudEZhaWx1cmV9LlxuICogQHR5cGVkZWYgRXZlbnRQcm9taXNlXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgRXZlbnRTdWNjZXNzXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IHN0YXR1cyBXaGV0aGVyIG9yIG5vdCB0aGUgc3BlY2lmaWVkIHR5cGUgb2YgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBFdmVudEZhaWx1cmVcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0aHJvd24gZHVyaW5nIGxpc3RlbmVyIGV4ZWN1dGlvbi5cbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhbiBlbWl0dGVyIGRlc3Ryb3lzIGl0c2VsZi5cbiAqIEBldmVudCBFbWl0dGVyIzpkZXN0cm95XG4gKi8gXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9hZnRlcl8gYSBsaXN0ZW5lciBpcyByZW1vdmVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9mZlxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGEgbGlzdGVuZXIgaXMgYWRkZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b25cbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgaGFzIGJlZW4gZXhjZWVkZWQgZm9yIGFuIGV2ZW50IHR5cGUuXG4gKiBAZXZlbnQgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIEVtaXR0ZXJ+TnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5mdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGw7XG5cbmNvbnN0XG4gICAgJGV2ZW50cyAgICAgICA9ICdAQGVtaXR0ZXIvZXZlbnRzJyxcbiAgICAkZXZlcnkgICAgICAgID0gJ0BAZW1pdHRlci9ldmVyeScsXG4gICAgJG1heExpc3RlbmVycyA9ICdAQGVtaXR0ZXIvbWF4TGlzdGVuZXJzJyxcbiAgICBcbiAgICBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgXG4gICAgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcbiAgICBcbiAgICBBUEkgPSBuZXcgTnVsbCgpO1xuXG4vLyBNYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyBhcmUgYnJva2VuIG91dCBmcm9tIHRoZSBwcm90b3R5cGUgZm9yIHRoZSBzYWtlIG9mIG9wdGltaXphdGlvbi4gVGhlIGZ1bmN0aW9ucyBvbiB0aGUgcHJvdG95dHlwZVxuLy8gdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBhcyBhIHJlc3VsdC4gVGhlc2UgZnVuY3Rpb25zIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgYXJndW1lbnRzXG4vLyBhbmQgdGhlcmVmb3JlIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQuXG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gY29uZGl0aW9uYWxMaXN0ZW5lcigpe1xuICAgICAgICBjb25zdCBkb25lID0gbGlzdGVuZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3VtZW50cyApO1xuICAgICAgICBpZiggZG9uZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE8gQ2hlY2sgYmV5b25kIGp1c3Qgb25lIGxldmVsIG9mIGxpc3RlbmVyIHJlZmVyZW5jZXNcbiAgICBjb25kaXRpb25hbExpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXIubGlzdGVuZXIgfHwgbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciwgTmFOICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKXtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgfVxuICAgIFxuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGlmKCBfZXZlbnRzWyAnOm9uJyBdICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvbicsIFsgdHlwZSwgdHlwZW9mIGxpc3RlbmVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgIFxuICAgICAgICAvLyBFbWl0dGluZyBcIm9uXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgIF9ldmVudHNbICc6b24nIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b24nIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgIGlmKCAhX2V2ZW50c1sgdHlwZSBdICl7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGxpc3RlbmVyO1xuICAgIFxuICAgIC8vIE11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggX2V2ZW50c1sgdHlwZSBdICkgKXtcbiAgICAgICAgc3dpdGNoKCBpc05hTiggaW5kZXggKSB8fCBpbmRleCApe1xuICAgICAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS51bnNoaWZ0KCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0uc3BsaWNlKCBpbmRleCwgMCwgbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIFxuICAgIC8vIFRyYW5zaXRpb24gZnJvbSBzaW5nbGUgdG8gbXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gaW5kZXggPT09IDAgP1xuICAgICAgICAgICAgWyBsaXN0ZW5lciwgX2V2ZW50c1sgdHlwZSBdIF0gOlxuICAgICAgICAgICAgWyBfZXZlbnRzWyB0eXBlIF0sIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYWNrIHdhcm5pbmdzIGlmIG1heCBsaXN0ZW5lcnMgaXMgYXZhaWxhYmxlXG4gICAgaWYoICdtYXhMaXN0ZW5lcnMnIGluIGVtaXR0ZXIgJiYgIV9ldmVudHNbIHR5cGUgXS53YXJuZWQgKXtcbiAgICAgICAgY29uc3QgbWF4ID0gZW1pdHRlci5tYXhMaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggbWF4ICYmIG1heCA+IDAgJiYgX2V2ZW50c1sgdHlwZSBdLmxlbmd0aCA+IG1heCApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm1heExpc3RlbmVycycsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBFbWl0dGluZyBcIm1heExpc3RlbmVyc1wiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICAgICAgX2V2ZW50c1sgJzptYXhMaXN0ZW5lcnMnIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6bWF4TGlzdGVuZXJzJyBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBlbWl0dGVyWyAkZXZlbnRzIF0gPSBfZXZlbnRzO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEZpbml0ZUV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gZmluaXRlTGlzdGVuZXIoKXtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICByZXR1cm4gLS10aW1lcyA9PT0gMDtcbiAgICB9XG4gICAgXG4gICAgZmluaXRlTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICBcbiAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGZpbml0ZUxpc3RlbmVyICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRNYXBwaW5nXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gbWFwcGluZyBUaGUgZXZlbnQgbWFwcGluZy5cbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRNYXBwaW5nKCBlbWl0dGVyLCBtYXBwaW5nICl7XG4gICAgY29uc3RcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggbWFwcGluZyApLFxuICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZXMubGVuZ3RoO1xuICAgIFxuICAgIGxldCB0eXBlSW5kZXggPSAwLFxuICAgICAgICBoYW5kbGVyLCBoYW5kbGVySW5kZXgsIGhhbmRsZXJMZW5ndGgsIHR5cGU7XG4gICAgXG4gICAgZm9yKCA7IHR5cGVJbmRleCA8IHR5cGVMZW5ndGg7IHR5cGVJbmRleCArPSAxICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgdHlwZUluZGV4IF07XG4gICAgICAgIGhhbmRsZXIgPSBtYXBwaW5nWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICAvLyBMaXN0IG9mIGxpc3RlbmVyc1xuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICBoYW5kbGVySW5kZXggPSAwO1xuICAgICAgICAgICAgaGFuZGxlckxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCA7IGhhbmRsZXJJbmRleCA8IGhhbmRsZXJMZW5ndGg7IGhhbmRsZXJJbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgaGFuZGxlclsgaGFuZGxlckluZGV4IF0sIE5hTiApO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyLCBOYU4gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5kZWZpbmVFdmVudHNQcm9wZXJ0eVxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBwcm9wZXJ0eSB3aWxsIGJlIGNyZWF0ZWQuXG4gKi8gXG5mdW5jdGlvbiBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgdmFsdWUgKXtcbiAgICBjb25zdCBoYXNFdmVudHMgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKCBlbWl0dGVyLCAkZXZlbnRzICksXG4gICAgICAgIGVtaXR0ZXJQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIGVtaXR0ZXIgKTtcbiAgICAgICAgXG4gICAgaWYoICFoYXNFdmVudHMgfHwgKCBlbWl0dGVyUHJvdG90eXBlICYmIGVtaXR0ZXJbICRldmVudHMgXSA9PT0gZW1pdHRlclByb3RvdHlwZVsgJGV2ZW50cyBdICkgKXtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkZXZlbnRzLCB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0gKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEFsbEV2ZW50c1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEFsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApe1xuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICAvLyBJZiB0eXBlIGlzIG5vdCBhIHN0cmluZywgaW5kZXggd2lsbCBiZSBmYWxzZVxuICAgICAgICBpbmRleCA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICBcbiAgICAvLyBOYW1lc3BhY2VkIGV2ZW50LCBlLmcuIEVtaXQgXCJmb286YmFyOnF1eFwiLCB0aGVuIFwiZm9vOmJhclwiXG4gICAgd2hpbGUoIGluZGV4ID4gMCApe1xuICAgICAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGZhbHNlICkgKSB8fCBleGVjdXRlZDtcbiAgICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKCAwLCBpbmRleCApO1xuICAgICAgICBpbmRleCA9IHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIH1cbiAgICBcbiAgICAvLyBFbWl0IHNpbmdsZSBldmVudCBvciB0aGUgbmFtZXNwYWNlZCBldmVudCByb290LCBlLmcuIFwiZm9vXCIsIFwiOmJhclwiLCBTeW1ib2woIFwiQEBxdXhcIiApXG4gICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCB0cnVlICkgKSB8fCBleGVjdXRlZDtcbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEVycm9yc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBgZXJyb3JzYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0FycmF5PGV4dGVybmFsOkVycm9yPn0gZXJyb3JzIFRoZSBhcnJheSBvZiBlcnJvcnMgdG8gYmUgZW1pdHRlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICl7XG4gICAgY29uc3QgbGVuZ3RoID0gZXJyb3JzLmxlbmd0aDtcbiAgICBmb3IoIGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJ2Vycm9yJywgWyBlcnJvcnNbIGluZGV4IF0gXSwgZmFsc2UgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEV2ZW50XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBlbWl0RXZlcnkgV2hldGhlciBvciBub3QgbGlzdGVuZXJzIGZvciBhbGwgdHlwZXMgd2lsbCBiZSBleGVjdXRlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBlbWl0RXZlcnkgKXtcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XG4gICAgXG4gICAgY29uc3QgX2V2ZW50cyA9IGVtaXR0ZXJbICRldmVudHMgXTtcbiAgICBcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgbGlzdGVuZXI7XG4gICAgXG4gICAgaWYoIHR5cGUgPT09ICdlcnJvcicgJiYgIV9ldmVudHMuZXJyb3IgKXtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBkYXRhWyAwIF07XG4gICAgICAgIFxuICAgICAgICBpZiggZXJyb3IgaW5zdGFuY2VvZiBFcnJvciApe1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBmb3IgdGhlIGdpdmVuIHR5cGUgb2YgZXZlbnRcbiAgICBsaXN0ZW5lciA9IF9ldmVudHNbIHR5cGUgXTtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgbGlzdGVuaW5nIGZvciBhbGwgdHlwZXMgb2YgZXZlbnRzXG4gICAgaWYoIGVtaXRFdmVyeSApe1xuICAgICAgICBsaXN0ZW5lciA9IF9ldmVudHNbICRldmVyeSBdO1xuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGxpc3RlbmVyIHVzaW5nIHRoZSBpbnRlcm5hbCBgZXhlY3V0ZSpgIGZ1bmN0aW9ucyBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVMaXN0ZW5lclxuICogQHBhcmFtIHtBcnJheTxMaXN0ZW5lcj58TGlzdGVuZXJ9IGxpc3RlbmVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gKiBAcGFyYW0geyp9IHNjb3BlXG4gKi8gXG5mdW5jdGlvbiBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBzY29wZSApe1xuICAgIGNvbnN0IGlzRnVuY3Rpb24gPSB0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbic7XG4gICAgXG4gICAgc3dpdGNoKCBkYXRhLmxlbmd0aCApe1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBsaXN0ZW5FbXB0eSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpc3Rlbk9uZSAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsaXN0ZW5Ud28gICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBsaXN0ZW5UaHJlZSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0sIGRhdGFbIDIgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsaXN0ZW5NYW55ICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldEV2ZW50VHlwZXNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCBldmVudCB0eXBlcyB3aWxsIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBnZXRFdmVudFR5cGVzKCBlbWl0dGVyICl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCBlbWl0dGVyWyAkZXZlbnRzIF0gKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRNYXhMaXN0ZW5lcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCBtYXggbGlzdGVuZXJzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAqL1xuZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gIT09ICd1bmRlZmluZWQnID9cbiAgICAgICAgZW1pdHRlclsgJG1heExpc3RlbmVycyBdIDpcbiAgICAgICAgRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+aXNQb3NpdGl2ZU51bWJlclxuICogQHBhcmFtIHsqfSBudW1iZXIgVGhlIHZhbHVlIHRvIGJlIHRlc3RlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKi9cbmZ1bmN0aW9uIGlzUG9zaXRpdmVOdW1iZXIoIG51bWJlciApe1xuICAgIHJldHVybiB0eXBlb2YgbnVtYmVyID09PSAnbnVtYmVyJyAmJiBudW1iZXIgPj0gMCAmJiAhaXNOYU4oIG51bWJlciApO1xufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG5vIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlbkVtcHR5XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuRW1wdHkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG9uZSBhcmd1bWVudC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk9uZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5PbmUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdHdvIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblR3b1xuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblR3byggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0aHJlZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5UaHJlZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzMgVGhlIHRoaXJkIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5UaHJlZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBmb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuTWFueVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBhcmdzIEZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk1hbnkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZ3MgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5yZW1vdmVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBoYW5kbGVyID0gZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgXG4gICAgaWYoIGhhbmRsZXIgPT09IGxpc3RlbmVyIHx8ICggdHlwZW9mIGhhbmRsZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiYgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgXG4gICAgICAgIGZvciggbGV0IGkgPSBoYW5kbGVyLmxlbmd0aDsgaS0tID4gMDsgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyWyBpIF0gPT09IGxpc3RlbmVyIHx8ICggaGFuZGxlclsgaSBdLmxpc3RlbmVyICYmIGhhbmRsZXJbIGkgXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiggaW5kZXggPiAtMSApe1xuICAgICAgICAgICAgaWYoIGhhbmRsZXIubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3BsaWNlTGlzdCggaGFuZGxlciwgaW5kZXggKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c2V0TWF4TGlzdGVuZXJzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgd2lsbCBiZSBzZXQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gbWF4IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVmb3JlIGEgd2FybmluZyBpcyBpc3N1ZWQuXG4gKi9cbmZ1bmN0aW9uIHNldE1heExpc3RlbmVycyggZW1pdHRlciwgbWF4ICl7XG4gICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCBtYXggKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbWF4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgfVxuICAgIFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJG1heExpc3RlbmVycywge1xuICAgICAgICB2YWx1ZTogbWF4LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBGYXN0ZXIgdGhhbiBgQXJyYXkucHJvdG90eXBlLnNwbGljZWBcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNwbGljZUxpc3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGxpc3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovIFxuZnVuY3Rpb24gc3BsaWNlTGlzdCggbGlzdCwgaW5kZXggKXtcbiAgICBmb3IoIGxldCBpID0gaW5kZXgsIGogPSBpICsgMSwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGogPCBsZW5ndGg7IGkgKz0gMSwgaiArPSAxICl7XG4gICAgICAgIGxpc3RbIGkgXSA9IGxpc3RbIGogXTtcbiAgICB9XG4gICAgXG4gICAgbGlzdC5wb3AoKTtcbn1cblxuLyoqXG4gKiBBc3luY2hyb25vdXNseSBleGVjdXRlcyBhIGZ1bmN0aW9uLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dGlja1xuICogQHBhcmFtIHtleHRlcm5hbDpGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxuICovXG5mdW5jdGlvbiB0aWNrKCBjYWxsYmFjayApe1xuICAgIHJldHVybiBzZXRUaW1lb3V0KCBjYWxsYmFjaywgMCApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tBbGxFdmVudHNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7RXZlbnRQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiB0aGUgbGlzdGVuZXJzIGhhdmUgY29tcGxldGVkIGV4ZWN1dGlvbiBidXQgcmVqZWN0cyBpZiBhbiBlcnJvciB3YXMgdGhyb3duLlxuICovXG5mdW5jdGlvbiB0aWNrQWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICl7XG4gICAgICAgIHRpY2soIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICkgPyByZXNvbHZlKCkgOiByZWplY3QoKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgYHNlbGVjdGlvbmAgb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRvRW1pdHRlclxuICovXG5mdW5jdGlvbiB0b0VtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICl7XG4gICAgXG4gICAgLy8gQXBwbHkgdGhlIGVudGlyZSBFbWl0dGVyIEFQSVxuICAgIGlmKCBzZWxlY3Rpb24gPT09IEFQSSApe1xuICAgICAgICBhc0VtaXR0ZXIuY2FsbCggdGFyZ2V0ICk7XG4gICAgXG4gICAgLy8gQXBwbHkgb25seSB0aGUgc2VsZWN0ZWQgQVBJIG1ldGhvZHNcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaW5kZXgsIGtleSwgbWFwcGluZywgbmFtZXMsIHZhbHVlO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBzZWxlY3Rpb24gPT09ICdzdHJpbmcnICl7XG4gICAgICAgICAgICBuYW1lcyA9IHNlbGVjdGlvbi5zcGxpdCggJyAnICk7XG4gICAgICAgICAgICBtYXBwaW5nID0gQVBJO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmFtZXMgPSBPYmplY3Qua2V5cyggc2VsZWN0aW9uICk7XG4gICAgICAgICAgICBtYXBwaW5nID0gc2VsZWN0aW9uO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpbmRleCA9IG5hbWVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICBrZXkgPSBuYW1lc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhbHVlID0gbWFwcGluZ1sga2V5IF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRhcmdldFsga2V5IF0gPSB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgICAgIHZhbHVlIDpcbiAgICAgICAgICAgICAgICBBUElbIHZhbHVlIF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbmFsIG1peGluIHRoYXQgcHJvdmlkZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIGl0cyB0YXJnZXQuIFRoZSBgY29uc3RydWN0b3IoKWAsIGBkZXN0cm95KClgLCBgdG9KU09OKClgLCBgdG9TdHJpbmcoKWAsIGFuZCBzdGF0aWMgcHJvcGVydGllcyBvbiBgRW1pdHRlcmAgYXJlIG5vdCBwcm92aWRlZC4gVGhpcyBtaXhpbiBpcyB1c2VkIHRvIHBvcHVsYXRlIHRoZSBgcHJvdG90eXBlYCBvZiBgRW1pdHRlcmAuXG4gKiBcbiAqIExpa2UgYWxsIGZ1bmN0aW9uYWwgbWl4aW5zLCB0aGlzIHNob3VsZCBiZSBleGVjdXRlZCB3aXRoIFtjYWxsKCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2NhbGwpIG9yIFthcHBseSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9hcHBseSkuXG4gKiBAbWl4aW4gRW1pdHRlcn5hc0VtaXR0ZXJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIEVtaXR0ZXIgZnVuY3Rpb25hbGl0eTwvY2FwdGlvbj5cbiAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogXG4gKiAvLyBBcHBseSB0aGUgbWl4aW5cbiAqIGFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XG4gKiBcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICogLy8gSGVsbG8sIFdvcmxkIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgY2hhb3MgdG8geW91ciB3b3JsZDwvY2FwdGlvbj5cbiAqIC8vIE5PISEhXG4gKiBFbWl0dGVyLmFzRW1pdHRlcigpOyAvLyBNYWRuZXNzIGVuc3Vlc1xuICovXG5mdW5jdGlvbiBhc0VtaXR0ZXIoKXtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmF0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXggV2hlcmUgdGhlIGxpc3RlbmVyIHdpbGwgYmUgYWRkZWQgaW4gdGhlIHRyaWdnZXIgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqL1xuICAgIHRoaXMuYXQgPSBmdW5jdGlvbiggdHlwZSwgaW5kZXgsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiBpbmRleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIGlzUG9zaXRpdmVOdW1iZXIoIGluZGV4ICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdpbmRleCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuY2xlYXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIHtcbiAgICAgKiAgJ2hlbGxvJyA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApOyB9LFxuICAgICAqICAnaGknICAgIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIaSEnICk7IH1cbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhciggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqL1xuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgaGFuZGxlcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE5vIEV2ZW50c1xuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdpdGggbm8gXCJvZmZcIiBsaXN0ZW5lcnMsIGNsZWFyaW5nIGNhbiBiZSBzaW1wbGlmaWVkXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsZWFyIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVzID0gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBdm9pZCByZW1vdmluZyBcIm9mZlwiIGxpc3RlbmVycyB1bnRpbCBhbGwgb3RoZXIgdHlwZXMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICAgICAgICAgIGZvciggbGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGlmKCB0eXBlc1sgaW5kZXggXSA9PT0gJzpvZmYnICl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCB0eXBlc1sgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYW51YWxseSBjbGVhciBcIm9mZlwiXG4gICAgICAgICAgICB0aGlzLmNsZWFyKCAnOm9mZicgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlciApO1xuICAgICAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlclsgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZW1pdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7ICAgIC8vIHRydWVcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApOyAgLy8gZmFsc2VcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudCB3aXRoIGRhdGE8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhIG5hbWVzcGFjZWQgZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogLy8gVGhpcyBldmVudCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgYnkgZW1pdHRpbmcgXCJncmVldGluZzpoZWxsb1wiXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbyBhZ2FpbiwgJHsgbmFtZSB9YCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5ldmVudFR5cGVzXG4gICAgICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coIGBIaWAgKSApO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmV2ZW50VHlwZXMoKSApO1xuICAgICAqIC8vIFsgJ2hlbGxvJywgJ2hpJyBdXG4gICAgICovIFxuICAgIHRoaXMuZXZlbnRUeXBlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZmlyc3RcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICovXG4gICAgdGhpcy5maXJzdCA9IGZ1bmN0aW9uKCB0eXBlLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCAwICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5nZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldE1heExpc3RlbmVycyggdGhpcyApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyQ291bnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2hlbGxvJyApICk7XG4gICAgICogLy8gMVxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdnb29kYnllJyApICk7XG4gICAgICogLy8gMFxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgY291bnQ7XG5cbiAgICAgICAgLy8gRW1wdHlcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBjb3VudCA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyBGdW5jdGlvblxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgY291bnQgPSAxO1xuICAgICAgICBcbiAgICAgICAgLy8gQXJyYXlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvdW50ID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0ubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoZWxsbyA9IGZ1bmN0aW9uKCl7XG4gICAgICogIGNvbnNvbGUubG9nKCAnSGVsbG8hJyApO1xuICAgICAqIH0sXG4gICAgICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJzKCAnaGVsbG8nIClbIDAgXSA9PT0gaGVsbG8gKTtcbiAgICAgKiAvLyB0cnVlXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJzID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGxpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbIGhhbmRsZXIgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgKm1hbnkgdGltZSogbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuIEFmdGVyIHRoZSBsaXN0ZW5lciBpcyBpbnZva2VkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGB0aW1lc2AsIGl0IGlzIHJlbW92ZWQuXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubWFueVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYW55IGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdUZXJyeScgKTsgICAgICAvLyAyXG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ1N0ZXZlJyApOyAgICAgIC8vIDNcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gdGhlIHNwZWNpZmllZCBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgLy8gMlxuICAgICAqIC8vIEhlbGxvLCBUZXJyeSFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAvLyAzXG4gICAgICovIFxuICAgIHRoaXMubWFueSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdGltZXM7XG4gICAgICAgICAgICB0aW1lcyA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIHRpbWVzICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICd0aW1lcyBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgYGxpc3RlbmVyYCBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiBpdCBpcyBhc3N1bWVkIHRoZSBgbGlzdGVuZXJgIGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyBgdHlwZWAuXG4gICAgICogXG4gICAgICogSWYgYW55IHNpbmdsZSBsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCBtdWx0aXBsZSB0aW1lcyBmb3IgdGhlIHNwZWNpZmllZCBgdHlwZWAsIHRoZW4gYGVtaXR0ZXIub2ZmKClgIG11c3QgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHJlbW92ZSBlYWNoIGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vZmZcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9mZlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYW55IGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gZ3JlZXQoIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGluZ3MsICR7IG5hbWUgfSFgICk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ0plZmYnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGhlbGxvKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqLyBcbiAgICB0aGlzLm9mZiA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vblxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW5lciB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnV29ybGQnICk7XG4gICAgICovXG4gICAgdGhpcy5vbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCB0eXBlID0gYXJndW1lbnRzWyAwIF0gfHwgJGV2ZXJ5LFxuICAgICAgICAgICAgbGlzdGVuZXIgPSBhcmd1bWVudHNbIDEgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFR5cGUgbm90IHByb3ZpZGVkLCBmYWxsIGJhY2sgdG8gXCIkZXZlcnlcIlxuICAgICAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBsYWluIG9iamVjdCBvZiBldmVudCBiaW5kaW5nc1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIHR5cGUgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIE5hTiApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub25jZVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uY2UoICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiBvbmNlIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICovXG4gICAgdGhpcy5vbmNlID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgMSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnNldE1heExpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICovXG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQXN5bmNocm9ub3VzbHkgZW1pdHMgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuIFRoZSBsaXN0ZW5lcnMgd2lsbCBzdGlsbCBiZSBzeW5jaHJvbm91c2x5IGV4ZWN1dGVkIGluIHRoZSBzcGVjaWZpZWQgb3JkZXIuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBhIFByb21pc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRpY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiB0aGUgbGlzdGVuZXJzIGhhdmUgY29tcGxldGVkIGV4ZWN1dGlvbiBidXQgcmVqZWN0cyBpZiBhbiBlcnJvciB3YXMgdGhyb3duLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkFzeW5jaHJvbm91c2x5IGVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnaGVsbG8nICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnaGVsbG8gaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdnb29kYnllJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2dvb2RieWUgaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiAvLyBoZWxsbyBoZWFyZD8gdHJ1ZVxuICAgICAqIC8vIGdvb2RieWUgaGVhcmQ/IGZhbHNlXG4gICAgICovXG4gICAgdGhpcy50aWNrID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgcmV0dXJuIHRpY2tBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYGRhdGFgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudHJpZ2dlclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnaGVsbG8nLCBbICdXb3JsZCcgXSApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhpJywgWyAnTWFyaycgXSApO1xuICAgICAqIC8vIEhpLCBNYXJrIVxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGVsbG8nLCBbICdKZWZmJyBdICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLnRyaWdnZXIgPSBmdW5jdGlvbiggdHlwZSwgZGF0YSA9IFtdICl7XG4gICAgICAgIHJldHVybiBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkICp1bnRpbCogdGhlIGBsaXN0ZW5lcmAgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci51bnRpbFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdUZXJyeSc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScsICdUZXJyeScgKTtcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnQWFyb24nICk7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCAnaGVsbG8nLCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1dvcmxkJztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnTWFyaycgKTtcbiAgICAgKi9cbiAgICB0aGlzLnVudGlsID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbn1cblxuYXNFbWl0dGVyLmNhbGwoIEFQSSApO1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSB0YXJnZXQuXG4gKiBAZnVuY3Rpb24gRW1pdHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6T2JqZWN0fSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGB0YXJnZXRgLlxuICogQHBhcmFtIHtleHRlcmFsOk9iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3QgdG8gd2hpY2ggdGhlIEVtaXR0ZXIuanMgQVBJIHdpbGwgYmUgYXBwbGllZC5cbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGFsbCBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCBncmVldGVyICk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoICdlbWl0IG9uIG9mZicsIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+UmVtYXBwaW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoIHsgZmlyZTogJ2VtaXQnLCBhZGRMaXN0ZW5lcjogJ29uJyB9LCBncmVldGVyICk7XG4gKiBncmVldGVyLmFkZExpc3RlbmVyKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5maXJlKCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqL1xuIFxuLyoqXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGVtaXR0ZXIuIElmIGBtYXBwaW5nYCBhcmUgcHJvdmlkZWQgdGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcGFzc2VkIGludG8gYG9uKClgIG9uY2UgY29uc3RydWN0aW9uIGlzIGNvbXBsZXRlLlxuICogQGNsYXNzIEVtaXR0ZXJcbiAqIEBjbGFzc2Rlc2MgQW4gb2JqZWN0IHRoYXQgZW1pdHMgbmFtZWQgZXZlbnRzIHdoaWNoIGNhdXNlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZC5cbiAqIEBleHRlbmRzIEVtaXR0ZXJ+TnVsbFxuICogQG1peGVzIEVtaXR0ZXJ+YXNFbWl0dGVyXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gW21hcHBpbmddIEEgbWFwcGluZyBvZiBldmVudCB0eXBlcyB0byBldmVudCBsaXN0ZW5lcnMuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2V2ZW50cy5qc31cbiAqIEBleGFtcGxlIDxjYXB0aW9uPlVzaW5nIEVtaXR0ZXIgZGlyZWN0bHk8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgQ2xhc3NpY2FsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxuICogY2xhc3MgR3JlZXRlciBleHRlbmRzIEVtaXR0ZXIge1xuICogIGNvbnN0cnVjdG9yKCl7XG4gKiAgICAgIHN1cGVyKCk7XG4gKiAgICAgIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqICB9XG4gKiBcbiAqICBncmVldCggbmFtZSApe1xuICogICAgICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqICB9XG4gKiB9XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIFByb3RvdHlwYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBmdW5jdGlvbiBHcmVldGVyKCl7XG4gKiAgRW1pdHRlci5jYWxsKCB0aGlzICk7XG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogfVxuICogR3JlZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuICogXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gKiAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiB9O1xuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5OYW1lc3BhY2VkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gKiAvLyBIaSwgTWFyayFcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0aW5ncyA9IHtcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAqICB9LFxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XG4gKiBcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICogLy8gSGVsbG8sIEFhcm9uIVxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgIC8vIDJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEhlbGxvLCBUZXJyeSFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlcigpe1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBjb25zdHJ1Y3RvclxuICAgIGlmKCB0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25zdHJ1Y3RvciA9PT0gRW1pdHRlciApe1xuICAgICAgICBsZXQgbWFwcGluZyA9IGFyZ3VtZW50c1sgMCBdO1xuICAgICAgICB0eXBlb2YgbWFwcGluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCBtYXBwaW5nICk7XG4gICAgICAgIFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdtYXhMaXN0ZW5lcnMnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldE1heExpc3RlbmVycyggdGhpcyApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24oIG1heCApe1xuICAgICAgICAgICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgfSApO1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBmdW5jdGlvblxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBzZWxlY3Rpb24gPSBhcmd1bWVudHNbIDAgXSxcbiAgICAgICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzXG4gICAgICAgIGlmKCB0eXBlb2YgdGFyZ2V0ID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGFyZ2V0ID0gc2VsZWN0aW9uO1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gQVBJO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0b0VtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICk7XG4gICAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggRW1pdHRlciwge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciBhbGwgZW1pdHRlcnMuIFVzZSBgZW1pdHRlci5tYXhMaXN0ZW5lcnNgIHRvIHNldCB0aGUgbWF4aW11bSBvbiBhIHBlci1pbnN0YW5jZSBiYXNpcy5cbiAgICAgKiBcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZW50IGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGEgc3BlY2lmaWMgZXZlbnQgdHlwZS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycz0xMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNoYW5naW5nIHRoZSBkZWZhdWx0IG1heGltdW0gbGlzdGVuZXJzPC9jYXB0aW9uPlxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgKTtcbiAgICAgKiAvLyAxMFxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIxID0gbmV3IEVtaXR0ZXIoKSxcbiAgICAgKiAgZ3JlZXRlcjIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDE7XG4gICAgICogXG4gICAgICogZ3JlZXRlcjEub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMi5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBhbGVydCggJ0hpIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGlcIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqL1xuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnM6IHtcbiAgICAgICAgdmFsdWU6IDEwLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIHN5bWJvbCB1c2VkIHRvIGxpc3RlbiBmb3IgZXZlbnRzIG9mIGFueSBgdHlwZWAuIEZvciBfbW9zdF8gbWV0aG9kcywgd2hlbiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhpcyBpcyB0aGUgZGVmYXVsdC5cbiAgICAgKiBcbiAgICAgKiBVc2luZyBgRW1pdHRlci5ldmVyeWAgaXMgdHlwaWNhbGx5IG5vdCBuZWNlc3NhcnkuXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3ltYm9sfSBFbWl0dGVyLmV2ZXJ5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBFbWl0dGVyLmV2ZXJ5LCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICovXG4gICAgZXZlcnk6IHtcbiAgICAgICAgdmFsdWU6ICRldmVyeSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mICpFbWl0dGVyLmpzKi5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEVtaXR0ZXIudmVyc2lvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIudmVyc2lvbiApO1xuICAgICAqIC8vIDIuMC4wXG4gICAgICovXG4gICAgdmVyc2lvbjoge1xuICAgICAgICB2YWx1ZTogJzIuMC4wJyxcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH1cbn0gKTtcblxuRW1pdHRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5FbWl0dGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVtaXR0ZXI7XG5cbmFzRW1pdHRlci5jYWxsKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuXG4vKipcbiAqIERlc3Ryb3lzIHRoZSBlbWl0dGVyLlxuICogQGZpcmVzIEVtaXR0ZXIjOmRlc3Ryb3lcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgZW1pdEV2ZW50KCB0aGlzLCAnOmRlc3Ryb3knLCBbXSwgdHJ1ZSApO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSB0aGlzLmF0ID0gdGhpcy5jbGVhciA9IHRoaXMuZW1pdCA9IHRoaXMuZXZlbnRUeXBlcyA9IHRoaXMuZmlyc3QgPSB0aGlzLmdldE1heExpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJDb3VudCA9IHRoaXMubGlzdGVuZXJzID0gdGhpcy5tYW55ID0gdGhpcy5vZmYgPSB0aGlzLm9uID0gdGhpcy5vbmNlID0gdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSB0aGlzLnRpY2sgPSB0aGlzLnRyaWdnZXIgPSB0aGlzLnVudGlsID0gbm9vcDtcbiAgICB0aGlzLnRvSlNPTiA9ICgpID0+ICdkZXN0cm95ZWQnO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBbiBwbGFpbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVtaXR0ZXIuXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XG4gKiAvLyB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH1cbiAqIFxuICogZ3JlZXRlci5kZXN0cm95KCk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XG4gKiAvLyBcImRlc3Ryb3llZFwiXG4gKi9cbkVtaXR0ZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc3QganNvbiA9IG5ldyBOdWxsKCksXG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIHRoaXNbICRldmVudHMgXSApLFxuICAgICAgICBsZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgICAgIFxuICAgIGxldCBpbmRleCA9IDAsXG4gICAgICAgIHR5cGU7XG4gICAgXG4gICAganNvbi5tYXhMaXN0ZW5lcnMgPSB0aGlzLm1heExpc3RlbmVycztcbiAgICBqc29uLmxpc3RlbmVyQ291bnQgPSBuZXcgTnVsbCgpO1xuICAgIFxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIGluZGV4IF07XG4gICAgICAgIGpzb24ubGlzdGVuZXJDb3VudFsgdHlwZSBdID0gdGhpcy5saXN0ZW5lckNvdW50KCB0eXBlICk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgeyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9J1xuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgXCJkZXN0cm95ZWRcIidcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBgJHsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIH0gJHsgSlNPTi5zdHJpbmdpZnkoIHRoaXMudG9KU09OKCkgKSB9YC50cmltKCk7XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==