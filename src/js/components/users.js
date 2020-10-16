const [UserAjax, UserSelectFormWithAjax, UserSelectFormWithAjaxAndView] = (function() {
    /**
     * Shows a description of a particular permission alongside some controls
     * for that permission.
     *
     * @param {string} name The name for this permission.
     * @param {string} description The description for this permission.
     * @param {string} applyStyle A string which acts as an enum to determine
     *   if the user can apply/revoke this permission. Takes one of the
     *   following values:
     *   - grant: Show a button to grant this permission
     *   - revoke: Show a button to revoke this permission
     *   - neither: Do not show a button to grant/revoke this permission.
     * @param {function} onApply A function which we call when the apply button
     *   is pressed.
     */
    class Permission extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'user-permission'},
                [
                    React.createElement(
                        'div',
                        {key: 'name', className: 'user-permission-name'},
                        this.props.name,
                    ),
                    React.createElement(
                        'div',
                        {key: 'desc', className: 'user-permission-desc'},
                        this.props.description
                    )
                ].concat(
                    this.props.applyStyle == 'neither' ? [] : [
                    React.createElement(
                        Button,
                        {
                            key: 'button',
                            text: (
                                this.props.applyStyle == 'grant' ? 'Grant' : 'Revoke'
                            ),
                            style: 'primary',
                            type: 'button',
                            onClick: this.props.onApply
                        }
                    )
                ])
            )
        }
    };

    Permission.propTypes = {
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        applyStyle: PropTypes.string.isRequired,
        onApply: PropTypes.func
    };

    /**
     * Loads a permission from its name using an Ajax call to get the other
     * properties and then renders it.
     *
     * @param {string} name The name for this permission
     * @param {string} applyStyle See Permission.
     * @param {function} onApply See Permission.
     */
    class PermissionAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                action: 'loading',
                description: null,
                error: null
            };

            this.loadPermission();
        }

        render() {
            if (this.state.action === 'loading') {
                return React.createElement(CenteredSpinner);
            }

            if (this.state.action === 'errored') {
                return React.createElement(
                    Alert,
                    {
                        title: this.state.error.title,
                        type: this.state.error.type,
                        text: this.state.error.text
                    }
                );
            }

            return React.createElement(
                Permission,
                {
                    name: this.props.name,
                    description: this.state.description,
                    applyStyle: this.props.applyStyle,
                    onApply: this.props.onApply
                }
            );
        }

        loadPermission() {
            api_fetch(
                `/api/permissions/${this.props.name}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    console.log(`Error fetching permission ${this.props.name}: ${resp.status}`)

                    if (resp.status === 404) {
                        return Promise.reject({
                            title: '404: Not Found',
                            type: 'error',
                            text: `Could not find the permission ${this.props.name}`
                        });
                    }

                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        type: 'error',
                        text: `Got an unexpected error loading permission ${this.props.name}`
                    });
                }

                return resp.json();
            }).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'loaded';
                    newState.description = json.description;
                    newState.error = null;
                    return newState;
                });
            }).catch((err) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'errored';
                    newState.description = null;
                    newState.error = err;
                    return newState;
                });
            });
        }
    };

    PermissionAjax.propTypes = {
        name: PropTypes.string.isRequired,
        applyStyle: PropTypes.string.isRequired,
        onApply: PropTypes.func
    };

    /**
     * Allows the user to select from one of many permissions.
     *
     * @param {list} permissions The list of permissions to show, where each
     *   item is an object with the following values:
     *   - {string} name The name of the permission
     *   - {boolean} granted True if the permission is granted already, false
     *     if it is not.
     * @param {string} initialPermission The initial permission to have
     *   selected; no effect when updating the component.
     * @param {function} permissionSet A function we call with a function which
     *   accepts a name of a permission and sets that value within this form.
     * @param {function} permissionQuery A function we call with a function
     *   that returns the name of the currently selected permission.
     * @param {function} permissionChanged A function we call whenever the
     *   selected permission changes with the newly selected permission.
     */
    class PermissionSelectForm extends React.Component {
        render() {
            return React.createElement(
                DropDown,
                {
                    options: this.props.permissions.slice(0).sort().map((perm) => {
                        return {
                            key: perm.name,
                            text: (perm.granted ? '✓ ' : '') + perm.name
                        };
                    }),
                    initialOption: this.props.initialPermission,
                    optionQuery: this.props.permissionQuery,
                    optionSet: this.props.permissionSet,
                    optionChanged: this.props.permissionChanged
                }
            );
        }
    };

    PermissionSelectForm.propTypes = {
        permissions: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            granted: PropTypes.bool.isRequired
        })),
        initialPermission: PropTypes.string,
        permissionSet: PropTypes.func,
        permissionQuery: PropTypes.func,
        permissionChanged: PropTypes.func
    };

    /**
     * Allows the user to select any of the permissions which are either
     * currently granted to the given authentication method or could be granted
     * by the logged in user. This wraps the function queries from the
     * underlying select form to distinguish granted vs available.
     *
     * @param {number} authenticationMethodId The primary key of the
     *   authentication method to fetch permissions for.
     * @param {function} grantedSet A function which we call with a function
     *   which accepts the name of a permission and causes us to assume it's
     *   granted. This should always be accompanied with cache busting.
     * @param {function} revokedSet A function which we call with a function
     *   which accepts the name of a permission and causes us to assume it's
     *   revoked. This should always be accompanied with cache busting.
     * @param {function} permissionSet A function we call with a function
     *   which accepts a name of a permission and sets the value within this
     *   form.
     * @param {function} permissionQuery A function we call with a function
     *   which returns an array with two values; the first of which is the
     *   name of the selected permission and the second of which is true if
     *   the permission is already granted and false if the permission is
     *   available but not granted.
     * @param {function} permissionChanged A function we call whenever the
     *   selected permission changes with an array with two values; the first
     *   of which is the name of the selected permission and the second is
     *   true if the permission is already granted and false if the
     *   permission is available but not granted.
     */
    class PermissionSelectFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                action: 'loading',
                grantedPermissions: null,
                grantedPermissionsLookup: null,
                allPermissions: null,
                error: null
            };

            this.props.grantedSet(((perm) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    if (newState.grantedPermissionsLookup && !newState.grantedPermissionsLookup[perm]) {
                        newState.grantedPermissions = newState.grantedPermissions.concat([perm]);
                        newState.grantedPermissionsLookup = Object.assign({}, newState.grantedPermissionsLookup);
                        newState.grantedPermissionsLookup[perm] = true;
                    }
                    return newState;
                });
            }));

            this.props.revokedSet(((perm) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    if (newState.grantedPermissionsLookup && newState.grantedPermissionsLookup[perm]) {
                        newState.grantedPermissions = newState.grantedPermissions.filter((p) => p !== perm);
                        newState.grantedPermissionsLookup = Object.assign({}, newState.grantedPermissionsLookup);
                        delete newState.grantedPermissionsLookup[perm];
                    }
                    return newState;
                });
            }));

            this.loadPermissions();
        }

        render() {
            if (this.state.action === 'loading') {
                return React.createElement(CenteredSpinner);
            }

            if (this.state.action === 'errored') {
                return React.createElement(
                    Alert,
                    {
                        title: this.state.error.title,
                        text: this.state.error.text,
                        type: this.state.error.type
                    }
                );
            }

            return React.createElement(
                FormElement,
                {
                    labelText: 'Permissions',
                    component: PermissionSelectForm,
                    componentArgs: {
                        permissions: this.state.allPermissions.map((p) => {
                            return {
                                name: p,
                                granted: !!this.state.grantedPermissionsLookup[p]
                            };
                        }),
                        initialPermission: this.state.allPermissions[0],
                        permissionSet: this.props.permissionSet,
                        permissionQuery: ((query) => {
                            if (!this.props.permissionQuery) { return; }
                            this.props.permissionQuery((() => {
                                let perm = query();
                                let granted = !!this.state.grantedPermissionsLookup[perm];
                                return [perm, granted];
                            }).bind(this));
                        }).bind(this),
                        permissionChanged: ((perm) => {
                            if (!this.props.permissionChanged) { return; }
                            let granted = !!this.state.grantedPermissionsLookup[perm];
                            this.props.permissionChanged([perm, granted]);
                        }).bind(this)
                    }
                }
            )
        }

        loadPermissions() {
            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}/permissions`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    if (resp.status === 404) {
                        return Promise.reject({
                            title: '404: Not Found',
                            type: 'error',
                            text: (
                                'Could not find authentication method with ' +
                                `id ${this.props.authenticationMethodId} - ` +
                                'perhaps you need to login again.'
                            )
                        });
                    }

                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        type: 'error',
                        text: (
                            `An unexpected error occurred fetching ${this.props.authenticationMethodId}.`
                        )
                    });
                }

                return resp.json();
            }).then((json) => {
                this.setState((state) => {
                    if (state.action === 'errored') { return; }
                    let newState = Object.assign({}, state);
                    newState.grantedPermissions = json.granted;
                    newState.grantedPermissionsLookup = {};
                    for (let perm of newState.grantedPermissions) {
                        newState.grantedPermissionsLookup[perm] = true;
                    }
                    if (state.allPermissions) {
                        newState.action = 'loaded';
                        this.props.permissionChanged([
                            newState.allPermissions[0],
                            !!newState.grantedPermissionsLookup[newState.allPermissions[0]]
                        ]);
                    }
                    return newState;
                });
            }).catch((err) => {
                if (typeof(err) !== 'object' || typeof(err.title) !== 'string') {
                    err = {
                        title: 'Error Fetching Permissions',
                        type: 'error',
                        text: `Unexpected error: ${err}`
                    };
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'errored';
                    newState.error = err;
                    return newState;
                });
            });

            api_fetch(
                '/api/permissions', AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        type: 'error',
                        text: (
                            `An unexpected error occurred fetching available permissions.`
                        )
                    });
                }

                return resp.json();
            }).then((json) => {
                this.setState((state) => {
                    if (state.action === 'errored') { return; }
                    let newState = Object.assign({}, state);
                    newState.allPermissions = json.permissions;
                    if (newState.grantedPermissions) {
                        this.props.permissionChanged([
                            newState.allPermissions[0],
                            !!newState.grantedPermissionsLookup[newState.allPermissions[0]]
                        ]);
                        newState.action = 'loaded';
                    }
                    return newState;
                });
            }).catch((err) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'errored';
                    newState.error = err;
                    return newState;
                });
            });
        }
    };

    PermissionSelectFormWithAjax.propTypes = {
        authenticationMethodId: PropTypes.number.isRequired,
        grantedSet: PropTypes.func,
        revokedSet: PropTypes.func,
        permissionSet: PropTypes.func,
        permissionQuery: PropTypes.func,
        permissionChanged: PropTypes.func
    };

    /**
     * Allows the user to select of the permissions on a particular
     * authentication method for the purpose of viewing them. This will handle
     * granting or revoking the permission.
     *
     * @param {number} authenticationMethodId The primary key for the
     *   authentication method whose permissions should be managed.
     */
    class PermissionSelectFormWithAjaxAndView extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: null,
                alertState: 'closed',
                permission: null,
                applyDisabled: false
            };

            this.grantedSet = null;
            this.revokedSet = null;
        }

        render() {
            return React.createElement(
                'div',
                {className: 'permission-select-form-with-view'},
                [
                    React.createElement(
                        PermissionSelectFormWithAjax,
                        {
                            key: 'select-permission',
                            authenticationMethodId: this.props.authenticationMethodId,
                            grantedSet: ((setter) => this.grantedSet = setter).bind(this),
                            revokedSet: ((setter) => this.revokedSet = setter).bind(this),
                            permissionChanged: ((arr) => {
                                let [perm, granted] = arr;
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.permission = {
                                        name: perm,
                                        granted: granted
                                    };
                                    newState.alertState = 'closed';
                                    return newState;
                                });
                            }).bind(this)
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                key: 'real-alert',
                                title: this.state.alert ? this.state.alert.title : 'Some Title',
                                text: this.state.alert ? this.state.alert.text : 'Some Alert Text',
                                type: this.state.alert ? this.state.alert.type : 'info'
                            }
                        )
                    )
                ].concat(!this.state.permission ? [] : [
                    React.createElement(
                        PermissionAjax,
                        {
                            key: `permission-${this.state.permission.name}`,
                            name: this.state.permission.name,
                            applyStyle: this.state.applyDisabled ? 'neither' : (
                                this.state.permission.granted ? 'revoke' : 'grant'
                            ),
                            onApply: (() => {
                                if (this.state.applyDisabled) { return; }
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.applyDisabled = true;
                                    newState.alertState = 'closed';
                                    return newState;
                                });

                                let perm = this.state.permission.name;
                                let granted = !!this.state.permission.granted;

                                api_fetch(
                                    `/api/authentication_methods/${this.props.authenticationMethodId}/permissions/${perm}`,
                                    AuthHelper.auth({
                                        method: granted ? 'DELETE' : 'POST'
                                    })
                                ).then((resp) => {
                                    if (!resp.ok) {
                                        return Promise.reject({
                                            title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                            text: 'An unknown exception occurred',
                                            type: 'error'
                                        });
                                    }

                                    this.bustCaches(perm);
                                    if (granted) {
                                        this.revokedSet(perm);
                                    } else {
                                        this.grantedSet(perm);
                                    }

                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.applyDisabled = false;
                                        newState.alertState = 'closed';
                                        if (newState.permission.name === perm) {
                                            newState.permission.granted = !granted;
                                        }
                                        return newState;
                                    });
                                }).catch((err) => {
                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.alert = err;
                                        newState.alertState = 'expanded';
                                        newState.applyDisabled = false;
                                        return newState;
                                    });
                                });
                            }).bind(this)
                        }
                    )
                ])
            )
        }

        bustCaches(name) {
            let args = AuthHelper.auth({headers: {'Content-Cache': 'no-cache'}});
            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}/permissions`,
                args
            );
        }
    };

    PermissionSelectFormWithAjaxAndView.propTypes = {
        authenticationMethodId: PropTypes.number.isRequired
    }

    /**
     * Shows paginated history for an authentication method.
     *
     * @param {list} history The history for this authentication method. Each
     *   item in this list should be a dictionary with the following keys:
     *   - {string} eventType: The type of event this is. Acts as an enum and
     *     takes one of following values:
     *     + created: This authentication method was created. No extra keys.
     *     + deleted: This authentication method was soft-deleted. No extra
     *       keys.
     *     + permission-granted: A permission was granted to this authentication
     *       method. Has the following extra keys:
     *       * {string} permission: The name of the permission that was
     *         granted.
     *     + permission-revoked: A permission was revoked from this
     *       authentication method. Has the following extra keys:
     *       * {string} permission: The name of the permission revoked
     *     + password-changed: The password was changed. No extra keys.
     *   - {string} reason The reason provided for the change.
     *   - {string} username If the user who made this change was given to us,
     *     this is that users username. To avoid unnecessary drama, this value,
     *     if different from the logged in user, is usually hidden from non-
     *     admins.
     *   - {Date} occurredAt When this event occurred at.
     * @param {list} newHistory An array of events just like history which we
     *   just added. These will be eased in.
     * @param {string} newHistoryId The id to use for the new history. It's
     *   important that when the newHistory values change then the new history
     *   id is changed so that we re-initialize the easing.
     * @param {string} loadingSpinnerState The state for the loading spinner,
     *   either 'closed' or 'expanded'. Defaults to 'closed', starts at closed.
     * @param {boolean} showMore True if there is more history to show, false
     *   otherwise.
     * @param {boolean} showMoreDisabled True if we should put the show more
     *   button into the disabled state, false otherwise.
     * @param {func} onShowMore A function we invoke when the show more button
     *   is pressed.
     */
    class AuthenticationMethodHistory extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'auth-method-history'},
                (history ? [
                    React.createElement(
                        'ul',
                        {key: 'old-history', className: 'auth-method-history-events'},
                        this.mapHistory(this.props.history)
                    )
                ] : []).concat(
                    this.props.newHistory ? [
                        React.createElement(
                            SmartHeightEased,
                            {
                                key: this.props.newHistoryId,
                                initialState: 'closed',
                                desiredState: 'expanded'
                            },
                            React.createElement(
                                'ul',
                                {className: 'auth-method-history-events auth-method-history-events-new'},
                                this.mapHistory(this.props.newHistory, true)
                            )
                        )
                    ] : []
                ).concat([
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'loading-spinner',
                            initialState: 'closed',
                            desiredState: this.props.loadingSpinnerState || 'closed'
                        },
                        React.createElement(CenteredSpinner)
                    )
                ]).concat(
                    this.props.showMore ? [
                        React.createElement(
                            'div',
                            {
                                key: 'buttons',
                                className: 'auth-method-history-controls'
                            },
                            React.createElement(
                                Button,
                                {
                                    text: 'Load More',
                                    style: 'primary',
                                    type: 'button',
                                    onClick: this.props.onShowMore,
                                    disabled: this.props.showMoreDisabled
                                }
                            )
                        )
                    ] : []
                )
            );
        }

        mapHistory(history, isNew) {
            return history.map((evt, idx) => {
                return [
                    React.createElement(
                        'li',
                        {
                            key: `event-${idx}-${isNew ? 'new' : 'old'}`,
                            className: 'auth-method-history-event'
                        },
                        [
                            React.createElement(
                                'span',
                                {
                                    key: 'occurred-at',
                                    className: 'auth-method-history-event-time'
                                },
                                React.createElement(
                                    TextDateTime,
                                    {
                                        time: evt.occurredAt
                                    }
                                )
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: 'admin'},
                                (() => {
                                    if (evt.username) {
                                        return ' /u/' + evt.username;
                                    } else {
                                        return ' An admin'
                                    }
                                })()
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: 'action'},
                                (() => {
                                    if (evt.eventType === 'created') {
                                        return ' created this authentication method.';
                                    } else if (evt.eventType === 'deleted') {
                                        return ' deleted this authentication method.';
                                    } else if (evt.eventType === 'permission-granted') {
                                        return ' granted the permission ' + evt.permission + ' to this authentication method.';
                                    } else if (evt.eventType === 'permission-revoked') {
                                        return ' revoked the permission ' + evt.permission + ' from this authentication method.';
                                    } else if (evt.eventType === 'password-changed') {
                                        return ' changed the password on this authentication method.';
                                    } else {
                                        return ' triggered the ' + evt.eventType + ' event.';
                                    }
                                })()
                            )
                        ].concat(evt.reason ? [
                            React.createElement(
                                React.Fragment,
                                {key: 'reason'},
                                ` They provided this reason: ${evt.reason}`
                            )
                        ] : [])
                    )
                ];
            }).flat()
        }
    }

    AuthenticationMethodHistory.propTypes = {
        history: PropTypes.arrayOf(PropTypes.shape({
            eventType: PropTypes.string.isRequired,
            permission: PropTypes.string,
            reason: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            occurredAt: PropTypes.instanceOf(Date).isRequired
        })).isRequired,
        newHistory: PropTypes.arrayOf(PropTypes.shape({
            eventType: PropTypes.string.isRequired,
            permission: PropTypes.string,
            reason: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            occurredAt: PropTypes.instanceOf(Date).isRequired
        })),
        newHistoryId: PropTypes.string,
        showMore: PropTypes.bool,
        showMoreDisabled: PropTypes.bool,
        onShowMore: PropTypes.func
    };

    /**
     * Handles rendering an authentication method history using ajax to fetch
     * and paginate the history for the given authentication method. This can
     * be configured to not ease the initial set of history.
     *
     * @param {number} authenticationMethodId The primary key of the
     *   authentication method whose history should be shown.
     */
    class AuthenticationMethodHistoryAjax extends React.Component {
        constructor(props) {
            super(props);
            this.pageSize = 4;
            this.state = {
                loading: true,
                alert: {
                    title: 'Some title',
                    type: 'info',
                    text: 'Some text'
                },
                alertState: 'closed',
                history: [],
                newHistory: [],
                newHistoryCounter: 0,
                nextId: null,
                haveMore: false
            };
            this.rawGetMoreHistory();
        }

        render() {
            return React.createElement(
                'div',
                {className: 'auth-method-history-wrapper'},
                [
                    React.createElement(
                        AuthenticationMethodHistory,
                        {
                            key: 'hist',
                            history: this.state.history,
                            newHistory: this.state.newHistory,
                            newHistoryId: this.state.newHistoryCounter.toString(),
                            loadingSpinnerState: this.state.loading ? 'expanded' : 'closed',
                            showMore: this.state.haveMore,
                            showMoreDisabled: this.state.loading,
                            onShowMore: this.getMoreHistory.bind(this)
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                type: this.state.alert.type,
                                title: this.state.alert.title,
                                text: this.state.alert.text
                            }
                        )
                    )
                ]
            );
        }

        getMoreHistory() {
            if (this.state.loading) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                newState.alertState = 'closed';
                return newState;
            });
            this.rawGetMoreHistory();
        }

        rawGetMoreHistory() {
            let queryParams = [];
            if (this.state.nextId) {
                queryParams.push(['after_id', this.state.nextId]);
            }
            queryParams.push(['limit', this.pageSize]);

            var queryParamsString = queryParams.map((qp) => qp[0] + '=' + encodeURIComponent(qp[1])).join('&');
            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}/history?${queryParamsString}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    return Promise.reject({
                        type: 'error',
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        text: 'Oh no! Something went wrong. Reload the page, try again, or contact the site administrator.'
                    });
                }

                if (resp.status === 204) {
                    return {history: []}
                }

                return resp.json();
            }).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.history = state.history.concat(state.newHistory);
                    newState.newHistory = json.history.map((itm) => {
                        return {
                            eventType: itm.event_type,
                            reason: itm.reason,
                            permission: itm.permission,
                            username: itm.username,
                            occurredAt: new Date(itm.occurred_at * 1000)
                        }
                    });
                    newState.newHistoryCounter += 1;
                    newState.haveMore = !!json.next_id;
                    newState.nextId = json.next_id;
                    newState.alertState = 'closed';
                    return newState;
                });
            }).catch((alrt) => {
                if (typeof(alrt) !== 'object' || typeof(alrt.title) !== 'string') {
                    alrt = {
                        title: 'Unknown Error',
                        type: 'error',
                        text: `Unexpected error while fetching auth method history: ${alrt}`
                    };
                }
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = alrt;
                    newState.alertState = 'expanded';
                    return newState;
                });
            });
        }
    }

    AuthenticationMethodHistoryAjax.propTypes = {
        authenticationMethodId: PropTypes.number.isRequired
    };

    /**
     * Shows some information about a particular authentication method. There
     * are two types of authentication methods - the main human method (which
     * require a captcha) and the secondary grants (which don't require a
     * method). The human password cannot be reset except via the reset your
     * password flow which verifies you still have access to the underlying
     * reddit account, whereas secondary grants can be reset at any time.
     *
     * This will show the history behind a checkbox. This will render the
     * children of this component for the history. So typically this compnoent
     * is rendered as
     *
     * ```js
     * React.createElement(
     *   AuthenticationMethod,
     *   { ... },
     *   React.createElement(
     *      AuthenticationMethodHistoryAjax
     *      { ... }
     *   )
     * )
     * ```
     *
     * The child component will be loaded lazily, meaning that we don't render
     * the instance unless and until the person clicks to show history. However
     * once rendered it remains on the DOM, although it may be hidden.
     *
     * @param {number} id The primary key for this authentication method.
     * @param {boolean} main True if this is the main grant, false if this is
     *   a secondary grant. For main grants password reset fields will not be
     *   shown.
     * @param {boolean} deleted True if this authentication method has been
     *   deleted, false otherwise.
     * @param {number} activeGrants The number of live tokens with this
     *   authentication method.
     * @param {string} password If we just randomly generated a password this
     *   should be set to the password for this authentication method,
     *   otherwise this should be null. This is only known when we, the client,
     *   just reset the password on this authentication method. The server will
     *   still salt and hash passwords for secondary grants, although with
     *   fewer iterations than main grants.
     * @param {function} reasonQuery The user is given a reason text field to
     *   fill in before using any of the change functions. This function is
     *   called with a function which returns the currently filled reason.
     * @param {function} reasonSet Called with a function which accepts a
     *   string and sets the reason text field value to the specified reason.
     *   Usually used for clearing the reason after an operation.
     * @param {function} reasonFocus Called with a function which jumps focus
     *   to the reason field
     * @param {function} onPasswordReset A function we call when the user
     *   clicks to reset their password. This should randomly generate a new
     *   password, save it remotely, and update this component with the
     *   generated password. It should not be possible to determine this
     *   password once the page is refreshed.
     * @param {function} onDelete A function we call when the user clicks to
     *   delete this authentication method. Only called if deleted is false.
     * @param {function} onRevokeAll A function we call when the user clicks to
     *   revoke all permissions on this authentication method. Only called if
     *   deleted is false.
     * @param {function} onLogoutAll A function we call when the user clicks to
     *   immediately revoke all active tokens for this authentication method.
     *   Only called if deleted is false.
     */
    class AuthenticationMethod extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                childrenLoaded: false,
                childrenState: 'closed'
            }
        }

        render() {
            return React.createElement(
                'div',
                {className: 'authentication-method'},
                [
                    React.createElement(
                        'div',
                        {key: 'title', className: 'authentication-method-title'},
                        `Authentication Method #${this.props.id}`
                    )
                ].concat(this.props.deleted ? [
                    React.createElement(
                        Alert,
                        {
                            key: 'deleted-alert',
                            title: 'Deleted',
                            type: 'warning',
                            text: 'This authentication method has been deleted. This cannot be undone. This information is for historical reference only.'
                        }
                    )
                ] : []).concat(this.props.main ? [
                    React.createElement(
                        Alert,
                        {
                            key: 'main-alert',
                            title: 'Main Authentication Method',
                            type: 'info',
                            text: (
                                'This is a main authentication grant, i.e., it is expected to be used ' +
                                'by a person. The password can only be reset if you confirm access to ' +
                                'the corresponding reddit account, i.e., through the standard password ' +
                                'password reset flow (sign out and click Account -> Forgot Password)'
                            )
                        }
                    )
                ] : []).concat(this.props.activeGrants == 0 ? [] : [
                    React.createElement(
                        Alert,
                        {
                            key: 'active-grants-alert',
                            title: `${this.props.activeGrants} Active Grants`,
                            type: this.props.activeGrants < 5 ? 'info' : 'warning',
                            text: `There are ${this.props.activeGrants} active tokens for this authentication method.`
                        }
                    )
                ]).concat(this.props.children ? ([
                        React.createElement(
                            Button,
                            {
                                key: 'history-toggle',
                                text: this.state.childrenState === 'expanded' ? 'Hide History' : 'Show History',
                                style: 'secondary',
                                type: 'button',
                                onClick: (() => {
                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.childrenLoaded = true;
                                        newState.childrenState = (
                                            newState.childrenState === 'expanded' ? 'closed' : 'expanded'
                                        );
                                        return newState;
                                    });
                                }).bind(this)
                            }
                        ),
                    ].concat(this.state.childrenLoaded ? [
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'history',
                                    initialState: 'expanded',
                                    desiredState: this.state.childrenState
                                },
                                this.props.children
                            )
                    ] : [])
                ) : []).concat(this.props.password ? [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'password',
                            initialState: 'closed',
                            desiredState: 'expanded'
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'alert',
                                    type: 'info',
                                    title: 'Irrecoverable',
                                    text: (
                                        'Below is the plain-text password we just set for this authentication method.' +
                                        'This value is not stored by the server, so if you lose it you will need to ' +
                                        'reset the password. Store it somewhere secure, where the security is appropriate ' +
                                        'for the permissions on this method.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'password',
                                    labelText: 'New Password',
                                    component: TextInput,
                                    componentArgs: {
                                        type: 'text',
                                        text: this.props.password,
                                        disabled: true
                                    }
                                }
                            )
                        ]
                    )
                ] : []).concat(this.props.deleted ? [] : [
                    React.createElement(
                        Alert,
                        {
                            key: 'reason-alert',
                            title: 'Reason',
                            type: 'info',
                            text: (
                                'If you want to use any of the below controls you should provide ' +
                                'a brief explanation of what you are doing to jump start your memory ' +
                                'if you are later asked to verify the history. If there are changes that ' +
                                'you are unable to verify later the authentication method might be ' +
                                'deleted for your protection.'
                            )
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'reason',
                            labelText: 'Reason',
                            component: TextInput,
                            componentArgs: {
                                type: 'text',
                                textQuery: this.props.reasonQuery,
                                textSet: this.props.reasonSet,
                                focus: this.props.reasonFocus
                            }
                        }
                    ),
                    React.createElement(
                        'div',
                        {className: 'authentication-method-controls', key: 'controls'},
                        (this.props.main ? [] : [
                            React.createElement(
                                'div',
                                {className: 'authentication-method-controls-row', key: 'reset-pass'},
                                React.createElement(
                                    Button,
                                    {
                                        text: 'Reset Password',
                                        style: 'secondary',
                                        type: 'button',
                                        onClick: this.props.onPasswordReset
                                    }
                                )
                            )
                        ]).concat(
                            React.createElement(
                                'div',
                                {className: 'authentication-method-controls-row', key: 'revoke-logout'},
                                [
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'revoke',
                                            text: 'Revoke All Permissions',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: this.props.onRevokeAll
                                        }
                                    ),
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'logout',
                                            text: 'Revoke All Active Grants',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: this.props.onLogoutAll
                                        }
                                    )
                                ]
                            ),
                            React.createElement(
                                'div',
                                {className: 'authentication-method-controls-row', key: 'delete'},
                                [
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'delete',
                                            text: 'Delete Authentication Method',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: this.props.onDelete
                                        }
                                    )
                                ]
                            )
                        )
                    )
                ])
            )
        }
    };

    AuthenticationMethod.propTypes = {
        id: PropTypes.number.isRequired,
        main: PropTypes.bool,
        deleted: PropTypes.bool,
        activeGrants: PropTypes.number.isRequired,
        password: PropTypes.string,
        reasonQuery: PropTypes.func,
        reasonSet: PropTypes.func,
        reasonFocus: PropTypes.func,
        onPasswordReset: PropTypes.func,
        onDelete: PropTypes.func,
        onRevokeAll: PropTypes.func,
        onLogoutAll: PropTypes.func
    };

    /**
     * Shows information on a certain authentication method and handles all the
     * AJAX calls for operations available on authentication methods.
     *
     * @param {number} authenticationMethodId The primary key of the
     *   authentication method to show and manage.
     * @param {function} onPermissionsChanged A function we will invoke
     *   if present if we changed the permissions on this method.
     */
    class AuthenticationMethodAjax extends React.Component {
        constructor(props) {
            super(props);

            this.reasonSet = null;
            this.reasonQuery = null;
            this.reasonFocus = null;

            this.state = {
                action: 'loading',
                alert: {
                    title: 'Some Title',
                    text: 'Some Text',
                    type: 'info'
                },
                alertState: 'closed',
                main: null,
                deleted: null,
                activeGrants: null,
                password: null,
                disabled: true
            };

            this.getAuthenticationMethod(true);
        }

        render() {
            let alert = React.createElement(
                SmartHeightEased,
                {
                    key: 'alert',
                    initialState: 'closed',
                    desiredState: this.state.alertState
                },
                React.createElement(
                    Alert,
                    {
                        title: this.state.alert.title,
                        text: this.state.alert.text,
                        type: this.state.alert.type
                    }
                )
            );

            if (this.state.action === 'loading') {
                return React.createElement(
                    React.Fragment,
                    null,
                    [
                        React.createElement(
                            CenteredSpinner,
                            {key: 'spinner'}
                        ),
                        alert
                    ]
                );
            }

            if (this.state.action === 'errored') {
                return alert;
            }

            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        AuthenticationMethod,
                        {
                            key: 'authmethod',
                            id: this.props.authenticationMethodId,
                            main: this.state.main,
                            deleted: this.state.deleted,
                            activeGrants: this.state.activeGrants,
                            password: this.state.password,
                            reasonQuery: ((query) => this.reasonQuery = query).bind(this),
                            reasonSet: ((setter) => this.reasonSet = setter).bind(this),
                            reasonFocus: ((fcs) => this.reasonFocus = fcs).bind(this),
                            onPasswordReset: this.onPasswordReset.bind(this),
                            onDelete: this.onDelete.bind(this),
                            onRevokeAll: this.onRevokeAll.bind(this),
                            onLogoutAll: this.onLogoutAll.bind(this)
                        },
                        React.createElement(
                            AuthenticationMethodHistoryAjax,
                            {authenticationMethodId: this.props.authenticationMethodId}
                        )
                    ),
                    alert
                ]
            );
        }

        getAuthenticationMethod(skipLoadingCheck) {
            if (!skipLoadingCheck && this.state.action === 'loading') { return; }

            if (!skipLoadingCheck) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'loading';
                    newState.alertState = 'closed';
                    newState.main = null;
                    newState.deleted = null;
                    newState.activeGrants = null;
                    newState.password = null;
                    newState.disabled = true;
                    return newState;
                });
            }

            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}`,
                AuthHelper.auth({
                    headers: { 'Cache-Control': 'no-cache' }
                })
            ).then((resp) => {
                if (!resp.ok) {
                    if (resp.status === 404) {
                        return Promise.reject({
                            title: '404: Not Found',
                            type: 'error',
                            text: `Could not find an authentication method with id ${this.props.authenticationMethodId}. We might need to login again.`
                        });
                    }

                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText}`,
                        type: 'error',
                        text: `Failed to load authentication method ${this.props.authenticationMethodId}`
                    });
                }

                return resp.json();
            }).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'loaded';
                    newState.main = json.main;
                    newState.deleted = json.deleted;
                    newState.activeGrants = json.active_grants;
                    newState.disabled = false;
                    return newState;
                });
            }).catch((err) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'errored';
                    newState.alertState = 'expanded';
                    newState.alert = err;
                    return newState;
                });
            });
        }

        onPasswordReset() {
            if (this.state.disabled) { return; }

            // https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
            const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let array = new Uint8Array(40);
            window.crypto.getRandomValues(array);
            array = array.map(x => validChars.charCodeAt(x % validChars.length));
            let newPassword = String.fromCharCode.apply(null, array);

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                newState.alertState = 'expanded';
                newState.alert = {
                    title: 'Resetting Password',
                    type: 'info',
                    text: 'Sending request to server...'
                };
                return newState;
            });

            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}/password`,
                AuthHelper.auth({
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        password: newPassword,
                        reason: this.reasonQuery()
                    })
                })
            ).then((resp) => {
                if (!resp.ok) {
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText}`,
                        type: 'error',
                        text: 'Failed to reset password (use network tab for details).'
                    });
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'success',
                        title: 'Success',
                        text: 'Password successfully reset! See above for the new value.'
                    };
                    newState.password = newPassword;
                    return newState;
                });
            }).catch((err) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    newState.alertState = 'expanded';
                    newState.alert = err;
                    return newState;
                });
            });
        }

        onDelete() {
            if (this.state.disabled) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                newState.alertState = 'expanded';
                newState.alert = {
                    title: 'Deleting',
                    type: 'info',
                    text: 'Sending request to server...'
                };
                return newState;
            });

            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}`,
                AuthHelper.auth({
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        reason: this.reasonQuery()
                    })
                })
            ).then((resp) => {
                if (!resp.ok) {
                    resp.body();
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText}`,
                        type: 'error',
                        text: 'Failed to delete (use network tab for details).'
                    });
                }

                this.setState((state) =>  {
                    let newState = Object.assign({}, state);
                    newState.disabled = true;
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'success',
                        title: 'Success',
                        text: 'Authentication method deleted. Will reload momentarily..'
                    };
                    return newState;
                });
                this.getAuthenticationMethod(true);
            }).catch((err) => {
                this.setState((state) =>  {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    newState.alertState = 'expanded';
                    newState.alert = err;
                    return newState;
                });
            });
        }

        onRevokeAll() {
            if (this.state.disabled) { return; }

            const reason = this.reasonQuery();
            if (reason.length < 3) {
                this.reasonFocus();
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                newState.alertState = 'expanded';
                newState.alert = {
                    title: 'Revoking all permissions',
                    type: 'info',
                    text: 'Sending request to server...'
                };
                return newState;
            });

            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}/permissions`,
                AuthHelper.auth({
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        reason: reason
                    })
                })
            ).then((resp) => {
                if (!resp.ok) {
                    resp.body();
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText}`,
                        type: 'error',
                        text: 'Failed to revoke all permissions (use network tab for details).'
                    });
                }

                this.setState((state) =>  {
                    let newState = Object.assign({}, state);
                    newState.disabled = true;
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'success',
                        title: 'Success',
                        text: 'Authentication method permissions revoked.'
                    };
                    return newState;
                });

                if (this.props.onPermissionsChanged) {
                    this.props.onPermissionsChanged();
                }
            }).catch((err) => {
                if (type(err) !== 'object' || type(err.title) !== 'string') {
                    err = {
                        title: 'Unknown Error',
                        text: `Received and error: ${err} - double check inputs (e.g., Reason), check network tab.`,
                        type: 'error'
                    };
                }
                this.setState((state) =>  {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    newState.alertState = 'expanded';
                    newState.alert = err;
                    return newState;
                });
            });
        }

        onLogoutAll() {
            if (this.state.disabled) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                newState.alertState = 'expanded';
                newState.alert = {
                    title: 'Revoking all sessions',
                    type: 'info',
                    text: 'Sending request to server...'
                };
                return newState;
            });

            api_fetch(
                `/api/authentication_methods/${this.props.authenticationMethodId}/sessions`,
                AuthHelper.auth({
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        reason: this.reasonQuery()
                    })
                })
            ).then((resp) => {
                if (!resp.ok) {
                    resp.body();
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText}`,
                        type: 'error',
                        text: 'Failed to revoke all active tokens (use network tab for details).'
                    });
                }

                this.setState((state) =>  {
                    let newState = Object.assign({}, state);
                    newState.disabled = true;
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'success',
                        title: 'Success',
                        text: 'All active tokens have been revoked.'
                    };
                    return newState;
                });
            }).catch((err) => {
                this.setState((state) =>  {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    newState.alertState = 'expanded';
                    newState.alert = err;
                    return newState;
                });
            });
        }
    };

    AuthenticationMethodAjax.propTypes = {
        authenticationMethodId: PropTypes.number.isRequired,
        onPermissionsChanged: PropTypes.func
    };

    /**
     * Shows a form for selecting one of a number of authentication methods.
     *
     * @param {list} authenticationMethodIds The list of authentication methods
     *   to choose from. Each value should just be a number.
     * @param {number} initialAuthenticationMethodId The initially selected
     *   authorization method. Has no effect when updating the component.
     * @param {function} authMethodQuery A function we call with a function
     *   which returns the id of the currently selected authentication method.
     * @param {function} authMethodSet A function we call with a function which
     *   sets the the currently seelcted authentication method to the specified
     *   numeric id.
     * @param {function} authMethodChanged A function we call with the newly
     *   selected authenticaton method id when it changes.
     */
    class AuthenticationMethodSelectForm extends React.Component {
        render() {
            return React.createElement(
                FormElement,
                {
                    labelText: 'Authentication Method ID',
                    component: DropDown,
                    componentArgs: {
                        options: this.props.authenticationMethodIds.map((id) => {
                            return { key: id.toString(), text: id.toString() }
                        }),
                        initialOption: this.props.initialAuthenticationMethodId,
                        optionQuery: ((query) => {
                            if (!this.props.authMethodQuery) { return; }

                            this.props.authMethodQuery(() => parseInt(query()));
                        }).bind(this),
                        optionSet: ((setter) => {
                            if (!this.props.authMethodSet) { return; }

                            this.props.authMethodSet((val) => setter(val.toString()));
                        }).bind(this),
                        optionChanged: ((key) => {
                            if (!this.props.authMethodChanged) { return; }
                            this.props.authMethodChanged(parseInt(key));
                        }).bind(this)
                    }
                }
            )
        }
    };

    AuthenticationMethodSelectForm.propTypes = {
        authenticationMethodIds: PropTypes.arrayOf(PropTypes.number).isRequired,
        initialAuthenticationMethodId: PropTypes.number,
        authMethodQuery: PropTypes.func,
        authMethodSet: PropTypes.func,
        authMethodChanged: PropTypes.func
    };

    /**
     * Uses ajax to fetch all the authentication methods on a given user, then
     * allows the user to select amongst them. Also potentially allows the user
     * to add a new authentication method.
     *
     * @param {number} userId The primary key of the user whose authentication
     *   methods should be listed.
     * @param {function} authMethodQuery Same as AuthenticationMethodSelectForm
     * @param {function} authMethodSet Same as AuthenticationMethodSelectForm
     * @param {function} authMethodChanged Same as AuthenticationMethodSelectForm
     */
    class AuthenticationMethodSelectFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                action: 'loading',
                alert: {
                    type: 'info',
                    title: 'Some Title',
                    text: 'Some Text'
                },
                alertState: 'closed',
                authenticationMethodIds: null,
                initialAuthenticationMethodId: null,
                canAddAuthenticationMethod: false
            };

            this.timeout = null;

            this.getAuthenticationMethodIds(true);
        }

        render() {
            let alert = React.createElement(
                SmartHeightEased,
                {
                    key: 'alert',
                    initialState: 'closed',
                    desiredState: this.state.alertState
                },
                React.createElement(
                    Alert,
                    {
                        type: this.state.alert.type,
                        title: this.state.alert.title,
                        text: this.state.alert.text
                    }
                )
            );

            if (this.state.action === 'loading') {
                return React.createElement(
                    React.Fragment,
                    null,
                    [
                        React.createElement(CenteredSpinner, { key: 'spinner' }),
                        alert
                    ]
                );
            }

            if (this.state.action === 'errored') { return alert; }

            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        AuthenticationMethodSelectForm,
                        {
                            key: 'auth-methods-select-form',
                            authenticationMethodIds: this.state.authenticationMethodIds,
                            initialAuthenticationMethodId: this.state.initialAuthenticationMethodId,
                            authMethodQuery: this.props.authMethodQuery,
                            authMethodSet: this.props.authMethodSet,
                            authMethodChanged: this.props.authMethodChanged
                        }
                    ),
                ].concat(!this.state.canAddAuthenticationMethod ? [] : [
                    React.createElement(
                        Button,
                        {
                            key: 'auth-methods-add-auth-method',
                            text: 'Add Authentication Method',
                            style: 'secondary',
                            onClick: (() => {
                                if (this.state.action === 'loading') { return; }
                                if (this.timeout) {
                                    clearTimeout(this.timeout);
                                    this.timeout = null;
                                }

                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.action = 'loading';
                                    newState.alertState = 'closed';
                                    return newState;
                                });

                                api_fetch(
                                    `/api/users/${this.props.userId}/authentication_methods`,
                                    AuthHelper.auth({method: 'POST'})
                                ).then((resp) => {
                                    if (!resp.ok) {
                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.action = 'errored';
                                            newState.alert = {
                                                title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                                text: 'You might not have permission to add an authentication method, or might need to relogin. Will reload in 5 seconds',
                                                type: 'error'
                                            };
                                            newState.alertState = 'expanded';
                                            return newState;
                                        });
                                        this.timeout = setTimeout((() => {
                                            this.getAuthenticationMethodIds(true);
                                        }).bind(this), 5000);
                                        return;
                                    }

                                    this.getAuthenticationMethodIds(true);
                                }).catch((e) => {
                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.action = 'errored';
                                        newState.alert = {
                                            title: `Non-Standard Error`,
                                            text: `Something unexpected went wrong (reload page): ${e}`,
                                            type: 'error'
                                        };
                                        newState.alertState = 'expanded';
                                        return newState;
                                    });
                                });
                            }).bind(this)
                        }
                    )
                ]).concat([alert])
            );
        }

        componentWillUnmount() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        getAuthenticationMethodIds(skipLoadingCheck) {
            if (!skipLoadingCheck && this.state.action === 'loading') { return; }

            if (!skipLoadingCheck) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'loading';
                    newState.alertState = 'closed';
                    newState.authenticationMethodIds = null;
                    newState.initialAuthenticationMethodId = null;
                    return newState;
                });
            }

            api_fetch(
                `/api/users/${this.props.userId}/authentication_methods`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    if (resp.status === 404) {
                        return Promise.reject({
                            title: '404: Not Found',
                            type: 'error',
                            text: `Could not find this user ${this.props.userId}s authentication methods. You may need to login again.`
                        });
                    }

                    resp.body();
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        type: 'error',
                        text: `Failed to load user ${this.props.userId}s authentication methods. Check network tab for details.`
                    });
                }

                return resp.json();
            }).then((json) => {
                if (json.authentication_methods.length === 0) {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.action = 'errored';
                        newState.alertState = 'expanded';
                        newState.alert = {
                            type: 'info',
                            title: 'No Authentication Methods',
                            text: `User ${this.props.userId} has no authentication methods.`
                        };
                        return newState;
                    });
                    return;
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'loaded';
                    newState.authenticationMethodIds = json.authentication_methods;
                    newState.initialAuthenticationMethodId = json.authentication_methods[0];
                    newState.canAddAuthenticationMethod = json.can_add_more;
                    return newState;
                });

                if (this.props.authMethodChanged) {
                    this.props.authMethodChanged(json.authentication_methods[0]);
                }
            }).catch((err) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.action = 'errored';
                    newState.alert = err;
                    newState.alertState = 'expanded';
                    return newState;
                });
            });
        }
    };

    AuthenticationMethodSelectFormWithAjax.propTypes = {
        userId: PropTypes.number.isRequired,
        authMethodQuery: PropTypes.func,
        authMethodSet: PropTypes.func,
        authMethodChanged: PropTypes.func
    };

    /**
     * Uses ajax to handle fetching all authentication methods on a user, and
     * then when they select one allows them to manipulate the authentication
     * method at a high level or at the specific permission level.
     *
     * @param {number} userId The primary key of the user whose authentication
     *   methods and their corresponding permissions should be managed.
     */
    class AuthenticationMethodSelectFormWithAjaxAndView extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                authMethodId: null,
                permissionsCounter: 0,
            };
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                ([
                    React.createElement(
                        AuthenticationMethodSelectFormWithAjax,
                        {
                            key: 'select',
                            userId: this.props.userId,
                            authMethodChanged: ((authMethodId) => {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.authMethodId = authMethodId;
                                    newState.permissionsCounter += 1;
                                    return newState;
                                });
                            }).bind(this)
                        }
                    )
                ]).concat(this.state.authMethodId ? [
                    React.createElement(
                        AuthenticationMethodAjax,
                        {
                            key: `auth-method-${this.state.authMethodId}`,
                            authenticationMethodId: this.state.authMethodId,
                            onPermissionsChanged: (() => {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.permissionsCounter += 1;
                                    return newState;
                                })
                            }).bind(this)
                        }
                    ),
                    React.createElement(
                        PermissionSelectFormWithAjaxAndView,
                        {
                            key: `perms-${this.state.permissionsCounter}`,
                            authenticationMethodId: this.state.authMethodId
                        }
                    )
                ] : [])
            )
        }
    };

    AuthenticationMethodSelectFormWithAjaxAndView.propTypes = {
        userId: PropTypes.number.isRequired
    };

    /**
     * Shows the given list of user settings history
     *
     * @param {list} history The history of this users settings. We trade off
     *   some comprehensiveness in order to not make this too painful. Each
     *   item is a dict with the following keys:
     *   - {string} name: The name of the setting that was changed.
     *   - {any} oldValue: The old value of the setting
     *   - {any} newValue: The new value for the setting
     *   - {string} username: The username of the user who made the change, if
     *     available. We typically don't share admin usernames for specific
     *     changes to non-admins to avoid unnecessary drama.
     *   - {Date} occurredAt When this change occurred.
     * @param {list} newHistory Same shape as history, should be what should
     *   be shown immediately below history. This part of the array is eased
     *   in once per change in historyId.
     * @param {string} historyId The id for this set of history. This should be
     *   changed whenever new history changes in order to reset the easing.
     * @param {boolean} loading True if we should show that we are loading
     *   more content, false if we should not. This will show a spinner and
     *   disable the show more button if it's visible.
     * @param {boolean} showShowMore True if we should show a show more button,
     *    false if we should not.
     * @param {function} onShowMore A function which we call with no arguments
     *    when the show more button is clicked.
     */
    class UserSettingsHistory extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'user-settings-history'},
                this.mapHistory(this.props.history, 'history').concat([
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: this.props.historyId,
                            initialState: 'closed',
                            desiredState: 'expanded'
                        },
                        this.mapHistory(this.props.newHistory, 'new-history')
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'spinner',
                            initialState: 'expanded',
                            desiredState: this.props.loading ? 'expanded' : 'closed'
                        },
                        React.createElement(CenteredSpinner)
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'controls',
                            initialState: 'expanded',
                            desiredState: this.props.showShowMore ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            Button,
                            {
                                key: 'load-older',
                                text: 'Load Older',
                                style: 'primary',
                                type: 'button',
                                onClick: this.props.onShowMore,
                                disabled: this.props.loading
                            }
                        )
                    )
                ])
            );
        }

        mapHistory(hist, key) {
            return [
                React.createElement(
                    'ul',
                    {key: key, className: 'user-settings-history-ul'},
                    hist.map((itm, idx) => {
                        return React.createElement(
                            'li',
                            {
                                key: `item-${idx}`,
                                className: 'user-settings-history-item'
                            },
                            [
                                React.createElement(
                                    'strong',
                                    {key: 'setting-name'},
                                    itm.name
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: 'txt-1'},
                                    ' was set to '
                                ),
                                React.createElement(
                                    'strong',
                                    {key: 'new-value'},
                                    itm.newValue === null ? 'null' : itm.newValue.toString()
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: 'txt-2'},
                                    ` from ${itm.oldValue}. `
                                ),
                                React.createElement(
                                    'span',
                                    {className: 'user-setting-time-user', key: 'time'},
                                    [
                                        React.createElement(
                                            React.Fragment,
                                            {key: 'pre'},
                                            '('
                                        ),
                                        React.createElement(
                                            TextDateTime,
                                            {
                                                key: 'time',
                                                time: itm.occurredAt
                                            }
                                        )
                                    ].concat(itm.username ? [
                                        React.createElement(
                                            React.Fragment,
                                            {key: 'user'},
                                            ` by /u/${itm.username}`
                                        )
                                    ] : []).concat([
                                        React.createElement(
                                            React.Fragment,
                                            {key: 'post'},
                                            ')'
                                        )
                                    ])
                                )
                            ]
                        )
                    })
                )
            ];
        }
    }

    UserSettingsHistory.propTypes = {
        history: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            oldValue: PropTypes.any.isRequired,
            newValue: PropTypes.any.isRequired,
            username: PropTypes.username,
            occurredAt: PropTypes.instanceOf(Date).isRequired
        })).isRequired,
        newHistory: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            oldValue: PropTypes.any.isRequired,
            newValue: PropTypes.any.isRequired,
            username: PropTypes.username,
            occurredAt: PropTypes.instanceOf(Date).isRequired
        })).isRequired,
        historyId: PropTypes.string.isRequired,
        loading: PropTypes.bool,
        showShowMore: PropTypes.bool,
        onShowMore: PropTypes.func
    };

    /**
     * Loads and renders a users settings history from ajax calls in a
     * paginated manner.
     *
     * @param {number} userId The id of the user whose settings history should
     *   be fetched and displayed.
     * @param {function} refresh We call this function with a function which
     *   will reload this history.
     */
    class UserSettingsHistoryAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: {
                    title: 'Some title',
                    text: 'Some text',
                    type: 'info'
                },
                alertState: 'closed',
                history: [],
                newHistory: [],
                historyCounter: 0,
                beforeId: null,
                loading: true,
                haveMore: true,
            };
            this.pageSize = 4;
            this.timeout = null;
            this.rawLoadMore();

            if (this.props.refresh) {
                this.props.refresh(this.refresh.bind(this));
            }
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        UserSettingsHistory,
                        {
                            key: 'history',
                            history: this.state.history,
                            newHistory: this.state.newHistory,
                            historyId: this.state.historyCounter.toString(),
                            loading: this.state.loading,
                            showShowMore: this.state.haveMore,
                            onShowMore: this.loadMore.bind(this)
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                title: this.state.alert.title,
                                text: this.state.alert.text,
                                type: this.state.alert.type
                            }
                        )
                    )
                ]
            );
        }

        refresh(counter) {
            /* we use a timeout to avoid excessive refreshes & slow-loading errors */
            if (this.timeout) { return; }
            if (counter === undefined || counter === null) { counter = 0; }
            if (counter > 5) { return; }

            if (this.state.loading) {
                this.timeout = setTimeout(
                    (() => {
                        this.timeout = null;
                        this.refresh(counter + 1);
                    }).bind(this),
                    5000
                );
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.history = [];
                newState.newHistory = [];
                newState.beforeId = null;
                newState.haveMore = true;
                newState.loading = true;
                newState.alertState = 'closed';
                return newState;
            });
            this.timeout = setTimeout(
                (() => {
                    this.timeout = null;
                    this.rawLoadMore();
                }),
                1000
            );
        }

        componentWillUnmount() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        loadMore() {
            if (this.state.loading) { return; }
            if (!this.state.haveMore) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                newState.alertState = 'closed';
                return newState;
            });

            this.rawLoadMore();
        }

        rawLoadMore() {
            const ogBeforeId = this.state.beforeId;
            let apiParams = [`limit=${this.pageSize}`];
            if (this.state.beforeId) {
                apiParams.push(`before_id=${this.state.beforeId}`);
            }
            let queryParams = apiParams.join('&')
            api_fetch(
                `/api/users/${this.props.userId}/settings/history?${queryParams}`,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-store'
                    }
                })
            ).then((resp) => {
                if (!resp.ok) {
                    if (resp.status === 404) {
                        return Promise.reject({
                            title: '404: Not Found',
                            type: 'error',
                            text: `Failed to find any history for user ${this.props.userId}. You might need to login again.`
                        });
                    }

                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        type: 'error',
                        text: `Failed to load settings history; check network tab for /api/users/${this.props.userId}/settings/history for details.`
                    });
                }

                return resp.json();
            }).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.beforeId = json.before_id;
                    newState.haveMore = !!json.before_id;
                    return newState;
                });
                return this.loadFromIds(json.history);
            }).then((history) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.history = newState.history.concat(newState.newHistory);
                    newState.newHistory = history.map((itm) => {
                        return {
                            name: itm.name,
                            oldValue: itm.old_value,
                            newValue: itm.new_value,
                            username: itm.username,
                            occurredAt: new Date(itm.occurred_at * 1000)
                        };
                    });
                    newState.historyCounter += 1;
                    return newState;
                });
            }).catch((err) => {
                if (typeof(err) !== 'object' || typeof(err.title) !== 'string') {
                    err = {
                        title: 'Unknown Error',
                        type: 'error',
                        text: `Unknown error fetching settings history: ${err}`
                    }
                }
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertState = 'expanded';
                    newState.alert = err;
                    newState.loading = false;
                    newState.beforeId = ogBeforeId;
                    return newState;
                });
            });
        }

        loadFromIds(ids) {
            return new Promise((resolve, reject) => {
                let loaded = Array(ids.length);
                let rejected = false;

                ids.forEach(((i, idx) => {
                    api_fetch(
                        `/api/users/${this.props.userId}/settings/history/${i}`,
                        AuthHelper.auth()
                    ).then((resp) => {
                        if (rejected) { return; }
                        if (!resp.ok) {
                            rejected = true;
                            reject({
                                title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                type: 'error',
                                text: `Failed to load setting history with id ${i}. Check network tab for details; look for /api/users/${this.props.userId}/settings/history/${i}`
                            });
                            return;
                        }

                        return resp.json();
                    }).then((json) => {
                        loaded[idx] = json;
                        if (!loaded.includes(undefined)) {
                            resolve(loaded);
                        }
                    });
                }).bind(this));
            });
        }
    }

    UserSettingsHistoryAjax.propTypes = {
        userId: PropTypes.number.isRequired,
        refresh: PropTypes.func
    };

    /**
     * Shows a users currently selected settings with callbacks for actually
     * changing them. Although it's assumed that they have permission to view
     * all of the settings, it's not assumed that all the settings can be
     * modified. For example, only admins can edit ratelimits in general.
     *
     * This accepts children props, which should be what populate the history
     * for this component. These are not loaded until the user interacts to
     * get the history. Typically this is UserSettingsHistoryAjax. Hence this
     * component is typically rendered as
     *
     * ```js
     * React.createElement(
     *   UserSettings,
     *   {...},
     *   React.createElement(
     *     UserSettingsHistoryAjax,
     *     {...}
     *   )
     * )
     * ```
     *
     * Furthermore, one should typically refresh the underlying history
     * whenever we save a change.
     *
     * @param {boolean} disabled True if all inputs are disabled because we
     *   are still processing a change, false otherwise.
     * @param {number} id The id of the user these settings are for.
     * @param {string} username The username of the user these settings are
     *   for.
     * @param {boolean} canModifyNonReqResponseOptOut True if the user is
     *   allowed to modify the non-req-response-opt-out setting.
     * @param {boolean} nonReqResponseOptOut True if the user has opted out of
     *   the automatic response to non-request threads, false if they have not.
     * @param {function} nonReqResponseOptOutChanged A function which we call
     *   when the user changes the value of the non-req-response-opt-out
     *   checkbox with the new value.
     * @param {boolean} canModifyBorrowerReqPMOptOut True if the user is
     *   allowed to modify the borrower-req-pm-opt-out setting.
     * @param {boolean} borrowerReqPMOptOut True if the user has opted out of
     *   receiving a PM when a borrower from one of their active loans makes a
     *   request thread, false if they have not.
     * @param {function} borrowerReqPMOptOutChanged A function which we call
     *   when the user changes the value of the borrower-req-pm-opt-out
     *   checkbox with the new value.
     * @param {boolean} canModifyRatelimit True if the authenticated user is
     *   allowed to change the users ratelimit, false if they are not
     * @param {boolean} globalRatelimitApplies True if the global ratelimit
     *   applies to this user, false if it does not.
     * @param {boolean} userSpecificRatelimit True if this user as a custom
     *   user ratelimit, false if they use the default user ratelimit.
     * @param {number} ratelimitMaxTokens The maximum number of API tokens this
     *   user can accumulate.
     * @param {number} ratelimitRefillAmount The amount of API tokens the user
     *   receives on each refill.
     * @param {number} ratelimitRefillTimeMS The number of milliseconds between
     *   API token refills.
     * @param {boolean} ratelimitStrict True if attempting to consume API
     *   tokens which are not available resets the refill timer, false if it
     *   does not.
     * @param {function} ratelimitChanged A function we call after the user
     *   confirms changes to the ratelimit. We pass 6 parameters - the new
     *   values for globalRatelimitApplies, userSpecificRatelimit,
     *   ratelimitMaxTokens, ratelimitRefillAmount, ratelimitRefillTimeMS,
     *   and ratelimitStrict respectively.
     */
    class UserSettings extends React.Component {
        constructor(props) {
            super(props);

            let punishingWarning = this.props.userSpecificRatelimit && this.props.ratelimitStrict && this.props.ratelimitRefillTimeMS >= 1800000
            this.state = {
                historyShown: false,
                historyLoaded: false,
                ratelimitChanged: false,
                ratelimitCanBeSaved: false,
                ratelimitUserSettingShown: this.props.userSpecificRatelimit,
                initialRatelimitPunishingWarning: punishingWarning,
                ratelimitShowVeryPunishingWarning: punishingWarning
            };

            this.globalRatelimitAppliesQuery = null;
            this.userSpecificRatelimitQuery = null;
            this.ratelimitMaxTokensQuery = null;
            this.ratelimitRefillAmountQuery = null;
            this.ratelimitRefillTimeMSQuery = null;
            this.ratelimitStrictQuery = null;
        }

        render() {
            return React.createElement(
                'div',
                {className: 'user-settings'},
                [
                    React.createElement(
                        'div',
                        {key: 'title', className: 'user-settings-title'},
                        `User Settings for ${this.props.username} (id: ${this.props.id})`
                    ),
                    React.createElement(
                        'div',
                        {key: 'history', className: 'user-settings-history-wrapper'},
                        [
                            React.createElement(
                                FormElement,
                                {
                                   key: 'toggle',
                                   labelText: 'Show History',
                                   component: CheckBox,
                                   componentArgs: {
                                        key: 'toggle',
                                        checked: this.state.historyShown,
                                        checkedChanged: ((val) => {
                                            this.setState((state) => {
                                                let newState = Object.assign({}, state);
                                                newState.historyShown = val;
                                                newState.historyLoaded = true;
                                                return newState;
                                            });
                                        }).bind(this)
                                    }
                                }
                            )
                        ].concat(this.state.historyLoaded ? [
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'history',
                                    initialState: 'closed',
                                    desiredState: this.state.historyShown ? 'expanded' : 'closed'
                                },
                                this.props.children
                            )
                        ] : [])
                    ),
                    React.createElement(
                        'div',
                        {key: 'non-req-response-opt-out', className: 'user-settings-setting'},
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'alert',
                                    title: 'Non Request Response Opt Out',
                                    type: 'info',
                                    text: (
                                        'Generally the LoansBot will respond with a check response to all non-meta ' +
                                        'submissions on /r/borrow. If a user opts out of non-request responses, ' +
                                        'then only [REQ] submissions by the user will result in the automatic check. ' +
                                        'Regardless of this setting, the bot will respond normally to comments by the ' +
                                        'user.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: `checkbox-${this.props.nonReqResponseOptOut}`,
                                    labelText: 'Non-REQ Response Opt Out',
                                    component: CheckBox,
                                    componentArgs: {
                                        key: 'toggle',
                                        checked: this.props.nonReqResponseOptOut,
                                        disabled: this.props.disabled || !this.props.canModifyNonReqResponseOptOut,
                                        checkedChanged: this.props.nonReqResponseOptOutChanged
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'borrower-req-pm-opt-out', className: 'user-settings-setting'},
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'alert',
                                    title: 'Borrower REQ PM Opt Out',
                                    type: 'info',
                                    text: (
                                        'Generally the LoansBot will PM a lender if one of their borrowers, who still ' +
                                        'has an active loan with the lender, makes a REQ thread on /r/borrow. A user ' +
                                        'can choose to opt out of receiving this PM.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: `checkbox-${this.props.borrowerReqPMOptOut}`,
                                    labelText: 'Borrower REQ PM Opt Out',
                                    component: CheckBox,
                                    componentArgs: {
                                        key: 'toggle',
                                        checked: this.props.borrowerReqPMOptOut,
                                        disabled: this.props.disabled || !this.props.canModifyBorrowerReqPMOptOut,
                                        checkedChanged: this.props.borrowerReqPMOptOutChanged
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'api-ratelimit', className: 'user-settings-settings'},
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'general-info',
                                    title: 'API Ratelimits',
                                    type: 'info',
                                    text: (
                                        'This section describes and potentially allows modifying a users ' +
                                        'API ratelimit restrictions. These will almost never impact a user ' +
                                        'unless they are using some sort of automated access, i.e., a bot ' +
                                        'script or external website which is accessing the redditloans API. ' +
                                        'In general these settings will be modified only if the requester is ' +
                                        'able to provide some evidence of good-faith usage, such as a detailed ' +
                                        'description of what they are doing. See ' +
                                        'https://github.com/LoansBot/web-backend/blob/master/API.md for details.'
                                    )
                                }
                            )
                        ].concat(this.props.canModifyRatelimit ? [
                            React.createElement(
                                Alert,
                                {
                                    key: 'saving',
                                    title: 'Saving',
                                    type: 'warning',
                                    text: 'You must click "Save Ratelimit Settings" below in order to save changes to a users ratelimit.'
                                }
                            )
                        ] : []).concat([
                            React.createElement(
                                Alert,
                                {
                                    key: 'algo-info',
                                    title: 'Ratelimit Algorithm',
                                    type: 'info',
                                    text: (
                                        'We use a ratelimiting algorithm very similar to https://github.com/smyte/ratelimit. ' +
                                        'Our implementation is at https://github.com/LoansBot/shared/blob/master/src/lbshared/ratelimits.py. ' +
                                        'The cost of a given request is calculated dynamically based on the arguments. For an example ' +
                                        'of the computed cost, go to /api/loans?dry_run=1&dry_run_text=1 - for the implemention of the ' +
                                        'quote calculation, see https://github.com/LoansBot/web-backend ; specifically the controller ' +
                                        'for the endpoint you are interested in, such as https://github.com/LoansBot/web-backend/blob/master/src/loans/router.py'
                                    )
                                }
                            ),
                            React.createElement(
                                Alert,
                                {
                                    key: 'global-ratelimit-applies-info',
                                    title: 'Global Ratelimit Applies',
                                    type: 'info',
                                    text: (
                                        'If the global ratelimit applies to a user, then their requests require and consume from ' +
                                        'the global tokens. This prevents a user from interweaving requests through multiple ' +
                                        'accounts to get completely around ratelimiting. If the global ratelimit does not apply ' +
                                        'to a user, they neither require nor consume from the global tokens, i.e., only their own ' +
                                        'requests will impact their ratelimit. By default the global ratelimit applies.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: `global-ratelimit-${this.props.globalRatelimitApplies}`,
                                    labelText: 'Global Ratelimit Applies',
                                    component: CheckBox,
                                    componentArgs: {
                                        key: 'toggle',
                                        checked: this.props.globalRatelimitApplies,
                                        disabled: this.props.disabled || !this.props.canModifyRatelimit,
                                        checkedQuery: ((query) => this.globalRatelimitAppliesQuery = query).bind(this),
                                        checkedChanged: this.ratelimitChanged.bind(this)
                                    }
                                }
                            ),
                            React.createElement(
                                Alert,
                                {
                                    key: 'user-specific-ratelimit',
                                    title: 'User Specific Ratelimit',
                                    type: 'info',
                                    text: (
                                        'Each user has their own token pool they poll from. Most users all have ' +
                                        'the same settings in their token pool, however we can modify the token pool ' +
                                        'for a particular user. If global ratelimiting applies, they will require and ' +
                                        'consume from both the global pool and the users specific pool. If global ratelimiting ' +
                                        'does not apply, they require and consume only from their specific pool.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'user-specific-ratelimit-checkbox',
                                    labelText: 'User Specific Ratelimit',
                                    component: CheckBox,
                                    componentArgs: {
                                        key: 'toggle',
                                        checked: this.props.userSpecificRatelimit,
                                        disabled: this.props.disabled || !this.props.canModifyRatelimit,
                                        checkedQuery: ((query) => this.userSpecificRatelimitQuery = query).bind(this),
                                        checkedChanged: this.ratelimitChanged.bind(this)
                                    }
                                }
                            ),
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'ratelimit',
                                    initialState: this.props.userSpecificRatelimit ? 'expanded' : 'closed',
                                    desiredState: this.state.ratelimitUserSettingShown ? 'expanded' : 'closed'
                                },
                                [
                                    React.createElement(
                                        Alert,
                                        {
                                            key: 'refill-example',
                                            type: 'info',
                                            title: 'Ratelimit Examples',
                                            text: (
                                                'A bursty program which expects to consume a bit less than 2,500 tokens per ' +
                                                'run is only invoked manually. We want to avoid them running it more than 3 ' +
                                                'times a day, but we will allow up to 6 if they did not run any the previous ' +
                                                'day and they spread them out. One way to do this is to give them 2,500 tokens ' +
                                                'every 8 hours up to a maximum of 7,500 tokens in their pool. This gives the ' +
                                                'following settings: Max: 7500, Interval: 28800000, Amount: 2500'
                                            )
                                        }
                                    ),
                                    React.createElement(
                                        Alert,
                                        {
                                            key: 'ratelimit-purpose',
                                            type: 'success',
                                            title: 'Remember the goal',
                                            text: (
                                                'Remember that the goal of ratelimiting is a positive experience for everyone; ' +
                                                'by clearly allocating resources it is easier for clients to plan, ' +
                                                'and by consistency enforcing those allocations we avoid the tragedy of the ' +
                                                'commons. Also the nature of the issue and due to the architecture of the ' +
                                                'LoansBot, one can choose to sponsor more servers to get a larger allocation, ' +
                                                'with no practical limit. Since this does require a certain amount of manual ' +
                                                'effort, we only accept 1-year or 3-year commitments (i.e., at the time of writing, ' +
                                                'starting around $200 for adding about 2.5m/day for a year, to about $3,400 for ' +
                                                'adding about 50m/day for 3 years). Contact tjstretchalot for details.'
                                            )
                                        }
                                    ),
                                    React.createElement(
                                        Alert,
                                        {
                                            key: 'refill-max-info',
                                            type: 'info',
                                            title: 'Ratelimit Max Tokens',
                                            text: (
                                                'The maximum number of tokens that can be accrued from not using the ' +
                                                'API. For example, if a user has a max tokens of 50, then if they are under ' +
                                                'their API usage they will keep getting credited until they are at 50 tokens. ' +
                                                'Larger numbers allow for more bursting.'
                                            )
                                        }
                                    ),
                                    React.createElement(
                                        FormElement,
                                        {
                                            key: 'refill-max',
                                            labelText: 'Ratelimit Max Tokens',
                                            component: TextInput,
                                            componentArgs: {
                                                type: 'number',
                                                text: this.props.ratelimitMaxTokens,
                                                min: 0,
                                                step: 1,
                                                disabled: this.props.disabled || !this.props.canModifyRatelimit,
                                                textQuery: ((query) => this.ratelimitMaxTokensQuery = query).bind(this),
                                                textChanged: this.ratelimitChanged.bind(this)
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        Alert,
                                        {
                                            key: 'refill-interval',
                                            type: 'info',
                                            title: 'Ratelimit Token Refill Interval',
                                            text: (
                                                'The number of milliseconds between the user getting more tokens. If this is ' +
                                                '1000, then every second we credit the user with another set of tokens. Smaller ' +
                                                'intervals are more predictable, larger intervals are more punishing.'
                                            )
                                        }
                                    ),
                                    React.createElement(
                                        FormElement,
                                        {
                                            key: 'refill-intvl',
                                            labelText: 'Ratelimit Token Refill Interval (ms)',
                                            component: TextInput,
                                            componentArgs: {
                                                type: 'number',
                                                text: this.props.ratelimitRefillTimeMS,
                                                min: 1,
                                                step: 1,
                                                disabled: this.props.disabled || !this.props.canModifyRatelimit,
                                                textQuery: ((query) => this.ratelimitRefillTimeMSQuery = query).bind(this),
                                                textChanged: this.ratelimitChanged.bind(this)
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        Alert,
                                        {
                                            key: 'refill-amount-info',
                                            type: 'info',
                                            title: 'Ratelimit Token Refill Amount',
                                            text: 'The number of tokens that are refilled every interval.'
                                        }
                                    ),
                                    React.createElement(
                                        FormElement,
                                        {
                                            key: 'refill-amount',
                                            labelText: 'Ratelimit Token Refill Amount',
                                            component: TextInput,
                                            componentArgs: {
                                                type: 'number',
                                                text: this.props.ratelimitRefillAmount,
                                                min: 1,
                                                step: 1,
                                                disabled: this.props.disabled || !this.props.canModifyRatelimit,
                                                textQuery: ((query) => this.ratelimitRefillAmountQuery = query).bind(this),
                                                textChanged: this.ratelimitChanged.bind(this)
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        Alert,
                                        {
                                            key: 'refill-strict-info',
                                            type: 'info',
                                            title: 'Ratelimit Token Refill Strict',
                                            text: (
                                                'If the ratelimit token refill is on the strict setting, then making a ' +
                                                'request which is ratelimited is punished by resetting the timer on ' +
                                                'the refill interval. This is more punishing the higher the refill interval, ' +
                                                'and ensures there is no benefit to retrying ratelimited requests faster ' +
                                                'than the refill interval, since it still does cost us something to process ' +
                                                'a ratelimited request (although it is typically much cheaper than a valid request). ' +
                                                'Since us ratelimiting a request is unproductive work for both sides, we would ' +
                                                'much prefer the client self-ratelimit correctly, hence all requests served ' +
                                                'are doing something useful. Generally if requests are automated this should be ' +
                                                'true, if requests are manual this should be false. The idea for humans not being ' +
                                                'on the strict setting is that the feedback itself is considered useful.'
                                            )
                                        }
                                    ),
                                    React.createElement(
                                        FormElement,
                                        {
                                            key: 'refill-strict',
                                            labelText: 'Ratelimit Token Refill Strict',
                                            component: CheckBox,
                                            componentArgs: {
                                                key: 'toggle',
                                                checked: this.props.ratelimitStrict,
                                                disabled: this.props.disabled || !this.props.canModifyRatelimit,
                                                checkedQuery: ((query) => this.ratelimitStrictQuery = query).bind(this),
                                                checkedChanged: this.ratelimitChanged.bind(this)
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        SmartHeightEased,
                                        {
                                            key: 'v-punishing-warning',
                                            initialState: this.state.initialRatelimitPunishingWarning ? 'expanded' : 'closed',
                                            desiredState: this.state.ratelimitShowVeryPunishingWarning ? 'expanded' : 'closed'
                                        },
                                        React.createElement(
                                            Alert,
                                            {
                                                type: 'warning',
                                                title: 'Very Punishing Ratelimit',
                                                text: (
                                                    'This combination of a high ratelimit interval and the strict setting ' +
                                                    'can mean that sending a single request which gets ratelimited can undo ' +
                                                    'a long period of making no requests. This is frustrating, and the ' +
                                                    'punishment is not suitable for the crime. Barring extremely unusual ' +
                                                    'circumstances, it is better to use a smaller interval or disable the ' +
                                                    'strict setting.'
                                                )
                                            }
                                        )
                                    )
                                ]
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'save-ratelimit',
                                    text: 'Save Ratelimit Settings' + (
                                        !this.state.ratelimitChanged ? ' [No Changes]' : (
                                            !this.state.ratelimitCanBeSaved ? ' [Bad Values]' : ''
                                        )
                                    ),
                                    type: 'button',
                                    onClick: (() => {
                                        this.props.ratelimitChanged(
                                            this.globalRatelimitAppliesQuery(),
                                            this.userSpecificRatelimitQuery(),
                                            this.ratelimitMaxTokensQuery(),
                                            this.ratelimitRefillAmountQuery(),
                                            this.ratelimitRefillTimeMSQuery(),
                                            this.ratelimitStrictQuery()
                                        );
                                    }).bind(this),
                                    disabled: this.props.disabled || !this.props.canModifyRatelimit || !this.state.ratelimitChanged || !this.state.ratelimitCanBeSaved
                                }
                            )
                        ])
                    )
                ]
            )
        }

        ratelimitChanged() {
            let changed = false;
            let okay = true;
            let ratelimitShowVeryPunishingWarning = false;

            let globalRatelimitApplies = this.globalRatelimitAppliesQuery();
            changed = changed || (globalRatelimitApplies !== this.props.globalRatelimitApplies);

            let userSpecificRatelimit = this.userSpecificRatelimitQuery();
            changed = changed || (userSpecificRatelimit !== this.props.userSpecificRatelimit);

            if (userSpecificRatelimit) {
                let refillMax = this.ratelimitMaxTokensQuery();
                changed = changed || (refillMax !== this.props.ratelimitMaxTokens);
                okay = okay && refillMax !== undefined && refillMax !== null && refillMax > 0;

                let refillIntvl = this.ratelimitRefillTimeMSQuery();
                changed = changed || (refillIntvl !== this.props.ratelimitRefillTimeMS);
                okay = okay && refillIntvl !== undefined && refillIntvl !== null && refillIntvl > 0;

                let refillAmt = this.ratelimitRefillAmountQuery();
                changed = changed || (refillAmt !== this.props.ratelimitRefillAmount);
                okay = okay && refillAmt !== undefined && refillAmt !== null && refillAmt > 0;

                let refillStrict = this.ratelimitStrictQuery();
                changed = changed || (refillStrict !== this.props.ratelimitStrict);

                ratelimitShowVeryPunishingWarning = refillStrict && refillIntvl >= 1800000;
            }

            if (
                changed !== this.state.ratelimitChanged ||
                okay !== this.state.ratelimitCanBeSaved ||
                userSpecificRatelimit != this.state.ratelimitUserSettingShown ||
                ratelimitShowVeryPunishingWarning !== this.state.ratelimitShowVeryPunishingWarning
            ) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.ratelimitChanged = changed;
                    newState.ratelimitUserSettingShown = userSpecificRatelimit;
                    newState.ratelimitCanBeSaved = okay;
                    newState.ratelimitShowVeryPunishingWarning = ratelimitShowVeryPunishingWarning;
                    return newState;
                });
            }
        }
    };

    UserSettings.propTypes = {
        disabled: PropTypes.bool,
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
        canModifyNonReqResponseOptOut: PropTypes.bool.isRequired,
        nonReqResponseOptOut: PropTypes.bool.isRequired,
        nonReqResponseOptOutChanged: PropTypes.func,
        canModifyBorrowerReqPMOptOut: PropTypes.bool.isRequired,
        borrowerReqPMOptOut: PropTypes.bool.isRequired,
        borrowerReqPMOptOutChanged: PropTypes.func,
        canModifyRatelimit: PropTypes.bool.isRequired,
        globalRatelimitApplies: PropTypes.bool.isRequired,
        userSpecificRatelimit: PropTypes.bool.isRequired,
        ratelimitMaxTokens: PropTypes.number.isRequired,
        ratelimitRefillAmount: PropTypes.number.isRequired,
        ratelimitRefillTimeMS: PropTypes.number.isRequired,
        ratelimitStrict: PropTypes.bool.isRequired,
        ratelimitChanged: PropTypes.func
    };

    /**
     * Handles showing and editing a users settings from just their id, using
     * Ajax calls to fetch information or update settings.
     *
     * @param {number} userId The primary key of the user whose settings should
     *   be shown.
     */
    class UserSettingsWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                loading: true,
                settingsCounter: 0,
                errored: false,
                alert: {
                    title: 'Title',
                    type: 'info',
                    text: 'Some text'
                },
                alertState: 'closed',
                disabled: true,
                username: 'Loading...',
                canModifyNonReqResponseOptOut: false,
                nonReqResponseOptOut: false,
                canModifyBorrowerReqPMOptOut: false,
                borrowerReqPMOptOut: false,
                canModifyRatelimit: false,
                globalRatelimitApplies: false,
                userSpecificRatelimit: false,
                ratelimitMaxTokens: 1,
                ratelimitRefillAmount: 1,
                ratelimitRefillTimeMS: 1,
                ratelimitStrict: false
            };

            this.refreshHistory = null;
            this.rawRefresh();
        }

        render() {
            let settingsElement = (this.state.loading ? React.createElement(CenteredSpinner, {key: 'spinner'}) : React.createElement(
                UserSettings,
                {
                    key: `settings-${this.state.settingsCounter}`,
                    disabled: this.state.disabled,
                    id: this.props.userId,
                    username: this.state.username,
                    canModifyNonReqResponseOptOut: this.state.canModifyNonReqResponseOptOut,
                    nonReqResponseOptOut: this.state.nonReqResponseOptOut,
                    nonReqResponseOptOutChanged: (() => {
                        if (this.state.disabled) { return; }
                        let newValue = !this.state.nonReqResponseOptOut;
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.disabled = true;
                            newState.alertState = 'closed';
                            return newState;
                        });

                        api_fetch(
                            `/api/users/${this.props.userId}/settings/non-req-response-opt-out`,
                            AuthHelper.auth({
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    new_value: newValue
                                })
                            })
                        ).then((resp) => {
                            if (this.refreshHistory) { this.refreshHistory(); }
                            if (!resp.ok) {
                                console.log('Request to change non req response opt out failed - check network tab');
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.settingsCounter += 1;
                                    newState.alertState = 'expanded';
                                    newState.alert = {
                                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                        type: 'error',
                                        text: 'There was an issue changing the non-req response opt out setting. Try again or contact the site administrator.'
                                    };
                                    newState.disabled = false;
                                    return newState;
                                });
                            } else {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.nonReqResponseOptOut = newValue;
                                    newState.disabled = false;
                                    return newState;
                                });
                            }
                        });
                    }).bind(this),
                    canModifyBorrowerReqPMOptOut: this.state.canModifyBorrowerReqPMOptOut,
                    borrowerReqPMOptOut: this.state.borrowerReqPMOptOut,
                    borrowerReqPMOptOutChanged: (() => {
                        if (this.state.disabled) { return; }
                        let newValue = !this.state.borrowerReqPMOptOut;
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.disabled = true;
                            newState.alertState = 'closed';
                            return newState;
                        });

                        api_fetch(
                            `/api/users/${this.props.userId}/settings/borrower-req-pm-opt-out`,
                            AuthHelper.auth({
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    new_value: newValue
                                })
                            })
                        ).then((resp) => {
                            if (this.refreshHistory) { this.refreshHistory(); }
                            if (!resp.ok) {
                                console.log('Request to change borrower req pm opt out failed - check network tab');
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.settingsCounter += 1;
                                    newState.alertState = 'expanded';
                                    newState.alert = {
                                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                        type: 'error',
                                        text: 'There was an issue changing the borrower req pm opt out setting. Try again or contact the site administrator.'
                                    };
                                    newState.disabled = false;
                                    return newState;
                                });
                            } else {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.borrowerReqPMOptOut = newValue;
                                    newState.disabled = false;
                                    return newState;
                                });
                            }
                        });
                    }).bind(this),
                    canModifyRatelimit: this.state.canModifyRatelimit,
                    globalRatelimitApplies: this.state.globalRatelimitApplies,
                    userSpecificRatelimit: this.state.userSpecificRatelimit,
                    ratelimitMaxTokens: this.state.ratelimitMaxTokens,
                    ratelimitRefillAmount: this.state.ratelimitRefillAmount,
                    ratelimitRefillTimeMS: this.state.ratelimitRefillTimeMS,
                    ratelimitStrict: this.state.ratelimitStrict,
                    ratelimitChanged: ((global_applies, user_specific, max_tokens, refill_amount, refill_time_ms, strict) => {
                        if (this.state.disabled) { return; }
                        if (!user_specific) {
                            max_tokens = null;
                            refill_amount = null;
                            refill_time_ms = null;
                            strict = null;
                        }
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.disabled = true;
                            newState.alertState = 'closed';
                            return newState;
                        });

                        api_fetch(
                            `/api/users/${this.props.userId}/settings/ratelimit`,
                            AuthHelper.auth({
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    new_value: {
                                        global_applies: global_applies,
                                        user_specific: user_specific,
                                        max_tokens: max_tokens,
                                        refill_amount: refill_amount,
                                        refill_time_ms: refill_time_ms,
                                        strict: strict
                                    }
                                })
                            })
                        ).then((resp) => {
                            if (this.refreshHistory) { this.refreshHistory(); }
                            if (!resp.ok) {
                                console.log('Request to change ratelimit failed - check network tab');
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.settingsCounter += 1;
                                    newState.alertState = 'expanded';
                                    newState.alert = {
                                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                        type: 'error',
                                        text: 'There was an issue changing the ratelimit settings. Try again or contact the site administrator.'
                                    };
                                    newState.disabled = false;
                                    return newState;
                                });
                            } else {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.globalRatelimitApplies = global_applies;
                                    newState.userSpecificRatelimit = user_specific;
                                    newState.alertState = 'closed';
                                    if (user_specific) {
                                        newState.ratelimitMaxTokens = max_tokens;
                                        newState.ratelimitRefillAmount = refill_amount;
                                        newState.ratelimitRefillTimeMS = refill_time_ms;
                                        newState.ratelimitStrict = strict;
                                    }
                                    newState.disabled = false;
                                    return newState;
                                });
                            }
                        });
                    }).bind(this)
                },
                React.createElement(
                    UserSettingsHistoryAjax,
                    {
                        userId: this.props.userId,
                        refresh: ((rfrsh) => { this.refreshHistory = rfrsh; }).bind(this)
                    }
                )
            ));

            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                title: this.state.alert.title,
                                type: this.state.alert.type,
                                text: this.state.alert.text
                            }
                        )
                    ),
                    settingsElement
                ]
            );
        }

        refresh() {
            if (this.state.loading) { return; }
            if (this.refreshHistory) { this.refreshHistory(); }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                newState.alertState = 'closed';
                newState.disabled = true;
                return newState;
            });

            this.rawRefresh();
        }

        rawRefresh() {
            let missing = Array(4);
            let failed = false;

            const finished = ((idx) => {
                missing[idx] = true;
                if (missing.includes(undefined)) { return; }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.disabled = false;
                    newState.alertState = 'closed';
                    return newState;
                });
            }).bind(this);

            const respHandler = ((resp) => {
                if (failed) { return; }

                if (!resp.ok) {
                    failed = true;

                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loading = false;
                        newState.errored = true;
                        newState.alertState = 'expanded';
                        newState.alert = Object.assign({}, newState.alert);
                        newState.alert.title = `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        newState.alert.type = 'error';
                        newState.alert.text = 'Failed to load user settings. Refresh or contact the site administrator.'
                        return newState;
                    });
                    return Promise.reject();
                }

                return resp.json();
            }).bind(this);

            const catchHandler = (() => {});

            api_fetch(
                `/api/users/${this.props.userId}`,
                AuthHelper.auth()
            ).then(respHandler).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.username = json.username;
                    return newState;
                });
                finished(0);
            }).catch(catchHandler);

            api_fetch(
                `/api/users/${this.props.userId}/settings/non-req-response-opt-out`,
                AuthHelper.auth()
            ).then(respHandler).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.canModifyNonReqResponseOptOut = json.can_modify;
                    newState.nonReqResponseOptOut = json.value;
                    return newState;
                });
                finished(1);
            }).catch(catchHandler);

            api_fetch(
                `/api/users/${this.props.userId}/settings/borrower-req-pm-opt-out`,
                AuthHelper.auth()
            ).then(respHandler).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.canModifyBorrowerReqPMOptOut = json.can_modify;
                    newState.borrowerReqPMOptOut = json.value;
                    return newState;
                });
                finished(2);
            }).catch(catchHandler);

            api_fetch(
                `/api/users/${this.props.userId}/settings/ratelimit`,
                AuthHelper.auth()
            ).then(respHandler).then((json) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.canModifyRatelimit = json.can_modify;
                    newState.globalRatelimitApplies = json.value.global_applies;
                    newState.userSpecificRatelimit = json.value.user_specific;
                    newState.ratelimitMaxTokens = json.value.max_tokens;
                    newState.ratelimitRefillAmount = json.value.refill_amount;
                    newState.ratelimitRefillTimeMS = json.value.refill_time_ms;
                    newState.ratelimitStrict = json.value.strict;
                    return newState;
                });
                finished(3);
            }).catch(catchHandler);
        }
    };

    UserSettingsWithAjax.propTypes = {
        userId: PropTypes.number.isRequired
    }

    /**
     * Show everything about a user, fetching required information from Ajax
     * calls. Also allows modification of the user where the authenticated
     * user is allowed to do so.
     *
     * @param {number} userId The primary key of the user to show.
     */
    class UserAjax extends React.Component {
        render() {
            return React.createElement(
                'div',
                {key: 'user'},
                [
                    React.createElement(
                        AuthenticationMethodSelectFormWithAjaxAndView,
                        {
                            key: 'auth-methods',
                            userId: this.props.userId
                        }
                    ),
                    React.createElement(
                        UserSettingsWithAjax,
                        {
                            key: 'settings',
                            userId: this.props.userId
                        }
                    )
                ]
            );
        }
    };

    UserAjax.propTypes = {
        userId: PropTypes.number.isRequired
    };

    /**
     * Shows a text input to search for a user by their username. This will
     * attempt to autocomplete the username to one of the users we know,
     * and because of that it doesn't make much sense to show without the
     * ajax calls.
     *
     * @param {function} userIdQuery A function which we call with a function
     *   which returns null if no user id is selected, otherwise the id of the
     *   currently selected user.
     * @param {function} userIdChanged A function which we call when a user id
     *   of an existing user is properly selected. We call it with the newly
     *   selected user id.
     */
    class UserSelectFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: {
                    title: 'Some text',
                    type: 'info',
                    text: 'Some text'
                },
                alertState: 'closed'
            };

            this.numberOfSuggestions = 6;

            this.usernameQuery = null;
            this.usernameForUserId = null;
            this.userIdWasNull = true;
            this.userId = null;

            if (this.props.userIdQuery) {
                this.props.userIdQuery((() => this.userId).bind(this));
            }
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        AutoCompleter,
                        {
                            key: 'user-input',
                            labelText: 'Username',
                            valueChanged: this.usernameChanged.bind(this),
                            suggestionsRequest: this.fetchSuggestions.bind(this)
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                type: this.state.alert.type,
                                title: this.state.alert.title,
                                text: this.state.alert.text
                            }
                        )
                    )
                ]
            );
        }

        usernameChanged(username) {
            this.usernameForUserId = username;
            this.userId = null;

            if (this.state.alertState !== 'closed') {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertState = 'closed';
                    return newState;
                });
            }

            if (username === '' || username === null || username === undefined) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = {
                        title: 'User not found',
                        type: 'info',
                        text: 'Enter a username above or select one of the suggestions.'
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });

                if (!this.userIdWasNull) {
                    this.userIdWasNull = true;
                    if (this.props.userIdChanged) { this.props.userIdChanged(this.userId); }
                }
                return;
            }

            api_fetch(
                `/api/users/lookup?q=${encodeURIComponent(username)}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (username !== this.usernameForUserId) { return; }

                if (!resp.ok) {
                    if (resp.status === 404) {
                        return Promise.reject({
                            title: 'User not found',
                            type: 'info',
                            text: `No information on /u/${username} found.`
                        });
                    }
                    return Promise.reject({
                        title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                        type: 'error',
                        text: `Failed to lookup /u/${username} - check network tab or contact the site administrator.`
                    });
                }

                return resp.json();
            }).then((json) => {
                if (username !== this.usernameForUserId) { return; }

                this.userId = json.id;
                this.userIdWasNull = false;
                if (this.props.userIdChanged) { this.props.userIdChanged(this.userId); }

                if (this.state.alertState !== 'closed') {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.alertState = 'closed';
                        return newState;
                    });
                }
            }).catch((err) => {
                if (username !== this.usernameForUserId) { return; }
                if (typeof(err) !== 'object' || typeof(err.title) !== 'string') {
                    err = {
                        title: 'Unknown Error',
                        type: 'error',
                        text: err.toString()
                    }
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = err;
                    newState.alertState = 'expanded';
                    return newState;
                });

                if (!this.userIdWasNull) {
                    this.userIdWasNull = true;
                    if (this.props.userIdChanged) { this.props.userIdChanged(this.userId); }
                }
            });
        }

        fetchSuggestions(newVal, callback) {
            api_fetch(
                `/api/users/suggest?q=${encodeURIComponent(newVal)}&limit=${encodeURIComponent(this.numberOfSuggestions)}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    console.log(
                        `Suggestion request failed with status code ${resp.status} - check network tab`
                    );
                    return;
                }

                if (resp.status === 204) {
                    return Promise.resolve({suggestions: []});
                }

                return resp.json();
            }).then((json) => {
                callback(json.suggestions);
            }).catch(() => {
                console.log(
                    'Network error fetching suggestions; check internet connection'
                );
            });
        }
    };

    UserSelectFormWithAjax.propTypes = {
        userIdQuery: PropTypes.func,
        userIdChanged: PropTypes.func
    };

    /**
     * Allows selecting a user in a somewhat convienent fashion, then renders
     * the necessary components to view and manage the users settings. This
     * should only be shown on accounts which the necessary permissions to at
     * least view other users accounts.
     */
    class UserSelectFormWithAjaxAndView extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                userId: null,
                userShown: false
            };
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        UserSelectFormWithAjax,
                        {
                            key: 'select-user',
                            userIdChanged: ((userId) => {
                                if (userId === null) {
                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.userShown = false;
                                        return newState;
                                    });
                                    return;
                                }

                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.userShown = true;
                                    newState.userId = userId;
                                    return newState;
                                });
                            }).bind(this)
                        }
                    )
                ].concat(this.state.userId === null ? [] : [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: `user-${this.state.userId}`,
                            initialState: 'closed',
                            desiredState: this.state.userShown ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            UserAjax,
                            {
                                userId: this.state.userId
                            }
                        )
                    )
                ])
            );
        }
    };

    return [UserAjax, UserSelectFormWithAjax, UserSelectFormWithAjaxAndView];
})();
