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
            /*
            // This logic will change once Emitter.every becomes a Symbol
            
            if( typeof type === 'string' ){
                let index = type.lastIndexOf( ':' );
                
                return index === -1 ?
                    emitEvent( this, type, data, type === $every ) :
                    emitAllEvents( this, type, data );
            } else {
                return emitEvent( this, type, data, false );
            }
            */
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
            typeof mapping !== 'undefined' && addEventMapping(this, mapping);

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
         * The symbol used to listen for events of any `type`. For _most_ methods, when no `type` is given this is the default.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOzs7Ozs7QUFNQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7Ozs7O3NCQXc0Q3dCQSxPOzs7Ozs7OztBQW40Q3hCLGFBQVNDLElB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LGFBQUwsR0FBcUIsSUFBSWhILElBQUosRUFBckI7O0FBRUEsZUFBT3NCLFFBQVFjLE1BQWYsRUFBdUJkLE9BQXZCLEVBQWdDO0FBQzVCVCxtQkFBTzZCLE1BQU9wQixLQUFQLENBQVA7QUFDQXlHLGlCQUFLZixhQUFMLENBQW9CbkcsSUFBcEIsSUFBNkIsS0FBS21HLGFBQUwsQ0FBb0JuRyxJQUFwQixDQUE3QjtBQUNIOztBQUVELGVBQU9rSCxJQUFQO0FBQ0gsS0FqQkQ7O0FBbUJBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBaEksWUFBUUUsU0FBUixDQUFrQitILFFBQWxCLEdBQTZCLFlBQVU7QUFDbkMsZUFBTyxDQUFJLEtBQUs1SCxXQUFMLENBQWlCNkgsSUFBckIsU0FBK0JDLEtBQUtDLFNBQUwsQ0FBZ0IsS0FBS0wsTUFBTCxFQUFoQixDQUEvQixFQUFrRU0sSUFBbEUsRUFBUDtBQUNILEtBRkQiLCJmaWxlIjoiZW1pdHRlci11bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSmF2YVNjcmlwdCBBcnJheVxuICogQGV4dGVybmFsIEFycmF5XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1BybTQ1NG11bjMhaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cbiAqIEBleHRlcm5hbCBib29sZWFuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRXJyb3JcbiAqIEBleHRlcm5hbCBFcnJvclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxuICogQGV4dGVybmFsIEZ1bmN0aW9uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcbiAqIEBleHRlcm5hbCBudW1iZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCBudWxsXG4gKiBAZXh0ZXJuYWwgbnVsbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvbnVsbH1cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxuICogQGV4dGVybmFsIE9iamVjdFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0fVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCBQcm9taXNlXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJvbWlzZX1cbiAqL1xuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXG4gKiBAZXh0ZXJuYWwgc3RyaW5nXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XG4gKi9cbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzeW1ib2xcbiAqIEBleHRlcm5hbCBzeW1ib2xcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N5bWJvbH1cbiAqL1xuXG4vKipcbiAqIEEgc2V0IG9mIG1ldGhvZCByZWZlcmVuY2VzIHRvIHRoZSBFbWl0dGVyLmpzIEFQSS5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6T2JqZWN0fSBBUElSZWZlcmVuY2VcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkEgc2VsZWN0aW9uIHJlZmVyZW5jZTwvY2FwdGlvbj5cbiAqICdlbWl0IG9mZiBvbiBvbmNlJ1xuICogQGV4YW1wbGUgPGNhcHRpb24+QSBtYXBwaW5nIHJlZmVyZW5jZTwvY2FwdGlvbj5cbiAqIC8vICdlbWl0KCknIHdpbGwgYmUgbWFwcGVkIHRvICdmaXJlKCknXG4gKiAvLyAnb24oKScgd2lsbCBiZSBtYXBwZWQgdG8gJ2FkZExpc3RlbmVyKCknXG4gKiAvLyAnb2ZmKCknIHdpbGwgYmUgbWFwcGVkIHRvICdyZW1vdmVMaXN0ZW5lcigpJ1xuICoge1xuICogIGZpcmU6ICdlbWl0JyxcbiAqICBhZGRMaXN0ZW5lcjogJ29uJyxcbiAqICByZW1vdmVMaXN0ZW5lcjogJ29mZidcbiAqIH1cbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufCBmdW5jdGlvbn0gYm91bmQgdG8gYW4gZW1pdHRlciB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGV9LiBBbnkgZGF0YSB0cmFuc21pdHRlZCB3aXRoIHRoZSBldmVudCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lciBhcyBhcmd1bWVudHMuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7Li4uKn0gZGF0YSBUaGUgYXJndW1lbnRzIHBhc3NlZCBieSB0aGUgYGVtaXRgLlxuICovXG5cbi8qKlxuICogQW4ge0BsaW5rIGV4dGVybmFsOk9iamVjdHxvYmplY3R9IHRoYXQgbWFwcyB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGVzfSB0byB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxldmVudCBsaXN0ZW5lcnN9LlxuICogQHR5cGVkZWYge2V4dGVybmFsOk9iamVjdH0gRXZlbnRNYXBwaW5nXG4gKi9cblxuLyoqXG4gKiBBIHtAbGluayBleHRlcm5hbDpzdHJpbmd9IG9yIHtAbGluayBleHRlcm5hbDpzeW1ib2x9IHRoYXQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiBldmVudCBmaXJlZCBieSB0aGUgRW1pdHRlci5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6c3ltYm9sfSBFdmVudFR5cGVcbiAqLyBcblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYW4gZW1pdHRlciBkZXN0cm95cyBpdHNlbGYuXG4gKiBAZXZlbnQgRW1pdHRlciM6ZGVzdHJveVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYWZ0ZXJfIGEgbGlzdGVuZXIgaXMgcmVtb3ZlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvZmZcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhIGxpc3RlbmVyIGlzIGFkZGVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9uXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGhhcyBiZWVuIGV4Y2VlZGVkIGZvciBhbiBldmVudCB0eXBlLlxuICogQGV2ZW50IEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBFbWl0dGVyfk51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsO1xuXG5jb25zdFxuICAgICRldmVudHMgICAgICAgPSAnQEBlbWl0dGVyL2V2ZW50cycsXG4gICAgJGV2ZXJ5ICAgICAgICA9ICdAQGVtaXR0ZXIvZXZlcnknLFxuICAgICRtYXhMaXN0ZW5lcnMgPSAnQEBlbWl0dGVyL21heExpc3RlbmVycycsXG4gICAgXG4gICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgIFxuICAgIG5vb3AgPSBmdW5jdGlvbigpe30sXG4gICAgXG4gICAgQVBJID0gbmV3IE51bGwoKTtcblxuLy8gTWFueSBvZiB0aGVzZSBmdW5jdGlvbnMgYXJlIGJyb2tlbiBvdXQgZnJvbSB0aGUgcHJvdG90eXBlIGZvciB0aGUgc2FrZSBvZiBvcHRpbWl6YXRpb24uIFRoZSBmdW5jdGlvbnMgb24gdGhlIHByb3RveXR5cGVcbi8vIHRha2UgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYXMgYSByZXN1bHQuIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIGEgZml4ZWQgbnVtYmVyIG9mIGFyZ3VtZW50c1xuLy8gYW5kIHRoZXJlZm9yZSBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLlxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGNvbmRpdGlvbmFsTGlzdGVuZXIoKXtcbiAgICAgICAgY29uc3QgZG9uZSA9IGxpc3RlbmVyLmFwcGx5KCBlbWl0dGVyLCBhcmd1bWVudHMgKTtcbiAgICAgICAgaWYoIGRvbmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPIENoZWNrIGJleW9uZCBqdXN0IG9uZSBsZXZlbCBvZiBsaXN0ZW5lciByZWZlcmVuY2VzXG4gICAgY29uZGl0aW9uYWxMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyLmxpc3RlbmVyIHx8IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIsIE5hTiApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICl7XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIH1cbiAgICBcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XG4gICAgXG4gICAgY29uc3QgX2V2ZW50cyA9IGVtaXR0ZXJbICRldmVudHMgXTtcbiAgICBcbiAgICBpZiggX2V2ZW50c1sgJzpvbicgXSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b24nLCBbIHR5cGUsIHR5cGVvZiBsaXN0ZW5lci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICBcbiAgICAgICAgLy8gRW1pdHRpbmcgXCJvblwiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICBfZXZlbnRzWyAnOm9uJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9uJyBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICBpZiggIV9ldmVudHNbIHR5cGUgXSApe1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBsaXN0ZW5lcjtcbiAgICBcbiAgICAvLyBNdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIF9ldmVudHNbIHR5cGUgXSApICl7XG4gICAgICAgIHN3aXRjaCggaXNOYU4oIGluZGV4ICkgfHwgaW5kZXggKXtcbiAgICAgICAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0udW5zaGlmdCggbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnNwbGljZSggaW5kZXgsIDAsIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICBcbiAgICAvLyBUcmFuc2l0aW9uIGZyb20gc2luZ2xlIHRvIG11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGluZGV4ID09PSAwID9cbiAgICAgICAgICAgIFsgbGlzdGVuZXIsIF9ldmVudHNbIHR5cGUgXSBdIDpcbiAgICAgICAgICAgIFsgX2V2ZW50c1sgdHlwZSBdLCBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBUcmFjayB3YXJuaW5ncyBpZiBtYXggbGlzdGVuZXJzIGlzIGF2YWlsYWJsZVxuICAgIGlmKCAnbWF4TGlzdGVuZXJzJyBpbiBlbWl0dGVyICYmICFfZXZlbnRzWyB0eXBlIF0ud2FybmVkICl7XG4gICAgICAgIGNvbnN0IG1heCA9IGVtaXR0ZXIubWF4TGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoIG1heCAmJiBtYXggPiAwICYmIF9ldmVudHNbIHR5cGUgXS5sZW5ndGggPiBtYXggKXtcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzptYXhMaXN0ZW5lcnMnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRW1pdHRpbmcgXCJtYXhMaXN0ZW5lcnNcIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgICAgIF9ldmVudHNbICc6bWF4TGlzdGVuZXJzJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm1heExpc3RlbmVycycgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZW1pdHRlclsgJGV2ZW50cyBdID0gX2V2ZW50cztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRGaW5pdGVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGZpbml0ZUxpc3RlbmVyKCl7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgcmV0dXJuIC0tdGltZXMgPT09IDA7XG4gICAgfVxuICAgIFxuICAgIGZpbml0ZUxpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBmaW5pdGVMaXN0ZW5lciApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TWFwcGluZ1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudE1hcHBpbmd9IG1hcHBpbmcgVGhlIGV2ZW50IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50TWFwcGluZyggZW1pdHRlciwgbWFwcGluZyApe1xuICAgIGNvbnN0XG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIG1hcHBpbmcgKSxcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICBcbiAgICBsZXQgdHlwZUluZGV4ID0gMCxcbiAgICAgICAgaGFuZGxlciwgaGFuZGxlckluZGV4LCBoYW5kbGVyTGVuZ3RoLCB0eXBlO1xuICAgIFxuICAgIGZvciggOyB0eXBlSW5kZXggPCB0eXBlTGVuZ3RoOyB0eXBlSW5kZXggKz0gMSApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIHR5cGVJbmRleCBdO1xuICAgICAgICBoYW5kbGVyID0gbWFwcGluZ1sgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgLy8gTGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgaGFuZGxlckluZGV4ID0gMDtcbiAgICAgICAgICAgIGhhbmRsZXJMZW5ndGggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggOyBoYW5kbGVySW5kZXggPCBoYW5kbGVyTGVuZ3RoOyBoYW5kbGVySW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXJbIGhhbmRsZXJJbmRleCBdLCBOYU4gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgaGFuZGxlciwgTmFOICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZGVmaW5lRXZlbnRzUHJvcGVydHlcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgcHJvcGVydHkgd2lsbCBiZSBjcmVhdGVkLlxuICovIFxuZnVuY3Rpb24gZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIHZhbHVlICl7XG4gICAgY29uc3QgaGFzRXZlbnRzID0gaGFzT3duUHJvcGVydHkuY2FsbCggZW1pdHRlciwgJGV2ZW50cyApLFxuICAgICAgICBlbWl0dGVyUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCBlbWl0dGVyICk7XG4gICAgICAgIFxuICAgIGlmKCAhaGFzRXZlbnRzIHx8ICggZW1pdHRlclByb3RvdHlwZSAmJiBlbWl0dGVyWyAkZXZlbnRzIF0gPT09IGVtaXR0ZXJQcm90b3R5cGVbICRldmVudHMgXSApICl7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJGV2ZW50cywge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9ICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRBbGxFdmVudHNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgLy8gSWYgdHlwZSBpcyBub3QgYSBzdHJpbmcsIGluZGV4IHdpbGwgYmUgZmFsc2VcbiAgICAgICAgaW5kZXggPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgXG4gICAgLy8gTmFtZXNwYWNlZCBldmVudCwgZS5nLiBFbWl0IFwiZm9vOmJhcjpxdXhcIiwgdGhlbiBcImZvbzpiYXJcIlxuICAgIHdoaWxlKCBpbmRleCA+IDAgKXtcbiAgICAgICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBmYWxzZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgICAgIHR5cGUgPSB0eXBlLnN1YnN0cmluZyggMCwgaW5kZXggKTtcbiAgICAgICAgaW5kZXggPSB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRW1pdCBzaW5nbGUgZXZlbnQgb3IgdGhlIG5hbWVzcGFjZWQgZXZlbnQgcm9vdCwgZS5nLiBcImZvb1wiLCBcIjpiYXJcIiwgU3ltYm9sKCBcIkBAcXV4XCIgKVxuICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgdHJ1ZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFcnJvcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgYGVycm9yc2Agd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtBcnJheTxleHRlcm5hbDpFcnJvcj59IGVycm9ycyBUaGUgYXJyYXkgb2YgZXJyb3JzIHRvIGJlIGVtaXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApe1xuICAgIGNvbnN0IGxlbmd0aCA9IGVycm9ycy5sZW5ndGg7XG4gICAgZm9yKCBsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICdlcnJvcicsIFsgZXJyb3JzWyBpbmRleCBdIF0sIGZhbHNlICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFdmVudFxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gZW1pdEV2ZXJ5IFdoZXRoZXIgb3Igbm90IGxpc3RlbmVycyBmb3IgYWxsIHR5cGVzIHdpbGwgYmUgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZW1pdEV2ZXJ5ICl7XG4gICAgLy8gRGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIGxpc3RlbmVyO1xuICAgIFxuICAgIGlmKCB0eXBlID09PSAnZXJyb3InICYmICFfZXZlbnRzLmVycm9yICl7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZGF0YVsgMCBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgKXtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiB0eXBlIG9mIGV2ZW50XG4gICAgbGlzdGVuZXIgPSBfZXZlbnRzWyB0eXBlIF07XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGxpc3RlbmluZyBmb3IgYWxsIHR5cGVzIG9mIGV2ZW50c1xuICAgIGlmKCBlbWl0RXZlcnkgKXtcbiAgICAgICAgbGlzdGVuZXIgPSBfZXZlbnRzWyAkZXZlcnkgXTtcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBsaXN0ZW5lciB1c2luZyB0aGUgaW50ZXJuYWwgYGV4ZWN1dGUqYCBmdW5jdGlvbnMgYmFzZWQgb24gdGhlIG51bWJlciBvZiBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlTGlzdGVuZXJcbiAqIEBwYXJhbSB7QXJyYXk8TGlzdGVuZXI+fExpc3RlbmVyfSBsaXN0ZW5lclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICogQHBhcmFtIHsqfSBzY29wZVxuICovIFxuZnVuY3Rpb24gZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgc2NvcGUgKXtcbiAgICBjb25zdCBpc0Z1bmN0aW9uID0gdHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nO1xuICAgIFxuICAgIHN3aXRjaCggZGF0YS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgbGlzdGVuRW1wdHkgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBsaXN0ZW5PbmUgICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGlzdGVuVHdvICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgbGlzdGVuVGhyZWUgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdLCBkYXRhWyAyIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGlzdGVuTWFueSAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGEgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRFdmVudFR5cGVzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggZXZlbnQgdHlwZXMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXk8RXZlbnRUeXBlPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlcyggZW1pdHRlciApe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyggZW1pdHRlclsgJGV2ZW50cyBdICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0TWF4TGlzdGVuZXJzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggbWF4IGxpc3RlbmVycyB3aWxsIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIGdldE1heExpc3RlbmVycyggZW1pdHRlciApe1xuICAgIHJldHVybiB0eXBlb2YgZW1pdHRlclsgJG1heExpc3RlbmVycyBdICE9PSAndW5kZWZpbmVkJyA/XG4gICAgICAgIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSA6XG4gICAgICAgIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmlzUG9zaXRpdmVOdW1iZXJcbiAqIEBwYXJhbSB7Kn0gbnVtYmVyIFRoZSB2YWx1ZSB0byBiZSB0ZXN0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICovXG5mdW5jdGlvbiBpc1Bvc2l0aXZlTnVtYmVyKCBudW1iZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicgJiYgbnVtYmVyID49IDAgJiYgIWlzTmFOKCBudW1iZXIgKTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBubyBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5FbXB0eVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlbkVtcHR5KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBvbmUgYXJndW1lbnQuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5PbmVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuT25lKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHR3byBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5Ud29cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ud28oIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdGhyZWUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVGhyZWVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmczIFRoZSB0aGlyZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVGhyZWUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggZm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk1hbnlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gYXJncyBGb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5NYW55KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmdzICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+cmVtb3ZlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIgKXtcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XG4gICAgXG4gICAgY29uc3QgaGFuZGxlciA9IGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgIFxuICAgIGlmKCBoYW5kbGVyID09PSBsaXN0ZW5lciB8fCAoIHR5cGVvZiBoYW5kbGVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBpZiggZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIFxuICAgICAgICBmb3IoIGxldCBpID0gaGFuZGxlci5sZW5ndGg7IGktLSA+IDA7ICl7XG4gICAgICAgICAgICBpZiggaGFuZGxlclsgaSBdID09PSBsaXN0ZW5lciB8fCAoIGhhbmRsZXJbIGkgXS5saXN0ZW5lciAmJiBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgaWYoIGluZGV4ID4gLTEgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwbGljZUxpc3QoIGhhbmRsZXIsIGluZGV4ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIHdpbGwgYmUgc2V0LlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICovXG5mdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIsIG1heCApe1xuICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggbWF4ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ21heCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgIH1cbiAgICBcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRtYXhMaXN0ZW5lcnMsIHtcbiAgICAgICAgdmFsdWU6IG1heCxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9ICk7XG59XG5cbi8qKlxuICogRmFzdGVyIHRoYW4gYEFycmF5LnByb3RvdHlwZS5zcGxpY2VgXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zcGxpY2VMaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBsaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqLyBcbmZ1bmN0aW9uIHNwbGljZUxpc3QoIGxpc3QsIGluZGV4ICl7XG4gICAgZm9yKCBsZXQgaSA9IGluZGV4LCBqID0gaSArIDEsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBqIDwgbGVuZ3RoOyBpICs9IDEsIGogKz0gMSApe1xuICAgICAgICBsaXN0WyBpIF0gPSBsaXN0WyBqIF07XG4gICAgfVxuICAgIFxuICAgIGxpc3QucG9wKCk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgZXhlY3V0ZXMgYSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC5cbiAqL1xuZnVuY3Rpb24gdGljayggY2FsbGJhY2sgKXtcbiAgICByZXR1cm4gc2V0VGltZW91dCggY2FsbGJhY2ssIDAgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrQWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiB0aWNrQWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICl7XG4gICAgICAgIHRpY2soIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICkgPyByZXNvbHZlKCkgOiByZWplY3QoKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgYHNlbGVjdGlvbmAgb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRvRW1pdHRlclxuICogQHBhcmFtIHtBUElSZWZlcmVuY2V9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCBvbiB3aGljaCB0aGUgQVBJIHdpbGwgYmUgYXBwbGllZC5cbiAqL1xuZnVuY3Rpb24gdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApe1xuICAgIFxuICAgIC8vIEFwcGx5IHRoZSBlbnRpcmUgRW1pdHRlciBBUElcbiAgICBpZiggc2VsZWN0aW9uID09PSBBUEkgKXtcbiAgICAgICAgYXNFbWl0dGVyLmNhbGwoIHRhcmdldCApO1xuICAgIFxuICAgIC8vIEFwcGx5IG9ubHkgdGhlIHNlbGVjdGVkIEFQSSBtZXRob2RzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGluZGV4LCBrZXksIG1hcHBpbmcsIG5hbWVzLCB2YWx1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2Ygc2VsZWN0aW9uID09PSAnc3RyaW5nJyApe1xuICAgICAgICAgICAgbmFtZXMgPSBzZWxlY3Rpb24uc3BsaXQoICcgJyApO1xuICAgICAgICAgICAgbWFwcGluZyA9IEFQSTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hbWVzID0gT2JqZWN0LmtleXMoIHNlbGVjdGlvbiApO1xuICAgICAgICAgICAgbWFwcGluZyA9IHNlbGVjdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBuYW1lcy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAga2V5ID0gbmFtZXNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IG1hcHBpbmdbIGtleSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0YXJnZXRbIGtleSBdID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgICAgICB2YWx1ZSA6XG4gICAgICAgICAgICAgICAgQVBJWyB2YWx1ZSBdO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgZnVuY3Rpb25hbCBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byBpdHMgdGFyZ2V0LiBUaGUgYGNvbnN0cnVjdG9yKClgLCBgZGVzdHJveSgpYCwgYHRvSlNPTigpYCwgYHRvU3RyaW5nKClgLCBhbmQgc3RhdGljIHByb3BlcnRpZXMgb24gYEVtaXR0ZXJgIGFyZSBub3QgcHJvdmlkZWQuIFRoaXMgbWl4aW4gaXMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgYHByb3RvdHlwZWAgb2YgYEVtaXR0ZXJgLlxuICogXG4gKiBMaWtlIGFsbCBmdW5jdGlvbmFsIG1peGlucywgdGhpcyBzaG91bGQgYmUgZXhlY3V0ZWQgd2l0aCBbY2FsbCgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9jYWxsKSBvciBbYXBwbHkoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYXBwbHkpLlxuICogQG1peGluIEVtaXR0ZXJ+YXNFbWl0dGVyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBFbWl0dGVyIGZ1bmN0aW9uYWxpdHk8L2NhcHRpb24+XG4gKiAvLyBDcmVhdGUgYSBiYXNlIG9iamVjdFxuICogY29uc3QgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIFxuICogLy8gQXBwbHkgdGhlIG1peGluXG4gKiBhc0VtaXR0ZXIuY2FsbCggZ3JlZXRlciApO1xuICogXG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAqIC8vIEhlbGxvLCBXb3JsZCFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGNoYW9zIHRvIHlvdXIgd29ybGQ8L2NhcHRpb24+XG4gKiAvLyBOTyEhIVxuICogYXNFbWl0dGVyKCk7IC8vIE1hZG5lc3MgZW5zdWVzXG4gKi9cbmZ1bmN0aW9uIGFzRW1pdHRlcigpe1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuYXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleCBXaGVyZSB0aGUgbGlzdGVuZXIgd2lsbCBiZSBhZGRlZCBpbiB0aGUgdHJpZ2dlciBsaXN0LlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICovXG4gICAgdGhpcy5hdCA9IGZ1bmN0aW9uKCB0eXBlLCBpbmRleCwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGluZGV4ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggaXNQb3NpdGl2ZU51bWJlciggaW5kZXggKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2luZGV4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5jbGVhclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhcigpO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNsZWFyaW5nIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbigge1xuICAgICAqICAnaGVsbG8nIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIZWxsbyEnICk7IH0sXG4gICAgICogICdoaScgICAgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hpIScgKTsgfVxuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICovXG4gICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBoYW5kbGVyO1xuICAgICAgICBcbiAgICAgICAgLy8gTm8gRXZlbnRzXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gV2l0aCBubyBcIm9mZlwiIGxpc3RlbmVycywgY2xlYXJpbmcgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgYWxsIGxpc3RlbmVyc1xuICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgY29uc3QgdHlwZXMgPSBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEF2b2lkIHJlbW92aW5nIFwib2ZmXCIgbGlzdGVuZXJzIHVudGlsIGFsbCBvdGhlciB0eXBlcyBoYXZlIGJlZW4gcmVtb3ZlZFxuICAgICAgICAgICAgZm9yKCBsZXQgaW5kZXggPSAwLCBsZW5ndGggPSB0eXBlcy5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgaWYoIHR5cGVzWyBpbmRleCBdID09PSAnOm9mZicgKXtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoIHR5cGVzWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGNsZWFyIFwib2ZmXCJcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoICc6b2ZmJyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyICk7XG4gICAgICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBoYW5kbGVyWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5lbWl0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTsgICAgLy8gdHJ1ZVxuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7ICAvLyBmYWxzZVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50IHdpdGggZGF0YTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGEgbmFtZXNwYWNlZCBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiAvLyBUaGlzIGV2ZW50IHdpbGwgbm90IGJlIHRyaWdnZXJlZCBieSBlbWl0dGluZyBcImdyZWV0aW5nOmhlbGxvXCJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvIGFnYWluLCAkeyBuYW1lIH1gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLmVtaXQgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgZGF0YSA9IFtdLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIGlmKCBsZW5ndGggPiAxICl7XG4gICAgICAgICAgICBkYXRhID0gQXJyYXkoIGxlbmd0aCAtIDEgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCBsZXQga2V5ID0gMTsga2V5IDwgbGVuZ3RoOyBrZXkrKyApe1xuICAgICAgICAgICAgICAgIGRhdGFbIGtleSAtIDEgXSA9IGFyZ3VtZW50c1sga2V5IF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgICAgIC8qXG4gICAgICAgIC8vIFRoaXMgbG9naWMgd2lsbCBjaGFuZ2Ugb25jZSBFbWl0dGVyLmV2ZXJ5IGJlY29tZXMgYSBTeW1ib2xcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPT09IC0xID9cbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIHRoaXMsIHR5cGUsIGRhdGEsIHR5cGUgPT09ICRldmVyeSApIDpcbiAgICAgICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZW1pdEV2ZW50KCB0aGlzLCB0eXBlLCBkYXRhLCBmYWxzZSApO1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZXZlbnRUeXBlc1xuICAgICAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coIGBIZWxsb2AgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCBgSGlgICkgKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5ldmVudFR5cGVzKCkgKTtcbiAgICAgKiAvLyBbICdoZWxsbycsICdoaScgXVxuICAgICAqLyBcbiAgICB0aGlzLmV2ZW50VHlwZXMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmZpcnN0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqL1xuICAgIHRoaXMuZmlyc3QgPSBmdW5jdGlvbiggdHlwZSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgMCApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZXQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5nZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZ2V0TWF4TGlzdGVuZXJzKCkgKTtcbiAgICAgKiAvLyAxMFxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuc2V0TWF4TGlzdGVuZXJzKCA1ICk7XG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZ2V0TWF4TGlzdGVuZXJzKCkgKTtcbiAgICAgKiAvLyA1XG4gICAgICovXG4gICAgdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJDb3VudFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnaGVsbG8nICkgKTtcbiAgICAgKiAvLyAxXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2dvb2RieWUnICkgKTtcbiAgICAgKiAvLyAwXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBjb3VudDtcblxuICAgICAgICAvLyBFbXB0eVxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGNvdW50ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHRoaXNbICRldmVudHMgXVsgdHlwZSBdID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgIFxuICAgICAgICAvLyBBcnJheVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY291bnQgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhlbGxvID0gZnVuY3Rpb24oKXtcbiAgICAgKiAgY29uc29sZS5sb2coICdIZWxsbyEnICk7XG4gICAgICogfSxcbiAgICAgKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lcnMoICdoZWxsbycgKVsgMCBdID09PSBoZWxsbyApO1xuICAgICAqIC8vIHRydWVcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgbGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFsgaGFuZGxlciBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSAqbWFueSB0aW1lKiBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC4gQWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIGludm9rZWQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgYHRpbWVzYCwgaXQgaXMgcmVtb3ZlZC5cbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5tYW55XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbnkgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1RlcnJ5JyApOyAgICAgIC8vIDJcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnU3RldmUnICk7ICAgICAgLy8gM1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAvLyAyXG4gICAgICogLy8gSGVsbG8sIFRlcnJ5IVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgIC8vIDNcbiAgICAgKi8gXG4gICAgdGhpcy5tYW55ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aW1lcztcbiAgICAgICAgICAgIHRpbWVzID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggdGltZXMgKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3RpbWVzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBgbGlzdGVuZXJgIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIGl0IGlzIGFzc3VtZWQgdGhlIGBsaXN0ZW5lcmAgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBJZiBhbnkgc2luZ2xlIGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgdGhlbiBgZW1pdHRlci5vZmYoKWAgbXVzdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gcmVtb3ZlIGVhY2ggaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9mZlxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b2ZmXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhbnkgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBncmVldCggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0aW5ncywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnSmVmZicgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gaGVsbG8oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICovIFxuICAgIHRoaXMub2ZmID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IHR5cGUgPSBhcmd1bWVudHNbIDAgXSB8fCAkZXZlcnksXG4gICAgICAgICAgICBsaXN0ZW5lciA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVHlwZSBub3QgcHJvdmlkZWQsIGZhbGwgYmFjayB0byBcIiRldmVyeVwiXG4gICAgICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0IG9mIGV2ZW50IGJpbmRpbmdzXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TWFwcGluZyggdGhpcywgdHlwZSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgTmFOICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vbmNlXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIG9uY2UgdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uY2UgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCAxLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZXQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIG1ldGhvZCBhbGxvd3MgdGhhdCB0byBiZSBjaGFuZ2VkLiBTZXQgdG8gKiowKiogZm9yIHVubGltaXRlZC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuc2V0TWF4TGlzdGVuZXJzKCAxICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKi9cbiAgICB0aGlzLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCBtYXggKXtcbiAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBc3luY2hyb25vdXNseSBlbWl0cyBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy4gVGhlIGxpc3RlbmVycyB3aWxsIHN0aWxsIGJlIHN5bmNocm9ub3VzbHkgZXhlY3V0ZWQgaW4gdGhlIHNwZWNpZmllZCBvcmRlci5cbiAgICAgKiBcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIHtAbGluayBleHRlcm5hbDpQcm9taXNlfHByb21pc2V9IHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRpY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAgICAgKiBAc2luY2UgMi4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5Bc3luY2hyb25vdXNseSBlbWl0dGluZyBhbiBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIudGljayggJ2hlbGxvJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2hlbGxvIGhlYXJkPyAnLCBoZWFyZCApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnZ29vZGJ5ZScgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdnb29kYnllIGhlYXJkPyAnLCBoZWFyZCApICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogLy8gaGVsbG8gaGVhcmQ/IHRydWVcbiAgICAgKiAvLyBnb29kYnllIGhlYXJkPyBmYWxzZVxuICAgICAqL1xuICAgIHRoaXMudGljayA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBkYXRhID0gW10sXG4gICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgaWYoIGxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgIGRhdGEgPSBBcnJheSggbGVuZ3RoIC0gMSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIGxldCBrZXkgPSAxOyBrZXkgPCBsZW5ndGg7IGtleSsrICl7XG4gICAgICAgICAgICAgICAgZGF0YVsga2V5IC0gMSBdID0gYXJndW1lbnRzWyBrZXkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRpY2tBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYGRhdGFgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudHJpZ2dlclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdoZWxsbycsIFsgJ1dvcmxkJyBdICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoZWxsbycsIFsgJ0plZmYnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWQgKnVudGlsKiB0aGUgYGxpc3RlbmVyYCByZXR1cm5zIGB0cnVlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnVudGlsXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1RlcnJ5JztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJywgJ1RlcnJ5JyApO1xuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdBYXJvbicgKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoICdoZWxsbycsIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnV29ybGQnO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdNYXJrJyApO1xuICAgICAqL1xuICAgIHRoaXMudW50aWwgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufVxuXG5hc0VtaXR0ZXIuY2FsbCggQVBJICk7XG5cbi8qKlxuICogQXBwbGllcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIHRhcmdldC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyXG4gKiBAcGFyYW0ge0FQSVJlZmVyZW5jZX0gW3NlbGVjdGlvbl0gQSBzZWxlY3Rpb24gb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBwYXJhbSB7ZXh0ZXJhbDpPYmplY3R9IHRhcmdldCBUaGUgb2JqZWN0IHRvIHdoaWNoIHRoZSBFbWl0dGVyLmpzIEFQSSB3aWxsIGJlIGFwcGxpZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBhbGwgb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggZ3JlZXRlciApO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBhIHNlbGVjdGlvbiBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCAnZW1pdCBvbiBvZmYnLCBncmVldGVyICk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbWFwcGluZyBhIHNlbGVjdGlvbiBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCB7IGZpcmU6ICdlbWl0JywgYWRkTGlzdGVuZXI6ICdvbicgfSwgZ3JlZXRlciApO1xuICogZ3JlZXRlci5hZGRMaXN0ZW5lciggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZmlyZSggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKi9cbiBcbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBlbWl0dGVyLiBJZiBgbWFwcGluZ2AgYXJlIHByb3ZpZGVkIHRoZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHBhc3NlZCBpbnRvIGBvbigpYCBvbmNlIGNvbnN0cnVjdGlvbiBpcyBjb21wbGV0ZS5cbiAqIEBjbGFzcyBFbWl0dGVyXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gW21hcHBpbmddIEEgbWFwcGluZyBvZiBldmVudCB0eXBlcyB0byBldmVudCBsaXN0ZW5lcnMuXG4gKiBAY2xhc3NkZXNjIEFuIG9iamVjdCB0aGF0IGVtaXRzIG5hbWVkIGV2ZW50cyB3aGljaCBjYXVzZSBmdW5jdGlvbnMgdG8gYmUgZXhlY3V0ZWQuXG4gKiBAZXh0ZW5kcyBFbWl0dGVyfk51bGxcbiAqIEBtaXhlcyBFbWl0dGVyfmFzRW1pdHRlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL2xpYi9ldmVudHMuanN9XG4gKiBAc2luY2UgMS4wLjBcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlVzaW5nIEVtaXR0ZXIgZGlyZWN0bHk8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgQ2xhc3NpY2FsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxuICogY2xhc3MgR3JlZXRlciBleHRlbmRzIEVtaXR0ZXIge1xuICogIGNvbnN0cnVjdG9yKCl7XG4gKiAgICAgIHN1cGVyKCk7XG4gKiAgICAgIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqICB9XG4gKiBcbiAqICBncmVldCggbmFtZSApe1xuICogICAgICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqICB9XG4gKiB9XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIFByb3RvdHlwYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBmdW5jdGlvbiBHcmVldGVyKCl7XG4gKiAgRW1pdHRlci5jYWxsKCB0aGlzICk7XG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogfVxuICogR3JlZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuICogXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gKiAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiB9O1xuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5OYW1lc3BhY2VkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gKiAvLyBIaSwgTWFyayFcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0aW5ncyA9IHtcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAqICB9LFxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XG4gKiBcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICogLy8gSGVsbG8sIEFhcm9uIVxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgIC8vIDJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEhlbGxvLCBUZXJyeSFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlcigpe1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBjb25zdHJ1Y3RvclxuICAgIGlmKCB0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25zdHJ1Y3RvciA9PT0gRW1pdHRlciApe1xuICAgICAgICBsZXQgbWFwcGluZyA9IGFyZ3VtZW50c1sgMCBdO1xuICAgICAgICB0eXBlb2YgbWFwcGluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCBtYXBwaW5nICk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQnkgZGVmYXVsdCBFbWl0dGVycyB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIHByb3BlcnR5IGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIjbWF4TGlzdGVuZXJzXG4gICAgICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgICAgICogXG4gICAgICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLm1heExpc3RlbmVycyApO1xuICAgICAgICAgKiAvLyAxMFxuICAgICAgICAgKiBcbiAgICAgICAgICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSAxO1xuICAgICAgICAgKiBcbiAgICAgICAgICogZ3JlZXRlci5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgICAgICovXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heExpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgICAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGZ1bmN0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IGFyZ3VtZW50c1sgMCBdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHNcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0YXJnZXQgPSBzZWxlY3Rpb247XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBBUEk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZGVmYXVsdCBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBlbWl0dGVycy4gVXNlIGBlbWl0dGVyLm1heExpc3RlbmVyc2AgdG8gc2V0IHRoZSBtYXhpbXVtIG9uIGEgcGVyLWluc3RhbmNlIGJhc2lzLlxuICAgICAqIFxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPTEwXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlcjEgPSBuZXcgRW1pdHRlcigpLFxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGFsZXJ0KCAnSGkhJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICovXG4gICAgZGVmYXVsdE1heExpc3RlbmVyczoge1xuICAgICAgICB2YWx1ZTogMTAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3ltYm9sIHVzZWQgdG8gbGlzdGVuIGZvciBldmVudHMgb2YgYW55IGB0eXBlYC4gRm9yIF9tb3N0XyBtZXRob2RzLCB3aGVuIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGlzIGlzIHRoZSBkZWZhdWx0LlxuICAgICAqIFxuICAgICAqIFVzaW5nIGBFbWl0dGVyLmV2ZXJ5YCBpcyB0eXBpY2FsbHkgbm90IG5lY2Vzc2FyeS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzeW1ib2x9IEVtaXR0ZXIuZXZlcnlcbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIEVtaXR0ZXIuZXZlcnksICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKi9cbiAgICBldmVyeToge1xuICAgICAgICB2YWx1ZTogJGV2ZXJ5LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgKkVtaXR0ZXIuanMqLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gRW1pdHRlci52ZXJzaW9uXG4gICAgICogQHNpbmNlIDEuMS4yXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci52ZXJzaW9uICk7XG4gICAgICogLy8gMi4wLjBcbiAgICAgKi9cbiAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHZhbHVlOiAnMi4wLjAnLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfVxufSApO1xuXG5FbWl0dGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbkVtaXR0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW1pdHRlcjtcblxuYXNFbWl0dGVyLmNhbGwoIEVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCB0cnVlICk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZGVzdHJveSA9IHRoaXMuYXQgPSB0aGlzLmNsZWFyID0gdGhpcy5lbWl0ID0gdGhpcy5ldmVudFR5cGVzID0gdGhpcy5maXJzdCA9IHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lckNvdW50ID0gdGhpcy5saXN0ZW5lcnMgPSB0aGlzLm1hbnkgPSB0aGlzLm9mZiA9IHRoaXMub24gPSB0aGlzLm9uY2UgPSB0aGlzLnNldE1heExpc3RlbmVycyA9IHRoaXMudGljayA9IHRoaXMudHJpZ2dlciA9IHRoaXMudW50aWwgPSBub29wO1xuICAgIHRoaXMudG9KU09OID0gKCkgPT4gJ2Rlc3Ryb3llZCc7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfVxuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIFwiZGVzdHJveWVkXCJcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICBjb25zdCBqc29uID0gbmV3IE51bGwoKSxcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICksXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgdHlwZTtcbiAgICBcbiAgICBqc29uLm1heExpc3RlbmVycyA9IHRoaXMubWF4TGlzdGVuZXJzO1xuICAgIGpzb24ubGlzdGVuZXJDb3VudCA9IG5ldyBOdWxsKCk7XG4gICAgXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciBcImRlc3Ryb3llZFwiJ1xuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGAkeyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgfSAkeyBKU09OLnN0cmluZ2lmeSggdGhpcy50b0pTT04oKSApIH1gLnRyaW0oKTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9