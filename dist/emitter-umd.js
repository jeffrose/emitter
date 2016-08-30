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
     * A set of method references to the Emitter.js API.
     * @typedef {external:string|external:Object} APIReference
     * @example <caption>A selection reference</caption>
     * 'emit off on once'
     * @example <caption>A mapping reference</caption>
     * // 'emit()' will be mapped to 'fire()'
     * // 'on()' will be mapped to 'addListener()'
     * // 'off()' will be mapped to 'removeListener()'
     * {
     *  fire: 'emit',
     *  addListener: 'on',
     *  removeListener: 'off'
     * }
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
     * A {@link external:string} or {@link external:symbol} that represents the type of event fired by the Emitter.
     * @typedef {external:string|external:symbol} EventType
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

        // Define the event registry if it does not exist
        defineEventsProperty(emitter, new Null());

        var _events = emitter[$events];

        if (_events[':on']) {
            emitEvent(emitter, ':on', [type, typeof listener.listener === 'function' ? listener.listener : listener], false);

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
                emitEvent(emitter, ':maxListeners', [type, listener], false);

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
        executed = type && emitEvent(emitter, type, data, type !== $every) || executed;

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
        var _events = emitter[$events];

        var executed = false,
            listener = void 0;

        if (typeof _events !== 'undefined') {
            if (type === 'error' && !_events.error) {
                if (data[0] instanceof Error) {
                    throw data[0];
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
        var handler = emitter[$events][type];

        if (handler === listener || typeof handler.listener === 'function' && handler.listener === listener) {
            delete emitter[$events][type];
            if (emitter[$events][':off']) {
                emitEvent(emitter, ':off', [type, listener], false);
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
                    emitEvent(emitter, ':off', [type, listener], false);
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
     * @returns {external:Promise} A promise which *resolves* if the event had listeners, *rejects* otherwise.
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
     * @param {APIReference} [selection] A selection of the Emitter.js API.
     * @param {external:Object} target The object on which the API will be applied.
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
     * @since 1.1.0
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
     * asEmitter(); // Madness ensues
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
         * @since 2.0.0
         * @fires Emitter#:on
         * @fires Emitter#:maxListeners
         */
        this.at = function () {
            var type = arguments.length <= 0 || arguments[0] === undefined ? $every : arguments[0];
            var index = arguments[1];
            var listener = arguments[2];

            // Shift arguments if type is not provided
            if (typeof type === 'number' && typeof index === 'function' && typeof listener === 'undefined') {
                listener = index;
                index = type;
                type = $every;
            }

            if (!isPositiveNumber(index)) {
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
         * @since 1.0.0
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
         * @since 1.0.0
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
            var data = [],
                length = arguments.length;

            if (length > 1) {
                data = Array(length - 1);

                for (var key = 1; key < length; key++) {
                    data[key - 1] = arguments[key];
                }
            }

            return emitAllEvents(this, type, data);
        };

        /**
         * @function Emitter~asEmitter.eventTypes
         * @returns {Array<EventType>} The list of event types registered to the emitter.
         * @since 2.0.0
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
         * @since 2.0.0
         */
        this.first = function () {
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

            addEventListener(this, type, listener, 0);

            return this;
        };

        /**
         * By default Emitter will emit a `:maxListeners` evet if more than **10** listeners are added for a particular event `type`. This method returns the current value.
         * @function Emitter~asEmitter.getMaxListeners
         * @returns {external:number} The maximum number of listeners.
         * @since 2.0.0
         * @example
         * const greeter = new Emitter();
         * 
         * console.log( greeter.getMaxListeners() );
         * // 10
         * 
         * greeter.setMaxListeners( 5 );
         * 
         * console.log( greeter.getMaxListeners() );
         * // 5
         */
        this.getMaxListeners = function () {
            return getMaxListeners(this);
        };

        /**
         * @function Emitter~asEmitter.listenerCount
         * @param {EventType} type The event type.
         * @returns {external:number} The number of listeners for that event type within the given emitter.
         * @since 1.0.0
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
         * @since 1.0.0
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
         * @since 1.0.0
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
         * @since 1.0.0
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
         * @since 1.0.0
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
         * @since 1.0.0
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
         * By default Emitter will emit a `:maxListeners` evet if more than **10** listeners are added for a particular event `type`. This method allows that to be changed. Set to **0** for unlimited.
         * @function Emitter~asEmitter.setMaxListeners
         * @param {external:number} max The maximum number of listeners before a warning is issued.
         * @returns {Emitter} The emitter.
         * @since 2.0.0
         * @example
         * const greeter = new Emitter();
         * 
         * greeter.setMaxListeners( 1 );
         * 
         * greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
         * greeter.on( 'hello', () => console.log( 'Hello!' ) );
         * greeter.on( 'hello', () => alert( 'Hello!' ) );
         * // Greeting "hello" has one too many!
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
         * Returns {@link external:Promise|promise} which *resolves* if the event had listeners, *rejects* otherwise.
         * @function Emitter~asEmitter.tick
         * @param {EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @returns {external:Promise} A promise which *resolves* if the event had listeners, *rejects* otherwise.
         * @since 2.0.0
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
            var data = [],
                length = arguments.length;

            if (length > 1) {
                data = Array(length - 1);

                for (var key = 1; key < length; key++) {
                    data[key - 1] = arguments[key];
                }
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
         * @since 1.0.0
         * @example
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
         * @since 1.2.0
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
     * @param {APIReference} [selection] A selection of the Emitter.js API that will be applied to the `target`.
     * @param {exteral:Object} target The object to which the Emitter.js API will be applied.
     * @since 2.0.0
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
     * @param {EventMapping} [mapping] A mapping of event types to event listeners.
     * @classdesc An object that emits named events which cause functions to be executed.
     * @extends Emitter~Null
     * @mixes Emitter~asEmitter
     * @see {@link https://github.com/nodejs/node/blob/master/lib/events.js}
     * @since 1.0.0
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

            /**
             * By default Emitters will emit a `:maxListeners` event if more than **10** listeners are added for a particular event `type`. This property allows that to be changed. Set to **0** for unlimited.
             * @member {external:number} Emitter#maxListeners
             * @since 1.0.0
             * @example
             * const greeter = new Emitter();
             * 
             * console.log( greeter.maxListeners );
             * // 10
             * 
             * greeter.maxListeners = 1;
             * 
             * greeter.on( ':maxListeners', ( greeting ) => console.log( `Greeting "${ greeting }" has one too many!` ) );
             * greeter.on( 'hello', () => console.log( 'Hello!' ) );
             * greeter.on( 'hello', () => alert( 'Hello!' ) );
             * // Greeting "hello" has one too many!
             */
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

            typeof mapping !== 'undefined' && addEventMapping(this, mapping);

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
         * @since 1.0.0
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
         */
        defaultMaxListeners: {
            value: 10,
            configurable: true,
            enumerable: false,
            writable: true
        },
        /**
         * An id used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.
         * 
         * Listener bound to every event will **not** execute for Emitter lifecycle events, like `:maxListeners`.
         * 
         * Using `Emitter.every` is typically not necessary.
         * @member {external:symbol} Emitter.every
         * @since 1.0.0
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
         * @since 1.1.2
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
     * @since 1.0.0
     * @fires Emitter#:destroy
     */
    Emitter.prototype.destroy = function () {
        emitEvent(this, ':destroy', [], false);
        this.clear();
        delete this.maxListeners;
        this.destroy = this.at = this.clear = this.emit = this.eventTypes = this.first = this.getMaxListeners = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.setMaxListeners = this.tick = this.trigger = this.until = noop;
        this.toJSON = function () {
            return 'destroyed';
        };
    };

    /**
     * @returns {external:Object} An plain object representation of the emitter.
     * @since 1.3.0
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
     * @since 1.3.0
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOzs7Ozs7QUFNQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7Ozs7O3NCQXUzQ3dCQSxPOzs7Ozs7OztBQWwzQ3hCLGFBQVNDLElB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QSxZQUF6QjtBQUNBNEYsYUFBS2YsYUFBTCxHQUFxQixJQUFJaEgsSUFBSixFQUFyQjs7QUFFQSxlQUFPc0IsUUFBUWMsTUFBZixFQUF1QmQsT0FBdkIsRUFBZ0M7QUFDNUJULG1CQUFPNkIsTUFBT3BCLEtBQVAsQ0FBUDtBQUNBeUcsaUJBQUtmLGFBQUwsQ0FBb0JuRyxJQUFwQixJQUE2QixLQUFLbUcsYUFBTCxDQUFvQm5HLElBQXBCLENBQTdCO0FBQ0g7O0FBRUQsZUFBT2tILElBQVA7QUFDSCxLQWpCRDs7QUFtQkE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBaEksWUFBUUUsU0FBUixDQUFrQitILFFBQWxCLEdBQTZCLFlBQVU7QUFDbkMsZUFBTyxDQUFJLEtBQUs1SCxXQUFMLENBQWlCNkgsSUFBckIsU0FBK0JDLEtBQUtDLFNBQUwsQ0FBZ0IsS0FBS0wsTUFBTCxFQUFoQixDQUEvQixFQUFrRU0sSUFBbEUsRUFBUDtBQUNILEtBRkQiLCJmaWxlIjoiZW1pdHRlci11bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSmF2YVNjcmlwdCBBcnJheVxuICogQGV4dGVybmFsIEFycmF5XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1BybTQ1NG11bjMhaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cbiAqIEBleHRlcm5hbCBib29sZWFuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRXJyb3JcbiAqIEBleHRlcm5hbCBFcnJvclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxuICogQGV4dGVybmFsIEZ1bmN0aW9uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcbiAqIEBleHRlcm5hbCBudW1iZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCBudWxsXG4gKiBAZXh0ZXJuYWwgbnVsbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvbnVsbH1cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxuICogQGV4dGVybmFsIE9iamVjdFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0fVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCBQcm9taXNlXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJvbWlzZX1cbiAqL1xuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXG4gKiBAZXh0ZXJuYWwgc3RyaW5nXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XG4gKi9cbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzeW1ib2xcbiAqIEBleHRlcm5hbCBzeW1ib2xcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N5bWJvbH1cbiAqL1xuXG4vKipcbiAqIEEgc2V0IG9mIG1ldGhvZCByZWZlcmVuY2VzIHRvIHRoZSBFbWl0dGVyLmpzIEFQSS5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6T2JqZWN0fSBBUElSZWZlcmVuY2VcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkEgc2VsZWN0aW9uIHJlZmVyZW5jZTwvY2FwdGlvbj5cbiAqICdlbWl0IG9mZiBvbiBvbmNlJ1xuICogQGV4YW1wbGUgPGNhcHRpb24+QSBtYXBwaW5nIHJlZmVyZW5jZTwvY2FwdGlvbj5cbiAqIC8vICdlbWl0KCknIHdpbGwgYmUgbWFwcGVkIHRvICdmaXJlKCknXG4gKiAvLyAnb24oKScgd2lsbCBiZSBtYXBwZWQgdG8gJ2FkZExpc3RlbmVyKCknXG4gKiAvLyAnb2ZmKCknIHdpbGwgYmUgbWFwcGVkIHRvICdyZW1vdmVMaXN0ZW5lcigpJ1xuICoge1xuICogIGZpcmU6ICdlbWl0JyxcbiAqICBhZGRMaXN0ZW5lcjogJ29uJyxcbiAqICByZW1vdmVMaXN0ZW5lcjogJ29mZidcbiAqIH1cbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufCBmdW5jdGlvbn0gYm91bmQgdG8gYW4gZW1pdHRlciB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGV9LiBBbnkgZGF0YSB0cmFuc21pdHRlZCB3aXRoIHRoZSBldmVudCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lciBhcyBhcmd1bWVudHMuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7Li4uKn0gZGF0YSBUaGUgYXJndW1lbnRzIHBhc3NlZCBieSB0aGUgYGVtaXRgLlxuICovXG5cbi8qKlxuICogQW4ge0BsaW5rIGV4dGVybmFsOk9iamVjdHxvYmplY3R9IHRoYXQgbWFwcyB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGVzfSB0byB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxldmVudCBsaXN0ZW5lcnN9LlxuICogQHR5cGVkZWYge2V4dGVybmFsOk9iamVjdH0gRXZlbnRNYXBwaW5nXG4gKi9cblxuLyoqXG4gKiBBIHtAbGluayBleHRlcm5hbDpzdHJpbmd9IG9yIHtAbGluayBleHRlcm5hbDpzeW1ib2x9IHRoYXQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiBldmVudCBmaXJlZCBieSB0aGUgRW1pdHRlci5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6c3ltYm9sfSBFdmVudFR5cGVcbiAqLyBcblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYW4gZW1pdHRlciBkZXN0cm95cyBpdHNlbGYuXG4gKiBAZXZlbnQgRW1pdHRlciM6ZGVzdHJveVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYWZ0ZXJfIGEgbGlzdGVuZXIgaXMgcmVtb3ZlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvZmZcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhIGxpc3RlbmVyIGlzIGFkZGVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9uXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGhhcyBiZWVuIGV4Y2VlZGVkIGZvciBhbiBldmVudCB0eXBlLlxuICogQGV2ZW50IEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBFbWl0dGVyfk51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsO1xuXG5jb25zdFxuICAgICRldmVudHMgICAgICAgPSAnQEBlbWl0dGVyL2V2ZW50cycsXG4gICAgJGV2ZXJ5ICAgICAgICA9ICdAQGVtaXR0ZXIvZXZlcnknLFxuICAgICRtYXhMaXN0ZW5lcnMgPSAnQEBlbWl0dGVyL21heExpc3RlbmVycycsXG4gICAgXG4gICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgIFxuICAgIG5vb3AgPSBmdW5jdGlvbigpe30sXG4gICAgXG4gICAgQVBJID0gbmV3IE51bGwoKTtcblxuLy8gTWFueSBvZiB0aGVzZSBmdW5jdGlvbnMgYXJlIGJyb2tlbiBvdXQgZnJvbSB0aGUgcHJvdG90eXBlIGZvciB0aGUgc2FrZSBvZiBvcHRpbWl6YXRpb24uIFRoZSBmdW5jdGlvbnMgb24gdGhlIHByb3RveXR5cGVcbi8vIHRha2UgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYXMgYSByZXN1bHQuIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIGEgZml4ZWQgbnVtYmVyIG9mIGFyZ3VtZW50c1xuLy8gYW5kIHRoZXJlZm9yZSBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLlxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGNvbmRpdGlvbmFsTGlzdGVuZXIoKXtcbiAgICAgICAgY29uc3QgZG9uZSA9IGxpc3RlbmVyLmFwcGx5KCBlbWl0dGVyLCBhcmd1bWVudHMgKTtcbiAgICAgICAgaWYoIGRvbmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPIENoZWNrIGJleW9uZCBqdXN0IG9uZSBsZXZlbCBvZiBsaXN0ZW5lciByZWZlcmVuY2VzXG4gICAgY29uZGl0aW9uYWxMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyLmxpc3RlbmVyIHx8IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIsIE5hTiApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICl7XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIH1cbiAgICBcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGlmKCBfZXZlbnRzWyAnOm9uJyBdICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvbicsIFsgdHlwZSwgdHlwZW9mIGxpc3RlbmVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lciBdLCBmYWxzZSApO1xuICAgICAgICBcbiAgICAgICAgLy8gRW1pdHRpbmcgXCJvblwiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICBfZXZlbnRzWyAnOm9uJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9uJyBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICBpZiggIV9ldmVudHNbIHR5cGUgXSApe1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBsaXN0ZW5lcjtcbiAgICBcbiAgICAvLyBNdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIF9ldmVudHNbIHR5cGUgXSApICl7XG4gICAgICAgIHN3aXRjaCggaXNOYU4oIGluZGV4ICkgfHwgaW5kZXggKXtcbiAgICAgICAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0udW5zaGlmdCggbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnNwbGljZSggaW5kZXgsIDAsIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICBcbiAgICAvLyBUcmFuc2l0aW9uIGZyb20gc2luZ2xlIHRvIG11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGluZGV4ID09PSAwID9cbiAgICAgICAgICAgIFsgbGlzdGVuZXIsIF9ldmVudHNbIHR5cGUgXSBdIDpcbiAgICAgICAgICAgIFsgX2V2ZW50c1sgdHlwZSBdLCBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBUcmFjayB3YXJuaW5ncyBpZiBtYXggbGlzdGVuZXJzIGlzIGF2YWlsYWJsZVxuICAgIGlmKCAnbWF4TGlzdGVuZXJzJyBpbiBlbWl0dGVyICYmICFfZXZlbnRzWyB0eXBlIF0ud2FybmVkICl7XG4gICAgICAgIGNvbnN0IG1heCA9IGVtaXR0ZXIubWF4TGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoIG1heCAmJiBtYXggPiAwICYmIF9ldmVudHNbIHR5cGUgXS5sZW5ndGggPiBtYXggKXtcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzptYXhMaXN0ZW5lcnMnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIGZhbHNlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEVtaXR0aW5nIFwibWF4TGlzdGVuZXJzXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgICAgICBfZXZlbnRzWyAnOm1heExpc3RlbmVycycgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzptYXhMaXN0ZW5lcnMnIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVtaXR0ZXJbICRldmVudHMgXSA9IF9ldmVudHM7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRmluaXRlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICBcbiAgICBmdW5jdGlvbiBmaW5pdGVMaXN0ZW5lcigpe1xuICAgICAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIHJldHVybiAtLXRpbWVzID09PSAwO1xuICAgIH1cbiAgICBcbiAgICBmaW5pdGVMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgZmluaXRlTGlzdGVuZXIgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudE1hcHBpbmdcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBtYXBwaW5nIFRoZSBldmVudCBtYXBwaW5nLlxuICovXG5mdW5jdGlvbiBhZGRFdmVudE1hcHBpbmcoIGVtaXR0ZXIsIG1hcHBpbmcgKXtcbiAgICBjb25zdFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCBtYXBwaW5nICksXG4gICAgICAgIHR5cGVMZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgXG4gICAgbGV0IHR5cGVJbmRleCA9IDAsXG4gICAgICAgIGhhbmRsZXIsIGhhbmRsZXJJbmRleCwgaGFuZGxlckxlbmd0aCwgdHlwZTtcbiAgICBcbiAgICBmb3IoIDsgdHlwZUluZGV4IDwgdHlwZUxlbmd0aDsgdHlwZUluZGV4ICs9IDEgKXtcbiAgICAgICAgdHlwZSA9IHR5cGVzWyB0eXBlSW5kZXggXTtcbiAgICAgICAgaGFuZGxlciA9IG1hcHBpbmdbIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIC8vIExpc3Qgb2YgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGhhbmRsZXJJbmRleCA9IDA7XG4gICAgICAgICAgICBoYW5kbGVyTGVuZ3RoID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIDsgaGFuZGxlckluZGV4IDwgaGFuZGxlckxlbmd0aDsgaGFuZGxlckluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyWyBoYW5kbGVySW5kZXggXSwgTmFOICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXIsIE5hTiApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmRlZmluZUV2ZW50c1Byb3BlcnR5XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIHByb3BlcnR5IHdpbGwgYmUgY3JlYXRlZC5cbiAqLyBcbmZ1bmN0aW9uIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCB2YWx1ZSApe1xuICAgIGNvbnN0IGhhc0V2ZW50cyA9IGhhc093blByb3BlcnR5LmNhbGwoIGVtaXR0ZXIsICRldmVudHMgKSxcbiAgICAgICAgZW1pdHRlclByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiggZW1pdHRlciApO1xuICAgICAgICBcbiAgICBpZiggIWhhc0V2ZW50cyB8fCAoIGVtaXR0ZXJQcm90b3R5cGUgJiYgZW1pdHRlclsgJGV2ZW50cyBdID09PSBlbWl0dGVyUHJvdG90eXBlWyAkZXZlbnRzIF0gKSApe1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRldmVudHMsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0QWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIC8vIElmIHR5cGUgaXMgbm90IGEgc3RyaW5nLCBpbmRleCB3aWxsIGJlIGZhbHNlXG4gICAgICAgIGluZGV4ID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIFxuICAgIC8vIE5hbWVzcGFjZWQgZXZlbnQsIGUuZy4gRW1pdCBcImZvbzpiYXI6cXV4XCIsIHRoZW4gXCJmb286YmFyXCJcbiAgICB3aGlsZSggaW5kZXggPiAwICl7XG4gICAgICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZmFsc2UgKSApIHx8IGV4ZWN1dGVkO1xuICAgICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoIDAsIGluZGV4ICk7XG4gICAgICAgIGluZGV4ID0gdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVtaXQgc2luZ2xlIGV2ZW50IG9yIHRoZSBuYW1lc3BhY2VkIGV2ZW50IHJvb3QsIGUuZy4gXCJmb29cIiwgXCI6YmFyXCIsIFN5bWJvbCggXCJAQHF1eFwiIClcbiAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIHR5cGUgIT09ICRldmVyeSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFcnJvcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgYGVycm9yc2Agd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtBcnJheTxleHRlcm5hbDpFcnJvcj59IGVycm9ycyBUaGUgYXJyYXkgb2YgZXJyb3JzIHRvIGJlIGVtaXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApe1xuICAgIGNvbnN0IGxlbmd0aCA9IGVycm9ycy5sZW5ndGg7XG4gICAgZm9yKCBsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICdlcnJvcicsIFsgZXJyb3JzWyBpbmRleCBdIF0sIGZhbHNlICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFdmVudFxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gZW1pdEV2ZXJ5IFdoZXRoZXIgb3Igbm90IGxpc3RlbmVycyBmb3IgYWxsIHR5cGVzIHdpbGwgYmUgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZW1pdEV2ZXJ5ICl7XG4gICAgY29uc3QgX2V2ZW50cyA9IGVtaXR0ZXJbICRldmVudHMgXTtcbiAgICBcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgbGlzdGVuZXI7XG4gICAgXG4gICAgaWYoIHR5cGVvZiBfZXZlbnRzICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICBpZiggdHlwZSA9PT0gJ2Vycm9yJyAmJiAhX2V2ZW50cy5lcnJvciApe1xuICAgICAgICAgICAgaWYoIGRhdGFbIDAgXSBpbnN0YW5jZW9mIEVycm9yICl7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGF0YVsgMCBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiB0eXBlIG9mIGV2ZW50XG4gICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgdHlwZSBdO1xuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBsaXN0ZW5pbmcgZm9yIGFsbCB0eXBlcyBvZiBldmVudHNcbiAgICAgICAgaWYoIGVtaXRFdmVyeSApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSBfZXZlbnRzWyAkZXZlcnkgXTtcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICAgICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBsaXN0ZW5lciB1c2luZyB0aGUgaW50ZXJuYWwgYGV4ZWN1dGUqYCBmdW5jdGlvbnMgYmFzZWQgb24gdGhlIG51bWJlciBvZiBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlTGlzdGVuZXJcbiAqIEBwYXJhbSB7QXJyYXk8TGlzdGVuZXI+fExpc3RlbmVyfSBsaXN0ZW5lclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICogQHBhcmFtIHsqfSBzY29wZVxuICovIFxuZnVuY3Rpb24gZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgc2NvcGUgKXtcbiAgICBjb25zdCBpc0Z1bmN0aW9uID0gdHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nO1xuICAgIFxuICAgIHN3aXRjaCggZGF0YS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgbGlzdGVuRW1wdHkgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBsaXN0ZW5PbmUgICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGlzdGVuVHdvICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgbGlzdGVuVGhyZWUgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdLCBkYXRhWyAyIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGlzdGVuTWFueSAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGEgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRFdmVudFR5cGVzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggZXZlbnQgdHlwZXMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXk8RXZlbnRUeXBlPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlcyggZW1pdHRlciApe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyggZW1pdHRlclsgJGV2ZW50cyBdICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0TWF4TGlzdGVuZXJzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggbWF4IGxpc3RlbmVycyB3aWxsIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIGdldE1heExpc3RlbmVycyggZW1pdHRlciApe1xuICAgIHJldHVybiB0eXBlb2YgZW1pdHRlclsgJG1heExpc3RlbmVycyBdICE9PSAndW5kZWZpbmVkJyA/XG4gICAgICAgIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSA6XG4gICAgICAgIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmlzUG9zaXRpdmVOdW1iZXJcbiAqIEBwYXJhbSB7Kn0gbnVtYmVyIFRoZSB2YWx1ZSB0byBiZSB0ZXN0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICovXG5mdW5jdGlvbiBpc1Bvc2l0aXZlTnVtYmVyKCBudW1iZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicgJiYgbnVtYmVyID49IDAgJiYgIWlzTmFOKCBudW1iZXIgKTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBubyBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5FbXB0eVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlbkVtcHR5KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBvbmUgYXJndW1lbnQuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5PbmVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuT25lKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHR3byBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5Ud29cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ud28oIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdGhyZWUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVGhyZWVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmczIFRoZSB0aGlyZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVGhyZWUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggZm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk1hbnlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gYXJncyBGb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5NYW55KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmdzICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+cmVtb3ZlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIgKXtcbiAgICBjb25zdCBoYW5kbGVyID0gZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgXG4gICAgaWYoIGhhbmRsZXIgPT09IGxpc3RlbmVyIHx8ICggdHlwZW9mIGhhbmRsZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiYgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCBmYWxzZSApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIFxuICAgICAgICBmb3IoIGxldCBpID0gaGFuZGxlci5sZW5ndGg7IGktLSA+IDA7ICl7XG4gICAgICAgICAgICBpZiggaGFuZGxlclsgaSBdID09PSBsaXN0ZW5lciB8fCAoIGhhbmRsZXJbIGkgXS5saXN0ZW5lciAmJiBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgaWYoIGluZGV4ID4gLTEgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwbGljZUxpc3QoIGhhbmRsZXIsIGluZGV4ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgZmFsc2UgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zZXRNYXhMaXN0ZW5lcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyB3aWxsIGJlIHNldC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cbiAqL1xuZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyLCBtYXggKXtcbiAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIG1heCApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdtYXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICB9XG4gICAgXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkbWF4TGlzdGVuZXJzLCB7XG4gICAgICAgIHZhbHVlOiBtYXgsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSApO1xufVxuXG4vKipcbiAqIEZhc3RlciB0aGFuIGBBcnJheS5wcm90b3R5cGUuc3BsaWNlYFxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c3BsaWNlTGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gbGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi8gXG5mdW5jdGlvbiBzcGxpY2VMaXN0KCBsaXN0LCBpbmRleCApe1xuICAgIGZvciggbGV0IGkgPSBpbmRleCwgaiA9IGkgKyAxLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaiA8IGxlbmd0aDsgaSArPSAxLCBqICs9IDEgKXtcbiAgICAgICAgbGlzdFsgaSBdID0gbGlzdFsgaiBdO1xuICAgIH1cbiAgICBcbiAgICBsaXN0LnBvcCgpO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGV4ZWN1dGVzIGEgZnVuY3Rpb24uXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRpY2soIGNhbGxiYWNrICl7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoIGNhbGxiYWNrLCAwICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dGlja0FsbEV2ZW50c1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBhc3luY2hyb25vdXNseSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gdGlja0FsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApe1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApe1xuICAgICAgICB0aWNrKCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZW1pdEFsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApID8gcmVzb2x2ZSgpIDogcmVqZWN0KCk7XG4gICAgICAgIH0gKTtcbiAgICB9ICk7XG59XG5cbi8qKlxuICogQXBwbGllcyBhIGBzZWxlY3Rpb25gIG9mIHRoZSBFbWl0dGVyLmpzIEFQSSB0byB0aGUgYHRhcmdldGAuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50b0VtaXR0ZXJcbiAqIEBwYXJhbSB7QVBJUmVmZXJlbmNlfSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkuXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3Qgb24gd2hpY2ggdGhlIEFQSSB3aWxsIGJlIGFwcGxpZWQuXG4gKi9cbmZ1bmN0aW9uIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKXtcbiAgICBcbiAgICAvLyBBcHBseSB0aGUgZW50aXJlIEVtaXR0ZXIgQVBJXG4gICAgaWYoIHNlbGVjdGlvbiA9PT0gQVBJICl7XG4gICAgICAgIGFzRW1pdHRlci5jYWxsKCB0YXJnZXQgKTtcbiAgICBcbiAgICAvLyBBcHBseSBvbmx5IHRoZSBzZWxlY3RlZCBBUEkgbWV0aG9kc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBpbmRleCwga2V5LCBtYXBwaW5nLCBuYW1lcywgdmFsdWU7XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIHNlbGVjdGlvbiA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgICAgIG5hbWVzID0gc2VsZWN0aW9uLnNwbGl0KCAnICcgKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBBUEk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lcyA9IE9iamVjdC5rZXlzKCBzZWxlY3Rpb24gKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBzZWxlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gbmFtZXMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgIGtleSA9IG5hbWVzWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSBtYXBwaW5nWyBrZXkgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgICAgdmFsdWUgOlxuICAgICAgICAgICAgICAgIEFQSVsgdmFsdWUgXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uYWwgbWl4aW4gdGhhdCBwcm92aWRlcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gaXRzIHRhcmdldC4gVGhlIGBjb25zdHJ1Y3RvcigpYCwgYGRlc3Ryb3koKWAsIGB0b0pTT04oKWAsIGB0b1N0cmluZygpYCwgYW5kIHN0YXRpYyBwcm9wZXJ0aWVzIG9uIGBFbWl0dGVyYCBhcmUgbm90IHByb3ZpZGVkLiBUaGlzIG1peGluIGlzIHVzZWQgdG8gcG9wdWxhdGUgdGhlIGBwcm90b3R5cGVgIG9mIGBFbWl0dGVyYC5cbiAqIFxuICogTGlrZSBhbGwgZnVuY3Rpb25hbCBtaXhpbnMsIHRoaXMgc2hvdWxkIGJlIGV4ZWN1dGVkIHdpdGggW2NhbGwoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vY2FsbCkgb3IgW2FwcGx5KCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2FwcGx5KS5cbiAqIEBtaXhpbiBFbWl0dGVyfmFzRW1pdHRlclxuICogQHNpbmNlIDEuMS4wXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBFbWl0dGVyIGZ1bmN0aW9uYWxpdHk8L2NhcHRpb24+XG4gKiAvLyBDcmVhdGUgYSBiYXNlIG9iamVjdFxuICogY29uc3QgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIFxuICogLy8gQXBwbHkgdGhlIG1peGluXG4gKiBhc0VtaXR0ZXIuY2FsbCggZ3JlZXRlciApO1xuICogXG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAqIC8vIEhlbGxvLCBXb3JsZCFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGNoYW9zIHRvIHlvdXIgd29ybGQ8L2NhcHRpb24+XG4gKiAvLyBOTyEhIVxuICogYXNFbWl0dGVyKCk7IC8vIE1hZG5lc3MgZW5zdWVzXG4gKi9cbmZ1bmN0aW9uIGFzRW1pdHRlcigpe1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuYXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleCBXaGVyZSB0aGUgbGlzdGVuZXIgd2lsbCBiZSBhZGRlZCBpbiB0aGUgdHJpZ2dlciBsaXN0LlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICovXG4gICAgdGhpcy5hdCA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBpbmRleCwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGluZGV4ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIGluZGV4ICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdpbmRleCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuY2xlYXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIHtcbiAgICAgKiAgJ2hlbGxvJyA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApOyB9LFxuICAgICAqICAnaGknICAgIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIaSEnICk7IH1cbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhciggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqL1xuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgaGFuZGxlcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE5vIEV2ZW50c1xuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdpdGggbm8gXCJvZmZcIiBsaXN0ZW5lcnMsIGNsZWFyaW5nIGNhbiBiZSBzaW1wbGlmaWVkXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsZWFyIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVzID0gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBdm9pZCByZW1vdmluZyBcIm9mZlwiIGxpc3RlbmVycyB1bnRpbCBhbGwgb3RoZXIgdHlwZXMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICAgICAgICAgIGZvciggbGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGlmKCB0eXBlc1sgaW5kZXggXSA9PT0gJzpvZmYnICl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCB0eXBlc1sgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYW51YWxseSBjbGVhciBcIm9mZlwiXG4gICAgICAgICAgICB0aGlzLmNsZWFyKCAnOm9mZicgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlciApO1xuICAgICAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlclsgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZW1pdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7ICAgIC8vIHRydWVcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApOyAgLy8gZmFsc2VcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudCB3aXRoIGRhdGE8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhIG5hbWVzcGFjZWQgZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogLy8gVGhpcyBldmVudCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgYnkgZW1pdHRpbmcgXCJncmVldGluZzpoZWxsb1wiXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbyBhZ2FpbiwgJHsgbmFtZSB9YCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGRhdGEgPSBbXSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICBpZiggbGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgZGF0YSA9IEFycmF5KCBsZW5ndGggLSAxICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggbGV0IGtleSA9IDE7IGtleSA8IGxlbmd0aDsga2V5KysgKXtcbiAgICAgICAgICAgICAgICBkYXRhWyBrZXkgLSAxIF0gPSBhcmd1bWVudHNbIGtleSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZW1pdEFsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmV2ZW50VHlwZXNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8RXZlbnRUeXBlPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCBgSGVsbG9gICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggYEhpYCApICk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZXZlbnRUeXBlcygpICk7XG4gICAgICogLy8gWyAnaGVsbG8nLCAnaGknIF1cbiAgICAgKi8gXG4gICAgdGhpcy5ldmVudFR5cGVzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5maXJzdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIDAgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQnkgZGVmYXVsdCBFbWl0dGVyIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmV0IGlmIG1vcmUgdGhhbiAqKjEwKiogbGlzdGVuZXJzIGFyZSBhZGRlZCBmb3IgYSBwYXJ0aWN1bGFyIGV2ZW50IGB0eXBlYC4gVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZ2V0TWF4TGlzdGVuZXJzXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmdldE1heExpc3RlbmVycygpICk7XG4gICAgICogLy8gMTBcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnNldE1heExpc3RlbmVycyggNSApO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmdldE1heExpc3RlbmVycygpICk7XG4gICAgICogLy8gNVxuICAgICAqL1xuICAgIHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldE1heExpc3RlbmVycyggdGhpcyApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyQ291bnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2hlbGxvJyApICk7XG4gICAgICogLy8gMVxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdnb29kYnllJyApICk7XG4gICAgICogLy8gMFxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgY291bnQ7XG5cbiAgICAgICAgLy8gRW1wdHlcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBjb3VudCA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyBGdW5jdGlvblxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgY291bnQgPSAxO1xuICAgICAgICBcbiAgICAgICAgLy8gQXJyYXlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvdW50ID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0ubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoZWxsbyA9IGZ1bmN0aW9uKCl7XG4gICAgICogIGNvbnNvbGUubG9nKCAnSGVsbG8hJyApO1xuICAgICAqIH0sXG4gICAgICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJzKCAnaGVsbG8nIClbIDAgXSA9PT0gaGVsbG8gKTtcbiAgICAgKiAvLyB0cnVlXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJzID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGxpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbIGhhbmRsZXIgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgKm1hbnkgdGltZSogbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuIEFmdGVyIHRoZSBsaXN0ZW5lciBpcyBpbnZva2VkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGB0aW1lc2AsIGl0IGlzIHJlbW92ZWQuXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubWFueVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYW55IGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdUZXJyeScgKTsgICAgICAvLyAyXG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ1N0ZXZlJyApOyAgICAgIC8vIDNcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gdGhlIHNwZWNpZmllZCBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgLy8gMlxuICAgICAqIC8vIEhlbGxvLCBUZXJyeSFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAvLyAzXG4gICAgICovIFxuICAgIHRoaXMubWFueSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdGltZXM7XG4gICAgICAgICAgICB0aW1lcyA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIHRpbWVzICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICd0aW1lcyBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgYGxpc3RlbmVyYCBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiBpdCBpcyBhc3N1bWVkIHRoZSBgbGlzdGVuZXJgIGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyBgdHlwZWAuXG4gICAgICogXG4gICAgICogSWYgYW55IHNpbmdsZSBsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCBtdWx0aXBsZSB0aW1lcyBmb3IgdGhlIHNwZWNpZmllZCBgdHlwZWAsIHRoZW4gYGVtaXR0ZXIub2ZmKClgIG11c3QgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHJlbW92ZSBlYWNoIGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vZmZcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9mZlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYW55IGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gZ3JlZXQoIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGluZ3MsICR7IG5hbWUgfSFgICk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ0plZmYnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGhlbGxvKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqLyBcbiAgICB0aGlzLm9mZiA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vblxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW5lciB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnV29ybGQnICk7XG4gICAgICovXG4gICAgdGhpcy5vbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCB0eXBlID0gYXJndW1lbnRzWyAwIF0gfHwgJGV2ZXJ5LFxuICAgICAgICAgICAgbGlzdGVuZXIgPSBhcmd1bWVudHNbIDEgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFR5cGUgbm90IHByb3ZpZGVkLCBmYWxsIGJhY2sgdG8gXCIkZXZlcnlcIlxuICAgICAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBsYWluIG9iamVjdCBvZiBldmVudCBiaW5kaW5nc1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIHR5cGUgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIE5hTiApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub25jZVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uY2UoICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiBvbmNlIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICovXG4gICAgdGhpcy5vbmNlID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgMSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQnkgZGVmYXVsdCBFbWl0dGVyIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmV0IGlmIG1vcmUgdGhhbiAqKjEwKiogbGlzdGVuZXJzIGFyZSBhZGRlZCBmb3IgYSBwYXJ0aWN1bGFyIGV2ZW50IGB0eXBlYC4gVGhpcyBtZXRob2QgYWxsb3dzIHRoYXQgdG8gYmUgY2hhbmdlZC4gU2V0IHRvICoqMCoqIGZvciB1bmxpbWl0ZWQuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnNldE1heExpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnNldE1heExpc3RlbmVycyggMSApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGFsZXJ0KCAnSGVsbG8hJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICovXG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQXN5bmNocm9ub3VzbHkgZW1pdHMgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuIFRoZSBsaXN0ZW5lcnMgd2lsbCBzdGlsbCBiZSBzeW5jaHJvbm91c2x5IGV4ZWN1dGVkIGluIHRoZSBzcGVjaWZpZWQgb3JkZXIuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyB7QGxpbmsgZXh0ZXJuYWw6UHJvbWlzZXxwcm9taXNlfSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50aWNrXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZX0gQSBwcm9taXNlIHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+QXN5bmNocm9ub3VzbHkgZW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdoZWxsbycgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdoZWxsbyBoZWFyZD8gJywgaGVhcmQgKSApO1xuICAgICAqIGdyZWV0ZXIudGljayggJ2dvb2RieWUnICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnZ29vZGJ5ZSBoZWFyZD8gJywgaGVhcmQgKSApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIC8vIGhlbGxvIGhlYXJkPyB0cnVlXG4gICAgICogLy8gZ29vZGJ5ZSBoZWFyZD8gZmFsc2VcbiAgICAgKi9cbiAgICB0aGlzLnRpY2sgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgZGF0YSA9IFtdLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIGlmKCBsZW5ndGggPiAxICl7XG4gICAgICAgICAgICBkYXRhID0gQXJyYXkoIGxlbmd0aCAtIDEgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCBsZXQga2V5ID0gMTsga2V5IDwgbGVuZ3RoOyBrZXkrKyApe1xuICAgICAgICAgICAgICAgIGRhdGFbIGtleSAtIDEgXSA9IGFyZ3VtZW50c1sga2V5IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aWNrQWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGBkYXRhYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRyaWdnZXJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnaGVsbG8nLCBbICdXb3JsZCcgXSApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhpJywgWyAnTWFyaycgXSApO1xuICAgICAqIC8vIEhpLCBNYXJrIVxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGVsbG8nLCBbICdKZWZmJyBdICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLnRyaWdnZXIgPSBmdW5jdGlvbiggdHlwZSwgZGF0YSA9IFtdICl7XG4gICAgICAgIHJldHVybiBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkICp1bnRpbCogdGhlIGBsaXN0ZW5lcmAgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci51bnRpbFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjIuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdUZXJyeSc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScsICdUZXJyeScgKTtcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnQWFyb24nICk7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCAnaGVsbG8nLCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1dvcmxkJztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnTWFyaycgKTtcbiAgICAgKi9cbiAgICB0aGlzLnVudGlsID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbn1cblxuYXNFbWl0dGVyLmNhbGwoIEFQSSApO1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSB0YXJnZXQuXG4gKiBAZnVuY3Rpb24gRW1pdHRlclxuICogQHBhcmFtIHtBUElSZWZlcmVuY2V9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSSB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgYHRhcmdldGAuXG4gKiBAcGFyYW0ge2V4dGVyYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCB0byB3aGljaCB0aGUgRW1pdHRlci5qcyBBUEkgd2lsbCBiZSBhcHBsaWVkLlxuICogQHNpbmNlIDIuMC4wXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBhbGwgb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggZ3JlZXRlciApO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBhIHNlbGVjdGlvbiBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCAnZW1pdCBvbiBvZmYnLCBncmVldGVyICk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbWFwcGluZyBhIHNlbGVjdGlvbiBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCB7IGZpcmU6ICdlbWl0JywgYWRkTGlzdGVuZXI6ICdvbicgfSwgZ3JlZXRlciApO1xuICogZ3JlZXRlci5hZGRMaXN0ZW5lciggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZmlyZSggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKi9cbiBcbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBlbWl0dGVyLiBJZiBgbWFwcGluZ2AgYXJlIHByb3ZpZGVkIHRoZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHBhc3NlZCBpbnRvIGBvbigpYCBvbmNlIGNvbnN0cnVjdGlvbiBpcyBjb21wbGV0ZS5cbiAqIEBjbGFzcyBFbWl0dGVyXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gW21hcHBpbmddIEEgbWFwcGluZyBvZiBldmVudCB0eXBlcyB0byBldmVudCBsaXN0ZW5lcnMuXG4gKiBAY2xhc3NkZXNjIEFuIG9iamVjdCB0aGF0IGVtaXRzIG5hbWVkIGV2ZW50cyB3aGljaCBjYXVzZSBmdW5jdGlvbnMgdG8gYmUgZXhlY3V0ZWQuXG4gKiBAZXh0ZW5kcyBFbWl0dGVyfk51bGxcbiAqIEBtaXhlcyBFbWl0dGVyfmFzRW1pdHRlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL2xpYi9ldmVudHMuanN9XG4gKiBAc2luY2UgMS4wLjBcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlVzaW5nIEVtaXR0ZXIgZGlyZWN0bHk8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgQ2xhc3NpY2FsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxuICogY2xhc3MgR3JlZXRlciBleHRlbmRzIEVtaXR0ZXIge1xuICogIGNvbnN0cnVjdG9yKCl7XG4gKiAgICAgIHN1cGVyKCk7XG4gKiAgICAgIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqICB9XG4gKiBcbiAqICBncmVldCggbmFtZSApe1xuICogICAgICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqICB9XG4gKiB9XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIFByb3RvdHlwYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBmdW5jdGlvbiBHcmVldGVyKCl7XG4gKiAgRW1pdHRlci5jYWxsKCB0aGlzICk7XG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogfVxuICogR3JlZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuICogXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gKiAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiB9O1xuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5OYW1lc3BhY2VkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gKiAvLyBIaSwgTWFyayFcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0aW5ncyA9IHtcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAqICB9LFxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XG4gKiBcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICogLy8gSGVsbG8sIEFhcm9uIVxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgIC8vIDJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEhlbGxvLCBUZXJyeSFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlcigpe1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBjb25zdHJ1Y3RvclxuICAgIGlmKCB0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25zdHJ1Y3RvciA9PT0gRW1pdHRlciApe1xuICAgICAgICBsZXQgbWFwcGluZyA9IGFyZ3VtZW50c1sgMCBdO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlcnMgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZW50IGlmIG1vcmUgdGhhbiAqKjEwKiogbGlzdGVuZXJzIGFyZSBhZGRlZCBmb3IgYSBwYXJ0aWN1bGFyIGV2ZW50IGB0eXBlYC4gVGhpcyBwcm9wZXJ0eSBhbGxvd3MgdGhhdCB0byBiZSBjaGFuZ2VkLiBTZXQgdG8gKiowKiogZm9yIHVubGltaXRlZC5cbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyI21heExpc3RlbmVyc1xuICAgICAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICAgICAqIFxuICAgICAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5tYXhMaXN0ZW5lcnMgKTtcbiAgICAgICAgICogLy8gMTBcbiAgICAgICAgICogXG4gICAgICAgICAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gMTtcbiAgICAgICAgICogXG4gICAgICAgICAqIGdyZWV0ZXIub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICAgICAqL1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdtYXhMaXN0ZW5lcnMnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldE1heExpc3RlbmVycyggdGhpcyApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24oIG1heCApe1xuICAgICAgICAgICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgfSApO1xuICAgICAgICBcbiAgICAgICAgdHlwZW9mIG1hcHBpbmcgIT09ICd1bmRlZmluZWQnICYmIGFkZEV2ZW50TWFwcGluZyggdGhpcywgbWFwcGluZyApO1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBmdW5jdGlvblxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBzZWxlY3Rpb24gPSBhcmd1bWVudHNbIDAgXSxcbiAgICAgICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzXG4gICAgICAgIGlmKCB0eXBlb2YgdGFyZ2V0ID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgdGFyZ2V0ID0gc2VsZWN0aW9uO1xuICAgICAgICAgICAgc2VsZWN0aW9uID0gQVBJO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0b0VtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICk7XG4gICAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggRW1pdHRlciwge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciBhbGwgZW1pdHRlcnMuIFVzZSBgZW1pdHRlci5tYXhMaXN0ZW5lcnNgIHRvIHNldCB0aGUgbWF4aW11bSBvbiBhIHBlci1pbnN0YW5jZSBiYXNpcy5cbiAgICAgKiBcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZW50IGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGEgc3BlY2lmaWMgZXZlbnQgdHlwZS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycz0xMFxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNoYW5naW5nIHRoZSBkZWZhdWx0IG1heGltdW0gbGlzdGVuZXJzPC9jYXB0aW9uPlxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgKTtcbiAgICAgKiAvLyAxMFxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIxID0gbmV3IEVtaXR0ZXIoKSxcbiAgICAgKiAgZ3JlZXRlcjIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDE7XG4gICAgICogXG4gICAgICogZ3JlZXRlcjEub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMi5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBhbGVydCggJ0hpIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGlcIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqL1xuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnM6IHtcbiAgICAgICAgdmFsdWU6IDEwLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQW4gaWQgdXNlZCB0byBsaXN0ZW4gZm9yIGV2ZW50cyBvZiBhbnkgYHR5cGVgLiBGb3IgX21vc3RfIG1ldGhvZHMsIHdoZW4gbm8gYHR5cGVgIGlzIGdpdmVuIHRoaXMgaXMgdGhlIGRlZmF1bHQuXG4gICAgICogXG4gICAgICogTGlzdGVuZXIgYm91bmQgdG8gZXZlcnkgZXZlbnQgd2lsbCAqKm5vdCoqIGV4ZWN1dGUgZm9yIEVtaXR0ZXIgbGlmZWN5Y2xlIGV2ZW50cywgbGlrZSBgOm1heExpc3RlbmVyc2AuXG4gICAgICogXG4gICAgICogVXNpbmcgYEVtaXR0ZXIuZXZlcnlgIGlzIHR5cGljYWxseSBub3QgbmVjZXNzYXJ5LlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN5bWJvbH0gRW1pdHRlci5ldmVyeVxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggRW1pdHRlci5ldmVyeSwgKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqL1xuICAgIGV2ZXJ5OiB7XG4gICAgICAgIHZhbHVlOiAkZXZlcnksXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgdmVyc2lvbiBvZiAqRW1pdHRlci5qcyouXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBFbWl0dGVyLnZlcnNpb25cbiAgICAgKiBAc2luY2UgMS4xLjJcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLnZlcnNpb24gKTtcbiAgICAgKiAvLyAyLjAuMFxuICAgICAqL1xuICAgIHZlcnNpb246IHtcbiAgICAgICAgdmFsdWU6ICcyLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9XG59ICk7XG5cbkVtaXR0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuRW1pdHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbWl0dGVyO1xuXG5hc0VtaXR0ZXIuY2FsbCggRW1pdHRlci5wcm90b3R5cGUgKTtcblxuLyoqXG4gKiBEZXN0cm95cyB0aGUgZW1pdHRlci5cbiAqIEBzaW5jZSAxLjAuMFxuICogQGZpcmVzIEVtaXR0ZXIjOmRlc3Ryb3lcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgZW1pdEV2ZW50KCB0aGlzLCAnOmRlc3Ryb3knLCBbXSwgZmFsc2UgKTtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgZGVsZXRlIHRoaXMubWF4TGlzdGVuZXJzO1xuICAgIHRoaXMuZGVzdHJveSA9IHRoaXMuYXQgPSB0aGlzLmNsZWFyID0gdGhpcy5lbWl0ID0gdGhpcy5ldmVudFR5cGVzID0gdGhpcy5maXJzdCA9IHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lckNvdW50ID0gdGhpcy5saXN0ZW5lcnMgPSB0aGlzLm1hbnkgPSB0aGlzLm9mZiA9IHRoaXMub24gPSB0aGlzLm9uY2UgPSB0aGlzLnNldE1heExpc3RlbmVycyA9IHRoaXMudGljayA9IHRoaXMudHJpZ2dlciA9IHRoaXMudW50aWwgPSBub29wO1xuICAgIHRoaXMudG9KU09OID0gKCkgPT4gJ2Rlc3Ryb3llZCc7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBzaW5jZSAxLjMuMFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xuICogLy8geyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9XG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b0pTT04oKSApO1xuICogLy8gXCJkZXN0cm95ZWRcIlxuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpe1xuICAgIGNvbnN0IGpzb24gPSBuZXcgTnVsbCgpLFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCB0aGlzWyAkZXZlbnRzIF0gKSxcbiAgICAgICAgbGVuZ3RoID0gdHlwZXMubGVuZ3RoO1xuICAgICAgICBcbiAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICB0eXBlO1xuICAgIFxuICAgIGpzb24ubWF4TGlzdGVuZXJzID0gdGhpcy5tYXhMaXN0ZW5lcnM7XG4gICAganNvbi5saXN0ZW5lckNvdW50ID0gbmV3IE51bGwoKTtcbiAgICBcbiAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcbiAgICAgICAgdHlwZSA9IHR5cGVzWyBpbmRleCBdO1xuICAgICAgICBqc29uLmxpc3RlbmVyQ291bnRbIHR5cGUgXSA9IHRoaXMubGlzdGVuZXJDb3VudCggdHlwZSApO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qKlxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVtaXR0ZXIuXG4gKiBAc2luY2UgMS4zLjBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgeyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9J1xuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgXCJkZXN0cm95ZWRcIidcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBgJHsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIH0gJHsgSlNPTi5zdHJpbmdpZnkoIHRoaXMudG9KU09OKCkgKSB9YC50cmltKCk7XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==