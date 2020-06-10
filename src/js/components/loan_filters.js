/*
 * Describes the filters that go into the LoanFilterForm. These avoid
 * re-renders where possible.
 */

const [LoanUserFilter, LoanStateFilter, LoanIDFilter, LoanTimeFilter, LoanDeletedFilter] = (() => {
    /**
     * Allows filtering based on who was involved in the loan, i.e., the lender
     * vs the borrower. By using these callbacks this component never needs to
     * rerender.
     *
     * @param {function} lenderQuery A function which we call with a function
     *   which returns the current value of the lender field.
     * @param {function} lenderChanged A function which we call when the lender
     *   value changed, with no arguments.
     * @param {function} lenderSet A function which we call with a function
     *   which accepts one argument; the new value for the lender field.
     * @param {function} borrowerQuery A function which we call with a function
     *   which returns the current value of the borrower field.
     * @param {function} borrowerChanged A function which we call when the
     *   borrower value changed, with no arguments.
     * @param {function} borrowerSet A function which we call with function
     *   which accepts one argument; the new value for the borrower field.
     * @param {function} operatorQuery A function which we call with a function
     *   which returns 'AND' or 'OR'
     * @param {function} operatorChanged A function which we call when the
     *   operator value changed, with no arguments
     * @param {function} operatorSet A function which we call with a function
     *   which accepts 'AND' or 'OR' and sets the operator value accordingly.
     */
    class LoanUserFilter extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'loan-filter loan-filter-user'},
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'lender',
                            labelText: 'Lender Username',
                            component: TextInput,
                            componentArgs: {
                                type: 'text',
                                text: '',
                                textQuery: this.props.lenderQuery,
                                textChanged: this.props.lenderChanged,
                                textSet: this.props.lenderSet
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'operator',
                            labelText: 'Operator',
                            component: DropDown,
                            componentArgs: {
                                options: [{key: 'AND', text: 'AND'}, {key: 'OR', text: 'OR'}],
                                initialOption: 'OR',
                                optionQuery: this.props.operatorQuery,
                                optionChanged: this.props.operatorChanged,
                                optionSet: this.props.operatorSet
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'borrower',
                            labelText: 'Borrower Username',
                            component: TextInput,
                            componentArgs: {
                                type: 'text',
                                text: '',
                                textQuery: this.props.borrowerQuery,
                                textChanged: this.props.borrowerChanged,
                                textSet: this.props.borrowerSet
                            }
                        }
                    )
                ]
            );
        }
    };

    LoanUserFilter.propTypes = {
        lenderQuery: PropTypes.func,
        lenderChanged: PropTypes.func,
        lenderSet: PropTypes.func,
        borrowerQuery: PropTypes.func,
        borrowerChanged: PropTypes.func,
        borrowerSet: PropTypes.func,
        operatorQuery: PropTypes.func,
        operatorChanged: PropTypes.func,
        operatorSet: PropTypes.func
    };

    /**
     * Allows the user to select the desired state for loans. The valid values
     * are 'repaid-only', 'unpaid-only', 'inprogress', and 'all'
     *
     * @param {function} stateQuery A function which we call with a function
     *   which returns the currently selected state
     * @param {function} stateSet A function which we call with a function
     *   which sets the selected state
     * @param {function} stateChanged A function which we call with no
     *   arguments when the user changes the state.
     */
    class LoanStateFilter extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'loan-filter loan-filter-state'},
                React.createElement(
                    FormElement,
                    {
                        labelText: 'Loan State',
                        component: DropDown,
                        componentArgs: {
                            options: [
                                {key: 'all', text: 'All'},
                                {key: 'inprogress', text: 'Inprogress'},
                                {key: 'unpaid-only', text: 'Unpaid Only'},
                                {key: 'repaid-only', text: 'Repaid Only'}
                            ],
                            initialOption: 'all',
                            optionQuery: this.props.stateQuery,
                            optionSet: this.props.stateSet,
                            optionChanged: this.props.stateChanged
                        }
                    }
                )
            );
        }
    };

    LoanStateFilter.propTypes = {
        stateQuery: PropTypes.func,
        stateSet: PropTypes.func,
        stateChanged: PropTypes.func
    };

    /**
     * Allows the user to look for a loan by ID
     *
     * @param {function} idQuery A function we call with a function which
     *   returns the currently specified id as a number or null if the field
     *   is empty.
     * @param {function} idSet A function we call with a function which sets
     *   the specified id to the number or blank if null.
     * @param {function} idChanged A function we call when the user changes the
     *   id.
     */
    class LoanIDFilter extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'loan-filter loan-filter-id'},
                React.createElement(
                    FormElement,
                    {
                        labelText: 'Loan ID',
                        component: TextInput,
                        componentArgs: {
                            type: 'number',
                            text: null,
                            min: 1,
                            step: 1,
                            textQuery: this.props.idQuery,
                            textSet: this.props.idSet,
                            textChanged: this.props.idChanged
                        }
                    }
                )
            );
        }
    };

    /**
     * Allows the user to look for loans based on when they were started.
     * All query/set functions work with Date objects.
     *
     * @param {function} minTimeQuery A function which we call with a function
     *   which returns the currently specified minimum creation time or null.
     * @param {function} minTimeSet A function which we call with a function
     *   which sets the specified minimum time.
     * @param {function} minTimeChanged A function which we call whenever the
     *   minimum time changes.
     * @param {function} maxTimeQuery A function which we call with a function
     *   which returns the currently specified maximum creation time or null.
     * @param {function} maxTimeSet A function which we call with a function
     *   which sets the specified maximum time.
     * @param {function} maxTimeChanged A function which we call whenever the
     *   maximum time changes.
     */
    class LoanTimeFilter extends React.Component {
        constructor(props) {
            super(props);

            this.minTimeEnabledQuery = null;
            this.minTimeEnabledSet = null;
            this.maxTimeEnabledQuery = null;
            this.maxTimeEnabledSet = null;
            this.initialDate = new Date();

            this.rawMinTimeQuery = null;
            this.rawMinTimeSet = null;
            this.rawMaxTimeQuery = null;
            this.rawMaxTimeSet = null;


            this.state = {
                minTimeEnabled: false,
                maxTimeEnabled: false
            };
        }

        render() {
            return React.createElement(
                'div',
                {className: 'loan-filter loan-filter-time'},
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'enable-min',
                            labelText: 'Exclude Earlier Than',
                            component: CheckBox,
                            componentArgs: {
                                checked: false,
                                checkedQuery: ((query) => this.minTimeEnabledQuery = query).bind(this),
                                checkedSet: ((setter) => this.minTimeEnabledSet = setter).bind(this),
                                checkedChanged: (() => {
                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.minTimeEnabled = this.minTimeEnabledQuery();
                                        if (this.props.minTimeChanged) {
                                            setTimeout(this.props.minTimeChanged, 0);
                                        }
                                        return newState;
                                    });
                                }).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'min',
                            initialState: 'closed',
                            desiredState: this.state.minTimeEnabled ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            FormElement,
                            {
                                labelText: 'Minimum Creation Time',
                                component: DateTimePicker,
                                componentArgs: {
                                    initialDatetime: this.initialDate,
                                    datetimeQuery: ((query) => this.rawMinTimeQuery = query).bind(this),
                                    datetimeSet: ((setter) => this.rawMinTimeSet = setter).bind(this),
                                    datetimeChanged: this.props.minTimeChanged
                                }
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'enable-max',
                            labelText: 'Exclude Later Than',
                            component: CheckBox,
                            componentArgs: {
                                checked: false,
                                checkedQuery: ((query) => this.maxTimeEnabledQuery = query).bind(this),
                                checkedSet: ((setter) => this.maxTimeEnabledSet = setter).bind(this),
                                checkedChanged: (() => {
                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.maxTimeEnabled = this.maxTimeEnabledQuery();
                                        if (this.props.maxTimeChanged) {
                                            setTimeout(this.props.maxTimeChanged, 0);
                                        }
                                        return newState;
                                    });
                                }).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'max',
                            initialState: 'closed',
                            desiredState: this.state.maxTimeEnabled ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            FormElement,
                            {
                                labelText: 'Maximum Creation Time',
                                component: DateTimePicker,
                                componentArgs: {
                                    initialDatetime: this.initialDate,
                                    datetimeQuery: ((query) => this.rawMaxTimeQuery = query).bind(this),
                                    datetimeSet: ((setter) => this.rawMaxTimeSet = setter).bind(this),
                                    datetimeChanged: this.props.maxTimeChanged
                                }
                            }
                        )
                    )
                ]
            )
        }

        componentDidMount() {
            if (this.props.minTimeQuery) {
                this.props.minTimeQuery((() => {
                    if (!this.state.minTimeEnabled) {
                        return null;
                    }
                    return this.rawMinTimeQuery();
                }).bind(this));
            }

            if (this.props.minTimeSet) {
                this.props.minTimeSet(((val) => {
                    if (val === null || val === undefined) {
                        if (this.state.minTimeEnabled) {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.minTimeEnabled = false;
                                return newState;
                            });
                        }
                    } else {
                        this.rawMinTimeSet(val);
                        if (!this.state.minTimeEnabled) {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.minTimeEnabled = true;
                                return newState;
                            });
                        }
                    }
                }));
            }

            if (this.props.maxTimeQuery) {
                this.props.maxTimeQuery((() => {
                    if (!this.state.maxTimeEnabled) {
                        return null;
                    }
                    return this.rawMaxTimeQuery();
                }).bind(this));
            }

            if (this.props.maxTimeSet) {
                this.props.maxTimeSet(((val) => {
                    if (val === null || val === undefined) {
                        if (this.state.maxTimeEnabled) {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.maxTimeEnabled = false;
                                return newState;
                            });
                        }
                    } else {
                        this.rawMaxTimeSet(val);
                        if (!this.state.maxTimeEnabled) {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.maxTimeEnabled = true;
                                return newState;
                            });
                        }
                    }
                }));
            }
        }
    };

    LoanTimeFilter.propTypes = {
        minTimeQuery: PropTypes.func,
        minTimeSet: PropTypes.func,
        minTimeChanged: PropTypes.func,
        maxTimeQuery: PropTypes.func,
        maxTimeSet: PropTypes.func,
        maxTimeChanged: PropTypes.func
    };

    /**
     * Allows the user to enable/disable including deleted loans.
     *
     * @param {function} includeDeletedQuery A function which we call with a
     *   function that returns if deleted loans should be included.
     * @param {function} includedDeletedSet A function which we call with a
     *   function that sets if deleted loans should be included.
     * @param {function} includeDeletedChanged A function we call whenever
     *   the value for including deleted loans changes because of the user.
     */
    class LoanDeletedFilter extends React.Component {
        render() {
            return React.createElement(
                FormElement,
                {
                    labelText: 'Include Deleted Loans?',
                    component: CheckBox,
                    componentArgs: {
                        checked: false,
                        checkedQuery: this.props.includeDeletedQuery,
                        checkedSet: this.props.includeDeletedSet,
                        checkedChanged: this.props.includeDeletedChanged
                    }
                }
            );
        }
    };

    LoanDeletedFilter.propTypes = {
        includeDeletedQuery: PropTypes.func,
        includeDeletedSet: PropTypes.func,
        includeDeletedChanged: PropTypes.func
    };

    return [LoanUserFilter, LoanStateFilter, LoanIDFilter, LoanTimeFilter, LoanDeletedFilter];
})();