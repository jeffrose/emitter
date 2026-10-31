# Emitter Changelog

## 1.0.0

- Initial release.

## 1.1.0

- Added `Emitter.asEmitter()` functional mixin.
- Added `defineEvents()`, `defineMaxListeners()`, `destroyEvents()`, and `destroyMaxListeners()` to provide management of the emitter interals with the mixin is used.
- Removed dependency on `Symbol`.

## 1.1.1

- Added `Symbol.toStringTag` to shim.

## 1.1.2

- Added `Emitter.version`.
- Added benchmark tests.
- Removed unnecessary return.
- Removed extra event registry safety checks.
- Fixed defect where the `every` listeners executed for multiple times for a namespaced event.
- Traded in while-loop array cloning for `Array.prototype.slice()` which seems to perform better overall.
    - http://jsperf.com/new-array-vs-splice-vs-slice/97
- Improved performance of `trigger()` and therefore `emit()`.
- Normalized the usage of internal `emitEvent()` method.

## 1.2.0

- Added `until()`.
    - Re-implemented `many()` using `until()`.
- Performance tweaks.

## 1.2.1

- Better error handling which resolves #1.
- Additional testing around `error` events.

## 1.3.0

- Made internal properties non-enumerable.
- Added `toJSON()` and `toString()` methods.
- Additional testing.

## 2.0.0

- Updated development environment.
- Added roadmap to documentation.
- Removed `Symbol` and `setImmediate()` shims.
- Removed `defineEvents()`, `defineMaxListeners()`, `destroyEvents()`, and `destroyMaxListeners()`.
- `toJSON()` and `toString()` are no longer provided by the mixin but are part of `Emitter.prototype`.
- Removed `Emitter.listenerCount()`.
- Added `at()`, `eventTypes()`, `first()`, `getMaxListeners()`, and `setMaxListeners()`.
- Migrated to jsdocs for API documentation.
- `Symbol` values are now `String` values due to browser support.
- `Emitter.asEmitter()` is now built into `Emitter()`.
- Mixin has expanded syntax to allow for more flexibility.

## 2.1.0

- Updated the development environment to Node.js 22.18 and current releases of Babel, mocha, chai, sinon, ESLint and Prettier.
    - Gulp cannot run on supported versions of Node.js and was replaced with npm scripts and a GitHub Actions workflow.
    - The UMD source map is a separate file instead of an inlined base64 string, which reduces the size of the published package by roughly 150 kB.
- Fixed defects:
    - `eventTypes()` and `toJSON()` no longer throw before the first listener has been added, they describe an empty emitter.
    - `emit()` and `trigger()` always throw for an `error` event without an `error` listener, including on an emitter that never had a listener.
    - A single listener is no longer mistaken for an array of listeners when the number of listeners is compared to the maximum, which emitted a spurious `:maxListeners` event for a listener with a higher arity than the maximum, and stamped a `warned` property onto the listener.
    - `:maxListeners` is emitted at most once per event `type`, and no longer recurses when a listener of that event adds listeners of the same `type`. Clearing the listeners of an event `type` resets the warning.
    - `off()` and `clear()` only modify the listeners of the emitter itself, never an inherited event registry.
    - `many()` ignores a `times` of `0` instead of registering a listener that was never removed.
    - `class Greeter extends Emitter` now works, instances of a subclass are initialized by the constructor, as documented. Previously the mixin path was taken and threw a `TypeError`.
    - A conditional listener no longer throws when it is removed after its event `type` was cleared while the event was being emitted.
    - An `:on` listener that clears the emitter no longer causes the cleared event registry to be restored.
    - `Emitter.version` matches the version of `package.json` again, which is now verified by a test.
- Expanded the test suite, which runs against `src/emitter.js` and both distribution builds, to 100% statement, branch, function and line coverage.
- Documentation:
    - Corrected the ECMAScript 5 example and documented the distribution files.
    - Regenerated the API documentation from the annotations in `src/emitter.js`.
    - Deprecated the `bower.json` manifest, which will be removed in 3.0.
