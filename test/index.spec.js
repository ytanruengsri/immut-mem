const assert = require('assert');
const ImmutMem = require('../lib/index');

describe('ImmutMem', () => {
    it('should initialize using plain object', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        assert.deepEqual(IMMUTMEM.get('foo'), { bar: 'baz' });
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: 'ccc' });
        assert.deepEqual(IMMUTMEM.get('ddd:eee:fff'), { ggg: 'test' });
        assert.equal(IMMUTMEM.get('ddd:eee:fff:ggg'), 'test');
    });

    it('should set and get first level keys', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set('foo', 'bar');
        IMMUTMEM.set('baz', 'qux');

        assert.equal(IMMUTMEM.get('foo'), 'bar');
        assert.equal(IMMUTMEM.get('baz'), 'qux');

        IMMUTMEM.set('baz', 'vegas');
        assert.equal(IMMUTMEM.get('foo'), 'bar');
        assert.equal(IMMUTMEM.get('baz'), 'vegas');
    });

    it('should handle non string keys', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set(null, 'foo');
        assert.deepEqual(IMMUTMEM.get(null), undefined);
        IMMUTMEM.set(3, 'foo');
        assert.deepEqual(IMMUTMEM.get(3), undefined);
        IMMUTMEM.set(undefined, 'foo');
        assert.deepEqual(IMMUTMEM.get(undefined), undefined);
        IMMUTMEM.set(false, 'foo');
        assert.deepEqual(IMMUTMEM.get(false), undefined);
        IMMUTMEM.set({}, 'foo');
        assert.deepEqual(IMMUTMEM.get({}), undefined);
    });

    it('should ignore empty paths', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set('', { foo: 'bar' });
        assert.deepEqual(IMMUTMEM.get(''), undefined);
    });

    it('should return undefined for non existent keys', () => {
        const IMMUTMEM = new ImmutMem();

        assert.deepEqual(IMMUTMEM.get('foo'), undefined);
        assert.deepEqual(IMMUTMEM.get('foo:bar'), undefined);

        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        assert.equal(IMMUTMEM.get('a'), undefined);
        assert.equal(IMMUTMEM.get('a:b:c:d:e:f'), undefined);
        assert.equal(IMMUTMEM.get(''), undefined);
    });

    it('should set and get nested keys', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set('foo:bar', 'baz');

        const foo = IMMUTMEM.get('foo');
        assert.deepEqual(foo, { bar: 'baz' });
        assert.equal(IMMUTMEM.get('foo:bar'), 'baz');
    });

    it('should set and get deeply nested keys', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set('foo:bar:baz:qux:quux', 'test');

        const foo = IMMUTMEM.get('foo');
        assert.deepEqual(foo, { bar: { baz: { qux: { quux: 'test' } } } });
        assert.deepEqual(IMMUTMEM.get('foo:bar:baz'), { qux: { quux: 'test' } });
        assert.equal(IMMUTMEM.get('foo:bar:baz:qux:quux'), 'test');
    });

    it('should correctly set on partially existing paths', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        IMMUTMEM.set('aaa:c:d:e:f', 'vegas');
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: 'ccc', c: { d: { e: { f: 'vegas' } } } });

        IMMUTMEM.set('foo:x', 'y');
        assert.deepEqual(IMMUTMEM.get('foo'), { bar: 'baz', x: 'y' });
    });

    it('should reassign first level keys', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set('aaa', 'ccc');
        assert.equal(IMMUTMEM.get('aaa'), 'ccc');

        IMMUTMEM.set('aaa', 'ddd');
        assert.equal(IMMUTMEM.get('aaa'), 'ddd');
    });

    it('should reassign nested keys', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.set('aaa:bbb:ccc', 'ddd');
        assert.equal(IMMUTMEM.get('aaa:bbb:ccc'), 'ddd');

        IMMUTMEM.set('aaa:bbb:ccc', 'eee');
        assert.equal(IMMUTMEM.get('aaa:bbb:ccc'), 'eee');
    });

    it('should set nested keys preserving existing config', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        IMMUTMEM.set('ddd:eee:fff', 'vegas');
        assert.deepEqual(IMMUTMEM.get('ddd:eee'), { fff: 'vegas' });
        assert.equal(IMMUTMEM.get('ddd:eee:fff'), 'vegas');
        assert.equal(IMMUTMEM.get('foo:bar'), 'baz');
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: 'ccc' });
    });

    it('should not expose internal store references for first level', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        const config = IMMUTMEM.get('ddd');
        config.eee.fff = 'vegas';

        assert.equal(config.eee.fff, 'vegas');
        assert.deepEqual(IMMUTMEM.get('ddd:eee:fff'), { ggg: 'test' });
    });

    it('should not expose internal store references for nested objects', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        const config = IMMUTMEM.get('ddd:eee');
        config.fff = 'vegas';

        assert.equal(config.fff, 'vegas');
        assert.deepEqual(IMMUTMEM.get('ddd:eee:fff'), { ggg: 'test' });
    });

    it('should extend existing config', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
            ccc: { xxx: [] },
        });

        IMMUTMEM.extend('foo', { qux: true });
        assert.deepEqual(IMMUTMEM.get('foo'), { qux: true, bar: 'baz' });

        IMMUTMEM.extend('aaa', { bbb: 'hollywood' });
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: 'hollywood' });

        IMMUTMEM.extend('ddd:eee', { quux: false, fff: { baaz: 'vegas' } });
        assert.deepEqual(IMMUTMEM.get('ddd'), { eee: { quux: false, fff: { baaz: 'vegas', ggg: 'test' } } });

        IMMUTMEM.extend('ccc', { xxx: ['ciao'] });
        assert.deepEqual(IMMUTMEM.get('ccc'), { xxx: ['ciao'] });
    });

    it('should not extend existing arrays', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: [1, 2, 3] },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        IMMUTMEM.extend('aaa', { bbb: [4, 5, 6] });
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: [4, 5, 6] });
    });

    it('should not extend existing strings', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        IMMUTMEM.extend('aaa', { bbb: 'zzz' });
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: 'zzz' });
    });

    it('should not extend with non objects arguments', () => {
        const IMMUTMEM = new ImmutMem();
        IMMUTMEM.load({
            foo: { bar: [1, 2, 3] },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        IMMUTMEM.extend('aaa', 'zzz');
        assert.deepEqual(IMMUTMEM.get('aaa'), { bbb: 'ccc' });

        IMMUTMEM.extend('foo:bar', [4, 5, 6]);
        assert.deepEqual(IMMUTMEM.get('foo'), { bar: [1, 2, 3] });
    });
});
