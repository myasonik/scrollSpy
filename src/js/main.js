require('babel/polyfill');
// require('./matchMedia'); // only necessary if using a media query in options

var scrollSpy = require('./scrollSpy');

scrollSpy({
	nav: '#pageNav',
	stickyNav: true
});