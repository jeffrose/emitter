# Emitter Roadmap

## 3.0

- Use more ES6/ES2015 features.
    - Use a `WeakMap` for private data, which removes the `@@emitter/*` properties from emitters.
    - Use `Symbol` for API references instead of `String` values, e.g. `Emitter.every`.
- Package as an ES module by default.
    - Add `"type": "module"` and an `exports` map to `package.json`, rename the UMD build to `emitter-umd.cjs` and the ES module build to `emitter.js`.
    - Remove `bower.json`, which is deprecated in 2.1.
- Make the read APIs consistent with `emit()`: `listenerCount()`, `listeners()`, `eventTypes()` and `toJSON()` should only report the listeners of the emitter itself, never of an inherited event registry.
- Make `maxListeners` functionality optional.
- Provide optional asynchronous listener execution.
- Provide a TypeScript definition.
