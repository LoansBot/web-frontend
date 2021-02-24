const [
    LoanSummary, LoanSummaryAjax, LoanList, LoanListAjax, LoanDetails,
    LoanDetailsAjax, LoanSummaryWithClickToDetails, LoanFilterForm,
    LoanFilterFormWithList
] = (function() {
    /**
     * A brief summary of a loan. This is intended to explain the lender,
     * borrower, principal, principal repaid, unpaid status, and a sense of
     * recency.
     *
     * This uses a background color of light green for completed, light red
     * for unpaid, and dark blue for in progress. This gives a fairly familiar
     * feeling for regular vision users while still being distinguishable on
     * up to achromatopsia at which point it still provides the most important
     * distinguishment between in progress and not inprogress (dark blue vs
     * light green or light red). The light green and light red aren't super
     * different on protonopia but with only 2 "light" options they don't have
     * to be that different to be interpretable (i.e., it's not a gradient
     * situation), there is still prominent text to provide this information,
     * and the more important distinction is between in progress / not in
     * progress which is extremely clear.
     *
     * We use font size of at least 18pt / 24px and at least 4.5:1 contrast
     * for the dark-blue background with dark text, as is required for
     * WCAG AAA.
     *
     * This is a pure style component. To wrap this with an ajax call and a
     * spinner use LoanSummaryAjax.
     *
     * Dates are specified in a relative format at a minimum of hour-level
     * granularity (e.g., "7 days 16 hours ago"). After 10 days it switched
     * to a timestamp format (Jan 1st, 2020 at 04:45 PM) to avoid the message
     * getting too long.
     *
     * @param {bool} showRefreshButton If true a refresh button is displayed
     *   which when clicked triggers onRefresh. This should reload the content
     *   of this loan summary. It's important that even if the content does not
     *   change there is a visual indicator of success, which is usually done by
     *   swapping this to a spinner or disabling the refresh button.
     * @param {function} onRefresh Only ever called if showRefreshButton is true.
     *   Invoked when the refresh button is clicked.
     * @param {bool} refreshDisabled If showRefreshButton is false this has no
     *   effect. Otherwise, if this is true, the refresh button is given the
     *   disabled state and if false the refresh button is not given the disabled
     *   state.
     * @param {function} onDetails Called when the details button is clicked.
     * @param {string} lender The username of the lender
     * @param {string} borrower The username of the borrower
     * @param {string} currencyCode The uppercase ISO4217 currency code this
     *  loan is stored in.
     * @param {string} currencySymbol The symbol for the currency, e.g., '$'
     * @param {bool} currencySymbolOnLeft True if the currency symbol
     *  should be on the left, false if the currency symbol should be on the
     *  right.
     * @param {integer} currencyExponent The exponent of the currency the loan
     *   is in. For example, the smallest U.S. denomination is 1 cent. There
     *   are 100 = 10^2 cents in 1 U.S.D. So the U.S. dollar has an exponent of
     *   2. On the other hand, JPY has no minor currency so the "minor" integer
     *   amount is really the same as the major (1 = 10^0) so the exponent is
     *   0.
     * @param {integer} principalMinor The principal of the loan in the minor
     *   unit
     * @param {integer} principalRepaymentMinor The principal repayment of
     *   the loan in the minor unit.
     * @param {Date} createdAt When the loan was first created
     * @param {Date, null} lastRepaidAt When money was last put toward repaying
     *   this loan
     * @param {Date, null} repaidAt When the loan was completely repaid. Should
     *   only be set if the principal and principal repayment are equal.
     * @param {Date, null} unpaidAt When the loan was marked as unapid. Should
     *   only be set if the principal is less than the principal repayment.
     * @param {Date, null} deletedAt When this loan was marked deleted.
     */
    class LoanSummary extends React.Component {
        render() {
            var loanState = 'inprogress';
            if (this.props.deletedAt) {
                loanState = 'deleted';
            } else if (this.props.repaidAt) {
                loanState = 'repaid';
            } else if (this.props.unpaidAt) {
                loanState = 'unpaid';
            }

            return React.createElement(
                'div',
                {className: `loan loan-summary loan-${loanState}`},
                [
                    React.createElement(
                        'div',
                        {key: 'created-at', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {key: 'creation-time', className: 'loan-created-at'},
                            React.createElement(
                                TextDateTime,
                                {time: this.props.createdAt}
                            )
                        )
                    )
                ].concat(!this.props.deletedAt ? [] : [
                    React.createElement(
                        'div',
                        {key: 'deleted-at', className: 'loan-row'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: 'deletion-text'},
                                'This loan was deleted at '
                            ),
                            React.createElement(
                                'span',
                                {key: 'deletion-time', className: 'loan-deleted-at'},
                                React.createElement(
                                    TextDateTime,
                                    {time: this.props.deletedAt, style: 'absolute'}
                                )
                            )
                        ]
                    )
                ]).concat([
                    React.createElement(
                        'div',
                        {key: 'involved', className: 'loan-row loan-involved'},
                        [
                            React.createElement(
                                'span',
                                {key: 'lender', className: 'loan-lender'},
                                `/u/${this.props.lender}`
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'arrow',
                                    className: 'loan-involved-arrow',
                                    dangerouslySetInnerHTML: { __html: '&rarr;' }
                                }
                            ),
                            React.createElement(
                                'span',
                                {key: 'borrower', className: 'loan-borrower'},
                                `/u/${this.props.borrower}`
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'principal', className: 'loan-row'},
                        [
                            React.createElement(
                                'span',
                                {key: 'principal', className: 'loan-principal'},
                                React.createElement(
                                    Money,
                                    {
                                        currencyCode: this.props.currencyCode,
                                        currencySymbol: this.props.currencySymbol,
                                        currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                        currencyExponent: this.props.currencyExponent,
                                        minor: this.props.principalMinor
                                    }
                                )
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'repayment', className: 'loan-row'},
                        [
                            React.createElement(
                                'span',
                                {key: 'amt', className: 'loan-repayment-amount'},
                                React.createElement(
                                    Money,
                                    {
                                        currencyCode: this.props.currencyCode,
                                        currencySymbol: this.props.currencySymbol,
                                        currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                        currencyExponent: this.props.currencyExponent,
                                        minor: this.props.principalRepaymentMinor
                                    }
                                )
                            ),
                            React.createElement(
                                'span',
                                {key: 'txt', className: 'loan-repayment-text'},
                                'repaid so far'
                            )
                        ]
                    ),
                    (
                        this.props.lastRepaidAt ? React.createElement(
                            'div',
                            {key: 'last-repaid-at', className: 'loan-row'},
                            [
                                React.createElement(
                                    'span',
                                    {key: 'txt', className: 'loan-last-repayment-text'},
                                    'Last repayment'
                                ),
                                React.createElement(
                                    'span',
                                    {key: 'time', className: 'loan-last-repayment-timestr'},
                                    React.createElement(
                                        TextDateTime,
                                        {
                                            time: this.props.lastRepaidAt
                                        }
                                    )
                                )
                            ]
                        ) : React.createElement(
                            React.Fragment,
                            {key: 'last-repaid-at'}
                        )
                    ),
                    React.createElement(
                        'div',
                        {key: 'unpaid', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {className: (this.props.unpaidAt ? 'loan-unpaid-text' : 'loan-not-unpaid-text')},
                            this.props.unpaidAt ? 'Marked unpaid' : 'Not marked unpaid'
                        )
                    ),
                    React.createElement(
                        'div',
                        {key: 'buttons', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {className: 'loan-buttons loan-buttons-' + (this.props.showRefreshButton ? '2' : '1')},
                            (
                                this.props.showRefreshButton ? [
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'refresh',
                                            text: 'Refresh',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: this.props.onRefresh,
                                            disabled: this.props.refreshDisabled
                                        }
                                    )
                                ] : []
                            ).concat([
                                React.createElement(
                                    Button,
                                    {
                                        key: 'details',
                                        text: 'Details',
                                        style: 'primary',
                                        type: 'button',
                                        onClick: this.props.onDetails
                                    }
                                )
                            ])
                        )
                    )
                ])
            )
        }
    };

    LoanSummary.propTypes = {
        showRefreshButton: PropTypes.bool.isRequired,
        onRefresh: PropTypes.func,
        refreshDisabled: PropTypes.bool.isRequired,
        lender: PropTypes.string.isRequired,
        borrower: PropTypes.string.isRequired,
        currencyCode: PropTypes.string.isRequired,
        currencySymbol: PropTypes.string.isRequired,
        currencySymbolOnLeft: PropTypes.bool.isRequired,
        currencyExponent: PropTypes.number.isRequired,
        principalMinor: PropTypes.number.isRequired,
        principalRepaymentMinor: PropTypes.number.isRequired,
        createdAt: PropTypes.instanceOf(Date).isRequired,
        lastRepaidAt: PropTypes.instanceOf(Date),
        repaidAt: PropTypes.instanceOf(Date),
        unpaidAt: PropTypes.instanceOf(Date),
        deletedAt: PropTypes.instanceOf(Date)
    };

    /**
     * A light wrapper around a loan summary which loads the content from the
     * loan show endpoint, meaning it only needs the loan id. This will always
     * show the refresh button on the loan summary.
     *
     * It is not necessary or helpful to cache this component; the ajax call
     * itself will be appropriately cached. If you're reading this to connect
     * the Loans API to some other service, you should read API.md in the
     * LoansBot/web-backend repo
     *
     * @param {function} onDetails A function which we call with no arguments
     *   when the button to switch to details view is pressed.
     * @param {integer} loanId The id of the loan that should be loaded into a
     *   loan summary.
     */
    class LoanSummaryAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                state: 'loading',
                desiredState: 'expanded',
                loan: null
            };

            this.fetchLoan(false);
        }

        render() {
            return React.createElement(
                SmartHeightEased,
                {
                    initialState: 'expanded',
                    desiredState: this.state.desiredState
                },
                this.renderInner()
            );
        }

        renderInner() {
            if(this.state.state === 'loading') {
                return React.createElement(
                    'div',
                    {className: 'loan loan-loading'},
                    React.createElement(Spinner)
                );
            }

            if (this.state.state === 'errored') {
                return React.createElement(
                    'div',
                    {className: 'loan loan-errored'},
                    'Something went wrong with this loan! Reload the page.'
                );
            }


            let kwargs = Object.assign({}, this.state.loan);
            kwargs.focusQuery = this.props.focusQuery;
            kwargs.focusSet = this.props.focusSet;
            kwargs.onDetails = this.props.onDetails;
            kwargs.showRefreshButton = true;
            kwargs.onRefresh = (() => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.desiredState = 'closed';
                    return newState;
                });

                setTimeout(() => {
                    this.setState({
                        state: 'loading',
                        desiredState: 'expanded',
                        loan: null
                    });

                    setTimeout(() => {
                        this.fetchLoan(true);
                    }, 500);
                }, 500);
            }).bind(this);

            return React.createElement(LoanSummary, kwargs);
        }

        fetchLoan(force) {
            let headers = {'Content-Type': 'application/json'};
            if (force) {
                headers['Cache-Control'] = 'no-cache';
                headers['Pragma'] = 'no-cache';
            };
            api_fetch(
                `/api/loans/${this.props.loanId}`,
                AuthHelper.auth({
                    headers: headers
                })
            ).then((resp) => {
                if (!resp.ok) {
                    console.log(`Error fetching loan ${this.props.loanId}: ${resp.status}`)
                    console.log(resp.body);
                    return Promise.reject();
                }

                return resp.json();
            }).then((data) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.desiredState = 'closed';
                    return newState;
                })

                setTimeout(() => {
                    this.setState({
                        state: 'loaded',
                        desiredState: 'expanded',
                        loan: {
                            lender: data.lender,
                            borrower: data.borrower,
                            currencyCode: data.currency_code,
                            currencySymbol: data.currency_symbol,
                            currencySymbolOnLeft: data.currency_symbol_on_left,
                            currencyExponent: data.currency_exponent,
                            principalMinor: data.principal_minor,
                            principalRepaymentMinor: data.principal_repayment_minor,
                            createdAt: new Date(data.created_at * 1000),
                            lastRepaidAt: (data.last_repaid_at ? new Date(data.last_repaid_at * 1000) : null),
                            repaidAt: (data.repaid_at ? new Date(data.repaid_at * 1000) : null),
                            unpaidAt: (data.unpaid_at ? new Date(data.unpaid_at * 1000) : null),
                            deletedAt: (data.deleted_at ? new Date(data.deleted_at * 1000) : null)
                        }
                    });
                }, 500);
            }).catch(() => {
                this.setState({state: 'errored', desiredState: 'expanded', loan: null});
            });
        }
    }

    LoanSummaryAjax.propTypes = {
        onDetails: PropTypes.func,
        loanId: PropTypes.number.isRequired
    };

    /**
     * Contains all the useful information about the loan displayed. This takes
     * up a reasonable amount of space and can be assumed to take up the entire
     * screen with possible scrolling for a phone.
     *
     * This is a pure style component. To wrap this with an ajax call and a
     * spinner use LoanDetailsAjax.
     *
     * This is typically displayed only by explicit request, ie., a user clicks
     * a loan summary (see LoanSummaryWithClickToDetails).
     *
     * @param {function} onMinimize If not null a minimize button will be shown
     *   and this function will be triggered if it's clicked.
     * @param {bool} showRefreshButton If true a refresh button is displayed
     *   which when clicked triggers onRefresh. This should reload the content
     *   of this loan summary. It's important that even if the content does not
     *   change there is a visual indicator of success, which is usually done by
     *   swapping this to a spinner or disabling the refresh button.
     * @param {function} onRefresh Only ever called if showRefreshButton is true.
     *   Invoked when the refresh button is clicked.
     * @param {bool} refreshDisabled If showRefreshButton is false this has no
     *   effect. Otherwise, if this is true, the refresh button is given the
     *   disabled state and if false the refresh button is not given the disabled
     *   state.
     * @param {integer} loanId The primary key of the loan
     * @param {list} events The events that occurred to this loan in
     *   chronological order. each event is an object with the following
     *   keys:
     *     - {string} eventType Acts as an enum to identify the type of
     *         event this is. Takes one of the following values and determines
     *         the rest of the keys (and their meanings): "admin", "creation",
     *         "repayment", "unpaid"
     *     - {Date} createdAt When this event occurred
     *   For admin events:
     *     - {string, null} admin If our account has access to view
     *       loan admin event privileged details, this will be the username of
     *       the admin which edited this event or '<deleted>' if the admin
     *       account has been deleted. Otherwise, when our access doesn't have
     *       permission to this field, this is null (and we just display a
     *       generic contact the moderators if you have questions link)
     *     - {string, null} reason If our account has permission to this field
     *       this will be the reason that the admin put in for making this edit.
     *       Otherwise, if our account doesn't have permission to this field,
     *       this is null.
     *     - {integer} oldPrincipalMinor The principal of this loan prior to
     *       this admin event, in the minor currency.
     *     - {integer} oldPrincipalRepaymentMinor The principal repayment of
     *       this loan prior to this admin event, in the minor currency.
     *     - {integer} newPrincipalMinor The principal of this loan after this
     *       admin event, in the minor currency.
     *     - {integer} newPrincipalRepaymentMinor The principal repayment of
     *       this loan after this admin event, in the minor currency.
     *     - {Date} oldCreatedAt The creation date of this loan prior to this
     *       admin event. Modifying the created at of the loan is useful if
     *       someone forgot to post the $loan comment at the time it was sent.
     *     - {Date} newCreatedAt The new creation date of this loan after this
     *       admin event.
     *     - {Date, null} oldRepaidAt The time at which this loan was
     *       considered fully repaid prior to this event, or null if it wasn't
     *       considered fully repaid.
     *     - {Date, null} newRepaidAt The time at which this loan was considered
     *       fully repaid after this event or null if it is not considered fully
     *       repaid after this event.
     *     - {Date, null} oldUnpaidAt The time at which this loan was considered
     *       unpaid prior this event or null if it wasn't considered unpaid
     *     - {Date, null} newUnpaidAt The time at which this loan is considered
     *       unpaid after this event or null if it is not considered unpaid
     *     - {Date, null} oldDeletedAt If the loan was soft-deleted prior to this
     *       admin event this is the date it was previously soft deleted at. If
     *       the loan was not considered soft deleted prior to this event this is
     *       null.
     *     - {Date, null} newDeletedAt If the loan is considered soft-deleted
     *       after this event this is the date it was marked soft deleted. Note
     *       that we do tell users if there loan was historically soft deleted
     *       but if it's currently soft deleted they can't view it at all.
     *   For creation events:
     *     - {integer} creationType Acts as an enum that describes how this
     *       loan was created. 0 means the loan was created in the normal way
     *       and a creation permalink will be available. 1 means the loan was
     *       created via the redditloans site, and 2 means the loan was created
     *       during an old migration where we had to recover the loansbot
     *       history so we walked backward in time, so we saw paid summons
     *       before the loan summons, and this loan we created from the paid
     *       summon but we never found the loan summon, possibly because reddit
     *       only stores the most recent 1000 posts per community.
     *     - {string} creationPermalink If the creationType is 0, this will be
     *       the permalink to the $loan command.
     *   For repayment events:
     *     - {integer} repaymentMinor The amount that was repaid, in the loan
     *       currency minor units.
     *   For unpaid events:
     *     - {bool} unpaid True if this was marking the loan unpaid, false if it
     *       was removing the unpaid flag.
     * @param {string} lender The username of the lender
     * @param {string} borrower The username of the borrower
     * @param {string} currencyCode The uppercase ISO4217 currency code this
     *  loan is stored in.
     * @param {string} currencySymbol The symbol for the currency, e.g., '$'
     * @param {bool} currencySymbolOnLeft True if the currency symbol
     *  should be on the left, false if the currency symbol should be on the
     *  right.
     * @param {integer} currencyExponent The exponent of the currency the loan
     *   is in. For example, the smallest U.S. denomination is 1 cent. There
     *   are 100 = 10^2 cents in 1 U.S.D. So the U.S. dollar has an exponent of
     *   2. On the other hand, JPY has no minor currency so the "minor" integer
     *   amount is really the same as the major (1 = 10^0) so the exponent is
     *   0.
     * @param {integer} principalMinor The principal of the loan in the minor
     *   unit
     * @param {integer} principalRepaymentMinor The principal repayment of
     *   the loan in the minor unit.
     * @param {Date} createdAt When the loan was first created
     * @param {Date, null} lastRepaidAt When money was last put toward repaying this loan
     * @param {Date, null} repaidAt When the loan was completely repaid. Should
     *   only be set if the principal and principal repayment are equal.
     * @param {Date, null} unpaidAt When the loan was marked as unpaid. Should
     *   only be set if the principal is less than the principal repayment.
     * @param {Date, null} deletedAt When this loan was marked as deleted.
     *   If set it implies this loan is soft-deleted.
     * @param {bool} includeEditOption If true there will be a link to edit the
     *   loan. If false or null no such option will be shown.
     */
    class LoanDetails extends React.Component {
        render() {
            var loanState = 'inprogress';
            if (this.props.deletedAt) {
                loanState = 'deleted';
            } else if (this.props.repaidAt) {
                loanState = 'repaid';
            } else if (this.props.unpaidAt) {
                loanState = 'unpaid';
            }

            return React.createElement(
                'div',
                {className: `loan loan-summary loan-${loanState}`},
                [
                    React.createElement(
                        'div',
                        {key: 'created-at', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {key: 'creation-time', className: 'loan-created-at'},
                            React.createElement(
                                TextDateTime,
                                {time: this.props.createdAt, style: 'absolute'}
                            )
                        ),
                        React.createElement(
                            'div',
                            {key: 'involved', className: 'loan-row loan-involved'},
                            [
                                React.createElement(
                                    'span',
                                    {key: 'lender', className: 'loan-lender'},
                                    `/u/${this.props.lender}`
                                ),
                                React.createElement(
                                    'span',
                                    {
                                        key: 'arrow',
                                        className: 'loan-involved-arrow',
                                        dangerouslySetInnerHTML: { __html: '&rarr;' }
                                    }
                                ),
                                React.createElement(
                                    'span',
                                    {key: 'borrower', className: 'loan-borrower'},
                                    `/u/${this.props.borrower}`
                                ),
                                React.createElement(
                                    'span',
                                    {key: 'loanId', className: 'loan-id'},
                                    ` (loan ${this.props.loanId})`
                                )
                            ]
                        )
                    )
                ].concat(!this.props.deletedAt ? [] : [
                    React.createElement(
                        'div',
                        {key: 'deleted-at', className: 'loan-row'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: 'deletion-text'},
                                'This loan was deleted at '
                            ),
                            React.createElement(
                                'span',
                                {key: 'deletion-time', className: 'loan-deleted-at'},
                                React.createElement(
                                    TextDateTime,
                                    {time: this.props.deletedAt, style: 'absolute'}
                                )
                            )
                        ]
                    )
                ]).concat([
                    React.createElement(
                        'div',
                        {key: 'principal', className: 'loan-row'},
                        [
                            React.createElement(
                                'span',
                                {key: 'principal', className: 'loan-principal'},
                                React.createElement(
                                    Money,
                                    {
                                        currencyCode: this.props.currencyCode,
                                        currencySymbol: this.props.currencySymbol,
                                        currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                        currencyExponent: this.props.currencyExponent,
                                        minor: this.props.principalMinor
                                    }
                                )
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'buttons-top', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {className: 'loan-buttons loan-buttons-' + (this.props.showRefreshButton ? '2' : '1')},
                            (
                                this.props.showRefreshButton ? [
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'refresh',
                                            text: 'Refresh',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: this.props.onRefresh,
                                            disabled: this.props.refreshDisabled
                                        }
                                    )
                                ] : []
                            ).concat(this.props.onMinimize ? [
                                React.createElement(
                                    Button,
                                    {
                                        key: 'summary',
                                        text: 'Summary',
                                        style: 'primary',
                                        type: 'button',
                                        onClick: this.props.onMinimize
                                    }
                                )
                            ] : [])
                        )
                    ),
                    React.createElement(
                        'div',
                        {key: 'loan-events-list', className: 'loan-row'},
                        [
                            React.createElement(
                                'div',
                                {key: 'title', className: 'loan-events-title'},
                                'History'
                            ),
                            React.createElement(
                                'div',
                                {key: 'evts', className: 'loan-events-list'},
                                this.props.events.map((evt, idx) => {
                                    if(evt.eventType === 'admin') {
                                        let children = [];
                                        if (evt.reason) {
                                            if (evt.admin) {
                                                children.push(
                                                    React.createElement(
                                                        React.Fragment,
                                                        {key: 'admin-username'},
                                                        `/u/${evt.admin}`
                                                    )
                                                );
                                            }else {
                                                children.push(
                                                    React.createElement(
                                                        React.Fragment,
                                                        {key: 'admin-username'},
                                                        'A deleted admin user'
                                                    )
                                                );
                                            }

                                            children.push(
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: 'with-username-cat-text'},
                                                    ` changed this loan at `
                                                ),
                                                React.createElement(
                                                    TextDateTime,
                                                    {key: 'cat', time: evt.createdAt, style: 'absolute'}
                                                ),
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: 'admin-reason'},
                                                    ` and provided the reason '${evt.reason}'.`
                                                )
                                            );
                                        } else {
                                            children.push(
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: 'cat-text'},
                                                    'An admin changed this loan at '
                                                ),
                                                React.createElement(
                                                    TextDateTime,
                                                    {key: 'cat', time: evt.createdAt, style: 'absolute'}
                                                )
                                            );
                                        }

                                        let changesList = [];
                                        if (evt.oldPrincipalMinor !== evt.newPrincipalMinor) {
                                            changesList.push(
                                                React.createElement(
                                                    'div',
                                                    {key: 'principal', className: 'loan-event-admin-change'},
                                                    [
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: 'title'},
                                                            'The principal was changed from '
                                                        ),
                                                        React.createElement(
                                                            Money,
                                                            {
                                                                key: 'pre',
                                                                currencyCode: this.props.currencyCode,
                                                                currencySymbol: this.props.currencySymbol,
                                                                currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                                                currencyExponent: this.props.currencyExponent,
                                                                minor: evt.oldPrincipalMinor
                                                            }
                                                        ),
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: 'to'},
                                                            ' to '
                                                        ),
                                                        React.createElement(
                                                            Money,
                                                            {
                                                                key: 'post',
                                                                currencyCode: this.props.currencyCode,
                                                                currencySymbol: this.props.currencySymbol,
                                                                currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                                                currencyExponent: this.props.currencyExponent,
                                                                minor: evt.newPrincipalMinor
                                                            }
                                                        )
                                                    ]
                                                )
                                            )
                                        }

                                        if (evt.oldPrincipalRepaymentMinor !== evt.newPrincipalRepaymentMinor) {
                                            changesList.push(
                                                React.createElement(
                                                    'div',
                                                    {key: 'principal-repayment', className: 'loan-event-admin-change'},
                                                    [
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: 'title'},
                                                            'The sum principal repayment was changed from '
                                                        ),
                                                        React.createElement(
                                                            Money,
                                                            {
                                                                key: 'pre',
                                                                currencyCode: this.props.currencyCode,
                                                                currencySymbol: this.props.currencySymbol,
                                                                currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                                                currencyExponent: this.props.currencyExponent,
                                                                minor: evt.oldPrincipalRepaymentMinor
                                                            }
                                                        ),
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: 'to'},
                                                            ' to '
                                                        ),
                                                        React.createElement(
                                                            Money,
                                                            {
                                                                key: 'post',
                                                                currencyCode: this.props.currencyCode,
                                                                currencySymbol: this.props.currencySymbol,
                                                                currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                                                currencyExponent: this.props.currencyExponent,
                                                                minor: evt.newPrincipalRepaymentMinor
                                                            }
                                                        )
                                                    ]
                                                )
                                            )
                                        }

                                        if (evt.oldCreatedAt.getTime() !== evt.newCreatedAt.getTime()) {
                                            changesList.push(
                                                React.createElement(
                                                    'div',
                                                    {key: 'cat', className: 'loan-event-admin-change'},
                                                    [
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: 'title'},
                                                            'The creation date was changed from '
                                                        ),
                                                        React.createElement(
                                                            TextDateTime,
                                                            {
                                                                key: 'pre',
                                                                time: evt.oldCreatedAt,
                                                                style: 'absolute'
                                                            }
                                                        ),
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: 'to'},
                                                            ' to '
                                                        ),
                                                        React.createElement(
                                                            TextDateTime,
                                                            {
                                                                key: 'post',
                                                                time: evt.newCreatedAt,
                                                                style: 'absolute'
                                                            }
                                                        )
                                                    ]
                                                )
                                            )
                                        }

                                        function compareTimes(nm, oldDate, newDate) {
                                            if (oldDate !== null && newDate === null) {
                                                changesList.push(
                                                    React.createElement(
                                                        'div',
                                                        {key: nm, className: 'loan-event-admin-change'},
                                                        [
                                                            React.createElement(
                                                                React.Fragment,
                                                                {key: 'text'},
                                                                `The ${nm} date, `
                                                            ),
                                                            React.createElement(
                                                                TextDateTime,
                                                                {key: 'time', time: oldDate, style: 'absolute'}
                                                            ),
                                                            React.createElement(
                                                                React.Fragment,
                                                                {key: 'text2'},
                                                                ` was unassigned.`
                                                            )
                                                        ]
                                                    )
                                                );
                                            }else if (oldDate === null && newDate !== null) {
                                                changesList.push(
                                                    React.createElement(
                                                        'div',
                                                        {key: nm, className: 'loan-event-admin-change'},
                                                        [
                                                            React.createElement(
                                                                React.Fragment,
                                                                {key: 'text'},
                                                                `The ${nm} date went from unassigned to `
                                                            ),
                                                            React.createElement(
                                                                TextDateTime,
                                                                {key: 'time', time: newDate, style: 'absolute'}
                                                            )
                                                        ]
                                                    )
                                                );
                                            }else if (oldDate !== null && oldDate.getTime() != newDate.getTime()) {
                                                changesList.push(
                                                    React.createElement(
                                                        'div',
                                                        {key: nm, className: 'loan-event-admin-change'},
                                                        [
                                                            React.createElement(
                                                                React.Fragment,
                                                                {key: 'text'},
                                                                `The ${nm} date was changed from `
                                                            ),
                                                            React.createElement(
                                                                TextDateTime,
                                                                {key: 'pre', time: oldDate, style: 'absolute'}
                                                            ),
                                                            React.createElement(
                                                                React.Fragment,
                                                                {key: 'to'},
                                                                ' to '
                                                            ),
                                                            React.createElement(
                                                                TextDateTime,
                                                                {key: 'post', time: newDate, style: 'absolute'}
                                                            )
                                                        ]
                                                    )
                                                );
                                            }
                                        };

                                        compareTimes('repaid', evt.oldRepaidAt, evt.newRepaidAt);
                                        compareTimes('unpaid', evt.oldUnpaidAt, evt.newUnpaidAt);
                                        compareTimes('deleted', evt.oldDeletedAt, evt.newDeletedAt);

                                        if (changesList.length > 0) {
                                            children.push(
                                                React.createElement(
                                                    'ul',
                                                    {key: 'changes', className: 'loan-event-admin-changes'},
                                                    changesList.map((inner, innerIdx) => {
                                                        return React.createElement(
                                                            'li',
                                                            {key: `change-${innerIdx}`, className: 'loan-event-admin-change-item'},
                                                            inner
                                                        );
                                                    })
                                                )
                                            );
                                        }

                                        return React.createElement(
                                            'div',
                                            {key: `event-${idx}`, className: 'loan-event loan-event-admin'},
                                            children
                                        )
                                    }else if(evt.eventType === 'creation') {
                                        return React.createElement(
                                            'div',
                                            {key: `event-${idx}`, className: 'loan-event loan-event-creation'},
                                            [
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: '1'},
                                                    'The loan was created '
                                                ),
                                                (
                                                    evt.creationType === 0 ? (
                                                        React.createElement(
                                                            'a',
                                                            {key: '2', href: evt.creationPermalink, target: '_blank'},
                                                            'using this comment'
                                                        )
                                                    ) : (
                                                        React.createElement(
                                                            React.Fragment,
                                                            {key: '2'},
                                                            'in a non-standard way'
                                                        )
                                                    )
                                                ),
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: '3'},
                                                    ' at '
                                                ),
                                                React.createElement(
                                                    TextDateTime,
                                                    {key: '4', time: evt.createdAt, style: 'absolute'}
                                                )
                                            ]
                                        )
                                    }else if(evt.eventType === 'repayment') {
                                        return React.createElement(
                                            'div',
                                            {key: `event-${idx}`, className: 'loan-event loan-event-repayment'},
                                            [
                                                React.createElement(
                                                    Money,
                                                    {
                                                        key: '1',
                                                        currencyCode: this.props.currencyCode,
                                                        currencySymbol: this.props.currencySymbol,
                                                        currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                                        currencyExponent: this.props.currencyExponent,
                                                        minor: evt.repaymentMinor
                                                    }
                                                ),
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: '2'},
                                                    ' was repaid at '
                                                ),
                                                React.createElement(
                                                    TextDateTime,
                                                    {key: '3', time: evt.createdAt, style: 'absolute'}
                                                )
                                            ]
                                        );
                                    }else if(evt.eventType === 'unpaid') {
                                        return React.createElement(
                                            'div',
                                            {key: `event-${idx}`, className: 'loan-event loan-event-unpaid'},
                                            [
                                                React.createElement(
                                                    React.Fragment,
                                                    {key: '1'},
                                                    `The unpaid status changed to ${evt.unpaid ? "unpaid" : "not unpaid"} at `
                                                ),
                                                React.createElement(
                                                    TextDateTime,
                                                    {key: '2', time: evt.createdAt, style: 'absolute'}
                                                )
                                            ]
                                        );
                                    }else {
                                        return React.createElement(
                                            React.Fragment,
                                            {key: `event-${idx}`}
                                        )
                                    }
                                })
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'repayment', className: 'loan-row'},
                        [
                            React.createElement(
                                'span',
                                {key: 'amt', className: 'loan-repayment-amount'},
                                React.createElement(
                                    Money,
                                    {
                                        currencyCode: this.props.currencyCode,
                                        currencySymbol: this.props.currencySymbol,
                                        currencySymbolOnLeft: this.props.currencySymbolOnLeft,
                                        currencyExponent: this.props.currencyExponent,
                                        minor: this.props.principalRepaymentMinor
                                    }
                                )
                            ),
                            React.createElement(
                                'span',
                                {key: 'txt', className: 'loan-repayment-text'},
                                'repaid so far'
                            )
                        ]
                    ),
                    (
                        this.props.lastRepaidAt ? React.createElement(
                            'div',
                            {key: 'last-repaid-at', className: 'loan-row'},
                            [
                                React.createElement(
                                    'span',
                                    {key: 'txt', className: 'loan-last-repayment-text'},
                                    'Last repayment'
                                ),
                                React.createElement(
                                    'span',
                                    {key: 'time', className: 'loan-last-repayment-timestr'},
                                    React.createElement(
                                        TextDateTime,
                                        {
                                            style: 'absolute',
                                            time: this.props.lastRepaidAt
                                        }
                                    )
                                )
                            ]
                        ) : React.createElement(
                            React.Fragment,
                            {key: 'last-repaid-at'}
                        )
                    ),
                    React.createElement(
                        'div',
                        {key: 'unpaid', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {className: (this.props.unpaidAt ? 'loan-unpaid-text' : 'loan-not-unpaid-text')},
                            this.props.unpaidAt ? 'Marked unpaid' : 'Not marked unpaid'
                        )
                    ),
                    ((this.props.onMinimize || this.props.includeEditOption) ? React.createElement(
                        'div',
                        {key: 'buttons-bottom', className: 'loan-row'},
                        React.createElement(
                            'span',
                            {className: 'loan-buttons loan-buttons-' + (this.props.showRefreshButton ? '2' : '1')},
                            (
                                ((!this.props.includeEditOption || !this.props.onMinimize) && this.props.showRefreshButton) ? [
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'refresh',
                                            text: 'Refresh',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: this.props.onRefresh,
                                            disabled: this.props.refreshDisabled
                                        }
                                    )
                                ] : []
                            ).concat(this.props.onMinimize ? [
                                React.createElement(
                                    Button,
                                    {
                                        key: 'summary',
                                        text: 'Summary',
                                        style: 'primary',
                                        type: 'button',
                                        onClick: this.props.onMinimize
                                    }
                                )
                            ] : []).concat(this.props.includeEditOption ? [
                                React.createElement(
                                    Button,
                                    {
                                        key: 'edit',
                                        text: 'Edit',
                                        style: 'secondary',
                                        type: 'button',
                                        onClick: (() => {
                                            window.location.href = `/loan.html?id=${this.props.loanId}`;
                                        }).bind(this)
                                    }
                                )
                            ] : [])
                        )
                    ) : React.createElement(
                        React.Fragment,
                        {key: 'buttons-bottom'}
                    ))
                ])
            );
        }
    };

    LoanDetails.propTypes = {
        onMinimize: PropTypes.func,
        showRefreshButton: PropTypes.bool.isRequired,
        onRefresh: PropTypes.func,
        refreshDisabled: PropTypes.bool.isRequired,
        loanId: PropTypes.number.isRequired,
        events: PropTypes.arrayOf(PropTypes.exact({
            eventType: PropTypes.string.isRequired,
            createdAt: PropTypes.instanceOf(Date).isRequired,

            // Admin
            admin: PropTypes.string,
            reason: PropTypes.string,
            oldPrincipalMinor: PropTypes.number,
            oldPrincipalRepaymentMinor: PropTypes.number,
            newPrincipalMinor: PropTypes.number,
            newPrincipalRepaymentMinor: PropTypes.number,
            oldCreatedAt: PropTypes.instanceOf(Date),
            newCreatedAt: PropTypes.instanceOf(Date),
            oldRepaidAt: PropTypes.instanceOf(Date),
            newRepaidAt: PropTypes.instanceOf(Date),
            oldUnpaidAt: PropTypes.instanceOf(Date),
            newUnpaidAt: PropTypes.instanceOf(Date),
            oldDeletedAt: PropTypes.instanceOf(Date),
            newDeletedAt: PropTypes.instanceOf(Date),

            // Creation
            creationType: PropTypes.number,
            creationPermalink: PropTypes.string,

            // Repayment
            repaymentMinor: PropTypes.number,

            // Unpaid
            unpaid: PropTypes.bool
        })).isRequired,
        lender: PropTypes.string.isRequired,
        borrower: PropTypes.string.isRequired,
        currencyCode: PropTypes.string,
        currencySymbol: PropTypes.string,
        currencySymbolOnLeft: PropTypes.bool,
        currencyExponent: PropTypes.number,
        principalMinor: PropTypes.number.isRequired,
        principalRepaymentMinor: PropTypes.number.isRequired,
        createdAt: PropTypes.instanceOf(Date).isRequired,
        lastRepaidAt: PropTypes.instanceOf(Date),
        repaidAt: PropTypes.instanceOf(Date),
        unpaidAt: PropTypes.instanceOf(Date),
        deletedAt: PropTypes.instanceOf(Date)
    };

    /**
     * A light wrapper around the details of a loan which displays a spinner
     * then loans the details via Ajax and then populates a LoanDetails
     * component. This essentially allows creating a loan details component
     * from just a loan id. It is not necessary or helpful to cache this
     * component; the ajax call itself will be appropriately cached.
     *
     * @param {function} onMinimize A function which we call with no arguments
     *   when the minimize button is pressed.
     * @param {integer} loanId The id of the loan to display details for.
     * @param {bool} includeEditOption If true there will be a link to edit the
     *   loan. If false or null no such option will be shown.
     */
    class LoanDetailsAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                state: 'loading',
                desiredState: 'expanded',
                loan: null
            };

            this.fetchLoan(false);
        }

        render() {
            return React.createElement(
                SmartHeightEased,
                {
                    initialState: 'expanded',
                    desiredState: this.state.desiredState
                },
                this.renderInner()
            );
        }

        renderInner() {
            if(this.state.state === 'loading') {
                return React.createElement(
                    'div',
                    {className: 'loan loan-loading'},
                    React.createElement(Spinner)
                );
            }

            if (this.state.state === 'errored') {
                return React.createElement(
                    'div',
                    {className: 'loan loan-errored'},
                    'Something went wrong with this loan! Reload the page.'
                );
            }


            let kwargs = Object.assign({}, this.state.loan);
            kwargs.onMinimize = this.props.onMinimize;
            kwargs.showRefreshButton = true;
            kwargs.includeEditOption = this.props.includeEditOption;
            kwargs.onRefresh = (() => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.desiredState = 'closed';
                    return newState;
                });

                setTimeout(() => {
                    this.setState({
                        state: 'loading',
                        desiredState: 'expanded',
                        loan: null
                    });

                    setTimeout(() => {
                        this.fetchLoan(true);
                    }, 500);
                }, 500);
            }).bind(this);

            return React.createElement(LoanDetails, kwargs);
        }

        fetchLoan(force) {
            let headers = {'Content-Type': 'application/json'}
            if (force) {
                headers['Cache-Control'] = 'no-cache'
                headers['Pragma'] = 'no-cache';
            };
            api_fetch(
                `/api/loans/${this.props.loanId}/detailed`,
                AuthHelper.auth({
                    headers: headers,
                })
            ).then((resp) => {
                if (!resp.ok) {
                    console.log(`Error fetching loan ${this.props.loanId}: ${resp.status}`)
                    console.log(resp.body);
                    return Promise.reject();
                }

                return resp.json();
            }).then((data) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.desiredState = 'closed';
                    return newState;
                })

                setTimeout(() => {
                    this.setState({
                        state: 'loaded',
                        desiredState: 'expanded',
                        loan: {
                            loanId: this.props.loanId,
                            lender: data.basic.lender,
                            borrower: data.basic.borrower,
                            currencyCode: data.basic.currency_code,
                            currencySymbol: data.basic.currency_symbol,
                            currencySymbolOnLeft: data.basic.currency_symbol_on_left,
                            currencyExponent: data.basic.currency_exponent,
                            principalMinor: data.basic.principal_minor,
                            principalRepaymentMinor: data.basic.principal_repayment_minor,
                            createdAt: new Date(data.basic.created_at * 1000),
                            lastRepaidAt: (data.basic.last_repaid_at ? new Date(data.basic.last_repaid_at * 1000) : null),
                            repaidAt: (data.basic.repaid_at ? new Date(data.basic.repaid_at * 1000) : null),
                            unpaidAt: (data.basic.unpaid_at ? new Date(data.basic.unpaid_at * 1000) : null),
                            deletedAt: (data.basic.deleted_at ? new Date(data.basic.deleted_at * 1000) : null),
                            events: data.events.map((evt) => {
                                let createdAt = new Date(evt.occurred_at * 1000);
                                switch(evt.event_type) {
                                    case 'admin':
                                        return {
                                            eventType: 'admin',
                                            createdAt: createdAt,
                                            admin: evt.admin,
                                            reason: evt.reason,
                                            oldPrincipalMinor: evt.old_principal_minor,
                                            oldPrincipalRepaymentMinor: evt.old_principal_repayment_minor,
                                            newPrincipalMinor: evt.new_principal_minor,
                                            newPrincipalRepaymentMinor: evt.new_principal_repayment_minor,
                                            oldCreatedAt: new Date(evt.old_created_at * 1000),
                                            newCreatedAt: new Date(evt.new_created_at * 1000),
                                            oldRepaidAt: (evt.old_repaid_at ? new Date(evt.old_repaid_at * 1000) : null),
                                            newRepaidAt: (evt.new_repaid_at ? new Date(evt.new_repaid_at * 1000) : null),
                                            oldUnpaidAt: (evt.old_unpaid_at ? new Date(evt.old_unpaid_at * 1000) : null),
                                            newUnpaidAt: (evt.new_unpaid_at ? new Date(evt.new_unpaid_at * 1000) : null),
                                            oldDeletedAt: (evt.old_deleted_at ? new Date(evt.old_deleted_at * 1000) : null),
                                            newDeletedAt: (evt.new_deleted_at ? new Date(evt.new_deleted_at * 1000) : null)
                                        };
                                    case 'creation':
                                        return {
                                            eventType: 'creation',
                                            createdAt: createdAt,
                                            creationType: evt.creation_type,
                                            creationPermalink: evt.creation_permalink
                                        };
                                    case 'repayment':
                                        return {
                                            eventType: 'repayment',
                                            createdAt: createdAt,
                                            repaymentMinor: evt.repayment_minor
                                        };
                                    case 'unpaid':
                                        return {
                                            eventType: 'unpaid',
                                            createdAt: createdAt,
                                            unpaid: evt.unpaid
                                        };
                                    default:
                                        return null;
                                }
                            }).filter((evt) => evt)
                        }
                    });
                }, 500);
            }).catch(() => {
                this.setState({state: 'errored', desiredState: 'expanded', loan: null});
            });
        }
    };

    LoanDetailsAjax.propTypes = {
        onMinimize: PropTypes.func,
        loanId: PropTypes.number.isRequired,
        includeEditOption: PropTypes.bool
    };

    /**
     * This is the most typical way to expose a loan summary. This is loaded
     * completely with ajax, displays a loan summary, and can swap from summary
     * view to detail view. It also handles navigation back to summary view.
     *
     * @param {integer} loanId The id of the loan which this should load and
     *   display
     * @param {bool} includeEditOption If true there will be a link to edit the
     *   loan. If false or null no such option will be shown.
     */
    class LoanSummaryWithClickToDetails extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                desiredState: 'expanded',
                summary: true
            };
        }

        render() {
            let kwargs = {
                loanId: this.props.loanId,
                includeEditOption: this.props.includeEditOption
            };

            if (this.state.summary) {
                kwargs.onDetails = this.toggleView.bind(this);
            }else {
                kwargs.onMinimize = this.toggleView.bind(this);
            }


            return React.createElement(
                this.state.summary ? LoanSummaryAjax : LoanDetailsAjax,
                kwargs
            );
        }

        toggleView() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.summary = !newState.summary;
                return newState;
            });
        }
    };

    LoanSummaryWithClickToDetails.propTypes = {
        loanId: PropTypes.number.isRequired,
        includeEditOption: PropTypes.bool
    };

    /**
     * Displays a list of loan summaries which can be toggled to a more detailed
     * view. This does not handle deciding what loans should go in the list.
     *
     * As is true with all ajax queries which we support client-side caching on
     * we allow the client to hit a refresh button to cache-bust. We also assume
     * that listings might be paginated and provide a show more button.
     *
     * @param {Array<integer>} loanIds A possibly empty array of loan ids which
     *   should be displayed in this list
     * @param {bool} showRefreshButton True to show a button for reloading
     *   which items belongs in this list, false not to.
     * @param {function} onRefresh A function which is called when the refresh
     *   list contents button is pressed.
     * @param {bool} refreshDisabled No meaning unless showRefreshButton is
     *   true. Sets the disabled state on the refresh button.
     * @param {bool} showSeeMoreButton True to show a button for loading
     *   additional loans, false not to show a see more button (usually because
     *   there is no more content)
     * @param {function} onSeeMore This function is called when see more is
     *   clicked
     * @param {bool} seeMoreDisabled No meaning unless showSeeMoreButton is
     *   true. Sets the disabled state on the see more button.
     * @param {bool} includeEditOption If true there will be a link to edit the
     *   loan for each loan. If false or null no such option will be shown.
     */
    class LoanList extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'loan-list-wrapper'},
                [
                    React.createElement(
                        'div',
                        {className: 'loan-list', key: 'loan-list'},
                        this.props.loanIds.map((i) => {
                            return React.createElement(
                                LoanSummaryWithClickToDetails,
                                {
                                    key: `loan-${i}`,
                                    loanId: i,
                                    includeEditOption: this.props.includeEditOption
                                }
                            );
                        })
                    )
                ].concat((!this.props.showSeeMoreButton && !this.props.showRefreshButton) ? [] : [
                    React.createElement(
                        'div',
                        {className: 'loan-list-controls', key: 'controls'},
                        (!this.props.showRefreshButton ? [] : [
                            React.createElement(
                                Button,
                                {
                                    key: 'refresh-list',
                                    text: 'Refresh List',
                                    style: 'secondary',
                                    type: 'button',
                                    onClick: this.props.onRefresh,
                                    disabled: this.props.refreshDisabled
                                }
                            )
                        ]).concat(
                            !this.props.showSeeMoreButton ? [] : [
                                React.createElement(
                                    Button,
                                    {
                                        key: 'show-more-list',
                                        text: 'Show More',
                                        style: 'primary',
                                        type: 'button',
                                        onClick: this.props.onSeeMore,
                                        disabled: this.props.seeMoreDisabled
                                    }
                                )
                            ]
                        )
                    )
                ])
            );
        }
    }

    LoanList.propTypes = {
        loanIds: PropTypes.arrayOf(PropTypes.number).isRequired,
        showRefreshButton: PropTypes.bool,
        onRefresh: PropTypes.func,
        refreshDisabled: PropTypes.bool,
        showSeeMoreButton: PropTypes.func,
        seeMoreDisabled: PropTypes.bool,
        includeEditOption: PropTypes.bool
    }

    /**
     * Displays a spinner, runs a specific ajax call, then uses the result to
     * populate a loan list. The ajax call is always to the standard loans
     * index endpoint, but the parameters are as specified. This will handle
     * key-space descending pagination for you.
     *
     * This will always show a refresh button.
     *
     * @param {object} parameters The query parameters to the loans index
     *   endpoint. Should not include any pagination parameters such as
     *   limit, minId, and maxId
     * @param {integer} pageSize The target size per page, i.e., how many more
     *   items you see when you click "see more"
     * @param {bool} includeEditOption If true there will be a button to edit
     *   the loan. If false or null, there will not be a button to edit the
     *   loan.
     */
    class LoanListAjax extends React.Component {
        constructor(props) {
            super(props);

            // When refreshing we apply some minimum delay time in order to
            // ensure even on fast connections you get that visceral feedback
            // that we really reloaded the data.

            this.state = {
                loanIds: [],
                errorMessage: null,
                fetchingMore: false,
                haveMore: true,
                refreshing: true,
                refreshTimeoutSeen: true,
                refreshContentLoaded: false
            }
            this.realOnRefresh(false);
        }

        render() {
            if (this.state.refreshing) {
                return React.createElement(
                    'div',
                    {className: 'loan-list-wrapper loan-list-wrapper-loading'},
                    React.createElement(Spinner)
                );
            }

            if (this.state.errorMessage) {
                return React.createElement(
                    'div',
                    {className: 'loan-list-wrapper loan-list-wrapper-errored'},
                    [
                        React.createElement(
                            React.Fragment,
                            {key: 'text'},
                            this.state.errorMessage
                        ),
                        React.createElement(
                            Button,
                            {
                                key: 'btn',
                                text: 'Retry',
                                style: 'primary',
                                type: 'button',
                                onClick: (() => this.onRefresh(true, false)).bind(this),
                                focusQuery: this.props.focusQuery,
                                focusSet: this.props.focusSet
                            }
                        )
                    ]
                )
            }

            return React.createElement(
                LoanList,
                {
                    loanIds: this.state.loanIds,
                    showRefreshButton: true,
                    onRefresh: (() => this.onRefresh(true, false)).bind(this),
                    refreshDisabled: this.state.fetchingMore,
                    showSeeMoreButton: this.state.haveMore,
                    onSeeMore: this.onSeeMore.bind(this),
                    seeMoreDisabled: this.state.fetchingMore,
                    includeEditOption: this.props.includeEditOption
                }
            );
        }

        onRefresh(force, skipTimeout) {
            force = !!force;
            skipTimeout = !!skipTimeout;

            if (this.state.refreshing || this.state.fetchingMore) {
                return;
            }

            this.setState({
                loanIds: [],
                errorMessage: null,
                fetchingMore: false,
                haveMore: true,
                refreshing: true,
                refreshTimeoutSeen: skipTimeout,
                refreshContentLoaded: false
            });

            if (!skipTimeout) {
                setTimeout((() => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.refreshTimeoutSeen = true;
                        newState.refreshing = !newState.refreshContentLoaded;
                        return newState;
                    });
                }).bind(this), 500);
            }

            this.realOnRefresh(force);
        }

        realOnRefresh(force) {
            let headers = {'Content-Type': 'application/json'};
            if (force) {
                headers['Cache-Control'] = 'no-cache';
            }

            let realParameters = Object.assign({}, this.props.parameters);
            realParameters.limit = this.props.pageSize;
            realParameters.order = 'id_desc';
            let paramsStr = Object.entries(realParameters).filter(([_, val]) => val !== null).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
            api_fetch(
                `/api/loans?${paramsStr}`, AuthHelper.auth({
                    headers: headers
                })
            ).then((resp) => {
                if (resp.ok) {
                    return resp.json();
                }

                if (resp.status === 422) {
                    return resp.json().then((json) => {
                        return Promise.reject(`422: Unprocessable Entity (${json.detail[0].loc} - ${json.detail[0].msg})`);
                    });
                }

                return Promise.reject(`${resp.status}: ${resp.statusText}`)
            }).then((loanIds) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.refreshContentLoaded = true;
                    newState.refreshing = !newState.refreshTimeoutSeen;
                    newState.loanIds = loanIds;
                    newState.haveMore = loanIds.length >= this.props.pageSize;
                    return newState;
                });
            }).catch((msg) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.refreshContentLoaded = true;
                    newState.errorMessage = msg.toString();
                    newState.refreshing = !newState.refreshTimeoutSeen;
                    return newState;
                });
            });
        }

        onSeeMore() {
            if (this.state.refreshing || this.state.fetchingMore || !this.state.haveMore) {
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.fetchingMore = true;
                return newState;
            })

            let realParameters = Object.assign({}, this.props.parameters);
            realParameters.limit = this.props.pageSize;
            realParameters.before_id = this.state.loanIds[this.state.loanIds.length - 1];
            realParameters.order = 'id_desc';
            let paramsStr = Object.entries(realParameters).filter(([_, val]) => val !== null).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
            api_fetch(
                `/api/loans?${paramsStr}`, AuthHelper.auth({
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                })
            ).then((resp) => {
                if (resp.ok) {
                    return resp.json();
                }

                if (resp.status === 422) {
                    return resp.json().then((json) => {
                        return Promise.reject(`422: Unprocessable Entity (${json.detail[0].loc} - ${json.detail[0].msg})`);
                    });
                }

                return Promise.reject(`${resp.status}: ${resp.statusText}`)
            }).then((loanIds) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.fetchingMore = false;
                    newState.loanIds = newState.loanIds.concat(loanIds);
                    newState.haveMore = loanIds.length >= this.props.pageSize;
                    return newState;
                });
            }).catch((msg) => {
                console.log(msg);
                msg = msg.toString();
                console.log(msg);

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.errorMessage = msg;
                    newState.refreshing = false;
                    newState.fetchingMore = false;
                    return newState;
                });
            });
        }
    }

    LoanListAjax.propTypes = {
        parameters: PropTypes.object,
        pageSize: PropTypes.number.isRequired,
        includeEditOption: PropTypes.bool
    };

    /**
     * Displays a form which contains all the possible filters on loans and
     * exposes the values on all the fields. This doesn't actually do anything
     * with this information and is mainly intended for styling and client-side
     * validation/feedback.
     *
     * This has a collapsed and expanded mode. In collapsed mode it displays
     * either the preset name or the word "Custom" as a dropdown for selecting
     * presets, and a button for "Advanced" to expand. The presets available
     * are
     *
     * - "My Inprogress Loans"
     * - "My Loans"
     * - "My Unpaid Loans"
     * - "All Loans"
     *
     * In expanded mode it expands the height of the component (not a popup)
     * and shows the following in order of prominence:
     *
     * - The preset name or the word "Custom" as a dropdown for selecting presets
     * - A button for "Basic" to minimize
     * - A "lender" field and a "borrower" field with a dropdown in between them
     *   which chooses between "AND" (the default) or "OR". In the "AND" state
     *   both need to match, in the OR state either one needs to match. (Empty
     *   fields handled separately. Both empty -> always true. One empty ->
     *   choose most restrictive option that it's possible for loans to meet)
     * - A dropdown for "Repaid Only", "Unpaid Only", "Inprogress Only", "All Statuses"
     * - Any already applied custom fields
     * - If there are are more custom fields, a dropdown containing:
     *   + Loan ID
     *   + Creation Date
     *   + Currency
     *   + Limit
     *   + Include Deleted? (admin only)
     *
     * @param {string} username The username of the logged in user. Used for
     *   many of the presets.
     * @param {bool} includeDeletedOption If true, the Include Deleted?
     *   bonus field will be visible. Otherwise, if false, the Include
     *   Deleted? bonus field will not be visible.
     * @param {function} filterChanged A function which we call with no
     *   arguments whenever the filters change. Should be careful not to make
     *   too many requests to the server; it's usually a good idea to wait
     *   until there haven't been any changes for 1-3 seconds before making
     *   a request.
     * @param {function} filterQuery A function which we call after render
     *   with a function which returns the currently selected filters as
     *   an object whose key/value pairs can be used as query arguments to
     *   the loans index endpoint.
     */
    class LoanFilterForm extends React.Component {
        constructor(props) {
            super(props);

            let changed = (() => {
                this.presetSet('custom');
                if (this.props.filterChanged) {
                    this.props.filterChanged();
                }
            }).bind(this);
            this.allFilters = {
                user: {
                    extraFilterText: 'Users Involved',
                    component: LoanUserFilter,
                    componentArgs: {
                        key: 'user-filter',
                        borrowerQuery: ((query) => this.allFilters.user.borrowerQuery = query).bind(this),
                        lenderQuery: ((query) => this.allFilters.user.lenderQuery = query).bind(this),
                        operatorQuery: ((query) => this.allFilters.user.operatorQuery = query).bind(this),
                        borrowerSet: ((setter) => this.allFilters.user.borrowerSet = setter).bind(this),
                        lenderSet: ((setter) => this.allFilters.user.lenderSet = setter).bind(this),
                        operatorSet: ((setter) => this.allFilters.user.operatorSet = setter).bind(this),
                        borrowerChanged: changed,
                        lenderChanged: changed,
                        operatorChanged: changed
                    },
                    getParams()  {
                        return {
                            borrower_name: this.borrowerQuery(),
                            lender_name: this.lenderQuery(),
                            user_operator: this.operatorQuery()
                        };
                    },
                    clearState() {
                        this.borrowerSet('');
                        this.lenderSet('');
                        this.operatorSet('OR');
                    }
                },
                state: {
                    extraFilterText: 'Loan State',
                    component: LoanStateFilter,
                    componentArgs: {
                        key: 'state-filter',
                        stateQuery: ((query) => this.allFilters.state.stateQuery = query).bind(this),
                        stateSet: ((setter) => this.allFilters.state.stateSet = setter).bind(this),
                        stateChanged: changed
                    },
                    getParams() {
                        let state = this.stateQuery();
                        if (state === 'all') { return {}; }
                        if (state === 'inprogress') {
                            return {
                                repaid: false,
                                unpaid: false
                            };
                        }
                        if (state === 'repaid-only') {
                            return {
                                repaid: true,
                                unpaid: false
                            };
                        }
                        return {
                            repaid: false,
                            unpaid: true
                        };
                    },
                    clearState() {
                        this.stateSet('all');
                    }
                },
                id: {
                    extraFilterText: 'Loan ID',
                    component: LoanIDFilter,
                    componentArgs: {
                        key: 'id-filter',
                        idQuery: ((query) => this.allFilters.id.idQuery = query).bind(this),
                        idSet: ((setter) => this.allFilters.id.idSet = setter).bind(this),
                        idChanged: changed
                    },
                    getParams() {
                        return {
                            loan_id: this.idQuery()
                        };
                    },
                    clearState() {
                        this.idSet(null);
                    }
                },
                time: {
                    extraFilterText: 'Creation Time',
                    component: LoanTimeFilter,
                    componentArgs: {
                        key: 'time-filter',
                        minTimeQuery: ((query) => this.allFilters.time.minTimeQuery = query).bind(this),
                        minTimeSet: ((setter) => this.allFilters.time.minTimeSet = setter).bind(this),
                        minTimeChanged: changed,
                        maxTimeQuery: ((query) => this.allFilters.time.maxTimeQuery = query).bind(this),
                        maxTimeSet: ((setter) => this.allFilters.time.maxTimeSet = setter).bind(this),
                        maxTimeChanged: changed,
                    },
                    getParams() {
                        let beforeTime = this.maxTimeQuery();
                        let afterTime = this.minTimeQuery();
                        return {
                            before_time: (beforeTime === null ? null : parseInt(beforeTime.getTime() / 1000)),
                            after_time: (afterTime === null ? null : parseInt(afterTime.getTime() / 1000))
                        }
                    },
                    clearState() {
                        this.minTimeSet(null);
                        this.maxTimeSet(null);
                    }
                },
                deleted: {
                    extraFilterText: 'Include Deleted Loans',
                    component: LoanDeletedFilter,
                    componentArgs: {
                        key: 'deleted-filter',
                        includeDeletedQuery: ((query) => this.allFilters.deleted.valueQuery = query).bind(this),
                        includeDeletedSet: ((setter) => this.allFilters.deleted.valueSet = setter).bind(this),
                        includeDeletedChanged: changed
                    },
                    getParams() {
                        return {
                            include_deleted: this.valueQuery()
                        };
                    },
                    clearState() {
                        this.valueSet(false);
                    }
                }
            }
            this.presetQuery = null;
            this.presetSet = null;
            this.extraFilterQuery = null;

            this.orderedFilters = ['id', 'user', 'state', 'time', 'deleted'];
            this.initialFilters = ['user', 'state'];

            this.state = {
                view: 'basic',
                filters: ['user', 'state'],
                extraFilters: ['id', 'time', 'deleted']
            };
            this.state.extraFilters.sort();
        }

        render() {
            return React.createElement(
                'div',
                {className: `loan-filter-form loan-filter-form-${this.state.view}`},
                [
                    React.createElement(
                        'div',
                        {key: 'header', className: 'loan-filter-form-header'},
                        [
                            React.createElement(
                                FormElement,
                                {
                                    key: 'preset',
                                    labelText: 'Preset',
                                    component: DropDown,
                                    componentArgs: {
                                        options: (this.props.username === null ? [] : [
                                            {key: 'inprogress', text: 'My Inprogress Loans'},
                                            {key: 'mine', text: 'My Loans'},
                                            {key: 'unpaid', text: 'My Unpaid Loans'}
                                        ]).concat([
                                            {key: 'all', text: 'All Loans'},
                                            {key: 'custom', text: 'Custom Search'}
                                        ]),
                                        optionQuery: ((query) => this.presetQuery = query).bind(this),
                                        optionSet: ((setter) => this.presetSet = setter).bind(this),
                                        optionChanged: ((newPreset) => {
                                            if (newPreset === 'custom') { return; }
                                            this.applyPreset(newPreset);
                                        }).bind(this)
                                    }
                                }
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'toggle-view-button',
                                    text: this.state.view === 'basic' ? 'Show Advanced Filters' : 'Hide Advanced Filters',
                                    style: 'secondary',
                                    type: 'button',
                                    onClick: (() => {
                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.view = newState.view === 'basic' ? 'advanced' : 'basic';
                                            return newState;
                                        });
                                    }).bind(this)
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'advanced',
                            initialState: 'closed',
                            desiredState: this.state.view === 'basic' ? 'closed' : 'expanded'
                        },
                        this.orderedFilters.map((filterKey) => {
                            let filter = this.allFilters[filterKey];
                            let expanded = this.state.filters.includes(filterKey);

                            return React.createElement(
                                SmartHeightEased,
                                {
                                    key: filterKey,
                                    initialState: this.initialFilters.includes(filterKey) ? 'expanded' : 'closed',
                                    desiredState: expanded ? 'expanded' : 'closed'
                                },
                                React.createElement(
                                    filter.component,
                                    filter.componentArgs
                                )
                            )
                        }).concat([
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'extra-filters',
                                    initialState: 'expanded',
                                    desiredState: this.state.extraFilters.length === 0 ? 'closed' : 'expanded',
                                },
                                [
                                    React.createElement(
                                        FormElement,
                                        {
                                            key: 'dropdown',
                                            labelText: 'Select Filter To Add',
                                            component: DropDown,
                                            componentArgs: {
                                                options: this.state.extraFilters.filter((filterKey) => {
                                                    return filterKey !== 'deleted' || this.props.includeDeletedOption;
                                                }).map((filterKey) => {
                                                    return { key: filterKey, text: this.allFilters[filterKey].extraFilterText };
                                                }),
                                                optionQuery: ((query) => this.extraFilterQuery = query).bind(this)
                                            }
                                        }
                                    ),
                                    React.createElement(
                                        Button,
                                        {
                                            key: 'button',
                                            text: 'Add Filter',
                                            style: 'secondary',
                                            type: 'button',
                                            onClick: (() => {
                                                let filterToAdd = this.extraFilterQuery();
                                                if (filterToAdd === null || filterToAdd === undefined) {
                                                    return;
                                                }
                                                this.setState((state) => {
                                                    if (state.filters.includes(filterToAdd)) {
                                                        return state;
                                                    }
                                                    let newState = Object.assign({}, state);
                                                    newState.filters = newState.filters.concat([filterToAdd]);
                                                    newState.extraFilters = newState.extraFilters.filter((itm) => itm !== filterToAdd);
                                                    return newState;
                                                });
                                            }).bind(this)
                                        }
                                    )
                                ]
                            )
                        ])
                    )
                ]
            )
        }

        componentDidMount() {
            if (this.props.filterQuery) {
                this.props.filterQuery(this.getFilterQuery.bind(this));
            }

            this.presetSet('all');
            this.applyPreset('all');

            let queryParams = new URLSearchParams(window.location.search);
            let username = queryParams.get('username');
            if (username !== null && username !== undefined) {
                this.allFilters.user.borrowerSet(username);
                this.allFilters.user.lenderSet(username);
                this.presetSet('custom');

                if (this.props.filterChanged) {
                    this.props.filterChanged();
                }
            }
        }

        applyPreset(preset) {
            this.clearAllFilters(false);
            if (preset === 'all') {
                this.setShownFilters(['user', 'state'])
            }else if (preset === 'inprogress') {
                this.allFilters.user.lenderSet(this.props.username);
                this.allFilters.user.borrowerSet(this.props.username);
                this.allFilters.user.operatorSet('OR');
                this.allFilters.state.stateSet('inprogress');
                this.setShownFilters(['user', 'state']);
            }else if (preset === 'mine') {
                this.allFilters.user.lenderSet(this.props.username);
                this.allFilters.user.borrowerSet(this.props.username);
                this.allFilters.user.operatorSet('OR');
                this.setShownFilters(['user']);
            } else if (preset === 'unpaid') {
                this.allFilters.user.lenderSet(this.props.username);
                this.allFilters.user.borrowerSet(this.props.username);
                this.allFilters.user.operatorSet('OR');
                this.allFilters.state.stateSet('unpaid-only');
                this.setShownFilters(['user', 'state']);
            }

            if (this.props.filterChanged) {
                this.props.filterChanged();
            }
        }

        getFilterQuery() {
            let result = {};
            for (let filterKey in this.allFilters) {
                let filter = this.allFilters[filterKey];
                let params = filter.getParams();

                for (let paramKey in params) {
                    result[paramKey] = params[paramKey];
                }
            }
            return result;
        }

        clearAllFilters(resetExtraFilters) {
            for (let filterKey in this.allFilters) {
                this.allFilters[filterKey].clearState();
            }

            if (resetExtraFilters) {
                this.setState(((state) => {
                    let newState = Object.assign({}, state);
                    newState.filters = [];
                    newState.extraFilters = this.defaultExtraFilters();
                    return newState;
                }).bind(this));
            }
        }

        setShownFilters(filters) {
            let extraFilters = [];
            for (let filterKey in this.allFilters) {
                if (!filters.includes(filterKey)) {
                    extraFilters.push(filterKey);
                }
            }
            extraFilters.sort();
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.filters = filters;
                newState.extraFilters = extraFilters;
                return newState;
            });
        }

        defaultExtraFilters() {
            let result = [];
            //let result = ['time'].concat(this.props.includeDeletedOption ? ['deleted'] : []);
            result.sort();
            return result;
        }
    };

    LoanFilterForm.propTypes = {
        username: PropTypes.string,
        includeDeletedOption: PropTypes.bool,
        filterChanged: PropTypes.func,
        filterQuery: PropTypes.func
    };

    /**
     * Displays a loan filter form and uses it to fill a loan list.
     * This will provide all the expected features:
     * - 3-tier filters (Presets -> Basic -> Advanced) to prevent the interface
     *   from becoming overwhelming.
     * - Changing the filter form will get immediate feedback in the listing
     * - Refresh the list or an individual loan
     * - Defaults to summary views, click to expand loans and click again to
     *   minimize
     * - Background colors highlight the state of the loan. Colors selected to
     *   ensure more critical distinctions are clear to all major color
     *   blindness types.
     * - Keyboard navigation
     * - Key-space pagination
     * - WCAG-AAA contrast throughout.
     * - Mobile friendly design
     * - Download link (fills a text area with csv)
     */
    class LoanFilterFormWithList extends React.Component {
        constructor(props) {
            super(props);

            this.filterQuery = null;
            this.state = {
                spinner: true,
                desiredState: 'expanded',
                timeout: null,
                params: null,
                minimizing: false,
                username: null,
                showDeleted: false,
                includeEditOption: false,
                downloadAvailable: false,
                downloadExpanded: false,
                downloadDisabled: false,
                downloadSpinner: true,
                downloadText: ''
            }

            if (AuthHelper.isLoggedIn()) {
                api_fetch(
                    `/api/users/${AuthHelper.getAuthToken().userId}/me`, AuthHelper.auth()
                ).then((res) => {
                    if (!res.ok) {
                        return Promise.reject(res.statusText);
                    }
                    return res.json();
                }).then((json) => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.username = json.username;
                        newState.downloadAvailable = true;
                        return newState;
                    });
                });

                api_fetch(
                    `/api/users/${AuthHelper.getAuthToken().userId}/permissions`, AuthHelper.auth()
                ).then((res) => {
                    if (!res.ok) {
                        return Promise.reject(res.statusText);
                    }
                    return res.json();
                }).then((json) => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.showDeleted = json.permissions.includes('view_deleted_loans');
                        newState.includeEditOption = json.permissions.includes('edit_loans');
                        return newState;
                    });
                })
            }

            this.onDownloadCSVClicked = this.onDownloadCSVClicked.bind(this);

            this.setDownloadAlert = null;
        }

        render() {
            return React.createElement(
                'div',
                {className: 'loan-filter-form-with-list'},
                [
                    React.createElement(
                        LoanFilterForm,
                        {
                            key: 'filter-form',
                            username: this.state.username,
                            includeDeletedOption: this.state.showDeleted,
                            filterQuery: ((query) => { this.filterQuery = query; }).bind(this),
                            filterChanged: this.onFilterChanged.bind(this)
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'loan-download',
                            initialState: 'closed',
                            desiredState: this.state.downloadAvailable ? 'expanded' : 'closed'
                        },
                        [
                            React.createElement(
                                Alertable,
                                {
                                    key: 'loan-download-button',
                                    alertSet: ((alrt) => { this.setDownloadAlert = alrt })
                                },
                                React.createElement(
                                    Button,
                                    {
                                        text: this.state.downloadExpanded ? 'Close CSV' : 'Download and Show CSV',
                                        type: 'button',
                                        disabled: this.state.downloadDisabled,
                                        onClick: this.onDownloadCSVClicked
                                    }
                                )
                            ),
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'csv',
                                    initialState: 'closed',
                                    desiredState: this.state.downloadExpanded ? 'expanded' : 'closed'
                                },
                                this.state.downloadSpinner ?
                                React.createElement(CenteredSpinner) :
                                React.createElement(
                                    TextArea,
                                    {
                                        text: this.state.downloadText,
                                        rows: 10,
                                        disabled: true
                                    }
                                )
                            )
                        ]
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'inner',
                            initialState: 'expanded',
                            desiredState: this.state.desiredState
                        },
                        this.state.spinner ?
                        React.createElement(
                            'div',
                            {className: 'loan-list-wrapper loan-list-wrapper-loading', key: 'spinner'},
                            React.createElement(Spinner)
                        ) :
                        React.createElement(
                            LoanListAjax,
                            {
                                key: 'list',
                                parameters: this.state.params,
                                pageSize: 4,
                                includeEditOption: this.state.includeEditOption
                            }
                        )
                    )
                ]
            );
        }

        onFilterChanged() {
            if (this.state.minimizing) {
                return;
            }

            if (this.state.timeout !== null) {
                clearTimeout(this.state.timeout);
            } else if (this.state.spinner) {
                // No timeout + spinner = first render
                let params = this.filterQuery();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.params = params;
                    newState.spinner = false;
                    return newState;
                });
                return;
            } else {
                // No timeout + no spinner = minimize, switch to spinner, delay

                let newState = Object.assign({}, this.state);
                newState.desiredState = 'closed';
                newState.minimizing = true;
                newState.timeout = setTimeout((() => {
                    let newState2 = Object.assign({}, this.state);
                    newState2.desiredState = 'expanded';
                    newState2.spinner = true;
                    newState2.timeout = setTimeout((() => {
                        let newState3 = Object.assign({}, this.state);
                        newState3.minimizing = false;
                        newState3.timeout = setTimeout((() => {
                            let params = Object.assign({}, this.filterQuery());
                            params.pageSize = 5;

                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.params = params;
                                newState.spinner = false;
                                newState.timeout = null;
                                return newState;
                            });
                        }), 1000);
                        this.setState(newState3);
                    }).bind(this), 500);
                    this.setState(newState2);
                }).bind(this), 500);
                this.setState(newState);
                return;
            }

            let newState = Object.assign({}, this.state);
            newState.timeout = setTimeout((() => {
                let params = Object.assign({}, this.filterQuery());
                params.pageSize = 5;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.params = params;
                    newState.spinner = false;
                    newState.timeout = null;
                    return newState;
                });
            }).bind(this), 1000);
            this.setState(newState);
        }

        async onDownloadCSVClicked() {
            this.setDownloadAlert();
            if (this.state.downloadExpanded) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.downloadExpanded = false;
                    newState.downloadSpinner = true;
                    newState.downloadDisabled = false;
                    newState.downloadText = '';
                    return newState;
                });
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.downloadExpanded = true;
                newState.downloadSpinner = true;
                newState.downloadDisabled = true;
                newState.downloadText = 'loan_id,lender,borrower,currency_code,principal_minor,principal_repayment_minor,created_at,repaid_at,last_repaid_at,unpaid_at\n';
                return newState;
            })

            this.fetchAfter(null);
        }

        async fetchAfter(afterID) {
            let pageSize = 50;
            let realParameters = Object.assign({}, this.filterQuery());
            realParameters.limit = pageSize;
            realParameters.order = 'id_asc';

            while (true) {
                realParameters.after_id = afterID;
                let paramsStr = Object.entries(realParameters).filter(([_, val]) => val !== null).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');

                let handled = true;
                let resp = await api_fetch(`/api/loans?${paramsStr}`, AuthHelper.auth());
                if (!resp.ok) {
                    handled = true;
                    if (resp.status == 429) {
                        setTimeout(() => this.fetchAfter(afterID), 15000);
                        return;
                    }
                    AlertHelper.createFromResponse('fetch page', resp).then(this.setDownloadAlert);
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.downloadDisabled = false;
                        newState.downloadExpanded = false;
                        return newState;
                    });
                    return;
                }
                let loanIDs = await resp.json();
                let loanResponses = await Promise.all(loanIDs.map((loanID) => {
                    return api_fetch(`/api/loans/${loanID}`, AuthHelper.auth());
                }))

                let lines = [];
                for (let idx = 0; idx < loanIDs.length; idx++) {
                    afterID = loanIDs[idx];
                    let resp = loanResponses[idx];

                    if (resp.status === 429) {
                        let newAfterID = (idx === 0 ? afterID : loanIDs[idx - 1]);
                        setTimeout(() => this.fetchAfter(newAfterID), 15000);
                        return;
                    }

                    if (!resp.ok) {
                        AlertHelper.createFromResponse('fetch loan', resp).then(this.setDownloadAlert);
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.downloadDisabled = false;
                            newState.downloadExpanded = false;
                            return newState;
                        });
                        return;
                    }

                    let loanInfo = await resp.json();
                    lines.push([
                        loanIDs[idx],
                        loanInfo.lender,
                        loanInfo.borrower,
                        loanInfo.currency_code,
                        loanInfo.principal_minor,
                        loanInfo.principal_repayment_minor,
                        loanInfo.created_at,
                        loanInfo.repaid_at,
                        loanInfo.last_repaid_at,
                        loanInfo.unpaid_at
                    ].join(','));
                }

                let joinedLines = lines.join("\n")
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.downloadText += joinedLines
                    newState.downloadText += '\n'
                    return newState;
                });

                if (loanIDs.length < pageSize) {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.downloadSpinner = false;
                        newState.downloadDisabled = false;
                        return newState;
                    })
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, 2000))
            }
        }

        componentWillUnmount() {
            if (this.state.timeout) {
                clearTimeout(this.state.timeout);
            }
        }
    }

    LoanFilterFormWithList.propTypes = {};

    return [
        LoanSummary, LoanSummaryAjax, LoanList, LoanListAjax, LoanDetails,
        LoanDetailsAjax, LoanSummaryWithClickToDetails, LoanFilterForm,
        LoanFilterFormWithList
    ];
})();
