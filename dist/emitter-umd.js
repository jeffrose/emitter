(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.emitter = mod.exports;
  }
})(this, function (_exports) {
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

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = Emitter;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function Null() {}

  Null.prototype = Object.create(null);
  Null.prototype.constructor = Null;

  var $events = '@@emitter/events',
      $every = '@@emitter/every',
      $maxListeners = '@@emitter/maxListeners',
      hasOwnProperty = Object.prototype.hasOwnProperty,
      noop = function noop() {},
      API = new Null(); // Many of these functions are broken out from the prototype for the sake of optimization. The functions on the protoytype
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
    } // TODO Check beyond just one level of listener references


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
    } // Define the event registry if it does not exist


    defineEventsProperty(emitter, new Null());
    var _events = emitter[$events];

    if (_events[':on']) {
      emitEvent(emitter, ':on', [type, typeof listener.listener === 'function' ? listener.listener : listener], false); // Emitting "on" may have changed the registry.

      _events[':on'] = emitter[$events][':on'];
    } // Single listener


    if (!_events[type]) {
      _events[type] = listener; // Multiple listeners
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
      } // Transition from single to multiple listeners

    } else {
      _events[type] = index === 0 ? [listener, _events[type]] : [_events[type], listener];
    } // Track warnings if max listeners is available


    if ('maxListeners' in emitter && !_events[type].warned) {
      var max = emitter.maxListeners;

      if (max && max > 0 && _events[type].length > max) {
        emitEvent(emitter, ':maxListeners', [type, listener], false); // Emitting "maxListeners" may have changed the registry.

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
        handler,
        handlerIndex,
        handlerLength,
        type;

    for (; typeIndex < typeLength; typeIndex += 1) {
      type = types[typeIndex];
      handler = mapping[type]; // List of listeners

      if (Array.isArray(handler)) {
        handlerIndex = 0;
        handlerLength = handler.length;

        for (; handlerIndex < handlerLength; handlerIndex += 1) {
          addEventListener(emitter, type, handler[handlerIndex], NaN);
        } // Single listener

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
    index = typeof type === 'string' && type.lastIndexOf(':'); // Namespaced event, e.g. Emit "foo:bar:qux", then "foo:bar"

    while (index > 0) {
      executed = type && emitEvent(emitter, type, data, false) || executed;
      type = type.substring(0, index);
      index = type.lastIndexOf(':');
    } // Emit single event or the namespaced event root, e.g. "foo", ":bar", Symbol( "@@qux" )


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
    var _events = Object.hasOwnProperty.call(emitter, $events) ? emitter[$events] : undefined;

    var executed = false,
        listener;

    if (typeof _events !== 'undefined') {
      if (type === 'error' && !_events.error) {
        if (data[0] instanceof Error) {
          throw data[0];
        } else {
          throw new Error('Uncaught, unspecified "error" event.');
        }
      } // Execute listeners for the given type of event


      listener = _events[type];

      if (typeof listener !== 'undefined') {
        executeListener(listener, data, emitter);
        executed = true;
      } // Execute listeners listening for all types of events


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
      asEmitter.call(target); // Apply only the selected API methods
    } else {
      var index, key, mapping, names, value;

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
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $every;
      var index = arguments.length > 1 ? arguments[1] : undefined;
      var listener = arguments.length > 2 ? arguments[2] : undefined;

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
      var handler; // No Events

      if (!this[$events]) {
        return this;
      } // With no "off" listeners, clearing can be simplified


      if (!this[$events][':off']) {
        if (arguments.length === 0) {
          this[$events] = new Null();
        } else if (this[$events][type]) {
          delete this[$events][type];
        }

        return this;
      } // Clear all listeners


      if (arguments.length === 0) {
        var types = getEventTypes(this); // Avoid removing "off" listeners until all other types have been removed

        for (var index = 0, length = types.length; index < length; index += 1) {
          if (types[index] === ':off') {
            continue;
          }

          this.clear(types[index]);
        } // Manually clear "off"


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
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $every;
      var listener = arguments.length > 1 ? arguments[1] : undefined;

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
      var count; // Empty

      if (!this[$events] || !this[$events][type]) {
        count = 0; // Function
      } else if (typeof this[$events][type] === 'function') {
        count = 1; // Array
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
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $every;
      var times = arguments.length > 1 ? arguments[1] : undefined;
      var listener = arguments.length > 2 ? arguments[2] : undefined;

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
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $every;
      var listener = arguments.length > 1 ? arguments[1] : undefined;

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
          type = $every; // Plain object of event bindings
        } else if (_typeof(type) === 'object') {
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
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $every;
      var listener = arguments.length > 1 ? arguments[1] : undefined;

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
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
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
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $every;
      var listener = arguments.length > 1 ? arguments[1] : undefined;

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
      typeof mapping !== 'undefined' && addEventMapping(this, mapping); // Called as function
    } else {
      var selection = arguments[0],
          target = arguments[1]; // Shift arguments

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
        type;
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
    return "".concat(this.constructor.name, " ").concat(JSON.stringify(this.toJSON())).trim();
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtaXR0ZXIuanMiXSwibmFtZXMiOlsiTnVsbCIsInByb3RvdHlwZSIsIk9iamVjdCIsImNyZWF0ZSIsImNvbnN0cnVjdG9yIiwiJGV2ZW50cyIsIiRldmVyeSIsIiRtYXhMaXN0ZW5lcnMiLCJoYXNPd25Qcm9wZXJ0eSIsIm5vb3AiLCJBUEkiLCJhZGRDb25kaXRpb25hbEV2ZW50TGlzdGVuZXIiLCJlbWl0dGVyIiwidHlwZSIsImxpc3RlbmVyIiwiY29uZGl0aW9uYWxMaXN0ZW5lciIsImRvbmUiLCJhcHBseSIsImFyZ3VtZW50cyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJhZGRFdmVudExpc3RlbmVyIiwiTmFOIiwiaW5kZXgiLCJUeXBlRXJyb3IiLCJkZWZpbmVFdmVudHNQcm9wZXJ0eSIsIl9ldmVudHMiLCJlbWl0RXZlbnQiLCJBcnJheSIsImlzQXJyYXkiLCJpc05hTiIsInB1c2giLCJ1bnNoaWZ0Iiwic3BsaWNlIiwid2FybmVkIiwibWF4IiwibWF4TGlzdGVuZXJzIiwibGVuZ3RoIiwiYWRkRmluaXRlRXZlbnRMaXN0ZW5lciIsInRpbWVzIiwiZmluaXRlTGlzdGVuZXIiLCJhZGRFdmVudE1hcHBpbmciLCJtYXBwaW5nIiwidHlwZXMiLCJrZXlzIiwidHlwZUxlbmd0aCIsInR5cGVJbmRleCIsImhhbmRsZXIiLCJoYW5kbGVySW5kZXgiLCJoYW5kbGVyTGVuZ3RoIiwidmFsdWUiLCJoYXNFdmVudHMiLCJjYWxsIiwiZW1pdHRlclByb3RvdHlwZSIsImdldFByb3RvdHlwZU9mIiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJlbWl0QWxsRXZlbnRzIiwiZGF0YSIsImV4ZWN1dGVkIiwibGFzdEluZGV4T2YiLCJzdWJzdHJpbmciLCJlbWl0RXJyb3JzIiwiZXJyb3JzIiwiZW1pdEV2ZXJ5IiwidW5kZWZpbmVkIiwiZXJyb3IiLCJFcnJvciIsImV4ZWN1dGVMaXN0ZW5lciIsInNjb3BlIiwiaXNGdW5jdGlvbiIsImxpc3RlbkVtcHR5IiwibGlzdGVuT25lIiwibGlzdGVuVHdvIiwibGlzdGVuVGhyZWUiLCJsaXN0ZW5NYW55IiwiZ2V0RXZlbnRUeXBlcyIsImdldE1heExpc3RlbmVycyIsIkVtaXR0ZXIiLCJkZWZhdWx0TWF4TGlzdGVuZXJzIiwiaXNQb3NpdGl2ZU51bWJlciIsIm51bWJlciIsImxpc3RlbmVycyIsInNsaWNlIiwiYXJnMSIsImFyZzIiLCJhcmczIiwiYXJncyIsImkiLCJzcGxpY2VMaXN0Iiwic2V0TWF4TGlzdGVuZXJzIiwibGlzdCIsImoiLCJwb3AiLCJ0aWNrIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwidGlja0FsbEV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidG9FbWl0dGVyIiwic2VsZWN0aW9uIiwidGFyZ2V0IiwiYXNFbWl0dGVyIiwia2V5IiwibmFtZXMiLCJzcGxpdCIsImF0IiwiY2xlYXIiLCJlbWl0IiwiZXZlbnRUeXBlcyIsImZpcnN0IiwibGlzdGVuZXJDb3VudCIsImNvdW50IiwibWFueSIsIm9mZiIsIm9uIiwib25jZSIsInRyaWdnZXIiLCJ1bnRpbCIsImdldCIsInNldCIsImRlZmluZVByb3BlcnRpZXMiLCJldmVyeSIsInZlcnNpb24iLCJkZXN0cm95IiwidG9KU09OIiwianNvbiIsInRvU3RyaW5nIiwibmFtZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0cmltIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7QUFFQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7OztBQU1BOzs7Ozs7QUFNQTs7Ozs7O0FBTUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkE7Ozs7OztBQU1BOzs7OztBQUtBOzs7OztBQUtBOzs7OztBQUtBOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7Ozs7Ozs7O0FBS0EsV0FBU0EsSUFBVCxHQUFl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SSxRQUFsQixHQUE2QixZQUFVO0FBQ25DLFdBQU8sVUFBSSxLQUFLOUgsV0FBTCxDQUFpQitILElBQXJCLGNBQStCQyxJQUFJLENBQUNDLFNBQUwsQ0FBZ0IsS0FBS0wsTUFBTCxFQUFoQixDQUEvQixFQUFrRU0sSUFBbEUsRUFBUDtBQUNILEdBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogSmF2YVNjcmlwdCBBcnJheVxyXG4gKiBAZXh0ZXJuYWwgQXJyYXlcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXl9XHJcbiAqLyBcclxuXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0dsb3NzYXJ5L1BybTQ1NG11bjMhaW1pdGl2ZXxwcmltaXRpdmV9IGJvb2xlYW5cclxuICogQGV4dGVybmFsIGJvb2xlYW5cclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQm9vbGVhbn1cclxuICovIFxyXG5cclxuLyoqXHJcbiAqIEphdmFTY3JpcHQgRXJyb3JcclxuICogQGV4dGVybmFsIEVycm9yXHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Vycm9yfVxyXG4gKi8gXHJcblxyXG4vKipcclxuICogSmF2YVNjcmlwdCBGdW5jdGlvblxyXG4gKiBAZXh0ZXJuYWwgRnVuY3Rpb25cclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb259XHJcbiAqLyBcclxuIFxyXG4vKipcclxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBudW1iZXJcclxuICogQGV4dGVybmFsIG51bWJlclxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9OdW1iZXJ9XHJcbiAqLyBcclxuIFxyXG4vKipcclxuICogSmF2YVNjcmlwdCBudWxsXHJcbiAqIEBleHRlcm5hbCBudWxsXHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL251bGx9XHJcbiAqL1xyXG4gXHJcbi8qKlxyXG4gKiBKYXZhU2NyaXB0IE9iamVjdFxyXG4gKiBAZXh0ZXJuYWwgT2JqZWN0XHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdH1cclxuICovXHJcblxyXG4vKipcclxuICogSmF2YVNjcmlwdCBQcm9taXNlXHJcbiAqIEBleHRlcm5hbCBQcm9taXNlXHJcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb21pc2V9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEphdmFTY3JpcHQge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvR2xvc3NhcnkvUHJpbWl0aXZlfHByaW1pdGl2ZX0gc3RyaW5nXHJcbiAqIEBleHRlcm5hbCBzdHJpbmdcclxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nfVxyXG4gKi9cclxuIFxyXG4vKipcclxuICogSmF2YVNjcmlwdCB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9HbG9zc2FyeS9QcmltaXRpdmV8cHJpbWl0aXZlfSBzeW1ib2xcclxuICogQGV4dGVybmFsIHN5bWJvbFxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9TeW1ib2x9XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEEgc2V0IG9mIG1ldGhvZCByZWZlcmVuY2VzIHRvIHRoZSBFbWl0dGVyLmpzIEFQSS5cclxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpPYmplY3R9IEFQSVJlZmVyZW5jZVxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BIHNlbGVjdGlvbiByZWZlcmVuY2U8L2NhcHRpb24+XHJcbiAqICdlbWl0IG9mZiBvbiBvbmNlJ1xyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BIG1hcHBpbmcgcmVmZXJlbmNlPC9jYXB0aW9uPlxyXG4gKiAvLyAnZW1pdCgpJyB3aWxsIGJlIG1hcHBlZCB0byAnZmlyZSgpJ1xyXG4gKiAvLyAnb24oKScgd2lsbCBiZSBtYXBwZWQgdG8gJ2FkZExpc3RlbmVyKCknXHJcbiAqIC8vICdvZmYoKScgd2lsbCBiZSBtYXBwZWQgdG8gJ3JlbW92ZUxpc3RlbmVyKCknXHJcbiAqIHtcclxuICogIGZpcmU6ICdlbWl0JyxcclxuICogIGFkZExpc3RlbmVyOiAnb24nLFxyXG4gKiAgcmVtb3ZlTGlzdGVuZXI6ICdvZmYnXHJcbiAqIH1cclxuICovXHJcblxyXG4vKipcclxuICogQSB7QGxpbmsgZXh0ZXJuYWw6RnVuY3Rpb258IGZ1bmN0aW9ufSBib3VuZCB0byBhbiBlbWl0dGVyIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZX0uIEFueSBkYXRhIHRyYW5zbWl0dGVkIHdpdGggdGhlIGV2ZW50IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVyIGFzIGFyZ3VtZW50cy5cclxuICogQHR5cGVkZWYge2V4dGVybmFsOkZ1bmN0aW9ufSBFdmVudExpc3RlbmVyXHJcbiAqIEBwYXJhbSB7Li4uKn0gZGF0YSBUaGUgYXJndW1lbnRzIHBhc3NlZCBieSB0aGUgYGVtaXRgLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBbiB7QGxpbmsgZXh0ZXJuYWw6T2JqZWN0fG9iamVjdH0gdGhhdCBtYXBzIHtAbGluayBFdmVudFR5cGV8ZXZlbnQgdHlwZXN9IHRvIHtAbGluayBFdmVudExpc3RlbmVyfGV2ZW50IGxpc3RlbmVyc30uXHJcbiAqIEB0eXBlZGVmIHtleHRlcm5hbDpPYmplY3R9IEV2ZW50TWFwcGluZ1xyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBIHtAbGluayBleHRlcm5hbDpzdHJpbmd9IG9yIHtAbGluayBleHRlcm5hbDpzeW1ib2x9IHRoYXQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiBldmVudCBmaXJlZCBieSB0aGUgRW1pdHRlci5cclxuICogQHR5cGVkZWYge2V4dGVybmFsOnN0cmluZ3xleHRlcm5hbDpzeW1ib2x9IEV2ZW50VHlwZVxyXG4gKi8gXHJcblxyXG4vKipcclxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9iZWZvcmVfIGFuIGVtaXR0ZXIgZGVzdHJveXMgaXRzZWxmLlxyXG4gKiBAZXZlbnQgRW1pdHRlciM6ZGVzdHJveVxyXG4gKi8gXHJcblxyXG4vKipcclxuICogVGhpcyBldmVudCBpcyBlbWl0dGVkIF9hZnRlcl8gYSBsaXN0ZW5lciBpcyByZW1vdmVkLlxyXG4gKiBAZXZlbnQgRW1pdHRlciM6b2ZmXHJcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcclxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgX2JlZm9yZV8gYSBsaXN0ZW5lciBpcyBhZGRlZC5cclxuICogQGV2ZW50IEVtaXR0ZXIjOm9uXHJcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcclxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGV2ZW50IGlzIGVtaXR0ZWQgb25jZSB0aGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGhhcyBiZWVuIGV4Y2VlZGVkIGZvciBhbiBldmVudCB0eXBlLlxyXG4gKiBAZXZlbnQgRW1pdHRlciM6bWF4TGlzdGVuZXJzXHJcbiAqIEB0eXBlIHtleHRlcm5hbDpzdHJpbmd9IHR5cGVcclxuICogQHR5cGUge2V4dGVybmFsOkZ1bmN0aW9ufSBsaXN0ZW5lclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBBIFwiY2xlYW5cIiwgZW1wdHkgY29udGFpbmVyLiBJbnN0YW50aWF0aW5nIHRoaXMgaXMgZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKCBudWxsIClgLlxyXG4gKiBAY2xhc3MgRW1pdHRlcn5OdWxsXHJcbiAqIEBleHRlbmRzIGV4dGVybmFsOm51bGxcclxuICovXHJcbmZ1bmN0aW9uIE51bGwoKXt9XHJcbk51bGwucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xyXG5OdWxsLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE51bGw7XHJcblxyXG5jb25zdFxyXG4gICAgJGV2ZW50cyAgICAgICA9ICdAQGVtaXR0ZXIvZXZlbnRzJyxcclxuICAgICRldmVyeSAgICAgICAgPSAnQEBlbWl0dGVyL2V2ZXJ5JyxcclxuICAgICRtYXhMaXN0ZW5lcnMgPSAnQEBlbWl0dGVyL21heExpc3RlbmVycycsXHJcbiAgICBcclxuICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcclxuICAgIFxyXG4gICAgbm9vcCA9IGZ1bmN0aW9uKCl7fSxcclxuICAgIFxyXG4gICAgQVBJID0gbmV3IE51bGwoKTtcclxuXHJcbi8vIE1hbnkgb2YgdGhlc2UgZnVuY3Rpb25zIGFyZSBicm9rZW4gb3V0IGZyb20gdGhlIHByb3RvdHlwZSBmb3IgdGhlIHNha2Ugb2Ygb3B0aW1pemF0aW9uLiBUaGUgZnVuY3Rpb25zIG9uIHRoZSBwcm90b3l0eXBlXHJcbi8vIHRha2UgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYXMgYSByZXN1bHQuIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIGEgZml4ZWQgbnVtYmVyIG9mIGFyZ3VtZW50c1xyXG4vLyBhbmQgdGhlcmVmb3JlIGRvIG5vdCBnZXQgZGVvcHRpbWl6ZWQuXHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gKi9cclxuZnVuY3Rpb24gYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBjb25kaXRpb25hbExpc3RlbmVyKCl7XHJcbiAgICAgICAgY29uc3QgZG9uZSA9IGxpc3RlbmVyLmFwcGx5KCBlbWl0dGVyLCBhcmd1bWVudHMgKTtcclxuICAgICAgICBpZiggZG9uZSA9PT0gdHJ1ZSApe1xyXG4gICAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBjb25kaXRpb25hbExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBUT0RPIENoZWNrIGJleW9uZCBqdXN0IG9uZSBsZXZlbCBvZiBsaXN0ZW5lciByZWZlcmVuY2VzXHJcbiAgICBjb25kaXRpb25hbExpc3RlbmVyLmxpc3RlbmVyID0gbGlzdGVuZXIubGlzdGVuZXIgfHwgbGlzdGVuZXI7XHJcbiAgICBcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIGNvbmRpdGlvbmFsTGlzdGVuZXIsIE5hTiApO1xyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRMaXN0ZW5lclxyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IHdvdWxkIGJlIGVtaXR0ZWQuXHJcbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cclxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IGluZGV4XHJcbiAqL1xyXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciwgaW5kZXggKXtcclxuICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgdGhlIGV2ZW50IHJlZ2lzdHJ5IGlmIGl0IGRvZXMgbm90IGV4aXN0XHJcbiAgICBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgbmV3IE51bGwoKSApO1xyXG4gICAgXHJcbiAgICBjb25zdCBfZXZlbnRzID0gZW1pdHRlclsgJGV2ZW50cyBdO1xyXG4gICAgXHJcbiAgICBpZiggX2V2ZW50c1sgJzpvbicgXSApe1xyXG4gICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvbicsIFsgdHlwZSwgdHlwZW9mIGxpc3RlbmVyLmxpc3RlbmVyID09PSAnZnVuY3Rpb24nID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lciBdLCBmYWxzZSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEVtaXR0aW5nIFwib25cIiBtYXkgaGF2ZSBjaGFuZ2VkIHRoZSByZWdpc3RyeS5cclxuICAgICAgICBfZXZlbnRzWyAnOm9uJyBdID0gZW1pdHRlclsgJGV2ZW50cyBdWyAnOm9uJyBdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBTaW5nbGUgbGlzdGVuZXJcclxuICAgIGlmKCAhX2V2ZW50c1sgdHlwZSBdICl7XHJcbiAgICAgICAgX2V2ZW50c1sgdHlwZSBdID0gbGlzdGVuZXI7XHJcbiAgICBcclxuICAgIC8vIE11bHRpcGxlIGxpc3RlbmVyc1xyXG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBfZXZlbnRzWyB0eXBlIF0gKSApe1xyXG4gICAgICAgIHN3aXRjaCggaXNOYU4oIGluZGV4ICkgfHwgaW5kZXggKXtcclxuICAgICAgICAgICAgY2FzZSB0cnVlOlxyXG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnB1c2goIGxpc3RlbmVyICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgX2V2ZW50c1sgdHlwZSBdLnVuc2hpZnQoIGxpc3RlbmVyICk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIF9ldmVudHNbIHR5cGUgXS5zcGxpY2UoIGluZGV4LCAwLCBsaXN0ZW5lciApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgXHJcbiAgICAvLyBUcmFuc2l0aW9uIGZyb20gc2luZ2xlIHRvIG11bHRpcGxlIGxpc3RlbmVyc1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBfZXZlbnRzWyB0eXBlIF0gPSBpbmRleCA9PT0gMCA/XHJcbiAgICAgICAgICAgIFsgbGlzdGVuZXIsIF9ldmVudHNbIHR5cGUgXSBdIDpcclxuICAgICAgICAgICAgWyBfZXZlbnRzWyB0eXBlIF0sIGxpc3RlbmVyIF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFRyYWNrIHdhcm5pbmdzIGlmIG1heCBsaXN0ZW5lcnMgaXMgYXZhaWxhYmxlXHJcbiAgICBpZiggJ21heExpc3RlbmVycycgaW4gZW1pdHRlciAmJiAhX2V2ZW50c1sgdHlwZSBdLndhcm5lZCApe1xyXG4gICAgICAgIGNvbnN0IG1heCA9IGVtaXR0ZXIubWF4TGlzdGVuZXJzO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBtYXggJiYgbWF4ID4gMCAmJiBfZXZlbnRzWyB0eXBlIF0ubGVuZ3RoID4gbWF4ICl7XHJcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzptYXhMaXN0ZW5lcnMnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIGZhbHNlICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBFbWl0dGluZyBcIm1heExpc3RlbmVyc1wiIG1heSBoYXZlIGNoYW5nZWQgdGhlIHJlZ2lzdHJ5LlxyXG4gICAgICAgICAgICBfZXZlbnRzWyAnOm1heExpc3RlbmVycycgXSA9IGVtaXR0ZXJbICRldmVudHMgXVsgJzptYXhMaXN0ZW5lcnMnIF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBfZXZlbnRzWyB0eXBlIF0ud2FybmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGVtaXR0ZXJbICRldmVudHMgXSA9IF9ldmVudHM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5hZGRGaW5pdGVFdmVudExpc3RlbmVyXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSB0aW1lcyBUaGUgbnVtYmVyIHRpbWVzIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyByZW1vdmVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cclxuICovXHJcbmZ1bmN0aW9uIGFkZEZpbml0ZUV2ZW50TGlzdGVuZXIoIGVtaXR0ZXIsIHR5cGUsIHRpbWVzLCBsaXN0ZW5lciApe1xyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBmaW5pdGVMaXN0ZW5lcigpe1xyXG4gICAgICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuICAgICAgICByZXR1cm4gLS10aW1lcyA9PT0gMDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZmluaXRlTGlzdGVuZXIubGlzdGVuZXIgPSBsaXN0ZW5lcjtcclxuICAgIFxyXG4gICAgYWRkQ29uZGl0aW9uYWxFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBmaW5pdGVMaXN0ZW5lciApO1xyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YWRkRXZlbnRNYXBwaW5nXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgd291bGQgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudE1hcHBpbmd9IG1hcHBpbmcgVGhlIGV2ZW50IG1hcHBpbmcuXHJcbiAqL1xyXG5mdW5jdGlvbiBhZGRFdmVudE1hcHBpbmcoIGVtaXR0ZXIsIG1hcHBpbmcgKXtcclxuICAgIGNvbnN0XHJcbiAgICAgICAgdHlwZXMgPSBPYmplY3Qua2V5cyggbWFwcGluZyApLFxyXG4gICAgICAgIHR5cGVMZW5ndGggPSB0eXBlcy5sZW5ndGg7XHJcbiAgICBcclxuICAgIGxldCB0eXBlSW5kZXggPSAwLFxyXG4gICAgICAgIGhhbmRsZXIsIGhhbmRsZXJJbmRleCwgaGFuZGxlckxlbmd0aCwgdHlwZTtcclxuICAgIFxyXG4gICAgZm9yKCA7IHR5cGVJbmRleCA8IHR5cGVMZW5ndGg7IHR5cGVJbmRleCArPSAxICl7XHJcbiAgICAgICAgdHlwZSA9IHR5cGVzWyB0eXBlSW5kZXggXTtcclxuICAgICAgICBoYW5kbGVyID0gbWFwcGluZ1sgdHlwZSBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIExpc3Qgb2YgbGlzdGVuZXJzXHJcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGhhbmRsZXIgKSApe1xyXG4gICAgICAgICAgICBoYW5kbGVySW5kZXggPSAwO1xyXG4gICAgICAgICAgICBoYW5kbGVyTGVuZ3RoID0gaGFuZGxlci5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yKCA7IGhhbmRsZXJJbmRleCA8IGhhbmRsZXJMZW5ndGg7IGhhbmRsZXJJbmRleCArPSAxICl7XHJcbiAgICAgICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyWyBoYW5kbGVySW5kZXggXSwgTmFOICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBTaW5nbGUgbGlzdGVuZXJcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhZGRFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBoYW5kbGVyLCBOYU4gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5kZWZpbmVFdmVudHNQcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIHByb3BlcnR5IHdpbGwgYmUgY3JlYXRlZC5cclxuICovIFxyXG5mdW5jdGlvbiBkZWZpbmVFdmVudHNQcm9wZXJ0eSggZW1pdHRlciwgdmFsdWUgKXtcclxuICAgIGNvbnN0IGhhc0V2ZW50cyA9IGhhc093blByb3BlcnR5LmNhbGwoIGVtaXR0ZXIsICRldmVudHMgKSxcclxuICAgICAgICBlbWl0dGVyUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKCBlbWl0dGVyICk7XHJcbiAgICAgICAgXHJcbiAgICBpZiggIWhhc0V2ZW50cyB8fCAoIGVtaXR0ZXJQcm90b3R5cGUgJiYgZW1pdHRlclsgJGV2ZW50cyBdID09PSBlbWl0dGVyUHJvdG90eXBlWyAkZXZlbnRzIF0gKSApe1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJGV2ZW50cywge1xyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXHJcbiAgICAgICAgfSApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEFsbEV2ZW50c1xyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlIGVtaXR0ZWQuXHJcbiAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhIFRoZSBkYXRhIHRvIGJlIHBhc3NlZCB3aXRoIHRoZSBldmVudC5cclxuICogQHJldHVybnMge2V4dGVybmFsOmJvb2xlYW59IFdoZXRoZXIgb3Igbm90IGEgbGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlIHdhcyBleGVjdXRlZC5cclxuICogQHRocm93cyB7ZXh0ZXJuYWw6RXJyb3J9IElmIGB0eXBlYCBpcyBgZXJyb3JgIGFuZCBubyBsaXN0ZW5lcnMgYXJlIHN1YnNjcmliZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XHJcbiAgICBsZXQgZXhlY3V0ZWQgPSBmYWxzZSxcclxuICAgICAgICAvLyBJZiB0eXBlIGlzIG5vdCBhIHN0cmluZywgaW5kZXggd2lsbCBiZSBmYWxzZVxyXG4gICAgICAgIGluZGV4ID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUubGFzdEluZGV4T2YoICc6JyApO1xyXG4gICAgXHJcbiAgICAvLyBOYW1lc3BhY2VkIGV2ZW50LCBlLmcuIEVtaXQgXCJmb286YmFyOnF1eFwiLCB0aGVuIFwiZm9vOmJhclwiXHJcbiAgICB3aGlsZSggaW5kZXggPiAwICl7XHJcbiAgICAgICAgZXhlY3V0ZWQgPSAoIHR5cGUgJiYgZW1pdEV2ZW50KCBlbWl0dGVyLCB0eXBlLCBkYXRhLCBmYWxzZSApICkgfHwgZXhlY3V0ZWQ7XHJcbiAgICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKCAwLCBpbmRleCApO1xyXG4gICAgICAgIGluZGV4ID0gdHlwZS5sYXN0SW5kZXhPZiggJzonICk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEVtaXQgc2luZ2xlIGV2ZW50IG9yIHRoZSBuYW1lc3BhY2VkIGV2ZW50IHJvb3QsIGUuZy4gXCJmb29cIiwgXCI6YmFyXCIsIFN5bWJvbCggXCJAQHF1eFwiIClcclxuICAgIGV4ZWN1dGVkID0gKCB0eXBlICYmIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgdHlwZSAhPT0gJGV2ZXJ5ICkgKSB8fCBleGVjdXRlZDtcclxuICAgIFxyXG4gICAgcmV0dXJuIGV4ZWN1dGVkO1xyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEVycm9yc1xyXG4gKiBAcGFyYW0ge0VtaXR0ZXJ9IGVtaXR0ZXIgVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIGBlcnJvcnNgIHdpbGwgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtBcnJheTxleHRlcm5hbDpFcnJvcj59IGVycm9ycyBUaGUgYXJyYXkgb2YgZXJyb3JzIHRvIGJlIGVtaXR0ZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKXtcclxuICAgIGNvbnN0IGxlbmd0aCA9IGVycm9ycy5sZW5ndGg7XHJcbiAgICBmb3IoIGxldCBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XHJcbiAgICAgICAgZW1pdEV2ZW50KCBlbWl0dGVyLCAnZXJyb3InLCBbIGVycm9yc1sgaW5kZXggXSBdLCBmYWxzZSApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+ZW1pdEV2ZW50XHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGVtaXRFdmVyeSBXaGV0aGVyIG9yIG5vdCBsaXN0ZW5lcnMgZm9yIGFsbCB0eXBlcyB3aWxsIGJlIGV4ZWN1dGVkLlxyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgYSBsaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50IHR5cGUgd2FzIGV4ZWN1dGVkLlxyXG4gKiBAdGhyb3dzIHtleHRlcm5hbDpFcnJvcn0gSWYgYHR5cGVgIGlzIGBlcnJvcmAgYW5kIG5vIGxpc3RlbmVycyBhcmUgc3Vic2NyaWJlZC5cclxuICovXHJcbmZ1bmN0aW9uIGVtaXRFdmVudCggZW1pdHRlciwgdHlwZSwgZGF0YSwgZW1pdEV2ZXJ5ICl7XHJcbiAgICBjb25zdCBfZXZlbnRzID0gT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoIGVtaXR0ZXIsICRldmVudHMgKSA/IGVtaXR0ZXJbICRldmVudHMgXSA6IHVuZGVmaW5lZDtcclxuICAgIFxyXG4gICAgbGV0IGV4ZWN1dGVkID0gZmFsc2UsXHJcbiAgICAgICAgbGlzdGVuZXI7XHJcbiAgICBcclxuICAgIGlmKCB0eXBlb2YgX2V2ZW50cyAhPT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICBpZiggdHlwZSA9PT0gJ2Vycm9yJyAmJiAhX2V2ZW50cy5lcnJvciApe1xyXG4gICAgICAgICAgICBpZiggZGF0YVsgMCBdIGluc3RhbmNlb2YgRXJyb3IgKXtcclxuICAgICAgICAgICAgICAgIHRocm93IGRhdGFbIDAgXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEV4ZWN1dGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gdHlwZSBvZiBldmVudFxyXG4gICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgdHlwZSBdO1xyXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIGVtaXR0ZXIgKTtcclxuICAgICAgICAgICAgZXhlY3V0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBFeGVjdXRlIGxpc3RlbmVycyBsaXN0ZW5pbmcgZm9yIGFsbCB0eXBlcyBvZiBldmVudHNcclxuICAgICAgICBpZiggZW1pdEV2ZXJ5ICl7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyID0gX2V2ZW50c1sgJGV2ZXJ5IF07XHJcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgICAgICBleGVjdXRlTGlzdGVuZXIoIGxpc3RlbmVyLCBkYXRhLCBlbWl0dGVyICk7XHJcbiAgICAgICAgICAgICAgICBleGVjdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBleGVjdXRlZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGVzIGEgbGlzdGVuZXIgdXNpbmcgdGhlIGludGVybmFsIGBleGVjdXRlKmAgZnVuY3Rpb25zIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5leGVjdXRlTGlzdGVuZXJcclxuICogQHBhcmFtIHtBcnJheTxMaXN0ZW5lcj58TGlzdGVuZXJ9IGxpc3RlbmVyXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGFcclxuICogQHBhcmFtIHsqfSBzY29wZVxyXG4gKi8gXHJcbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0ZW5lciggbGlzdGVuZXIsIGRhdGEsIHNjb3BlICl7XHJcbiAgICBjb25zdCBpc0Z1bmN0aW9uID0gdHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nO1xyXG4gICAgXHJcbiAgICBzd2l0Y2goIGRhdGEubGVuZ3RoICl7XHJcbiAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICBsaXN0ZW5FbXB0eSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgIGxpc3Rlbk9uZSAgICAgICggbGlzdGVuZXIsIGlzRnVuY3Rpb24sIHNjb3BlLCBkYXRhWyAwIF0gKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICBsaXN0ZW5Ud28gICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0gKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICBsaXN0ZW5UaHJlZSAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YVsgMCBdLCBkYXRhWyAxIF0sIGRhdGFbIDIgXSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBsaXN0ZW5NYW55ICAgICAoIGxpc3RlbmVyLCBpc0Z1bmN0aW9uLCBzY29wZSwgZGF0YSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmdldEV2ZW50VHlwZXNcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIGV2ZW50IHR5cGVzIHdpbGwgYmUgcmV0cmlldmVkLlxyXG4gKiBAcmV0dXJucyB7QXJyYXk8RXZlbnRUeXBlPn0gVGhlIGxpc3Qgb2YgZXZlbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGUgZW1pdHRlci5cclxuICovXHJcbmZ1bmN0aW9uIGdldEV2ZW50VHlwZXMoIGVtaXR0ZXIgKXtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyggZW1pdHRlclsgJGV2ZW50cyBdICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5nZXRNYXhMaXN0ZW5lcnNcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIG1heCBsaXN0ZW5lcnMgd2lsbCBiZSByZXRyaWV2ZWQuXHJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoIGVtaXR0ZXIgKXtcclxuICAgIHJldHVybiB0eXBlb2YgZW1pdHRlclsgJG1heExpc3RlbmVycyBdICE9PSAndW5kZWZpbmVkJyA/XHJcbiAgICAgICAgZW1pdHRlclsgJG1heExpc3RlbmVycyBdIDpcclxuICAgICAgICBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSB2YWx1ZSBpcyBhIHBvc2l0aXZlIG51bWJlci5cclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+aXNQb3NpdGl2ZU51bWJlclxyXG4gKiBAcGFyYW0geyp9IG51bWJlciBUaGUgdmFsdWUgdG8gYmUgdGVzdGVkLlxyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIHZhbHVlIGlzIGEgcG9zaXRpdmUgbnVtYmVyLlxyXG4gKi9cclxuZnVuY3Rpb24gaXNQb3NpdGl2ZU51bWJlciggbnVtYmVyICl7XHJcbiAgICByZXR1cm4gdHlwZW9mIG51bWJlciA9PT0gJ251bWJlcicgJiYgbnVtYmVyID49IDAgJiYgIWlzTmFOKCBudW1iZXIgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG5vIGFyZ3VtZW50cy5cclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuRW1wdHlcclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gbGlzdGVuRW1wdHkoIGhhbmRsZXIsIGlzRnVuY3Rpb24sIGVtaXR0ZXIgKXtcclxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gICAgXHJcbiAgICBpZiggaXNGdW5jdGlvbiApe1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCggZW1pdHRlciApO1xyXG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1sgaW5kZXggXS5jYWxsKCBlbWl0dGVyICk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcclxuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGUgYSBsaXN0ZW5lciB3aXRoIG9uZSBhcmd1bWVudC5cclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+bGlzdGVuT25lXHJcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cclxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cclxuICovXHJcbmZ1bmN0aW9uIGxpc3Rlbk9uZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSApe1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBcclxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxICk7XHJcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSApO1xyXG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XHJcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0d28gYXJndW1lbnRzLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5Ud29cclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfEFycmF5PEV2ZW50TGlzdGVuZXI+fSBoYW5kbGVyIE9uZSBvciBtb3JlIHtAbGluayBFdmVudExpc3RlbmVyfGxpc3RlbmVyc30gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIG9uIHRoZSBgZW1pdHRlcmAuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6Ym9vbGVhbn0gaXNGdW5jdGlvbiBXaGV0aGVyIG9yIG5vdCB0aGUgYGhhbmRsZXJgIGlzIGEge0BsaW5rIGV4dGVybmFsOkZ1bmN0aW9ufGZ1bmN0aW9ufS5cclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyLlxyXG4gKiBAcGFyYW0geyp9IGFyZzEgVGhlIGZpcnN0IGFyZ3VtZW50LlxyXG4gKiBAcGFyYW0geyp9IGFyZzIgVGhlIHNlY29uZCBhcmd1bWVudC5cclxuICovXHJcbmZ1bmN0aW9uIGxpc3RlblR3byggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiApe1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBcclxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyICk7XHJcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiApO1xyXG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XHJcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCB0aHJlZSBhcmd1bWVudHMuXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfmxpc3RlblRocmVlXHJcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cclxuICogQHBhcmFtIHsqfSBhcmcxIFRoZSBmaXJzdCBhcmd1bWVudC5cclxuICogQHBhcmFtIHsqfSBhcmcyIFRoZSBzZWNvbmQgYXJndW1lbnQuXHJcbiAqIEBwYXJhbSB7Kn0gYXJnMyBUaGUgdGhpcmQgYXJndW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBsaXN0ZW5UaHJlZSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApe1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBcclxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKCBlbWl0dGVyLCBhcmcxLCBhcmcyLCBhcmczICk7XHJcbiAgICAgICAgfSBjYXRjaCggZXJyb3IgKXtcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBoYW5kbGVyLmxlbmd0aCxcclxuICAgICAgICAgICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxICl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnNbIGluZGV4IF0uY2FsbCggZW1pdHRlciwgYXJnMSwgYXJnMiwgYXJnMyApO1xyXG4gICAgICAgICAgICB9IGNhdGNoKCBlcnJvciApe1xyXG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goIGVycm9yICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKCBlcnJvcnMubGVuZ3RoICl7XHJcbiAgICAgICAgZW1pdEVycm9ycyggZW1pdHRlciwgZXJyb3JzICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeGVjdXRlIGEgbGlzdGVuZXIgd2l0aCBmb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn5saXN0ZW5NYW55XHJcbiAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcnxBcnJheTxFdmVudExpc3RlbmVyPn0gaGFuZGxlciBPbmUgb3IgbW9yZSB7QGxpbmsgRXZlbnRMaXN0ZW5lcnxsaXN0ZW5lcnN9IHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbiB0aGUgYGVtaXR0ZXJgLlxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOmJvb2xlYW59IGlzRnVuY3Rpb24gV2hldGhlciBvciBub3QgdGhlIGBoYW5kbGVyYCBpcyBhIHtAbGluayBleHRlcm5hbDpGdW5jdGlvbnxmdW5jdGlvbn0uXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlci5cclxuICogQHBhcmFtIHtleHRlcm5hbDpBcnJheX0gYXJncyBGb3VyIG9yIG1vcmUgYXJndW1lbnRzLlxyXG4gKi9cclxuZnVuY3Rpb24gbGlzdGVuTWFueSggaGFuZGxlciwgaXNGdW5jdGlvbiwgZW1pdHRlciwgYXJncyApe1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBcclxuICAgIGlmKCBpc0Z1bmN0aW9uICl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaGFuZGxlci5hcHBseSggZW1pdHRlciwgYXJncyApO1xyXG4gICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKCBlcnJvciApO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaGFuZGxlci5sZW5ndGgsXHJcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciggOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSApe1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzWyBpbmRleCBdLmFwcGx5KCBlbWl0dGVyLCBhcmdzICk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2goIGVycm9yICl7XHJcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCggZXJyb3IgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoIGVycm9ycy5sZW5ndGggKXtcclxuICAgICAgICBlbWl0RXJyb3JzKCBlbWl0dGVyLCBlcnJvcnMgKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBmdW5jdGlvbiBFbWl0dGVyfnJlbW92ZUV2ZW50TGlzdGVuZXJcclxuICogQHBhcmFtIHtFbWl0dGVyfSBlbWl0dGVyIFRoZSBlbWl0dGVyIG9uIHdoaWNoIHRoZSBldmVudCB3b3VsZCBiZSBlbWl0dGVkLlxyXG4gKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKCBlbWl0dGVyLCB0eXBlLCBsaXN0ZW5lciApe1xyXG4gICAgY29uc3QgaGFuZGxlciA9IGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xyXG4gICAgXHJcbiAgICBpZiggaGFuZGxlciA9PT0gbGlzdGVuZXIgfHwgKCB0eXBlb2YgaGFuZGxlci5saXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJiBoYW5kbGVyLmxpc3RlbmVyID09PSBsaXN0ZW5lciApICl7XHJcbiAgICAgICAgZGVsZXRlIGVtaXR0ZXJbICRldmVudHMgXVsgdHlwZSBdO1xyXG4gICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XHJcbiAgICAgICAgICAgIGVtaXRFdmVudCggZW1pdHRlciwgJzpvZmYnLCBbIHR5cGUsIGxpc3RlbmVyIF0sIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmKCBBcnJheS5pc0FycmF5KCBoYW5kbGVyICkgKXtcclxuICAgICAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IoIGxldCBpID0gaGFuZGxlci5sZW5ndGg7IGktLSA+IDA7ICl7XHJcbiAgICAgICAgICAgIGlmKCBoYW5kbGVyWyBpIF0gPT09IGxpc3RlbmVyIHx8ICggaGFuZGxlclsgaSBdLmxpc3RlbmVyICYmIGhhbmRsZXJbIGkgXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIgKSApe1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICBpZiggaW5kZXggPiAtMSApe1xyXG4gICAgICAgICAgICBpZiggaGFuZGxlci5sZW5ndGggPT09IDEgKXtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbWl0dGVyWyAkZXZlbnRzIF1bIHR5cGUgXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNwbGljZUxpc3QoIGhhbmRsZXIsIGluZGV4ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCBlbWl0dGVyWyAkZXZlbnRzIF1bICc6b2ZmJyBdICl7XHJcbiAgICAgICAgICAgICAgICBlbWl0RXZlbnQoIGVtaXR0ZXIsICc6b2ZmJywgWyB0eXBlLCBsaXN0ZW5lciBdLCBmYWxzZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c2V0TWF4TGlzdGVuZXJzXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIgb24gd2hpY2ggdGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyB3aWxsIGJlIHNldC5cclxuICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IG1heCBUaGUgbWF4aW11bSBudW1iZXIgb2YgbGlzdGVuZXJzIGJlZm9yZSBhIHdhcm5pbmcgaXMgaXNzdWVkLlxyXG4gKi9cclxuZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCBlbWl0dGVyLCBtYXggKXtcclxuICAgIGlmKCAhaXNQb3NpdGl2ZU51bWJlciggbWF4ICkgKXtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbWF4IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZW1pdHRlciwgJG1heExpc3RlbmVycywge1xyXG4gICAgICAgIHZhbHVlOiBtYXgsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXHJcbiAgICB9ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGYXN0ZXIgdGhhbiBgQXJyYXkucHJvdG90eXBlLnNwbGljZWBcclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+c3BsaWNlTGlzdFxyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBsaXN0XHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBpbmRleFxyXG4gKi8gXHJcbmZ1bmN0aW9uIHNwbGljZUxpc3QoIGxpc3QsIGluZGV4ICl7XHJcbiAgICBmb3IoIGxldCBpID0gaW5kZXgsIGogPSBpICsgMSwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGogPCBsZW5ndGg7IGkgKz0gMSwgaiArPSAxICl7XHJcbiAgICAgICAgbGlzdFsgaSBdID0gbGlzdFsgaiBdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsaXN0LnBvcCgpO1xyXG59XHJcblxyXG4vKipcclxuICogQXN5bmNocm9ub3VzbHkgZXhlY3V0ZXMgYSBmdW5jdGlvbi5cclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dGlja1xyXG4gKiBAcGFyYW0ge2V4dGVybmFsOkZ1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aWNrKCBjYWxsYmFjayApe1xyXG4gICAgcmV0dXJuIHNldFRpbWVvdXQoIGNhbGxiYWNrLCAwICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlcn50aWNrQWxsRXZlbnRzXHJcbiAqIEBwYXJhbSB7RW1pdHRlcn0gZW1pdHRlciBUaGUgZW1pdHRlciBvbiB3aGljaCB0aGUgZXZlbnQgYHR5cGVgIHdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZW1pdHRlZC5cclxuICogQHBhcmFtIHtFdmVudFR5cGV9IHR5cGUgVGhlIGV2ZW50IHR5cGUuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6QXJyYXl9IGRhdGEgVGhlIGRhdGEgdG8gYmUgcGFzc2VkIHdpdGggdGhlIGV2ZW50LlxyXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZX0gQSBwcm9taXNlIHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXHJcbiAqL1xyXG5mdW5jdGlvbiB0aWNrQWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICl7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKCByZXNvbHZlLCByZWplY3QgKXtcclxuICAgICAgICB0aWNrKCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBlbWl0QWxsRXZlbnRzKCBlbWl0dGVyLCB0eXBlLCBkYXRhICkgPyByZXNvbHZlKCkgOiByZWplY3QoKTtcclxuICAgICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIGEgYHNlbGVjdGlvbmAgb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIHRoZSBgdGFyZ2V0YC5cclxuICogQGZ1bmN0aW9uIEVtaXR0ZXJ+dG9FbWl0dGVyXHJcbiAqIEBwYXJhbSB7QVBJUmVmZXJlbmNlfSBbc2VsZWN0aW9uXSBBIHNlbGVjdGlvbiBvZiB0aGUgRW1pdHRlci5qcyBBUEkuXHJcbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6T2JqZWN0fSB0YXJnZXQgVGhlIG9iamVjdCBvbiB3aGljaCB0aGUgQVBJIHdpbGwgYmUgYXBwbGllZC5cclxuICovXHJcbmZ1bmN0aW9uIHRvRW1pdHRlciggc2VsZWN0aW9uLCB0YXJnZXQgKXtcclxuICAgIFxyXG4gICAgLy8gQXBwbHkgdGhlIGVudGlyZSBFbWl0dGVyIEFQSVxyXG4gICAgaWYoIHNlbGVjdGlvbiA9PT0gQVBJICl7XHJcbiAgICAgICAgYXNFbWl0dGVyLmNhbGwoIHRhcmdldCApO1xyXG4gICAgXHJcbiAgICAvLyBBcHBseSBvbmx5IHRoZSBzZWxlY3RlZCBBUEkgbWV0aG9kc1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgaW5kZXgsIGtleSwgbWFwcGluZywgbmFtZXMsIHZhbHVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0eXBlb2Ygc2VsZWN0aW9uID09PSAnc3RyaW5nJyApe1xyXG4gICAgICAgICAgICBuYW1lcyA9IHNlbGVjdGlvbi5zcGxpdCggJyAnICk7XHJcbiAgICAgICAgICAgIG1hcHBpbmcgPSBBUEk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmFtZXMgPSBPYmplY3Qua2V5cyggc2VsZWN0aW9uICk7XHJcbiAgICAgICAgICAgIG1hcHBpbmcgPSBzZWxlY3Rpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGluZGV4ID0gbmFtZXMubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlKCBpbmRleC0tICl7XHJcbiAgICAgICAgICAgIGtleSA9IG5hbWVzWyBpbmRleCBdO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IG1hcHBpbmdbIGtleSBdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA6XHJcbiAgICAgICAgICAgICAgICBBUElbIHZhbHVlIF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSBmdW5jdGlvbmFsIG1peGluIHRoYXQgcHJvdmlkZXMgdGhlIEVtaXR0ZXIuanMgQVBJIHRvIGl0cyB0YXJnZXQuIFRoZSBgY29uc3RydWN0b3IoKWAsIGBkZXN0cm95KClgLCBgdG9KU09OKClgLCBgdG9TdHJpbmcoKWAsIGFuZCBzdGF0aWMgcHJvcGVydGllcyBvbiBgRW1pdHRlcmAgYXJlIG5vdCBwcm92aWRlZC4gVGhpcyBtaXhpbiBpcyB1c2VkIHRvIHBvcHVsYXRlIHRoZSBgcHJvdG90eXBlYCBvZiBgRW1pdHRlcmAuXHJcbiAqIFxyXG4gKiBMaWtlIGFsbCBmdW5jdGlvbmFsIG1peGlucywgdGhpcyBzaG91bGQgYmUgZXhlY3V0ZWQgd2l0aCBbY2FsbCgpXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9jYWxsKSBvciBbYXBwbHkoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYXBwbHkpLlxyXG4gKiBAbWl4aW4gRW1pdHRlcn5hc0VtaXR0ZXJcclxuICogQHNpbmNlIDEuMS4wXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIEVtaXR0ZXIgZnVuY3Rpb25hbGl0eTwvY2FwdGlvbj5cclxuICogLy8gQ3JlYXRlIGEgYmFzZSBvYmplY3RcclxuICogY29uc3QgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcclxuICogXHJcbiAqIC8vIEFwcGx5IHRoZSBtaXhpblxyXG4gKiBhc0VtaXR0ZXIuY2FsbCggZ3JlZXRlciApO1xyXG4gKiBcclxuICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdXb3JsZCcgKTtcclxuICogLy8gSGVsbG8sIFdvcmxkIVxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5BcHBseWluZyBjaGFvcyB0byB5b3VyIHdvcmxkPC9jYXB0aW9uPlxyXG4gKiAvLyBOTyEhIVxyXG4gKiBhc0VtaXR0ZXIoKTsgLy8gTWFkbmVzcyBlbnN1ZXNcclxuICovXHJcbmZ1bmN0aW9uIGFzRW1pdHRlcigpe1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgYXQgdGhlIHNwZWNpZmllZCBgaW5kZXhgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXHJcbiAgICAgKiBcclxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIuYXRcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOm51bWJlcn0gaW5kZXggV2hlcmUgdGhlIGxpc3RlbmVyIHdpbGwgYmUgYWRkZWQgaW4gdGhlIHRyaWdnZXIgbGlzdC5cclxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDIuMC4wXHJcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cclxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcclxuICAgICAqL1xyXG4gICAgdGhpcy5hdCA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBpbmRleCwgbGlzdGVuZXIgKXtcclxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcclxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdudW1iZXInICYmIHR5cGVvZiBpbmRleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyID0gaW5kZXg7XHJcbiAgICAgICAgICAgIGluZGV4ID0gdHlwZTtcclxuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoICFpc1Bvc2l0aXZlTnVtYmVyKCBpbmRleCApICl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdpbmRleCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBpbmRleCApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmNsZWFyXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5DbGVhcmluZyBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hpIScgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAgICAgKiAvLyBIZWxsbyFcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xyXG4gICAgICogLy8gSGkhXHJcbiAgICAgKiBncmVldGVyLmNsZWFyKCk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJyApO1xyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2xlYXJpbmcgYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbigge1xyXG4gICAgICogICdoZWxsbycgOiBmdW5jdGlvbigpeyBjb25zb2xlLmxvZyggJ0hlbGxvIScgKTsgfSxcclxuICAgICAqICAnaGknICAgIDogZnVuY3Rpb24oKXsgY29uc29sZS5sb2coICdIaSEnICk7IH1cclxuICAgICAqIH0gKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xyXG4gICAgICogLy8gSGVsbG8hXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcclxuICAgICAqIC8vIEhpIVxyXG4gICAgICogZ3JlZXRlci5jbGVhciggJ2hlbGxvJyApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScgKTtcclxuICAgICAqIC8vIEhpIVxyXG4gICAgICovXHJcbiAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuICAgICAgICBsZXQgaGFuZGxlcjtcclxuICAgICAgICBcclxuICAgICAgICAvLyBObyBFdmVudHNcclxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSApe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gV2l0aCBubyBcIm9mZlwiIGxpc3RlbmVycywgY2xlYXJpbmcgY2FuIGJlIHNpbXBsaWZpZWRcclxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXVsgJzpvZmYnIF0gKXtcclxuICAgICAgICAgICAgaWYoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKXtcclxuICAgICAgICAgICAgICAgIHRoaXNbICRldmVudHMgXSA9IG5ldyBOdWxsKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiggdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENsZWFyIGFsbCBsaXN0ZW5lcnNcclxuICAgICAgICBpZiggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApe1xyXG4gICAgICAgICAgICBjb25zdCB0eXBlcyA9IGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEF2b2lkIHJlbW92aW5nIFwib2ZmXCIgbGlzdGVuZXJzIHVudGlsIGFsbCBvdGhlciB0eXBlcyBoYXZlIGJlZW4gcmVtb3ZlZFxyXG4gICAgICAgICAgICBmb3IoIGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVzLmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEgKXtcclxuICAgICAgICAgICAgICAgIGlmKCB0eXBlc1sgaW5kZXggXSA9PT0gJzpvZmYnICl7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIoIHR5cGVzWyBpbmRleCBdICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGNsZWFyIFwib2ZmXCJcclxuICAgICAgICAgICAgdGhpcy5jbGVhciggJzpvZmYnICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzWyAkZXZlbnRzIF0gPSBuZXcgTnVsbCgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGhhbmRsZXIgPSB0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXTtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgaGFuZGxlciApO1xyXG4gICAgICAgIH0gZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaGFuZGxlciApICl7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGhhbmRsZXIubGVuZ3RoO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgd2hpbGUoIGluZGV4LS0gKXtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGhhbmRsZXJbIGluZGV4IF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBkZWxldGUgdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEV4ZWN1dGUgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgd2l0aCB0aGUgc3VwcGxpZWQgYXJndW1lbnRzLlxyXG4gICAgICogXHJcbiAgICAgKiBUaGUgYHR5cGVgIGNhbiBiZSBuYW1lc3BhY2VkIHVzaW5nIGA6YCwgd2hpY2ggd2lsbCByZXN1bHQgaW4gbXVsdGlwbGUgZXZlbnRzIGJlaW5nIHRyaWdnZXJlZCBpbiBzdWNjZXNzaW9uLiBMaXN0ZW5lcnMgY2FuIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZnVsbHkgbmFtZXNwYWNlZCBgdHlwZWAgb3IgYSBzdWJzZXQgb2YgdGhlIGB0eXBlYC5cclxuICAgICAqIFxyXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmVtaXRcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHsuLi4qfSBbZGF0YV0gVGhlIGRhdGEgcGFzc2VkIGludG8gdGhlIGxpc3RlbmVycy5cclxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycy5cclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+RW1pdHRpbmcgYW4gZXZlbnQ8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTsgICAgLy8gdHJ1ZVxyXG4gICAgICogLy8gSGVsbG8hXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApOyAgLy8gZmFsc2VcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkVtaXR0aW5nIGFuIGV2ZW50IHdpdGggZGF0YTwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XHJcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5FbWl0dGluZyBhIG5hbWVzcGFjZWQgZXZlbnQ8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcclxuICAgICAqIFxyXG4gICAgICogLy8gVGhpcyBldmVudCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgYnkgZW1pdHRpbmcgXCJncmVldGluZzpoZWxsb1wiXHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvIGFnYWluLCAkeyBuYW1lIH1gICk7XHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhpJywgJ01hcmsnICk7XHJcbiAgICAgKiAvLyBIaSwgTWFyayFcclxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dyZWV0aW5nOmhlbGxvJywgJ0plZmYnICk7XHJcbiAgICAgKiAvLyBIZWxsbywgSmVmZiFcclxuICAgICAqIC8vIEplZmYgd2FzIGdyZWV0ZWQuXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZW1pdCA9IGZ1bmN0aW9uKCB0eXBlICl7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBbXSxcclxuICAgICAgICAgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcclxuICAgICAgICBcclxuICAgICAgICBpZiggbGVuZ3RoID4gMSApe1xyXG4gICAgICAgICAgICBkYXRhID0gQXJyYXkoIGxlbmd0aCAtIDEgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGZvciggbGV0IGtleSA9IDE7IGtleSA8IGxlbmd0aDsga2V5KysgKXtcclxuICAgICAgICAgICAgICAgIGRhdGFbIGtleSAtIDEgXSA9IGFyZ3VtZW50c1sga2V5IF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmV2ZW50VHlwZXNcclxuICAgICAqIEByZXR1cm5zIHtBcnJheTxFdmVudFR5cGU+fSBUaGUgbGlzdCBvZiBldmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDIuMC4wXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvYCApICk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGknLCAoKSA9PiBjb25zb2xlLmxvZyggYEhpYCApICk7XHJcbiAgICAgKiBcclxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmV2ZW50VHlwZXMoKSApO1xyXG4gICAgICogLy8gWyAnaGVsbG8nLCAnaGknIF1cclxuICAgICAqLyBcclxuICAgIHRoaXMuZXZlbnRUeXBlcyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIGdldEV2ZW50VHlwZXMoIHRoaXMgKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLmZpcnN0XHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDIuMC4wXHJcbiAgICAgKi9cclxuICAgIHRoaXMuZmlyc3QgPSBmdW5jdGlvbiggdHlwZSA9ICRldmVyeSwgbGlzdGVuZXIgKXtcclxuICAgICAgICAvLyBTaGlmdCBhcmd1bWVudHMgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcclxuICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAndW5kZWZpbmVkJyApe1xyXG4gICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGU7XHJcbiAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIsIDAgKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQnkgZGVmYXVsdCBFbWl0dGVyIHdpbGwgZW1pdCBhIGA6bWF4TGlzdGVuZXJzYCBldmV0IGlmIG1vcmUgdGhhbiAqKjEwKiogbGlzdGVuZXJzIGFyZSBhZGRlZCBmb3IgYSBwYXJ0aWN1bGFyIGV2ZW50IGB0eXBlYC4gVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZS5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5nZXRNYXhMaXN0ZW5lcnNcclxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBtYXhpbXVtIG51bWJlciBvZiBsaXN0ZW5lcnMuXHJcbiAgICAgKiBAc2luY2UgMi4wLjBcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIFxyXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIuZ2V0TWF4TGlzdGVuZXJzKCkgKTtcclxuICAgICAqIC8vIDEwXHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIuc2V0TWF4TGlzdGVuZXJzKCA1ICk7XHJcbiAgICAgKiBcclxuICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLmdldE1heExpc3RlbmVycygpICk7XHJcbiAgICAgKiAvLyA1XHJcbiAgICAgKi9cclxuICAgIHRoaXMuZ2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lckNvdW50XHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEByZXR1cm5zIHtleHRlcm5hbDpudW1iZXJ9IFRoZSBudW1iZXIgb2YgbGlzdGVuZXJzIGZvciB0aGF0IGV2ZW50IHR5cGUgd2l0aGluIHRoZSBnaXZlbiBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJDb3VudCggJ2hlbGxvJyApICk7XHJcbiAgICAgKiAvLyAxXHJcbiAgICAgKiBjb25zb2xlLmxvZyggZ3JlZXRlci5saXN0ZW5lckNvdW50KCAnZ29vZGJ5ZScgKSApO1xyXG4gICAgICogLy8gMFxyXG4gICAgICovIFxyXG4gICAgdGhpcy5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuICAgICAgICBsZXQgY291bnQ7XHJcblxyXG4gICAgICAgIC8vIEVtcHR5XHJcbiAgICAgICAgaWYoICF0aGlzWyAkZXZlbnRzIF0gfHwgIXRoaXNbICRldmVudHMgXVsgdHlwZSBdICl7XHJcbiAgICAgICAgICAgIGNvdW50ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBGdW5jdGlvblxyXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIHRoaXNbICRldmVudHMgXVsgdHlwZSBdID09PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBBcnJheVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvdW50ID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5saXN0ZW5lcnNcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHJldHVybnMge2V4dGVybmFsOm51bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgZm9yIHRoYXQgZXZlbnQgdHlwZSB3aXRoaW4gdGhlIGdpdmVuIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zdCBoZWxsbyA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgKiAgY29uc29sZS5sb2coICdIZWxsbyEnICk7XHJcbiAgICAgKiB9LFxyXG4gICAgICogIGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogXHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCBoZWxsbyApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAgICAgKiAvLyBIZWxsbyFcclxuICAgICAqIFxyXG4gICAgICogY29uc29sZS5sb2coIGdyZWV0ZXIubGlzdGVuZXJzKCAnaGVsbG8nIClbIDAgXSA9PT0gaGVsbG8gKTtcclxuICAgICAqIC8vIHRydWVcclxuICAgICAqLyBcclxuICAgIHRoaXMubGlzdGVuZXJzID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuICAgICAgICBsZXQgbGlzdGVuZXJzO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCAhdGhpc1sgJGV2ZW50cyBdIHx8ICF0aGlzWyAkZXZlbnRzIF1bIHR5cGUgXSApe1xyXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiggdHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gWyBoYW5kbGVyIF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVycztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgKm1hbnkgdGltZSogbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuIEFmdGVyIHRoZSBsaXN0ZW5lciBpcyBpbnZva2VkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGB0aW1lc2AsIGl0IGlzIHJlbW92ZWQuXHJcbiAgICAgKiBObyBjaGVja3MgYXJlIG1hZGUgdG8gc2VlIGlmIHRoZSBgbGlzdGVuZXJgIGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQuIE11bHRpcGxlIGNhbGxzIHBhc3NpbmcgdGhlIHNhbWUgY29tYmluYXRpb24gYHR5cGVgIGFuZCBgbGlzdGVuZXJgIHdpbGwgcmVzdWx0IGluIHRoZSBgbGlzdGVuZXJgIGJlaW5nIGFkZGVkIG11bHRpcGxlIHRpbWVzLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLm1hbnlcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSB0eXBlIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtleHRlcm5hbDpudW1iZXJ9IHRpbWVzIFRoZSBudW1iZXIgdGltZXMgdGhlIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIHJlbW92ZWQuXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIHRvIGFueSBldmVudCB0eXBlIGEgc2V0IG51bWJlciBvZiB0aW1lczwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5tYW55KCAyLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAvLyAxXHJcbiAgICAgKiAvLyBHcmVldGVkIEplZmZcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ1RlcnJ5JyApOyAgICAgIC8vIDJcclxuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ3lvJywgJ1N0ZXZlJyApOyAgICAgIC8vIDNcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgYSBzZXQgbnVtYmVyIG9mIHRpbWVzPC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm1hbnkoICdoZWxsbycsIDIsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7ICAgIC8vIDFcclxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnVGVycnknICk7ICAgLy8gMlxyXG4gICAgICogLy8gSGVsbG8sIFRlcnJ5IVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnU3RldmUnICk7ICAgLy8gM1xyXG4gICAgICovIFxyXG4gICAgdGhpcy5tYW55ID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIHRpbWVzLCBsaXN0ZW5lciApe1xyXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aW1lcztcclxuICAgICAgICAgICAgdGltZXMgPSB0eXBlO1xyXG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggIWlzUG9zaXRpdmVOdW1iZXIoIHRpbWVzICkgKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ3RpbWVzIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCB0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvciggJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgYWRkRmluaXRlRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgdGltZXMsIGxpc3RlbmVyICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIGBsaXN0ZW5lcmAgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gaXQgaXMgYXNzdW1lZCB0aGUgYGxpc3RlbmVyYCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGEgc3BlY2lmaWMgYHR5cGVgLlxyXG4gICAgICogXHJcbiAgICAgKiBJZiBhbnkgc2luZ2xlIGxpc3RlbmVyIGhhcyBiZWVuIGFkZGVkIG11bHRpcGxlIHRpbWVzIGZvciB0aGUgc3BlY2lmaWVkIGB0eXBlYCwgdGhlbiBgZW1pdHRlci5vZmYoKWAgbXVzdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gcmVtb3ZlIGVhY2ggaW5zdGFuY2UuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIub2ZmXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b2ZmXHJcbiAgICAgKiBAZXhhbXBsZSA8Y2FwdGlvbj5SZW1vdmUgYSBsaXN0ZW5lciBmcm9tIGFueSBldmVudCB0eXBlPC9jYXB0aW9uPlxyXG4gICAgICogZnVuY3Rpb24gZ3JlZXQoIG5hbWUgKXtcclxuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0aW5ncywgJHsgbmFtZSB9IWAgKTtcclxuICAgICAqIH1cclxuICAgICAqIFxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCBncmVldCApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICdKZWZmJyApO1xyXG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGknICdKZWZmJyApO1xyXG4gICAgICogLy8gR3JlZXRpbmdzLCBKZWZmIVxyXG4gICAgICogZ3JlZXRlci5vZmYoIGdyZWV0ICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICd5bycsICdKZWZmJyApO1xyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+UmVtb3ZlIGEgbGlzdGVuZXIgZnJvbSBhIHNwZWNpZmllZCBldmVudCB0eXBlPC9jYXB0aW9uPlxyXG4gICAgICogZnVuY3Rpb24gaGVsbG8oIG5hbWUgKXtcclxuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xyXG4gICAgICogfVxyXG4gICAgICogXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsIGhlbGxvICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApO1xyXG4gICAgICogLy8gSGVsbG8sIEplZmYhXHJcbiAgICAgKiBncmVldGVyLm9mZiggJ2hlbGxvJywgaGVsbG8gKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XHJcbiAgICAgKi8gXHJcbiAgICB0aGlzLm9mZiA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xyXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcclxuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggIXRoaXNbICRldmVudHMgXSB8fCAhdGhpc1sgJGV2ZW50cyBdWyB0eXBlIF0gKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoIHRoaXMsIHR5cGUsIGxpc3RlbmVyICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAuIElmIG5vIGB0eXBlYCBpcyBnaXZlbiB0aGUgbGlzdGVuZXIgd2lsbCBiZSB0cmlnZ2VyZWQgYW55IGV2ZW50IGB0eXBlYC5cclxuICAgICAqIFxyXG4gICAgICogTm8gY2hlY2tzIGFyZSBtYWRlIHRvIHNlZSBpZiB0aGUgYGxpc3RlbmVyYCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLiBNdWx0aXBsZSBjYWxscyBwYXNzaW5nIHRoZSBzYW1lIGNvbWJpbmF0aW9uIGB0eXBlYCBhbmQgYGxpc3RlbmVyYCB3aWxsIHJlc3VsdCBpbiB0aGUgYGxpc3RlbmVyYCBiZWluZyBhZGRlZCBtdWx0aXBsZSB0aW1lcy5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vblxyXG4gICAgICogQHBhcmFtIHtFdmVudFR5cGV9IFt0eXBlXSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7RXZlbnRMaXN0ZW5lcn0gbGlzdGVuZXIgVGhlIGV2ZW50IGNhbGxiYWNrLlxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9IFRoZSBlbWl0dGVyLlxyXG4gICAgICogQHNpbmNlIDEuMC4wXHJcbiAgICAgKiBAZmlyZXMgRW1pdHRlciM6b25cclxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzptYXhMaXN0ZW5lcnNcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkxpc3RlbiB0byBhbGwgZXZlbnQgdHlwZXM8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAgICAgKiAvLyBHcmVldGVkXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xyXG4gICAgICogLy8gR3JlZXRlZFxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuZXIgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZTwvY2FwdGlvbj5cclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XHJcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoaScsICdXb3JsZCcgKTtcclxuICAgICAqL1xyXG4gICAgdGhpcy5vbiA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgbGV0IHR5cGUgPSBhcmd1bWVudHNbIDAgXSB8fCAkZXZlcnksXHJcbiAgICAgICAgICAgIGxpc3RlbmVyID0gYXJndW1lbnRzWyAxIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFR5cGUgbm90IHByb3ZpZGVkLCBmYWxsIGJhY2sgdG8gXCIkZXZlcnlcIlxyXG4gICAgICAgICAgICBpZiggdHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcclxuICAgICAgICAgICAgICAgIHR5cGUgPSAkZXZlcnk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3Qgb2YgZXZlbnQgYmluZGluZ3NcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICAgICAgICAgIGFkZEV2ZW50TWFwcGluZyggdGhpcywgdHlwZSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBhZGRFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgTmFOICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5vbmNlXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gW3R5cGVdIFRoZSBldmVudCB0eXBlLlxyXG4gICAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lciBUaGUgZXZlbnQgY2FsbGJhY2suXHJcbiAgICAgKiBAcmV0dXJucyB7RW1pdHRlcn0gVGhlIGVtaXR0ZXIuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBmaXJlcyBFbWl0dGVyIzpvblxyXG4gICAgICogQGZpcmVzIEVtaXR0ZXIjOm1heExpc3RlbmVyc1xyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uY2UoICgpID0+IGNvbnNvbGUubG9nKCAnR3JlZXRlZCcgKSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nICk7XHJcbiAgICAgKiAvLyBHcmVldGVkXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdnb29kYnllJyApO1xyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+TGlzdGVuIG9uY2UgdG8gYWxsIGV2ZW50IHR5cGVzPC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uY2UoICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1dvcmxkJyApO1xyXG4gICAgICogLy8gSGVsbG8sIFdvcmxkIVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XHJcbiAgICAgKi9cclxuICAgIHRoaXMub25jZSA9IGZ1bmN0aW9uKCB0eXBlID0gJGV2ZXJ5LCBsaXN0ZW5lciApe1xyXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50cyBpZiB0eXBlIGlzIG5vdCBwcm92aWRlZFxyXG4gICAgICAgIGlmKCB0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgbGlzdGVuZXIgPT09ICd1bmRlZmluZWQnICl7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZTtcclxuICAgICAgICAgICAgdHlwZSA9ICRldmVyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCAnbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBhZGRGaW5pdGVFdmVudExpc3RlbmVyKCB0aGlzLCB0eXBlLCAxLCBsaXN0ZW5lciApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBCeSBkZWZhdWx0IEVtaXR0ZXIgd2lsbCBlbWl0IGEgYDptYXhMaXN0ZW5lcnNgIGV2ZXQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIG1ldGhvZCBhbGxvd3MgdGhhdCB0byBiZSBjaGFuZ2VkLiBTZXQgdG8gKiowKiogZm9yIHVubGltaXRlZC5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci5zZXRNYXhMaXN0ZW5lcnNcclxuICAgICAqIEBwYXJhbSB7ZXh0ZXJuYWw6bnVtYmVyfSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBiZWZvcmUgYSB3YXJuaW5nIGlzIGlzc3VlZC5cclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cclxuICAgICAqIEBzaW5jZSAyLjAuMFxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogXHJcbiAgICAgKiBncmVldGVyLnNldE1heExpc3RlbmVycyggMSApO1xyXG4gICAgICogXHJcbiAgICAgKiBncmVldGVyLm9uKCAnOm1heExpc3RlbmVycycsICggZ3JlZXRpbmcgKSA9PiBjb25zb2xlLmxvZyggYEdyZWV0aW5nIFwiJHsgZ3JlZXRpbmcgfVwiIGhhcyBvbmUgdG9vIG1hbnkhYCApICk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gICAgICogZ3JlZXRlci5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcclxuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxyXG4gICAgICovXHJcbiAgICB0aGlzLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKCBtYXggKXtcclxuICAgICAgICBzZXRNYXhMaXN0ZW5lcnMoIHRoaXMsIG1heCApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBBc3luY2hyb25vdXNseSBlbWl0cyBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGFyZ3VtZW50cy4gVGhlIGxpc3RlbmVycyB3aWxsIHN0aWxsIGJlIHN5bmNocm9ub3VzbHkgZXhlY3V0ZWQgaW4gdGhlIHNwZWNpZmllZCBvcmRlci5cclxuICAgICAqIFxyXG4gICAgICogVGhlIGB0eXBlYCBjYW4gYmUgbmFtZXNwYWNlZCB1c2luZyBgOmAsIHdoaWNoIHdpbGwgcmVzdWx0IGluIG11bHRpcGxlIGV2ZW50cyBiZWluZyB0cmlnZ2VyZWQgaW4gc3VjY2Vzc2lvbi4gTGlzdGVuZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGZ1bGx5IG5hbWVzcGFjZWQgYHR5cGVgIG9yIGEgc3Vic2V0IG9mIHRoZSBgdHlwZWAuXHJcbiAgICAgKiBcclxuICAgICAqIFJldHVybnMge0BsaW5rIGV4dGVybmFsOlByb21pc2V8cHJvbWlzZX0gd2hpY2ggKnJlc29sdmVzKiBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgKnJlamVjdHMqIG90aGVyd2lzZS5cclxuICAgICAqIEBmdW5jdGlvbiBFbWl0dGVyfmFzRW1pdHRlci50aWNrXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50VHlwZX0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cclxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2RhdGFdIFRoZSBkYXRhIHBhc3NlZCBpbnRvIHRoZSBsaXN0ZW5lcnMuXHJcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6UHJvbWlzZX0gQSBwcm9taXNlIHdoaWNoICpyZXNvbHZlcyogaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsICpyZWplY3RzKiBvdGhlcndpc2UuXHJcbiAgICAgKiBAc2luY2UgMi4wLjBcclxuICAgICAqIEBleGFtcGxlIDxjYXB0aW9uPkFzeW5jaHJvbm91c2x5IGVtaXR0aW5nIGFuIGV2ZW50PC9jYXB0aW9uPlxyXG4gICAgICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gICAgICogZ3JlZXRlci50aWNrKCAnaGVsbG8nICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnaGVsbG8gaGVhcmQ/ICcsIGhlYXJkICkgKTtcclxuICAgICAqIGdyZWV0ZXIudGljayggJ2dvb2RieWUnICkudGhlbiggKCBoZWFyZCApID0+IGNvbnNvbGUubG9nKCAnZ29vZGJ5ZSBoZWFyZD8gJywgaGVhcmQgKSApO1xyXG4gICAgICogLy8gSGVsbG8hXHJcbiAgICAgKiAvLyBoZWxsbyBoZWFyZD8gdHJ1ZVxyXG4gICAgICogLy8gZ29vZGJ5ZSBoZWFyZD8gZmFsc2VcclxuICAgICAqL1xyXG4gICAgdGhpcy50aWNrID0gZnVuY3Rpb24oIHR5cGUgKXtcclxuICAgICAgICBsZXQgZGF0YSA9IFtdLFxyXG4gICAgICAgICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBsZW5ndGggPiAxICl7XHJcbiAgICAgICAgICAgIGRhdGEgPSBBcnJheSggbGVuZ3RoIC0gMSApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yKCBsZXQga2V5ID0gMTsga2V5IDwgbGVuZ3RoOyBrZXkrKyApe1xyXG4gICAgICAgICAgICAgICAgZGF0YVsga2V5IC0gMSBdID0gYXJndW1lbnRzWyBrZXkgXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGlja0FsbEV2ZW50cyggdGhpcywgdHlwZSwgZGF0YSApO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBFeGVjdXRlIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgYHR5cGVgIHdpdGggdGhlIHN1cHBsaWVkIGBkYXRhYC5cclxuICAgICAqIFxyXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGBmYWxzZWAgb3RoZXJ3aXNlLlxyXG4gICAgICogQGZ1bmN0aW9uIEVtaXR0ZXJ+YXNFbWl0dGVyLnRyaWdnZXJcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0ge2V4dGVybmFsOkFycmF5fSBkYXRhXHJcbiAgICAgKiBAcmV0dXJucyB7ZXh0ZXJuYWw6Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMuXHJcbiAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2hlbGxvJywgWyAnV29ybGQnIF0gKTtcclxuICAgICAqIC8vIEhlbGxvLCBXb3JsZCFcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoZWxsbycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZzpoaScsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcclxuICAgICAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcclxuICAgICAqIFxyXG4gICAgICogZ3JlZXRlci50cmlnZ2VyKCAnZ3JlZXRpbmc6aGknLCBbICdNYXJrJyBdICk7XHJcbiAgICAgKiAvLyBIaSwgTWFyayFcclxuICAgICAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXHJcbiAgICAgKiBcclxuICAgICAqIGdyZWV0ZXIudHJpZ2dlciggJ2dyZWV0aW5nOmhlbGxvJywgWyAnSmVmZicgXSApO1xyXG4gICAgICogLy8gSGVsbG8sIEplZmYhXHJcbiAgICAgKiAvLyBKZWZmIHdhcyBncmVldGVkLlxyXG4gICAgICovXHJcbiAgICB0aGlzLnRyaWdnZXIgPSBmdW5jdGlvbiggdHlwZSwgZGF0YSA9IFtdICl7XHJcbiAgICAgICAgcmV0dXJuIGVtaXRBbGxFdmVudHMoIHRoaXMsIHR5cGUsIGRhdGEgKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBgdHlwZWAgdGhhdCB3aWxsIGJlIHRyaWdnZXJlZCAqdW50aWwqIHRoZSBgbGlzdGVuZXJgIHJldHVybnMgYHRydWVgLiBJZiBubyBgdHlwZWAgaXMgZ2l2ZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgdHJpZ2dlcmVkIGFueSBldmVudCBgdHlwZWAuXHJcbiAgICAgKiBcclxuICAgICAqIE5vIGNoZWNrcyBhcmUgbWFkZSB0byBzZWUgaWYgdGhlIGBsaXN0ZW5lcmAgaGFzIGFscmVhZHkgYmVlbiBhZGRlZC4gTXVsdGlwbGUgY2FsbHMgcGFzc2luZyB0aGUgc2FtZSBjb21iaW5hdGlvbiBgdHlwZWAgYW5kIGBsaXN0ZW5lcmAgd2lsbCByZXN1bHQgaW4gdGhlIGBsaXN0ZW5lcmAgYmVpbmcgYWRkZWQgbXVsdGlwbGUgdGltZXMuXHJcbiAgICAgKiBAZnVuY3Rpb24gRW1pdHRlcn5hc0VtaXR0ZXIudW50aWxcclxuICAgICAqIEBwYXJhbSB7RXZlbnRUeXBlfSBbdHlwZV0gVGhlIGV2ZW50IHR5cGUuXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyIFRoZSBldmVudCBjYWxsYmFjay5cclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfSBUaGUgZW1pdHRlci5cclxuICAgICAqIEBzaW5jZSAxLjIuMFxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci51bnRpbCggZnVuY3Rpb24oIG5hbWUgKXtcclxuICAgICAqICBjb25zb2xlLmxvZyggYEdyZWV0ZWQgJHsgbmFtZSB9YCApO1xyXG4gICAgICogIHJldHVybiBuYW1lID09PSAnVGVycnknO1xyXG4gICAgICogfSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcclxuICAgICAqIC8vIEdyZWV0ZWQgSmVmZlxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnZ29vZGJ5ZScsICdUZXJyeScgKTtcclxuICAgICAqIC8vIEdyZWV0ZWQgVGVycnlcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2hpJywgJ0Fhcm9uJyApO1xyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci51bnRpbCggJ2hlbGxvJywgZnVuY3Rpb24oIG5hbWUgKXtcclxuICAgICAqICBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApO1xyXG4gICAgICogIHJldHVybiBuYW1lID09PSAnV29ybGQnO1xyXG4gICAgICogfSApO1xyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnSmVmZicgKTtcclxuICAgICAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gICAgICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnV29ybGQnICk7XHJcbiAgICAgKiAvLyBIZWxsbywgV29ybGQhXHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdNYXJrJyApO1xyXG4gICAgICovXHJcbiAgICB0aGlzLnVudGlsID0gZnVuY3Rpb24oIHR5cGUgPSAkZXZlcnksIGxpc3RlbmVyICl7XHJcbiAgICAgICAgLy8gU2hpZnQgYXJndW1lbnRzIGlmIHR5cGUgaXMgbm90IHByb3ZpZGVkXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcgKXtcclxuICAgICAgICAgICAgbGlzdGVuZXIgPSB0eXBlO1xyXG4gICAgICAgICAgICB0eXBlID0gJGV2ZXJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiggdHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoICdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGFkZENvbmRpdGlvbmFsRXZlbnRMaXN0ZW5lciggdGhpcywgdHlwZSwgbGlzdGVuZXIgKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbn1cclxuXHJcbmFzRW1pdHRlci5jYWxsKCBBUEkgKTtcclxuXHJcbi8qKlxyXG4gKiBBcHBsaWVzIHRoZSBFbWl0dGVyLmpzIEFQSSB0byB0aGUgdGFyZ2V0LlxyXG4gKiBAZnVuY3Rpb24gRW1pdHRlclxyXG4gKiBAcGFyYW0ge0FQSVJlZmVyZW5jZX0gW3NlbGVjdGlvbl0gQSBzZWxlY3Rpb24gb2YgdGhlIEVtaXR0ZXIuanMgQVBJIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoZSBgdGFyZ2V0YC5cclxuICogQHBhcmFtIHtleHRlcmFsOk9iamVjdH0gdGFyZ2V0IFRoZSBvYmplY3QgdG8gd2hpY2ggdGhlIEVtaXR0ZXIuanMgQVBJIHdpbGwgYmUgYXBwbGllZC5cclxuICogQHNpbmNlIDIuMC4wXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGFsbCBvZiB0aGUgQVBJPC9jYXB0aW9uPlxyXG4gKiBsZXQgZ3JlZXRlciA9IE9iamVjdC5jcmVhdGUoIG51bGwgKTtcclxuICogRW1pdHRlciggZ3JlZXRlciApO1xyXG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICogLy8gSGVsbG8hXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkFwcGx5aW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XHJcbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xyXG4gKiBFbWl0dGVyKCAnZW1pdCBvbiBvZmYnLCBncmVldGVyICk7XHJcbiAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJyApO1xyXG4gKiAvLyBIZWxsbyFcclxuICogQGV4YW1wbGUgPGNhcHRpb24+UmVtYXBwaW5nIGEgc2VsZWN0aW9uIG9mIHRoZSBBUEk8L2NhcHRpb24+XHJcbiAqIGxldCBncmVldGVyID0gT2JqZWN0LmNyZWF0ZSggbnVsbCApO1xyXG4gKiBFbWl0dGVyKCB7IGZpcmU6ICdlbWl0JywgYWRkTGlzdGVuZXI6ICdvbicgfSwgZ3JlZXRlciApO1xyXG4gKiBncmVldGVyLmFkZExpc3RlbmVyKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gKiBncmVldGVyLmZpcmUoICdoZWxsbycgKTtcclxuICogLy8gSGVsbG8hXHJcbiAqL1xyXG4gXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGVtaXR0ZXIuIElmIGBtYXBwaW5nYCBhcmUgcHJvdmlkZWQgdGhleSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgcGFzc2VkIGludG8gYG9uKClgIG9uY2UgY29uc3RydWN0aW9uIGlzIGNvbXBsZXRlLlxyXG4gKiBAY2xhc3MgRW1pdHRlclxyXG4gKiBAcGFyYW0ge0V2ZW50TWFwcGluZ30gW21hcHBpbmddIEEgbWFwcGluZyBvZiBldmVudCB0eXBlcyB0byBldmVudCBsaXN0ZW5lcnMuXHJcbiAqIEBjbGFzc2Rlc2MgQW4gb2JqZWN0IHRoYXQgZW1pdHMgbmFtZWQgZXZlbnRzIHdoaWNoIGNhdXNlIGZ1bmN0aW9ucyB0byBiZSBleGVjdXRlZC5cclxuICogQGV4dGVuZHMgRW1pdHRlcn5OdWxsXHJcbiAqIEBtaXhlcyBFbWl0dGVyfmFzRW1pdHRlclxyXG4gKiBAc2VlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2V2ZW50cy5qc31cclxuICogQHNpbmNlIDEuMC4wXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPlVzaW5nIEVtaXR0ZXIgZGlyZWN0bHk8L2NhcHRpb24+XHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICogLy8gSGVsbG8hXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPkV4dGVuZGluZyBFbWl0dGVyIHVzaW5nIENsYXNzaWNhbCBpbmhlcml0YW5jZTwvY2FwdGlvbj5cclxuICogY2xhc3MgR3JlZXRlciBleHRlbmRzIEVtaXR0ZXIge1xyXG4gKiAgY29uc3RydWN0b3IoKXtcclxuICogICAgICBzdXBlcigpO1xyXG4gKiAgICAgIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICogIH1cclxuICogXHJcbiAqICBncmVldCggbmFtZSApe1xyXG4gKiAgICAgIHRoaXMuZW1pdCggJ2dyZWV0JywgbmFtZSApO1xyXG4gKiAgfVxyXG4gKiB9XHJcbiAqIFxyXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEdyZWV0ZXIoKTtcclxuICogZ3JlZXRlci5ncmVldCggJ0plZmYnICk7XHJcbiAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5FeHRlbmRpbmcgRW1pdHRlciB1c2luZyBQcm90b3R5cGFsIGluaGVyaXRhbmNlPC9jYXB0aW9uPlxyXG4gKiBmdW5jdGlvbiBHcmVldGVyKCl7XHJcbiAqICBFbWl0dGVyLmNhbGwoIHRoaXMgKTtcclxuICogIHRoaXMub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICogfVxyXG4gKiBHcmVldGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEVtaXR0ZXIucHJvdG90eXBlICk7XHJcbiAqIFxyXG4gKiBHcmVldGVyLnByb3RvdHlwZS5ncmVldCA9IGZ1bmN0aW9uKCBuYW1lICl7XHJcbiAqICB0aGlzLmVtaXQoICdncmVldCcsIG5hbWUgKTtcclxuICogfTtcclxuICogXHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgR3JlZXRlcigpO1xyXG4gKiBncmVldGVyLmdyZWV0KCAnSmVmZicgKTtcclxuICogLy8gSGVsbG8sIEplZmYhXHJcbiAqIEBleGFtcGxlIDxjYXB0aW9uPk5hbWVzcGFjZWQgZXZlbnRzPC9jYXB0aW9uPlxyXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICogZ3JlZXRlci5vbiggJ2dyZWV0aW5nOmhlbGxvJywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiBncmVldGVyLm9uKCAnZ3JlZXRpbmc6aGknLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhpLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIGdyZWV0ZXIub24oICdncmVldGluZycsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgJHsgbmFtZSB9IHdhcyBncmVldGVkLmAgKTtcclxuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGknLCAnTWFyaycgKTtcclxuICogZ3JlZXRlci5lbWl0KCAnZ3JlZXRpbmc6aGVsbG8nLCAnSmVmZicgKTtcclxuICogLy8gSGksIE1hcmshXHJcbiAqIC8vIE1hcmsgd2FzIGdyZWV0ZWQuXHJcbiAqIC8vIEhlbGxvLCBKZWZmIVxyXG4gKiAvLyBKZWZmIHdhcyBncmVldGVkLlxyXG4gKiBAZXhhbXBsZSA8Y2FwdGlvbj5QcmVkZWZpbmVkIGV2ZW50czwvY2FwdGlvbj5cclxuICogY29uc3QgZ3JlZXRpbmdzID0ge1xyXG4gKiAgICAgIGhlbGxvOiBmdW5jdGlvbiggbmFtZSApeyBjb25zb2xlLmxvZyggYEhlbGxvLCAke25hbWV9IWAgKSxcclxuICogICAgICBoaTogZnVuY3Rpb24oIG5hbWUgKXsgY29uc29sZS5sb2coIGBIaSwgJHtuYW1lfSFgIClcclxuICogIH0sXHJcbiAqICBncmVldGVyID0gbmV3IEVtaXR0ZXIoIGdyZWV0aW5ncyApO1xyXG4gKiBcclxuICogZ3JlZXRlci5lbWl0KCAnaGVsbG8nLCAnQWFyb24nICk7XHJcbiAqIC8vIEhlbGxvLCBBYXJvbiFcclxuICogQGV4YW1wbGUgPGNhcHRpb24+T25lLXRpbWUgZXZlbnRzPC9jYXB0aW9uPlxyXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICogZ3JlZXRlci5vbmNlKCAnaGVsbG8nLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ0plZmYnICk7XHJcbiAqIGdyZWV0ZXIuZW1pdCggJ2hlbGxvJywgJ1RlcnJ5JyApO1xyXG4gKiAvLyBIZWxsbywgSmVmZiFcclxuICogQGV4YW1wbGUgPGNhcHRpb24+TWFueS10aW1lIGV2ZW50czwvY2FwdGlvbj5cclxuICogY29uc3QgZ3JlZXRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAqIGdyZWV0ZXIubWFueSggJ2hlbGxvJywgMiwgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIZWxsbywgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdKZWZmJyApOyAgICAgLy8gMVxyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdUZXJyeScgKTsgICAgLy8gMlxyXG4gKiBncmVldGVyLmVtaXQoICdoZWxsbycsICdTdGV2ZScgKTsgICAgLy8gM1xyXG4gKiAvLyBIZWxsbywgSmVmZiFcclxuICogLy8gSGVsbG8sIFRlcnJ5IVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRW1pdHRlcigpe1xyXG4gICAgXHJcbiAgICAvLyBDYWxsZWQgYXMgY29uc3RydWN0b3JcclxuICAgIGlmKCB0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb25zdHJ1Y3RvciA9PT0gRW1pdHRlciApe1xyXG4gICAgICAgIGxldCBtYXBwaW5nID0gYXJndW1lbnRzWyAwIF07XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQnkgZGVmYXVsdCBFbWl0dGVycyB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuICoqMTAqKiBsaXN0ZW5lcnMgYXJlIGFkZGVkIGZvciBhIHBhcnRpY3VsYXIgZXZlbnQgYHR5cGVgLiBUaGlzIHByb3BlcnR5IGFsbG93cyB0aGF0IHRvIGJlIGNoYW5nZWQuIFNldCB0byAqKjAqKiBmb3IgdW5saW1pdGVkLlxyXG4gICAgICAgICAqIEBtZW1iZXIge2V4dGVybmFsOm51bWJlcn0gRW1pdHRlciNtYXhMaXN0ZW5lcnNcclxuICAgICAgICAgKiBAc2luY2UgMS4wLjBcclxuICAgICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICAgICAqIFxyXG4gICAgICAgICAqIGNvbnNvbGUubG9nKCBncmVldGVyLm1heExpc3RlbmVycyApO1xyXG4gICAgICAgICAqIC8vIDEwXHJcbiAgICAgICAgICogXHJcbiAgICAgICAgICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSAxO1xyXG4gICAgICAgICAqIFxyXG4gICAgICAgICAqIGdyZWV0ZXIub24oICc6bWF4TGlzdGVuZXJzJywgKCBncmVldGluZyApID0+IGNvbnNvbGUubG9nKCBgR3JlZXRpbmcgXCIkeyBncmVldGluZyB9XCIgaGFzIG9uZSB0b28gbWFueSFgICkgKTtcclxuICAgICAgICAgKiBncmVldGVyLm9uKCAnaGVsbG8nLCAoKSA9PiBjb25zb2xlLmxvZyggJ0hlbGxvIScgKSApO1xyXG4gICAgICAgICAqIGdyZWV0ZXIub24oICdoZWxsbycsICgpID0+IGFsZXJ0KCAnSGVsbG8hJyApICk7XHJcbiAgICAgICAgICogLy8gR3JlZXRpbmcgXCJoZWxsb1wiIGhhcyBvbmUgdG9vIG1hbnkhXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB0aGlzLCAnbWF4TGlzdGVuZXJzJywge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TWF4TGlzdGVuZXJzKCB0aGlzICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24oIG1heCApe1xyXG4gICAgICAgICAgICAgICAgc2V0TWF4TGlzdGVuZXJzKCB0aGlzLCBtYXggKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBcclxuICAgICAgICB0eXBlb2YgbWFwcGluZyAhPT0gJ3VuZGVmaW5lZCcgJiYgYWRkRXZlbnRNYXBwaW5nKCB0aGlzLCBtYXBwaW5nICk7XHJcbiAgICBcclxuICAgIC8vIENhbGxlZCBhcyBmdW5jdGlvblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBsZXQgc2VsZWN0aW9uID0gYXJndW1lbnRzWyAwIF0sXHJcbiAgICAgICAgICAgIHRhcmdldCA9IGFyZ3VtZW50c1sgMSBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFNoaWZ0IGFyZ3VtZW50c1xyXG4gICAgICAgIGlmKCB0eXBlb2YgdGFyZ2V0ID09PSAndW5kZWZpbmVkJyApe1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBzZWxlY3Rpb247XHJcbiAgICAgICAgICAgIHNlbGVjdGlvbiA9IEFQSTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdG9FbWl0dGVyKCBzZWxlY3Rpb24sIHRhcmdldCApO1xyXG4gICAgfVxyXG59XHJcblxyXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggRW1pdHRlciwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBkZWZhdWx0IG1heGltdW0gbnVtYmVyIG9mIGxpc3RlbmVycyBmb3IgYWxsIGVtaXR0ZXJzLiBVc2UgYGVtaXR0ZXIubWF4TGlzdGVuZXJzYCB0byBzZXQgdGhlIG1heGltdW0gb24gYSBwZXItaW5zdGFuY2UgYmFzaXMuXHJcbiAgICAgKiBcclxuICAgICAqIEJ5IGRlZmF1bHQgRW1pdHRlciB3aWxsIGVtaXQgYSBgOm1heExpc3RlbmVyc2AgZXZlbnQgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmUgYWRkZWQgdG8gYSBzcGVjaWZpYyBldmVudCB0eXBlLlxyXG4gICAgICogQG1lbWJlciB7ZXh0ZXJuYWw6bnVtYmVyfSBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM9MTBcclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGV4YW1wbGUgPGNhcHRpb24+Q2hhbmdpbmcgdGhlIGRlZmF1bHQgbWF4aW11bSBsaXN0ZW5lcnM8L2NhcHRpb24+XHJcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzICk7XHJcbiAgICAgKiAvLyAxMFxyXG4gICAgICogXHJcbiAgICAgKiBjb25zdCBncmVldGVyMSA9IG5ldyBFbWl0dGVyKCksXHJcbiAgICAgKiAgZ3JlZXRlcjIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogXHJcbiAgICAgKiBFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxO1xyXG4gICAgICogXHJcbiAgICAgKiBncmVldGVyMS5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xyXG4gICAgICogZ3JlZXRlcjEub24oICdoZWxsbycsICgpID0+IGNvbnNvbGUubG9nKCAnSGVsbG8hJyApICk7XHJcbiAgICAgKiBncmVldGVyMS5vbiggJ2hlbGxvJywgKCkgPT4gYWxlcnQoICdIZWxsbyEnICkgKTtcclxuICAgICAqIC8vIEdyZWV0aW5nIFwiaGVsbG9cIiBoYXMgb25lIHRvbyBtYW55IVxyXG4gICAgICogXHJcbiAgICAgKiBncmVldGVyMi5vbiggJzptYXhMaXN0ZW5lcnMnLCAoIGdyZWV0aW5nICkgPT4gY29uc29sZS5sb2coIGBHcmVldGluZyBcIiR7IGdyZWV0aW5nIH1cIiBoYXMgb25lIHRvbyBtYW55IWAgKSApO1xyXG4gICAgICogZ3JlZXRlcjIub24oICdoaScsICgpID0+IGNvbnNvbGUubG9nKCAnSGkhJyApICk7XHJcbiAgICAgKiBncmVldGVyMi5vbiggJ2hpJywgKCkgPT4gYWxlcnQoICdIaSEnICkgKTtcclxuICAgICAqIC8vIEdyZWV0aW5nIFwiaGlcIiBoYXMgb25lIHRvbyBtYW55IVxyXG4gICAgICovXHJcbiAgICBkZWZhdWx0TWF4TGlzdGVuZXJzOiB7XHJcbiAgICAgICAgdmFsdWU6IDEwLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogQW4gaWQgdXNlZCB0byBsaXN0ZW4gZm9yIGV2ZW50cyBvZiBhbnkgYHR5cGVgLiBGb3IgX21vc3RfIG1ldGhvZHMsIHdoZW4gbm8gYHR5cGVgIGlzIGdpdmVuIHRoaXMgaXMgdGhlIGRlZmF1bHQuXHJcbiAgICAgKiBcclxuICAgICAqIExpc3RlbmVyIGJvdW5kIHRvIGV2ZXJ5IGV2ZW50IHdpbGwgKipub3QqKiBleGVjdXRlIGZvciBFbWl0dGVyIGxpZmVjeWNsZSBldmVudHMsIGxpa2UgYDptYXhMaXN0ZW5lcnNgLlxyXG4gICAgICogXHJcbiAgICAgKiBVc2luZyBgRW1pdHRlci5ldmVyeWAgaXMgdHlwaWNhbGx5IG5vdCBuZWNlc3NhcnkuXHJcbiAgICAgKiBAbWVtYmVyIHtleHRlcm5hbDpzeW1ib2x9IEVtaXR0ZXIuZXZlcnlcclxuICAgICAqIEBzaW5jZSAxLjAuMFxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICogZ3JlZXRlci5vbiggRW1pdHRlci5ldmVyeSwgKCkgPT4gY29uc29sZS5sb2coICdHcmVldGVkJyApICk7XHJcbiAgICAgKiBncmVldGVyLmVtaXQoICdoZWxsbycgKTtcclxuICAgICAqIC8vIEdyZWV0ZWRcclxuICAgICAqIGdyZWV0ZXIuZW1pdCggJ2dvb2RieWUnICk7XHJcbiAgICAgKiAvLyBHcmVldGVkXHJcbiAgICAgKi9cclxuICAgIGV2ZXJ5OiB7XHJcbiAgICAgICAgdmFsdWU6ICRldmVyeSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlXHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mICpFbWl0dGVyLmpzKi5cclxuICAgICAqIEBtZW1iZXIge2V4dGVybmFsOnN0cmluZ30gRW1pdHRlci52ZXJzaW9uXHJcbiAgICAgKiBAc2luY2UgMS4xLjJcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBjb25zb2xlLmxvZyggRW1pdHRlci52ZXJzaW9uICk7XHJcbiAgICAgKiAvLyAyLjAuMFxyXG4gICAgICovXHJcbiAgICB2ZXJzaW9uOiB7XHJcbiAgICAgICAgdmFsdWU6ICcyLjAuMCcsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB3cml0YWJsZTogZmFsc2VcclxuICAgIH1cclxufSApO1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUgPSBuZXcgTnVsbCgpO1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFbWl0dGVyO1xyXG5cclxuYXNFbWl0dGVyLmNhbGwoIEVtaXR0ZXIucHJvdG90eXBlICk7XHJcblxyXG4vKipcclxuICogRGVzdHJveXMgdGhlIGVtaXR0ZXIuXHJcbiAqIEBzaW5jZSAxLjAuMFxyXG4gKiBAZmlyZXMgRW1pdHRlciM6ZGVzdHJveVxyXG4gKi9cclxuRW1pdHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7XHJcbiAgICBlbWl0RXZlbnQoIHRoaXMsICc6ZGVzdHJveScsIFtdLCBmYWxzZSApO1xyXG4gICAgdGhpcy5jbGVhcigpO1xyXG4gICAgZGVsZXRlIHRoaXMubWF4TGlzdGVuZXJzO1xyXG4gICAgdGhpcy5kZXN0cm95ID0gdGhpcy5hdCA9IHRoaXMuY2xlYXIgPSB0aGlzLmVtaXQgPSB0aGlzLmV2ZW50VHlwZXMgPSB0aGlzLmZpcnN0ID0gdGhpcy5nZXRNYXhMaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyQ291bnQgPSB0aGlzLmxpc3RlbmVycyA9IHRoaXMubWFueSA9IHRoaXMub2ZmID0gdGhpcy5vbiA9IHRoaXMub25jZSA9IHRoaXMuc2V0TWF4TGlzdGVuZXJzID0gdGhpcy50aWNrID0gdGhpcy50cmlnZ2VyID0gdGhpcy51bnRpbCA9IG5vb3A7XHJcbiAgICB0aGlzLnRvSlNPTiA9ICgpID0+ICdkZXN0cm95ZWQnO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpPYmplY3R9IEFuIHBsYWluIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZW1pdHRlci5cclxuICogQHNpbmNlIDEuMy4wXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGdyZWV0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gKiBncmVldGVyLm1heExpc3RlbmVycyA9IDU7XHJcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGVsbG8sICR7IG5hbWUgfSFgICkgKTtcclxuICogZ3JlZXRlci5vbiggJ2dyZWV0JywgKCBuYW1lICkgPT4gY29uc29sZS5sb2coIGBIaSwgJHsgbmFtZSB9IWAgKSApO1xyXG4gKiBcclxuICogY29uc29sZS5sb2coIGdyZWV0ZXIudG9KU09OKCkgKTtcclxuICogLy8geyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9XHJcbiAqIFxyXG4gKiBncmVldGVyLmRlc3Ryb3koKTtcclxuICogXHJcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvSlNPTigpICk7XHJcbiAqIC8vIFwiZGVzdHJveWVkXCJcclxuICovXHJcbkVtaXR0ZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XHJcbiAgICBjb25zdCBqc29uID0gbmV3IE51bGwoKSxcclxuICAgICAgICB0eXBlcyA9IE9iamVjdC5rZXlzKCB0aGlzWyAkZXZlbnRzIF0gKSxcclxuICAgICAgICBsZW5ndGggPSB0eXBlcy5sZW5ndGg7XHJcbiAgICAgICAgXHJcbiAgICBsZXQgaW5kZXggPSAwLFxyXG4gICAgICAgIHR5cGU7XHJcbiAgICBcclxuICAgIGpzb24ubWF4TGlzdGVuZXJzID0gdGhpcy5tYXhMaXN0ZW5lcnM7XHJcbiAgICBqc29uLmxpc3RlbmVyQ291bnQgPSBuZXcgTnVsbCgpO1xyXG4gICAgXHJcbiAgICBmb3IoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKXtcclxuICAgICAgICB0eXBlID0gdHlwZXNbIGluZGV4IF07XHJcbiAgICAgICAganNvbi5saXN0ZW5lckNvdW50WyB0eXBlIF0gPSB0aGlzLmxpc3RlbmVyQ291bnQoIHR5cGUgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIGpzb247XHJcbn07XHJcblxyXG4vKipcclxuICogQHJldHVybnMge2V4dGVybmFsOnN0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGVtaXR0ZXIuXHJcbiAqIEBzaW5jZSAxLjMuMFxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBncmVldGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICogZ3JlZXRlci5tYXhMaXN0ZW5lcnMgPSA1O1xyXG4gKiBncmVldGVyLm9uKCAnZ3JlZXQnLCAoIG5hbWUgKSA9PiBjb25zb2xlLmxvZyggYEhlbGxvLCAkeyBuYW1lIH0hYCApICk7XHJcbiAqIGdyZWV0ZXIub24oICdncmVldCcsICggbmFtZSApID0+IGNvbnNvbGUubG9nKCBgSGksICR7IG5hbWUgfSFgICkgKTtcclxuICogXHJcbiAqIGNvbnNvbGUubG9nKCBncmVldGVyLnRvU3RyaW5nKCkgKTtcclxuICogLy8gJ0VtaXR0ZXIgeyBcIm1heExpc3RlbmVyc1wiOiA1LCBcImxpc3RlbmVyQ291bnRcIjogeyBcImdyZWV0XCI6IDIgfSB9J1xyXG4gKiBcclxuICogZ3JlZXRlci5kZXN0cm95KCk7XHJcbiAqIFxyXG4gKiBjb25zb2xlLmxvZyggZ3JlZXRlci50b1N0cmluZygpICk7XHJcbiAqIC8vICdFbWl0dGVyIFwiZGVzdHJveWVkXCInXHJcbiAqL1xyXG5FbWl0dGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gYCR7IHRoaXMuY29uc3RydWN0b3IubmFtZSB9ICR7IEpTT04uc3RyaW5naWZ5KCB0aGlzLnRvSlNPTigpICkgfWAudHJpbSgpO1xyXG59OyJdLCJmaWxlIjoiZW1pdHRlci11bWQuanMifQ==
