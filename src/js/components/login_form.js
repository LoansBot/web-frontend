const LoginForm = (function() {
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
     * @param {function} submit A function which we call when this form is
     *   submitted. It is passed the submit event.
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
                    React.createElement(Button, {
                        key: 'submit', type: 'submit', style: 'primary', text: 'Login'
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
        submit: PropTypes.func
    };

    return LoginForm;
})();