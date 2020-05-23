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
     * This supports keyboard-only navigation. Arrow key navigation will be
     * used to jump between elements within this component unless an element
     * is focused which uses arrows, in which this will allow tab/shift tab
     * to jump between elements within this component. Left/right/up/down will
     * all be selected as is visually appropriate.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
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
     * @param {Date} lastRepaidAt When money was last put toward repaying this loan
     * @param {Date, null} repaidAt When the loan was completely repaid. Should
     *   only be set if the principal and principal repayment are equal.
     * @param {Date, null} unpaidAt When the loan was marked as unapid. Should
     *   only be set if the principal is less than the principal repayment.
     */
    class LoanSummary extends React.Component {
        render() {
            var loanState = 'inprogress';
            if (this.props.repaidAt) {
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
                                {key: 'arrow', className: 'loan-involved-arrow'},
                                '->'
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
                ]
            )
        }
    };

    LoanSummary.propTypes = {
        focusQuery: PropTypes.func,
        focusSet: PropTypes.func,
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
        unpaidAt: PropTypes.instanceOf(Date)
    };

    /**
     * A light wrapper around a loan summary which loads the content from the
     * loan show endpoint, meaning it only needs the loan id. This will always
     * show the refresh button on the loan summary.
     *
     * For smart clients, it's recommended to load the index page and then load
     * each of the loans via different requests. For dumb clients, it's strongly
     * preferred if a single more expensive request is made. A "smart" client
     * needs to respect the following:
     * - It must use HTTP/2 so that all the requests use a single TCP
     *   connection
     * - It must respect cache-control headers
     * - (UI only) It can intelligently refresh loans that are stale, typically
     *   by user request or because the user just manipulated the loan, before
     *   the cache expiration time.
     * - It should only send a reasonable number of requests through any one
     *   connection. A typical limit is around 100 concurrent requests over
     *   an HTTP/2 connection. (Note, the limit should never exceed 8 on
     *   HTTP/1.1 connections, and is usually 2-6.)
     *
     * This means if you're going to plug-and-play the API into excel, for
     * example, don't do what this component does. However if you're going to
     * use a python client, then you can either use bulk requests using HTTP/1.1
     * (i.e., the requests library) or many small requests using HTTP/2 (i.e, the
     * Hyper library). The longer the lifetime of the application the more you
     * can benefit from the built-in client side request deduplication/caching
     * from small requests.
     *
     * It is not necessary or helpful to cache this component; the ajax call
     * itself will be appropriately cached.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {integer} loanId The id of the loan that should be loaded into a
     *   loan summary.
     */
    class LoanSummaryAjax extends React.Component {

    }

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
     * This uses arrow-key navigation within components unless a component is
     * focused which itself uses the arrow keys, in which case this will allow
     * tab/shift-tab to jump between components within this. This will
     * optionally show a button to minimize.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {function} onMinimize If not null a minimize button will be shown
     *   and this function will be triggered if it's clicked. This should not
     *   be the only way to minimize a component.
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
     *     - {string} event_type Acts as an enum to identify the type of
     *         event this is. Takes one of the following values and determines
     *         the rest of the keys (and their meanings): "admin", "creation",
     *         "repayment", "unpaid"
     *     - {Date} createdAt When this event occurred
     *   For admin events:
     *     - {string, null} adminUsername If our account has access to view
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
     *     - {integer} repayment_minor The amount that was repaid, in the loan
     *       currency minor units.
     *   For unpaid events:
     *     - {bool} True if this was marking the loan unpaid, false if it
     *       was removing the unpaid flag.
     * @param {string} lender The username of the lender
     * @param {string} borrower The username of the borrower
     * @param {string} currency_code The uppercase ISO4217 currency code this
     *  loan is stored in.
     * @param {string} currency_symbol The symbol for the currency, e.g., '$'
     * @param {bool} currency_symbol_on_left True if the currency symbol
     *  should be on the left, false if the currency symbol should be on the
     *  right.
     * @param {integer} currency_exponent The exponent of the currency the loan
     *   is in. For example, the smallest U.S. denomination is 1 cent. There
     *   are 100 = 10^2 cents in 1 U.S.D. So the U.S. dollar has an exponent of
     *   2. On the other hand, JPY has no minor currency so the "minor" integer
     *   amount is really the same as the major (1 = 10^0) so the exponent is
     *   0.
     * @param {integer} principal_minor The principal of the loan in the minor
     *   unit
     * @param {integer} principal_repayment_minor The principal repayment of
     *   the loan in the minor unit.
     * @param {Date} createdAt When the loan was first created
     * @param {Date, null} repaidAt When the loan was completely repaid. Should
     *   only be set if the principal and principal repayment are equal.
     * @param {Date, null} unpaidAt When the loan was marked as unapid. Should
     *   only be set if the principal is less than the principal repayment.
     */
    class LoanDetails extends React.Component {

    };

    /**
     * A light wrapper around the details of a loan which displays a spinner
     * then loans the details via Ajax and then populates a LoanDetails
     * component. This essentially allows creating a loan details component
     * from just a loan id. It is not necessary or helpful to cache this
     * component; the ajax call itself will be appropriately cached.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {integer} loanId The id of the loan to display details for.
     */
    class LoanDetailsAjax extends React.Component {

    };

    /**
     * This is the most typical way to expose a loan summary. This is loaded
     * completely with ajax, displays a loan summary, and when clicked swaps
     * from summary view to detail view. It then handles navigation back to
     * summary view.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {integer} loanId The id of the loan which this should load and
     *   display
     */
    class LoanSummaryWithClickToDetails extends React.Component {

    };

    /**
     * Displays a list of loan summaries where clicking one toggles between
     * summary and detail view. This does not handle deciding what loans
     * should go in the list.
     *
     * As is true with all ajax queries which we anticipate client-side
     * caching on we allow the client to hit a refresh button to cache-bust.
     * We also assume that listings might be paginated and provide a show
     * more button.
     *
     * This supports keyboard-only navigation. For minimized loans, up/down
     * will move between loans and space to expand. For expanded loans,
     * left/right/up/down navigates within the loan and tab/shift tab move
     * between loans. There's a button to minimize which can be selected
     * (focus + space) to minimize. Whenever a loan (or any component
     * within which doesn't use home/end itself) is focused, Home/End will
     * minimize if not already minimized and otherwise jump to the first/last
     * loan in the list respectively.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {Array<integer>} loanIds A possibly empty array of loan ids which
     *   should be displayed in this list
     * @param {bool} showRefreshButton True to show a button for reloading
     *   which items belongs in this list, false not to.
     * @param {function} onRefresh A function which is called when the refresh
     *   list contents button is pressed.
     * @param {bool} refreshDisabled No meaning unless showRefreshButton is
     *   true. Sets the disabled state on the refresh button.
     * @param {bool} showSeeMore True to show a button for loading additional
     *   loans, false not to show a see more button (usually because there is
     *   no more content)
     * @param {function} onSeeMore This function is called when see more is
     *   clicked
     * @param {bool} seeMoreDisabled No meaning unless showSeeMore is true.
     *   Sets the disabled state on the see more button.
     */
    class LoanList extends React.Component {

    };

    /**
     * Displays a spinner, runs a specific ajax call, then uses the result to
     * populate a loan list. The ajax call is always to the standard loans
     * index endpoint, but the parameters are as specified.
     *
     * This will always show a refresh button.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {object} parameters The query parameters to the loans index
     *   endpoint. Should not include any pagination parameters such as
     *   limit, minId, and maxId
     * @param {integer} pageSize The target size per page. This uses
     *   key-space pagination, meaning it's not in general possible to get
     *   to jump pages and this has to do a reasonable amount of deduplication
     *   logic.
     */
    class LoanListAjax extends React.Component {

    }

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
     * This supports keyboard-only navigation. When a component which doesn't
     * use arrow keys is focused, tab will jump past this component and arrow
     * keys can be used to jump within this component. When a component which
     * uses arrow keys is focused, tab will jump to the component and arrow
     * keys will manipulate the component. Left/right/up/down acts as is
     * visually appropriate. Home minimizes the filter (if expanded) and
     * focuses the preset. End expands the filter (if minimized) and focuses
     * the first basic option. Space is always used for button selection.
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     * @param {bool} includeDeletedOption If true, the Include Deleted?
     *   bonus field will be visible. Otherwise, if false, the Include
     *   Deleted? bonus field will not be visible.
     * @param {function} onFiltersChanged A function which we call with no
     *   arguments whenever the filters change. Should be careful not to make
     *   too many requests to the server; it's usually a good idea to wait
     *   until there haven't been any changes for 1-3 seconds before making
     *   a request.
     * @param {function} filterQuery A function which we call after render
     *   with a function which returns the currently selected filters as
     *   an object with the following key/value pairs
     *   {string} lenderUsername If not null then only loans which have
     *     lenders which match this query (or meet the borrower query if the
     *     lenderBorrowerOperator is OR) should be returned. Should be a
     *     prefix match unless surrounded with quotes, in which case the quotes
     *     should be ignored and this should be an exact match.
     *   {string} borrowerUsername Similar to lenderUsername but for borrowers.
     *   {string} lenderBorrowerOperator Acts as an enum and decides if we need
     *     both lender and borrower to match ("AND") or only one to match ("OR")
     *   {integer} id If not null only loans which have exactly the specified id
     *     should be returned.
     *   {Date} createdAfter If not null only loans created after this date
     *     should be returned
     *   {Date} createdBefore If not null only loans created before this date
     *     should be returned
     *   {string} currency If not null only loans with this currency should be
     *     returned
     *   {integer} limit If not null, the number of loans the user wants to get.
     *   {bool} includeDeleted If true deleted loans should be included,
     *     otherwise no deleted loans should be included.
     */
    class LoanFilterForm extends React.Component {

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
     * - Intelligent keyboard navigation (Smart tabs, arrow navigation, context
     *   sensitivity)
     * - Key-space pagination
     * - WCAG-AAA contrast throughout.
     * - Mobile friendly design
     *
     * @param {function} focusQuery A function which we call with a function
     *   which accepts no arguments and returns true if this component (or
     *   any of its children) is focused and false otherwise.
     * @param {function} focusSet A function which we call with a function
     *   which accepts not arguments and rips focus to this component.
     */
    class LoanFilterFormWithList extends React.Component {

    };

    return [
        LoanSummary, LoanSummaryAjax, LoanList, LoanListAjax, LoanDetails,
        LoanDetailsAjax, LoanSummaryWithClickToDetails, LoanFilterForm,
        LoanFilterFormWithList
    ];
})();