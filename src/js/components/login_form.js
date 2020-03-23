const [LoginForm, LoginFormWithLogic] = (function() {
    /**
     * A simple login form. Contains a username and password field and a submit
     * button. This doesn't do the actual logic of logging in, just the
     * rendering.
     *
     * @param {function} usernameQuery A function which we call after mounting
     *   with a function which accepts no arguments and returns the current
     *   username.
     * @param {function} usernameSet A function which we call after mounting
     *   with a function which accepts a string and sets the username to that
     *   value
     * @param {function} passwordQuery A function which we call after mounting
     *   with a function which accepts no arguments and returns the current
     *   password
     * @param {function} passwordSet A function which we call after mounting
     *   with a function which accepts a string and sets the password to that
     *   value
     * @param {function} captchaQuery A function which we call after mounting
     *   with a function which accepts no arguments and returns the current
     *   captcha token.
     * @param {function} captchaClear A function which we call after mounting
     *   with a function which accepts no arguments and clears the captcha.
     * @param {function} submit A function which we call when this form is
     *   submitted. It is passed the submit event.
     * @param {bool} disabled True if the login button should be disabled,
     *   false or null otherwise
     */
    class LoginForm extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                showPassword: false
            };

            this.formRef = React.createRef();
            this.showPasswordRef = React.createRef();
        }

        render() {
            return React.createElement(
                'form', {ref: this.formRef}, [
                    React.createElement(FormElement, {
                        key: 'username', component: TextInput, labelText: 'Username',
                        componentArgs: {textQuery: this.props.usernameQuery, textSet: this.props.usernameSet}
                    }),
                    React.createElement(FormElement, {
                        key: 'password', component: TextInput, labelText: 'Password',
                        componentArgs: {type: this.state.showPassword ? 'text' : 'password', textQuery: this.props.passwordQuery, textSet: this.props.passwordSet}
                    }),
                    React.createElement(Captcha, {
                        key: 'captcha',
                        tokenGet: this.props.captchaQuery,
                        tokenClear: this.props.captchaClear
                    }),
                    React.createElement(Button, {
                        key: 'submit', type: 'submit', style: 'primary', text: 'Login',
                        onClick: ((e) => {
                            if(this.props.submit) {
                                this.props.submit(e);
                            }
                        }).bind(this),
                        disabled: this.props.disabled
                    }),
                    React.createElement(Button, {
                        key: 'toggle-pass', type: 'button', style: 'secondary',
                        text: (this.state.showPassword ? 'Hide Password' : 'Show Password'),
                        onClick: this.toggleShowPassword.bind(this)
                    })
                ]
            );
        }

        componentDidMount() {
            if(this.submit) {
                this.formRef.current.addEventListener('submit', ((e) => this.props.submit(e)).bind(this));
            }
        }

        toggleShowPassword(e) {
            this.setState({showPassword: !this.state.showPassword});
        }
    }

    LoginForm.propTypes = {
        usernameQuery: PropTypes.func,
        usernameSet: PropTypes.func,
        passwordQuery: PropTypes.func,
        passwordSet: PropTypes.func,
        captchaQuery: PropTypes.func,
        cpatchaClear: PropTypes.func,
        submit: PropTypes.func,
        disabled: PropTypes.bool
    };

    /**
     * A wrapper around the login form that uses the default implementation;
     * the username and password are forwarded to /api/users/login and, on
     * success, the resulting password token and user id to rl-authtoken and
     * rl-user-id respectively in the session storage.
     *
     * Upon a successful login, users are redirected toward to the home screen.
     */
    class LoginFormWithLogic extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                alert: null,
                disabled: false
            };
            this.getUsername = null;
            this.getPassword = null;
            this.getToken = null;
            this.clearToken = null;
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
                        LoginForm,
                        {
                            key: 'login-form',
                            usernameQuery: ((gtr) => this.getUsername = gtr).bind(this),
                            passwordQuery: ((gtr) => this.getPassword = gtr).bind(this),
                            captchaQuery: ((gtr) => this.getToken = gtr).bind(this),
                            captchaClear: ((clr) => this.clearToken = clr).bind(this),
                            submit: this.onSubmit.bind(this),
                            disabled: this.state.disabled
                        }
                    )
                ])
            );
        }

        onSubmit(e) {
            e.preventDefault();
            if(this.state.disabled) { return; }

            let username = this.getUsername();
            let password = this.getPassword();
            let token = this.getToken();

            console.log(`Logging in as ${username} (use captcha? ${!!token})`);
            this.setState({
                alert: {
                    type: 'info',
                    title: 'Logging in..',
                    text: (
                        'A request is being sent to the server to login on that ' +
                        'account.' + (
                            token ? '' : ' You opted out of the captcha and will be ' +
                            'subject to more stringent rate-limiting.'
                        )
                    )
                },
                disabled: true
            });

            api_fetch(
                '/api/users/login',
                {
                    method: 'POST',
                    credentials: 'omit',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        captcha_token: token
                    })
                }
            ).then((resp) => {
                if(resp.status === 429) {
                    console.log('Got ratelimited while logging in');
                    return Promise.reject(
                        'The server ratelimited the request. Try again in a ' +
                        'few minutes.'
                    );
                }else if(resp.status === 503) {
                    console.log('Temporarily unavailable while logging in');
                    return Promise.reject(
                        'All login servers are currently busy. Wait a few ' +
                        'minutes and try again.'
                    );
                }else if(resp.status === 400) {
                    console.log('Server rejected the arguments');
                    return Promise.reject(
                        'The server rejected the username and password as ' +
                        'malformed or potentially malicious. Double check them ' +
                        'and try again, or contact the moderators by sending ' +
                        'a PM to /r/borrow.'
                    );
                }else if(resp.status === 403) {
                    console.log('Bad username/password/token combination');
                    return Promise.reject(
                        'That username/password combination was not recognized or you failed the captcha.'
                    );
                }else if (resp.status < 200 || resp.status > 299) {
                    console.log(`Server gave unexpected response while using claim token: ${resp.status}`);
                    return Promise.reject(resp.status + ': ' + resp.statusText);
                }else {
                    return resp.json();
                }
            }).then(((data) => {
                sessionStorage.setItem('rl-authtoken', data.token);
                sessionStorage.setItem('rl-user-id', data.user_id);
                this.setState(
                    {
                        alert: {
                            type: 'success',
                            title: 'Login Successful',
                            text: (
                                'The login was successful. You will be redirected ' +
                                'to the home page in 10 seconds, but feel free to ' +
                                'navigate away sooner.'
                            )
                        },
                        disabled: true
                    }
                );
                setTimeout(function() { window.location.href = '/' }, 10000);
            }).bind(this)).catch(((error) => {
                console.log(error);

                this.clearToken();
                this.setState(
                    {
                        alert: {
                            type: 'error',
                            title: 'Login Failed',
                            text: error.toString()
                        },
                        disabled: true
                    }
                );

                setTimeout((function() {
                    this.setState({
                        alert: this.state.alert,
                        disabled: false
                    })
                }).bind(this), 1000)
            }).bind(this));
        }
    }

    LoginFormWithLogic.propTypes = {};

    return [LoginForm, LoginFormWithLogic];
})();