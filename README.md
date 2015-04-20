scrollSpy
-----------
A simple scroll spy

#### Building the Project
* Dependencies: node, (ruby) sass*, gulp
* To start run `npm install`, `git submodule init` and `git submodule update`.
* `gulp` will build the site
* `gulp watch` will set-up watch, watchify, browser-sync
* `gulp prod` will build the site with minified/uglified/optimized assets

\*Sass is only there to build the demo page. You can remove it all if you like.

#### Example

```javascript
// require('./matchMedia'); // only necessary if using a media query in options & want deeper support

scrollSpy({
	nav: '#pageNav',
	stickyNav: true
});
```

#### Settings
Options | Type | Default | Description
------- | ---- | ------- | -----------
nav | string or jQuery obj | null | Selector for your entire nav container, probably a `<nav>` or `<ul>`
navLinks | string | '[href^="#"]' | The links that will be controlling this thing
stickyClass | string | 'is-sticky' | Class that's applied to your nav when it's off the page. You probably want to set `position: fixed;` at this point.
scrollDuration | number | 500 | How long do you want the animated scrolls to take
activeClass | string | is-active | Class that's applied to the nav item that's the current position on the page.
stickyNav | boolean | false | Do you want me to toggle the stickyClass when the nav is on/off the page
title | string or jQuery obj | null | Do you need to update something to the title of the link when it's the current position?
disableScrollToAnchor | boolean or string | false | True will disable animated scrolls between anchors. A media query will disable it accordingly (Ex. `(min-width: 768px)`). Remember to use a matchMedia polyfill if you need that support.
disableScrollSpy | boolean or string | false | True will basically disable the whole point of this thing. The string is a media query, refer to above.
classOnTarget | boolean | false | Adds active class to current active target (not the anchor)


#### Callbacks
Name | Params | Description
---- | ------ | -----------
onScrollCb | scrollPosition: num, navHeight: num | Fired on scroll. Not debounced or throttled. Will not be disabled by disableScrollSpy option.
onChangeCb | lastId: string, id: string, scroll: num, navHeight: num | Fired when current section changes. LastId is the previous one. id is the new one.
onClickCb | el: jquery obj of item clicked, disabled: whether or not disableScrollToAnchor is on | Fired when nav item is clicked


#### Known Issues
Your last item needs to be tall enough to ensure that it triggers the scroll spy. It can probably be a touch more intelligent about how it works but consider adjusting your design to better suit this.
