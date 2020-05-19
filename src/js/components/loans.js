const [
    LoanSummary, LoanSummaryAjax, LoanList, LoanListAjax, LoanDetails,
    LoanDetailsAjax, LoanSummaryWithClickToModal, LoanFilterForm,
    LoanFilterFormWithList
] = (function() {
    /**
     * A brief summary of a loan. This is intended to explain the lender,
     * borrower, principal, principal repaid, unpaid status, and a sense of
     * recency.
     *
     * This is a pure style component. To wrap this with an ajax call and a
     * spinner use LoanSummaryAjax
     *
     * @param {boolean} showRefreshButton If true a refresh button is displayed
     *   which when clicked triggers onRefresh. This should reload the content
     *   of this loan summary. It's important that even if the content does not
     *   change there is a visual indicator of success, which is usually done by
     *   swapping this to a spinner or disabling the refresh button.
     * @param {function} onRefresh Only ever called if showRefreshButton is true.
     *   Invoked when the refresh button is clicked.
     * @param {boolean} refreshDisabled If showRefreshButton is false this has no
     *   effect. Otherwise, if this is true, the refresh button is given the
     *   disabled state and if false the refresh button is not given the disabled
     *   state.
     * @param {string} lender The username of the lender
     * @param {string} borrower The username of the borrower
     * @param {string} currency_code The uppercase ISO4217 currency code this
     *  loan is stored in.
     * @param {string} currency_symbol The symbol for the currency, e.g., '$'
     * @param {boolean} currency_symbol_on_left True if the currency symbol
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
    class LoanSummary extends React.Component {

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
     * This is typically displayed in a modal which is loaded when a user clicks
     * a loan summary (see LoanSummaryWithClickToModal).
     *
     * @param {boolean} showRefreshButton If true a refresh button is displayed
     *   which when clicked triggers onRefresh. This should reload the content
     *   of this loan summary. It's important that even if the content does not
     *   change there is a visual indicator of success, which is usually done by
     *   swapping this to a spinner or disabling the refresh button.
     * @param {function} onRefresh Only ever called if showRefreshButton is true.
     *   Invoked when the refresh button is clicked.
     * @param {boolean} refreshDisabled If showRefreshButton is false this has no
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
     *       permission to this field, this is null.
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
     *     - {boolean} True if this was marking the loan unpaid, false if it
     *       was removing the unpaid flag.
     * @param {string} lender The username of the lender
     * @param {string} borrower The username of the borrower
     * @param {string} currency_code The uppercase ISO4217 currency code this
     *  loan is stored in.
     * @param {string} currency_symbol The symbol for the currency, e.g., '$'
     * @param {boolean} currency_symbol_on_left True if the currency symbol
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
     */
    class LoanDetailsAjax extends React.Component {

    };

    /**
     * This is the most typical way to expose a loan summary. This is loaded
     * completely with ajax, displays a loan summary, and when clicked pops
     * up a modal with the loan details.
     */
    class LoanSummaryWithClickToModal extends React.Component {

    };

    /**
     * Displays a list of loan summaries where clicking one pops up a modal
     * with additional details. This does not handle deciding what loans
     * should go in the list.
     */
    class LoanList extends React.Component {

    };

    /**
     * Displays a spinner, runs a specific ajax call, then uses the result to
     * populate a loan list. The ajax call is always to the standard loans
     * index endpoint, but the parameters are as specified.
     *
     * @param {object} parameters The query parameters to the loans index
     *   endpoint.
     */
    class LoanListAjax extends React.Component {

    }

    /**
     * Displays a form which contains all the possible filters on loans and
     * exposes the values on all the fields. This doesn't actually do anything
     * with this information and is mainly intended for styling and client-side
     * validation/feedback.
     */
    class LoanFilterForm extends React.Component {

    };

    /**
     * Displays a loan filter form and uses it to fill a loan list.
     */
    class LoanFilterFormWithList extends React.Component {

    };

    return [
        LoanSummary, LoanSummaryAjax, LoanList, LoanListAjax, LoanDetails,
        LoanDetailsAjax, LoanSummaryWithClickToModal, LoanFilterForm,
        LoanFilterFormWithList
    ];
})();