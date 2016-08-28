# Emitter Changelog

## 1.0.0

* Initial release.

## 1.1.0

* Added `Emitter.asEmitter()` functional mixin.
* Added `defineEvents()`, `defineMaxListeners()`, `destroyEvents()`, and `destroyMaxListeners()` to provide management of the emitter interals with the mixin is used.
* Removed dependency on `Symbol`.

## 1.1.1

* Added `Symbol.toStringTag` to shim.

## 1.1.2

* Added `Emitter.version`.
* Added benchmark tests.
* Removed unnecessary return.
* Removed extra event registry safety checks.
* Fixed defect where the `every` listeners executed for multiple times for a namespaced event.
* Traded in while-loop array cloning for `Array.prototype.slice()` which seems to perform better overall.
  * http://jsperf.com/new-array-vs-splice-vs-slice/97
* Improved performance of `trigger()` and therefore `emit()`.
* Normalized the usage of internal `emitEvent()` method.

## 1.2.0

* Added `until()`.
  * Re-implemented `many()` using `until()`.
* Performance tweaks.

## 1.2.1

* Better error handling which resolves #1.
* Additional testing around `error` events.

## 1.3.0

* Made internal properties non-enumerable.
* Added `toJSON()` and `toString()` methods.
* Additional testing.

## 2.0.0

* Updated development environment.
* Added roadmap to documentation.
* Removed `Symbol` and `setImmediate()` shims.
* Removed `defineEvents()`, `defineMaxListeners()`, `destroyEvents()`, and `destroyMaxListeners()`.
* `toJSON()` and `toString()` are no longer provided by the mixin but are part of `Emitter.prototype`.
* Removed `Emitter.listenerCount()`.
* Added `at()`, `eventTypes()`, `first()`, `getMaxListeners()`, and `setMaxListeners()`.
* Migrated to jsdocs for API documentation.
* `Symbol` values are now `String` values due to browser support.
* `Emitter.asEmitter()` is now built into `Emitter()`.
* Mixin has expanded syntax to allow for more flexibility.