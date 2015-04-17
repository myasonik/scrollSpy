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

const getHash = (url) => url.startsWith('#') ? url : '#' + url.split('#')[1];
const get$ = (obj) => obj instanceof $ ? obj : $(obj);

const checkDisable = (val) => (typeof val === 'boolean' && !val) || (typeof val === 'string' && window.matchMedia(val).matches);

module.exports = function scrollSpy(options) {
    const OPTS = Object.assign({}, DEFAULTS, options);
    const STICKYNAV = OPTS.stickyNav;
    const STICKYCLASS = OPTS.stickyClass;
    const $NAV = get$(OPTS.nav);
    const $NAVLINKS = $NAV.find(OPTS.navLinks);
    const ACTIVECLASS = OPTS.activeClass;
    const $TITLE = get$(OPTS.title);
    const DEFAULT_TITLE = $TITLE.length && $TITLE.text();
    const $SCROLL = $('html, body');
    const $WINDOW = $(window);
    const $NAVPOINTS = $NAVLINKS.map(() => {
        const POINT = $(getHash($(this).attr('href')));
        if (POINT.length) return POINT;
    });
    const DISABLE_SCROLL_TO_ANCHOR = OPTS.disableScrollToAnchor;
    const { onScrollCb, onChangeCb, onClickCb } = OPTS;
    const SCROLL_DEFAULTS = {
        TEMP_NAV_HEIGHT: null,
        DURATION: OPTS.scrollDuration
    };

    let NAVOFFSET;
    let navHeight; // allow changes of height on window resize or scroll
    let isSticky = options.stickyNav ? false : ($NAV.css('position') === 'fixed');
    let lastId;

    const updateHash = (HASH = `${origin}${window.location.pathname}`) => {
        if (historyTest) history.replaceState(null, null, HASH);
        else if (HASH.startsWith('#')) window.location.hash = HASH.split('#')[1];
        else window.location.hash = '';
    };

    const scroll = (LOCATION, DURATION) => {
        $SCROLL.stop().animate({
            scrollTop: LOCATION
        }, DURATION);
    };

    const scrollToAnchor = (HASH, $TARGET=$(HASH), SCROLL_OPTIONS) => {
        const SCROLL_OPTS = Object.assign({}, SCROLL_DEFAULTS, SCROLL_OPTIONS);
        const { DURATION, TEMP_NAV_HEIGHT } = SCROLL_OPTS;

        if (HASH === '#') scroll(0, DURATION);
        else {
            let destinationScroll = (1 + $TARGET.offset().top);
            destinationScroll -= TEMP_NAV_HEIGHT || navHeight;

            if (STICKYNAV) {
                if (!isSticky) destinationScroll -= navHeight;
                if (NAVOFFSET > destinationScroll) destinationScroll += navHeight;
            }

            scroll(destinationScroll, DURATION);
        }

        updateHash(HASH);
    };

    const cb = (callBack, ...params) => {
        if (callBack) callBack(...params);
        navHeight = $NAV.height();
    };

    $(function $ready() {
        const HASH = window.location.hash;

        NAVOFFSET = STICKYNAV ? $NAV.offset().top : null;
        navHeight = $NAV.height();

        if (HASH && navHeight !== 0) scrollToAnchor(HASH, $(HASH), {DURATION: 0});
    });

    $NAV.on('click', OPTS.navLinks, function navLinkClick(e) {
        const NOT_DISABLED = checkDisable(DISABLE_SCROLL_TO_ANCHOR);
        const $EL = $(this);

        if (NOT_DISABLED) {
            const HASH = getHash($EL.attr('href'));
            const $SCROLLTARGET = $(HASH);

            if ($SCROLLTARGET.length) {
                if (STICKYNAV && !isSticky) scrollToAnchor(HASH, $SCROLLTARGET, {TEMP_NAV_HEIGHT: $NAV.height()});
                else scrollToAnchor(HASH, $SCROLLTARGET);
            }
            e.preventDefault();
        }

        cb(onClickCb, $EL, !NOT_DISABLED);
    });

    $WINDOW.resize(() => navHeight = $($NAV).height());

    $WINDOW.scroll(function onWindowScroll() {
        if (checkDisable(OPTS.disableScrollSpy)) {
            const SCROLL = $WINDOW.scrollTop();
            let $cur, id;

            if (STICKYNAV) {
                // optimize to not do this all the time
                if (SCROLL >= NAVOFFSET) {
                    $NAV.addClass(STICKYCLASS);
                    isSticky = true;
                } else {
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

                    if ($TITLE.length) $TITLE.text($NAVLINKS.filter(`[href*=#${id}]`).text());
                }

                cb(onChangeCb, lastId, id, scroll, navHeight);
            }
        }

        cb(onScrollCb, scroll, navHeight);
    });
};
