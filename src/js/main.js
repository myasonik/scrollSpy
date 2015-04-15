require('babel/polyfill');
// require('./matchMedia'); // only necessary if using a media query in options

const scrollSpy = require('./scrollSpy');

scrollSpy({
    nav: '#pageNav',
    stickyNav: true
});
