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
            let token = sessionStorage.getItem('rl-authtoken');
            if (token === null) {
                this.clearAuthToken();
                return null;
            }
            let userId = parseInt(sessionStorage.getItem('rl-user-id'));
            if (isNaN(userId)) {
                this.clearAuthToken();
                return null;
            }
            return {token: token, userId: userId};
        }

        /**
         * Clear the locally stored authtoken. This does not revoke the auth
         * token on the server.
         */
        clearAuthToken() {
            sessionStorage.setItem('rl-authtoken', null);
            sessionStorage.setItem('rl-user-id', null);
        }
    }

    return new AuthHelper();
})();