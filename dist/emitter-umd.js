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
         * Returns {@link external:Promise|promise} which *resolves* if the event had listeners, *rejects* otherwise.
         * @function Emitter~asEmitter.tick
         * @param {EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @returns {external:Promise} A promise which *resolves* if the event had listeners, *rejects* otherwise.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7OztBQUtBOzs7Ozs7QUFNQTs7Ozs7QUFLQTs7Ozs7QUFLQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7Ozs7O3NCQTR6Q3dCQSxPOzs7Ozs7OztBQXZ6Q3hCLGFBQVNDLElBQVQsR0FBZSxDQUFFO0FBQ2pCQSxT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S0FBS0MsS0FBTCxHQUFhOUcsSUFBMVA7QUFDQSxhQUFLcUgsTUFBTCxHQUFjO0FBQUEsbUJBQU0sV0FBTjtBQUFBLFNBQWQ7QUFDSCxLQUxEOztBQU9BOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBL0gsWUFBUUUsU0FBUixDQUFrQjZILE1BQWxCLEdBQTJCLFlBQVU7QUFDakMsWUFBTUMsT0FBTyxJQUFJL0gsSUFBSixFQUFiO0FBQUEsWUFDSTBDLFFBQVF4QyxPQUFPeUMsSUFBUCxDQUFhLEtBQU10QyxPQUFOLENBQWIsQ0FEWjtBQUFBLFlBRUkrQixTQUFTTSxNQUFNTixNQUZuQjs7QUFJQSxZQUFJZCxRQUFRLENBQVo7QUFBQSxZQUNJVCxhQURKOztBQUdBa0gsYUFBSzVGLFlBQUwsR0FBb0IsS0FBS0EsWUFBekI7QUFDQTRGLGFBQUtmLGFBQUwsR0FBcUIsSUFBSWhILElBQUosRUFBckI7O0FBRUEsZUFBT3NCLFFBQVFjLE1BQWYsRUFBdUJkLE9BQXZCLEVBQWdDO0FBQzVCVCxtQkFBTzZCLE1BQU9wQixLQUFQLENBQVA7QUFDQXlHLGlCQUFLZixhQUFMLENBQW9CbkcsSUFBcEIsSUFBNkIsS0FBS21HLGFBQUwsQ0FBb0JuRyxJQUFwQixDQUE3QjtBQUNIOztBQUVELGVBQU9rSCxJQUFQO0FBQ0gsS0FqQkQ7O0FBbUJBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBaEksWUFBUUUsU0FBUixDQUFrQitILFFBQWxCLEdBQTZCLFlBQVU7QUFDbkMsZUFBTyxDQUFJLEtBQUs1SCxXQUFMLENBQWlCNkgsSUFBckIsU0FBK0JDLEtBQUtDLFNBQUwsQ0FBZ0IsS0FBS0wsTUFBTCxFQUFoQixDQUEvQixFQUFrRU0sSUFBbEUsRUFBUDtBQUNILEtBRkQiLCJmaWxlIjoiZW1pdHRlci11bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSmF2YVNjcmlwdCBBcnJheVxuICogQGV4dGVybmFsIEFycmF5XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1BybTQ1NG11bjMhaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cbiAqIEBleHRlcm5hbCBib29sZWFuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRXJyb3JcbiAqIEBleHRlcm5hbCBFcnJvclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxuICogQGV4dGVybmFsIEZ1bmN0aW9uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcbiAqIEBleHRlcm5hbCBudW1iZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCBudWxsXG4gKiBAZXh0ZXJuYWwgbnVsbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvbnVsbH1cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxuICogQGV4dGVybmFsIE9iamVjdFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0fVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCBQcm9taXNlXG4gKiBAZXh0ZXJuYWwgUHJvbWlzZVxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJvbWlzZX1cbiAqL1xuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXG4gKiBAZXh0ZXJuYWwgc3RyaW5nXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TdHJpbmd9XG4gKi9cbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzeW1ib2xcbiAqIEBleHRlcm5hbCBzeW1ib2xcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N5bWJvbH1cbiAqL1xuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOnN0cmluZ30gb3Ige0BsaW5rIGV4dGVybmFsOnN5bWJvbH0gdGhhdCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIGV2ZW50IGZpcmVkIGJ5IHRoZSBFbWl0dGVyLlxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpzeW1ib2x9IEV2ZW50VHlwZVxuICovIFxuXG4vKipcbiAqIEEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufCBmdW5jdGlvbn0gYm91bmQgdG8gYW4gZW1pdHRlciB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGV9LiBBbnkgZGF0YSB0cmFuc21pdHRlZCB3aXRoIHRoZSBldmVudCB3aWxsIGJlIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lciBhcyBhcmd1bWVudHMuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6RnVuY3Rpb259IEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7Li4uKn0gZGF0YSBUaGUgYXJndW1lbnRzIHBhc3NlZCBieSB0aGUgYGVtaXRgLlxuICovXG5cbi8qKlxuICogQW4ge0BsaW5rIGV4dGVybmFsOk9iamVjdHxvYmplY3R9IHRoYXQgbWFwcyB7QGxpbmsgRXZlbnRUeXBlfGV2ZW50IHR5cGVzfSB0byB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxldmVudCBsaXN0ZW5lcnN9LlxuICogQHR5cGVkZWYge2V4dGVybmFsOk9iamVjdH0gRXZlbnRNYXBwaW5nXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYW4gZW1pdHRlciBkZXN0cm95cyBpdHNlbGYuXG4gKiBAZXZlbnQgRW1pdHRlciM6ZGVzdHJveVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYWZ0ZXJfIGEgbGlzdGVuZXIgaXMgcmVtb3ZlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvZmZcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhIGxpc3RlbmVyIGlzIGFkZGVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9uXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGhhcyBiZWVuIGV4Y2VlZGVkIGZvciBhbiBldmVudCB0eXBlLlxuICogQGV2ZW50IEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogQSBcImNsZWFuXCIsIGVtcHR5IGNvbnRhaW5lci4gSW5zdGFudGlhdGluZyB0aGlzIGlzIGZhc3RlciB0aGFuIGV4cGxpY2l0bHkgY2FsbGluZyBgT2JqZWN0LmNyZWF0ZSggbnVsbCApYC5cbiAqIEBjbGFzcyBFbWl0dGVyfk51bGxcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcbiAqL1xuZnVuY3Rpb24gTnVsbCgpe31cbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuTnVsbC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOdWxsO1xuXG5jb25zdFxuICAgICRldmVudHMgICAgICAgPSAnQEBlbWl0dGVyL2V2ZW50cycsXG4gICAgJGV2ZXJ5ICAgICAgICA9ICdAQGVtaXR0ZXIvZXZlcnknLFxuICAgICRtYXhMaXN0ZW5lcnMgPSAnQEBlbWl0dGVyL21heExpc3RlbmVycycsXG4gICAgXG4gICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgIFxuICAgIG5vb3AgPSBmdW5jdGlvbigpe30sXG4gICAgXG4gICAgQVBJID0gbmV3IE51bGwoKTtcblxuLy8gTWFueSBvZiB0aGVzZSBmdW5jdGlvbnMgYXJlIGJyb2tlbiBvdXQgZnJvbSB0aGUgcHJvdG90eXBlIGZvciB0aGUgc2FrZSBvZiBvcHRpbWl6YXRpb24uIFRoZSBmdW5jdGlvbnMgb24gdGhlIHByb3RveXR5cGVcbi8vIHRha2UgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYXMgYSByZXN1bHQuIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIGEgZml4ZWQgbnVtYmVyIG9mIGFyZ3VtZW50c1xuLy8gYW5kIHRoZXJlZm9yZSBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLlxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGNvbmRpdGlvbmFsTGlzdGVuZXIoKXtcbiAgICAgICAgY29uc3QgZG9uZSA9IGxpc3RlbmVyLmFwcGx5KCBlbWl0dGVyLCBhcmd1bWVudHMgKTtcbiAgICAgICAgaWYoIGRvbmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBUT0RPIENoZWNrIGJleW9uZCBqdXN0IG9uZSBsZXZlbCBvZiBsaXN0ZW5lciByZWZlcmVuY2VzXG4gICAgY29uZGl0aW9uYWxMaXN0ZW5lci5saXN0ZW5lciA9IGxpc3RlbmVyLmxpc3RlbmVyIHx8IGxpc3RlbmVyO1xuICAgIFxuICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIsIE5hTiApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICl7XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIH1cbiAgICBcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XG4gICAgXG4gICAgY29uc3QgX2V2ZW50cyA9IGVtaXR0ZXJbICRldmVudHMgXTtcbiAgICBcbiAgICBpZiggX2V2ZW50c1sgJzpvbicgXSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b24nLCBbIHR5cGUsIHR5cGVvZiBsaXN0ZW5lci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICBcbiAgICAgICAgLy8gRW1pdHRpbmcgXCJvblwiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICBfZXZlbnRzWyAnOm9uJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9uJyBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBTaW5nbGUgbGlzdGVuZXJcbiAgICBpZiggIV9ldmVudHNbIHR5cGUgXSApe1xuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBsaXN0ZW5lcjtcbiAgICBcbiAgICAvLyBNdWx0aXBsZSBsaXN0ZW5lcnNcbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIF9ldmVudHNbIHR5cGUgXSApICl7XG4gICAgICAgIHN3aXRjaCggaXNOYU4oIGluZGV4ICkgfHwgaW5kZXggKXtcbiAgICAgICAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0udW5zaGlmdCggbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnNwbGljZSggaW5kZXgsIDAsIGxpc3RlbmVyICk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICBcbiAgICAvLyBUcmFuc2l0aW9uIGZyb20gc2luZ2xlIHRvIG11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGluZGV4ID09PSAwID9cbiAgICAgICAgICAgIFsgbGlzdGVuZXIsIF9ldmVudHNbIHR5cGUgXSBdIDpcbiAgICAgICAgICAgIFsgX2V2ZW50c1sgdHlwZSBdLCBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICBcbiAgICAvLyBUcmFjayB3YXJuaW5ncyBpZiBtYXggbGlzdGVuZXJzIGlzIGF2YWlsYWJsZVxuICAgIGlmKCAnbWF4TGlzdGVuZXJzJyBpbiBlbWl0dGVyICYmICFfZXZlbnRzWyB0eXBlIF0ud2FybmVkICl7XG4gICAgICAgIGNvbnN0IG1heCA9IGVtaXR0ZXIubWF4TGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoIG1heCAmJiBtYXggPiAwICYmIF9ldmVudHNbIHR5cGUgXS5sZW5ndGggPiBtYXggKXtcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzptYXhMaXN0ZW5lcnMnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRW1pdHRpbmcgXCJtYXhMaXN0ZW5lcnNcIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgICAgIF9ldmVudHNbICc6bWF4TGlzdGVuZXJzJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm1heExpc3RlbmVycycgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLndhcm5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZW1pdHRlclsgJGV2ZW50cyBdID0gX2V2ZW50cztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRGaW5pdGVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gKi9cbmZ1bmN0aW9uIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgIFxuICAgIGZ1bmN0aW9uIGZpbml0ZUxpc3RlbmVyKCl7XG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgcmV0dXJuIC0tdGltZXMgPT09IDA7XG4gICAgfVxuICAgIFxuICAgIGZpbml0ZUxpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBmaW5pdGVMaXN0ZW5lciApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEV2ZW50TWFwcGluZ1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudE1hcHBpbmd9IG1hcHBpbmcgVGhlIGV2ZW50IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50TWFwcGluZyggZW1pdHRlciwgbWFwcGluZyApe1xuICAgIGNvbnN0XG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIG1hcHBpbmcgKSxcbiAgICAgICAgdHlwZUxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICBcbiAgICBsZXQgdHlwZUluZGV4ID0gMCxcbiAgICAgICAgaGFuZGxlciwgaGFuZGxlckluZGV4LCBoYW5kbGVyTGVuZ3RoLCB0eXBlO1xuICAgIFxuICAgIGZvciggOyB0eXBlSW5kZXggPCB0eXBlTGVuZ3RoOyB0eXBlSW5kZXggKz0gMSApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIHR5cGVJbmRleCBdO1xuICAgICAgICBoYW5kbGVyID0gbWFwcGluZ1sgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgLy8gTGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgaGFuZGxlckluZGV4ID0gMDtcbiAgICAgICAgICAgIGhhbmRsZXJMZW5ndGggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggOyBoYW5kbGVySW5kZXggPCBoYW5kbGVyTGVuZ3RoOyBoYW5kbGVySW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGhhbmRsZXJbIGhhbmRsZXJJbmRleCBdLCBOYU4gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgaGFuZGxlciwgTmFOICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZGVmaW5lRXZlbnRzUHJvcGVydHlcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgcHJvcGVydHkgd2lsbCBiZSBjcmVhdGVkLlxuICovIFxuZnVuY3Rpb24gZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIHZhbHVlICl7XG4gICAgY29uc3QgaGFzRXZlbnRzID0gaGFzT3duUHJvcGVydHkuY2FsbCggZW1pdHRlciwgJGV2ZW50cyApLFxuICAgICAgICBlbWl0dGVyUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCBlbWl0dGVyICk7XG4gICAgICAgIFxuICAgIGlmKCAhaGFzRXZlbnRzIHx8ICggZW1pdHRlclByb3RvdHlwZSAmJiBlbWl0dGVyWyAkZXZlbnRzIF0gPT09IGVtaXR0ZXJQcm90b3R5cGVbICRldmVudHMgXSApICl7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJGV2ZW50cywge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9ICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRBbGxFdmVudHNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRBbGxFdmVudHMoIGVtaXR0ZXIsIHR5cGUsIGRhdGEgKXtcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcbiAgICAgICAgLy8gSWYgdHlwZSBpcyBub3QgYSBzdHJpbmcsIGluZGV4IHdpbGwgYmUgZmFsc2VcbiAgICAgICAgaW5kZXggPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgXG4gICAgLy8gTmFtZXNwYWNlZCBldmVudCwgZS5nLiBFbWl0IFwiZm9vOmJhcjpxdXhcIiwgdGhlbiBcImZvbzpiYXJcIlxuICAgIHdoaWxlKCBpbmRleCA+IDAgKXtcbiAgICAgICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBmYWxzZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgICAgIHR5cGUgPSB0eXBlLnN1YnN0cmluZyggMCwgaW5kZXggKTtcbiAgICAgICAgaW5kZXggPSB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICB9XG4gICAgXG4gICAgLy8gRW1pdCBzaW5nbGUgZXZlbnQgb3IgdGhlIG5hbWVzcGFjZWQgZXZlbnQgcm9vdCwgZS5nLiBcImZvb1wiLCBcIjpiYXJcIiwgU3ltYm9sKCBcIkBAcXV4XCIgKVxuICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgdHJ1ZSApICkgfHwgZXhlY3V0ZWQ7XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFcnJvcnNcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgYGVycm9yc2Agd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtBcnJheTxleHRlcm5hbDpFcnJvcj59IGVycm9ycyBUaGUgYXJyYXkgb2YgZXJyb3JzIHRvIGJlIGVtaXR0ZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApe1xuICAgIGNvbnN0IGxlbmd0aCA9IGVycm9ycy5sZW5ndGg7XG4gICAgZm9yKCBsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICdlcnJvcicsIFsgZXJyb3JzWyBpbmRleCBdIF0sIGZhbHNlICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmVtaXRFdmVudFxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gZW1pdEV2ZXJ5IFdoZXRoZXIgb3Igbm90IGxpc3RlbmVycyBmb3IgYWxsIHR5cGVzIHdpbGwgYmUgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXG4gKi9cbmZ1bmN0aW9uIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZW1pdEV2ZXJ5ICl7XG4gICAgLy8gRGVmaW5lIHRoZSBldmVudCByZWdpc3RyeSBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xuICAgIFxuICAgIGNvbnN0IF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgIGxpc3RlbmVyO1xuICAgIFxuICAgIGlmKCB0eXBlID09PSAnZXJyb3InICYmICFfZXZlbnRzLmVycm9yICl7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZGF0YVsgMCBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgKXtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiB0eXBlIG9mIGV2ZW50XG4gICAgbGlzdGVuZXIgPSBfZXZlbnRzWyB0eXBlIF07XG4gICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGxpc3RlbmluZyBmb3IgYWxsIHR5cGVzIG9mIGV2ZW50c1xuICAgIGlmKCBlbWl0RXZlcnkgKXtcbiAgICAgICAgbGlzdGVuZXIgPSBfZXZlbnRzWyAkZXZlcnkgXTtcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBsaXN0ZW5lciB1c2luZyB0aGUgaW50ZXJuYWwgYGV4ZWN1dGUqYCBmdW5jdGlvbnMgYmFzZWQgb24gdGhlIG51bWJlciBvZiBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlTGlzdGVuZXJcbiAqIEBwYXJhbSB7QXJyYXk8TGlzdGVuZXI+fExpc3RlbmVyfSBsaXN0ZW5lclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICogQHBhcmFtIHsqfSBzY29wZVxuICovIFxuZnVuY3Rpb24gZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgc2NvcGUgKXtcbiAgICBjb25zdCBpc0Z1bmN0aW9uID0gdHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nO1xuICAgIFxuICAgIHN3aXRjaCggZGF0YS5sZW5ndGggKXtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgbGlzdGVuRW1wdHkgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBsaXN0ZW5PbmUgICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGlzdGVuVHdvICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgbGlzdGVuVGhyZWUgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSwgZGF0YVsgMSBdLCBkYXRhWyAyIF0gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGlzdGVuTWFueSAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGEgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRFdmVudFR5cGVzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggZXZlbnQgdHlwZXMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXk8RXZlbnRUeXBlPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cbiAqL1xuZnVuY3Rpb24gZ2V0RXZlbnRUeXBlcyggZW1pdHRlciApe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyggZW1pdHRlclsgJGV2ZW50cyBdICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0TWF4TGlzdGVuZXJzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggbWF4IGxpc3RlbmVycyB3aWxsIGJlIHJldHJpZXZlZC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gKi9cbmZ1bmN0aW9uIGdldE1heExpc3RlbmVycyggZW1pdHRlciApe1xuICAgIHJldHVybiB0eXBlb2YgZW1pdHRlclsgJG1heExpc3RlbmVycyBdICE9PSAndW5kZWZpbmVkJyA/XG4gICAgICAgIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSA6XG4gICAgICAgIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmlzUG9zaXRpdmVOdW1iZXJcbiAqIEBwYXJhbSB7Kn0gbnVtYmVyIFRoZSB2YWx1ZSB0byBiZSB0ZXN0ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICovXG5mdW5jdGlvbiBpc1Bvc2l0aXZlTnVtYmVyKCBudW1iZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicgJiYgbnVtYmVyID49IDAgJiYgIWlzTmFOKCBudW1iZXIgKTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBubyBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5FbXB0eVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlbkVtcHR5KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBvbmUgYXJndW1lbnQuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5PbmVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuT25lKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHR3byBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5Ud29cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxuICovXG5mdW5jdGlvbiBsaXN0ZW5Ud28oIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggdGhyZWUgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVGhyZWVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMiBUaGUgc2Vjb25kIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBhcmczIFRoZSB0aGlyZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVGhyZWUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKXtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBcbiAgICBpZiggaXNGdW5jdGlvbiApe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggZm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3Rlbk1hbnlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gYXJncyBGb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5NYW55KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmdzICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+cmVtb3ZlRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgbGlzdGVuZXIgKXtcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuICAgIGRlZmluZUV2ZW50c1Byb3BlcnR5KCBlbWl0dGVyLCBuZXcgTnVsbCgpICk7XG4gICAgXG4gICAgY29uc3QgaGFuZGxlciA9IGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgIFxuICAgIGlmKCBoYW5kbGVyID09PSBsaXN0ZW5lciB8fCAoIHR5cGVvZiBoYW5kbGVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBpZiggZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgbGV0IGluZGV4ID0gLTE7XG4gICAgICAgIFxuICAgICAgICBmb3IoIGxldCBpID0gaGFuZGxlci5sZW5ndGg7IGktLSA+IDA7ICl7XG4gICAgICAgICAgICBpZiggaGFuZGxlclsgaSBdID09PSBsaXN0ZW5lciB8fCAoIGhhbmRsZXJbIGkgXS5saXN0ZW5lciAmJiBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgPT09IGxpc3RlbmVyICkgKXtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgaWYoIGluZGV4ID4gLTEgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyLmxlbmd0aCA9PT0gMSApe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwbGljZUxpc3QoIGhhbmRsZXIsIGluZGV4ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9mZicsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIHdpbGwgYmUgc2V0LlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxuICovXG5mdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIsIG1heCApe1xuICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggbWF4ICkgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ21heCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgIH1cbiAgICBcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGVtaXR0ZXIsICRtYXhMaXN0ZW5lcnMsIHtcbiAgICAgICAgdmFsdWU6IG1heCxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9ICk7XG59XG5cbi8qKlxuICogRmFzdGVyIHRoYW4gYEFycmF5LnByb3RvdHlwZS5zcGxpY2VgXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5zcGxpY2VMaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBsaXN0XG4gKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXhcbiAqLyBcbmZ1bmN0aW9uIHNwbGljZUxpc3QoIGxpc3QsIGluZGV4ICl7XG4gICAgZm9yKCBsZXQgaSA9IGluZGV4LCBqID0gaSArIDEsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBqIDwgbGVuZ3RoOyBpICs9IDEsIGogKz0gMSApe1xuICAgICAgICBsaXN0WyBpIF0gPSBsaXN0WyBqIF07XG4gICAgfVxuICAgIFxuICAgIGxpc3QucG9wKCk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgZXhlY3V0ZXMgYSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRpY2tcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC5cbiAqL1xuZnVuY3Rpb24gdGljayggY2FsbGJhY2sgKXtcbiAgICByZXR1cm4gc2V0VGltZW91dCggY2FsbGJhY2ssIDAgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrQWxsRXZlbnRzXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxuICogQHJldHVybnMge2V4dGVybmFsOlByb21pc2V9IEEgcHJvbWlzZSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiB0aWNrQWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBmdW5jdGlvbiggcmVzb2x2ZSwgcmVqZWN0ICl7XG4gICAgICAgIHRpY2soIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICkgPyByZXNvbHZlKCkgOiByZWplY3QoKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGEgYHNlbGVjdGlvbmAgb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSBgdGFyZ2V0YC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnRvRW1pdHRlclxuICovXG5mdW5jdGlvbiB0b0VtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICl7XG4gICAgXG4gICAgLy8gQXBwbHkgdGhlIGVudGlyZSBFbWl0dGVyIEFQSVxuICAgIGlmKCBzZWxlY3Rpb24gPT09IEFQSSApe1xuICAgICAgICBhc0VtaXR0ZXIuY2FsbCggdGFyZ2V0ICk7XG4gICAgXG4gICAgLy8gQXBwbHkgb25seSB0aGUgc2VsZWN0ZWQgQVBJIG1ldGhvZHNcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaW5kZXgsIGtleSwgbWFwcGluZywgbmFtZXMsIHZhbHVlO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBzZWxlY3Rpb24gPT09ICdzdHJpbmcnICl7XG4gICAgICAgICAgICBuYW1lcyA9IHNlbGVjdGlvbi5zcGxpdCggJyAnICk7XG4gICAgICAgICAgICBtYXBwaW5nID0gQVBJO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmFtZXMgPSBPYmplY3Qua2V5cyggc2VsZWN0aW9uICk7XG4gICAgICAgICAgICBtYXBwaW5nID0gc2VsZWN0aW9uO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpbmRleCA9IG5hbWVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICBrZXkgPSBuYW1lc1sgaW5kZXggXTtcbiAgICAgICAgICAgIHZhbHVlID0gbWFwcGluZ1sga2V5IF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRhcmdldFsga2V5IF0gPSB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgICAgIHZhbHVlIDpcbiAgICAgICAgICAgICAgICBBUElbIHZhbHVlIF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbmFsIG1peGluIHRoYXQgcHJvdmlkZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIGl0cyB0YXJnZXQuIFRoZSBgY29uc3RydWN0b3IoKWAsIGBkZXN0cm95KClgLCBgdG9KU09OKClgLCBgdG9TdHJpbmcoKWAsIGFuZCBzdGF0aWMgcHJvcGVydGllcyBvbiBgRW1pdHRlcmAgYXJlIG5vdCBwcm92aWRlZC4gVGhpcyBtaXhpbiBpcyB1c2VkIHRvIHBvcHVsYXRlIHRoZSBgcHJvdG90eXBlYCBvZiBgRW1pdHRlcmAuXG4gKiBcbiAqIExpa2UgYWxsIGZ1bmN0aW9uYWwgbWl4aW5zLCB0aGlzIHNob3VsZCBiZSBleGVjdXRlZCB3aXRoIFtjYWxsKCldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2NhbGwpIG9yIFthcHBseSgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9hcHBseSkuXG4gKiBAbWl4aW4gRW1pdHRlcn5hc0VtaXR0ZXJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIEVtaXR0ZXIgZnVuY3Rpb25hbGl0eTwvY2FwdGlvbj5cbiAqIC8vIENyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gKiBjb25zdCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogXG4gKiAvLyBBcHBseSB0aGUgbWl4aW5cbiAqIGFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XG4gKiBcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICogLy8gSGVsbG8sIFdvcmxkIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgY2hhb3MgdG8geW91ciB3b3JsZDwvY2FwdGlvbj5cbiAqIC8vIE5PISEhXG4gKiBFbWl0dGVyLmFzRW1pdHRlcigpOyAvLyBNYWRuZXNzIGVuc3Vlc1xuICovXG5mdW5jdGlvbiBhc0VtaXR0ZXIoKXtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIGF0IHRoZSBzcGVjaWZpZWQgYGluZGV4YC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmF0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXggV2hlcmUgdGhlIGxpc3RlbmVyIHdpbGwgYmUgYWRkZWQgaW4gdGhlIHRyaWdnZXIgbGlzdC5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqL1xuICAgIHRoaXMuYXQgPSBmdW5jdGlvbiggdHlwZSwgaW5kZXgsIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiBpbmRleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IGluZGV4O1xuICAgICAgICAgICAgaW5kZXggPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIGlzUG9zaXRpdmVOdW1iZXIoIGluZGV4ICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdpbmRleCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuY2xlYXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIHtcbiAgICAgKiAgJ2hlbGxvJyA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApOyB9LFxuICAgICAqICAnaGknICAgIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIaSEnICk7IH1cbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhciggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqL1xuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgaGFuZGxlcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE5vIEV2ZW50c1xuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdpdGggbm8gXCJvZmZcIiBsaXN0ZW5lcnMsIGNsZWFyaW5nIGNhbiBiZSBzaW1wbGlmaWVkXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENsZWFyIGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVzID0gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBdm9pZCByZW1vdmluZyBcIm9mZlwiIGxpc3RlbmVycyB1bnRpbCBhbGwgb3RoZXIgdHlwZXMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICAgICAgICAgIGZvciggbGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gdHlwZXMubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgIGlmKCB0eXBlc1sgaW5kZXggXSA9PT0gJzpvZmYnICl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKCB0eXBlc1sgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBNYW51YWxseSBjbGVhciBcIm9mZlwiXG4gICAgICAgICAgICB0aGlzLmNsZWFyKCAnOm9mZicgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlciApO1xuICAgICAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gaGFuZGxlci5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoaWxlKCBpbmRleC0tICl7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlclsgaW5kZXggXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZW1pdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7ICAgIC8vIHRydWVcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApOyAgLy8gZmFsc2VcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudCB3aXRoIGRhdGE8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhIG5hbWVzcGFjZWQgZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogLy8gVGhpcyBldmVudCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgYnkgZW1pdHRpbmcgXCJncmVldGluZzpoZWxsb1wiXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbyBhZ2FpbiwgJHsgbmFtZSB9YCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5ldmVudFR5cGVzXG4gICAgICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coIGBIaWAgKSApO1xuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmV2ZW50VHlwZXMoKSApO1xuICAgICAqIC8vIFsgJ2hlbGxvJywgJ2hpJyBdXG4gICAgICovIFxuICAgIHRoaXMuZXZlbnRUeXBlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXRFdmVudFR5cGVzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZmlyc3RcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICovXG4gICAgdGhpcy5maXJzdCA9IGZ1bmN0aW9uKCB0eXBlLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCAwICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5nZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldE1heExpc3RlbmVycyggdGhpcyApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmxpc3RlbmVyQ291bnRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2hlbGxvJyApICk7XG4gICAgICogLy8gMVxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdnb29kYnllJyApICk7XG4gICAgICogLy8gMFxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgY291bnQ7XG5cbiAgICAgICAgLy8gRW1wdHlcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBjb3VudCA9IDA7XG4gICAgICAgIFxuICAgICAgICAvLyBGdW5jdGlvblxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgY291bnQgPSAxO1xuICAgICAgICBcbiAgICAgICAgLy8gQXJyYXlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvdW50ID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0ubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBoZWxsbyA9IGZ1bmN0aW9uKCl7XG4gICAgICogIGNvbnNvbGUubG9nKCAnSGVsbG8hJyApO1xuICAgICAqIH0sXG4gICAgICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJzKCAnaGVsbG8nIClbIDAgXSA9PT0gaGVsbG8gKTtcbiAgICAgKiAvLyB0cnVlXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJzID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGxpc3RlbmVycztcbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbIGhhbmRsZXIgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgKm1hbnkgdGltZSogbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuIEFmdGVyIHRoZSBsaXN0ZW5lciBpcyBpbnZva2VkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGB0aW1lc2AsIGl0IGlzIHJlbW92ZWQuXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubWFueVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYW55IGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdUZXJyeScgKTsgICAgICAvLyAyXG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ1N0ZXZlJyApOyAgICAgIC8vIDNcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gdGhlIHNwZWNpZmllZCBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgLy8gMlxuICAgICAqIC8vIEhlbGxvLCBUZXJyeSFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAvLyAzXG4gICAgICovIFxuICAgIHRoaXMubWFueSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCB0aW1lcywgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdGltZXM7XG4gICAgICAgICAgICB0aW1lcyA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIHRpbWVzICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICd0aW1lcyBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCB0aW1lcywgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgYGxpc3RlbmVyYCBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiBpdCBpcyBhc3N1bWVkIHRoZSBgbGlzdGVuZXJgIGlzIG5vdCBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyBgdHlwZWAuXG4gICAgICogXG4gICAgICogSWYgYW55IHNpbmdsZSBsaXN0ZW5lciBoYXMgYmVlbiBhZGRlZCBtdWx0aXBsZSB0aW1lcyBmb3IgdGhlIHNwZWNpZmllZCBgdHlwZWAsIHRoZW4gYGVtaXR0ZXIub2ZmKClgIG11c3QgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHJlbW92ZSBlYWNoIGluc3RhbmNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vZmZcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9mZlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPlJlbW92ZSBhIGxpc3RlbmVyIGZyb20gYW55IGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gZ3JlZXQoIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGluZ3MsICR7IG5hbWUgfSFgICk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0aW5ncywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCBncmVldCApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ0plZmYnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGZ1bmN0aW9uIGhlbGxvKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogfVxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLm9mZiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqLyBcbiAgICB0aGlzLm9mZiA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vblxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW4gdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5MaXN0ZW5lciB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnV29ybGQnICk7XG4gICAgICovXG4gICAgdGhpcy5vbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCB0eXBlID0gYXJndW1lbnRzWyAwIF0gfHwgJGV2ZXJ5LFxuICAgICAgICAgICAgbGlzdGVuZXIgPSBhcmd1bWVudHNbIDEgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFR5cGUgbm90IHByb3ZpZGVkLCBmYWxsIGJhY2sgdG8gXCIkZXZlcnlcIlxuICAgICAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBsYWluIG9iamVjdCBvZiBldmVudCBiaW5kaW5nc1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgKXtcbiAgICAgICAgICAgICAgICBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIHR5cGUgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIE5hTiApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub25jZVxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uY2UoICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiBvbmNlIHRvIGFsbCBldmVudCB0eXBlczwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICovXG4gICAgdGhpcy5vbmNlID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgMSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnNldE1heExpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICovXG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQXN5bmNocm9ub3VzbHkgZW1pdHMgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuIFRoZSBsaXN0ZW5lcnMgd2lsbCBzdGlsbCBiZSBzeW5jaHJvbm91c2x5IGV4ZWN1dGVkIGluIHRoZSBzcGVjaWZpZWQgb3JkZXIuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyB7QGxpbmsgZXh0ZXJuYWw6UHJvbWlzZXxwcm9taXNlfSB3aGljaCAqcmVzb2x2ZXMqIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCAqcmVqZWN0cyogb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50aWNrXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZX0gQSBwcm9taXNlIHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+QXN5bmNocm9ub3VzbHkgZW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdoZWxsbycgKS50aGVuKCAoIGhlYXJkICkgPT4gY29uc29sZS5sb2coICdoZWxsbyBoZWFyZD8gJywgaGVhcmQgKSApO1xuICAgICAqIGdyZWV0ZXIudGljayggJ2dvb2RieWUnICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnZ29vZGJ5ZSBoZWFyZD8gJywgaGVhcmQgKSApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIC8vIGhlbGxvIGhlYXJkPyB0cnVlXG4gICAgICogLy8gZ29vZGJ5ZSBoZWFyZD8gZmFsc2VcbiAgICAgKi9cbiAgICB0aGlzLnRpY2sgPSBmdW5jdGlvbiggdHlwZSwgLi4uZGF0YSApe1xuICAgICAgICByZXR1cm4gdGlja0FsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBgZGF0YWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50cmlnZ2VyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdoZWxsbycsIFsgJ1dvcmxkJyBdICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoZWxsbycsIFsgJ0plZmYnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHRoYXQgd2lsbCBiZSB0cmlnZ2VyZWQgKnVudGlsKiB0aGUgYGxpc3RlbmVyYCByZXR1cm5zIGB0cnVlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnVudGlsXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1RlcnJ5JztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJywgJ1RlcnJ5JyApO1xuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdBYXJvbicgKTtcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoICdoZWxsbycsIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnV29ybGQnO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdNYXJrJyApO1xuICAgICAqL1xuICAgIHRoaXMudW50aWwgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufVxuXG5hc0VtaXR0ZXIuY2FsbCggQVBJICk7XG5cbi8qKlxuICogQXBwbGllcyB0aGUgRW1pdHRlci5qcyBBUEkgdG8gdGhlIHRhcmdldC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpPYmplY3R9IFtzZWxlY3Rpb25dIEEgc2VsZWN0aW9uIG9mIHRoZSBFbWl0dGVyLmpzIEFQSSB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgYHRhcmdldGAuXG4gKiBAcGFyYW0ge2V4dGVyYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCB0byB3aGljaCB0aGUgRW1pdHRlci5qcyBBUEkgd2lsbCBiZSBhcHBsaWVkLlxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYWxsIG9mIHRoZSBBUEk8L2NhcHRpb24+XG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcbiAqIEVtaXR0ZXIoIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+QXBwbHlpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggJ2VtaXQgb24gb2ZmJywgZ3JlZXRlciApO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1hcHBpbmcgYSBzZWxlY3Rpb24gb2YgdGhlIEFQSTwvY2FwdGlvbj5cbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xuICogRW1pdHRlciggeyBmaXJlOiAnZW1pdCcsIGFkZExpc3RlbmVyOiAnb24nIH0sIGdyZWV0ZXIgKTtcbiAqIGdyZWV0ZXIuYWRkTGlzdGVuZXIoICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmZpcmUoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICovXG4gXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZW1pdHRlci4gSWYgYG1hcHBpbmdgIGFyZSBwcm92aWRlZCB0aGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSBwYXNzZWQgaW50byBgb24oKWAgb25jZSBjb25zdHJ1Y3Rpb24gaXMgY29tcGxldGUuXG4gKiBAY2xhc3MgRW1pdHRlclxuICogQGNsYXNzZGVzYyBBbiBvYmplY3QgdGhhdCBlbWl0cyBuYW1lZCBldmVudHMgd2hpY2ggY2F1c2UgZnVuY3Rpb25zIHRvIGJlIGV4ZWN1dGVkLlxuICogQGV4dGVuZHMgRW1pdHRlcn5OdWxsXG4gKiBAbWl4ZXMgRW1pdHRlcn5hc0VtaXR0ZXJcbiAqIEBwYXJhbSB7RXZlbnRNYXBwaW5nfSBbbWFwcGluZ10gQSBtYXBwaW5nIG9mIGV2ZW50IHR5cGVzIHRvIGV2ZW50IGxpc3RlbmVycy5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9saWIvZXZlbnRzLmpzfVxuICogQGV4YW1wbGUgPGNhcHRpb24+VXNpbmcgRW1pdHRlciBkaXJlY3RseTwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5FeHRlbmRpbmcgRW1pdHRlciB1c2luZyBDbGFzc2ljYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBjbGFzcyBHcmVldGVyIGV4dGVuZHMgRW1pdHRlciB7XG4gKiAgY29uc3RydWN0b3IoKXtcbiAqICAgICAgc3VwZXIoKTtcbiAqICAgICAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogIH1cbiAqIFxuICogIGdyZWV0KCBuYW1lICl7XG4gKiAgICAgIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xuICogIH1cbiAqIH1cbiAqIFxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgUHJvdG90eXBhbCBpbmhlcml0YW5jZTwvY2FwdGlvbj5cbiAqIGZ1bmN0aW9uIEdyZWV0ZXIoKXtcbiAqICBFbWl0dGVyLmNhbGwoIHRoaXMgKTtcbiAqICB0aGlzLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiB9XG4gKiBHcmVldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEVtaXR0ZXIucHJvdG90eXBlICk7XG4gKiBcbiAqIEdyZWV0ZXIucHJvdG90eXBlLmdyZWV0ID0gZnVuY3Rpb24oIG5hbWUgKXtcbiAqICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqIH07XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk5hbWVzcGFjZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAqIC8vIEhpLCBNYXJrIVxuICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAqIEBleGFtcGxlIDxjYXB0aW9uPlByZWRlZmluZWQgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRpbmdzID0ge1xuICogICAgICBoZWxsbzogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIZWxsbywgJHtuYW1lfSFgICksXG4gKiAgICAgIGhpOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhpLCAke25hbWV9IWAgKVxuICogIH0sXG4gKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCBncmVldGluZ3MgKTtcbiAqIFxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnQWFyb24nICk7XG4gKiAvLyBIZWxsbywgQWFyb24hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5PbmUtdGltZSBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5NYW55LXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgICAvLyAxXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAgLy8gMlxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgIC8vIDNcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogLy8gSGVsbG8sIFRlcnJ5IVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFbWl0dGVyKCl7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGNvbnN0cnVjdG9yXG4gICAgaWYoIHR5cGVvZiB0aGlzICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLmNvbnN0cnVjdG9yID09PSBFbWl0dGVyICl7XG4gICAgICAgIGxldCBtYXBwaW5nID0gYXJndW1lbnRzWyAwIF07XG4gICAgICAgIHR5cGVvZiBtYXBwaW5nICE9PSAndW5kZWZpbmVkJyAmJiBhZGRFdmVudE1hcHBpbmcoIHRoaXMsIG1hcHBpbmcgKTtcbiAgICAgICAgXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heExpc3RlbmVycycsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgICAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgICB9ICk7XG4gICAgXG4gICAgLy8gQ2FsbGVkIGFzIGZ1bmN0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHNlbGVjdGlvbiA9IGFyZ3VtZW50c1sgMCBdLFxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWyAxIF07XG4gICAgICAgIFxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHNcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICB0YXJnZXQgPSBzZWxlY3Rpb247XG4gICAgICAgICAgICBzZWxlY3Rpb24gPSBBUEk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKTtcbiAgICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBFbWl0dGVyLCB7XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgZGVmYXVsdCBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIGFsbCBlbWl0dGVycy4gVXNlIGBlbWl0dGVyLm1heExpc3RlbmVyc2AgdG8gc2V0IHRoZSBtYXhpbXVtIG9uIGEgcGVyLWluc3RhbmNlIGJhc2lzLlxuICAgICAqIFxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPTEwXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgICAqIC8vIDEwXG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlcjEgPSBuZXcgRW1pdHRlcigpLFxuICAgICAqICBncmVldGVyMiA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIxLm9uKCAnaGVsbG8nLCAoKSA9PiBhbGVydCggJ0hlbGxvIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqIGdyZWV0ZXIyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGFsZXJ0KCAnSGkhJyApICk7XG4gICAgICogLy8gR3JlZXRpbmcgXCJoaVwiIGhhcyBvbmUgdG9vIG1hbnkhXG4gICAgICogXG4gICAgICovXG4gICAgZGVmYXVsdE1heExpc3RlbmVyczoge1xuICAgICAgICB2YWx1ZTogMTAsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgc3ltYm9sIHVzZWQgdG8gbGlzdGVuIGZvciBldmVudHMgb2YgYW55IGB0eXBlYC4gRm9yIF9tb3N0XyBtZXRob2RzLCB3aGVuIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGlzIGlzIHRoZSBkZWZhdWx0LlxuICAgICAqIFxuICAgICAqIFVzaW5nIGBFbWl0dGVyLmV2ZXJ5YCBpcyB0eXBpY2FsbHkgbm90IG5lY2Vzc2FyeS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzeW1ib2x9IEVtaXR0ZXIuZXZlcnlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIEVtaXR0ZXIuZXZlcnksICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xuICAgICAqIC8vIEdyZWV0ZWRcbiAgICAgKi9cbiAgICBldmVyeToge1xuICAgICAgICB2YWx1ZTogJGV2ZXJ5LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgKkVtaXR0ZXIuanMqLlxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gRW1pdHRlci52ZXJzaW9uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci52ZXJzaW9uICk7XG4gICAgICogLy8gMi4wLjBcbiAgICAgKi9cbiAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHZhbHVlOiAnMi4wLjAnLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfVxufSApO1xuXG5FbWl0dGVyLnByb3RvdHlwZSA9IG5ldyBOdWxsKCk7XG5cbkVtaXR0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRW1pdHRlcjtcblxuYXNFbWl0dGVyLmNhbGwoIEVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCB0cnVlICk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZGVzdHJveSA9IHRoaXMuYXQgPSB0aGlzLmNsZWFyID0gdGhpcy5lbWl0ID0gdGhpcy5ldmVudFR5cGVzID0gdGhpcy5maXJzdCA9IHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lckNvdW50ID0gdGhpcy5saXN0ZW5lcnMgPSB0aGlzLm1hbnkgPSB0aGlzLm9mZiA9IHRoaXMub24gPSB0aGlzLm9uY2UgPSB0aGlzLnNldE1heExpc3RlbmVycyA9IHRoaXMudGljayA9IHRoaXMudHJpZ2dlciA9IHRoaXMudW50aWwgPSBub29wO1xuICAgIHRoaXMudG9KU09OID0gKCkgPT4gJ2Rlc3Ryb3llZCc7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfVxuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIFwiZGVzdHJveWVkXCJcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICBjb25zdCBqc29uID0gbmV3IE51bGwoKSxcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICksXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDtcbiAgICAgICAgXG4gICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgdHlwZTtcbiAgICBcbiAgICBqc29uLm1heExpc3RlbmVycyA9IHRoaXMubWF4TGlzdGVuZXJzO1xuICAgIGpzb24ubGlzdGVuZXJDb3VudCA9IG5ldyBOdWxsKCk7XG4gICAgXG4gICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgaW5kZXggXTtcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGpzb247XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpzdHJpbmd9IEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbWl0dGVyLlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH0nXG4gKiBcbiAqIGdyZWV0ZXIuZGVzdHJveSgpO1xuICogXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XG4gKiAvLyAnRW1pdHRlciBcImRlc3Ryb3llZFwiJ1xuICovXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGAkeyB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgfSAkeyBKU09OLnN0cmluZ2lmeSggdGhpcy50b0pTT04oKSApIH1gLnRyaW0oKTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9