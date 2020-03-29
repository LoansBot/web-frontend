const api_fetch = (function() {
    /**
     * This wraps fetch requests very lightly. The main feature it adds
     * is that if you set "rl-api-base" in the local storage, we will reroute
     * api requests to that location.
     */

    return function(url, kwargs) {
        let apiBase = 'https://staging.redditloans.com';//localStorage.getItem('rl-api-base');
        if(apiBase && url[0] === '/') {
            url = apiBase + url;
        }

        return fetch(url, kwargs);
    };
})();