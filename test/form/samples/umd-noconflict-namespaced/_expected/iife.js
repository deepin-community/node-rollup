this.my = this.my || {};
this.my.name = this.my.name || {};
this.my.name.spaced = this.my.name.spaced || {};
this.my.name.spaced.module = (function (exports) {
	'use strict';

	function doThings() {
		console.log( 'doing things...' );
	}

	const number = 42;

	var setting = 'no';

	exports.doThings = doThings;
	exports.number = number;
	exports.setting = setting;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
