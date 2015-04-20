const $ = require('jquery');
const assign = require('lodash.assign');

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
    onChangeCb: null,
    classOnTarget: false
};

const startsWith = (str, test) => str.indexOf(test) === 0;
const getHash = (url) => startsWith(url, '#') ? url : '#' + url.split('#')[1];
const get$ = (obj) => obj instanceof $ ? obj : $(obj);
const checkDisable = (val) => (typeof val === 'boolean' && !val) || (typeof val === 'string' && window.matchMedia(val).matches);
const updateHash = (hash = `${origin}${window.location.pathname}`) => {
    // maybe todo: allow use of pushstate
    if (historyTest) history.replaceState(null, null, hash);
    else if (startsWith(hash, '#')) window.location.hash = hash.split('#')[1];
    else window.location.hash = '';
};

module.exports = function scrollSpy(options) {
    const opts = assign({}, DEFAULTS, options);
    const { stickyNav, stickyClass, activeClass, disableScrollToAnchor, onScrollCb, onChangeCb, onClickCb } = opts;
    const $nav = get$(opts.nav);
    const $navLinks = $nav.find(opts.navLinks);
    const $title = get$(opts.title);
    const $scroll = $('html, body');
    const $window = $(window);
    const $navPoints = $navLinks.map((i, link) => {
        const point = $(getHash($(link).attr('href')));
        if (point.length) return point;
    });

    const DEFAULT_TITLE = $title.length && $title.text();
    const SCROLL_DEFAULTS = {
        tempNavHeight: null,
        duration: opts.scrollDuration,
        $link: null
    };

    // TODO: Use mutation observer to determine if classlist ever changes. Recalc height if it does.
    let navOffset;
    let navHeight;
    let isSticky = options.stickyNav ? false : ($nav.css('position') === 'fixed');
    let lastId;
    let silent = false;

    const scroll = (location, duration, check) => {
        $scroll.stop().animate({
            scrollTop: location
        }, duration).promise().done(() => {
            let {$link, $target, hash} = check;

            if ($link && $target && hash) {
                const windowHash = window.location.hash;
                const $linkParent = $link.parent();

                if (windowHash !== hash) {
                    updateHash(hash);
                }
                if (!$linkParent.hasClass(activeClass)) $linkParent.addClass(activeClass).siblings().removeClass(activeClass);
                if (!$target.hasClass(activeClass)) $target.addClass(activeClass).siblings().removeClass(activeClass);

                silent = true;
            }
        });
    };

    const scrollToAnchor = (hash, $target=$(hash), scrollOptions) => {
        const scrollOpts = assign({}, SCROLL_DEFAULTS, scrollOptions);
        const { duration, tempNavHeight, $link } = scrollOpts;

        if (hash === '#') scroll(0, duration);
        else {
            let destinationScroll = (1 + $target.offset().top);
            destinationScroll -= tempNavHeight || navHeight;

            if (stickyNav) {
                if (!isSticky) destinationScroll -= navHeight;
                if (navOffset > destinationScroll) destinationScroll += navHeight;
            }

            // todo: if destination is within some buffer of the current location, reduce duration

            scroll(destinationScroll, duration, {$link, $target, hash});
        }

        updateHash(hash);
    };

    const cb = (callBack, ...params) => {
        if (callBack) callBack(...params);
        navHeight = $nav.height();
    };

    $(function $ready() {
        const hash = window.location.hash;

        navOffset = stickyNav ? $nav.offset().top : null;
        navHeight = $nav.height();

        if (hash && navHeight !== 0) scrollToAnchor(hash, $(hash), {duration: 0, $link: $navLinks.filter(`[href*=${hash}]`), silent: true});
    });

    $nav.on('click', opts.navLinks, function navLinkClick(e) {
        const notDisabled = checkDisable(disableScrollToAnchor);
        const $el = $(this);

        if (notDisabled) {
            const hash = getHash($el.attr('href'));
            const $target = $(hash);

            if ($target.length) {
                if (stickyNav && !isSticky) scrollToAnchor(hash, $target, {$link: $el, tempNavHeight: $nav.height()});
                else scrollToAnchor(hash, $target, {$link: $el});
            }

            e.preventDefault();
        }

        cb(onClickCb, $el, !notDisabled);
    });

    $window.resize(() => navHeight = $nav.height());

    $window.scroll(function onWindowScroll() {
        if (checkDisable(opts.disableScrollSpy)) {
            const scroll = $window.scrollTop();
            let $cur, id, viewable;

            if (stickyNav) {
                // maybe todo: optimize to not do this all the time
                if (scroll >= navOffset) {
                    $nav.addClass(stickyClass);
                    isSticky = true;
                } else {
                    $nav.removeClass(stickyClass);
                    isSticky = false;
                }
                navHeight = $nav.height();
            }

            if (!silent) {
                viewable = isSticky ? (scroll + navHeight) : scroll;

                for (let i = $navPoints.length-1; i > -1; i--) {
                    if ($navPoints[i].offset().top < viewable) {
                        $cur = $navPoints[i];
                        i = -1;
                    }
                }

                id = $cur && $cur.length ? $cur[0].id : '';

                if (lastId !== id) {
                    lastId = id;

                    if (opts.classOnTarget) {
                        $cur.addClass(activeClass).siblings().removeClass(activeClass);
                    }
                    if (id === '') {
                        $navLinks.parent().removeClass(activeClass);
                        updateHash();
                        if ($title.length) $title.text(DEFAULT_TITLE);
                    } else {
                        let $parents = $navLinks.parent();
                        let $activeLink = $navLinks.filter(`[href*=#${id}]`);

                        $parents.removeClass(activeClass);
                        $activeLink.parent().addClass(activeClass);
                        updateHash(`#${id}`);
                        if ($title.length) $title.text($activeLink.text());
                    }

                    cb(onChangeCb, lastId, id, scroll, navHeight);
                }
            }
        }

        cb(onScrollCb, scroll, navHeight);
    });
};
