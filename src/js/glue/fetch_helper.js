const api_fetch = (function() {
    /**
     * This wraps fetch requests very lightly. The main feature it adds
     * is that if you set "rl-api-base" in the local storage, we will reroute
     * api requests to that location.
     */

    return function(url, kwargs) {
        // TODO: apiBase configurable
        let apiBase = 'https://staging.redditloans.com';//localStorage.getItem('rl-api-base');
        if(apiBase && url[0] === '/') {
            url = apiBase + url;
        }

        return fetch(url, kwargs).catch((e) => {
            if (e.message === 'Failed to fetch') {
                if (!kwargs || !kwargs.headers || kwargs.headers['Cache-Control'] !== 'no-cache' || kwargs.headers['Pragma'] !== 'no-cache') {
                    if (kwargs) {
                        kwargs = {};
                    } else {
                        kwargs = Object.assign({}, kwargs);
                    }

                    if (kwargs.headers) {
                        kwargs.headers = Object.assign({}, kwargs.headers);
                    } else {
                        kwargs.headers = {};
                    }

                    kwargs.headers['Cache-Control'] = 'no-cache';
                    kwargs.headers['Pragma'] = 'no-cache';
                    return api_fetch(url, kwargs);
                }
            }
            return Promise.reject(e);
        });
    };
})();
