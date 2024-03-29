module.exports = defineTest({
	description: 'handles empty imports when generating IIFE output',
	expectedWarnings: ['MISSING_NODE_BUILTINS', 'UNRESOLVED_IMPORT'],
	options: {
		output: {
			format: 'iife',
			globals: {
				dns: 'dns',
				util: 'util',
				fs: 'fs'
			}
		}
	}
});
