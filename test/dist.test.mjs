import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect } from 'chai';
import sinon from 'sinon';
import Emitter from '../dist/emitter.js';
import describeEmitter from './suite.mjs';

const require = createRequire(import.meta.url);

// The behavioral suite also runs against the ES module distribution to prove that the build does not
// alter the behavior of the library.
describeEmitter(Emitter, 'Emitter (dist/emitter.js)');

describe('Distribution', () => {
    it('should match the version in package.json', () => {
        const { version } = require('../package.json');

        expect(Emitter.version).to.equal(version);
    });

    it('should provide a CommonJS entry point', () => {
        const CommonJS = require('../index.js');

        expect(CommonJS).to.be.a('function');
        expect(CommonJS.version).to.equal(Emitter.version);

        const emitter = new CommonJS(),
            listener = sinon.spy();

        emitter.on('test', listener);
        emitter.emit('test', 123);

        expect(listener).to.have.been.calledWith(123);
    });

    it('should provide a UMD build', () => {
        const UMD = require('../dist/emitter-umd.js').default;

        expect(UMD).to.be.a('function');
        expect(UMD.version).to.equal(Emitter.version);

        const emitter = new UMD(),
            listener = sinon.spy();

        emitter.on('test', listener);
        emitter.emit('test', 123);

        expect(listener).to.have.been.calledWith(123);
    });

    it('should register the UMD build as the "emitter" browser global', () => {
        const umd = readFileSync(new URL('../dist/emitter-umd.js', import.meta.url), 'utf8');

        expect(umd).to.contain('global.emitter = mod.exports');
    });

    it('should transpile the UMD build to ES5', () => {
        const umd = readFileSync(new URL('../dist/emitter-umd.js', import.meta.url), 'utf8'),
            // Ignore comments, which document the ES6 API with examples
            code = umd.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

        expect(code).to.not.match(/=>/);
        expect(code).to.not.match(/\b(?:const|let)\s/);
        expect(code).to.not.match(/`/);
        expect(code).to.not.match(/\bclass\s/);
    });

    it('should provide a source map for the UMD build', () => {
        const umd = readFileSync(new URL('../dist/emitter-umd.js', import.meta.url), 'utf8'),
            map = JSON.parse(readFileSync(new URL('../dist/emitter-umd.js.map', import.meta.url), 'utf8'));

        expect(umd).to.contain('//# sourceMappingURL=emitter-umd.js.map');
        expect(map.sources).to.deep.equal(['emitter.js']);
        expect(map.sourcesContent[0]).to.equal(readFileSync(new URL('../src/emitter.js', import.meta.url), 'utf8'));
    });
});
