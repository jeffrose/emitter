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
     * @since 1.0.0
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOzs7Ozs7QUFNQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7Ozs7O3NCQXMzQ3dCQSxPOzs7Ozs7OztBQWozQ3hCLGFBQVNDLElB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NkIsTUFBT3BCLEtBQVAsQ0FBUDtBQUNBeUcsaUJBQUtmLGFBQUwsQ0FBb0JuRyxJQUFwQixJQUE2QixLQUFLbUcsYUFBTCxDQUFvQm5HLElBQXBCLENBQTdCO0FBQ0g7O0FBRUQsZUFBT2tILElBQVA7QUFDSCxLQWpCRDs7QUFtQkE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBaEksWUFBUUUsU0FBUixDQUFrQitILFFBQWxCLEdBQTZCLFlBQVU7QUFDbkMsZUFBTyxDQUFJLEtBQUs1SCxXQUFMLENBQWlCNkgsSUFBckIsU0FBK0JDLEtBQUtDLFNBQUwsQ0FBZ0IsS0FBS0wsTUFBTCxFQUFoQixDQUEvQixFQUFrRU0sSUFBbEUsRUFBUDtBQUNILEtBRkQiLCJmaWxlIjoiZW1pdHRlci11bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSmF2YVNjcmlwdCBBcnJheVxuICogQGV4dGVybmFsIEFycmF5XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1BybTQ1NG11bjMhaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cbiAqIEBleHRlcm5hbCBib29sZWFuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRXJyb3JcbiAqIEBleHRlcm5hbCBFcnJvclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxuICogQGV4dGVybmFsIEZ1bmN0aW9uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcbiAqIEBleHRlcm5hbCBudW1iZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCBudWxsXG4gKiBAZXh0ZXJuYWwgbnVsbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvbnVsbH1cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxuICogQGV4dGVybmFsIE9iamVjdFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0fVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCBQcm9taXNlXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJvbWlzZX1cbiAqL1xuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXG4gKiBAZXh0ZXJuYWwgc3RyaW5nXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XG4gKi9cbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzeW1ib2xcbiAqIEBleHRlcm5hbCBzeW1ib2xcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N5bWJvbH1cbiAqL1xuXG4vKipcbiAqIEEgc2V0IG9mIG1ldGhvZCByZWZlcmVuY2VzIHRvIHRoZSBFbWl0dGVyLmpzIEFQSS5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6T2JqZWN0fSBBUElSZWZlcmVuY2VcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkEgc2VsZWN0aW9uIHJlZmVyZW5jZTwvY2FwdGlvbj5cbiAqICdlbWl0IG9mZiBvbiBvbmNlJ1xuICogQGV4YW1wbGUgPGNhcHRpb24+QSBtYXBwaW5nIHJlZmVyZW5jZTwvY2FwdGlvbj5cbiAqIC8vICdlbWl0KCknIHdpbGwgYmUgbWFwcGVkIHRvICdmaXJlKCknXG4gKiAvLyAnb24oKScgd2lsbCBiZSBtYXBwZWQgdG8gJ2FkZExpc3RlbmVyKCknXG4gKiAvLyAnb2ZmKCknIHdpbGwgYmUgbWFwcGVkIHRvICdyZW1vdmVMaXN0ZW5lcigpJ1xuICoge1xuICogIGZpcmU6ICdlbWl0JyxcbiAqICBhZGRMaXN0ZW5lcjogJ29uJyxcbiAqICByZW1vdmVMaXN0ZW5lcjogJ29mZidcbiAqIH1cbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufCBmdW5jdGlvbn0gYm91bmQgdG8gYW4gZW1pdHRlciB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGV9LiBBbnkgZGF0YSB0cmFuc21pdHRlZCB3aXRoIHRoZSBldmVudCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lciBhcyBhcmd1bWVudHMuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7Li4uKn0gZGF0YSBUaGUgYXJndW1lbnRzIHBhc3NlZCBieSB0aGUgYGVtaXRgLlxuICovXG5cbi8qKlxuICogQW4ge0BsaW5rIGV4dGVybmFsOk9iamVjdHxvYmplY3R9IHRoYXQgbWFwcyB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGVzfSB0byB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxldmVudCBsaXN0ZW5lcnN9LlxuICogQHR5cGVkZWYge2V4dGVybmFsOk9iamVjdH0gRXZlbnRNYXBwaW5nXG4gKi9cblxuLyoqXG4gKiBBIHtAbGluayBleHRlcm5hbDpzdHJpbmd9IG9yIHtAbGluayBleHRlcm5hbDpzeW1ib2x9IHRoYXQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiBldmVudCBmaXJlZCBieSB0aGUgRW1pdHRlci5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6c3ltYm9sfSBFdmVudFR5cGVcbiAqLyBcblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYW4gZW1pdHRlciBkZXN0cm95cyBpdHNlbGYuXG4gKiBAZXZlbnQgRW1pdHRlciM6ZGVzdHJveVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYWZ0ZXJfIGEgbGlzdGVuZXIgaXMgcmVtb3ZlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvZmZcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhIGxpc3RlbmVyIGlzIGFkZGVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9uXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGhhcyBiZWVuIGV4Y2VlZGVkIGZvciBhbiBldmVudCB0eXBlLlxuICogQGV2ZW50IEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBFbWl0dGVyfk51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsO1xuXG5jb25zdFxuICAgICRldmVudHMgICAgICAgPSAnQEBlbWl0dGVyL2V2ZW50cycsXG4gICAgJGV2ZXJ5ICAgICAgICA9ICdAQGVtaXR0ZXIvZXZlcnknLFxuICAgICRtYXhMaXN0ZW5lcnMgPSAnQEBlbWl0dGVyL21heExpc3RlbmVycycsXG4gICAgXG4gICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgIFxuICAgIG5vb3AgPSBmdW5jdGlvbigpe30sXG4gICAgXG4gICAgQVBJID0gbmV3IE51bGwoKTtcblxuLy8gTWFueSBvZiB0aGVzZSBmdW5jdGlvbnMgYXJlIGJyb2tlbiBvdXQgZnJvbSB0aGUgcHJvdG90eXBlIGZvciB0aGUgc2FrZSBvZiBvcHRpbWl6YXRpb24uIFRoZSBmdW5jdGlvbnMgb24gdGhlIHByb3RveXR5cGVcbi8vIHRha2UgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYXMgYSByZXN1bHQuIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIGEgZml4ZWQgbnVtYmVyIG9mIGFyZ3VtZW50c1xuLy8gYW5kIHRoZXJlZm9yZSBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLlxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGNvbmRpdGlvbmFsTGlzdGVuZXIoKXtcbiAgICAgICAgY29uc3QgZG9uZSA9IGxpc3RlbmVyLmFwcGx5KCBlbWl0dGVyLCBhcmd1bWVudHMgKTtcbiAgICAgICAgaWYoIGRvbmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPIENoZWNrIGJleW9uZCBqdXN0IG9uZSBsZXZlbCBvZiBsaXN0ZW5lciByZWZlcmVuY2VzXG4gICAgY29uZGl0aW9uYWxMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyLmxpc3RlbmVyIHx8IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIsIE5hTiApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICl7XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIH1cbiAgICBcbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgaWYoIF9ldmVudHNbICc6b24nIF0gKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9uJywgWyB0eXBlLCB0eXBlb2YgbGlzdGVuZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEVtaXR0aW5nIFwib25cIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgX2V2ZW50c1sgJzpvbicgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzpvbicgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgaWYoICFfZXZlbnRzWyB0eXBlIF0gKXtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gbGlzdGVuZXI7XG4gICAgXG4gICAgLy8gTXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBfZXZlbnRzWyB0eXBlIF0gKSApe1xuICAgICAgICBzd2l0Y2goIGlzTmFOKCBpbmRleCApIHx8IGluZGV4ICl7XG4gICAgICAgICAgICBjYXNlIHRydWU6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnVuc2hpZnQoIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5zcGxpY2UoIGluZGV4LCAwLCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgXG4gICAgLy8gVHJhbnNpdGlvbiBmcm9tIHNpbmdsZSB0byBtdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBpbmRleCA9PT0gMCA/XG4gICAgICAgICAgICBbIGxpc3RlbmVyLCBfZXZlbnRzWyB0eXBlIF0gXSA6XG4gICAgICAgICAgICBbIF9ldmVudHNbIHR5cGUgXSwgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gVHJhY2sgd2FybmluZ3MgaWYgbWF4IGxpc3RlbmVycyBpcyBhdmFpbGFibGVcbiAgICBpZiggJ21heExpc3RlbmVycycgaW4gZW1pdHRlciAmJiAhX2V2ZW50c1sgdHlwZSBdLndhcm5lZCApe1xuICAgICAgICBjb25zdCBtYXggPSBlbWl0dGVyLm1heExpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCBtYXggJiYgbWF4ID4gMCAmJiBfZXZlbnRzWyB0eXBlIF0ubGVuZ3RoID4gbWF4ICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6bWF4TGlzdGVuZXJzJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEVtaXR0aW5nIFwibWF4TGlzdGVuZXJzXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgICAgICBfZXZlbnRzWyAnOm1heExpc3RlbmVycycgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzptYXhMaXN0ZW5lcnMnIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGVtaXR0ZXJbICRldmVudHMgXSA9IF9ldmVudHM7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRmluaXRlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICBcbiAgICBmdW5jdGlvbiBmaW5pdGVMaXN0ZW5lcigpe1xuICAgICAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIHJldHVybiAtLXRpbWVzID09PSAwO1xuICAgIH1cbiAgICBcbiAgICBmaW5pdGVMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgZmluaXRlTGlzdGVuZXIgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRFdmVudE1hcHBpbmdcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBtYXBwaW5nIFRoZSBldmVudCBtYXBwaW5nLlxuICovXG5mdW5jdGlvbiBhZGRFdmVudE1hcHBpbmcoIGVtaXR0ZXIsIG1hcHBpbmcgKXtcbiAgICBjb25zdFxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCBtYXBwaW5nICksXG4gICAgICAgIHR5cGVMZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgXG4gICAgbGV0IHR5cGVJbmRleCA9IDAsXG4gICAgICAgIGhhbmRsZXIsIGhhbmRsZXJJbmRleCwgaGFuZGxlckxlbmd0aCwgdHlwZTtcbiAgICBcbiAgICBmb3IoIDsgdHlwZUluZGV4IDwgdHlwZUxlbmd0aDsgdHlwZUluZGV4ICs9IDEgKXtcbiAgICAgICAgdHlwZSA9IHR5cGVzWyB0eXBlSW5kZXggXTtcbiAgICAgICAgaGFuZGxlciA9IG1hcHBpbmdbIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIC8vIExpc3Qgb2YgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGhhbmRsZXJJbmRleCA9IDA7XG4gICAgICAgICAgICBoYW5kbGVyTGVuZ3RoID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIDsgaGFuZGxlckluZGV4IDwgaGFuZGxlckxlbmd0aDsgaGFuZGxlckluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyWyBoYW5kbGVySW5kZXggXSwgTmFOICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXIsIE5hTiApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmRlZmluZUV2ZW50c1Byb3BlcnR5XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIHByb3BlcnR5IHdpbGwgYmUgY3JlYXRlZC5cbiAqLyBcbmZ1bmN0aW9uIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCB2YWx1ZSApe1xuICAgIGNvbnN0IGhhc0V2ZW50cyA9IGhhc093blByb3BlcnR5LmNhbGwoIGVtaXR0ZXIsICRldmVudHMgKSxcbiAgICAgICAgZW1pdHRlclByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiggZW1pdHRlciApO1xuICAgICAgICBcbiAgICBpZiggIWhhc0V2ZW50cyB8fCAoIGVtaXR0ZXJQcm90b3R5cGUgJiYgZW1pdHRlclsgJGV2ZW50cyBdID09PSBlbWl0dGVyUHJvdG90eXBlWyAkZXZlbnRzIF0gKSApe1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRldmVudHMsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0QWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIC8vIElmIHR5cGUgaXMgbm90IGEgc3RyaW5nLCBpbmRleCB3aWxsIGJlIGZhbHNlXG4gICAgICAgIGluZGV4ID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIFxuICAgIC8vIE5hbWVzcGFjZWQgZXZlbnQsIGUuZy4gRW1pdCBcImZvbzpiYXI6cXV4XCIsIHRoZW4gXCJmb286YmFyXCJcbiAgICB3aGlsZSggaW5kZXggPiAwICl7XG4gICAgICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZmFsc2UgKSApIHx8IGV4ZWN1dGVkO1xuICAgICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoIDAsIGluZGV4ICk7XG4gICAgICAgIGluZGV4ID0gdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgfVxuICAgIFxuICAgIC8vIEVtaXQgc2luZ2xlIGV2ZW50IG9yIHRoZSBuYW1lc3BhY2VkIGV2ZW50IHJvb3QsIGUuZy4gXCJmb29cIiwgXCI6YmFyXCIsIFN5bWJvbCggXCJAQHF1eFwiIClcbiAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIHRydWUgKSApIHx8IGV4ZWN1dGVkO1xuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXJyb3JzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGBlcnJvcnNgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7QXJyYXk8ZXh0ZXJuYWw6RXJyb3I+fSBlcnJvcnMgVGhlIGFycmF5IG9mIGVycm9ycyB0byBiZSBlbWl0dGVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKXtcbiAgICBjb25zdCBsZW5ndGggPSBlcnJvcnMubGVuZ3RoO1xuICAgIGZvciggbGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnZXJyb3InLCBbIGVycm9yc1sgaW5kZXggXSBdLCBmYWxzZSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXZlbnRcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGVtaXRFdmVyeSBXaGV0aGVyIG9yIG5vdCBsaXN0ZW5lcnMgZm9yIGFsbCB0eXBlcyB3aWxsIGJlIGV4ZWN1dGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGVtaXRFdmVyeSApe1xuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIGxpc3RlbmVyO1xuICAgIFxuICAgIGlmKCB0eXBlb2YgX2V2ZW50cyAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgaWYoIHR5cGUgPT09ICdlcnJvcicgJiYgIV9ldmVudHMuZXJyb3IgKXtcbiAgICAgICAgICAgIGlmKCBkYXRhWyAwIF0gaW5zdGFuY2VvZiBFcnJvciApe1xuICAgICAgICAgICAgICAgIHRocm93IGRhdGFbIDAgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gdHlwZSBvZiBldmVudFxuICAgICAgICBsaXN0ZW5lciA9IF9ldmVudHNbIHR5cGUgXTtcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgbGlzdGVuaW5nIGZvciBhbGwgdHlwZXMgb2YgZXZlbnRzXG4gICAgICAgIGlmKCBlbWl0RXZlcnkgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgJGV2ZXJ5IF07XG4gICAgICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbGlzdGVuZXIgdXNpbmcgdGhlIGludGVybmFsIGBleGVjdXRlKmAgZnVuY3Rpb25zIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZUxpc3RlbmVyXG4gKiBAcGFyYW0ge0FycmF5PExpc3RlbmVyPnxMaXN0ZW5lcn0gbGlzdGVuZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7Kn0gc2NvcGVcbiAqLyBcbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIHNjb3BlICl7XG4gICAgY29uc3QgaXNGdW5jdGlvbiA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJztcbiAgICBcbiAgICBzd2l0Y2goIGRhdGEubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGxpc3RlbkVtcHR5ICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgbGlzdGVuT25lICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxpc3RlblR3byAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGxpc3RlblRocmVlICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSwgZGF0YVsgMiBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxpc3Rlbk1hbnkgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0RXZlbnRUeXBlc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIGV2ZW50IHR5cGVzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50VHlwZXMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoIGVtaXR0ZXJbICRldmVudHMgXSApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIG1heCBsaXN0ZW5lcnMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgICBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gOlxuICAgICAgICBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5pc1Bvc2l0aXZlTnVtYmVyXG4gKiBAcGFyYW0geyp9IG51bWJlciBUaGUgdmFsdWUgdG8gYmUgdGVzdGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqL1xuZnVuY3Rpb24gaXNQb3NpdGl2ZU51bWJlciggbnVtYmVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInICYmIG51bWJlciA+PSAwICYmICFpc05hTiggbnVtYmVyICk7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggbm8gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuRW1wdHlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5FbXB0eSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggb25lIGFyZ3VtZW50LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuT25lXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk9uZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0d28gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVHdvXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVHdvKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHRocmVlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblRocmVlXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMyBUaGUgdGhpcmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblRocmVlKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIGZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5NYW55XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGFyZ3MgRm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTWFueSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJncyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnJlbW92ZUV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgY29uc3QgaGFuZGxlciA9IGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgIFxuICAgIGlmKCBoYW5kbGVyID09PSBsaXN0ZW5lciB8fCAoIHR5cGVvZiBoYW5kbGVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBpZiggZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIFxuICAgICAgICBmb3IoIGxldCBpID0gaGFuZGxlci5sZW5ndGg7IGktLSA+IDA7ICl7XG4gICAgICAgICAgICBpZiggaGFuZGxlclsgaSBdID09PSBsaXN0ZW5lciB8fCAoIGhhbmRsZXJbIGkgXS5saXN0ZW5lciAmJiBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgaWYoIGluZGV4ID4gLTEgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwbGljZUxpc3QoIGhhbmRsZXIsIGluZGV4ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIHdpbGwgYmUgc2V0LlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICovXG5mdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIsIG1heCApe1xuICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggbWF4ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ21heCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgIH1cbiAgICBcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRtYXhMaXN0ZW5lcnMsIHtcbiAgICAgICAgdmFsdWU6IG1heCxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9ICk7XG59XG5cbi8qKlxuICogRmFzdGVyIHRoYW4gYEFycmF5LnByb3RvdHlwZS5zcGxpY2VgXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zcGxpY2VMaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBsaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqLyBcbmZ1bmN0aW9uIHNwbGljZUxpc3QoIGxpc3QsIGluZGV4ICl7XG4gICAgZm9yKCBsZXQgaSA9IGluZGV4LCBqID0gaSArIDEsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBqIDwgbGVuZ3RoOyBpICs9IDEsIGogKz0gMSApe1xuICAgICAgICBsaXN0WyBpIF0gPSBsaXN0WyBqIF07XG4gICAgfVxuICAgIFxuICAgIGxpc3QucG9wKCk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgZXhlY3V0ZXMgYSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC5cbiAqL1xuZnVuY3Rpb24gdGljayggY2FsbGJhY2sgKXtcbiAgICByZXR1cm4gc2V0VGltZW91dCggY2FsbGJhY2ssIDAgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrQWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiB0aWNrQWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICl7XG4gICAgICAgIHRpY2soIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICkgPyByZXNvbHZlKCkgOiByZWplY3QoKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgYHNlbGVjdGlvbmAgb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRvRW1pdHRlclxuICogQHBhcmFtIHtBUElSZWZlcmVuY2V9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCBvbiB3aGljaCB0aGUgQVBJIHdpbGwgYmUgYXBwbGllZC5cbiAqL1xuZnVuY3Rpb24gdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApe1xuICAgIFxuICAgIC8vIEFwcGx5IHRoZSBlbnRpcmUgRW1pdHRlciBBUElcbiAgICBpZiggc2VsZWN0aW9uID09PSBBUEkgKXtcbiAgICAgICAgYXNFbWl0dGVyLmNhbGwoIHRhcmdldCApO1xuICAgIFxuICAgIC8vIEFwcGx5IG9ubHkgdGhlIHNlbGVjdGVkIEFQSSBtZXRob2RzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGluZGV4LCBrZXksIG1hcHBpbmcsIG5hbWVzLCB2YWx1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2Ygc2VsZWN0aW9uID09PSAnc3RyaW5nJyApe1xuICAgICAgICAgICAgbmFtZXMgPSBzZWxlY3Rpb24uc3BsaXQoICcgJyApO1xuICAgICAgICAgICAgbWFwcGluZyA9IEFQSTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hbWVzID0gT2JqZWN0LmtleXMoIHNlbGVjdGlvbiApO1xuICAgICAgICAgICAgbWFwcGluZyA9IHNlbGVjdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBuYW1lcy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAga2V5ID0gbmFtZXNbIGluZGV4IF07XG4gICAgICAgICAgICB2YWx1ZSA9IG1hcHBpbmdbIGtleSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0YXJnZXRbIGtleSBdID0gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgICAgICB2YWx1ZSA6XG4gICAgICAgICAgICAgICAgQVBJWyB2YWx1ZSBdO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgZnVuY3Rpb25hbCBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byBpdHMgdGFyZ2V0LiBUaGUgYGNvbnN0cnVjdG9yKClgLCBgZGVzdHJveSgpYCwgYHRvSlNPTigpYCwgYHRvU3RyaW5nKClgLCBhbmQgc3RhdGljIHByb3BlcnRpZXMgb24gYEVtaXR0ZXJgIGFyZSBub3QgcHJvdmlkZWQuIFRoaXMgbWl4aW4gaXMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgYHByb3RvdHlwZWAgb2YgYEVtaXR0ZXJgLlxuICogXG4gKiBMaWtlIGFsbCBmdW5jdGlvbmFsIG1peGlucywgdGhpcyBzaG91bGQgYmUgZXhlY3V0ZWQgd2l0aCBbY2FsbCgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9jYWxsKSBvciBbYXBwbHkoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYXBwbHkpLlxuICogQG1peGluIEVtaXR0ZXJ+YXNFbWl0dGVyXG4gKiBAc2luY2UgMS4xLjBcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIEVtaXR0ZXIgZnVuY3Rpb25hbGl0eTwvY2FwdGlvbj5cbiAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogXG4gKiAvLyBBcHBseSB0aGUgbWl4aW5cbiAqIGFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XG4gKiBcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICogLy8gSGVsbG8sIFdvcmxkIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgY2hhb3MgdG8geW91ciB3b3JsZDwvY2FwdGlvbj5cbiAqIC8vIE5PISEhXG4gKiBhc0VtaXR0ZXIoKTsgLy8gTWFkbmVzcyBlbnN1ZXNcbiAqL1xuZnVuY3Rpb24gYXNFbWl0dGVyKCl7XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCBhdCB0aGUgc3BlY2lmaWVkIGBpbmRleGAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5hdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4IFdoZXJlIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGFkZGVkIGluIHRoZSB0cmlnZ2VyIGxpc3QuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKi9cbiAgICB0aGlzLmF0ID0gZnVuY3Rpb24oIHR5cGUsIGluZGV4LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgaW5kZXggPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCBpc1Bvc2l0aXZlTnVtYmVyKCBpbmRleCApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnaW5kZXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmNsZWFyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coICdIaSEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCB7XG4gICAgICogICdoZWxsbycgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTsgfSxcbiAgICAgKiAgJ2hpJyAgICA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGkhJyApOyB9XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKi9cbiAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGhhbmRsZXI7XG4gICAgICAgIFxuICAgICAgICAvLyBObyBFdmVudHNcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXaXRoIG5vIFwib2ZmXCIgbGlzdGVuZXJzLCBjbGVhcmluZyBjYW4gYmUgc2ltcGxpZmllZFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDbGVhciBhbGwgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICBjb25zdCB0eXBlcyA9IGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQXZvaWQgcmVtb3ZpbmcgXCJvZmZcIiBsaXN0ZW5lcnMgdW50aWwgYWxsIG90aGVyIHR5cGVzIGhhdmUgYmVlbiByZW1vdmVkXG4gICAgICAgICAgICBmb3IoIGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBpZiggdHlwZXNbIGluZGV4IF0gPT09ICc6b2ZmJyApe1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhciggdHlwZXNbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTWFudWFsbHkgY2xlYXIgXCJvZmZcIlxuICAgICAgICAgICAgdGhpcy5jbGVhciggJzpvZmYnICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXIgKTtcbiAgICAgICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXJbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy5cbiAgICAgKiBcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmVtaXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApOyAgICAvLyB0cnVlXG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTsgIC8vIGZhbHNlXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQgd2l0aCBkYXRhPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYSBuYW1lc3BhY2VkIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICAgICAqIFxuICAgICAqIC8vIFRoaXMgZXZlbnQgd2lsbCBub3QgYmUgdHJpZ2dlcmVkIGJ5IGVtaXR0aW5nIFwiZ3JlZXRpbmc6aGVsbG9cIlxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8gYWdhaW4sICR7IG5hbWUgfWAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICAgICAqIC8vIEhpLCBNYXJrIVxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBkYXRhID0gW10sXG4gICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgaWYoIGxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgIGRhdGEgPSBBcnJheSggbGVuZ3RoIC0gMSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIGxldCBrZXkgPSAxOyBrZXkgPCBsZW5ndGg7IGtleSsrICl7XG4gICAgICAgICAgICAgICAgZGF0YVsga2V5IC0gMSBdID0gYXJndW1lbnRzWyBrZXkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5ldmVudFR5cGVzXG4gICAgICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coIGBIaWAgKSApO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmV2ZW50VHlwZXMoKSApO1xuICAgICAqIC8vIFsgJ2hlbGxvJywgJ2hpJyBdXG4gICAgICovIFxuICAgIHRoaXMuZXZlbnRUeXBlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZmlyc3RcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICovXG4gICAgdGhpcy5maXJzdCA9IGZ1bmN0aW9uKCB0eXBlLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCAwICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmdldE1heExpc3RlbmVyc1xuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gICAgICogQHNpbmNlIDIuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDUgKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5nZXRNYXhMaXN0ZW5lcnMoKSApO1xuICAgICAqIC8vIDVcbiAgICAgKi9cbiAgICB0aGlzLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lckNvdW50XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdoZWxsbycgKSApO1xuICAgICAqIC8vIDFcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnZ29vZGJ5ZScgKSApO1xuICAgICAqIC8vIDBcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGNvdW50O1xuXG4gICAgICAgIC8vIEVtcHR5XG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgY291bnQgPSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gRnVuY3Rpb25cbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycmF5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudCA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGVsbG8gPSBmdW5jdGlvbigpe1xuICAgICAqICBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTtcbiAgICAgKiB9LFxuICAgICAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVycyggJ2hlbGxvJyApWyAwIF0gPT09IGhlbGxvICk7XG4gICAgICogLy8gdHJ1ZVxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVycyA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBsaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gWyBoYW5kbGVyIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhICptYW55IHRpbWUqIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLiBBZnRlciB0aGUgbGlzdGVuZXIgaXMgaW52b2tlZCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBgdGltZXNgLCBpdCBpcyByZW1vdmVkLlxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm1hbnlcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gdGltZXMgVGhlIG51bWJlciB0aW1lcyB0aGUgbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgcmVtb3ZlZC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQHNpbmNlIDEuMC4wXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFueSBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnVGVycnknICk7ICAgICAgLy8gMlxuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdTdGV2ZScgKTsgICAgICAvLyAzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgIC8vIDJcbiAgICAgKiAvLyBIZWxsbywgVGVycnkhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgLy8gM1xuICAgICAqLyBcbiAgICB0aGlzLm1hbnkgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRpbWVzO1xuICAgICAgICAgICAgdGltZXMgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCB0aW1lcyApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndGltZXMgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgdGltZXMsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGBsaXN0ZW5lcmAgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gaXQgaXMgYXNzdW1lZCB0aGUgYGxpc3RlbmVyYCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIElmIGFueSBzaW5nbGUgbGlzdGVuZXIgaGFzIGJlZW4gYWRkZWQgbXVsdGlwbGUgdGltZXMgZm9yIHRoZSBzcGVjaWZpZWQgYHR5cGVgLCB0aGVuIGBlbWl0dGVyLm9mZigpYCBtdXN0IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byByZW1vdmUgZWFjaCBpbnN0YW5jZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub2ZmXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvZmZcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGFueSBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGdyZWV0KCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRpbmdzLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdKZWZmJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBoZWxsbyggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqIH1cbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKi8gXG4gICAgdGhpcy5vZmYgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub25cbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuZXIgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub24gPSBmdW5jdGlvbigpe1xuICAgICAgICBsZXQgdHlwZSA9IGFyZ3VtZW50c1sgMCBdIHx8ICRldmVyeSxcbiAgICAgICAgICAgIGxpc3RlbmVyID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUeXBlIG5vdCBwcm92aWRlZCwgZmFsbCBiYWNrIHRvIFwiJGV2ZXJ5XCJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3Qgb2YgZXZlbnQgYmluZGluZ3NcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICl7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCB0eXBlICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBOYU4gKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uY2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gb25jZSB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqL1xuICAgIHRoaXMub25jZSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIDEsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZldCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgbWV0aG9kIGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5zZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gbWF4IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVmb3JlIGEgd2FybmluZyBpcyBpc3N1ZWQuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5zZXRNYXhMaXN0ZW5lcnMoIDEgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqL1xuICAgIHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oIG1heCApe1xuICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFzeW5jaHJvbm91c2x5IGVtaXRzIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLiBUaGUgbGlzdGVuZXJzIHdpbGwgc3RpbGwgYmUgc3luY2hyb25vdXNseSBleGVjdXRlZCBpbiB0aGUgc3BlY2lmaWVkIG9yZGVyLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMge0BsaW5rIGV4dGVybmFsOlByb21pc2V8cHJvbWlzZX0gd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudGlja1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICAgICAqIEBzaW5jZSAyLjAuMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkFzeW5jaHJvbm91c2x5IGVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnaGVsbG8nICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnaGVsbG8gaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdnb29kYnllJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2dvb2RieWUgaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiAvLyBoZWxsbyBoZWFyZD8gdHJ1ZVxuICAgICAqIC8vIGdvb2RieWUgaGVhcmQ/IGZhbHNlXG4gICAgICovXG4gICAgdGhpcy50aWNrID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGRhdGEgPSBbXSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICBpZiggbGVuZ3RoID4gMSApe1xuICAgICAgICAgICAgZGF0YSA9IEFycmF5KCBsZW5ndGggLSAxICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggbGV0IGtleSA9IDE7IGtleSA8IGxlbmd0aDsga2V5KysgKXtcbiAgICAgICAgICAgICAgICBkYXRhWyBrZXkgLSAxIF0gPSBhcmd1bWVudHNbIGtleSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGlja0FsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBgZGF0YWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50cmlnZ2VyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2hlbGxvJywgWyAnV29ybGQnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoaScsIFsgJ01hcmsnIF0gKTtcbiAgICAgKiAvLyBIaSwgTWFyayFcbiAgICAgKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhlbGxvJywgWyAnSmVmZicgXSApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy50cmlnZ2VyID0gZnVuY3Rpb24oIHR5cGUsIGRhdGEgPSBbXSApe1xuICAgICAgICByZXR1cm4gZW1pdEFsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgdGhhdCB3aWxsIGJlIHRyaWdnZXJlZCAqdW50aWwqIHRoZSBgbGlzdGVuZXJgIHJldHVybnMgYHRydWVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudW50aWxcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAc2luY2UgMS4yLjBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnVGVycnknO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnLCAnVGVycnknICk7XG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ0Fhcm9uJyApO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggJ2hlbGxvJywgZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdXb3JsZCc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ01hcmsnICk7XG4gICAgICovXG4gICAgdGhpcy51bnRpbCA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59XG5cbmFzRW1pdHRlci5jYWxsKCBBUEkgKTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byB0aGUgdGFyZ2V0LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJcbiAqIEBwYXJhbSB7QVBJUmVmZXJlbmNlfSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkgdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGB0YXJnZXRgLlxuICogQHBhcmFtIHtleHRlcmFsOk9iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3QgdG8gd2hpY2ggdGhlIEVtaXR0ZXIuanMgQVBJIHdpbGwgYmUgYXBwbGllZC5cbiAqIEBzaW5jZSAyLjAuMFxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYWxsIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggJ2VtaXQgb24gb2ZmJywgZ3JlZXRlciApO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1hcHBpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggeyBmaXJlOiAnZW1pdCcsIGFkZExpc3RlbmVyOiAnb24nIH0sIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIuYWRkTGlzdGVuZXIoICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmZpcmUoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICovXG4gXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZW1pdHRlci4gSWYgYG1hcHBpbmdgIGFyZSBwcm92aWRlZCB0aGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSBwYXNzZWQgaW50byBgb24oKWAgb25jZSBjb25zdHJ1Y3Rpb24gaXMgY29tcGxldGUuXG4gKiBAY2xhc3MgRW1pdHRlclxuICogQHBhcmFtIHtFdmVudE1hcHBpbmd9IFttYXBwaW5nXSBBIG1hcHBpbmcgb2YgZXZlbnQgdHlwZXMgdG8gZXZlbnQgbGlzdGVuZXJzLlxuICogQGNsYXNzZGVzYyBBbiBvYmplY3QgdGhhdCBlbWl0cyBuYW1lZCBldmVudHMgd2hpY2ggY2F1c2UgZnVuY3Rpb25zIHRvIGJlIGV4ZWN1dGVkLlxuICogQGV4dGVuZHMgRW1pdHRlcn5OdWxsXG4gKiBAbWl4ZXMgRW1pdHRlcn5hc0VtaXR0ZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9saWIvZXZlbnRzLmpzfVxuICogQHNpbmNlIDEuMC4wXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5Vc2luZyBFbWl0dGVyIGRpcmVjdGx5PC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gKiAvLyBIZWxsbyFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIENsYXNzaWNhbCBpbmhlcml0YW5jZTwvY2FwdGlvbj5cbiAqIGNsYXNzIEdyZWV0ZXIgZXh0ZW5kcyBFbWl0dGVyIHtcbiAqICBjb25zdHJ1Y3Rvcigpe1xuICogICAgICBzdXBlcigpO1xuICogICAgICB0aGlzLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiAgfVxuICogXG4gKiAgZ3JlZXQoIG5hbWUgKXtcbiAqICAgICAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiAgfVxuICogfVxuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5FeHRlbmRpbmcgRW1pdHRlciB1c2luZyBQcm90b3R5cGFsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxuICogZnVuY3Rpb24gR3JlZXRlcigpe1xuICogIEVtaXR0ZXIuY2FsbCggdGhpcyApO1xuICogIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIH1cbiAqIEdyZWV0ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRW1pdHRlci5wcm90b3R5cGUgKTtcbiAqIFxuICogR3JlZXRlci5wcm90b3R5cGUuZ3JlZXQgPSBmdW5jdGlvbiggbmFtZSApe1xuICogIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xuICogfTtcbiAqIFxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TmFtZXNwYWNlZCBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICogLy8gSGksIE1hcmshXG4gKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICogLy8gSGVsbG8sIEplZmYhXG4gKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICogQGV4YW1wbGUgPGNhcHRpb24+UHJlZGVmaW5lZCBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGluZ3MgPSB7XG4gKiAgICAgIGhlbGxvOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhlbGxvLCAke25hbWV9IWAgKSxcbiAqICAgICAgaGk6IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGksICR7bmFtZX0hYCApXG4gKiAgfSxcbiAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoIGdyZWV0aW5ncyApO1xuICogXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdBYXJvbicgKTtcbiAqIC8vIEhlbGxvLCBBYXJvbiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk9uZS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk1hbnktdGltZSBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgIC8vIDFcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgICAvLyAyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAgLy8gM1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiAvLyBIZWxsbywgVGVycnkhXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEVtaXR0ZXIoKXtcbiAgICBcbiAgICAvLyBDYWxsZWQgYXMgY29uc3RydWN0b3JcbiAgICBpZiggdHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY29uc3RydWN0b3IgPT09IEVtaXR0ZXIgKXtcbiAgICAgICAgbGV0IG1hcHBpbmcgPSBhcmd1bWVudHNbIDAgXTtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXJzIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmVudCBpZiBtb3JlIHRoYW4gKioxMCoqIGxpc3RlbmVycyBhcmUgYWRkZWQgZm9yIGEgcGFydGljdWxhciBldmVudCBgdHlwZWAuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHRoYXQgdG8gYmUgY2hhbmdlZC4gU2V0IHRvICoqMCoqIGZvciB1bmxpbWl0ZWQuXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlciNtYXhMaXN0ZW5lcnNcbiAgICAgICAgICogQHNpbmNlIDEuMC4wXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAgICAgKiBcbiAgICAgICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubWF4TGlzdGVuZXJzICk7XG4gICAgICAgICAqIC8vIDEwXG4gICAgICAgICAqIFxuICAgICAgICAgKiBncmVldGVyLm1heExpc3RlbmVycyA9IDE7XG4gICAgICAgICAqIFxuICAgICAgICAgKiBncmVldGVyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGFsZXJ0KCAnSGVsbG8hJyApICk7XG4gICAgICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAgICAgKi9cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnbWF4TGlzdGVuZXJzJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRNYXhMaXN0ZW5lcnMoIHRoaXMgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKCBtYXggKXtcbiAgICAgICAgICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgICAgIH0gKTtcbiAgICAgICAgXG4gICAgICAgIHR5cGVvZiBtYXBwaW5nICE9PSAndW5kZWZpbmVkJyAmJiBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIG1hcHBpbmcgKTtcbiAgICBcbiAgICAvLyBDYWxsZWQgYXMgZnVuY3Rpb25cbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc2VsZWN0aW9uID0gYXJndW1lbnRzWyAwIF0sXG4gICAgICAgICAgICB0YXJnZXQgPSBhcmd1bWVudHNbIDEgXTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50c1xuICAgICAgICBpZiggdHlwZW9mIHRhcmdldCA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIHRhcmdldCA9IHNlbGVjdGlvbjtcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IEFQSTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApO1xuICAgIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIEVtaXR0ZXIsIHtcbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBkZWZhdWx0IG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgYWxsIGVtaXR0ZXJzLiBVc2UgYGVtaXR0ZXIubWF4TGlzdGVuZXJzYCB0byBzZXQgdGhlIG1heGltdW0gb24gYSBwZXItaW5zdGFuY2UgYmFzaXMuXG4gICAgICogXG4gICAgICogQnkgZGVmYXVsdCBFbWl0dGVyIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmVudCBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZSBhZGRlZCB0byBhIHNwZWNpZmljIGV2ZW50IHR5cGUuXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM9MTBcbiAgICAgKiBAc2luY2UgMS4wLjBcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DaGFuZ2luZyB0aGUgZGVmYXVsdCBtYXhpbXVtIGxpc3RlbmVyczwvY2FwdGlvbj5cbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzICk7XG4gICAgICogLy8gMTBcbiAgICAgKiBcbiAgICAgKiBjb25zdCBncmVldGVyMSA9IG5ldyBFbWl0dGVyKCksXG4gICAgICogIGdyZWV0ZXIyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIxLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjEub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlcjEub24oICdoZWxsbycsICgpID0+IGFsZXJ0KCAnSGVsbG8hJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICogXG4gICAgICogZ3JlZXRlcjIub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyMi5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coICdIaSEnICkgKTtcbiAgICAgKiBncmVldGVyMi5vbiggJ2hpJywgKCkgPT4gYWxlcnQoICdIaSEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhpXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKi9cbiAgICBkZWZhdWx0TWF4TGlzdGVuZXJzOiB7XG4gICAgICAgIHZhbHVlOiAxMCxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBzeW1ib2wgdXNlZCB0byBsaXN0ZW4gZm9yIGV2ZW50cyBvZiBhbnkgYHR5cGVgLiBGb3IgX21vc3RfIG1ldGhvZHMsIHdoZW4gbm8gYHR5cGVgIGlzIGdpdmVuIHRoaXMgaXMgdGhlIGRlZmF1bHQuXG4gICAgICogXG4gICAgICogVXNpbmcgYEVtaXR0ZXIuZXZlcnlgIGlzIHR5cGljYWxseSBub3QgbmVjZXNzYXJ5LlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN5bWJvbH0gRW1pdHRlci5ldmVyeVxuICAgICAqIEBzaW5jZSAxLjAuMFxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggRW1pdHRlci5ldmVyeSwgKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqL1xuICAgIGV2ZXJ5OiB7XG4gICAgICAgIHZhbHVlOiAkZXZlcnksXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIGN1cnJlbnQgdmVyc2lvbiBvZiAqRW1pdHRlci5qcyouXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3RyaW5nfSBFbWl0dGVyLnZlcnNpb25cbiAgICAgKiBAc2luY2UgMS4xLjJcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLnZlcnNpb24gKTtcbiAgICAgKiAvLyAyLjAuMFxuICAgICAqL1xuICAgIHZlcnNpb246IHtcbiAgICAgICAgdmFsdWU6ICcyLjAuMCcsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9XG59ICk7XG5cbkVtaXR0ZXIucHJvdG90eXBlID0gbmV3IE51bGwoKTtcblxuRW1pdHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbWl0dGVyO1xuXG5hc0VtaXR0ZXIuY2FsbCggRW1pdHRlci5wcm90b3R5cGUgKTtcblxuLyoqXG4gKiBEZXN0cm95cyB0aGUgZW1pdHRlci5cbiAqIEBzaW5jZSAxLjAuMFxuICogQGZpcmVzIEVtaXR0ZXIjOmRlc3Ryb3lcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgZW1pdEV2ZW50KCB0aGlzLCAnOmRlc3Ryb3knLCBbXSwgdHJ1ZSApO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSB0aGlzLmF0ID0gdGhpcy5jbGVhciA9IHRoaXMuZW1pdCA9IHRoaXMuZXZlbnRUeXBlcyA9IHRoaXMuZmlyc3QgPSB0aGlzLmdldE1heExpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJDb3VudCA9IHRoaXMubGlzdGVuZXJzID0gdGhpcy5tYW55ID0gdGhpcy5vZmYgPSB0aGlzLm9uID0gdGhpcy5vbmNlID0gdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSB0aGlzLnRpY2sgPSB0aGlzLnRyaWdnZXIgPSB0aGlzLnVudGlsID0gbm9vcDtcbiAgICB0aGlzLnRvSlNPTiA9ICgpID0+ICdkZXN0cm95ZWQnO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBbiBwbGFpbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVtaXR0ZXIuXG4gKiBAc2luY2UgMS4zLjBcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfVxuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIFwiZGVzdHJveWVkXCJcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICBjb25zdCBqc29uID0gbmV3IE51bGwoKSxcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICksXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgdHlwZTtcbiAgICBcbiAgICBqc29uLm1heExpc3RlbmVycyA9IHRoaXMubWF4TGlzdGVuZXJzO1xuICAgIGpzb24ubGlzdGVuZXJDb3VudCA9IG5ldyBOdWxsKCk7XG4gICAgXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQHNpbmNlIDEuMy4wXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvU3RyaW5nKCkgKTtcbiAqIC8vICdFbWl0dGVyIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfSdcbiAqIFxuICogZ3JlZXRlci5kZXN0cm95KCk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvU3RyaW5nKCkgKTtcbiAqIC8vICdFbWl0dGVyIFwiZGVzdHJveWVkXCInXG4gKi9cbkVtaXR0ZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gYCR7IHRoaXMuY29uc3RydWN0b3IubmFtZSB9ICR7IEpTT04uc3RyaW5naWZ5KCB0aGlzLnRvSlNPTigpICkgfWAudHJpbSgpO1xufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=