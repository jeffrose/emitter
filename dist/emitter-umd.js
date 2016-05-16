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
     * JavaScript {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive|primitive} boolean
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
     * JavaScript Object
     * @external Object
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/external:Object}
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
     * @typedef {external:string|external:symbol} EventType
     */

    /**
     * A function bound to an emitter event. Any data transmitted with the event will be passed into the listener as arguments.
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

    // Instantiating this is faster than explicitly calling `Object.create( null )` to get a "clean" empty object

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Emitter;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    function Container() {}
    Container.prototype = Object.create(null);

    var

    /**
     * @constant {external:Object} Emitter.API
     * @property {external:symbol} defineEvents Reference to {@link Emitter#defineEvents}
     * @property {external:symbol} defineMaxListeners Reference to {@link Emitter#defineMaxListeners}
     * @property {external:symbol} destroyEvents Reference to {@link Emitter#destroyEvents}
     * @property {external:symbol} destroyMaxListeners Reference to {@link Emitter#destroyMaxListeners}
     * @property {external:symbol} getMaxListeners Reference to {@link Emitter#getMaxListeners}
     * @property {external:symbol} setMaxListeners Reference to {@link Emitter#setMaxListeners}
     */
    API = {
        defineEvents: Symbol('@@defineEvents'),
        defineMaxListeners: Symbol('@@defineMaxListeners'),
        destroyEvents: Symbol('@@destroyEvents'),
        destroyMaxListeners: Symbol('@@destroyMaxListeners'),
        getMaxListeners: Symbol('@@getMaxListeners'),
        setMaxListeners: Symbol('@@setMaxListeners')
    },
        $defaultMaxListeners = Symbol('@@defaultMaxListeners'),
        $events = Symbol('@@events'),
        $every = Symbol('@@every'),
        $maxListeners = Symbol('@@maxListeners'),
        noop = function noop() {};

    // Many of these functions are broken out from the prototype for the sake of optimization. The functions on the protoytype
    // take a variable number of arguments and can be deoptimized as a result. These functions have a fixed number of arguments
    // and therefore do not get deoptimized.

    /**
     * @function Emitter~emitErrors
     * @param {Emitter} emitter The emitter on which the `errors` will be emitted.
     * @param {Array<external:Error>} errors The array of errors to be emitted.
     */
    function emitErrors(emitter, errors) {
        for (var i = 0, length = errors.length; i < length; i += 1) {
            emitEvent(emitter, 'error', [errors[i]]);
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
        var _events = emitter[$events],
            executed = false,
            listener;

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
     * Execute a listener with no arguments.
     * @function Emitter~executeEmpty
     * @param {EventListener|Array<EventListener>} handler
     * @paran {external:boolean} isFunction
     * @param {Emitter} emitter
     */
    function executeEmpty(handler, isFunction, emitter) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice(),
                i = 0;

            for (; i < length; i += 1) {
                try {
                    listeners[i].call(emitter);
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
     * @function Emitter~executeOne
     * @param {EventListener|Array<EventListener>} handler
     * @paran {external:boolean} isFunction
     * @param {Emitter} emitter
     * @param {*} arg1
     */
    function executeOne(handler, isFunction, emitter, arg1) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter, arg1);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice(),
                i = 0;

            for (; i < length; i += 1) {
                try {
                    listeners[i].call(emitter, arg1);
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
     * @function Emitter~executeTwo
     * @param {EventListener|Array<EventListener>} handler
     * @paran {external:boolean} isFunction
     * @param {Emitter} emitter
     * @param {*} arg1
     * @param {*} arg2
     */
    function executeTwo(handler, isFunction, emitter, arg1, arg2) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter, arg1, arg2);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice(),
                i = 0;

            for (; i < length; i += 1) {
                try {
                    listeners[i].call(emitter, arg1, arg2);
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
     * @function Emitter~executeThree
     * @param {EventListener|Array<EventListener>} handler
     * @paran {external:boolean} isFunction
     * @param {Emitter} emitter
     * @param {*} arg1
     * @param {*} arg2
     * @param {*} arg3
     */
    function executeThree(handler, isFunction, emitter, arg1, arg2, arg3) {
        var errors = [];

        if (isFunction) {
            try {
                handler.call(emitter, arg1, arg2, arg3);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice(),
                i = 0;

            for (; i < length; i += 1) {
                try {
                    listeners[i].call(emitter, arg1, arg2, arg3);
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
     * @function Emitter~executeMany
     * @param {EventListener|Array<EventListener>} handler
     * @paran {external:boolean} isFunction
     * @param {Emitter} emitter
     * @param {external:Array} args
     */
    function executeMany(handler, isFunction, emitter, args) {
        var errors = [];

        if (isFunction) {
            try {
                handler.apply(emitter, args);
            } catch (error) {
                errors.push(error);
            }
        } else {
            var length = handler.length,
                listeners = handler.slice(),
                i = 0;

            for (; i < length; i += 1) {
                try {
                    listeners[i].apply(emitter, args);
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
                executeEmpty(listener, isFunction, scope);
                break;
            case 1:
                executeOne(listener, isFunction, scope, data[0]);
                break;
            case 2:
                executeTwo(listener, isFunction, scope, data[0], data[1]);
                break;
            case 3:
                executeThree(listener, isFunction, scope, data[0], data[1], data[2]);
                break;
            default:
                executeMany(listener, isFunction, scope, data);
                break;
        }
    }

    /**
     * Checks whether or not a value is a positive number.
     * @function Emitter~isPositiveNumber
     * @param {*} number
     * @returns {external:boolean} Whether or not the value is a positive number.
     */
    function isPositiveNumber(number) {
        return typeof number === 'number' && number >= 0 && !isNaN(number);
    }

    /**
     * @function Emitter~onEvent
     * @param {Emitter} emitter
     * @param {EventType} type type
     * @param {EventListener} listener
     * @param {external:boolean} prepend
     */
    function onEvent(emitter, type, listener, prepend) {
        if (typeof listener !== 'function') {
            throw new TypeError('listener must be a function');
        }

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
                prepend ? _events[type].unshift(listener) : _events[type].push(listener);

                // Transition from single to multiple listeners
            } else {
                    _events[type] = prepend ? [listener, _events[type]] : [_events[type], listener];
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
     * A functional mixin that provides the Emitter.js API to its target. The `constructor()`, `destroy()`, `toJSON()`, and `toString()` and static properties on `Emitter` are not provided. This mixin is used to populate the `prototype` of `Emitter`.
     * 
     * Like all functional mixins, this should be executed with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call|`call()`} or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply|`apply()`}.
     * @mixin Emitter.asEmitter
     * @example <caption>Creating an Emitter from an empty object</caption>
     * // Create a base object
     * const greeter = Object.create( null ),
     *  eAPI = Emitter.API;
     * 
     * // Initialize the mixin
     * Emitter.asEmitter.call( greeter );
     * greeter[ eAPI.defineEvents ]();
     * greeter[ eAPI.defineMaxListeners ]( 10 );
     * 
     * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
     * greeter.emit( 'hello', 'World' );
     * // Hello, World!
     * @example <caption>Epic fail</caption>
     * // NO!!!
     * Emitter.asEmitter(); // Madness ensues
     */
    function asEmitter() {

        /**
        * Remove all listeners, or those for the specified event `type`.
        * @function Emitter.asEmitter.clear
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
            var handler;

            // No Events
            if (!this[$events]) {
                return this;
            }

            // With no "off" listeners, clearing can be simplified
            if (!this[$events][':off']) {
                if (arguments.length === 0) {
                    this[$events] = new Container();
                } else if (this[$events][type]) {
                    delete this[$events][type];
                }

                return this;
            }

            // Clear all listeners
            if (arguments.length === 0) {
                var types = Object.keys(this[$events]);

                // Avoid removing "off" listeners until all other types have been removed
                for (var i = 0, length = types.length; i < length; i += 1) {
                    if (types[i] === ':off') {
                        continue;
                    }

                    this.clear(types[i]);
                }

                // Manually clear "off"
                this.clear(':off');

                this[$events] = new Container();

                return this;
            }

            handler = this[$events][type];

            if (typeof handler === 'function') {
                this.off(type, handler);
            } else if (Array.isArray(handler)) {
                var index = handler.length;

                while (index--) {
                    this.off(type, handler[index]);
                }
            }

            delete this[$events][type];

            return this;
        };

        /**
        * Defines the internal event registry if it does not exist and creates `destroyEvents()`. This is called within the `constructor()` and does not need to be called if using `Emitter` directly.
        * 
        * When using `Emitter.asEmitter()`, this should be used to initialize the registry of the target object. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.
        * @protected
        * @function Emitter.asEmitter.@@defineEvents
        * @param {external:Object} [bindings]
        * @example <caption>Define the event registry</caption>
        * // Create a base object
        * const greeter = Object.create( null ),
        *  eAPI = Emitter.API;
        * 
        * // Initialize the mixin
        * Emitter.asEmitter.call( greeter );
        * greeter[ eAPI.defineEvents ]();
        * greeter[ eAPI.defineMaxListeners ]( 10 );
        * 
        * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
        * greeter.emit( 'hello', 'World' );
        * // Hello, World!
        * @example <caption>Define the event registry and register predefine events</caption>
        * const // Predefined events
        *  greetings = {
        *      hello: function( name ){ console.log( `Hello, ${name}!` ),
        *      hi: function( name ){ console.log( `Hi, ${name}!` )
        *  },
        *
        *  // Create a base object
        *  greeter = Object.create( null ),
        *  
        *  eAPI = Emitter.API;
        * 
        * // Initialize the mixin
        * Emitter.asEmitter.call( greeter );
        * greeter[ eAPI.defineEvents ]( greetings );
        * greeter[ eAPI.defineMaxListeners ]( 10 );
        * 
        * greeter.emit( 'hello', 'Aaron' );
        * // Hello, Aaron!
        */
        this[API.defineEvents] = function (bindings) {
            if (!this[$events] || this[$events] === Object.getPrototypeOf(this)[$events]) {
                this[$events] = new Container();
            }

            /**
             * @protected
             * @function Emitter.asEmitter.@@destroyEvents
             */
            this[API.destroyEvents] = function () {
                if ($events in this) {
                    this.clear();
                    delete this[$events];
                }
                this[API.defineEvents] = this[API.destroyEvents] = noop;
            };

            if ((typeof bindings === 'undefined' ? 'undefined' : _typeof(bindings)) === 'object') {
                this.on(bindings);
            }
        };

        /**
         * @protected
         * @function Emitter.asEmitter.@@defineMaxListeners
         * @param {external:number} defaultMaxListeners
         */
        this[API.defineMaxListeners] = function (defaultMaxListeners) {
            if (!isPositiveNumber(defaultMaxListeners)) {
                throw new TypeError('defaultMaxListeners must be a positive number');
            }

            /**
             * Protected default max listeners property
             * @protected
             * @member {external:number} Emitter#@@defaultMaxListeners
             */
            this[$defaultMaxListeners] = defaultMaxListeners;

            /**
             * Protected max listeners property
             * @protected
             * @member {external:number} Emitter#@@maxListeners
             */
            this[$maxListeners] = this[$maxListeners] || undefined;

            /**
             * Public max listeners property
             * @member {external:number} Emitter#maxListeners
             */
            Object.defineProperty(this, 'maxListeners', {
                get: this[API.getMaxListeners],
                set: this[API.setMaxListeners],
                configurable: true,
                enumerable: false
            });

            /**
             * @protected
             * @function Emitter.asEmitter.@@destroyMaxListeners
             */
            this[API.destroyMaxListeners] = function () {
                if ($maxListeners in this) {
                    delete this[$defaultMaxListeners];
                    delete this.maxListeners;
                    delete this[$maxListeners];
                }
                this[API.defineMaxListeners] = this[API.destroyMaxListeners] = noop;
            };
        };

        /**
         * Execute the listeners for the specified event `type` with the supplied arguments.
         * 
         * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
         * 
         * Returns `true` if the event had listeners, `false` otherwise.
         * @function Emitter.asEmitter.emit
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

            return this.trigger(type, data);
        };

        /**
         * @function Emitter.asEmitter.eventTypes
         * @returns {Array<external:string>} The list of event types registered to the emitter.
         */
        this.eventTypes = function () {
            return Object.keys(this[$events]);
        };

        /**
         * @function Emitter.asEmitter.first
         * @param {EventType} type The event type.
         * @param {EventListener} listener The event listener.
         * @returns {Emitter} The emitter.
         */
        this.first = function (type, listener) {
            onEvent(this, type, listener, false);
            return this;
        };

        /**
         * @protected
         * @function Emitter.asEmitter.@@getMaxListeners
         * @returns {external:number} The maximum number of listeners.
         */
        this[API.getMaxListeners] = function () {
            return typeof this[$maxListeners] !== 'undefined' ? this[$maxListeners] : this[$defaultMaxListeners];
        };

        /**
         * @function Emitter.asEmitter.listenerCount
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
            var count;

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
         * @function Emitter.asEmitter.listeners
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
            var listeners;

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
         * @function Emitter.asEmitter.many
         * @param {EventType} type The event type.
         * @param {external:number} times The number times the listener will be executed before being removed.
         * @param {EventListener} listener The event listener.
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

            if (typeof times !== 'number') {
                throw new TypeError('times must be a number');
            }

            if (typeof listener !== 'function') {
                throw new TypeError('listener must be a function');
            }

            function manyListener() {
                listener.apply(this, arguments);
                return --times === 0;
            }

            manyListener.listener = listener;

            return this.until(type, manyListener);
        };

        /**
         * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
         * 
         * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
         * @function Emitter.asEmitter.off
         * @param {EventType} type The event type.
         * @param {EventListener} listener The event listener.
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

            var handler;

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

            handler = this[$events][type];

            if (handler === listener || typeof handler.listener === 'function' && handler.listener === listener) {
                delete this[$events][type];
                if (this[$events][':off']) {
                    emitEvent(this, ':off', [type, listener], true);
                }
            } else if (Array.isArray(handler)) {
                var index = -1;

                for (var i = handler.length; i-- > 0;) {
                    if (handler[i] === listener || handler[i].listener && handler[i].listener === listener) {
                        index = i;
                        break;
                    }
                }

                if (index < 0) {
                    return this;
                }

                if (handler.length === 1) {
                    handler.length = 0;
                    delete this[$events][type];
                } else {
                    spliceList(handler, index);
                }

                if (this[$events][':off']) {
                    emitEvent(this, ':off', [type, listener], true);
                }
            }

            return this;
        };

        /**
         * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
         * 
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @function Emitter.asEmitter.on
         * @param {EventType} [type] The event type.
         * @param {EventListener} listener The event listener.
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
                        var bindings = type,
                            types = Object.keys(bindings),
                            typeIndex = 0,
                            typeLength = types.length,
                            handler,
                            handlerIndex,
                            handlerLength;

                        for (; typeIndex < typeLength; typeIndex += 1) {
                            type = types[typeIndex];
                            handler = bindings[type];

                            // List of listeners
                            if (Array.isArray(handler)) {
                                handlerIndex = 0;
                                handlerLength = handler.length;

                                for (; handlerIndex < handlerLength; handlerIndex += 1) {
                                    onEvent(this, type, handler[handlerIndex], false);
                                }

                                // Single listener
                            } else {
                                    onEvent(this, type, handler, false);
                                }
                        }

                        return this;
                    }
            }

            onEvent(this, type, listener, false);

            return this;
        };

        /**
         * @function Emitter.asEmitter.once
         * @param {EventType} [type] The event type.
         * @param {EventListener} listener
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

            return this.many(type, 1, listener);
        };

        /**
         * @protected
         * @function Emitter.asEmitter.@@setMaxListeners
         * @param {external:number} max The maximum number of listeners.
         * @returns {Emitter} The emitter.
         */
        this[API.setMaxListeners] = function (max) {
            if (!isPositiveNumber(max)) {
                throw new TypeError('max must be a positive number');
            }

            this[$maxListeners] = max;

            return this;
        };

        /**
         * Execute the listeners for the specified event `type` with the supplied `data`.
         * 
         * Returns `true` if the event had listeners, `false` otherwise.
         * @function Emitter.asEmitter.trigger
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

            var executed = false,

            // If type is not a string, index will be false
            index = typeof type === 'string' && type.lastIndexOf(':');

            // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"
            while (index > 0) {
                executed = type && emitEvent(this, type, data, false) || executed;
                type = type.substring(0, index);
                index = type.lastIndexOf(':');
            }

            // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )
            executed = type && emitEvent(this, type, data, true) || executed;

            return executed;
        };

        /**
         * Adds a listeners for the specified event `type` that will be triggered *until* the `listener` returns `true`. If no `type` is given the listener will be triggered any event `type`.
         * 
         * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
         * @function Emitter.asEmitter.until
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

            function untilListener() {
                var done = listener.apply(this, arguments);
                if (done === true) {
                    this.off(type, untilListener);
                }
            }

            // TODO Check beyond just one level of listener references
            untilListener.listener = listener.listener || listener;

            onEvent(this, type, untilListener, false);

            return this;
        };
    }

    /**
     * Creates an instance of emitter. If `bindings` are provided they will automatically be passed into `on()` once construction is complete.
     * @class Emitter
     * @classdesc An object that emits named events which cause functions to be executed.
     * @extends null
     * @mixes Emitter.asEmitter
     * @param {external:Object} [bindings] A mapping of event types to event listeners.
     * @see {@link https://github.com/nodejs/node/blob/master/lib/events.js}
     * @example <caption>Using Emitter directly</caption>
     * const greeter = new Emitter();
     * greeter.on( 'hello', () => console.log( 'Hello!' ) );
     * greeter.emit( 'hello' );
     * // Hello!
     * @example <caption>Inheriting from Emitter</caption>
     * function Greeter(){
     *  Emitter.call( this );
     * 
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
    function Emitter(bindings) {
        this[API.defineMaxListeners](Emitter.defaultMaxListeners);
        this[API.defineEvents](bindings);
    }

    Object.defineProperties(Emitter, {
        API: {
            value: API,
            configurable: true,
            enumerable: false,
            writable: false
        },
        asEmitter: {
            value: asEmitter,
            configurable: true,
            enumerable: false,
            writable: false
        },
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

    Emitter.prototype = new Container();

    Emitter.prototype[Symbol.toStringTag] = 'Emitter';

    Emitter.prototype.constructor = Emitter;

    Emitter.asEmitter.call(Emitter.prototype);

    /**
     * Destroys the emitter.
     * @fires Emitter#:destroy
     */
    Emitter.prototype.destroy = function () {
        emitEvent(this, ':destroy', [], true);
        this[API.destroyEvents]();
        this[API.destroyMaxListeners]();
        this.destroy = this.clear = this.emit = this.first = this.listenerCount = this.listeners = this.many = this.off = this.on = this.once = this.trigger = this.until = noop;
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
        var json = new Container(),
            types = Object.keys(this[$events]),
            length = types.length,
            index = 0,
            type;

        json.maxListeners = this.maxListeners;
        json.listenerCount = new Container();

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
//# sourceMappingURL=data:application/json;base64,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QUFMLENBQWlCLElBQXJCLFNBQStCLEtBQUssU0FBTCxDQUFnQixLQUFLLE1BQUwsRUFBaEIsQ0FBL0IsRUFBa0UsSUFBbEUsRUFBUDtBQUNILEtBRkQiLCJmaWxlIjoiZW1pdHRlci11bWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogSmF2YVNjcmlwdCBBcnJheVxuICogQGV4dGVybmFsIEFycmF5XG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheX1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cbiAqIEBleHRlcm5hbCBib29sZWFuXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Cb29sZWFufVxuICovIFxuXG4vKipcbiAqIEphdmFTY3JpcHQgRXJyb3JcbiAqIEBleHRlcm5hbCBFcnJvclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRXJyb3J9XG4gKi8gXG5cbi8qKlxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxuICogQGV4dGVybmFsIEZ1bmN0aW9uXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcbiAqIEBleHRlcm5hbCBudW1iZXJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL051bWJlcn1cbiAqLyBcbiBcbi8qKlxuICogSmF2YVNjcmlwdCBPYmplY3RcbiAqIEBleHRlcm5hbCBPYmplY3RcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL2V4dGVybmFsOk9iamVjdH1cbiAqLyBcblxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN0cmluZ1xuICogQGV4dGVybmFsIHN0cmluZ1xuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nfVxuICovIFxuIFxuLyoqXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1ByaW1pdGl2ZXxwcmltaXRpdmV9IHN5bWJvbFxuICogQGV4dGVybmFsIHN5bWJvbFxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3ltYm9sfVxuICovIFxuXG4vKipcbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpzdHJpbmd8ZXh0ZXJuYWw6c3ltYm9sfSBFdmVudFR5cGVcbiAqLyBcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGJvdW5kIHRvIGFuIGVtaXR0ZXIgZXZlbnQuIEFueSBkYXRhIHRyYW5zbWl0dGVkIHdpdGggdGhlIGV2ZW50IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVyIGFzIGFyZ3VtZW50cy5cbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpGdW5jdGlvbn0gRXZlbnRMaXN0ZW5lclxuICogQHBhcmFtIHsuLi4qfSBkYXRhIFRoZSBhcmd1bWVudHMgcGFzc2VkIGJ5IHRoZSBgZW1pdGAuXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYW4gZW1pdHRlciBkZXN0cm95cyBpdHNlbGYuXG4gKiBAZXZlbnQgRW1pdHRlciM6ZGVzdHJveVxuICovIFxuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYWZ0ZXJfIGEgbGlzdGVuZXIgaXMgcmVtb3ZlZC5cbiAqIEBldmVudCBFbWl0dGVyIzpvZmZcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcbiAqIEB0eXBlIHtleHRlcm5hbDpGdW5jdGlvbn0gbGlzdGVuZXJcbiAqL1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZW1pdHRlZCBfYmVmb3JlXyBhIGxpc3RlbmVyIGlzIGFkZGVkLlxuICogQGV2ZW50IEVtaXR0ZXIjOm9uXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6c3RyaW5nfSB0eXBlXG4gKiBAdHlwZSB7ZXh0ZXJuYWw6RnVuY3Rpb259IGxpc3RlbmVyXG4gKi9cblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGhhcyBiZWVuIGV4Y2VlZGVkIGZvciBhbiBldmVudCB0eXBlLlxuICogQGV2ZW50IEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICogQHR5cGUge2V4dGVybmFsOnN0cmluZ30gdHlwZVxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxuICovXG5cbi8vIEluc3RhbnRpYXRpbmcgdGhpcyBpcyBmYXN0ZXIgdGhhbiBleHBsaWNpdGx5IGNhbGxpbmcgYE9iamVjdC5jcmVhdGUoIG51bGwgKWAgdG8gZ2V0IGEgXCJjbGVhblwiIGVtcHR5IG9iamVjdFxuZnVuY3Rpb24gQ29udGFpbmVyKCl7fVxuQ29udGFpbmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcblxudmFyXG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RhbnQge2V4dGVybmFsOk9iamVjdH0gRW1pdHRlci5BUElcbiAgICAgKiBAcHJvcGVydHkge2V4dGVybmFsOnN5bWJvbH0gZGVmaW5lRXZlbnRzIFJlZmVyZW5jZSB0byB7QGxpbmsgRW1pdHRlciNkZWZpbmVFdmVudHN9XG4gICAgICogQHByb3BlcnR5IHtleHRlcm5hbDpzeW1ib2x9IGRlZmluZU1heExpc3RlbmVycyBSZWZlcmVuY2UgdG8ge0BsaW5rIEVtaXR0ZXIjZGVmaW5lTWF4TGlzdGVuZXJzfVxuICAgICAqIEBwcm9wZXJ0eSB7ZXh0ZXJuYWw6c3ltYm9sfSBkZXN0cm95RXZlbnRzIFJlZmVyZW5jZSB0byB7QGxpbmsgRW1pdHRlciNkZXN0cm95RXZlbnRzfVxuICAgICAqIEBwcm9wZXJ0eSB7ZXh0ZXJuYWw6c3ltYm9sfSBkZXN0cm95TWF4TGlzdGVuZXJzIFJlZmVyZW5jZSB0byB7QGxpbmsgRW1pdHRlciNkZXN0cm95TWF4TGlzdGVuZXJzfVxuICAgICAqIEBwcm9wZXJ0eSB7ZXh0ZXJuYWw6c3ltYm9sfSBnZXRNYXhMaXN0ZW5lcnMgUmVmZXJlbmNlIHRvIHtAbGluayBFbWl0dGVyI2dldE1heExpc3RlbmVyc31cbiAgICAgKiBAcHJvcGVydHkge2V4dGVybmFsOnN5bWJvbH0gc2V0TWF4TGlzdGVuZXJzIFJlZmVyZW5jZSB0byB7QGxpbmsgRW1pdHRlciNzZXRNYXhMaXN0ZW5lcnN9XG4gICAgICovXG4gICAgQVBJID0ge1xuICAgICAgICBkZWZpbmVFdmVudHMgICAgICAgIDogU3ltYm9sKCAnQEBkZWZpbmVFdmVudHMnICksXG4gICAgICAgIGRlZmluZU1heExpc3RlbmVycyAgOiBTeW1ib2woICdAQGRlZmluZU1heExpc3RlbmVycycgKSxcbiAgICAgICAgZGVzdHJveUV2ZW50cyAgICAgICA6IFN5bWJvbCggJ0BAZGVzdHJveUV2ZW50cycgKSxcbiAgICAgICAgZGVzdHJveU1heExpc3RlbmVycyA6IFN5bWJvbCggJ0BAZGVzdHJveU1heExpc3RlbmVycycgKSxcbiAgICAgICAgZ2V0TWF4TGlzdGVuZXJzICAgICA6IFN5bWJvbCggJ0BAZ2V0TWF4TGlzdGVuZXJzJyApLFxuICAgICAgICBzZXRNYXhMaXN0ZW5lcnMgICAgIDogU3ltYm9sKCAnQEBzZXRNYXhMaXN0ZW5lcnMnIClcbiAgICB9LFxuICAgIFxuICAgICRkZWZhdWx0TWF4TGlzdGVuZXJzICAgID0gU3ltYm9sKCAnQEBkZWZhdWx0TWF4TGlzdGVuZXJzJyApLFxuICAgICRldmVudHMgICAgICAgICAgICAgICAgID0gU3ltYm9sKCAnQEBldmVudHMnICksXG4gICAgJGV2ZXJ5ICAgICAgICAgICAgICAgICAgPSBTeW1ib2woICdAQGV2ZXJ5JyApLFxuICAgICRtYXhMaXN0ZW5lcnMgICAgICAgICAgID0gU3ltYm9sKCAnQEBtYXhMaXN0ZW5lcnMnICksXG4gICAgXG4gICAgbm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuXG4vLyBNYW55IG9mIHRoZXNlIGZ1bmN0aW9ucyBhcmUgYnJva2VuIG91dCBmcm9tIHRoZSBwcm90b3R5cGUgZm9yIHRoZSBzYWtlIG9mIG9wdGltaXphdGlvbi4gVGhlIGZ1bmN0aW9ucyBvbiB0aGUgcHJvdG95dHlwZVxuLy8gdGFrZSBhIHZhcmlhYmxlIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBhcyBhIHJlc3VsdC4gVGhlc2UgZnVuY3Rpb25zIGhhdmUgYSBmaXhlZCBudW1iZXIgb2YgYXJndW1lbnRzXG4vLyBhbmQgdGhlcmVmb3JlIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQuXG5cbi8qKlxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEVycm9yc1xuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBgZXJyb3JzYCB3aWxsIGJlIGVtaXR0ZWQuXG4gKiBAcGFyYW0ge0FycmF5PGV4dGVybmFsOkVycm9yPn0gZXJyb3JzIFRoZSBhcnJheSBvZiBlcnJvcnMgdG8gYmUgZW1pdHRlZC5cbiAqL1xuZnVuY3Rpb24gZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICl7XG4gICAgZm9yKCB2YXIgaSA9IDAsIGxlbmd0aCA9IGVycm9ycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkgKz0gMSApe1xuICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICdlcnJvcicsIFsgZXJyb3JzWyBpIF0gXSApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5lbWl0RXZlbnRcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YSBUaGUgZGF0YSB0byBiZSBwYXNzZWQgd2l0aCB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGVtaXRFdmVyeSBXaGV0aGVyIG9yIG5vdCBsaXN0ZW5lcnMgZm9yIGFsbCB0eXBlcyB3aWxsIGJlIGV4ZWN1dGVkLlxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cbiAqIEB0aHJvd3Mge2V4dGVybmFsOkVycm9yfSBJZiBgdHlwZWAgaXMgYGVycm9yYCBhbmQgbm8gbGlzdGVuZXJzIGFyZSBzdWJzY3JpYmVkLlxuICovXG5mdW5jdGlvbiBlbWl0RXZlbnQoIGVtaXR0ZXIsIHR5cGUsIGRhdGEsIGVtaXRFdmVyeSApe1xuICAgIHZhciBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdLFxuICAgICAgICBleGVjdXRlZCA9IGZhbHNlLFxuICAgICAgICBsaXN0ZW5lcjtcbiAgICBcbiAgICBpZiggdHlwZSA9PT0gJ2Vycm9yJyAmJiAhX2V2ZW50cy5lcnJvciApe1xuICAgICAgICB2YXIgZXJyb3IgPSBkYXRhWyAwIF07XG4gICAgICAgIFxuICAgICAgICBpZiggZXJyb3IgaW5zdGFuY2VvZiBFcnJvciApe1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBmb3IgdGhlIGdpdmVuIHR5cGUgb2YgZXZlbnRcbiAgICBsaXN0ZW5lciA9IF9ldmVudHNbIHR5cGUgXTtcbiAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XG4gICAgICAgIGV4ZWN1dGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8gRXhlY3V0ZSBsaXN0ZW5lcnMgbGlzdGVuaW5nIGZvciBhbGwgdHlwZXMgb2YgZXZlbnRzXG4gICAgaWYoIGVtaXRFdmVyeSApe1xuICAgICAgICBsaXN0ZW5lciA9IF9ldmVudHNbICRldmVyeSBdO1xuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgZW1pdHRlciApO1xuICAgICAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBleGVjdXRlZDtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBubyBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlRW1wdHlcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlclxuICogQHBhcmFuIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZUVtcHR5KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyICl7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaSA8IGxlbmd0aDsgaSArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaSBdLmNhbGwoIGVtaXR0ZXIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG9uZSBhcmd1bWVudC5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVPbmVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlclxuICogQHBhcmFuIHtleHRlcm5hbDpib29sZWFufSBpc0Z1bmN0aW9uXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7Kn0gYXJnMVxuICovXG5mdW5jdGlvbiBleGVjdXRlT25lKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxICl7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaSA8IGxlbmd0aDsgaSArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaSBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHR3byBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlVHdvXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXJcbiAqIEBwYXJhbiB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvblxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyXG4gKiBAcGFyYW0geyp9IGFyZzFcbiAqIEBwYXJhbSB7Kn0gYXJnMlxuICovXG5mdW5jdGlvbiBleGVjdXRlVHdvKCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmcxLCBhcmcyICl7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGhhbmRsZXIubGVuZ3RoLFxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IoIDsgaSA8IGxlbmd0aDsgaSArPSAxICl7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaSBdLmNhbGwoIGVtaXR0ZXIsIGFyZzEsIGFyZzIgKTtcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIHRocmVlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVUaHJlZVxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyXG4gKiBAcGFyYW4ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb25cbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlclxuICogQHBhcmFtIHsqfSBhcmcxXG4gKiBAcGFyYW0geyp9IGFyZzJcbiAqIEBwYXJhbSB7Kn0gYXJnM1xuICovXG5mdW5jdGlvbiBleGVjdXRlVGhyZWUoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIsIGFyZzEsIGFyZzIsIGFyZzMgKXtcbiAgICB2YXIgZXJyb3JzID0gW107XG4gICAgXG4gICAgaWYoIGlzRnVuY3Rpb24gKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCksXG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciggOyBpIDwgbGVuZ3RoOyBpICs9IDEgKXtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpIF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhIGxpc3RlbmVyIHdpdGggZm91ciBvciBtb3JlIGFyZ3VtZW50cy5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmV4ZWN1dGVNYW55XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ8QXJyYXk8RXZlbnRMaXN0ZW5lcj59IGhhbmRsZXJcbiAqIEBwYXJhbiB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvblxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBhcmdzXG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGVNYW55KCBoYW5kbGVyLCBpc0Z1bmN0aW9uLCBlbWl0dGVyLCBhcmdzICl7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIFxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKSxcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yKCA7IGkgPCBsZW5ndGg7IGkgKz0gMSApe1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGkgXS5hcHBseSggZW1pdHRlciwgYXJncyApO1xuICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggZXJyb3JzLmxlbmd0aCApe1xuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcbiAgICB9XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBsaXN0ZW5lciB1c2luZyB0aGUgaW50ZXJuYWwgYGV4ZWN1dGUqYCBmdW5jdGlvbnMgYmFzZWQgb24gdGhlIG51bWJlciBvZiBhcmd1bWVudHMuXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlTGlzdGVuZXJcbiAqIEBwYXJhbSB7QXJyYXk8TGlzdGVuZXI+fExpc3RlbmVyfSBsaXN0ZW5lclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gZGF0YVxuICogQHBhcmFtIHsqfSBzY29wZVxuICovIFxuZnVuY3Rpb24gZXhlY3V0ZUxpc3RlbmVyKCBsaXN0ZW5lciwgZGF0YSwgc2NvcGUgKXtcbiAgICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJztcbiAgICBcbiAgICBzd2l0Y2goIGRhdGEubGVuZ3RoICl7XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGV4ZWN1dGVFbXB0eSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGV4ZWN1dGVPbmUgICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZXhlY3V0ZVR3byAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0sIGRhdGFbIDEgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGV4ZWN1dGVUaHJlZSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0sIGRhdGFbIDIgXSApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBleGVjdXRlTWFueSAgICAgKCBsaXN0ZW5lciwgaXNGdW5jdGlvbiwgc2NvcGUsIGRhdGEgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmlzUG9zaXRpdmVOdW1iZXJcbiAqIEBwYXJhbSB7Kn0gbnVtYmVyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxuICovXG5mdW5jdGlvbiBpc1Bvc2l0aXZlTnVtYmVyKCBudW1iZXIgKXtcbiAgICByZXR1cm4gdHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicgJiYgbnVtYmVyID49IDAgJiYgIWlzTmFOKCBudW1iZXIgKTtcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5vbkV2ZW50XG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXJcbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIHR5cGVcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gcHJlcGVuZFxuICovXG5mdW5jdGlvbiBvbkV2ZW50KCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCApe1xuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIF9ldmVudHMgPSBlbWl0dGVyWyAkZXZlbnRzIF07XG4gICAgXG4gICAgaWYoIF9ldmVudHNbICc6b24nIF0gKXtcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm9uJywgWyB0eXBlLCB0eXBlb2YgbGlzdGVuZXIubGlzdGVuZXIgPT09ICdmdW5jdGlvbicgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEVtaXR0aW5nIFwib25cIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cbiAgICAgICAgX2V2ZW50c1sgJzpvbicgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzpvbicgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgaWYoICFfZXZlbnRzWyB0eXBlIF0gKXtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gbGlzdGVuZXI7XG4gICAgXG4gICAgLy8gTXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBfZXZlbnRzWyB0eXBlIF0gKSApe1xuICAgICAgICBwcmVwZW5kID9cbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS51bnNoaWZ0KCBsaXN0ZW5lciApIDpcbiAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5wdXNoKCBsaXN0ZW5lciApO1xuICAgIFxuICAgIC8vIFRyYW5zaXRpb24gZnJvbSBzaW5nbGUgdG8gbXVsdGlwbGUgbGlzdGVuZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gcHJlcGVuZCA/XG4gICAgICAgICAgICBbIGxpc3RlbmVyLCBfZXZlbnRzWyB0eXBlIF0gXSA6XG4gICAgICAgICAgICBbIF9ldmVudHNbIHR5cGUgXSwgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgXG4gICAgLy8gVHJhY2sgd2FybmluZ3MgaWYgbWF4IGxpc3RlbmVycyBpcyBhdmFpbGFibGVcbiAgICBpZiggJ21heExpc3RlbmVycycgaW4gZW1pdHRlciAmJiAhX2V2ZW50c1sgdHlwZSBdLndhcm5lZCApe1xuICAgICAgICB2YXIgbWF4ID0gZW1pdHRlci5tYXhMaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggbWF4ICYmIG1heCA+IDAgJiYgX2V2ZW50c1sgdHlwZSBdLmxlbmd0aCA+IG1heCApe1xuICAgICAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnOm1heExpc3RlbmVycycsIFsgdHlwZSwgbGlzdGVuZXIgXSwgdHJ1ZSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBFbWl0dGluZyBcIm1heExpc3RlbmVyc1wiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxuICAgICAgICAgICAgX2V2ZW50c1sgJzptYXhMaXN0ZW5lcnMnIF0gPSBlbWl0dGVyWyAkZXZlbnRzIF1bICc6bWF4TGlzdGVuZXJzJyBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBlbWl0dGVyWyAkZXZlbnRzIF0gPSBfZXZlbnRzO1xufVxuXG4vKipcbiAqIEZhc3RlciB0aGFuIGBBcnJheS5wcm90b3R5cGUuc3BsaWNlYFxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c3BsaWNlTGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gbGlzdFxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XG4gKi8gXG5mdW5jdGlvbiBzcGxpY2VMaXN0KCBsaXN0LCBpbmRleCApe1xuICAgIGZvciggdmFyIGkgPSBpbmRleCwgaiA9IGkgKyAxLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaiA8IGxlbmd0aDsgaSArPSAxLCBqICs9IDEgKXtcbiAgICAgICAgbGlzdFsgaSBdID0gbGlzdFsgaiBdO1xuICAgIH1cbiAgICBcbiAgICBsaXN0LnBvcCgpO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb25hbCBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byBpdHMgdGFyZ2V0LiBUaGUgYGNvbnN0cnVjdG9yKClgLCBgZGVzdHJveSgpYCwgYHRvSlNPTigpYCwgYW5kIGB0b1N0cmluZygpYCBhbmQgc3RhdGljIHByb3BlcnRpZXMgb24gYEVtaXR0ZXJgIGFyZSBub3QgcHJvdmlkZWQuIFRoaXMgbWl4aW4gaXMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgYHByb3RvdHlwZWAgb2YgYEVtaXR0ZXJgLlxuICogXG4gKiBMaWtlIGFsbCBmdW5jdGlvbmFsIG1peGlucywgdGhpcyBzaG91bGQgYmUgZXhlY3V0ZWQgd2l0aCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vY2FsbHxgY2FsbCgpYH0gb3Ige0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2FwcGx5fGBhcHBseSgpYH0uXG4gKiBAbWl4aW4gRW1pdHRlci5hc0VtaXR0ZXJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkNyZWF0aW5nIGFuIEVtaXR0ZXIgZnJvbSBhbiBlbXB0eSBvYmplY3Q8L2NhcHRpb24+XG4gKiAvLyBDcmVhdGUgYSBiYXNlIG9iamVjdFxuICogY29uc3QgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKSxcbiAqICBlQVBJID0gRW1pdHRlci5BUEk7XG4gKiBcbiAqIC8vIEluaXRpYWxpemUgdGhlIG1peGluXG4gKiBFbWl0dGVyLmFzRW1pdHRlci5jYWxsKCBncmVldGVyICk7XG4gKiBncmVldGVyWyBlQVBJLmRlZmluZUV2ZW50cyBdKCk7XG4gKiBncmVldGVyWyBlQVBJLmRlZmluZU1heExpc3RlbmVycyBdKCAxMCApO1xuICogXG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAqIC8vIEhlbGxvLCBXb3JsZCFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkVwaWMgZmFpbDwvY2FwdGlvbj5cbiAqIC8vIE5PISEhXG4gKiBFbWl0dGVyLmFzRW1pdHRlcigpOyAvLyBNYWRuZXNzIGVuc3Vlc1xuICovXG5mdW5jdGlvbiBhc0VtaXR0ZXIoKXtcbiAgICBcbiAgICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIuY2xlYXJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqIGdyZWV0ZXIuY2xlYXIoKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oIHtcbiAgICAgKiAgJ2hlbGxvJyA6IGZ1bmN0aW9uKCl7IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApOyB9LFxuICAgICAqICAnaGknICAgIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIaSEnICk7IH1cbiAgICAgKiB9ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gSGVsbG8hXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICk7XG4gICAgICogLy8gSGkhXG4gICAgICogZ3JlZXRlci5jbGVhciggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xuICAgICAqIC8vIEhpIVxuICAgICAqL1xuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbiggdHlwZSApe1xuICAgICAgICB2YXIgaGFuZGxlcjtcbiAgICAgICAgXG4gICAgICAgIC8vIE5vIEV2ZW50c1xuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFdpdGggbm8gXCJvZmZcIiBsaXN0ZW5lcnMsIGNsZWFyaW5nIGNhbiBiZSBzaW1wbGlmaWVkXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgQ29udGFpbmVyKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYoIHRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRldmVudHMgXVsgdHlwZSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2xlYXIgYWxsIGxpc3RlbmVyc1xuICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xuICAgICAgICAgICAgdmFyIHR5cGVzID0gT2JqZWN0LmtleXMoIHRoaXNbICRldmVudHMgXSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBdm9pZCByZW1vdmluZyBcIm9mZlwiIGxpc3RlbmVycyB1bnRpbCBhbGwgb3RoZXIgdHlwZXMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwLCBsZW5ndGggPSB0eXBlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkgKz0gMSApe1xuICAgICAgICAgICAgICAgIGlmKCB0eXBlc1sgaSBdID09PSAnOm9mZicgKXtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoIHR5cGVzWyBpIF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTWFudWFsbHkgY2xlYXIgXCJvZmZcIlxuICAgICAgICAgICAgdGhpcy5jbGVhciggJzpvZmYnICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBDb250YWluZXIoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhpcy5vZmYoIHR5cGUsIGhhbmRsZXIgKTtcbiAgICAgICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGhhbmRsZXIubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSggaW5kZXgtLSApe1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmKCB0eXBlLCBoYW5kbGVyWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgIC8qKlxuICAgICAqIERlZmluZXMgdGhlIGludGVybmFsIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0IGFuZCBjcmVhdGVzIGBkZXN0cm95RXZlbnRzKClgLiBUaGlzIGlzIGNhbGxlZCB3aXRoaW4gdGhlIGBjb25zdHJ1Y3RvcigpYCBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBjYWxsZWQgaWYgdXNpbmcgYEVtaXR0ZXJgIGRpcmVjdGx5LlxuICAgICAqIFxuICAgICAqIFdoZW4gdXNpbmcgYEVtaXR0ZXIuYXNFbWl0dGVyKClgLCB0aGlzIHNob3VsZCBiZSB1c2VkIHRvIGluaXRpYWxpemUgdGhlIHJlZ2lzdHJ5IG9mIHRoZSB0YXJnZXQgb2JqZWN0LiBJZiBgYmluZGluZ3NgIGFyZSBwcm92aWRlZCB0aGV5IHdpbGwgYXV0b21hdGljYWxseSBiZSBwYXNzZWQgaW50byBgb24oKWAgb25jZSBjb25zdHJ1Y3Rpb24gaXMgY29tcGxldGUuXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5AQGRlZmluZUV2ZW50c1xuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSBbYmluZGluZ3NdXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RGVmaW5lIHRoZSBldmVudCByZWdpc3RyeTwvY2FwdGlvbj5cbiAgICAgKiAvLyBDcmVhdGUgYSBiYXNlIG9iamVjdFxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBPYmplY3QuY3JlYXRlKCBudWxsICksXG4gICAgICogIGVBUEkgPSBFbWl0dGVyLkFQSTtcbiAgICAgKiBcbiAgICAgKiAvLyBJbml0aWFsaXplIHRoZSBtaXhpblxuICAgICAqIEVtaXR0ZXIuYXNFbWl0dGVyLmNhbGwoIGdyZWV0ZXIgKTtcbiAgICAgKiBncmVldGVyWyBlQVBJLmRlZmluZUV2ZW50cyBdKCk7XG4gICAgICogZ3JlZXRlclsgZUFQSS5kZWZpbmVNYXhMaXN0ZW5lcnMgXSggMTAgKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkRlZmluZSB0aGUgZXZlbnQgcmVnaXN0cnkgYW5kIHJlZ2lzdGVyIHByZWRlZmluZSBldmVudHM8L2NhcHRpb24+XG4gICAgICogY29uc3QgLy8gUHJlZGVmaW5lZCBldmVudHNcbiAgICAgKiAgZ3JlZXRpbmdzID0ge1xuICAgICAqICAgICAgaGVsbG86IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7bmFtZX0hYCApLFxuICAgICAqICAgICAgaGk6IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGksICR7bmFtZX0hYCApXG4gICAgICogIH0sXG4gICAgICpcbiAgICAgKiAgLy8gQ3JlYXRlIGEgYmFzZSBvYmplY3RcbiAgICAgKiAgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKSxcbiAgICAgKiAgXG4gICAgICogIGVBUEkgPSBFbWl0dGVyLkFQSTtcbiAgICAgKiBcbiAgICAgKiAvLyBJbml0aWFsaXplIHRoZSBtaXhpblxuICAgICAqIEVtaXR0ZXIuYXNFbWl0dGVyLmNhbGwoIGdyZWV0ZXIgKTtcbiAgICAgKiBncmVldGVyWyBlQVBJLmRlZmluZUV2ZW50cyBdKCBncmVldGluZ3MgKTtcbiAgICAgKiBncmVldGVyWyBlQVBJLmRlZmluZU1heExpc3RlbmVycyBdKCAxMCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0Fhcm9uJyApO1xuICAgICAqIC8vIEhlbGxvLCBBYXJvbiFcbiAgICAgKi9cbiAgICB0aGlzWyBBUEkuZGVmaW5lRXZlbnRzIF0gPSBmdW5jdGlvbiggYmluZGluZ3MgKXtcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgdGhpc1sgJGV2ZW50cyBdID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHRoaXMgKVsgJGV2ZW50cyBdICl7XG4gICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgQ29udGFpbmVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5AQGRlc3Ryb3lFdmVudHNcbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbIEFQSS5kZXN0cm95RXZlbnRzIF0gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYoICRldmVudHMgaW4gdGhpcyApe1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpc1sgQVBJLmRlZmluZUV2ZW50cyBdID0gdGhpc1sgQVBJLmRlc3Ryb3lFdmVudHMgXSA9IG5vb3A7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGJpbmRpbmdzID09PSAnb2JqZWN0JyApe1xuICAgICAgICAgICAgdGhpcy5vbiggYmluZGluZ3MgKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5AQGRlZmluZU1heExpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBkZWZhdWx0TWF4TGlzdGVuZXJzXG4gICAgICovXG4gICAgdGhpc1sgQVBJLmRlZmluZU1heExpc3RlbmVycyBdID0gZnVuY3Rpb24oIGRlZmF1bHRNYXhMaXN0ZW5lcnMgKXtcbiAgICAgICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCBkZWZhdWx0TWF4TGlzdGVuZXJzICkgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdkZWZhdWx0TWF4TGlzdGVuZXJzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcm90ZWN0ZWQgZGVmYXVsdCBtYXggbGlzdGVuZXJzIHByb3BlcnR5XG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyI0BAZGVmYXVsdE1heExpc3RlbmVyc1xuICAgICAgICAgKi8gXG4gICAgICAgIHRoaXNbICRkZWZhdWx0TWF4TGlzdGVuZXJzIF0gPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFByb3RlY3RlZCBtYXggbGlzdGVuZXJzIHByb3BlcnR5XG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyI0BAbWF4TGlzdGVuZXJzXG4gICAgICAgICAqLyBcbiAgICAgICAgdGhpc1sgJG1heExpc3RlbmVycyBdID0gdGhpc1sgJG1heExpc3RlbmVycyBdIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQdWJsaWMgbWF4IGxpc3RlbmVycyBwcm9wZXJ0eVxuICAgICAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIjbWF4TGlzdGVuZXJzXG4gICAgICAgICAqL1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHRoaXMsICdtYXhMaXN0ZW5lcnMnLCB7XG4gICAgICAgICAgICBnZXQ6IHRoaXNbIEFQSS5nZXRNYXhMaXN0ZW5lcnMgXSxcbiAgICAgICAgICAgIHNldDogdGhpc1sgQVBJLnNldE1heExpc3RlbmVycyBdLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgfSApO1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLkBAZGVzdHJveU1heExpc3RlbmVyc1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1sgQVBJLmRlc3Ryb3lNYXhMaXN0ZW5lcnMgXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiggJG1heExpc3RlbmVycyBpbiB0aGlzICl7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXNbICRkZWZhdWx0TWF4TGlzdGVuZXJzIF07XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMubWF4TGlzdGVuZXJzO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkbWF4TGlzdGVuZXJzIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzWyBBUEkuZGVmaW5lTWF4TGlzdGVuZXJzIF0gPSB0aGlzWyBBUEkuZGVzdHJveU1heExpc3RlbmVycyBdID0gbm9vcDtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxuICAgICAqIFxuICAgICAqIFRoZSBgdHlwZWAgY2FuIGJlIG5hbWVzcGFjZWQgdXNpbmcgYDpgLCB3aGljaCB3aWxsIHJlc3VsdCBpbiBtdWx0aXBsZSBldmVudHMgYmVpbmcgdHJpZ2dlcmVkIGluIHN1Y2Nlc3Npb24uIExpc3RlbmVycyBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBmdWxseSBuYW1lc3BhY2VkIGB0eXBlYCBvciBhIHN1YnNldCBvZiB0aGUgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBgZmFsc2VgIG90aGVyd2lzZS5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIuZW1pdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7ICAgIC8vIHRydWVcbiAgICAgKiAvLyBIZWxsbyFcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApOyAgLy8gZmFsc2VcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhbiBldmVudCB3aXRoIGRhdGE8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhIG5hbWVzcGFjZWQgZXZlbnQ8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogLy8gVGhpcyBldmVudCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgYnkgZW1pdHRpbmcgXCJncmVldGluZzpoZWxsb1wiXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbyBhZ2FpbiwgJHsgbmFtZSB9YCApO1xuICAgICAqIFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXG4gICAgICovXG4gICAgdGhpcy5lbWl0ID0gZnVuY3Rpb24oIHR5cGUsIC4uLmRhdGEgKXtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlciggdHlwZSwgZGF0YSApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLmV2ZW50VHlwZXNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8ZXh0ZXJuYWw6c3RyaW5nPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cbiAgICAgKi8gXG4gICAgdGhpcy5ldmVudFR5cGVzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKCB0aGlzWyAkZXZlbnRzIF0gKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5maXJzdFxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKi9cbiAgICB0aGlzLmZpcnN0ID0gZnVuY3Rpb24oIHR5cGUsIGxpc3RlbmVyICl7XG4gICAgICAgIG9uRXZlbnQoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIuQEBnZXRNYXhMaXN0ZW5lcnNcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6bnVtYmVyfSBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzLlxuICAgICAqL1xuICAgIHRoaXNbIEFQSS5nZXRNYXhMaXN0ZW5lcnMgXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpc1sgJG1heExpc3RlbmVycyBdICE9PSAndW5kZWZpbmVkJyA/XG4gICAgICAgICAgICB0aGlzWyAkbWF4TGlzdGVuZXJzIF0gOlxuICAgICAgICAgICAgdGhpc1sgJGRlZmF1bHRNYXhMaXN0ZW5lcnMgXTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5saXN0ZW5lckNvdW50XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVyQ291bnQoICdoZWxsbycgKSApO1xuICAgICAqIC8vIDFcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnZ29vZGJ5ZScgKSApO1xuICAgICAqIC8vIDBcbiAgICAgKi8gXG4gICAgdGhpcy5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oIHR5cGUgKXtcbiAgICAgICAgdmFyIGNvdW50O1xuXG4gICAgICAgIC8vIEVtcHR5XG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xuICAgICAgICAgICAgY291bnQgPSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gRnVuY3Rpb25cbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIGNvdW50ID0gMTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFycmF5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudCA9IHRoaXNbICRldmVudHMgXVsgdHlwZSBdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLmxpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgaGVsbG8gPSBmdW5jdGlvbigpe1xuICAgICAqICBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTtcbiAgICAgKiB9LFxuICAgICAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICAgICAqIC8vIEhlbGxvIVxuICAgICAqIFxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmxpc3RlbmVycyggJ2hlbGxvJyApWyAwIF0gPT09IGhlbGxvICk7XG4gICAgICogLy8gdHJ1ZVxuICAgICAqLyBcbiAgICB0aGlzLmxpc3RlbmVycyA9IGZ1bmN0aW9uKCB0eXBlICl7XG4gICAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHR5cGVvZiBoYW5kbGVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IFsgaGFuZGxlciBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSAqbWFueSB0aW1lKiBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC4gQWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIGludm9rZWQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgYHRpbWVzYCwgaXQgaXMgcmVtb3ZlZC5cbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5tYW55XG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbnkgZXZlbnQgdHlwZSBhIHNldCBudW1iZXIgb2YgdGltZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5tYW55KCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgLy8gMVxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1RlcnJ5JyApOyAgICAgIC8vIDJcbiAgICAgKiAvLyBHcmVldGVkIFRlcnJ5XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnU3RldmUnICk7ICAgICAgLy8gM1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAvLyAyXG4gICAgICogLy8gSGVsbG8sIFRlcnJ5IVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1N0ZXZlJyApOyAgIC8vIDNcbiAgICAgKi8gXG4gICAgdGhpcy5tYW55ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIHRpbWVzLCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aW1lcztcbiAgICAgICAgICAgIHRpbWVzID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgdGltZXMgIT09ICdudW1iZXInICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAndGltZXMgbXVzdCBiZSBhIG51bWJlcicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gbWFueUxpc3RlbmVyKCl7XG4gICAgICAgICAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgICAgICByZXR1cm4gLS10aW1lcyA9PT0gMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbWFueUxpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy51bnRpbCggdHlwZSwgbWFueUxpc3RlbmVyICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBgbGlzdGVuZXJgIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIGl0IGlzIGFzc3VtZWQgdGhlIGBsaXN0ZW5lcmAgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIGB0eXBlYC5cbiAgICAgKiBcbiAgICAgKiBJZiBhbnkgc2luZ2xlIGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgdGhlbiBgZW1pdHRlci5vZmYoKWAgbXVzdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gcmVtb3ZlIGVhY2ggaW5zdGFuY2UuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLm9mZlxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b2ZmXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhbnkgZXZlbnQgdHlwZTwvY2FwdGlvbj5cbiAgICAgKiBmdW5jdGlvbiBncmVldCggbmFtZSApe1xuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0aW5ncywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggZ3JlZXQgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgJ0plZmYnICk7XG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyAnSmVmZicgKTtcbiAgICAgKiAvLyBHcmVldGluZ3MsIEplZmYhXG4gICAgICogZ3JlZXRlci5vZmYoIGdyZWV0ICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAneW8nLCAnSmVmZicgKTtcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogZnVuY3Rpb24gaGVsbG8oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiB9XG4gICAgICogXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgaGVsbG8gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxuICAgICAqIGdyZWV0ZXIub2ZmKCAnaGVsbG8nLCBoZWxsbyApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICovIFxuICAgIHRoaXMub2ZmID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XG4gICAgICAgIHZhciBoYW5kbGVyO1xuICAgICAgICBcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgIFxuICAgICAgICBpZiggaGFuZGxlciA9PT0gbGlzdGVuZXIgfHwgKCB0eXBlb2YgaGFuZGxlci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJiBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XG4gICAgICAgICAgICBpZiggdGhpc1sgJGV2ZW50cyBdWyAnOm9mZicgXSApe1xuICAgICAgICAgICAgICAgIGVtaXRFdmVudCggdGhpcywgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIHRydWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IC0xO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpID0gaGFuZGxlci5sZW5ndGg7IGktLSA+IDA7ICl7XG4gICAgICAgICAgICAgICAgaWYoIGhhbmRsZXJbIGkgXSA9PT0gbGlzdGVuZXIgfHwgKCBoYW5kbGVyWyBpIF0ubGlzdGVuZXIgJiYgaGFuZGxlclsgaSBdLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICAgIGlmKCBpbmRleCA8IDAgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGhhbmRsZXIubGVuZ3RoID09PSAxICl7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3BsaWNlTGlzdCggaGFuZGxlciwgaW5kZXggKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHRoaXNbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIHRoaXMsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCB0cnVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYC4gSWYgbm8gYHR5cGVgIGlzIGdpdmVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBhbnkgZXZlbnQgYHR5cGVgLlxuICAgICAqIFxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLm9uXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGU8L2NhcHRpb24+XG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHR5cGUgPSBhcmd1bWVudHNbIDAgXSB8fCAkZXZlcnksXG4gICAgICAgICAgICBsaXN0ZW5lciA9IGFyZ3VtZW50c1sgMSBdO1xuICAgICAgICBcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVHlwZSBub3QgcHJvdmlkZWQsIGZhbGwgYmFjayB0byBcIiRldmVyeVwiXG4gICAgICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUGxhaW4gb2JqZWN0IG9mIGV2ZW50IGJpbmRpbmdzXG4gICAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0JyApe1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVzID0gT2JqZWN0LmtleXMoIGJpbmRpbmdzICksXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0eXBlSW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICB0eXBlTGVuZ3RoID0gdHlwZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLCBoYW5kbGVySW5kZXgsIGhhbmRsZXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yKCA7IHR5cGVJbmRleCA8IHR5cGVMZW5ndGg7IHR5cGVJbmRleCArPSAxICl7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSB0eXBlc1sgdHlwZUluZGV4IF07XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBiaW5kaW5nc1sgdHlwZSBdO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gTGlzdCBvZiBsaXN0ZW5lcnNcbiAgICAgICAgICAgICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJMZW5ndGggPSBoYW5kbGVyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciggOyBoYW5kbGVySW5kZXggPCBoYW5kbGVyTGVuZ3RoOyBoYW5kbGVySW5kZXggKz0gMSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXZlbnQoIHRoaXMsIHR5cGUsIGhhbmRsZXJbIGhhbmRsZXJJbmRleCBdLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luZ2xlIGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkV2ZW50KCB0aGlzLCB0eXBlLCBoYW5kbGVyLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBvbkV2ZW50KCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UgKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXIuYXNFbWl0dGVyLm9uY2VcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm9uXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XG4gICAgICogLy8gR3JlZXRlZFxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIG9uY2UgdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub25jZSggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcbiAgICAgKi9cbiAgICB0aGlzLm9uY2UgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5tYW55KCB0eXBlLCAxLCBsaXN0ZW5lciApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci5AQHNldE1heExpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXG4gICAgICovXG4gICAgdGhpc1sgQVBJLnNldE1heExpc3RlbmVycyBdID0gZnVuY3Rpb24oIG1heCApe1xuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIG1heCApICl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbWF4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXNbICRtYXhMaXN0ZW5lcnMgXSA9IG1heDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IGB0eXBlYCB3aXRoIHRoZSBzdXBwbGllZCBgZGF0YWAuXG4gICAgICogXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyLmFzRW1pdHRlci50cmlnZ2VyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLlxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdoZWxsbycsIFsgJ1dvcmxkJyBdICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAgICAgKiBncmVldGVyLm9uKCAnZ3JlZXRpbmcnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYCR7IG5hbWUgfSB3YXMgZ3JlZXRlZC5gICk7XG4gICAgICogXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XG4gICAgICogLy8gSGksIE1hcmshXG4gICAgICogLy8gTWFyayB3YXMgZ3JlZXRlZC5cbiAgICAgKiBcbiAgICAgKiBncmVldGVyLnRyaWdnZXIoICdncmVldGluZzpoZWxsbycsIFsgJ0plZmYnIF0gKTtcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICAgICAqL1xuICAgIHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCB0eXBlLCBkYXRhID0gW10gKXtcbiAgICAgICAgdmFyIGV4ZWN1dGVkID0gZmFsc2UsXG4gICAgICAgICAgICAvLyBJZiB0eXBlIGlzIG5vdCBhIHN0cmluZywgaW5kZXggd2lsbCBiZSBmYWxzZVxuICAgICAgICAgICAgaW5kZXggPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XG4gICAgICAgIFxuICAgICAgICAvLyBOYW1lc3BhY2VkIGV2ZW50LCBlLmcuIEVtaXQgXCJmb286YmFyOnF1eFwiLCB0aGVuIFwiZm9vOmJhclwiXG4gICAgICAgIHdoaWxlKCBpbmRleCA+IDAgKXtcbiAgICAgICAgICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggdGhpcywgdHlwZSwgZGF0YSwgZmFsc2UgKSApIHx8IGV4ZWN1dGVkO1xuICAgICAgICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKCAwLCBpbmRleCApO1xuICAgICAgICAgICAgaW5kZXggPSB0eXBlLmxhc3RJbmRleE9mKCAnOicgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gRW1pdCBzaW5nbGUgZXZlbnQgb3IgdGhlIG5hbWVzcGFjZWQgZXZlbnQgcm9vdCwgZS5nLiBcImZvb1wiLCBcIjpiYXJcIiwgU3ltYm9sKCBcIkBAcXV4XCIgKVxuICAgICAgICBleGVjdXRlZCA9ICggdHlwZSAmJiBlbWl0RXZlbnQoIHRoaXMsIHR5cGUsIGRhdGEsIHRydWUgKSApIHx8IGV4ZWN1dGVkO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGV4ZWN1dGVkO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgdGhhdCB3aWxsIGJlIHRyaWdnZXJlZCAqdW50aWwqIHRoZSBgbGlzdGVuZXJgIHJldHVybnMgYHRydWVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXG4gICAgICogXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlci5hc0VtaXR0ZXIudW50aWxcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIGdyZWV0ZXIudW50aWwoIGZ1bmN0aW9uKCBuYW1lICl7XG4gICAgICogIGNvbnNvbGUubG9nKCBgR3JlZXRlZCAkeyBuYW1lIH1gICk7XG4gICAgICogIHJldHVybiBuYW1lID09PSAnVGVycnknO1xuICAgICAqIH0gKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnLCAnVGVycnknICk7XG4gICAgICogLy8gR3JlZXRlZCBUZXJyeVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ0Fhcm9uJyApO1xuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgICogZ3JlZXRlci51bnRpbCggJ2hlbGxvJywgZnVuY3Rpb24oIG5hbWUgKXtcbiAgICAgKiAgY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKTtcbiAgICAgKiAgcmV0dXJuIG5hbWUgPT09ICdXb3JsZCc7XG4gICAgICogfSApO1xuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XG4gICAgICogLy8gSGVsbG8sIEplZmYhXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ01hcmsnICk7XG4gICAgICovXG4gICAgdGhpcy51bnRpbCA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHVudGlsTGlzdGVuZXIoKXtcbiAgICAgICAgICAgIHZhciBkb25lID0gbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICAgICAgaWYoIGRvbmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgICAgICB0aGlzLm9mZiggdHlwZSwgdW50aWxMaXN0ZW5lciApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBUT0RPIENoZWNrIGJleW9uZCBqdXN0IG9uZSBsZXZlbCBvZiBsaXN0ZW5lciByZWZlcmVuY2VzXG4gICAgICAgIHVudGlsTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lci5saXN0ZW5lciB8fCBsaXN0ZW5lcjtcbiAgICAgICAgXG4gICAgICAgIG9uRXZlbnQoIHRoaXMsIHR5cGUsIHVudGlsTGlzdGVuZXIsIGZhbHNlICk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgZW1pdHRlci4gSWYgYGJpbmRpbmdzYCBhcmUgcHJvdmlkZWQgdGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcGFzc2VkIGludG8gYG9uKClgIG9uY2UgY29uc3RydWN0aW9uIGlzIGNvbXBsZXRlLlxuICogQGNsYXNzIEVtaXR0ZXJcbiAqIEBjbGFzc2Rlc2MgQW4gb2JqZWN0IHRoYXQgZW1pdHMgbmFtZWQgZXZlbnRzIHdoaWNoIGNhdXNlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZC5cbiAqIEBleHRlbmRzIG51bGxcbiAqIEBtaXhlcyBFbWl0dGVyLmFzRW1pdHRlclxuICogQHBhcmFtIHtleHRlcm5hbDpPYmplY3R9IFtiaW5kaW5nc10gQSBtYXBwaW5nIG9mIGV2ZW50IHR5cGVzIHRvIGV2ZW50IGxpc3RlbmVycy5cbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL21hc3Rlci9saWIvZXZlbnRzLmpzfVxuICogQGV4YW1wbGUgPGNhcHRpb24+VXNpbmcgRW1pdHRlciBkaXJlY3RseTwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xuICogLy8gSGVsbG8hXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5Jbmhlcml0aW5nIGZyb20gRW1pdHRlcjwvY2FwdGlvbj5cbiAqIGZ1bmN0aW9uIEdyZWV0ZXIoKXtcbiAqICBFbWl0dGVyLmNhbGwoIHRoaXMgKTtcbiAqIFxuICogIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIH1cbiAqIEdyZWV0ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRW1pdHRlci5wcm90b3R5cGUgKTtcbiAqIFxuICogR3JlZXRlci5wcm90b3R5cGUuZ3JlZXQgPSBmdW5jdGlvbiggbmFtZSApe1xuICogIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xuICogfTtcbiAqIFxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBHcmVldGVyKCk7XG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcbiAqIC8vIEhlbGxvLCBKZWZmIVxuICogQGV4YW1wbGUgPGNhcHRpb24+TmFtZXNwYWNlZCBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcbiAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XG4gKiBncmVldGVyLmVtaXQoICdncmVldGluZzpoZWxsbycsICdKZWZmJyApO1xuICogLy8gSGksIE1hcmshXG4gKiAvLyBNYXJrIHdhcyBncmVldGVkLlxuICogLy8gSGVsbG8sIEplZmYhXG4gKiAvLyBKZWZmIHdhcyBncmVldGVkLlxuICogQGV4YW1wbGUgPGNhcHRpb24+UHJlZGVmaW5lZCBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGluZ3MgPSB7XG4gKiAgICAgIGhlbGxvOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhlbGxvLCAke25hbWV9IWAgKSxcbiAqICAgICAgaGk6IGZ1bmN0aW9uKCBuYW1lICl7IGNvbnNvbGUubG9nKCBgSGksICR7bmFtZX0hYCApXG4gKiAgfSxcbiAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoIGdyZWV0aW5ncyApO1xuICogXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdBYXJvbicgKTtcbiAqIC8vIEhlbGxvLCBBYXJvbiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk9uZS10aW1lIGV2ZW50czwvY2FwdGlvbj5cbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7XG4gKiAvLyBIZWxsbywgSmVmZiFcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk1hbnktdGltZSBldmVudHM8L2NhcHRpb24+XG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTsgICAgIC8vIDFcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApOyAgICAvLyAyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAgLy8gM1xuICogLy8gSGVsbG8sIEplZmYhXG4gKiAvLyBIZWxsbywgVGVycnkhXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEVtaXR0ZXIoIGJpbmRpbmdzICl7XG4gICB0aGlzWyBBUEkuZGVmaW5lTWF4TGlzdGVuZXJzIF0oIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyApO1xuICAgdGhpc1sgQVBJLmRlZmluZUV2ZW50cyBdKCBiaW5kaW5ncyApO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggRW1pdHRlciwge1xuICAgIEFQSToge1xuICAgICAgICB2YWx1ZTogQVBJLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIGFzRW1pdHRlcjoge1xuICAgICAgICB2YWx1ZTogYXNFbWl0dGVyLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciBhbGwgZW1pdHRlcnMuIFVzZSBgZW1pdHRlci5tYXhMaXN0ZW5lcnNgIHRvIHNldCB0aGUgbWF4aW11bSBvbiBhIHBlci1pbnN0YW5jZSBiYXNpcy5cbiAgICAgKiBcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZW50IGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGEgc3BlY2lmaWMgZXZlbnQgdHlwZS5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpudW1iZXJ9IEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycz0xMFxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkNoYW5naW5nIHRoZSBkZWZhdWx0IG1heGltdW0gbGlzdGVuZXJzPC9jYXB0aW9uPlxuICAgICAqIGNvbnNvbGUubG9nKCBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgKTtcbiAgICAgKiAvLyAxMFxuICAgICAqIFxuICAgICAqIGNvbnN0IGdyZWV0ZXIxID0gbmV3IEVtaXR0ZXIoKSxcbiAgICAgKiAgZ3JlZXRlcjIgPSBuZXcgRW1pdHRlcigpO1xuICAgICAqIFxuICAgICAqIEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDE7XG4gICAgICogXG4gICAgICogZ3JlZXRlcjEub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gY29uc29sZS5sb2coICdIZWxsbyEnICkgKTtcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcbiAgICAgKiAvLyBHcmVldGluZyBcImhlbGxvXCIgaGFzIG9uZSB0b28gbWFueSFcbiAgICAgKiBcbiAgICAgKiBncmVldGVyMi5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xuICAgICAqIGdyZWV0ZXIyLm9uKCAnaGknLCAoKSA9PiBhbGVydCggJ0hpIScgKSApO1xuICAgICAqIC8vIEdyZWV0aW5nIFwiaGlcIiBoYXMgb25lIHRvbyBtYW55IVxuICAgICAqIFxuICAgICAqL1xuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnM6IHtcbiAgICAgICAgdmFsdWU6IDEwLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIHN5bWJvbCB1c2VkIHRvIGxpc3RlbiBmb3IgZXZlbnRzIG9mIGFueSBgdHlwZWAuIEZvciBfbW9zdF8gbWV0aG9kcywgd2hlbiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhpcyBpcyB0aGUgZGVmYXVsdC5cbiAgICAgKiBcbiAgICAgKiBVc2luZyBgRW1pdHRlci5ldmVyeWAgaXMgdHlwaWNhbGx5IG5vdCBuZWNlc3NhcnkuXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6c3ltYm9sfSBFbWl0dGVyLmV2ZXJ5XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICAgKiBncmVldGVyLm9uKCBFbWl0dGVyLmV2ZXJ5LCAoKSA9PiBjb25zb2xlLmxvZyggJ0dyZWV0ZWQnICkgKTtcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScgKTtcbiAgICAgKiAvLyBHcmVldGVkXG4gICAgICovXG4gICAgZXZlcnk6IHtcbiAgICAgICAgdmFsdWU6ICRldmVyeSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mICpFbWl0dGVyLmpzKi5cbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzdHJpbmd9IEVtaXR0ZXIudmVyc2lvblxuICAgICAqIEBleGFtcGxlXG4gICAgICogY29uc29sZS5sb2coIEVtaXR0ZXIudmVyc2lvbiApO1xuICAgICAqIC8vIDIuMC4wXG4gICAgICovXG4gICAgdmVyc2lvbjoge1xuICAgICAgICB2YWx1ZTogJzIuMC4wJyxcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH1cbn0gKTtcblxuRW1pdHRlci5wcm90b3R5cGUgPSBuZXcgQ29udGFpbmVyKCk7XG5cbkVtaXR0ZXIucHJvdG90eXBlWyBTeW1ib2wudG9TdHJpbmdUYWcgXSA9ICdFbWl0dGVyJztcblxuRW1pdHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbWl0dGVyO1xuXG5FbWl0dGVyLmFzRW1pdHRlci5jYWxsKCBFbWl0dGVyLnByb3RvdHlwZSApO1xuXG4vKipcbiAqIERlc3Ryb3lzIHRoZSBlbWl0dGVyLlxuICogQGZpcmVzIEVtaXR0ZXIjOmRlc3Ryb3lcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XG4gICAgZW1pdEV2ZW50KCB0aGlzLCAnOmRlc3Ryb3knLCBbXSwgdHJ1ZSApO1xuICAgIHRoaXNbIEFQSS5kZXN0cm95RXZlbnRzIF0oKTtcbiAgICB0aGlzWyBBUEkuZGVzdHJveU1heExpc3RlbmVycyBdKCk7XG4gICAgdGhpcy5kZXN0cm95ID0gdGhpcy5jbGVhciA9IHRoaXMuZW1pdCA9IHRoaXMuZmlyc3QgPSB0aGlzLmxpc3RlbmVyQ291bnQgPSB0aGlzLmxpc3RlbmVycyA9IHRoaXMubWFueSA9IHRoaXMub2ZmID0gdGhpcy5vbiA9IHRoaXMub25jZSA9IHRoaXMudHJpZ2dlciA9IHRoaXMudW50aWwgPSBub29wO1xuICAgIHRoaXMudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuICdkZXN0cm95ZWQnO1xuICAgIH07XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIHsgXCJtYXhMaXN0ZW5lcnNcIjogNSwgXCJsaXN0ZW5lckNvdW50XCI6IHsgXCJncmVldFwiOiAyIH0gfVxuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcbiAqIC8vIFwiZGVzdHJveWVkXCJcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgICB2YXIganNvbiA9IG5ldyBDb250YWluZXIoKSxcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggdGhpc1sgJGV2ZW50cyBdICksXG4gICAgICAgIGxlbmd0aCA9IHR5cGVzLmxlbmd0aCxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICB0eXBlO1xuICAgIFxuICAgIGpzb24ubWF4TGlzdGVuZXJzID0gdGhpcy5tYXhMaXN0ZW5lcnM7XG4gICAganNvbi5saXN0ZW5lckNvdW50ID0gbmV3IENvbnRhaW5lcigpO1xuICAgIFxuICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApe1xuICAgICAgICB0eXBlID0gdHlwZXNbIGluZGV4IF07XG4gICAgICAgIGpzb24ubGlzdGVuZXJDb3VudFsgdHlwZSBdID0gdGhpcy5saXN0ZW5lckNvdW50KCB0eXBlICk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBqc29uO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6c3RyaW5nfSBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAqIGdyZWV0ZXIubWF4TGlzdGVuZXJzID0gNTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgeyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9J1xuICogXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcbiAqIFxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9TdHJpbmcoKSApO1xuICogLy8gJ0VtaXR0ZXIgXCJkZXN0cm95ZWRcIidcbiAqL1xuRW1pdHRlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBgJHsgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lIH0gJHsgSlNPTi5zdHJpbmdpZnkoIHRoaXMudG9KU09OKCkgKSB9YC50cmltKCk7XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==