const NavbarLoader = (function() {
    var cE = React.createElement;

    /**
     * A component which essentially wraps a navbar, except if the user is
     * logged in then it performs AJAX queries to decide what the appropriate
     * navbar elements are based on the users authorizations.
     *
     * @param {object} navbarProps Props to forward to the NavBar once it's
     *   ready
     * @param {string} currentPage A string representing the current page,
     *   e.g., 'home'.
     */
    class NavbarLoader extends React.Component
    {
        constructor(props) {
            super(props);

            this.state = {
                loading: true,
                show: [],
                username: null,
                permissions: null
            };

            this.userPermsState = null;
            this.verifiedAuthState = null;

            let info = AuthHelper.getAuthToken();
            if (info === null) {
                this.setNotLoggedInState(false);
            }else {
                this.tryGetUserInfo(info.userId, info.token).then((data) => {
                    this.userPermsState = true;
                    if (this.verifiedAuthState === false) {
                        return;
                    }

                    this.setLoggedInState(null, data.permissions);
                }).catch(() => {
                    this.userPermsState = false;
                    if (this.verifiedAuthState === false) {
                        return;
                    }

                    AuthHelper.clearAuthToken();
                    this.setNotLoggedInState(true);
                });

                this.tryVerifyLoggedIn(info.userId, info.token).then((data) => {
                    this.verifiedAuthState = true;
                    this.setLoggedInState(data.username, null);
                }).catch(() => {
                    this.verifiedAuthState = false;
                    AuthHelper.clearAuthToken();
                    this.setNotLoggedInState(true);
                });
            }
        }

        /**
         * Fetch the required information to display the navbar. This data is
         * aggressively cached, so another job should be fired to verify the
         * authorization token on /me which is less aggressively cached (see
         * tryVerifyLoggedIn)
         * @param {number} user_id The primary key of the user whose data needs
         *   to be fetched
         * @param {string} token The authorization to use to fetch their
         *   permissions
         */
        tryGetUserInfo(user_id, token) {
            return api_fetch(
                `/api/users/${user_id}/permissions`, AuthHelper.auth()
            ).then(response => {
                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            });
        }

        tryVerifyLoggedIn(user_id, token) {
            return api_fetch(
                `/api/users/${user_id}/me`, AuthHelper.auth()
            ).then(response => {
                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            });
        }

        setNotLoggedInState(mounted) {
            let newState = {
                loading: false,
                show: ['home', 'loans', [
                    'Account',
                    'Open account management secondary navbar',
                    ['login', 'signup', 'forgot-password']
                ]],
                username: null
            };
            if (mounted) {
                this.setState(newState);
            }else {
                this.state = newState;
            }
        }

        setLoggedInState(username, permissions) {
            let usern = username ? username : this.state.username;
            let perms = permissions ? permissions : this.state.permissions;

            let show = ['home', 'loans', [
                'Account',
                'Open account management secondary navbar',
                ['my-account', 'logout']
            ]];
            if(perms) {
                for(var i = 0, len = perms.length; i < len; i++) {
                    let itm = this.permToNavItem(perms[i]);
                    if (itm) {
                        let arrToModify = show;
                        if (itm.length === 2) {
                            arrToModify = show.find((val) => (Array.isArray(val) && val[0] === itm[0]))[2];
                        }
                        arrToModify.push(itm[itm.length - 1]);
                    }
                }
            }
            this.setState({
                loading: false,
                show: show,
                username: usern,
                permissions: perms
            });
        }

        render() {
            if (this.state.loading) {
                return this.renderLoading();
            }
            let navbarProps = Object.assign({}, this.props.navbarProps);
            navbarProps.row = this.state.show.map((nm) => this.rowItemByName(nm));
            return cE(NavBar, navbarProps, null);
        }

        permToNavItem(name) {
            if(name === 'logs') {
                return ['logs'];
            }else if (name === 'responses') {
                return ['responses'];
            }else if (name === 'view-others-settings') {
                return ['Account', 'others-settings'];
            }

            return null;
        }

        rowItemByName(name) {
            if(Array.isArray(name)) {
                return {
                    name: name[0],
                    ariaLabel: name[1],
                    current: name[2].some((nm) => this.props.currentPage == nm),
                    row: name[2].map((nm) => this.rowItemByName(nm))
                };
            }

            let current = this.props.currentPage === name;
            if(name === 'home') {
                return {
                    name: 'Home',
                    ariaLabel: 'Navigate to the home page',
                    current: current,
                    url: '/'
                };
            }else if(name === 'loans') {
                return {
                    name: 'Loans',
                    ariaLabel: 'Navigate to the search loans page',
                    current: current,
                    url: '/loans.html'
                }
            }else if(name === 'login') {
                return {
                    name: 'Login',
                    ariaLabel: 'Navigate to the login page',
                    current: current,
                    url: '/login.html'
                };
            }else if(name === 'signup') {
                return {
                    name: 'Sign Up',
                    ariaLabel: 'Navigate to the sign-up page',
                    current: current,
                    url: '/signup.html'
                };
            }else if(name === 'forgot-password') {
                return {
                    name: 'Forgot Password',
                    ariaLabel: 'Navigate to the password recovery page',
                    current: current,
                    url: '/signup.html?forgot=true'
                };
            }else if(name === 'logout') {
                return {
                    name: this.state.username ? `Logout (${this.state.username})` : 'Logout',
                    ariaLabel: 'Logout and refresh the page',
                    current: false,
                    url: '/logout.html'
                };
            }else if(name === 'logs') {
                return {
                    name: 'Logs',
                    ariaLabel: 'Navigate to the view logs page',
                    current: current,
                    url: '/logs.html'
                };
            }else if(name === 'responses') {
                return {
                    name: 'Responses',
                    ariaLabel: 'Navigate to the view and edit responses page',
                    current: current,
                    url: '/responses.html'
                };
            }else if (name === 'my-account') {
                return {
                    name: 'My Account',
                    ariaLabel: 'Navigate to the manage my account page',
                    current: current,
                    url: '/my-account.html'
                }
            }else if (name === 'others-settings') {
                return {
                    name: 'Administrate',
                    ariaLabel: 'Navigate to manage others accoutns page',
                    current: current,
                    url: '/administrate-users.html'
                }
            }
        }

        renderLoading() {
            return cE('div', null, 'Loading Navbar...')
        }
    }

    NavbarLoader.propTypes = {
        navbarProps: PropTypes.object,
        currentPage: PropTypes.string.isRequired
    };

    return NavbarLoader;
})();
