# Emitter Changelog

## 1.0.0

* Initial release.

## 1.1.0

* Added `Emitter.asEmitter()` functional mixin.
* Added `defineEvents()`, `defineMaxListeners()`, `destroyEvents()`, and `destroyMaxListeners()` to provide management of the emitter interals with the mixin is used.
* Removed dependency on `Symbol`.

## 1.1.1

* Added `Symbol.toStringTag` to shim.