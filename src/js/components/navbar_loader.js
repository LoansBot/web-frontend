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
            sessionStorage.setItem('rl-authtoken', null);
            sessionStorage.setItem('rl-user-id', null);
        }

        tryGetUserInfo(user_id, token) {
            return fetch(
                `api/users/${user_id}/me`, {
                    headers: new Headers({'Cookie': `authtoken=${token}`})
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
                show: ['home', 'login'],
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
            let current = this.props.currentPage === name;
            if (name === 'home') {
                return {
                    name: 'Home',
                    ariaLabel: 'Navigate to home page',
                    current: current,
                    url: '/'
                };
            }else if (name === 'login') {
                return {
                    name: 'Login',
                    ariaLabel: 'Navigate to login or sign-up page',
                    current: current,
                    url: '/login'
                };
            }else if (name === 'logout') {
                return {
                    name: `Logout (${this.state.username})`,
                    ariaLabel: 'Logout and refresh the page',
                    current: false,
                    url: '/logout'
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