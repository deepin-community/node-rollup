const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'unknown CLI --plugin results in an error',
	skipIfWindows: true,
	command: `echo "console.log(123);" | rollup --plugin foobar`,
	error(err) {
		assertIncludes(err.message, '[!] Error: Cannot load plugin "foobar"');
	}
};
