'use strict';

const devConfigsJS = ['ava', 'babel', 'jest', 'rollup', 'webpack'];

module.exports = [
	'coverage/**',
	'packages/*/test{,s}/**',
	'test{,s}/**',
	'test{,-*}.{js,cjs,mjs,ts}',
	'**/*{.,-}test.{js,cjs,mjs,ts}',
	'**/__tests__/**',
	'**/nyc.config.{js,cjs,mjs}',
	`**/{${devConfigsJS.join()}}.config.js`
];
