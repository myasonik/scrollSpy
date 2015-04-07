const $ = require('jquery');
const debounce = require('./debounce.js');
const historyTest = require('./historyTest');
const origin = window.location.origin || `${window.location.protocol}//${window.location.host}`;

// Strips href down to only hash
const formatHash = hash => '#' + hash.split('#')[1];
const onResize = () => pageWidth = $window.width();
$.fn.reverse = function() {
	return this.pushStack(this.get().reverse(), arguments);
};

let $window = $(window);
let pageWidth = $window.width();

$window.bind('resize', debounce(onResize));

module.exports = function(options) {
	const DEFAULTS = {
		$nav: null,
		pageOffset: 0,
		scrollSpeed: 500,
		$navLinks: $('[href^="#"]'),
		$titles: null,
		disableFancyClickBelow: null,
		addClassToParent: true,
		activeClass: 'is-active',
		calculateOffset: true,
		stickyNav: false
	};

	const opts = Object.assign({}, DEFAULTS, options);
	
	let {$navLinks, pageOffset, $nav, $titles} = opts;

	if ($nav) {
		if (opts.calculateOffset && !options.pageOffset) pageOffset = $nav.height();
		if (!options.navLinks) $navLinks = $nav.find('[href^="#"]');
	}

	if (opts.stickyNav) {
		let navOffset = $nav.offset().top;
	}

	var $navPoints = $navLinks.map(function() {
		var point = $(formatHash($(this).attr('href')));
		if (point.length) return point;
	}).reverse();

	function navigateToAnchor(href) {
		$('html, body').stop().animate({
			// We want to go to the top of the page if we're not linking to anything
			scrollTop: (href === '#') ? 0 : 1 + $(href).offset().top - pageOffset
		}, opts.scrollSpeed);
	}

	// Scroll clicked links to target element
	function handleFancyClick(e) {
		let hash = formatHash($(this).attr('href'));
		if($(hash).length && pageWidth >= opts.disableFancyClickBelow) { // change to matchMedia test
			navigateToAnchor(hash);
			e.preventDefault(); // override default behavior
		}
	}

	// Set handler on navLinks
	$navLinks.click(handleFancyClick);

	// Check if has hash
	if (window.location.hash && pageOffset !== 0) navigateToAnchor(formatHash(window.location.hash));

	// Scroll listener
	let lastId = '';
	$window.scroll(function() {
		var fromTop = $window.scrollTop();
		var viewableFromTop = fromTop + pageOffset;
		var id;
		var cur;
		var stateObj;

		$navPoints.each(function(i, $el) {
			if ($el.offset().top < viewableFromTop) {
				cur = $el;
				return false;
			}
		});

		if (fromTop > navOffset) {
			$nav.addClass('is-sticky');
		} else {
			$nav.removeClass('is-sticky');
		}

		id = cur && cur.length ? cur[0].id : '';

		if (lastId !== id) {
			lastId = id;

			// Add active class to link's wrapper
			if (id === '') {
				if (opts.addClassToParent) {
					$navLinks.parent().removeClass(opts.activeClass);
				} else {
					$navLinks.removeClass(opts.activeClass);
				}
				
				if (historyTest) history.replaceState(null, null, `${origin}${window.location.pathname}`);
				else if (pageOffset > -1) window.location.hash = id;

			} else {
				if (opts.addClassToParent) {
					$navLinks
						.parent().removeClass(opts.activeClass)
						.end().filter('[href*=#'+id+']').parent().addClass(opts.activeClass);
				} else {
					$navLinks
						.removeClass(opts.activeClass)
						.parent().parent().find('[href*=#'+id+']').addClass(opts.activeClass);
				}

				if (historyTest) history.replaceState(null, null, `#${id}`);
				else if (pageOffset > -1) window.location.hash = id;
			}

			// If title targets are set, update titles
			if ($titles) $titles.text($navLinks.filter('[href*=#'+id+']').text());
		}
	});
};