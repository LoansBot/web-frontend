const SignupForm = (function() {
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
                        componentArgs: {textQuery: this.props.usernameQuery, textSet: this.props.usernameSet}
                    }),
                    React.createElement(Button, {
                        key: 'submit', type: 'submit', style: 'primary', text: 'Signup'
                    })
                ]
            );
        }

        componentDidMount() {
            if(this.submit) {
                this.formRef.current.addEventListener('submit', ((e) => this.props.submit(e)).bind(this));
            }
        }
    }

    SignupForm.propTypes = {
        usernameQuery: PropTypes.func,
        usernameSet: PropTypes.func,
        submit: PropTypes.func
    };

    return SignupForm;
})();