const [ClaimForm, ClaimFormWithLogic] = (function() {
    /**
     * Displays the visuals for the claim form. This doesn't handle any of the
     * logic, just exposes the necessary listeners and handles the client-side
     * validations.
     *
     * @param {string} username The username of the account being claimed
     * @param {function} passwordQuery A function which we call with a function
     *   that returns the password that the user has put in.
     * @param {function} tokenGet A function which we call with a function which
     *   will return the current hCaptcha token.
     * @param {function} tokenClear A function which we call with a function which
     *   will clear the current hCaptcha token.
     * @param {function} submit A function which we call when this form is
     *   submitted.
     */
    class ClaimForm extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                showPassword: false,
                disabled: true
            };

            this.showPasswordRef = React.createRef();
            this.formRef = React.createRef();

            this.passwordQuery = null;

            this.setPasswordQuery = this.setPasswordQuery.bind(this);
            this.onPasswordChanged = this.onPasswordChanged.bind(this);
            this.toggleShowPassword = this.toggleShowPassword.bind(this);
        }

        render() {
            return React.createElement(
                'form',
                {ref: this.formRef},
                [
                    React.createElement(
                        'h3',
                        {key: 'title'},
                        `Claim /u/${this.props.username}`
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'password',
                            labelText: 'Password',
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: this.state.showPassword ? 'text' : 'password',
                                textQuery: this.setPasswordQuery,
                                textChanged: this.onPasswordChanged
                            }
                        )
                    ),
                    React.createElement(
                        Captcha,
                        {
                            key: 'captcha',
                            tokenGet: this.props.tokenGet,
                            tokenClear: this.props.tokenClear
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit',
                            type: 'submit',
                            style: 'primary',
                            text: 'Claim Account',
                            disabled: this.state.disabled,
                            onClick: this.props.submit
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'toggle-pass',
                            type: 'button',
                            style: 'secondary',
                            text: (this.state.showPassword ? 'Hide Password' : 'Show Password'),
                            onClick: this.toggleShowPassword
                        }
                    )
                ]
            )
        }

        componentDidMount() {
            if(this.submit) {
                this.formRef.current.addEventListener('submit', ((e) => this.props.submit(e)).bind(this));
            }
        }

        setPasswordQuery(qry) {
            if(this.props.passwordQuery) {
                this.props.passwordQuery(qry);
            }
            this.passwordQuery = qry;
        }

        onPasswordChanged() {
            let shouldBeDisabled = this.passwordQuery().length < 6;
            if (shouldBeDisabled != this.state.disabled) {
                let newState = Object.assign({}, this.state);
                newState.disabled = shouldBeDisabled;
                this.setState(newState);
            }
        }

        toggleShowPassword() {
            let newState = Object.assign({}, this.state);
            newState.showPassword = !this.state.showPassword;
            this.setState(newState);
        }
    }

    ClaimForm.propTypes = {
        passwordQuery: PropTypes.func,
        tokenGet: PropTypes.func,
        tokenClear: PropTypes.func,
        submit: PropTypes.func,
        username: PropTypes.string.isRequired
    };

    /**
     * Wraps a claim form with the standard logic. This will accept a user id
     * and token (which are usually found via query parameters) and sends them
     * along with the target password to /api/users/claim - on success, this
     * will redirect to the login page.
     *
     * @param {number} userId The user id of the account to claim.
     * @param {string} token The token that we use as proof we own that account
     */
    class ClaimFormWithLogic extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                disabled: false,
                username: '[loading]'
            };

            this.getPassword = null;
            this.setAlert = null;
            this.getToken = null;
            this.clearToken = null;

            this.setGetPassword = this.setGetPassword.bind(this);
            this.setSetAlert = this.setSetAlert.bind(this);
            this.setGetToken = this.setGetToken.bind(this);
            this.setClearToken = this.setClearToken.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                Alertable,
                {
                    alertSet: this.setSetAlert
                },
                React.createElement(
                    ClaimForm,
                    {
                        key: 'claim-form',
                        username: this.state.username,
                        passwordQuery: this.setGetPassword,
                        tokenGet: this.setGetToken,
                        tokenClear: this.setClearToken,
                        submit: this.onSubmit,
                        disabled: this.state.disabled
                    }
                )
            );
        }

        componentDidMount() {
            this.getUsername();
        }

        getUsername() {
            let handled = false;
            api_fetch(
                `/api/users/${this.props.userId}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('fetch username', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.username = json.username;
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            });
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        setGetPassword(gtr) {
            this.getPassword = gtr;
        }

        setGetToken(gtr) {
            this.getToken = gtr;
        }

        setClearToken(clr) {
            this.clearToken = clr;
        }

        onSubmit(e) {
            e.preventDefault();
            e.stopPropagation();

            let captchaToken = this.getToken();
            if (!captchaToken) {
                this.setAlert(
                    React.createElement(
                        Alert,
                        {
                            type: 'info',
                            title: 'Captcha incomplete'
                        },
                        'Please fill out the captcha to proceed'
                    )
                );
               // return;
            }

            console.log(
                `Claiming the account for user ${this.props.userId} (${this.state.username})..`
            );

            this.setAlert(
                React.createElement(
                    Alert,
                    {
                        type: 'info',
                        title: 'Claiming account..'
                    },
                    `A request is being sent to the server to claim /u/${this.state.username}`
                )
            )
            this.setState({disabled: true});

            let handled = false;
            api_fetch(
                '/api/users/claim',
                {
                    method: 'POST',
                    credentials: 'omit',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        user_id: this.props.userId,
                        claim_token: this.props.token,
                        password: this.getPassword(),
                        captcha: captchaToken
                    })
                }
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('claim account', resp).then(this.setAlert);
                }
            }).then((() => {
                if (handled) { return; }

                this.setAlert(
                    React.createElement(
                        Alert,
                        {
                            type: 'success',
                            title: 'Account Claimed',
                        },
                        'Your account has been claimed. You are going to ' +
                        'be redirected to the login screen in 10 seconds, ' +
                        'but feel free to navigate there earlier.'
                    )
                );

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = true;
                    return newState;
                });

                setTimeout(function() { window.location.href = '/login.html' }, 10000);
            }).bind(this)).catch(((error) => {
                if (handled) { return; }

                this.setAlert(AlertHelper.createFetchError());
            }).bind(this));
        }
    }

    ClaimFormWithLogic.propTypes = {
        userId: PropTypes.number.isRequired,
        token: PropTypes.string.isRequired
    };

    return [ClaimForm, ClaimFormWithLogic];
})();
