const AuthHelper = (function() {
    /**
     * A utility class intended to make working with authized endpoints easier.
     */
    class AuthHelper {
        /**
         * Determines if we have locally stored authentication information
         * @return {bool} true if we appear logged in, false otherwise
         */
        isLoggedIn() {
            return this.getAuthToken() !== null;
        }

        /**
         * Adds the required authorization headers to the given fetch
         * arguments. This will do nothing if not logged in.
         * @param {object} fetch_args
         */
        auth(fetch_args) {
            if(fetch_args === undefined) {
                fetch_args = {};
            }

            let info = this.getAuthToken();
            if(info === null) {
                return fetch_args;
            }

            let res = Object.assign({}, fetch_args);
            res.credentials = 'omit';

            res.headers = fetch_args.headers;
            if(res.headers === null || res.headers === undefined) {
                res.headers = new Headers();
            }else {
                res.headers = new Headers(res.headers);
            }

            res.headers.set('authorization', `bearer ${info.token}`);
            return res;
        }

        /**
         * Get the authtoken and user id that is currently stored.
         *
         * @return {object} Either null if there is no locally stored auth
         *   info or an object with keys token and user id
         */
        getAuthToken() {
            let sessionInfo = this.realGetAuthStorage(sessionStorage);
            if (sessionInfo !== null) {
                return sessionInfo;
            }

            return this.realGetAuthStorage(localStorage);
        }

        /**
         * Get the auth token and use rid in the given storage.
         *
         * @param {*} storage sessionStorage, localStorage, or some duck-typed
         *   equivalent.
         */
        realGetAuthStorage(storage) {
            let token = storage.getItem('rl-authtoken');
            if (token === null) {
                this.realClearAuthToken(storage);
                return null;
            }
            let userId = parseInt(storage.getItem('rl-user-id'));
            if (isNaN(userId)) {
                this.realClearAuthToken(storage);
                return null;
            }
            return {token: token, userId: userId};
        }

        /**
         * Clear the locally stored authtoken. This does not revoke the auth
         * token on the server. This clears it no matter where it is.
         */
        clearAuthToken() {
            this.realClearAuthToken(sessionStorage);
            this.realClearAuthToken(localStorage);
        }

        /**
         * Clear the locally stored authtoken within the given storage. Typically
         * either session or local storage.
         *
         * @param {object} storage Either local storage, session storage, or some
         *   duck-typed equivalent.
         */
        realClearAuthToken(storage) {
            storage.setItem('rl-authtoken', null);
            storage.setItem('rl-user-id', null);
        }
    }

    return new AuthHelper();
})();
