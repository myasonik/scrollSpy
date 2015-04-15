let historyCapable = false;
const storedHistoryCapable = localStorage.getItem('historyCapable');

const testUA = () => {
    let ua = navigator.userAgent;
    return (ua.indexOf('Android 2.') !== -1 || (ua.indexOf('Android 4.0') !== -1)) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1;
};

if (storedHistoryCapable) historyCapable = (storedHistoryCapable === 'false' ? false : true);
else {
    if (testUA) historyCapable = false;
    else historyCapable = (window.history && 'pushState' in window.history);

    localStorage.setItem('historyCapable', historyCapable);
}

module.exports = historyCapable;
