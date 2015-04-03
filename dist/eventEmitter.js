(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module);
    }
})(function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var EventEmitter = (function () {
        function EventEmitter(events) {
            _classCallCheck(this, EventEmitter);

            for (var _event in events) {
                var listeners = events[_event];

                if (Array.isArray(listeners)) {
                    for (var i = 0, l = listeners.length; i < l; i++) {
                        this.on(_event, listeners[i]);
                    }
                } else {
                    this.on(_event, listeners);
                }
            }

            if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
                this._events = {};
            }

            this._maxListeners = this._maxListeners || undefined;
        }

        _createClass(EventEmitter, {
            allOff: {
                value: function allOff(type) {
                    var handler;

                    if (!this._events) {
                        return this;
                    }

                    if (!this._events.removeListener) {
                        if (arguments.length === 0) {
                            this._events = {};
                        } else if (this._events[type]) {
                            delete this._events[type];
                        }

                        return this;
                    }

                    if (arguments.length === 0) {
                        for (var key in this._events) {
                            if (key === "removeListener") {
                                continue;
                            }

                            this.allOff(type);
                        }

                        this.allOff("removeListener");

                        this._events = {};

                        return this;
                    }

                    handler = this._events[type];

                    if (typeof handler === "function") {
                        this.off(type, handler);
                    } else if (Array.isArray(handler)) {
                        while (handler.length) {
                            this.off(type, handler[handler.length - 1]);
                        }
                    }

                    delete this._events[type];

                    return this;
                }
            },
            emit: {
                value: function emit(type) {
                    var args, handler, length;

                    if (!this._events) {
                        this._events = {};
                    }

                    if (type === "error" && !this._events.error) {
                        var error = arguments[1];

                        if (error instanceof Error) {
                            throw error;
                        } else {
                            throw Error("Uncaught, unspecified \"error\" event.");
                        }

                        return false;
                    }

                    handler = this._events[type];

                    if (typeof handler === "undefined") {
                        return false;
                    }

                    if (typeof handler === "function") {
                        switch (arguments.length) {
                            case 1:
                                handler.call(this);
                                break;
                            case 2:
                                handler.call(this, arguments[1]);
                                break;
                            case 3:
                                handler.call(this, arguments[1], arguments[2]);
                                break;
                            default:
                                length = arguments.length;
                                args = new Array(length - 1);
                                for (var i = 1; i < length; i++) {
                                    args[i - 1] = arguments[i];
                                }
                                handler.apply(this, args);
                        }
                    } else if (typeof handler === "object") {
                        var listeners = undefined;

                        length = arguments.length;
                        args = new Array(length - 1);

                        for (var i = 1; i < length; i++) {
                            args[i - 1] = arguments[i];
                        }

                        listeners = handler.slice();
                        length = listeners.length;

                        for (var i = 0; i < length; i++) {
                            listeners[i].apply(this, args);
                        }
                    }

                    return true;
                }
            },
            trigger: {
                value: function trigger(type, args) {
                    args.unshift(type);
                    return this.emit.apply(this, args);
                }
            },
            listeners: {
                value: (function (_listeners) {
                    var _listenersWrapper = function listeners(_x) {
                        return _listeners.apply(this, arguments);
                    };

                    _listenersWrapper.toString = function () {
                        return _listeners.toString();
                    };

                    return _listenersWrapper;
                })(function (type) {
                    var listeners;

                    if (!this._events || !this._events[type]) {
                        listeners = [];
                    } else if (typeof this._events[type] === "function") {
                        listeners = [this._events[type]];
                    } else {
                        listeners = this._events[type].slice();
                    }

                    return listeners;
                })
            },
            many: {
                value: function many(type, times, listener) {
                    if (typeof times !== "number") {
                        throw new TypeError("times must be a number");
                    }

                    if (typeof listener !== "function") {
                        throw new TypeError("listener must be a function");
                    }

                    var manyListener = (function (_manyListener) {
                        var _manyListenerWrapper = function manyListener() {
                            return _manyListener.apply(this, arguments);
                        };

                        _manyListenerWrapper.toString = function () {
                            return _manyListener.toString();
                        };

                        return _manyListenerWrapper;
                    })(function () {
                        if (--times === 0) {
                            this.off(type, manyListener);
                        }
                        listener.apply(this, arguments);
                    });

                    manyListener.listener = listener;

                    this.on(type, manyListener);

                    return this;
                }
            },
            off: {
                value: function off(type, listener) {
                    var handler, index;

                    if (typeof listener !== "function") {
                        throw new TypeError("listener must be a function");
                    }

                    if (!this._events || !this._events[type]) {
                        return this;
                    }

                    handler = this._events[type];
                    index = -1;

                    if (handler === listener || typeof handler.listener === "function" && handler.listener === listener) {
                        delete this._events[type];
                        if (this._events.removeListener) {
                            this.emit("removeListener", type, listener);
                        }
                    } else if (typeof handler === "object") {
                        for (var i = handler.length; i-- > 0;) {
                            if (handler[i] === listener || handler[i].listener && handler[i].listener === listener) {
                                index = i;
                                break;
                            }
                        }
                    }

                    if (index < 0) {
                        return this;
                    }

                    if (handler.length === 1) {
                        handler.length = 0;
                        delete this._events[type];
                    } else {
                        handler.splice(index, 1);
                    }

                    if (this._events.removeListener) {
                        this.emit("removeListener", type, listener);
                    }

                    return this;
                }
            },
            on: {
                value: function on(type, listener) {
                    if (typeof listener !== "function") {
                        throw new TypeError("listener must be a function");
                    }

                    if (!this._events) {
                        this._events = {};
                    }

                    if (this._events.newListener) {
                        this.emit("newListener", type, typeof listener.listener === "function" ? listener.listener : listener);
                    }

                    // Single listener
                    if (!this._events[type]) {
                        this._events[type] = listener;

                        // Multiple listeners
                    } else if (typeof this._events[type] === "object") {
                        this._events[type].push(listener);

                        // Transition from single to multiple listeners
                    } else {
                        this._events[type] = [this._events[type], listener];
                    }

                    if (typeof this._events[type] === "object" && !this._events[type].warned) {
                        var maxListeners;

                        if (typeof this._maxListeners !== "undefined") {
                            maxListeners = this._maxListeners;
                        } else {
                            maxListeners = EventEmitter.defaultMaxListeners;
                        }

                        if (maxListeners && maxListeners > 0 && this._events[type].length > maxListeners) {
                            this.emit("warn", type, listener);
                            this._events[type].warned = true;
                        }
                    }

                    return this;
                }
            },
            once: {
                value: function once(type, listener) {
                    return this.many(type, 1, listener);
                }
            },
            setMaxListeners: {
                value: function setMaxListeners(n) {
                    if (typeof n !== "number" || n < 0 || isNaN(n)) {
                        throw TypeError("n must be a positive number");
                    }

                    this._maxListeners = n;

                    return this;
                }
            }
        }, {
            listenerCount: {
                value: function listenerCount(emitter, type) {
                    var count;

                    if (!emitter._events || !emitter._events[type]) {
                        count = 0;
                    } else if (typeof emitter._events[type] === "function") {
                        count = 1;
                    } else {
                        count = emitter._events[type].length;
                    }

                    return count;
                }
            }
        });

        return EventEmitter;
    })();

    module.exports = EventEmitter;

    EventEmitter.defaultMaxListeners = 10;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    // Aliases
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prototype.addManyListener = EventEmitter.prototype.many;
    EventEmitter.prototype.addOnceListener = EventEmitter.prototype.once;
    EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.allOff;
    EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
});