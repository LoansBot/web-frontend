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
                if (!kwargs || !kwargs.headers || kwargs.headers.get('Cache-Control') !== 'no-cache' || kwargs.headers.get('Pragma') !== 'no-cache') {
                    if (kwargs) {
                        kwargs = Object.assign({}, kwargs);
                    } else {
                        kwargs = {};
                    }

                    if (kwargs.headers !== null && kwargs.headers !== undefined) {
                        kwargs.headers = new Headers(kwargs.headers);
                    } else {
                        kwargs.headers = new Headers();
                    }

                    kwargs.headers.set('Cache-Control', 'no-cache');
                    kwargs.headers.set('Pragma', 'no-cache');
                    return api_fetch(url, kwargs);
                }
            }
            return Promise.reject(e);
        });
    };
})();
