const [PermissionRequired] = (function() {
    /**
     * Displays the children components, but only if the user is logged in
     * and has the given set of permissions.
     *
     * @param {list} permissions The set of required permissions before
     *   children are shown
     * @param {bool} invert If true we require the user does not have any
     *   of this listed permissions instead of requiring all the listed
     *   permissions.
     */
    class PermissionRequired extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                showChildren: false
            };
        }

        render() {
            if (!this.state.showChildren) { return React.createElement(React.Fragment); }

            return this.props.children;
        }

        componentDidMount() {
            if (this.props.invert && this.props.permissions.length === 0) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.showChildren = true;
                    return newState;
                });
            } else {
                this.checkPermissions();
            }
        }

        checkPermissions() {
            let authtoken = AuthHelper.getAuthToken();

            if (authtoken === null) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.showChildren = false;
                    return newState;
                });
                return;
            }


            api_fetch(
                `/api/users/${authtoken.userId}/permissions`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    return Promise.reject();
                }

                return resp.json();
            }).then((perms) => {
                let permsSet = new Set(perms);
                for (let perm of this.props.permissions) {
                    if (!permsSet.has(perm)) {
                        return Promise.reject();
                    }
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.showChildren = !this.props.invert;
                    return newState;
                });
            }).catch((e) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.showChildren = !!this.props.invert;
                    return newState;
                });
            })
        }
    }

    PermissionRequired.propTypes = {
        permissions: PropTypes.string.isRequired,
        invert: PropTypes.bool
    };

    return [PermissionRequired];
})();
