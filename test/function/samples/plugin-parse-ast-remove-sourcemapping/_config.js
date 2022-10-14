const assert = require('assert');

module.exports = {
	description: 'remove source mapping comment even if code is parsed by PluginContext.parse method',
	options: {
		plugins:[{
			transform(code, _id) {
				const ast = this.parse(code);
				return {ast, code, map: null};
			},
		}],
	},
	code(code) {
		assert.ok(code.search(/sourceMappingURL/) === -1);
	}
};
