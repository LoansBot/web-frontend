const [SignupForm, SignupFormWithLogic] = (function() {
    /**
     * A simple signup form. Contains a username and password field and a submit
     * button. This doesn't do the actual logic of signing up, just the
     * rendering.
     *
     * @param {function} usernameQuery A function which we call after mounting
     *   with a function which accepts no arguments and returns the current
     *   username.
     * @param {function} usernameSet A function which we call after mounting
     *   with a function which accepts a string and sets the username to that
     *   value
     * @param {function} submit A function which we call when this form is
     *   submitted. It is passed the submit event.
     * @param {bool} disabled True for disabled state, false or null for enabled.
     */
    class SignupForm extends React.Component {
        constructor(props) {
            super(props);

            this.formRef = React.createRef();
        }

        render() {
            return React.createElement(
                'form', {ref: this.formRef}, [
                    React.createElement(FormElement, {
                        key: 'username', component: TextInput, labelText: 'Username',
                        componentArgs: {
                            textQuery: this.props.usernameQuery, textSet: this.props.usernameSet
                        }
                    }),
                    React.createElement(Button, {
                        key: 'submit', type: 'submit', style: 'primary', text: 'Signup',
                        disabled: this.props.disabled, onClick: this.props.submit
                    })
                ]
            );
        }

        componentDidMount() {
            if(this.props.submit) {
                this.formRef.current.addEventListener('submit', ((e) => this.props.submit(e)).bind(this));
            }
        }
    }

    SignupForm.propTypes = {
        usernameQuery: PropTypes.func,
        usernameSet: PropTypes.func,
        submit: PropTypes.func,
        disabled: PropTypes.bool
    };

    /**
     * Wraps a signup form with the default implementation, which is to submit
     * a post request to /api/users/request_claim_token where the arguments
     * are just the username.
     */
    class SignupFormWithLogic extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                alert: null,
                disabled: false
            };
            this.getUsername = null;
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
                        SignupForm,
                        {
                            key: 'signup-form',
                            usernameQuery: ((gtr) => this.getUsername = gtr).bind(this),
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

            let username = this.getUsername();

            console.log(`Requesting claim token for ${username}...`);
            this.setState({
                alert: {
                    type: 'info',
                    title: 'Requesting claim token',
                    text: (
                        'A request is being sent to the server to register that ' +
                        'account.'
                    )
                },
                disabled: true
            });

            api_fetch(
                '/api/users/request_claim_token',
                {
                    method: 'POST',
                    credentials: 'omit',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username: username})
                }
            ).then((resp) => {
                if(resp.status === 429) {
                    console.log(`Got ratelimited while requesting a claim token for ${username}`);
                    return Promise.reject(
                        'The server is not allowing additional claim tokens to ' +
                        'be sent to this account. Check your reddit inbox as it ' +
                        'should have a claim token already. If it does not and ' +
                        'it has been 24 hours since you last requested a claim ' +
                        'token, contact the modmail by sending a pm to /r/borrow ' +
                        `from /u/${username}`
                    );
                }else if(resp.status === 400) {
                    console.log(`Server rejected the username while requesting a claim token for ${username}`);
                    return Promise.reject(
                        'The server does not think that is a valid reddit username. ' +
                        'If you believe this in error, send a pm to /r/borrow ' +
                        `from /u/${username}`
                    );
                }else if (resp.status < 200 || resp.status > 299) {
                    console.log(`Server gave an unexpected response to requesting a claim token for ${username}: ${resp.status_code}`);
                    return Promise.reject(resp.status + ': ' + resp.statusText);
                }else {
                    return resp;
                }
            }).then((() => {
                this.setState(
                    {
                        alert: {
                            type: 'success',
                            title: 'Signup Started',
                            text: (
                                `A reddit message will be sent to /u/${username}. Please allow ` +
                                'up to 24 hours, and if the message is still not received try ' +
                                'again. If you still do not get a response, contact the mods ' +
                                'by sending a PM to /r/borrow'
                            )
                        },
                        disabled: true
                    }
                )
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

    SignupFormWithLogic.propTypes = {};

    return [SignupForm, SignupFormWithLogic];
})();