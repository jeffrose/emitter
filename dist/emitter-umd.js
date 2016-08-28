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
            for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                data[_key - 1] = arguments[_key];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOzs7Ozs7QUFNQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7Ozs7O3NCQXEyQ3dCQSxPOzs7Ozs7OztBQWgyQ3hCLGFBQVNDLElB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KipcbiAqIEphdmFTY3JpcHQgQXJyYXlcbiAqIEBleHRlcm5hbCBBcnJheVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXl9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9Qcm00NTRtdW4zIWltaXRpdmV8cHJpbWl0aXZlfSBib29sZWFuXG4gKiBAZXh0ZXJuYWwgYm9vbGVhblxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQm9vbGVhbn1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEVycm9yXG4gKiBAZXh0ZXJuYWwgRXJyb3JcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Vycm9yfVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRnVuY3Rpb25cbiAqIEBleHRlcm5hbCBGdW5jdGlvblxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb259XG4gKi8gXG4gXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gbnVtYmVyXG4gKiBAZXh0ZXJuYWwgbnVtYmVyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9OdW1iZXJ9XG4gKi8gXG4gXG4vKipcbiAqIEphdmFTY3JpcHQgbnVsbFxuICogQGV4dGVybmFsIG51bGxcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL251bGx9XG4gKi9cbiBcbi8qKlxuICogSmF2YVNjcmlwdCBPYmplY3RcbiAqIEBleHRlcm5hbCBPYmplY3RcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdH1cbiAqL1xuXG4vKipcbiAqIEphdmFTY3JpcHQgUHJvbWlzZVxuICogQGV4dGVybmFsIFByb21pc2VcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb21pc2V9XG4gKi9cblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN0cmluZ1xuICogQGV4dGVybmFsIHN0cmluZ1xuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nfVxuICovXG4gXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3ltYm9sXG4gKiBAZXh0ZXJuYWwgc3ltYm9sXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TeW1ib2x9XG4gKi9cblxuLyoqXG4gKiBBIHNldCBvZiBtZXRob2QgcmVmZXJlbmNlcyB0byB0aGUgRW1pdHRlci5qcyBBUEkuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOk9iamVjdH0gQVBJUmVmZXJlbmNlXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BIHNlbGVjdGlvbiByZWZlcmVuY2U8L2NhcHRpb24+XG4gKiAnZW1pdCBvZmYgb24gb25jZSdcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkEgbWFwcGluZyByZWZlcmVuY2U8L2NhcHRpb24+XG4gKiAvLyAnZW1pdCgpJyB3aWxsIGJlIG1hcHBlZCB0byAnZmlyZSgpJ1xuICogLy8gJ29uKCknIHdpbGwgYmUgbWFwcGVkIHRvICdhZGRMaXN0ZW5lcigpJ1xuICogLy8gJ29mZigpJyB3aWxsIGJlIG1hcHBlZCB0byAncmVtb3ZlTGlzdGVuZXIoKSdcbiAqIHtcbiAqICBmaXJlOiAnZW1pdCcsXG4gKiAgYWRkTGlzdGVuZXI6ICdvbicsXG4gKiAgcmVtb3ZlTGlzdGVuZXI6ICdvZmYnXG4gKiB9XG4gKi9cblxuLyoqXG4gKiBBIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnwgZnVuY3Rpb259IGJvdW5kIHRvIGFuIGVtaXR0ZXIge0BsaW5rIEV2ZW50VHlwZXxldmVudCB0eXBlfS4gQW55IGRhdGEgdHJhbnNtaXR0ZWQgd2l0aCB0aGUgZXZlbnQgd2lsbCBiZSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXIgYXMgYXJndW1lbnRzLlxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0gey4uLip9IGRhdGEgVGhlIGFyZ3VtZW50cyBwYXNzZWQgYnkgdGhlIGBlbWl0YC5cbiAqL1xuXG4vKipcbiAqIEFuIHtAbGluayBleHRlcm5hbDpPYmplY3R8b2JqZWN0fSB0aGF0IG1hcHMge0BsaW5rIEV2ZW50VHlwZXxldmVudCB0eXBlc30gdG8ge0BsaW5rIEV2ZW50TGlzdGVuZXJ8ZXZlbnQgbGlzdGVuZXJzfS5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpPYmplY3R9IEV2ZW50TWFwcGluZ1xuICovXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6c3RyaW5nfSBvciB7QGxpbmsgZXh0ZXJuYWw6c3ltYm9sfSB0aGF0IHJlcHJlc2VudHMgdGhlIHR5cGUgb2YgZXZlbnQgZmlyZWQgYnkgdGhlIEVtaXR0ZXIuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOnN5bWJvbH0gRXZlbnRUeXBlXG4gKi8gXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGFuIGVtaXR0ZXIgZGVzdHJveXMgaXRzZWxmLlxuICogQGV2ZW50IEVtaXR0ZXIjOmRlc3Ryb3lcbiAqLyBcblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2FmdGVyXyBhIGxpc3RlbmVyIGlzIHJlbW92ZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b2ZmXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYSBsaXN0ZW5lciBpcyBhZGRlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvblxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIG9uY2UgdGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBoYXMgYmVlbiBleGNlZWRlZCBmb3IgYW4gZXZlbnQgdHlwZS5cbiAqIEBldmVudCBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIEEgXCJjbGVhblwiLCBlbXB0eSBjb250YWluZXIuIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAuXG4gKiBAY2xhc3MgRW1pdHRlcn5OdWxsXG4gKiBAZXh0ZW5kcyBleHRlcm5hbDpudWxsXG4gKi9cbmZ1bmN0aW9uIE51bGwoKXt9XG5OdWxsLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbk51bGwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVsbDtcblxuY29uc3RcbiAgICAkZXZlbnRzICAgICAgID0gJ0BAZW1pdHRlci9ldmVudHMnLFxuICAgICRldmVyeSAgICAgICAgPSAnQEBlbWl0dGVyL2V2ZXJ5JyxcbiAgICAkbWF4TGlzdGVuZXJzID0gJ0BAZW1pdHRlci9tYXhMaXN0ZW5lcnMnLFxuICAgIFxuICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICBcbiAgICBub29wID0gZnVuY3Rpb24oKXt9LFxuICAgIFxuICAgIEFQSSA9IG5ldyBOdWxsKCk7XG5cbi8vIE1hbnkgb2YgdGhlc2UgZnVuY3Rpb25zIGFyZSBicm9rZW4gb3V0IGZyb20gdGhlIHByb3RvdHlwZSBmb3IgdGhlIHNha2Ugb2Ygb3B0aW1pemF0aW9uLiBUaGUgZnVuY3Rpb25zIG9uIHRoZSBwcm90b3l0eXBlXG4vLyB0YWtlIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgY2FuIGJlIGRlb3B0aW1pemVkIGFzIGEgcmVzdWx0LiBUaGVzZSBmdW5jdGlvbnMgaGF2ZSBhIGZpeGVkIG51bWJlciBvZiBhcmd1bWVudHNcbi8vIGFuZCB0aGVyZWZvcmUgZG8gbm90IGdldCBkZW9wdGltaXplZC5cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIgKXtcbiAgICBcbiAgICBmdW5jdGlvbiBjb25kaXRpb25hbExpc3RlbmVyKCl7XG4gICAgICAgIGNvbnN0IGRvbmUgPSBsaXN0ZW5lci5hcHBseSggZW1pdHRlciwgYXJndW1lbnRzICk7XG4gICAgICAgIGlmKCBkb25lID09PSB0cnVlICl7XG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBjb25kaXRpb25hbExpc3RlbmVyICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gVE9ETyBDaGVjayBiZXlvbmQganVzdCBvbmUgbGV2ZWwgb2YgbGlzdGVuZXIgcmVmZXJlbmNlc1xuICAgIGNvbmRpdGlvbmFsTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lci5saXN0ZW5lciB8fCBsaXN0ZW5lcjtcbiAgICBcbiAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBjb25kaXRpb25hbExpc3RlbmVyLCBOYU4gKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApe1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgaWYoIF9ldmVudHNbICc6b24nIF0gKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9uJywgWyB0eXBlLCB0eXBlb2YgbGlzdGVuZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEVtaXR0aW5nIFwib25cIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgX2V2ZW50c1sgJzpvbicgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzpvbicgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgaWYoICFfZXZlbnRzWyB0eXBlIF0gKXtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gbGlzdGVuZXI7XG4gICAgXG4gICAgLy8gTXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBfZXZlbnRzWyB0eXBlIF0gKSApe1xuICAgICAgICBzd2l0Y2goIGlzTmFOKCBpbmRleCApIHx8IGluZGV4ICl7XG4gICAgICAgICAgICBjYXNlIHRydWU6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnVuc2hpZnQoIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5zcGxpY2UoIGluZGV4LCAwLCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgXG4gICAgLy8gVHJhbnNpdGlvbiBmcm9tIHNpbmdsZSB0byBtdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBpbmRleCA9PT0gMCA/XG4gICAgICAgICAgICBbIGxpc3RlbmVyLCBfZXZlbnRzWyB0eXBlIF0gXSA6XG4gICAgICAgICAgICBbIF9ldmVudHNbIHR5cGUgXSwgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gVHJhY2sgd2FybmluZ3MgaWYgbWF4IGxpc3RlbmVycyBpcyBhdmFpbGFibGVcbiAgICBpZiggJ21heExpc3RlbmVycycgaW4gZW1pdHRlciAmJiAhX2V2ZW50c1sgdHlwZSBdLndhcm5lZCApe1xuICAgICAgICBjb25zdCBtYXggPSBlbWl0dGVyLm1heExpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCBtYXggJiYgbWF4ID4gMCAmJiBfZXZlbnRzWyB0eXBlIF0ubGVuZ3RoID4gbWF4ICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6bWF4TGlzdGVuZXJzJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEVtaXR0aW5nIFwibWF4TGlzdGVuZXJzXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgICAgICBfZXZlbnRzWyAnOm1heExpc3RlbmVycycgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzptYXhMaXN0ZW5lcnMnIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVtaXR0ZXJbICRldmVudHMgXSA9IF9ldmVudHM7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRmluaXRlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICBcbiAgICBmdW5jdGlvbiBmaW5pdGVMaXN0ZW5lcigpe1xuICAgICAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIHJldHVybiAtLXRpbWVzID09PSAwO1xuICAgIH1cbiAgICBcbiAgICBmaW5pdGVMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgZmluaXRlTGlzdGVuZXIgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudE1hcHBpbmdcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBtYXBwaW5nIFRoZSBldmVudCBtYXBwaW5nLlxuICovXG5mdW5jdGlvbiBhZGRFdmVudE1hcHBpbmcoIGVtaXR0ZXIsIG1hcHBpbmcgKXtcbiAgICBjb25zdFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCBtYXBwaW5nICksXG4gICAgICAgIHR5cGVMZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgXG4gICAgbGV0IHR5cGVJbmRleCA9IDAsXG4gICAgICAgIGhhbmRsZXIsIGhhbmRsZXJJbmRleCwgaGFuZGxlckxlbmd0aCwgdHlwZTtcbiAgICBcbiAgICBmb3IoIDsgdHlwZUluZGV4IDwgdHlwZUxlbmd0aDsgdHlwZUluZGV4ICs9IDEgKXtcbiAgICAgICAgdHlwZSA9IHR5cGVzWyB0eXBlSW5kZXggXTtcbiAgICAgICAgaGFuZGxlciA9IG1hcHBpbmdbIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIC8vIExpc3Qgb2YgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGhhbmRsZXJJbmRleCA9IDA7XG4gICAgICAgICAgICBoYW5kbGVyTGVuZ3RoID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIDsgaGFuZGxlckluZGV4IDwgaGFuZGxlckxlbmd0aDsgaGFuZGxlckluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyWyBoYW5kbGVySW5kZXggXSwgTmFOICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXIsIE5hTiApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmRlZmluZUV2ZW50c1Byb3BlcnR5XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIHByb3BlcnR5IHdpbGwgYmUgY3JlYXRlZC5cbiAqLyBcbmZ1bmN0aW9uIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCB2YWx1ZSApe1xuICAgIGNvbnN0IGhhc0V2ZW50cyA9IGhhc093blByb3BlcnR5LmNhbGwoIGVtaXR0ZXIsICRldmVudHMgKSxcbiAgICAgICAgZW1pdHRlclByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiggZW1pdHRlciApO1xuICAgICAgICBcbiAgICBpZiggIWhhc0V2ZW50cyB8fCAoIGVtaXR0ZXJQcm90b3R5cGUgJiYgZW1pdHRlclsgJGV2ZW50cyBdID09PSBlbWl0dGVyUHJvdG90eXBlWyAkZXZlbnRzIF0gKSApe1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRldmVudHMsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0QWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIC8vIElmIHR5cGUgaXMgbm90IGEgc3RyaW5nLCBpbmRleCB3aWxsIGJlIGZhbHNlXG4gICAgICAgIGluZGV4ID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIFxuICAgIC8vIE5hbWVzcGFjZWQgZXZlbnQsIGUuZy4gRW1pdCBcImZvbzpiYXI6cXV4XCIsIHRoZW4gXCJmb286YmFyXCJcbiAgICB3aGlsZSggaW5kZXggPiAwICl7XG4gICAgICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZmFsc2UgKSApIHx8IGV4ZWN1dGVkO1xuICAgICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoIDAsIGluZGV4ICk7XG4gICAgICAgIGluZGV4ID0gdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVtaXQgc2luZ2xlIGV2ZW50IG9yIHRoZSBuYW1lc3BhY2VkIGV2ZW50IHJvb3QsIGUuZy4gXCJmb29cIiwgXCI6YmFyXCIsIFN5bWJvbCggXCJAQHF1eFwiIClcbiAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIHRydWUgKSApIHx8IGV4ZWN1dGVkO1xuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXJyb3JzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGBlcnJvcnNgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7QXJyYXk8ZXh0ZXJuYWw6RXJyb3I+fSBlcnJvcnMgVGhlIGFycmF5IG9mIGVycm9ycyB0byBiZSBlbWl0dGVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKXtcbiAgICBjb25zdCBsZW5ndGggPSBlcnJvcnMubGVuZ3RoO1xuICAgIGZvciggbGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnZXJyb3InLCBbIGVycm9yc1sgaW5kZXggXSBdLCBmYWxzZSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXZlbnRcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGVtaXRFdmVyeSBXaGV0aGVyIG9yIG5vdCBsaXN0ZW5lcnMgZm9yIGFsbCB0eXBlcyB3aWxsIGJlIGV4ZWN1dGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGVtaXRFdmVyeSApe1xuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcjtcbiAgICBcbiAgICBpZiggdHlwZSA9PT0gJ2Vycm9yJyAmJiAhX2V2ZW50cy5lcnJvciApe1xuICAgICAgICBjb25zdCBlcnJvciA9IGRhdGFbIDAgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCBlcnJvciBpbnN0YW5jZW9mIEVycm9yICl7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gdHlwZSBvZiBldmVudFxuICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgdHlwZSBdO1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBsaXN0ZW5pbmcgZm9yIGFsbCB0eXBlcyBvZiBldmVudHNcbiAgICBpZiggZW1pdEV2ZXJ5ICl7XG4gICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgJGV2ZXJ5IF07XG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbGlzdGVuZXIgdXNpbmcgdGhlIGludGVybmFsIGBleGVjdXRlKmAgZnVuY3Rpb25zIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZUxpc3RlbmVyXG4gKiBAcGFyYW0ge0FycmF5PExpc3RlbmVyPnxMaXN0ZW5lcn0gbGlzdGVuZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7Kn0gc2NvcGVcbiAqLyBcbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIHNjb3BlICl7XG4gICAgY29uc3QgaXNGdW5jdGlvbiA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJztcbiAgICBcbiAgICBzd2l0Y2goIGRhdGEubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGxpc3RlbkVtcHR5ICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgbGlzdGVuT25lICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxpc3RlblR3byAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGxpc3RlblRocmVlICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSwgZGF0YVsgMiBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxpc3Rlbk1hbnkgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0RXZlbnRUeXBlc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIGV2ZW50IHR5cGVzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50VHlwZXMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoIGVtaXR0ZXJbICRldmVudHMgXSApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIG1heCBsaXN0ZW5lcnMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgICBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gOlxuICAgICAgICBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5pc1Bvc2l0aXZlTnVtYmVyXG4gKiBAcGFyYW0geyp9IG51bWJlciBUaGUgdmFsdWUgdG8gYmUgdGVzdGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqL1xuZnVuY3Rpb24gaXNQb3NpdGl2ZU51bWJlciggbnVtYmVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInICYmIG51bWJlciA+PSAwICYmICFpc05hTiggbnVtYmVyICk7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggbm8gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuRW1wdHlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5FbXB0eSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggb25lIGFyZ3VtZW50LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuT25lXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk9uZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0d28gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVHdvXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVHdvKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHRocmVlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblRocmVlXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMyBUaGUgdGhpcmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblRocmVlKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIGZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5NYW55XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGFyZ3MgRm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTWFueSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJncyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnJlbW92ZUV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgLy8gRGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IGhhbmRsZXIgPSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICBcbiAgICBpZiggaGFuZGxlciA9PT0gbGlzdGVuZXIgfHwgKCB0eXBlb2YgaGFuZGxlci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJiBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgIGxldCBpbmRleCA9IC0xO1xuICAgICAgICBcbiAgICAgICAgZm9yKCBsZXQgaSA9IGhhbmRsZXIubGVuZ3RoOyBpLS0gPiAwOyApe1xuICAgICAgICAgICAgaWYoIGhhbmRsZXJbIGkgXSA9PT0gbGlzdGVuZXIgfHwgKCBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgJiYgaGFuZGxlclsgaSBdLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXG4gICAgICAgIGlmKCBpbmRleCA+IC0xICl7XG4gICAgICAgICAgICBpZiggaGFuZGxlci5sZW5ndGggPT09IDEgKXtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcGxpY2VMaXN0KCBoYW5kbGVyLCBpbmRleCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zZXRNYXhMaXN0ZW5lcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyB3aWxsIGJlIHNldC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cbiAqL1xuZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyLCBtYXggKXtcbiAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIG1heCApICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdtYXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICB9XG4gICAgXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkbWF4TGlzdGVuZXJzLCB7XG4gICAgICAgIHZhbHVlOiBtYXgsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSApO1xufVxuXG4vKipcbiAqIEZhc3RlciB0aGFuIGBBcnJheS5wcm90b3R5cGUuc3BsaWNlYFxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c3BsaWNlTGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gbGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi8gXG5mdW5jdGlvbiBzcGxpY2VMaXN0KCBsaXN0LCBpbmRleCApe1xuICAgIGZvciggbGV0IGkgPSBpbmRleCwgaiA9IGkgKyAxLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaiA8IGxlbmd0aDsgaSArPSAxLCBqICs9IDEgKXtcbiAgICAgICAgbGlzdFsgaSBdID0gbGlzdFsgaiBdO1xuICAgIH1cbiAgICBcbiAgICBsaXN0LnBvcCgpO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGV4ZWN1dGVzIGEgZnVuY3Rpb24uXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRpY2soIGNhbGxiYWNrICl7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoIGNhbGxiYWNrLCAwICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dGlja0FsbEV2ZW50c1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBhc3luY2hyb25vdXNseSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfSBBIHByb21pc2Ugd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gdGlja0FsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApe1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggZnVuY3Rpb24oIHJlc29sdmUsIHJlamVjdCApe1xuICAgICAgICB0aWNrKCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZW1pdEFsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApID8gcmVzb2x2ZSgpIDogcmVqZWN0KCk7XG4gICAgICAgIH0gKTtcbiAgICB9ICk7XG59XG5cbi8qKlxuICogQXBwbGllcyBhIGBzZWxlY3Rpb25gIG9mIHRoZSBFbWl0dGVyLmpzIEFQSSB0byB0aGUgYHRhcmdldGAuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50b0VtaXR0ZXJcbiAqIEBwYXJhbSB7QVBJUmVmZXJlbmNlfSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkuXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3Qgb24gd2hpY2ggdGhlIEFQSSB3aWxsIGJlIGFwcGxpZWQuXG4gKi9cbmZ1bmN0aW9uIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKXtcbiAgICBcbiAgICAvLyBBcHBseSB0aGUgZW50aXJlIEVtaXR0ZXIgQVBJXG4gICAgaWYoIHNlbGVjdGlvbiA9PT0gQVBJICl7XG4gICAgICAgIGFzRW1pdHRlci5jYWxsKCB0YXJnZXQgKTtcbiAgICBcbiAgICAvLyBBcHBseSBvbmx5IHRoZSBzZWxlY3RlZCBBUEkgbWV0aG9kc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBpbmRleCwga2V5LCBtYXBwaW5nLCBuYW1lcywgdmFsdWU7XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIHNlbGVjdGlvbiA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgICAgIG5hbWVzID0gc2VsZWN0aW9uLnNwbGl0KCAnICcgKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBBUEk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lcyA9IE9iamVjdC5rZXlzKCBzZWxlY3Rpb24gKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBzZWxlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gbmFtZXMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgIGtleSA9IG5hbWVzWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSBtYXBwaW5nWyBrZXkgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgICAgdmFsdWUgOlxuICAgICAgICAgICAgICAgIEFQSVsgdmFsdWUgXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uYWwgbWl4aW4gdGhhdCBwcm92aWRlcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gaXRzIHRhcmdldC4gVGhlIGBjb25zdHJ1Y3RvcigpYCwgYGRlc3Ryb3koKWAsIGB0b0pTT04oKWAsIGB0b1N0cmluZygpYCwgYW5kIHN0YXRpYyBwcm9wZXJ0aWVzIG9uIGBFbWl0dGVyYCBhcmUgbm90IHByb3ZpZGVkLiBUaGlzIG1peGluIGlzIHVzZWQgdG8gcG9wdWxhdGUgdGhlIGBwcm90b3R5cGVgIG9mIGBFbWl0dGVyYC5cbiAqIFxuICogTGlrZSBhbGwgZnVuY3Rpb25hbCBtaXhpbnMsIHRoaXMgc2hvdWxkIGJlIGV4ZWN1dGVkIHdpdGggW2NhbGwoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vY2FsbCkgb3IgW2FwcGx5KCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2FwcGx5KS5cbiAqIEBtaXhpbiBFbWl0dGVyfmFzRW1pdHRlclxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgRW1pdHRlciBmdW5jdGlvbmFsaXR5PC9jYXB0aW9uPlxuICogLy8gQ3JlYXRlIGEgYmFzZSBvYmplY3RcbiAqIGNvbnN0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBcbiAqIC8vIEFwcGx5IHRoZSBtaXhpblxuICogYXNFbWl0dGVyLmNhbGwoIGdyZWV0ZXIgKTtcbiAqIFxuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gKiAvLyBIZWxsbywgV29ybGQhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBjaGFvcyB0byB5b3VyIHdvcmxkPC9jYXB0aW9uPlxuICogLy8gTk8hISFcbiAqIGFzRW1pdHRlcigpOyAvLyBNYWRuZXNzIGVuc3Vlc1xuICovXG5mdW5jdGlvbiBhc0VtaXR0ZXIoKXtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmF0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXggV2hlcmUgdGhlIGxpc3RlbmVyIHdpbGwgYmUgYWRkZWQgaW4gdGhlIHRyaWdnZXIgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqL1xuICAgIHRoaXMuYXQgPSBmdW5jdGlvbiggdHlwZSwgaW5kZXgsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiBpbmRleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIGlzUG9zaXRpdmVOdW1iZXIoIGluZGV4ICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdpbmRleCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuY2xlYXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIHtcbiAgICAgKiAgJ2hlbGxvJyA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApOyB9LFxuICAgICAqICAnaGknICAgIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIaSEnICk7IH1cbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhciggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqL1xuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgaGFuZGxlcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE5vIEV2ZW50c1xuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdpdGggbm8gXCJvZmZcIiBsaXN0ZW5lcnMsIGNsZWFyaW5nIGNhbiBiZSBzaW1wbGlmaWVkXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsZWFyIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVzID0gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBdm9pZCByZW1vdmluZyBcIm9mZlwiIGxpc3RlbmVycyB1bnRpbCBhbGwgb3RoZXIgdHlwZXMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICAgICAgICAgIGZvciggbGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGlmKCB0eXBlc1sgaW5kZXggXSA9PT0gJzpvZmYnICl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCB0eXBlc1sgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYW51YWxseSBjbGVhciBcIm9mZlwiXG4gICAgICAgICAgICB0aGlzLmNsZWFyKCAnOm9mZicgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlciApO1xuICAgICAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlclsgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZW1pdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7ICAgIC8vIHRydWVcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApOyAgLy8gZmFsc2VcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudCB3aXRoIGRhdGE8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhIG5hbWVzcGFjZWQgZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogLy8gVGhpcyBldmVudCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgYnkgZW1pdHRpbmcgXCJncmVldGluZzpoZWxsb1wiXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbyBhZ2FpbiwgJHsgbmFtZSB9YCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5ldmVudFR5cGVzXG4gICAgICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coIGBIaWAgKSApO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmV2ZW50VHlwZXMoKSApO1xuICAgICAqIC8vIFsgJ2hlbGxvJywgJ2hpJyBdXG4gICAgICovIFxuICAgIHRoaXMuZXZlbnRUeXBlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZmlyc3RcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICovXG4gICAgdGhpcy5maXJzdCA9IGZ1bmN0aW9uKCB0eXBlLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCAwICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmdldE1heExpc3RlbmVyc1xuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDUgKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xuICAgICAqIC8vIDVcbiAgICAgKi9cbiAgICB0aGlzLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lckNvdW50XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdoZWxsbycgKSApO1xuICAgICAqIC8vIDFcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnZ29vZGJ5ZScgKSApO1xuICAgICAqIC8vIDBcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGNvdW50O1xuXG4gICAgICAgIC8vIEVtcHR5XG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgY291bnQgPSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gRnVuY3Rpb25cbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycmF5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudCA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGVsbG8gPSBmdW5jdGlvbigpe1xuICAgICAqICBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTtcbiAgICAgKiB9LFxuICAgICAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVycyggJ2hlbGxvJyApWyAwIF0gPT09IGhlbGxvICk7XG4gICAgICogLy8gdHJ1ZVxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVycyA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBsaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gWyBoYW5kbGVyIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhICptYW55IHRpbWUqIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLiBBZnRlciB0aGUgbGlzdGVuZXIgaXMgaW52b2tlZCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBgdGltZXNgLCBpdCBpcyByZW1vdmVkLlxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm1hbnlcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFueSBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnVGVycnknICk7ICAgICAgLy8gMlxuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdTdGV2ZScgKTsgICAgICAvLyAzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgIC8vIDJcbiAgICAgKiAvLyBIZWxsbywgVGVycnkhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgLy8gM1xuICAgICAqLyBcbiAgICB0aGlzLm1hbnkgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRpbWVzO1xuICAgICAgICAgICAgdGltZXMgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCB0aW1lcyApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndGltZXMgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgdGltZXMsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGBsaXN0ZW5lcmAgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gaXQgaXMgYXNzdW1lZCB0aGUgYGxpc3RlbmVyYCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIElmIGFueSBzaW5nbGUgbGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgbXVsdGlwbGUgdGltZXMgZm9yIHRoZSBzcGVjaWZpZWQgYHR5cGVgLCB0aGVuIGBlbWl0dGVyLm9mZigpYCBtdXN0IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byByZW1vdmUgZWFjaCBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub2ZmXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvZmZcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGFueSBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGdyZWV0KCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRpbmdzLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdKZWZmJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBoZWxsbyggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKi8gXG4gICAgdGhpcy5vZmYgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub25cbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuZXIgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub24gPSBmdW5jdGlvbigpe1xuICAgICAgICBsZXQgdHlwZSA9IGFyZ3VtZW50c1sgMCBdIHx8ICRldmVyeSxcbiAgICAgICAgICAgIGxpc3RlbmVyID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUeXBlIG5vdCBwcm92aWRlZCwgZmFsbCBiYWNrIHRvIFwiJGV2ZXJ5XCJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3Qgb2YgZXZlbnQgYmluZGluZ3NcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICl7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCB0eXBlICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBOYU4gKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uY2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gb25jZSB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub25jZSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIDEsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5zZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gbWF4IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVmb3JlIGEgd2FybmluZyBpcyBpc3N1ZWQuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDEgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqL1xuICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oIG1heCApe1xuICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGVtaXRzIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLiBUaGUgbGlzdGVuZXJzIHdpbGwgc3RpbGwgYmUgc3luY2hyb25vdXNseSBleGVjdXRlZCBpbiB0aGUgc3BlY2lmaWVkIG9yZGVyLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMge0BsaW5rIGV4dGVybmFsOlByb21pc2V8cHJvbWlzZX0gd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudGlja1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkFzeW5jaHJvbm91c2x5IGVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnaGVsbG8nICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnaGVsbG8gaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdnb29kYnllJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2dvb2RieWUgaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiAvLyBoZWxsbyBoZWFyZD8gdHJ1ZVxuICAgICAqIC8vIGdvb2RieWUgaGVhcmQ/IGZhbHNlXG4gICAgICovXG4gICAgdGhpcy50aWNrID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgcmV0dXJuIHRpY2tBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYGRhdGFgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudHJpZ2dlclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdoZWxsbycsIFsgJ1dvcmxkJyBdICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoZWxsbycsIFsgJ0plZmYnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWQgKnVudGlsKiB0aGUgYGxpc3RlbmVyYCByZXR1cm5zIGB0cnVlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnVudGlsXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMi4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1RlcnJ5JztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJywgJ1RlcnJ5JyApO1xuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdBYXJvbicgKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoICdoZWxsbycsIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnV29ybGQnO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdNYXJrJyApO1xuICAgICAqL1xuICAgIHRoaXMudW50aWwgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufVxuXG5hc0VtaXR0ZXIuY2FsbCggQVBJICk7XG5cbi8qKlxuICogQXBwbGllcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIHRhcmdldC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyXG4gKiBAcGFyYW0ge0FQSVJlZmVyZW5jZX0gW3NlbGVjdGlvbl0gQSBzZWxlY3Rpb24gb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBwYXJhbSB7ZXh0ZXJhbDpPYmplY3R9IHRhcmdldCBUaGUgb2JqZWN0IHRvIHdoaWNoIHRoZSBFbWl0dGVyLmpzIEFQSSB3aWxsIGJlIGFwcGxpZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBhbGwgb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggZ3JlZXRlciApO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBhIHNlbGVjdGlvbiBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCAnZW1pdCBvbiBvZmYnLCBncmVldGVyICk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbWFwcGluZyBhIHNlbGVjdGlvbiBvZiB0aGUgQVBJPC9jYXB0aW9uPlxuICogbGV0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG4gKiBFbWl0dGVyKCB7IGZpcmU6ICdlbWl0JywgYWRkTGlzdGVuZXI6ICdvbicgfSwgZ3JlZXRlciApO1xuICogZ3JlZXRlci5hZGRMaXN0ZW5lciggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZmlyZSggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKi9cbiBcbi8qKlxuICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBlbWl0dGVyLiBJZiBgbWFwcGluZ2AgYXJlIHByb3ZpZGVkIHRoZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIHBhc3NlZCBpbnRvIGBvbigpYCBvbmNlIGNvbnN0cnVjdGlvbiBpcyBjb21wbGV0ZS5cbiAqIEBjbGFzcyBFbWl0dGVyXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gW21hcHBpbmddIEEgbWFwcGluZyBvZiBldmVudCB0eXBlcyB0byBldmVudCBsaXN0ZW5lcnMuXG4gKiBAY2xhc3NkZXNjIEFuIG9iamVjdCB0aGF0IGVtaXRzIG5hbWVkIGV2ZW50cyB3aGljaCBjYXVzZSBmdW5jdGlvbnMgdG8gYmUgZXhlY3V0ZWQuXG4gKiBAZXh0ZW5kcyBFbWl0dGVyfk51bGxcbiAqIEBtaXhlcyBFbWl0dGVyfmFzRW1pdHRlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL2xpYi9ldmVudHMuanN9XG4gKiBAc2luY2UgMS4wLjBcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlVzaW5nIEVtaXR0ZXIgZGlyZWN0bHk8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgQ2xhc3NpY2FsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxuICogY2xhc3MgR3JlZXRlciBleHRlbmRzIEVtaXR0ZXIge1xuICogIGNvbnN0cnVjdG9yKCl7XG4gKiAgICAgIHN1cGVyKCk7XG4gKiAgICAgIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqICB9XG4gKiBcbiAqICBncmVldCggbmFtZSApe1xuICogICAgICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqICB9XG4gKiB9XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIFByb3RvdHlwYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBmdW5jdGlvbiBHcmVldGVyKCl7XG4gKiAgRW1pdHRlci5jYWxsKCB0aGlzICk7XG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogfVxuICogR3JlZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuICogXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gKiAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiB9O1xuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5OYW1lc3BhY2VkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gKiAvLyBIaSwgTWFyayFcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0aW5ncyA9IHtcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAqICB9LFxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XG4gKiBcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICogLy8gSGVsbG8sIEFhcm9uIVxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgIC8vIDJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEhlbGxvLCBUZXJyeSFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlcigpe1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBjb25zdHJ1Y3RvclxuICAgIGlmKCB0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25zdHJ1Y3RvciA9PT0gRW1pdHRlciApe1xuICAgICAgICBsZXQgbWFwcGluZyA9IGFyZ3VtZW50c1sgMCBdO1xuICAgICAgICB0eXBlb2YgbWFwcGluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCBtYXBwaW5nICk7XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQnkgZGVmYXVsdCBFbWl0dGVycyB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIHByb3BlcnR5IGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIjbWF4TGlzdGVuZXJzXG4gICAgICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgICAgICogXG4gICAgICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLm1heExpc3RlbmVycyApO1xuICAgICAgICAgKiAvLyAxMFxuICAgICAgICAgKiBcbiAgICAgICAgICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSAxO1xuICAgICAgICAgKiBcbiAgICAgICAgICogZ3JlZXRlci5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgICAgICovXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heExpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgICAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGZ1bmN0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IGFyZ3VtZW50c1sgMCBdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHNcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0YXJnZXQgPSBzZWxlY3Rpb247XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBBUEk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZGVmYXVsdCBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBlbWl0dGVycy4gVXNlIGBlbWl0dGVyLm1heExpc3RlbmVyc2AgdG8gc2V0IHRoZSBtYXhpbXVtIG9uIGEgcGVyLWluc3RhbmNlIGJhc2lzLlxuICAgICAqIFxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPTEwXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlcjEgPSBuZXcgRW1pdHRlcigpLFxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGFsZXJ0KCAnSGkhJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICovXG4gICAgZGVmYXVsdE1heExpc3RlbmVyczoge1xuICAgICAgICB2YWx1ZTogMTAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3ltYm9sIHVzZWQgdG8gbGlzdGVuIGZvciBldmVudHMgb2YgYW55IGB0eXBlYC4gRm9yIF9tb3N0XyBtZXRob2RzLCB3aGVuIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGlzIGlzIHRoZSBkZWZhdWx0LlxuICAgICAqIFxuICAgICAqIFVzaW5nIGBFbWl0dGVyLmV2ZXJ5YCBpcyB0eXBpY2FsbHkgbm90IG5lY2Vzc2FyeS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzeW1ib2x9IEVtaXR0ZXIuZXZlcnlcbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIEVtaXR0ZXIuZXZlcnksICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKi9cbiAgICBldmVyeToge1xuICAgICAgICB2YWx1ZTogJGV2ZXJ5LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgKkVtaXR0ZXIuanMqLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gRW1pdHRlci52ZXJzaW9uXG4gICAgICogQHNpbmNlIDEuMS4yXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci52ZXJzaW9uICk7XG4gICAgICogLy8gMi4wLjBcbiAgICAgKi9cbiAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHZhbHVlOiAnMi4wLjAnLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfVxufSApO1xuXG5FbWl0dGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbkVtaXR0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW1pdHRlcjtcblxuYXNFbWl0dGVyLmNhbGwoIEVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCB0cnVlICk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZGVzdHJveSA9IHRoaXMuYXQgPSB0aGlzLmNsZWFyID0gdGhpcy5lbWl0ID0gdGhpcy5ldmVudFR5cGVzID0gdGhpcy5maXJzdCA9IHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lckNvdW50ID0gdGhpcy5saXN0ZW5lcnMgPSB0aGlzLm1hbnkgPSB0aGlzLm9mZiA9IHRoaXMub24gPSB0aGlzLm9uY2UgPSB0aGlzLnNldE1heExpc3RlbmVycyA9IHRoaXMudGljayA9IHRoaXMudHJpZ2dlciA9IHRoaXMudW50aWwgPSBub29wO1xuICAgIHRoaXMudG9KU09OID0gKCkgPT4gJ2Rlc3Ryb3llZCc7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfVxuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIFwiZGVzdHJveWVkXCJcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICBjb25zdCBqc29uID0gbmV3IE51bGwoKSxcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICksXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgdHlwZTtcbiAgICBcbiAgICBqc29uLm1heExpc3RlbmVycyA9IHRoaXMubWF4TGlzdGVuZXJzO1xuICAgIGpzb24ubGlzdGVuZXJDb3VudCA9IG5ldyBOdWxsKCk7XG4gICAgXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciBcImRlc3Ryb3llZFwiJ1xuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGAkeyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgfSAkeyBKU09OLnN0cmluZ2lmeSggdGhpcy50b0pTT04oKSApIH1gLnRyaW0oKTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9