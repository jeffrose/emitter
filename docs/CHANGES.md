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