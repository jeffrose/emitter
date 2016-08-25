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
     * A {@link external:string} that represents a function in the Emitter protocol. In the future this will become a {@link external:symbol}.
     * @typedef {external:string} Definition
     */

    /**
     * A {@link external:Function} bound to an emitter {@link EventType}. Any data transmitted with the event will be passed into the listener as arguments.
     * @typedef {external:Function} EventListener
     * @param {...*} data The arguments passed by the `emit`.
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
     * @param {external:Object} mapping The event mapping.
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
            emitEvent(emitter, 'error', [errors[index]]);
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
     * @function Emitter~mixinEmitter
     */
    function mixinEmitter(selection, target) {

        // Shift arguments
        if (typeof target === 'undefined') {
            target = selection;
            selection = API;
        }

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
     * @mixin Emitter~asEmitter
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
         */
        this.setMaxListeners = function (max) {
            setMaxListeners(this, max);
            return this;
        };

        /**
         * Execute the listeners for the specified event `type` with the supplied arguments.
         * 
         * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
         * 
         * Returns a Promise.
         * @function Emitter~asEmitter.tick
         * @param {EventType} type The event type.
         * @param {...*} [data] The data passed into the listeners.
         * @returns {external:Promise}
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

            var emitter = this;

            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        resolve(emitAllEvents(emitter, type, data));
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            });
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
     * A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, and `toString()` and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.
     * @mixin Emitter
     * 
     */
    /**
     * Creates an instance of emitter. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.
     * @class Emitter
     * @classdesc An object that emits named events which cause functions to be executed.
     * @extends Emitter~Null
     * @mixes Emitter
     * @param {external:Object} [bindings] A mapping of event types to event listeners.
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

            // Called as function/mixin
        } else {
            mixinEmitter(arguments[0], arguments[1]);
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
    delete Emitter.prototype.getMaxListeners;
    delete Emitter.prototype.setMaxListeners;

    /**
     * Destroys the emitter.
     * @fires Emitter#:destroy
     */
    Emitter.prototype.destroy = function () {
        emitEvent(this, ':destroy', [], true);
        this.clear();
        this.destroy = this.clear = this.emit = this.first = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.tick = this.trigger = this.until = noop;
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

    Emitter.prototype.valueOf = function () {
        return this.toJSON();
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiRW1pdHRlciIsIk51bGwiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJjcmVhdGUiLCJjb25zdHJ1Y3RvciIsIiRldmVudHMiLCIkZXZlcnkiLCIkbWF4TGlzdGVuZXJzIiwiaGFzT3duUHJvcGVydHkiLCJub29wIiwiQVBJIiwiYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyIiwiZW1pdHRlciIsInR5cGUiLCJsaXN0ZW5lciIsImNvbmRpdGlvbmFsTGlzdGVuZXIiLCJkb25lIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIk5hTiIsImluZGV4IiwiVHlwZUVycm9yIiwiZGVmaW5lRXZlbnRzUHJvcGVydHkiLCJfZXZlbnRzIiwiZW1pdEV2ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNOYU4iLCJwdXNoIiwidW5zaGlmdCIsInNwbGljZSIsIndhcm5lZCIsIm1heCIsIm1heExpc3RlbmVycyIsImxlbmd0aCIsImFkZEZpbml0ZUV2ZW50TGlzdGVuZXIiLCJ0aW1lcyIsImZpbml0ZUxpc3RlbmVyIiwiYWRkRXZlbnRNYXBwaW5nIiwibWFwcGluZyIsInR5cGVzIiwia2V5cyIsInR5cGVMZW5ndGgiLCJ0eXBlSW5kZXgiLCJoYW5kbGVyIiwiaGFuZGxlckluZGV4IiwiaGFuZGxlckxlbmd0aCIsInZhbHVlIiwiaGFzRXZlbnRzIiwiY2FsbCIsImVtaXR0ZXJQcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiZW1pdEFsbEV2ZW50cyIsImRhdGEiLCJleGVjdXRlZCIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZW1pdEVycm9ycyIsImVycm9ycyIsImVtaXRFdmVyeSIsImVycm9yIiwiRXJyb3IiLCJleGVjdXRlTGlzdGVuZXIiLCJzY29wZSIsImlzRnVuY3Rpb24iLCJsaXN0ZW5FbXB0eSIsImxpc3Rlbk9uZSIsImxpc3RlblR3byIsImxpc3RlblRocmVlIiwibGlzdGVuTWFueSIsImdldEV2ZW50VHlwZXMiLCJnZXRNYXhMaXN0ZW5lcnMiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsIm1peGluRW1pdHRlciIsInNlbGVjdGlvbiIsInRhcmdldCIsImFzRW1pdHRlciIsImtleSIsIm5hbWVzIiwic3BsaXQiLCJpIiwic3BsaWNlTGlzdCIsInNldE1heExpc3RlbmVycyIsImxpc3QiLCJqIiwicG9wIiwiYXQiLCJjbGVhciIsImVtaXQiLCJldmVudFR5cGVzIiwiZmlyc3QiLCJsaXN0ZW5lckNvdW50IiwiY291bnQiLCJtYW55Iiwib2ZmIiwib24iLCJvbmNlIiwidGljayIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2V0VGltZW91dCIsImUiLCJ0cmlnZ2VyIiwidW50aWwiLCJnZXQiLCJzZXQiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiZXZlcnkiLCJ2ZXJzaW9uIiwiZGVzdHJveSIsInRvSlNPTiIsImpzb24iLCJ0b1N0cmluZyIsIm5hbWUiLCJKU09OIiwic3RyaW5naWZ5IiwidHJpbSIsInZhbHVlT2YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFFQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7O0FBS0E7Ozs7O0FBS0E7Ozs7OztBQU1BOzs7OztBQUtBOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7Ozs7c0JBMHdDd0JBLE87Ozs7Ozs7O0FBcndDeEIsYUFBU0MsSUFBVCxHQUFlLENBQUU7QUFDakJBLFNBQUtDLFNBQUws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QUFTTSxNQUFNTixNQUZuQjs7QUFJQSxZQUFJZCxRQUFRLENBQVo7QUFBQSxZQUNJVCxhQURKOztBQUdBaUgsYUFBSzNGLFlBQUwsR0FBb0IsS0FBS0EsWUFBekI7QUFDQTJGLGFBQUtyQixhQUFMLEdBQXFCLElBQUl6RyxJQUFKLEVBQXJCOztBQUVBLGVBQU9zQixRQUFRYyxNQUFmLEVBQXVCZCxPQUF2QixFQUFnQztBQUM1QlQsbUJBQU82QixNQUFPcEIsS0FBUCxDQUFQO0FBQ0F3RyxpQkFBS3JCLGFBQUwsQ0FBb0I1RixJQUFwQixJQUE2QixLQUFLNEYsYUFBTCxDQUFvQjVGLElBQXBCLENBQTdCO0FBQ0g7O0FBRUQsZUFBT2lILElBQVA7QUFDSCxLQWpCRDs7QUFtQkE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEvSCxZQUFRRSxTQUFSLENBQWtCOEgsUUFBbEIsR0FBNkIsWUFBVTtBQUNuQyxlQUFPLENBQUksS0FBSzNILFdBQUwsQ0FBaUI0SCxJQUFyQixTQUErQkMsS0FBS0MsU0FBTCxDQUFnQixLQUFLTCxNQUFMLEVBQWhCLENBQS9CLEVBQWtFTSxJQUFsRSxFQUFQO0FBQ0gsS0FGRDs7QUFJQXBJLFlBQVFFLFNBQVIsQ0FBa0JtSSxPQUFsQixHQUE0QixZQUFVO0FBQ2xDLGVBQU8sS0FBS1AsTUFBTCxFQUFQO0FBQ0gsS0FGRCIsImZpbGUiOiJlbWl0dGVyLXVtZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEFycmF5XG4gKiBAZXh0ZXJuYWwgQXJyYXlcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5fVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJtNDU0bXVuMyFpbWl0aXZlfHByaW1pdGl2ZX0gYm9vbGVhblxuICogQGV4dGVybmFsIGJvb2xlYW5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Jvb2xlYW59XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBFcnJvclxuICogQGV4dGVybmFsIEVycm9yXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvcn1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IEZ1bmN0aW9uXG4gKiBAZXh0ZXJuYWwgRnVuY3Rpb25cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9ufVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IG51bWJlclxuICogQGV4dGVybmFsIG51bWJlclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyfVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IG51bGxcbiAqIEBleHRlcm5hbCBudWxsXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9udWxsfVxuICovXG4gXG4vKipcbiAqIEphdmFTY3JpcHQgT2JqZWN0XG4gKiBAZXh0ZXJuYWwgT2JqZWN0XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3R9XG4gKi9cblxuLyoqXG4gKiBKYXZhU2NyaXB0IFByb21pc2VcbiAqIEBleHRlcm5hbCBQcm9taXNlXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm9taXNlfVxuICovXG5cbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzdHJpbmdcbiAqIEBleHRlcm5hbCBzdHJpbmdcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZ31cbiAqL1xuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN5bWJvbFxuICogQGV4dGVybmFsIHN5bWJvbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3ltYm9sfVxuICovXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6c3RyaW5nfSBvciB7QGxpbmsgZXh0ZXJuYWw6c3ltYm9sfSB0aGF0IHJlcHJlc2VudHMgdGhlIHR5cGUgb2YgZXZlbnQgZmlyZWQgYnkgdGhlIEVtaXR0ZXIuXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfGV4dGVybmFsOnN5bWJvbH0gRXZlbnRUeXBlXG4gKi8gXG5cbi8qKlxuICogQSB7QGxpbmsgZXh0ZXJuYWw6c3RyaW5nfSB0aGF0IHJlcHJlc2VudHMgYSBmdW5jdGlvbiBpbiB0aGUgRW1pdHRlciBwcm90b2NvbC4gSW4gdGhlIGZ1dHVyZSB0aGlzIHdpbGwgYmVjb21lIGEge0BsaW5rIGV4dGVybmFsOnN5bWJvbH0uXG4gKiBAdHlwZWRlZiB7ZXh0ZXJuYWw6c3RyaW5nfSBEZWZpbml0aW9uXG4gKi9cblxuLyoqXG4gKiBBIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbn0gYm91bmQgdG8gYW4gZW1pdHRlciB7QGxpbmsgRXZlbnRUeXBlfS4gQW55IGRhdGEgdHJhbnNtaXR0ZWQgd2l0aCB0aGUgZXZlbnQgd2lsbCBiZSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXIgYXMgYXJndW1lbnRzLlxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0gey4uLip9IGRhdGEgVGhlIGFyZ3VtZW50cyBwYXNzZWQgYnkgdGhlIGBlbWl0YC5cbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhbiBlbWl0dGVyIGRlc3Ryb3lzIGl0c2VsZi5cbiAqIEBldmVudCBFbWl0dGVyIzpkZXN0cm95XG4gKi8gXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9hZnRlcl8gYSBsaXN0ZW5lciBpcyByZW1vdmVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9mZlxuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8qKlxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGEgbGlzdGVuZXIgaXMgYWRkZWQuXG4gKiBAZXZlbnQgRW1pdHRlciM6b25cbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBvbmNlIHRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMgaGFzIGJlZW4gZXhjZWVkZWQgZm9yIGFuIGV2ZW50IHR5cGUuXG4gKiBAZXZlbnQgRW1pdHRlciM6bWF4TGlzdGVuZXJzXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxuICogQGNsYXNzIEVtaXR0ZXJ+TnVsbFxuICogQGV4dGVuZHMgZXh0ZXJuYWw6bnVsbFxuICovXG5mdW5jdGlvbiBOdWxsKCl7fVxuTnVsbC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGw7XG5cbmNvbnN0XG4gICAgJGV2ZW50cyAgICAgICA9ICdAQGVtaXR0ZXIvZXZlbnRzJyxcbiAgICAkZXZlcnkgICAgICAgID0gJ0BAZW1pdHRlci9ldmVyeScsXG4gICAgJG1heExpc3RlbmVycyA9ICdAQGVtaXR0ZXIvbWF4TGlzdGVuZXJzJyxcbiAgICBcbiAgICBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgXG4gICAgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcbiAgICBcbiAgICBBUEkgPSBuZXcgTnVsbCgpO1xuXG4vLyBNYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyBhcmUgYnJva2VuIG91dCBmcm9tIHRoZSBwcm90b3R5cGUgZm9yIHRoZSBzYWtlIG9mIG9wdGltaXphdGlvbi4gVGhlIGZ1bmN0aW9ucyBvbiB0aGUgcHJvdG95dHlwZVxuLy8gdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBhcyBhIHJlc3VsdC4gVGhlc2UgZnVuY3Rpb25zIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgYXJndW1lbnRzXG4vLyBhbmQgdGhlcmVmb3JlIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQuXG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gY29uZGl0aW9uYWxMaXN0ZW5lcigpe1xuICAgICAgICBjb25zdCBkb25lID0gbGlzdGVuZXIuYXBwbHkoIGVtaXR0ZXIsIGFyZ3VtZW50cyApO1xuICAgICAgICBpZiggZG9uZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFRPRE8gQ2hlY2sgYmV5b25kIGp1c3Qgb25lIGxldmVsIG9mIGxpc3RlbmVyIHJlZmVyZW5jZXNcbiAgICBjb25kaXRpb25hbExpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXIubGlzdGVuZXIgfHwgbGlzdGVuZXI7XG4gICAgXG4gICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgY29uZGl0aW9uYWxMaXN0ZW5lciwgTmFOICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKXtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgfVxuICAgIFxuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGlmKCBfZXZlbnRzWyAnOm9uJyBdICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvbicsIFsgdHlwZSwgdHlwZW9mIGxpc3RlbmVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgIFxuICAgICAgICAvLyBFbWl0dGluZyBcIm9uXCIgbWF5IGhhdmUgY2hhbmdlZCB0aGUgcmVnaXN0cnkuXG4gICAgICAgIF9ldmVudHNbICc6b24nIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b24nIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFNpbmdsZSBsaXN0ZW5lclxuICAgIGlmKCAhX2V2ZW50c1sgdHlwZSBdICl7XG4gICAgICAgIF9ldmVudHNbIHR5cGUgXSA9IGxpc3RlbmVyO1xuICAgIFxuICAgIC8vIE11bHRpcGxlIGxpc3RlbmVyc1xuICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggX2V2ZW50c1sgdHlwZSBdICkgKXtcbiAgICAgICAgc3dpdGNoKCBpc05hTiggaW5kZXggKSB8fCBpbmRleCApe1xuICAgICAgICAgICAgY2FzZSB0cnVlOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS51bnNoaWZ0KCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0uc3BsaWNlKCBpbmRleCwgMCwgbGlzdGVuZXIgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIFxuICAgIC8vIFRyYW5zaXRpb24gZnJvbSBzaW5nbGUgdG8gbXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gaW5kZXggPT09IDAgP1xuICAgICAgICAgICAgWyBsaXN0ZW5lciwgX2V2ZW50c1sgdHlwZSBdIF0gOlxuICAgICAgICAgICAgWyBfZXZlbnRzWyB0eXBlIF0sIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIFxuICAgIC8vIFRyYWNrIHdhcm5pbmdzIGlmIG1heCBsaXN0ZW5lcnMgaXMgYXZhaWxhYmxlXG4gICAgaWYoICdtYXhMaXN0ZW5lcnMnIGluIGVtaXR0ZXIgJiYgIV9ldmVudHNbIHR5cGUgXS53YXJuZWQgKXtcbiAgICAgICAgY29uc3QgbWF4ID0gZW1pdHRlci5tYXhMaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggbWF4ICYmIG1heCA+IDAgJiYgX2V2ZW50c1sgdHlwZSBdLmxlbmd0aCA+IG1heCApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm1heExpc3RlbmVycycsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBFbWl0dGluZyBcIm1heExpc3RlbmVyc1wiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICAgICAgX2V2ZW50c1sgJzptYXhMaXN0ZW5lcnMnIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6bWF4TGlzdGVuZXJzJyBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBlbWl0dGVyWyAkZXZlbnRzIF0gPSBfZXZlbnRzO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmFkZEZpbml0ZUV2ZW50TGlzdGVuZXJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAqL1xuZnVuY3Rpb24gYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgdGltZXMsIGxpc3RlbmVyICl7XG4gICAgXG4gICAgZnVuY3Rpb24gZmluaXRlTGlzdGVuZXIoKXtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICByZXR1cm4gLS10aW1lcyA9PT0gMDtcbiAgICB9XG4gICAgXG4gICAgZmluaXRlTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICBcbiAgICBhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGZpbml0ZUxpc3RlbmVyICk7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRNYXBwaW5nXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOk9iamVjdH0gbWFwcGluZyBUaGUgZXZlbnQgbWFwcGluZy5cbiAqL1xuZnVuY3Rpb24gYWRkRXZlbnRNYXBwaW5nKCBlbWl0dGVyLCBtYXBwaW5nICl7XG4gICAgY29uc3RcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggbWFwcGluZyApLFxuICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZXMubGVuZ3RoO1xuICAgIFxuICAgIGxldCB0eXBlSW5kZXggPSAwLFxuICAgICAgICBoYW5kbGVyLCBoYW5kbGVySW5kZXgsIGhhbmRsZXJMZW5ndGgsIHR5cGU7XG4gICAgXG4gICAgZm9yKCA7IHR5cGVJbmRleCA8IHR5cGVMZW5ndGg7IHR5cGVJbmRleCArPSAxICl7XG4gICAgICAgIHR5cGUgPSB0eXBlc1sgdHlwZUluZGV4IF07XG4gICAgICAgIGhhbmRsZXIgPSBtYXBwaW5nWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICAvLyBMaXN0IG9mIGxpc3RlbmVyc1xuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XG4gICAgICAgICAgICBoYW5kbGVySW5kZXggPSAwO1xuICAgICAgICAgICAgaGFuZGxlckxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKCA7IGhhbmRsZXJJbmRleCA8IGhhbmRsZXJMZW5ndGg7IGhhbmRsZXJJbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggZW1pdHRlciwgdHlwZSwgaGFuZGxlclsgaGFuZGxlckluZGV4IF0sIE5hTiApO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyLCBOYU4gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5kZWZpbmVFdmVudHNQcm9wZXJ0eVxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBwcm9wZXJ0eSB3aWxsIGJlIGNyZWF0ZWQuXG4gKi8gXG5mdW5jdGlvbiBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgdmFsdWUgKXtcbiAgICBjb25zdCBoYXNFdmVudHMgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKCBlbWl0dGVyLCAkZXZlbnRzICksXG4gICAgICAgIGVtaXR0ZXJQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIGVtaXR0ZXIgKTtcbiAgICAgICAgXG4gICAgaWYoICFoYXNFdmVudHMgfHwgKCBlbWl0dGVyUHJvdG90eXBlICYmIGVtaXR0ZXJbICRldmVudHMgXSA9PT0gZW1pdHRlclByb3RvdHlwZVsgJGV2ZW50cyBdICkgKXtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBlbWl0dGVyLCAkZXZlbnRzLCB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0gKTtcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEFsbEV2ZW50c1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCBgdHlwZWAgd2lsbCBiZSBlbWl0dGVkLlxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCBhIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSB3YXMgZXhlY3V0ZWQuXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEFsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApe1xuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICAvLyBJZiB0eXBlIGlzIG5vdCBhIHN0cmluZywgaW5kZXggd2lsbCBiZSBmYWxzZVxuICAgICAgICBpbmRleCA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICBcbiAgICAvLyBOYW1lc3BhY2VkIGV2ZW50LCBlLmcuIEVtaXQgXCJmb286YmFyOnF1eFwiLCB0aGVuIFwiZm9vOmJhclwiXG4gICAgd2hpbGUoIGluZGV4ID4gMCApe1xuICAgICAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGZhbHNlICkgKSB8fCBleGVjdXRlZDtcbiAgICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKCAwLCBpbmRleCApO1xuICAgICAgICBpbmRleCA9IHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xuICAgIH1cbiAgICBcbiAgICAvLyBFbWl0IHNpbmdsZSBldmVudCBvciB0aGUgbmFtZXNwYWNlZCBldmVudCByb290LCBlLmcuIFwiZm9vXCIsIFwiOmJhclwiLCBTeW1ib2woIFwiQEBxdXhcIiApXG4gICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCB0cnVlICkgKSB8fCBleGVjdXRlZDtcbiAgICBcbiAgICByZXR1cm4gZXhlY3V0ZWQ7XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEVycm9yc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBgZXJyb3JzYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0FycmF5PGV4dGVybmFsOkVycm9yPn0gZXJyb3JzIFRoZSBhcnJheSBvZiBlcnJvcnMgdG8gYmUgZW1pdHRlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICl7XG4gICAgY29uc3QgbGVuZ3RoID0gZXJyb3JzLmxlbmd0aDtcbiAgICBmb3IoIGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJ2Vycm9yJywgWyBlcnJvcnNbIGluZGV4IF0gXSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXZlbnRcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGVtaXRFdmVyeSBXaGV0aGVyIG9yIG5vdCBsaXN0ZW5lcnMgZm9yIGFsbCB0eXBlcyB3aWxsIGJlIGV4ZWN1dGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGVtaXRFdmVyeSApe1xuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xuICAgIFxuICAgIGxldCBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcjtcbiAgICBcbiAgICBpZiggdHlwZSA9PT0gJ2Vycm9yJyAmJiAhX2V2ZW50cy5lcnJvciApe1xuICAgICAgICBjb25zdCBlcnJvciA9IGRhdGFbIDAgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCBlcnJvciBpbnN0YW5jZW9mIEVycm9yICl7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gdHlwZSBvZiBldmVudFxuICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgdHlwZSBdO1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcbiAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBsaXN0ZW5pbmcgZm9yIGFsbCB0eXBlcyBvZiBldmVudHNcbiAgICBpZiggZW1pdEV2ZXJ5ICl7XG4gICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgJGV2ZXJ5IF07XG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbGlzdGVuZXIgdXNpbmcgdGhlIGludGVybmFsIGBleGVjdXRlKmAgZnVuY3Rpb25zIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZXhlY3V0ZUxpc3RlbmVyXG4gKiBAcGFyYW0ge0FycmF5PExpc3RlbmVyPnxMaXN0ZW5lcn0gbGlzdGVuZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7Kn0gc2NvcGVcbiAqLyBcbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIHNjb3BlICl7XG4gICAgY29uc3QgaXNGdW5jdGlvbiA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJztcbiAgICBcbiAgICBzd2l0Y2goIGRhdGEubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGxpc3RlbkVtcHR5ICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgbGlzdGVuT25lICAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGFbIDAgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxpc3RlblR3byAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGxpc3RlblRocmVlICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSwgZGF0YVsgMiBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxpc3Rlbk1hbnkgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+Z2V0RXZlbnRUeXBlc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIGV2ZW50IHR5cGVzIHdpbGwgYmUgcmV0cmlldmVkLlxuICogQHJldHVybnMge0FycmF5PEV2ZW50VHlwZT59IFRoZSBsaXN0IG9mIGV2ZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhlIGVtaXR0ZXIuXG4gKi9cbmZ1bmN0aW9uIGdldEV2ZW50VHlwZXMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoIGVtaXR0ZXJbICRldmVudHMgXSApO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldE1heExpc3RlbmVyc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIG1heCBsaXN0ZW5lcnMgd2lsbCBiZSByZXRyaWV2ZWQuXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICovXG5mdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIGVtaXR0ZXJbICRtYXhMaXN0ZW5lcnMgXSAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgICBlbWl0dGVyWyAkbWF4TGlzdGVuZXJzIF0gOlxuICAgICAgICBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgdmFsdWUgaXMgYSBwb3NpdGl2ZSBudW1iZXIuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5pc1Bvc2l0aXZlTnVtYmVyXG4gKiBAcGFyYW0geyp9IG51bWJlciBUaGUgdmFsdWUgdG8gYmUgdGVzdGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqL1xuZnVuY3Rpb24gaXNQb3NpdGl2ZU51bWJlciggbnVtYmVyICl7XG4gICAgcmV0dXJuIHR5cGVvZiBudW1iZXIgPT09ICdudW1iZXInICYmIG51bWJlciA+PSAwICYmICFpc05hTiggbnVtYmVyICk7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggbm8gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuRW1wdHlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxuICogQHBhcmFtIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uIFdoZXRoZXIgb3Igbm90IHRoZSBgaGFuZGxlcmAgaXMgYSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258ZnVuY3Rpb259LlxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5FbXB0eSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggb25lIGFyZ3VtZW50LlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuT25lXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3Rlbk9uZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XG4gICAgICAgIGVtaXRFcnJvcnMoIGVtaXR0ZXIsIGVycm9ycyApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0d28gYXJndW1lbnRzLlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuVHdvXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuVHdvKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHRocmVlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblRocmVlXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7Kn0gYXJnMSBUaGUgZmlyc3QgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gYXJnMyBUaGUgdGhpcmQgYXJndW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlblRocmVlKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICl7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIGZvdXIgb3IgbW9yZSBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5NYW55XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXIgT25lIG9yIG1vcmUge0BsaW5rIEV2ZW50TGlzdGVuZXJ8bGlzdGVuZXJzfSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgb24gdGhlIGBlbWl0dGVyYC5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGFyZ3MgRm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuTWFueSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJncyApe1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uYXBwbHkoIGVtaXR0ZXIsIGFyZ3MgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfm1peGluRW1pdHRlclxuICovXG5mdW5jdGlvbiBtaXhpbkVtaXR0ZXIoIHNlbGVjdGlvbiwgdGFyZ2V0ICl7XG4gICAgXG4gICAgLy8gU2hpZnQgYXJndW1lbnRzXG4gICAgaWYoIHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIHRhcmdldCA9IHNlbGVjdGlvbjtcbiAgICAgICAgc2VsZWN0aW9uID0gQVBJO1xuICAgIH1cbiAgICBcbiAgICAvLyBBcHBseSB0aGUgZW50aXJlIEVtaXR0ZXIgQVBJXG4gICAgaWYoIHNlbGVjdGlvbiA9PT0gQVBJICl7XG4gICAgICAgIGFzRW1pdHRlci5jYWxsKCB0YXJnZXQgKTtcbiAgICBcbiAgICAvLyBBcHBseSBvbmx5IHRoZSBzZWxlY3RlZCBBUEkgbWV0aG9kc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBpbmRleCwga2V5LCBtYXBwaW5nLCBuYW1lcywgdmFsdWU7XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIHNlbGVjdGlvbiA9PT0gJ3N0cmluZycgKXtcbiAgICAgICAgICAgIG5hbWVzID0gc2VsZWN0aW9uLnNwbGl0KCAnICcgKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBBUEk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lcyA9IE9iamVjdC5rZXlzKCBzZWxlY3Rpb24gKTtcbiAgICAgICAgICAgIG1hcHBpbmcgPSBzZWxlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gbmFtZXMubGVuZ3RoO1xuICAgICAgICBcbiAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcbiAgICAgICAgICAgIGtleSA9IG5hbWVzWyBpbmRleCBdO1xuICAgICAgICAgICAgdmFsdWUgPSBtYXBwaW5nWyBrZXkgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgICAgdmFsdWUgOlxuICAgICAgICAgICAgICAgIEFQSVsgdmFsdWUgXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5yZW1vdmVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xuICAgIC8vIERlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG4gICAgZGVmaW5lRXZlbnRzUHJvcGVydHkoIGVtaXR0ZXIsIG5ldyBOdWxsKCkgKTtcbiAgICBcbiAgICBjb25zdCBoYW5kbGVyID0gZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgXG4gICAgaWYoIGhhbmRsZXIgPT09IGxpc3RlbmVyIHx8ICggdHlwZW9mIGhhbmRsZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgJiYgaGFuZGxlci5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICBkZWxldGUgZW1pdHRlclsgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XG4gICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICBsZXQgaW5kZXggPSAtMTtcbiAgICAgICAgXG4gICAgICAgIGZvciggbGV0IGkgPSBoYW5kbGVyLmxlbmd0aDsgaS0tID4gMDsgKXtcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyWyBpIF0gPT09IGxpc3RlbmVyIHx8ICggaGFuZGxlclsgaSBdLmxpc3RlbmVyICYmIGhhbmRsZXJbIGkgXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiggaW5kZXggPiAtMSApe1xuICAgICAgICAgICAgaWYoIGhhbmRsZXIubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3BsaWNlTGlzdCggaGFuZGxlciwgaW5kZXggKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGVtaXR0ZXJbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c2V0TWF4TGlzdGVuZXJzXG4gKi9cbmZ1bmN0aW9uIHNldE1heExpc3RlbmVycyggZW1pdHRlciwgbWF4ICl7XG4gICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCBtYXggKSApe1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbWF4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgfVxuICAgIFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJG1heExpc3RlbmVycywge1xuICAgICAgICB2YWx1ZTogbWF4LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0gKTtcbn1cblxuLyoqXG4gKiBGYXN0ZXIgdGhhbiBgQXJyYXkucHJvdG90eXBlLnNwbGljZWBcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnNwbGljZUxpc3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGxpc3RcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxuICovIFxuZnVuY3Rpb24gc3BsaWNlTGlzdCggbGlzdCwgaW5kZXggKXtcbiAgICBmb3IoIGxldCBpID0gaW5kZXgsIGogPSBpICsgMSwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGogPCBsZW5ndGg7IGkgKz0gMSwgaiArPSAxICl7XG4gICAgICAgIGxpc3RbIGkgXSA9IGxpc3RbIGogXTtcbiAgICB9XG4gICAgXG4gICAgbGlzdC5wb3AoKTtcbn1cblxuLyoqXG4gKiBAbWl4aW4gRW1pdHRlcn5hc0VtaXR0ZXJcbiAqL1xuZnVuY3Rpb24gYXNFbWl0dGVyKCl7XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCBhdCB0aGUgc3BlY2lmaWVkIGBpbmRleGAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5hdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4IFdoZXJlIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGFkZGVkIGluIHRoZSB0cmlnZ2VyIGxpc3QuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcbiAgICAgKi9cbiAgICB0aGlzLmF0ID0gZnVuY3Rpb24oIHR5cGUsIGluZGV4LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgaW5kZXggPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCBpc1Bvc2l0aXZlTnVtYmVyKCBpbmRleCApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnaW5kZXggbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIGluZGV4ICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmNsZWFyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hpJywgKCkgPT4gY29uc29sZS5sb2coICdIaSEnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKiBncmVldGVyLmNsZWFyKCk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCB7XG4gICAgICogICdoZWxsbycgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTsgfSxcbiAgICAgKiAgJ2hpJyAgICA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGkhJyApOyB9XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiAvLyBIaSFcbiAgICAgKi9cbiAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgbGV0IGhhbmRsZXI7XG4gICAgICAgIFxuICAgICAgICAvLyBObyBFdmVudHNcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBXaXRoIG5vIFwib2ZmXCIgbGlzdGVuZXJzLCBjbGVhcmluZyBjYW4gYmUgc2ltcGxpZmllZFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICAgICAgdGhpc1sgJGV2ZW50cyBdID0gbmV3IE51bGwoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDbGVhciBhbGwgbGlzdGVuZXJzXG4gICAgICAgIGlmKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICBjb25zdCB0eXBlcyA9IGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQXZvaWQgcmVtb3ZpbmcgXCJvZmZcIiBsaXN0ZW5lcnMgdW50aWwgYWxsIG90aGVyIHR5cGVzIGhhdmUgYmVlbiByZW1vdmVkXG4gICAgICAgICAgICBmb3IoIGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcbiAgICAgICAgICAgICAgICBpZiggdHlwZXNbIGluZGV4IF0gPT09ICc6b2ZmJyApe1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhciggdHlwZXNbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTWFudWFsbHkgY2xlYXIgXCJvZmZcIlxuICAgICAgICAgICAgdGhpcy5jbGVhciggJzpvZmYnICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXIgKTtcbiAgICAgICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXJbIGluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy5cbiAgICAgKiBcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmVtaXRcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudDwvY2FwdGlvbj5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApOyAgICAvLyB0cnVlXG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTsgIC8vIGZhbHNlXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQgd2l0aCBkYXRhPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYSBuYW1lc3BhY2VkIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICAgICAqIFxuICAgICAqIC8vIFRoaXMgZXZlbnQgd2lsbCBub3QgYmUgdHJpZ2dlcmVkIGJ5IGVtaXR0aW5nIFwiZ3JlZXRpbmc6aGVsbG9cIlxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8gYWdhaW4sICR7IG5hbWUgfWAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoaScsICdNYXJrJyApO1xuICAgICAqIC8vIEhpLCBNYXJrIVxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gICAgICogXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKCB0eXBlLCAuLi5kYXRhICl7XG4gICAgICAgIHJldHVybiBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZXZlbnRUeXBlc1xuICAgICAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coIGBIZWxsb2AgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCBgSGlgICkgKTtcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5ldmVudFR5cGVzKCkgKTtcbiAgICAgKiAvLyBbICdoZWxsbycsICdoaScgXVxuICAgICAqLyBcbiAgICB0aGlzLmV2ZW50VHlwZXMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0RXZlbnRUeXBlcyggdGhpcyApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmZpcnN0XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqL1xuICAgIHRoaXMuZmlyc3QgPSBmdW5jdGlvbiggdHlwZSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgMCApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuZ2V0TWF4TGlzdGVuZXJzXG4gICAgICovXG4gICAgdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIubGlzdGVuZXJDb3VudFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnaGVsbG8nICkgKTtcbiAgICAgKiAvLyAxXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2dvb2RieWUnICkgKTtcbiAgICAgKiAvLyAwXG4gICAgICovIFxuICAgIHRoaXMubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIGxldCBjb3VudDtcblxuICAgICAgICAvLyBFbXB0eVxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGNvdW50ID0gMDtcbiAgICAgICAgXG4gICAgICAgIC8vIEZ1bmN0aW9uXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHRoaXNbICRldmVudHMgXVsgdHlwZSBdID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICBjb3VudCA9IDE7XG4gICAgICAgIFxuICAgICAgICAvLyBBcnJheVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY291bnQgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgdGhhdCBldmVudCB0eXBlIHdpdGhpbiB0aGUgZ2l2ZW4gZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGhlbGxvID0gZnVuY3Rpb24oKXtcbiAgICAgKiAgY29uc29sZS5sb2coICdIZWxsbyEnICk7XG4gICAgICogfSxcbiAgICAgKiAgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lcnMoICdoZWxsbycgKVsgMCBdID09PSBoZWxsbyApO1xuICAgICAqIC8vIHRydWVcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICBsZXQgbGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFsgaGFuZGxlciBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSAqbWFueSB0aW1lKiBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC4gQWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIGludm9rZWQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgYHRpbWVzYCwgaXQgaXMgcmVtb3ZlZC5cbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5tYW55XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbnkgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1RlcnJ5JyApOyAgICAgIC8vIDJcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnU3RldmUnICk7ICAgICAgLy8gM1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAvLyAyXG4gICAgICogLy8gSGVsbG8sIFRlcnJ5IVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgIC8vIDNcbiAgICAgKi8gXG4gICAgdGhpcy5tYW55ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aW1lcztcbiAgICAgICAgICAgIHRpbWVzID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggdGltZXMgKSApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3RpbWVzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBgbGlzdGVuZXJgIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIGl0IGlzIGFzc3VtZWQgdGhlIGBsaXN0ZW5lcmAgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBJZiBhbnkgc2luZ2xlIGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgdGhlbiBgZW1pdHRlci5vZmYoKWAgbXVzdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gcmVtb3ZlIGVhY2ggaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9mZlxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b2ZmXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhbnkgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBncmVldCggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0aW5ncywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnSmVmZicgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gaGVsbG8oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICovIFxuICAgIHRoaXMub2ZmID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm9uXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IHR5cGUgPSBhcmd1bWVudHNbIDAgXSB8fCAkZXZlcnksXG4gICAgICAgICAgICBsaXN0ZW5lciA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVHlwZSBub3QgcHJvdmlkZWQsIGZhbGwgYmFjayB0byBcIiRldmVyeVwiXG4gICAgICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0IG9mIGV2ZW50IGJpbmRpbmdzXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApe1xuICAgICAgICAgICAgICAgIGFkZEV2ZW50TWFwcGluZyggdGhpcywgdHlwZSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgTmFOICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vbmNlXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIG9uY2UgdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uY2UgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCAxLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzXG4gICAgICovXG4gICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiggbWF4ICl7XG4gICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBhcmd1bWVudHMuXG4gICAgICogXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBhIFByb21pc2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRpY2tcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gey4uLip9IFtkYXRhXSBUaGUgZGF0YSBwYXNzZWQgaW50byB0aGUgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpQcm9taXNlfVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkFzeW5jaHJvbm91c2x5IGVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci50aWNrKCAnaGVsbG8nICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnaGVsbG8gaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiBncmVldGVyLnRpY2soICdnb29kYnllJyApLnRoZW4oICggaGVhcmQgKSA9PiBjb25zb2xlLmxvZyggJ2dvb2RieWUgaGVhcmQ/ICcsIGhlYXJkICkgKTtcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiAvLyBoZWxsbyBoZWFyZD8gdHJ1ZVxuICAgICAqIC8vIGdvb2RieWUgaGVhcmQ/IGZhbHNlXG4gICAgICovXG4gICAgdGhpcy50aWNrID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSggZW1pdEFsbEV2ZW50cyggZW1pdHRlciwgdHlwZSwgZGF0YSApICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCggZSApe1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoIGUgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH0gKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYGRhdGFgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudHJpZ2dlclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnaGVsbG8nLCBbICdXb3JsZCcgXSApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhpJywgWyAnTWFyaycgXSApO1xuICAgICAqIC8vIEhpLCBNYXJrIVxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGVsbG8nLCBbICdKZWZmJyBdICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogLy8gSmVmZiB3YXMgZ3JlZXRlZC5cbiAgICAgKi9cbiAgICB0aGlzLnRyaWdnZXIgPSBmdW5jdGlvbiggdHlwZSwgZGF0YSA9IFtdICl7XG4gICAgICAgIHJldHVybiBlbWl0QWxsRXZlbnRzKCB0aGlzLCB0eXBlLCBkYXRhICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkICp1bnRpbCogdGhlIGBsaXN0ZW5lcmAgcmV0dXJucyBgdHJ1ZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci51bnRpbFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBHcmVldGVkICR7IG5hbWUgfWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdUZXJyeSc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRlZCBKZWZmXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScsICdUZXJyeScgKTtcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknLCAnQWFyb24nICk7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLnVudGlsKCAnaGVsbG8nLCBmdW5jdGlvbiggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xuICAgICAqICByZXR1cm4gbmFtZSA9PT0gJ1dvcmxkJztcbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnTWFyaycgKTtcbiAgICAgKi9cbiAgICB0aGlzLnVudGlsID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciApO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbn1cblxuYXNFbWl0dGVyLmNhbGwoIEFQSSApO1xuXG4vKipcbiAqIEEgZnVuY3Rpb25hbCBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byBpdHMgdGFyZ2V0LiBUaGUgYGNvbnN0cnVjdG9yKClgLCBgZGVzdHJveSgpYCwgYHRvSlNPTigpYCwgYW5kIGB0b1N0cmluZygpYCBhbmQgc3RhdGljIHByb3BlcnRpZXMgb24gYEVtaXR0ZXJgIGFyZSBub3QgcHJvdmlkZWQuIFRoaXMgbWl4aW4gaXMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgYHByb3RvdHlwZWAgb2YgYEVtaXR0ZXJgLlxuICogQG1peGluIEVtaXR0ZXJcbiAqIFxuICovXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZW1pdHRlci4gSWYgYGJpbmRpbmdzYCBhcmUgcHJvdmlkZWQgdGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcGFzc2VkIGludG8gYG9uKClgIG9uY2UgY29uc3RydWN0aW9uIGlzIGNvbXBsZXRlLlxuICogQGNsYXNzIEVtaXR0ZXJcbiAqIEBjbGFzc2Rlc2MgQW4gb2JqZWN0IHRoYXQgZW1pdHMgbmFtZWQgZXZlbnRzIHdoaWNoIGNhdXNlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZC5cbiAqIEBleHRlbmRzIEVtaXR0ZXJ+TnVsbFxuICogQG1peGVzIEVtaXR0ZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSBbYmluZGluZ3NdIEEgbWFwcGluZyBvZiBldmVudCB0eXBlcyB0byBldmVudCBsaXN0ZW5lcnMuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2V2ZW50cy5qc31cbiAqIEBleGFtcGxlIDxjYXB0aW9uPlVzaW5nIEVtaXR0ZXIgZGlyZWN0bHk8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAqIC8vIEhlbGxvIVxuICogQGV4YW1wbGUgPGNhcHRpb24+RXh0ZW5kaW5nIEVtaXR0ZXIgdXNpbmcgQ2xhc3NpY2FsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxuICogY2xhc3MgR3JlZXRlciBleHRlbmRzIEVtaXR0ZXIge1xuICogIGNvbnN0cnVjdG9yKCl7XG4gKiAgICAgIHN1cGVyKCk7XG4gKiAgICAgIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqICB9XG4gKiBcbiAqICBncmVldCggbmFtZSApe1xuICogICAgICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcbiAqICB9XG4gKiB9XG4gKiBcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIFByb3RvdHlwYWwgaW5oZXJpdGFuY2U8L2NhcHRpb24+XG4gKiBmdW5jdGlvbiBHcmVldGVyKCl7XG4gKiAgRW1pdHRlci5jYWxsKCB0aGlzICk7XG4gKiAgdGhpcy5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogfVxuICogR3JlZXRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuICogXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XG4gKiAgdGhpcy5lbWl0KCAnZ3JlZXQnLCBuYW1lICk7XG4gKiB9O1xuICogXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcbiAqIGdyZWV0ZXIuZ3JlZXQoICdKZWZmJyApO1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5OYW1lc3BhY2VkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhpJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGAkeyBuYW1lIH0gd2FzIGdyZWV0ZWQuYCApO1xuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XG4gKiAvLyBIaSwgTWFyayFcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0aW5ncyA9IHtcbiAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcbiAqICB9LFxuICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlciggZ3JlZXRpbmdzICk7XG4gKiBcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICogLy8gSGVsbG8sIEFhcm9uIVxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5tYW55KCAnaGVsbG8nLCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgIC8vIDJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgICAvLyAzXG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIC8vIEhlbGxvLCBUZXJyeSFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlcigpe1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBjb25zdHJ1Y3RvclxuICAgIGlmKCB0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25zdHJ1Y3RvciA9PT0gRW1pdHRlciApe1xuICAgICAgICBsZXQgbWFwcGluZyA9IGFyZ3VtZW50c1sgMCBdO1xuICAgICAgICB0eXBlb2YgbWFwcGluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCBtYXBwaW5nICk7XG4gICAgICAgIFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdtYXhMaXN0ZW5lcnMnLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldE1heExpc3RlbmVycyggdGhpcyApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24oIG1heCApe1xuICAgICAgICAgICAgICAgIHNldE1heExpc3RlbmVycyggdGhpcywgbWF4ICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgfSApO1xuICAgIFxuICAgIC8vIENhbGxlZCBhcyBmdW5jdGlvbi9taXhpblxuICAgIH0gZWxzZSB7XG4gICAgICAgIG1peGluRW1pdHRlciggYXJndW1lbnRzWyAwIF0sIGFyZ3VtZW50c1sgMSBdICk7XG4gICAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggRW1pdHRlciwge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciBhbGwgZW1pdHRlcnMuIFVzZSBgZW1pdHRlci5tYXhMaXN0ZW5lcnNgIHRvIHNldCB0aGUgbWF4aW11bSBvbiBhIHBlci1pbnN0YW5jZSBiYXNpcy5cbiAgICAgKiBcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZW50IGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGEgc3BlY2lmaWMgZXZlbnQgdHlwZS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycz0xMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNoYW5naW5nIHRoZSBkZWZhdWx0IG1heGltdW0gbGlzdGVuZXJzPC9jYXB0aW9uPlxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgKTtcbiAgICAgKiAvLyAxMFxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIxID0gbmV3IEVtaXR0ZXIoKSxcbiAgICAgKiAgZ3JlZXRlcjIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDE7XG4gICAgICogXG4gICAgICogZ3JlZXRlcjEub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMi5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBhbGVydCggJ0hpIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGlcIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqL1xuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnM6IHtcbiAgICAgICAgdmFsdWU6IDEwLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIHN5bWJvbCB1c2VkIHRvIGxpc3RlbiBmb3IgZXZlbnRzIG9mIGFueSBgdHlwZWAuIEZvciBfbW9zdF8gbWV0aG9kcywgd2hlbiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhpcyBpcyB0aGUgZGVmYXVsdC5cbiAgICAgKiBcbiAgICAgKiBVc2luZyBgRW1pdHRlci5ldmVyeWAgaXMgdHlwaWNhbGx5IG5vdCBuZWNlc3NhcnkuXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3ltYm9sfSBFbWl0dGVyLmV2ZXJ5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBFbWl0dGVyLmV2ZXJ5LCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICovXG4gICAgZXZlcnk6IHtcbiAgICAgICAgdmFsdWU6ICRldmVyeSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mICpFbWl0dGVyLmpzKi5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEVtaXR0ZXIudmVyc2lvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIudmVyc2lvbiApO1xuICAgICAqIC8vIDIuMC4wXG4gICAgICovXG4gICAgdmVyc2lvbjoge1xuICAgICAgICB2YWx1ZTogJzIuMC4wJyxcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH1cbn0gKTtcblxuRW1pdHRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xuXG5FbWl0dGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEVtaXR0ZXI7XG5cbmFzRW1pdHRlci5jYWxsKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuZGVsZXRlIEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycztcbmRlbGV0ZSBFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnM7XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxuICovXG5FbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCB0cnVlICk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZGVzdHJveSA9IHRoaXMuY2xlYXIgPSB0aGlzLmVtaXQgPSB0aGlzLmZpcnN0ID0gdGhpcy5saXN0ZW5lckNvdW50ID0gdGhpcy5saXN0ZW5lcnMgPSB0aGlzLm1hbnkgPSB0aGlzLm9mZiA9IHRoaXMub24gPSB0aGlzLm9uY2UgPSB0aGlzLnRpY2sgPSB0aGlzLnRyaWdnZXIgPSB0aGlzLnVudGlsID0gbm9vcDtcbiAgICB0aGlzLnRvSlNPTiA9ICgpID0+ICdkZXN0cm95ZWQnO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6T2JqZWN0fSBBbiBwbGFpbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVtaXR0ZXIuXG4gKiBAZXhhbXBsZVxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XG4gKiAvLyB7IFwibWF4TGlzdGVuZXJzXCI6IDUsIFwibGlzdGVuZXJDb3VudFwiOiB7IFwiZ3JlZXRcIjogMiB9IH1cbiAqIFxuICogZ3JlZXRlci5kZXN0cm95KCk7XG4gKiBcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XG4gKiAvLyBcImRlc3Ryb3llZFwiXG4gKi9cbkVtaXR0ZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc3QganNvbiA9IG5ldyBOdWxsKCksXG4gICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIHRoaXNbICRldmVudHMgXSApLFxuICAgICAgICBsZW5ndGggPSB0eXBlcy5sZW5ndGg7XG4gICAgICAgIFxuICAgIGxldCBpbmRleCA9IDAsXG4gICAgICAgIHR5cGU7XG4gICAgXG4gICAganNvbi5tYXhMaXN0ZW5lcnMgPSB0aGlzLm1heExpc3RlbmVycztcbiAgICBqc29uLmxpc3RlbmVyQ291bnQgPSBuZXcgTnVsbCgpO1xuICAgIFxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIGluZGV4IF07XG4gICAgICAgIGpzb24ubGlzdGVuZXJDb3VudFsgdHlwZSBdID0gdGhpcy5saXN0ZW5lckNvdW50KCB0eXBlICk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgeyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9J1xuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgXCJkZXN0cm95ZWRcIidcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBgJHsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIH0gJHsgSlNPTi5zdHJpbmdpZnkoIHRoaXMudG9KU09OKCkgKSB9YC50cmltKCk7XG59O1xuXG5FbWl0dGVyLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy50b0pTT04oKTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9