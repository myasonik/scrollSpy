var storedHistoryCapable = localStorage.getItem('historyCapable');
var ua;
var historyCapable = false;

if (storedHistoryCapable) {
    historyCapable = (storedHistoryCapable === 'false' ? false : true);
} else {
    ua = navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || (ua.indexOf('Android 4.0') !== -1)) &&
        ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1) {
        historyCapable = false;
    } else {
        historyCapable = (window.history && 'pushState' in window.history);
    }
    localStorage.setItem('historyCapable', historyCapable);
}

module.exports = historyCapable;