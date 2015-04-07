const $ = require('jquery');
const historyTest = require('./historyTest');
const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;

const DEFAULTS = {
	nav: null,
	navLinks: '[href^="#"]',
	stickyClass: 'is-sticky',
	scrollDuration: 500,
	activeClass: 'is-active',
	stickyNav: false,
	title: null,
	disableScrollToAnchor: false,
	disableScrollSpy: false,
	onScrollCb: null, 
	onChangeCb: null
};

const getHash = (url) => url.startsWith('#') ? url : '#' + hash.split('#')[1];

function checkDisable(val) {
	return (typeof val === 'boolean' && !val) || 
			(typeof val === 'string' && window.matchMedia(val).matches);
}

module.exports = function(options) {
	const OPTS = Object.assign({}, DEFAULTS, options);
	const STICKYNAV = OPTS.stickyNav;
	const STICKYCLASS = OPTS.stickyClass;
	const $NAV = $(OPTS.nav);
	const $NAVLINKS = $NAV.find(OPTS.navLinks);
	const ACTIVECLASS = OPTS.activeClass;
	const $TITLE = $(OPTS.title);
	const DEFAULT_TITLE = $TITLE.length && $TITLE.text();
	const $SCROLL = $('html, body');
	const $WINDOW = $(window);
	const $NAVPOINTS = $NAVLINKS.map(function() {
		const POINT = $(getHash($(this).attr('href')));
		if (POINT.length) return POINT;
	});
	const { onScrollCb, onChangeCb } = OPTS;

	let NAVOFFSET;
	let navHeight; // allow changes of height on window resize or scroll
	let isSticky = options.stickyNav ? false : ($NAV.css('position') === 'fixed');
	let lastId;

	function updateHash(HASH = `${origin}${window.location.pathname}`) {
		if (historyTest) history.replaceState(null, null, HASH);
		else if (HASH.startsWith('#')) window.location.hash = HASH.split('#')[1]; 
		else window.location.hash = '';
	}

	function scrollToAnchor(HASH, $TARGET=$(HASH), DURATION=OPTS.scrollDuration) {
		$SCROLL.stop().animate({
			// We want to go to the top of the page if we're not linking to anything
			scrollTop: (HASH === '#') ? 0 : (1 + $TARGET.offset().top - navHeight)
		}, DURATION);
		updateHash(HASH);
	}

	$(function() {
		const HASH = window.location.hash;

		NAVOFFSET = STICKYNAV ? $NAV.offset().top : null;
		navHeight = $NAV.height();

		// not sure why a duration of 0 doesn't work...
		if (HASH && navHeight !== 0) scrollToAnchor(HASH, $(HASH), 50);
	});

	$NAV.on('click', OPTS.navLinks, function(e) {
		if (checkDisable(OPTS.disableScrollToAnchor)) {
			const HASH = getHash($(this).attr('href'));
			const $SCROLLTARGET = $(HASH);

			if ($SCROLLTARGET.length) scrollToAnchor(HASH, $SCROLLTARGET);
			e.preventDefault();
		}
	});

	$WINDOW.resize(function() { navHeight = $($NAV).height(); });

	$WINDOW.scroll(function() {
		if (checkDisable(OPTS.disableScrollSpy)) {
			const SCROLL = $WINDOW.scrollTop();
			let $cur, id;

			if (STICKYNAV) {
				// optimize to not do this all the time
				if (SCROLL >= NAVOFFSET) {
					$NAV.addClass(STICKYCLASS);
					isSticky = true;
				}
				else {
					$NAV.removeClass(STICKYCLASS);
					isSticky = false;
				}
				navHeight = $NAV.height();
			}

			const VIEWABLETOP = isSticky ? (SCROLL + navHeight) : SCROLL;

			for (let i = $NAVPOINTS.length-1; i > -1; i--) {
				if ($NAVPOINTS[i].offset().top < VIEWABLETOP) {
					$cur = $NAVPOINTS[i];
					i = -1;
				}
			}

			id = $cur && $cur.length ? $cur[0].id : '';

			if (lastId !== id) {
				lastId = id;

				if (id === '') {
					$NAVLINKS.parent().removeClass(ACTIVECLASS);
					updateHash();
					if ($TITLE.length) $TITLE.text(DEFAULT_TITLE);
				} else {
					$NAVLINKS.parent()
						.removeClass(ACTIVECLASS)
						.find(`[href*=#${id}]`).parent().addClass(ACTIVECLASS);
					
					updateHash(`#${id}`);

					if ($TITLE.length) {
						$TITLE.text($NAVLINKS.filter(`[href*=#${id}]`).text());
					}
				}

				if (onChangeCb) onChangeCb(lastId, id, scroll, navHeight);
			}
		}

		if (onScrollCb) onScrollCb(scroll, navHeight);
	});
};