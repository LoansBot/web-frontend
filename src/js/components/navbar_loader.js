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
                username: null
            };

            let info = this.getAuthToken();
            if (info === null) {
                this.setNotLoggedInState(false);
            }else {
                this.tryGetUserInfo(info.userId, info.token).then((data) => {
                    this.setLoggedInState(data);
                }).catch(() => {
                    this.clearAuthToken();
                    this.setNotLoggedInState(true);
                });
            }
        }

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

        clearAuthToken() {
            // sessionStorage.setItem('rl-authtoken', null);
            // sessionStorage.setItem('rl-user-id', null);
        }

        tryGetUserInfo(user_id, token) {
            console.log(`try get user info for user id ${user_id}`);
            return api_fetch(
                `/api/users/${user_id}/me`, {
                    headers: new Headers({'Cookie': `authtoken=${token}`}),
                    credentials: 'omit'
                }
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
                show: ['home', [
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

        setLoggedInState(data) {
            this.setState({
                loading: false,
                show: ['home', 'logout'],
                username: data.username
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
            if (name === 'home') {
                return {
                    name: 'Home',
                    ariaLabel: 'Navigate to the home page',
                    current: current,
                    url: '/'
                };
            }else if (name === 'login') {
                return {
                    name: 'Login',
                    ariaLabel: 'Navigate to the login page',
                    current: current,
                    url: '/login.html'
                };
            }else if (name === 'signup') {
                return {
                    name: 'Sign Up',
                    ariaLabel: 'Navigate to the sign-up page',
                    current: current,
                    url: '/signup.html'
                };
            }else if (name === 'forgot-password') {
                return {
                    name: 'Forgot Password',
                    ariaLabel: 'Navigate to the password recovery page',
                    current: current,
                    url: '/forgot_password.html'
                };
            }else if (name === 'logout') {
                return {
                    name: `Logout (${this.state.username})`,
                    ariaLabel: 'Logout and refresh the page',
                    current: false,
                    url: '/logout.html'
                };
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