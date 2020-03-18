const ClaimForm = (function() {
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
            console.log(`render disabled=${this.state.disabled}`)
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
                        disabled: this.state.disabled
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
            console.log('password changed');
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

    };

    return ClaimForm;
})();