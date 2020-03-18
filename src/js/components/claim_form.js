const [ClaimForm, ClaimFormWithLogic] = (function() {
    /**
     * Displays the visuals for the claim form. This doesn't handle any of the
     * logic, just exposes the necessary listeners and handles the client-side
     * validations.
     *
     * @param {function} passwordQuery A function which we call with a function
     *   that returns the password that the user has put in.
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
        }

        render() {
            return React.createElement(
                'form',
                {ref: this.formRef},
                [
                    React.createElement(FormElement, {
                        key: 'password', component: TextInput, labelText: 'Password',
                        componentArgs: {
                            type: this.state.showPassword ? 'text' : 'password',
                            textQuery: ((qry) => {
                                if(this.props.passwordQuery) {
                                    this.props.passwordQuery(qry);
                                }
                                this.passwordQuery = qry;
                            }).bind(this),
                            textChanged: this.onPasswordChanged.bind(this)
                        }
                    }),
                    React.createElement(Button, {
                        key: 'submit', type: 'submit', style: 'primary', text: 'Claim Account',
                        disabled: this.state.disabled,
                        onClick: ((e) => {
                            if(this.props.submit) {
                                this.props.submit(e);
                            }
                        }).bind(this)
                    }),
                    React.createElement(Button, {
                        key: 'toggle-pass', type: 'button', style: 'secondary',
                        text: (this.state.showPassword ? 'Hide Password' : 'Show Password'),
                        onClick: this.toggleShowPassword.bind(this)
                    })
                ]
            )
        }

        componentDidMount() {
            if(this.submit) {
                this.formRef.current.addEventListener('submit', ((e) => this.props.submit(e)).bind(this));
            }
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
        submit: PropTypes.func
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
                alert: null,
                disabled: false
            };
            this.getPassword = null;
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                (this.state.alert ? [
                    React.createElement(
                        Alert,
                        {
                            key: 'alert',
                            title: this.state.alert.title,
                            type: this.state.alert.type,
                            text: this.state.alert.text
                        }
                    )
                ] : []).concat([
                    React.createElement(
                        ClaimForm,
                        {
                            key: 'claim-form',
                            passwordQuery: ((gtr) => this.getPassword = gtr).bind(this),
                            submit: this.onSubmit.bind(this),
                            disabled: this.state.disabled
                        }
                    )
                ])
            );
        }

        onSubmit(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log(`Claiming the account for user ${this.props.userId}..`);
            this.setState({
                alert: {
                    type: 'info',
                    title: 'Claiming account..',
                    text: (
                        'A request is being sent to the server to claim that ' +
                        'account.'
                    )
                },
                disabled: true
            });

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
                        recaptcha_token: 'todo'
                    })
                }
            ).then((resp) => {
                if(resp.status === 429) {
                    console.log('Got ratelimited while using the claim token');
                    return Promise.reject(
                        'The server ratelimited the request. That means there have ' +
                        'been too many attempts to claim that account recently. Wait ' +
                        'a few minutes and try again. If it does not work, please ' +
                        'contact the moderators of /r/borrow by sending a pm from ' +
                        'the reddit account you are trying to claim.'
                    );
                }else if(resp.status === 400) {
                    console.log(`Server rejected the arguments, probably the password`);
                    return Promise.reject(
                        'The server rejected the password. Make sure it is ' +
                        'between 6 and 256 characters.'
                    );
                }else if (resp.status < 200 || resp.status > 299) {
                    console.log(`Server gave unexpected response while using claim token: ${resp.status}`);
                    return Promise.reject(resp.status + ': ' + resp.statusText);
                }else {
                    return resp;
                }
            }).then((() => {
                this.setState(
                    {
                        alert: {
                            type: 'success',
                            title: 'Account Claimed',
                            text: (
                                'Your account has been claimed. You are going to ' +
                                'be redirected to the login screen in 10 seconds, ' +
                                'but feel free to navigate there earlier.'
                            )
                        },
                        disabled: true
                    }
                );
                setTimeout(function() { window.location.href = '/login.html' }, 10000);
            }).bind(this)).catch(((error) => {
                console.log(error);

                this.setState(
                    {
                        alert: {
                            type: 'error',
                            title: 'Signup Failed',
                            text: error.toString()
                        },
                        disabled: true
                    }
                );
            }).bind(this));
        }
    }

    ClaimFormWithLogic.propTypes = {
        userId: PropTypes.number.isRequired,
        token: PropTypes.string.isRequired
    };

    return [ClaimForm, ClaimFormWithLogic];
})();