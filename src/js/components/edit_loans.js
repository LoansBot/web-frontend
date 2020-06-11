const EditLoanFormWithLogic = (function() {
    /**
     * A form which allows editing all the standard attributes on a loan.
     *
     * @param {string} currencyCode The currency symbol for the loan that is
     *   being edited.
     * @param {function} onSubmit
     */
    class StandardEditForm extends React.Component {
        constructor(props) {
            super(props);

            this.principalEnabledQuery = null;
            this.principalQuery = null;
            this.principalRepaymentEnabledQuery = null;
            this.principalRepaymentQuery = null;
            this.unpaidEnabledQuery = null;
            this.unpaidQuery = null;
            this.createdAtEnabledQuery = null;
            this.createdAtQuery = null;
            this.deletedEnabledQuery = null;
            this.deletedQuery = null;
            this.reasonQuery = null;
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        Alert,
                        {
                            key: 'info',
                            title: 'Information',
                            type: 'info',
                            text: (
                                'This edit style will simply modify the above loan. These edits ' +
                                'behave the most intuitively and cover most situations. You can ' +
                                'perform any combination of the following edits in one operation. ' +
                                'We will store that you made this edit, and users will be able to ' +
                                'see that this operation was done when viewing the loan. Only users ' +
                                'with the view_admin_event_authors permission will be able to see that ' +
                                'you specifically made this edit and what reason you provided.'
                            )
                        }
                    ),
                    React.createElement(
                        ToggledElement,
                        {
                            key: 'principal',
                            labelText: 'Edit Principal',
                            enabledQuery: ((query) => this.principalEnabledQuery = query).bind(this)
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'info',
                                    title: 'Information',
                                    type: 'info',
                                    text: (
                                        'This value is in the currencies minor denomination, i.e., ' +
                                        'for USD this value is in cents. For USD a value of 100 means $1.00. ' +
                                        'This value cannot be less than the repayment after this update. This ' +
                                        `loan is in ${this.props.currencyCode}.`
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'field',
                                    labelText: 'New Principal',
                                    component: TextInput,
                                    componentArgs: {
                                        type: 'number',
                                        min: 1,
                                        step: 1,
                                        textQuery: ((query) => this.principalQuery = query).bind(this)
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        ToggledElement,
                        {
                            key: 'principal-repayment',
                            labelText: 'Edit Principal Repayment',
                            enabledQuery: ((query) => this.principalRepaymentEnabledQuery = query).bind(this)
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'info',
                                    title: 'Information',
                                    type: 'info',
                                    text: (
                                        'This value is in the currencies minor denomination, i.e., ' +
                                        'for USD this value is in cents. For USD a value of 100 means $1.00. ' +
                                        'This value cannot be more than the principal after this update. This ' +
                                        `loan is in ${this.props.currencyCode}.`
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'field',
                                    labelText: 'New Principal Repayment',
                                    component: TextInput,
                                    componentArgs: {
                                        type: 'number',
                                        min: 0,
                                        step: 1,
                                        textQuery: ((query) => this.principalRepaymentQuery = query).bind(this)
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        ToggledElement,
                        {
                            key: 'unpaid',
                            labelText: 'Edit Unpaid Status',
                            enabledQuery: ((query) => this.unpaidEnabledQuery = query).bind(this)
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'info',
                                    title: 'Information',
                                    type: 'info',
                                    text: (
                                        'The unpaid status will be set to the value of the New Unpaid ' +
                                        'checkbox. A loan cannot be simultaneously Repaid and Unpaid, ' +
                                        'so this can only be checked if the principal repayment will be ' +
                                        'lower than the principal after this edit.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'field',
                                    labelText: 'New Unpaid',
                                    component: CheckBox,
                                    componentArgs: {
                                        checkedQuery: ((query) => this.unpaidQuery = query).bind(this)
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        ToggledElement,
                        {
                            key: 'created-at',
                            labelText: 'Edit Loan Created At Date',
                            enabledQuery: ((query) => this.createdAtEnabledQuery = query).bind(this)
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'info',
                                    title: 'Information',
                                    type: 'info',
                                    text: (
                                        'The created date will change to the specified time. This ' +
                                        'is typically used for back-dating a loan if there was an ' +
                                        'issue with the lenders initial $loan command that was not ' +
                                        'spotted for a while.'
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'field',
                                    labelText: 'New Loan Created At',
                                    component: DateTimePicker,
                                    componentArgs: {
                                        dateTimeQuery: ((query) => this.createdAtQuery = query).bind(this)
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        ToggledElement,
                        {
                            key: 'deleted',
                            labelText: 'Edit Deleted Status',
                            enabledQuery: ((query) => this.deletedEnabledQuery = query).bind(this)
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'info',
                                    title: 'Information',
                                    type: 'info',
                                    text: (
                                        'The deleted status will be set to the value of the New Deleted ' +
                                        'checkbox. Only users with the view_deleted_loans permission ' +
                                        'can see deleted loans on the website, and these loans are ' +
                                        'always hidden on reddit. A deleted loan will not count toward ' +
                                        'any statistics. Deleting a loan is reversible. '
                                    )
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'field',
                                    labelText: 'New Deleted',
                                    component: CheckBox,
                                    componentArgs: {
                                        checkedQuery: ((query) => this.deletedQuery = query).bind(this)
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'reason-info',
                            title: 'Information',
                            type: 'info',
                            text: (
                                'You must specify a reason for why you made this edit. In general ' +
                                'only moderators can see this. Usually just a link to the modmail ' +
                                'thread is perfect. Avoid just linking comments from users, since ' +
                                'if they delete or edit their comment it the context for this edit ' +
                                'can be lost.'
                            )
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'reason',
                            labelText: 'Reason For Edit',
                            component: TextArea,
                            componentArgs: {
                                textQuery: ((query) => this.reasonQuery = query)
                            }
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit-button',
                            style: 'primary',
                            type: 'submit',
                            text: 'Submit Change',
                            onClick: this.onSubmit.bind(this)
                        }
                    )
                ]
            )
        }

        onSubmit() {
            // TODO parse params to this.props.onSubmit
        }
    };

    /**
     * Change which users were involved in a loan. This involves deleting this
     * loan then creating a new loan with the same state but the new set of
     * involved users.
     *
     * @param {function} onSubmit
     */
    class ChangeUsersForm extends React.Component {
        constructor(props) {
            super(props);

            this.lenderQuery = null;
            this.borrowerQuery = null;
            this.reasonQuery = null;
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        Alert,
                        {
                            key: 'info',
                            title: 'Information',
                            text: (
                                'This edit style allows you to move a loan to a different pair of ' +
                                'users. This should be done with some care; if it is not too painful ' +
                                'to just explicitly delete the loan and have the lender recreate it, then ' +
                                'backdate the loan as appropriate, it will be easier to understand what ' +
                                'happened and why. Triple check the usernames!'
                            ),
                            type: 'info'
                        }
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'info-2',
                            title: 'Implementation Details',
                            text: (
                                'This will mark the loan deleted and then create a new loan with ' +
                                'the same information except the users are different. It will ' +
                                'include a link to the new loan in the deleted loans modify reason, and ' +
                                'a link to the old loan in the newly created loans information. This loan ' +
                                'will not reflect changes to the newly created loan moving forward.'
                            ),
                            type: 'info'
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'lender',
                            labelText: 'New Lender Username',
                            component: TextInput,
                            componentArgs: {
                                textQuery: ((query) => this.lenderQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'borrower',
                            labelText: 'New Borrower Username',
                            component: TextInput,
                            componentArgs: {
                                textQuery: ((query) => this.borrowerQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'reason',
                            labelText: 'Reason For Edit',
                            component: TextInput,
                            componentArgs: {
                                textQuery: ((query) => this.reasonQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit-button',
                            style: 'primary',
                            type: 'submit',
                            text: 'Submit Change',
                            onClick: this.onSubmit.bind(this)
                        }
                    )
                ]
            );
        }

        onSubmit() {

        }
    };

    /**
     * Change the currency for a loan. Must specify the new principal and
     * principal repayment in the new currency. To avoid every loan query
     * needing to check for currencies switching, this involves deleting this
     * loan and creating a new one with the same users.
     *
     * @param {function} onSubmit
     */
    class ChangeCurrencyForm extends React.Component {
        constructor(props) {
            super(props);

            this.currencyQuery = null;
            this.principalQuery = null;
            this.principalRepaymentQuery = null;
            this.reasonQuery = null;
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        Alert,
                        {
                            key: 'info',
                            title: 'Information',
                            text: (
                                'This edit style allows you to change the currency a loan is stored in. ' +
                                'This should be done with some care; if it is not too painful ' +
                                'to just explicitly delete the loan and have the lender recreate it, then ' +
                                'backdate the loan as appropriate, it will be easier to understand what ' +
                                'happened and why. Note that you need to specify the new principal and ' +
                                'principal repayment in the new currency.'
                            ),
                            type: 'info'
                        }
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'info-2',
                            title: 'Implementation Details',
                            text: (
                                'This will mark the loan deleted and then create a new loan with ' +
                                'the same information except the currency is different. It will ' +
                                'include a link to the new loan in the deleted loans modify reason, and ' +
                                'a link to the old loan in the newly created loans information. This loan ' +
                                'will not reflect changes to the newly created loan moving forward.'
                            ),
                            type: 'info'
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'currency',
                            labelText: 'New Currency',
                            component: DropDown,
                            componentArgs: {
                                initialOption: 'USD',
                                options: [
                                    'AUD',
                                    'GBP',
                                    'EUR',
                                    'CAD',
                                    'JPY',
                                    'MXN',
                                    'USD'
                                ].map((code) => { return { key: code, text: code }}),
                                optionQuery: ((query) => this.currencyQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'minor-denom-info',
                            title: 'Information - Money Quantities',
                            type: 'info',
                            text: (
                                'Specify the money amounts in the new currencies minor denomination. ' +
                                'So for USD, this is going to be the number of cents, i.e., 100 = $1.00'
                            )
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'principal',
                            labelText: 'New Principal',
                            component: TextInput,
                            componentArgs: {
                                type: 'number',
                                min: 1,
                                step: 1,
                                textChanged: ((query) => this.principalQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'principal-repayment',
                            labelText: 'New Principal Repayment',
                            component: TextInput,
                            componentArgs: {
                                type: 'number',
                                min: 0,
                                step: 1,
                                textChanged: ((query) => this.principalRepaymentQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'reason',
                            labelText: 'Reason For Edit',
                            component: TextInput,
                            componentArgs: {
                                textChanged: ((query) => this.reasonQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit-button',
                            style: 'primary',
                            type: 'submit',
                            text: 'Submit Change',
                            onClick: this.onSubmit.bind(this)
                        }
                    )
                ]
            )
        }

        onSubmit() {

        }
    };

    /**
     * Shows a form that allows editing a loan. An admin can change every field
     * for a loan, however some edits involve effectively deleting the loan and
     * creating a new loan elsewhere.
     *
     * This is a pure UI component, and requires being given the functions that
     * actually do things.
     *
     * This form looks like a dropdown for selecting the style of edit (most
     * edits are just "Standard Edit" and involve updating the loan, but if it
     * requires a different set of API calls it will have a different style of
     * edit).
     *
     * From there the appropriate edit style field is rendered
     *
     * @param {string} currencyCode The current code for the loan that is
     *   being edited.
     * @param {function} onSubmit A function we call with two arguments - the
     *   style of submission (i.e., 'standard', followed by keyword arguments
     *   that depend on the style. See StandardEditForm, ChangeUsersForm, and
     *   ChangeCurrencyForm for details.
     */
    class EditLoanForm extends React.Component {
        constructor(props) {
            super(props);

            this.editStyleQuery = null;
            this.state = {
                editStyle: 'standard',
                bodyDisplayState: 'expanded',
                timeout: null
            }
        }

        render() {
            let editComponent = {
                'standard': StandardEditForm,
                'user': ChangeUsersForm,
                'currency': ChangeCurrencyForm
            }[this.state.editStyle];

            return React.createElement(
                'div',
                {className: 'edit-loan-form'},
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'edit-style-dropdown',
                            labelText: 'Edit Style',
                            component: DropDown,
                            componentArgs: {
                                key: 'edit-style-dropdown',
                                initialOption: 'standard',
                                options: [
                                    {key: 'standard', text: 'Standard'},
                                    {key: 'user', text: 'Change Users'},
                                    {key: 'currency', text: 'Change Currency'}
                                ],
                                optionQuery: ((query) => this.editStyleQuery = query).bind(this),
                                optionChanged: (() => {
                                    if (this.state.timeout) {
                                        clearTimeout(this.state.timeout);
                                    }

                                    let newState = Object.assign({}, this.state);
                                    newState.bodyDisplayState = 'closed';
                                    newState.timeout = setTimeout((() => {
                                        let newState2 = Object.assign({}, this.state);
                                        newState2.bodyDisplayState = 'expanded';
                                        newState2.editStyle = this.editStyleQuery();
                                        newState2.timeout = null;
                                        this.setState(newState2);
                                    }).bind(this), 500);
                                    this.setState(newState);
                                }).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'form',
                            initialState: 'expanded',
                            desiredState: this.state.bodyDisplayState
                        },
                        React.createElement(
                            editComponent,
                            {
                                key: 'form',
                                currencyCode: this.props.currencyCode,
                                onSubmit: this.props.onSubmit
                            }
                        )
                    )
                ]
            )
        }
    };

    EditLoanForm.propTypes = {
        currencyCode: PropTypes.string.isRequired
    };

    /**
     * Loads information on the loan from an Ajax query then shows an edit
     * form for the loan. This will handle submission of the loan with the
     * appropriate ajax queries.
     *
     * @param {number} loanId The id of the loan which is being edited.
     */
    class EditLoanFormWithLogic extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currencyCode: null,
                state: 'loading',
                desiredDisplayState: 'expanded',
                timeout: null,
                _alert: null
            }

            api_fetch(
                `/api/loans/${this.props.loanId}`, AuthHelper.auth()
            ).then((res) => {
                if (!res.ok) {
                    console.log(res);
                    return res.text().then((txt) => {
                        return Promise.reject({status: res.status, statusText: res.statusText, body: txt});
                    });
                }
                return res.json();
            }).then((json) => {
                let newState = Object.assign({}, this.state);
                newState.desiredDisplayState = 'closed';
                newState.timeout = setTimeout((() => {
                    let newState2 = Object.assign({}, this.state);
                    newState2.currencyCode = json.currency_code;
                    newState2.state = 'loaded';
                    newState2.desiredDisplayState = 'expanded';
                    newState2.timeout = null;
                    this.setState(newState2);
                }).bind(this), 500);
                this.setState(newState);
            }).catch((err) => {
                let error = {type: 'error'};
                if (err.status === 404) {
                    error.title = '404: Not Found';
                    error.text = 'This loan does not exist or you do not have permission to view it.'
                } else {
                    error.title = `${err.status}: ${err.statusText}`;
                    error.text = `The following additional information was provided: ${err.body}`;
                }
                this.setState({
                    currencyCode: null,
                    state: 'errored',
                    desiredDisplayState: 'expanded',
                    _alert: error
                })
            });
        }

        render() {
            return React.createElement(
                SmartHeightEased,
                {
                    initialState: 'expanded',
                    desiredState: this.state.desiredDisplayState
                },
                this.renderInner()
            )
        }

        componentWillUnmount() {
            if (this.state.timeout) {
                clearTimeout(this.state.timeout);
            }
        }

        renderInner() {
            if (this.state.state === 'loading') {
                return React.createElement(
                    'div',
                    {className: 'standard-spinner-wrapper'},
                    React.createElement(Spinner)
                );
            }

            if (this.state.state === 'errored') {
                return React.createElement(
                    Alert,
                    this.state._alert
                );
            }

            return React.createElement(
                'div',
                {className: 'edit-loan-form-with-logic'},
                [
                    React.createElement(
                        EditLoanForm,
                        {
                            key: 'form',
                            currencyCode: this.state.currencyCode,
                            onSubmit: this.onSubmit.bind(this)
                        }
                    )
                ].concat(this.state._alert === null ? [] : [
                    /* submit button at bottom makes alerts there more convenient */
                    React.createElement(
                        Alert,
                        (() => {
                            let alertState = Object.assign({}, this.state._alert);
                            alertState.key = 'alert';
                            return alertState;
                        })()
                    )
                ])
            );
        }

        onSubmit() {

        }
    };

    EditLoanFormWithLogic.propTypes = {
        loanId: PropTypes.number.isRequired
    };

    return EditLoanFormWithLogic;
})();