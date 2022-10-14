System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var logo = new URL('assets/logo-25585ac1.svg', module.meta.url).href;

			function showImage(url) {
				console.log(url);
				if (typeof document !== 'undefined') {
					const image = document.createElement('img');
					image.src = url;
					document.body.appendChild(image);
				}
			}

			showImage(logo);

		}
	};
});
