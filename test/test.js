import {test} from 'tap';

import schemas from '..';

function isObjectSchema(t, obj) {
	t.type(obj, 'object');
	t.type(obj.description, 'string');
	t.is(obj.type, 'object');
	t.type(obj.properties, 'object');
}

test('expected exports', async t => {
	t.type(schemas, 'object');
	isObjectSchema(t, schemas.nyc);
	isObjectSchema(t, schemas.testExclude);
	isObjectSchema(t, schemas.babelPluginIstanbul);
	isObjectSchema(t, schemas.instrumenter);
});

const noDefault = ['cwd', 'nycrcPath', 'cacheDir'];
const commandOptions = [null, 'instrument', 'report', 'check-coverage', 'merge'];
const infoOptions = [
	'default',
	'description',
	'type',
	'nycCommands',
	'nycAlias',
	'nycHiddenAlias'
];

function maybeType(t, value, type) {
	if (typeof value !== 'undefined') {
		t.type(value, type);
	}
}

Object.entries(schemas.nyc.properties).forEach(([name, info]) => {
	test(`nyc.properties['${name}'] is valid`, async t => {
		t.type(info, 'object', name);
		t.type(info.description, 'string', name);
		t.type(info.type, name === 'nycrcPath' ? 'undefined' : 'string');
		t.true(Array.isArray(info.nycCommands));
		t.same(info.nycCommands.filter(s => !commandOptions.includes(s)), []);

		maybeType(t, info.nycAlias, 'string');
		maybeType(t, info.nycHiddenAlias, 'string');

		const extraInfo = Object.keys(info).filter(s => !infoOptions.includes(s));
		if (info.type === 'array') {
			t.type(info.items, 'object');
			t.is(info.items.type, 'string');
			t.true(Array.isArray(info.default));
			t.true(info.default.every(s => typeof s === 'string'));
			t.same(extraInfo, ['items']);
		} else {
			if (noDefault.includes(name)) {
				t.type(info.default, 'undefined');
			} else {
				t.type(info.default, info.type);
			}

			if (info.type === 'number') {
				maybeType(t, info.minimum, 'number');
				maybeType(t, info.maximum, 'number');
				t.same(extraInfo.filter(s => !['maximum', 'minimum'].includes(s)), []);
			} else {
				t.same(extraInfo, []);
			}
		}
	});
});

test('defaults', async t => {
	t.matchSnapshot(schemas.defaults.nyc, 'nyc');
	t.matchSnapshot(schemas.defaults.testExclude, 'testExclude');
	t.matchSnapshot(schemas.defaults.babelPluginIstanbul, 'babelPluginIstanbul');
	t.matchSnapshot(schemas.defaults.instrumentVisitor, 'instrumentVisitor');
	t.matchSnapshot(schemas.defaults.instrumenter, 'instrumenter');
});
