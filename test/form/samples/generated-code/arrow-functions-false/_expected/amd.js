define(['require', 'exports', 'externalNoImport', 'external', 'externalAuto', 'externalDefault', 'externalDefaultOnly'], (function (require, exports, externalNoImport, defaultCompat, externalAuto, externalDefault, externalDefaultOnly) { 'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	function _interopNamespaceCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : _interopNamespaceDefault(e); }

	function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, default: e }); }

	function _interopNamespaceDefault(e) {
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n.default = e;
		return Object.freeze(n);
	}

	function _mergeNamespaces(n, m) {
		m.forEach(function (e) {
			e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
				if (k !== 'default' && !(k in n)) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		});
		return Object.freeze(n);
	}

	var defaultCompat__namespace = /*#__PURE__*/_interopNamespaceCompat(defaultCompat);
	var externalAuto__default = /*#__PURE__*/_interopDefault(externalAuto);
	var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);
	var externalDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(externalDefaultOnly);

	exports.a = void 0;

	({ a: exports.a } = defaultCompat.b);
	console.log({ a: exports.a } = defaultCompat.b);

	Promise.resolve().then(function () { return main; }).then(console.log);

	new Promise(function (resolve, reject) { require(['external'], function (m) { resolve(/*#__PURE__*/_interopNamespaceCompat(m)); }, reject); }).then(console.log);
	console.log(defaultCompat__namespace.default);
	console.log(externalAuto__default.default);
	console.log(externalDefault__namespace);
	console.log(externalDefaultOnly__namespace);

	var main = /*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		get a () { return exports.a; },
		foo: foo
	}, [defaultCompat__namespace]);

	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () { return defaultCompat.foo; }
	});
	Object.keys(defaultCompat).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return defaultCompat[k]; }
		});
	});

}));
