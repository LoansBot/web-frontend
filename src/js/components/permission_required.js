const [PermissionRequired] = (function() {
    /**
     * Displays the children components, but only if the user is logged in
     * and has the given set of permissions.
     *
     * @param {list} permissions The set of required permissions before
     *   children are shown
     */
    class PermissionRequired extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                showChildren: false
            };

            this.checkPermissions();
        }

        render() {
            if (!this.state.showChildren) { return React.createElement(React.Fragment); }

            return this.props.children;
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
                for (let perm of this.props.permissions) {
                    if (!perms.include(perm)) {
                        return Promise.reject();
                    }
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.showChildren = true;
                    return newState;
                });
            }).catch(() => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.showChildren = false;
                    return newState;
                });
            })
        }
    }

    PermissionRequired.propTypes = {
        permissions: PropTypes.string.isRequired
    };

    return [PermissionRequired];
})();
