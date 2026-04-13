const path = require('node:path');
const assert = require('node:assert/strict');
const {test} = require('node:test');

const schemas = require('..');

function isObjectSchema(obj) {
	assert.equal(typeof obj, 'object');
	assert.equal(typeof obj.description, 'string');
	assert.equal(obj.type, 'object');
	assert.equal(typeof obj.properties, 'object');
}

test('expected exports', async () => {
	assert.equal(typeof schemas, 'object');
	isObjectSchema(schemas.nyc);
	isObjectSchema(schemas.testExclude);
	isObjectSchema(schemas.babelPluginIstanbul);
	isObjectSchema(schemas.instrumenter);
});

const noDefault = ['nycrcPath', 'cacheDir'];
const commandOptions = [null, 'instrument', 'report', 'check-coverage', 'merge'];
const infoOptions = [
	'default',
	'description',
	'type',
	'nycCommands',
	'nycAlias',
	'nycHiddenAlias'
];

function maybeType(value, type) {
	if (typeof value !== 'undefined') {
		assert.equal(typeof value, type);
	}
}

Object.entries(schemas.nyc.properties).forEach(([name, info]) => {
	test(`nyc.properties['${name}'] is valid`, async () => {
		assert.equal(typeof info, 'object');
		assert.equal(typeof info.description, 'string');
		assert.equal(typeof info.type, name === 'nycrcPath' ? 'undefined' : 'string');
		assert.ok(Array.isArray(info.nycCommands));
		assert.deepStrictEqual(info.nycCommands.filter(s => !commandOptions.includes(s)), []);

		maybeType(info.nycAlias, 'string');
		maybeType(info.nycHiddenAlias, 'string');

		const extraInfo = Object.keys(info).filter(s => !infoOptions.includes(s));
		if (info.type === 'array') {
			assert.equal(typeof info.items, 'object');
			assert.equal(info.items.type, 'string');
			assert.ok(Array.isArray(info.default));
			assert.ok(info.default.every(s => typeof s === 'string'));
			assert.deepStrictEqual(extraInfo, ['items']);
		} else {
			if (noDefault.includes(name)) {
				assert.equal(typeof info.default, 'undefined');
			} else {
				assert.equal(typeof info.default, info.type);
			}

			if (info.type === 'number') {
				maybeType(info.minimum, 'number');
				maybeType(info.maximum, 'number');
				assert.deepStrictEqual(extraInfo.filter(s => !['maximum', 'minimum'].includes(s)), []);
			} else {
				assert.deepStrictEqual(extraInfo, []);
			}
		}
	});
});

function checkDefaults(t, id) {
	const defaults = schemas.defaults[id];
	if ('cwd' in defaults) {
		assert.strictEqual(defaults.cwd, process.cwd());
		defaults.cwd = '$CWD';
	}

	Object.entries(defaults).forEach(([name, value]) => {
		if (!value || typeof value !== 'object') {
			return;
		}

		/* Verify arrays / objects are shallow clones. */
		assert.deepStrictEqual(defaults[name], schemas[id].properties[name].default);
		assert.notStrictEqual(defaults[name], schemas[id].properties[name].default);
	});

	t.assert.snapshot(defaults);
}

test('defaults', async t => {
	const originalCwd = process.cwd();
	process.chdir(path.resolve(__dirname, '..'));
	checkDefaults(t, 'nyc');
	checkDefaults(t, 'testExclude');
	checkDefaults(t, 'babelPluginIstanbul');
	checkDefaults(t, 'instrumentVisitor');
	checkDefaults(t, 'instrumenter');

	process.chdir(__dirname);
	Object.entries(schemas.defaults).forEach(([type, defaults]) => {
		if ('cwd' in defaults) {
			assert.strictEqual(defaults.cwd, __dirname);
		}
	});

	process.chdir(originalCwd);
});
