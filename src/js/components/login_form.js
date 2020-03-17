const LoginForm = (function() {
    /**
     * A simple login form. Contains a username and password field and a submit
     * button.
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
            this.formRef = React.createRef();
        }

        render() {
            return React.createElement(
                'form', {ref: this.formRef}, [
                    React.createElement('label', {key: 'username', className: 'form-label'}, [
                        React.createElement('span', {key: 'label', className: 'form-label-text'}, 'Username'),
                        React.createElement(TextInput, {key: 'input', textQuery: this.props.usernameQuery, textSet: this.props.usernameSet}, null)
                    ]),
                    React.createElement('label', {key: 'password'}, [
                        React.createElement('span', {key: 'label', className: 'form-label-text'}, 'Password'),
                        React.createElement(TextInput, {key: 'input', type: 'password', textQuery: this.props.passwordQuery, textSet: this.props.passwordSet}, null)
                    ]),
                    React.createElement(Button, {key: 'submit', type: 'submit', style: 'primary', text: 'Login'})
                ]
            );
        }

        componentDidMount() {
            if(this.submit) {
                this.formRef.current.addEventListener('submit', ((e) => this.props.submit(e)).bind(this));
            }
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