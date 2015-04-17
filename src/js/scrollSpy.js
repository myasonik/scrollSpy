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
    classOn: ['a']
};

const getHash = (url) => url.startsWith('#') ? url : '#' + url.split('#')[1];
const get$ = (obj) => obj instanceof $ ? obj : $(obj);
const checkDisable = (val) => (typeof val === 'boolean' && !val) || (typeof val === 'string' && window.matchMedia(val).matches);
const getNavPoint = (link) => {
    const point = $(getHash($(link).attr('href')));
    if (point.length) return point;
};
const updateHash = (hash = `${origin}${window.location.pathname}`) => {
    if (historyTest) history.replaceState(null, null, hash);
    else if (hash.startsWith('#')) window.location.hash = hash.split('#')[1];
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
    const $navPoints = $navLinks.map(getNavPoint);

    const DEFAULT_TITLE = $title.length && $title.text();
    const SCROLL_DEFAULTS = {
        tempNavHeight: null,
        duration: opts.scrollDuration
    };

    // TODO check for resize on scroll
    let navOffset;
    let navHeight;
    let isSticky = options.stickyNav ? false : ($nav.css('position') === 'fixed');
    let lastId;

    const scroll = (location, duration) => $scroll.stop().animate({scrollTop: location}, duration);

    const scrollToAnchor = (hash, $target=$(hash), scrollOptions) => {
        const scrollOpts = assign({}, SCROLL_DEFAULTS, scrollOptions);
        const { duration, tempNavHeight } = scrollOpts;

        if (hash === '#') scroll(0, duration);
        else {
            let destinationScroll = (1 + $target.offset().top);
            destinationScroll -= tempNavHeight || navHeight;

            if (stickyNav) {
                if (!isSticky) destinationScroll -= navHeight;
                if (navOffset > destinationScroll) destinationScroll += navHeight;
            }

            scroll(destinationScroll, duration);
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

        if (hash && navHeight !== 0) scrollToAnchor(hash, $(hash), {duration: 0});
    });

    $nav.on('click', opts.navLinks, function navLinkClick(e) {
        const notDisabled = checkDisable(disableScrollToAnchor);
        const $el = $(this);

        if (notDisabled) {
            const hash = getHash($el.attr('href'));
            const $target = $(hash);

            if ($target.length) {
                if (stickyNav && !isSticky) scrollToAnchor(hash, $target, {tempNavHeight: $nav.height()});
                else scrollToAnchor(hash, $target);
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
                // todo: give target a class

                if (id === '') {
                    $navLinks.parent().removeClass(activeClass);
                    updateHash();
                    if ($title.length) $title.text(DEFAULT_TITLE);
                } else {
                    // todo: cache child variables
                    $navLinks.parent()
                        .removeClass(activeClass)
                        .find(`[href*=#${id}]`).parent().addClass(activeClass);

                    updateHash(`#${id}`);

                    if ($title.length) $title.text($navLinks.filter(`[href*=#${id}]`).text());
                }

                cb(onChangeCb, lastId, id, scroll, navHeight);
            }
        }

        cb(onScrollCb, scroll, navHeight);
    });
};
