const EditLoanFormWithLogic = (function() {
    /**
     * A form which allows editing all the standard attributes on a loan.
     *
     * @param {string} currencyCode The currency symbol for the loan that is
     *   being edited.
     * @param {string} submitStyle Describes the state of the button. One of
     *   "enabled", "in-progress"
     * @param {function} onSubmit A function we call with two arguments; the
     *   first of which is always the string "standard", and the second of
     *   which is an object with the following values:
     *   {number} principal Null if the principal should be unchanged,
     *     otherwise the new principal amount in the minor denomination.
     *   {number} principal_repayment Null if the principal repayment should
     *     be unchanged, otherwise the new principal repayment amount in the
     *     minor denomination.
     *   {bool} unpaid Null if the unpaid status should be unchanged, otherwise
     *     true if the loan should be marked unpaid and false otherwise.
     *   {Date} createdAt Null if the created at date should be unchanged,
     *     otherwise the new created at date for the loan
     *   {bool} deleted Null if the deleted status should be unchanged,
     *     otherwise true if the loan should now be considered deleted adn
     *     false otherwise
     *   {string} reason The reason for the edit that the user put
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
            this.reasonFocus = null;
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
                                        datetimeQuery: ((query) => this.createdAtQuery = query).bind(this)
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
                                textQuery: ((query) => this.reasonQuery = query),
                                focus: ((fcs) => this.reasonFocus = fcs)
                            }
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit-button',
                            style: 'primary',
                            type: 'submit',
                            disabled: this.props.submitStyle !== 'enabled',
                            text: (() => {
                                if (this.props.submitStyle === 'in-progress') {
                                    return 'Submitting Change...';
                                }

                                return 'Submit Change';
                            })(),
                            onClick: this.onSubmit.bind(this)
                        }
                    )
                ]
            )
        }

        onSubmit() {
            if (!this.props.onSubmit) { return; }

            let reason = this.reasonQuery();
            if (!reason || reason.length < 5) {
                console.log('reason too short');
                this.reasonFocus();
                return;
            }

            this.props.onSubmit(
                'standard',
                {
                    principal: this.principalEnabledQuery() ? this.principalQuery() : null,
                    principalRepayment: this.principalRepaymentEnabledQuery() ? this.principalRepaymentQuery() : null,
                    unpaid: this.unpaidEnabledQuery() ? this.unpaidQuery() : null,
                    createdAt: this.createdAtEnabledQuery() ? this.createdAtQuery() : null,
                    deleted: this.deletedEnabledQuery() ? this.deletedQuery() : null,
                    reason: reason
                }
            );
        }
    };

    StandardEditForm.propTypes = {
        currencyCode: PropTypes.string.isRequired,
        submitStyle: PropTypes.string.isRequired,
        onSubmit: PropTypes.func
    };

    /**
     * Change which users were involved in a loan. This involves deleting this
     * loan then creating a new loan with the same state but the new set of
     * involved users.
     *
     * @param {function} onSubmit A fucntion which we call with two arguments;
     *   the first of which is always the string "users", and the second of
     *   which is an object with the following values:
     *   {string} lender What the lender username should be for the loan.
     *   {string} borrower What the borrower username should be for the loan.
     *   {string} reason The reason we needed to make this modification.
     */
    class ChangeUsersForm extends React.Component {
        constructor(props) {
            super(props);

            this.lenderQuery = null;
            this.lenderFocus = null;
            this.borrowerQuery = null;
            this.borrowerFocus = null;
            this.reasonQuery = null;
            this.reasonFocus = null;
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
                                textQuery: ((query) => this.lenderQuery = query).bind(this),
                                focus: ((fcs) => this.lenderFocus = fcs).bind(this)
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
                                textQuery: ((query) => this.borrowerQuery = query).bind(this),
                                focus: ((fcs) => this.borrowerFocus = fcs).bind(this)
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
                                textQuery: ((query) => this.reasonQuery = query).bind(this),
                                focus: ((fcs) => this.reasonFocus = fcs).bind(this)
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
            let lender = this.lenderQuery().trim();
            let borrower = this.borrowerQuery().trim();
            let reason = this.reasonQuery().trim();

            if (lender.startsWith('/u/')) {
                lender = lender.substring(3);
            }

            if (lender.startsWith('u/')) {
                lender = lender.substring(2);
            }

            if (borrower.startsWith('/u/')) {
                borrower = borrower.substring(3);
            }

            if (borrower.startsWith('u/')) {
                borrower = borrower.substring(2);
            }

            if (lender.length < 3) {
                this.lenderFocus();
                return;
            }

            if (borrower.length < 3) {
                this.borrowerFocus();
                return;
            }

            if (reason.length < 5) {
                this.reasonFocus();
                return;
            }

            if (!this.props.onSubmit) {
                return;
            }

            this.props.onSubmit('users', {
                lender: lender,
                borrower: borrower,
                reason: reason
            });
        }
    };

    ChangeUsersForm.propTypes = {
        onSubmit: PropTypes.func
    }

    /**
     * Change the currency for a loan. Must specify the new principal and
     * principal repayment in the new currency. To avoid every loan query
     * needing to check for currencies switching, this involves deleting this
     * loan and creating a new one with the same users.
     *
     * @param {function} onSubmit A function which we call with two arguments;
     *   the first of which is always the string "currency" and the second of
     *   which is an object with the following values:
     *   {string} currency The new currency for the loan
     *   {number} principal The new principal for the loan in the minor
     *     denomination of the new currency.
     *   {number} principalRepayment The new principal repayment for the loan
     *     in the minor denomination of the new currency
     *   {string} reason The reason we needed to make this modification
     */
    class ChangeCurrencyForm extends React.Component {
        constructor(props) {
            super(props);

            this.currencyQuery = null;
            this.principalQuery = null;
            this.principalFocus = null;
            this.principalRepaymentQuery = null;
            this.principalRepaymentFocus = null;
            this.reasonQuery = null;
            this.reasonFocus = null;
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
                                textQuery: ((query) => this.principalQuery = query).bind(this),
                                focus: ((fcs) => this.principalFocus = fcs).bind(this)
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
                                textQuery: ((query) => this.principalRepaymentQuery = query).bind(this),
                                focus: ((fcs) => this.principalRepaymentFocus = fcs).bind(this)
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
                                textQuery: ((query) => this.reasonQuery = query).bind(this),
                                focus: ((fcs) => this.reasonFocus = fcs).bind(this)
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
            let currency = this.currencyQuery();
            let principal = this.principalQuery();
            let principalRepayment = this.principalRepaymentQuery();
            let reason = this.reasonQuery();

            if (!principal) {
                this.principalFocus();
                return;
            }

            if (!principalRepayment) {
                this.principalRepaymentFocus();
                return;
            }

            if (!reason) {
                this.reasonFocus();
                return;
            }
            reason = reason.trim();
            if (reason.length < 5) {
                this.reasonFocus();
                return;
            }

            if (!this.props.onSubmit) {
                return;
            }

            this.props.onSubmit(
                'currency',
                {
                    currency: currency,
                    principal: principal,
                    principalRepayment: principalRepayment,
                    reason: reason
                }
            )
        }
    };

    ChangeCurrencyForm.propTypes = {
        onSubmit: PropTypes.func
    }

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
     * @param {string} submitStyle Determines the state of the submit button.
     *   One of "enabled", "in-progress"
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
                                submitStyle: this.props.submitStyle,
                                onSubmit: this.props.onSubmit
                            }
                        )
                    )
                ]
            )
        }
    };

    EditLoanForm.propTypes = {
        currencyCode: PropTypes.string.isRequired,
        submitStyle: PropTypes.string.isRequired,
        onSubmit: PropTypes.func
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
                etag: null,
                timeout: null,
                _alert: null,
                requestInProgress: false
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
                return res.json().then((json) => {
                    return Promise.resolve([json, res.headers.get('etag')]);
                });
            }).then((arr) => {
                let [json, etag] = arr;
                let newState = Object.assign({}, this.state);
                newState.desiredDisplayState = 'closed';
                newState.timeout = setTimeout((() => {
                    let newState2 = Object.assign({}, this.state);
                    newState2.currencyCode = json.currency_code;
                    newState2.etag = etag;
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
                            submitStyle: this.state.requestInProgress ? 'in-progress' : 'enabled',
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

        onSubmit(typ, inf) {
            if (this.state.requestInProgress) {
                return;
            }
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.requestInProgress = true;
                return newState;
            });

            if (typ === 'standard') {
                api_fetch(
                    `/api/loans/${this.props.loanId}`,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'If-Match': this.state.etag
                        },
                        body: JSON.stringify({
                            principal_minor: inf.principal,
                            principal_repayment_minor: inf.principalRepayment,
                            unpaid: inf.unpaid,
                            created_at: inf.createdAt ? (inf.createdAt.getTime() / 1000.0) : null,
                            deleted: inf.deleted,
                            reason: inf.reason
                        })
                    })
                ).then((res) => {
                    if (res.ok) {
                        if (this.state.timeout) {
                            clearTimeout(this.state.timeout);
                        }
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState._alert = {
                                title: 'Success',
                                type: 'success',
                                text: 'Successfully changed loan. Please wait a few seconds...'
                            };
                            return newState;
                        });
                        var seenSumm = false;
                        var seenDets = false;
                        api_fetch(
                            `/api/loans/${this.props.loanId}`, AuthHelper.auth({
                                headers: {
                                    'Cache-Control': 'no-cache'
                                }
                            })
                        ).then((res) => {
                            if (seenDets) {
                                window.location.reload();
                            } else {
                                seenSumm = true;
                            }
                        });

                        api_fetch(
                            `/api/loans/${this.props.loanId}/detailed`, AuthHelper.auth({
                                headers: {
                                    'Cache-Control': 'no-cache'
                                }
                            })
                        ).then((res) => {
                            if (seenSumm) {
                                window.location.reload();
                            } else {
                                seenDets = true;
                            }
                        });
                    } else if (res.status === 412) {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState._alert = {
                                title: 'Loan Changed',
                                type: 'warning',
                                text: 'This loan was modified since you loaded the page. Refresh the page.'
                            };
                            return newState;
                        });
                    } else if (res.status === 401 || res.status === 403) {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState._alert = {
                                title: 'Auth Failed',
                                type: 'warning',
                                text: 'The server rejected your credentials. Probably need to login again.'
                            }
                        })
                    } else {
                        console.log(res);
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState._alert = {
                                title: `${res.status}: ${res.statusText || 'Error'}`,
                                type: 'error',
                                text: 'Something went wrong. Try again or contact the site administrator.'
                            };
                            newState.requestInProgress = false;
                            return newState;
                        });
                    }
                });
            } else if (typ === 'users') {
                api_fetch(
                    `/api/loans/${this.props.loanId}/users`,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'If-Match': this.state.etag
                        },
                        body: JSON.stringify({
                            lender_name: inf.lender,
                            borrower_name: inf.borrower,
                            reason: inf.reason
                        })
                    })
                ).then((res) => {
                    if (res.ok) {
                        return res.json();
                    }

                    if (res.status === 422) {
                        return res.json().then((v) => {
                            return Promise.reject(
                                {
                                    title: 'Invalid Request',
                                    type: 'warning',
                                    text: v.detail.map((det) => {
                                        let locStr = det.loc.join('.');
                                        return `${locStr}: ${det.msg}`;
                                    }).join(". ") + '.'
                                }
                            );
                        });
                    }

                    if (res.status === 401 || res.status === 403) {
                        return Promise.reject(
                            {
                                title: res.status === 401 ? 'Unauthorized' : 'Forbidden',
                                type: 'warning',
                                text: 'You need to login again or you do not have permission to do this.'
                            }
                        );
                    }

                    if (res.status === 410) {
                        return Promise.reject(
                            {
                                title: 'Gone',
                                type: 'error',
                                text: 'This loan was permanently deleted. This is very unusual.'
                            }
                        );
                    }

                    if (res.status === 412) {
                        return Promise.reject(
                            {
                                title: 'Changed',
                                type: 'warning',
                                text: 'The loan changed since this page was loaded. Refresh the page and try again.'
                            }
                        );
                    }

                    return Promise.reject(
                        {
                            title: `${res.status}: ${res.statusText || 'Unknown'}`,
                            type: 'error',
                            text: (
                                'We received an unexpected failure response. Check your internet ' +
                                'connection, try again later, or contact the site administrator.'
                            )
                        }
                    );
                }).then((json) => {
                    let newLoanId = json.loan_id;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState._alert = {
                            title: 'Loan Created',
                            type: 'success',
                            text: (
                                `This loan was deleted and we created loan ${newLoanId}. We will ` +
                                'redirect in a few seconds, but you can reload the page to avoid ' +
                                'being redirected or search for the new loan directly to get there ' +
                                'faster.'
                            )
                        };
                        return newState;
                    });
                    let seen = [false, false, false];
                    setTimeout(() => {
                        seen[0] = true;
                        if (!seen.includes(false)) {
                            window.location.href = `/loan.html?id=${newLoanId}`;
                        }
                    }, 5000);

                    api_fetch(
                        `/api/loans/${this.props.loanId}`,
                        AuthHelper.auth({
                            headers: { 'Cache-Control': 'no-cache' }
                        })
                    ).then(() => {
                        seen[1] = true;
                        if (!seen.includes(false)) {
                            window.location.href = `/loan.html?id=${newLoanId}`;
                        }
                    });

                    api_fetch(
                        `/api/loans/${this.props.loanId}/detailed`,
                        AuthHelper.auth({
                            headers: { 'Cache-Control': 'no-cache' }
                        })
                    ).then(() => {
                        seen[2] = true;
                        if (!seen.includes(false)) {
                            window.location.href = `/loan.html?id=${newLoanId}`;
                        }
                    });
                }).catch((alrt) => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState._alert = alrt;
                        newState.requestInProgress = false;
                        return newState;
                    });
                });
            } else if (typ === 'currency') {
                api_fetch(
                    `/api/loans/${this.props.loanId}/currency`,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'If-Match': this.state.etag
                        },
                        body: JSON.stringify({
                            currency_code: inf.currency,
                            principal_minor: inf.principal,
                            principal_repayment_minor: inf.principalRepayment,
                            reason: inf.reason
                        })
                    })
                ).then((res) => {
                    if (res.ok) {
                        return res.json();
                    }

                    if (res.status === 422) {
                        return res.json().then((v) => {
                            return Promise.reject(
                                {
                                    title: 'Invalid Request',
                                    type: 'warning',
                                    text: v.detail.map((det) => {
                                        let locStr = det.loc.join('.');
                                        return `${locStr}: ${det.msg}`;
                                    }).join(". ") + '.'
                                }
                            );
                        });
                    }

                    if (res.status === 401 || res.status === 403) {
                        return Promise.reject(
                            {
                                title: res.status === 401 ? 'Unauthorized' : 'Forbidden',
                                type: 'warning',
                                text: 'You need to login again or you do not have permission to do this.'
                            }
                        );
                    }

                    if (res.status === 410) {
                        return Promise.reject(
                            {
                                title: 'Gone',
                                type: 'error',
                                text: 'This loan was permanently deleted. This is very unusual.'
                            }
                        );
                    }

                    if (res.status === 412) {
                        return Promise.reject(
                            {
                                title: 'Changed',
                                type: 'warning',
                                text: 'The loan changed since this page was loaded. Refresh the page and try again.'
                            }
                        );
                    }

                    return Promise.reject(
                        {
                            title: `${res.status}: ${res.statusText || 'Unknown'}`,
                            type: 'error',
                            text: (
                                'We received an unexpected failure response. Check your internet ' +
                                'connection, try again later, or contact the site administrator.'
                            )
                        }
                    );
                }).then((json) => {
                    let newLoanId = json.loan_id;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState._alert = {
                            title: 'Loan Created',
                            type: 'success',
                            text: (
                                `This loan was deleted and we created loan ${newLoanId}. We will ` +
                                'redirect in a few seconds, but you can reload the page to avoid ' +
                                'being redirected or search for the new loan directly to get there ' +
                                'faster.'
                            )
                        };
                        return newState;
                    });
                    let seen = [false, false, false];
                    setTimeout(() => {
                        seen[0] = true;
                        if (!seen.includes(false)) {
                            window.location.href = `/loan.html?id=${newLoanId}`;
                        }
                    }, 5000);

                    api_fetch(
                        `/api/loans/${this.props.loanId}`,
                        AuthHelper.auth({
                            headers: { 'Cache-Control': 'no-cache' }
                        })
                    ).then(() => {
                        seen[1] = true;
                        if (!seen.includes(false)) {
                            window.location.href = `/loan.html?id=${newLoanId}`;
                        }
                    });

                    api_fetch(
                        `/api/loans/${this.props.loanId}/detailed`,
                        AuthHelper.auth({
                            headers: { 'Cache-Control': 'no-cache' }
                        })
                    ).then(() => {
                        seen[2] = true;
                        if (!seen.includes(false)) {
                            window.location.href = `/loan.html?id=${newLoanId}`;
                        }
                    });
                }).catch((alrt) => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState._alert = alrt;
                        newState.requestInProgress = false;
                        return newState;
                    });
                });
            }
        }
    };

    EditLoanFormWithLogic.propTypes = {
        loanId: PropTypes.number.isRequired
    };

    return EditLoanFormWithLogic;
})();