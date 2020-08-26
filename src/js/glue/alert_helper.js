const AlertHelper = (() => {
    /**
     * This class produces some common Alert components for common
     * situations.
     */
    class AlertHelper {
        /**
         * Creates an href to contact the site administrator
         *
         * @param {object} kwargs Optional values for key, body, subject, message
         */
        createContactSiteAdministratorLink(kwargs) {
            kwargs = kwargs || {};
            return React.createElement(
                'a',
                {
                    key: kwargs.key || 'contact-site-admin',
                    href: (
                        'https://reddit.com/message/compose?to=Tjstretchalot&' +
                        'subject=' + encodeURIComponent(kwargs.subject || '') + '&' +
                        'message=' + encodeURIComponent(kwargs.message || '')
                    ),
                    referrerPolicy: 'strict-origin'
                },
                kwargs.body || 'contact the site administrator'
            )
        }

        /**
         * Creates an href to contact the moderators
         *
         * @param {object} kwargs Optional values for key, body, subject, message
         */
        createContactModsLink(kwargs) {
            kwargs = kwargs || {};
            return React.createElement(
                'a',
                {
                    key: kwargs.key || 'contact-mods',
                    href: (
                        'https://reddit.com/message/compose?to=' +
                        encodeURIComponent('/r/borrow') + '&' +
                        'subject=' + encodeURIComponent(kwargs.subject || '') + '&' +
                        'message=' + encodeURIComponent(kwargs.message || '')
                    ),
                    referrerPolicy: 'strict-origin'
                },
                kwargs.body || 'contact the moderators'
            )
        }

        /**
         * Creates an href to contact the moderators
         *
         * @param {*} kwargs Optional values for key, body
         */
        createMyAccountLink(kwargs) {
            kwargs = kwargs || {};

            return React.createElement(
                'a',
                {
                    key: kwargs.key || 'my-account-href',
                    href: '/my-account.html',
                    referrerPolicy: 'same-origin'
                },
                kwargs.body || 'Account -> My Account'
            );
        }

        /**
         * Creates an href to refresh the page
         *
         * @param {object} kwargs Obtional values for key, body
         */
        createRefreshPageLink(kwargs) {
            kwargs = kwargs || {};

            return React.createElement(
                'a',
                {
                    key: kwargs.key || 'refresh-page',
                    href: '#',
                    onClick: ((e) => {
                        e.preventDefault();
                        window.location.reload();
                    })
                },
                kwargs.body || 'refresh the page'
            )
        }

        /**
         * Creates an href to the logout endpoint
         *
         * @param {object} kwargs Optional values for key, body
         */
        createLogoutLink(kwargs) {
            kwargs = kwargs || {};

            return React.createElement(
                'a',
                {
                    key: kwargs.key || 'logout',
                    href: '/logout.html',
                    referrerPolicy: 'same-origin'
                },
                kwargs.body || 'logout'
            )
        }

        /**
         * Creates a simple 401 alert which asks the user to login
         *
         * @param {string} type The style of the alert
         */
        create401(type = 'warning') {
            return React.createElement(
                Alert,
                {
                    title: '401: Unauthorized',
                    type: type
                },
                React.createElement(
                    'p',
                    {key: 'p1'},
                    [
                        React.createElement(
                            React.Fragment,
                            {key: '1'},
                            'The request was successfully sent to the server but the server ' +
                            'responded that we did not send credentials and credentials are ' +
                            'required for this action. You need to '
                        ),
                        this.createLogoutLink(),
                        React.createElement(
                            React.Fragment,
                            {key: '3'},
                            ' and then log back in. If after performing that step you still see ' +
                            'this message, '
                        ),
                        this.createContactSiteAdministratorLink({
                            subject: 'Unexpected 401',
                            message: `[Page](${window.location.href})\n\nSteps to reproduce on this page`
                        }),
                        React.createElement(
                            React.Fragment,
                            {key: '5'},
                            '.'
                        )
                    ]
                )
            );
        }

        /**
         * Creates a 403 alert which tells the user they don't have permission
         * to make the request.
         *
         * @param {string} type The style of the alert
         */
        create403(type = 'error') {
            return React.createElement(
                Alert,
                {
                    title: '403: Forbidden',
                    type: type
                },
                React.createElement(
                    React.Fragment,
                    null,
                    [
                        React.createElement(
                            'p',
                            {key: 'p1'},
                            'The request was successfully sent to the server but the ' +
                            'server rejected the request on the grounds that although ' +
                            'we sent credentials, our account does not have permission ' +
                            'to perform the given action. If you believe you do have ' +
                            'permission you may just need to log out and log back in.'
                        ),
                        React.createElement(
                            'p',
                            {key: 'p2'},
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: '1'},
                                    'If that does not work, verify you ought to have the permission ' +
                                    'by going to '
                                ),
                                this.createMyAccountLink(),
                                React.createElement(
                                    React.Fragment,
                                    {key: '3'},
                                    '. Select the authentication method with the lowest ID, and under ' +
                                    '"Permissions" verify there is a checkmark next to the appropriate ' +
                                    'permission. If there is, '
                                ),
                                this.createContactSiteAdministratorLink({
                                    subject: 'RedditLoans unexpected 403',
                                    message: (
                                        `[Page](${window.location.href})\n\nDescribe action & expected result here`
                                    )
                                }),
                                React.createElement(
                                    React.Fragment,
                                    {key: '4'},
                                    ' as this is a bug with the site. If there is not, '
                                ),
                                this.createContactModsLink({
                                    subject: 'Requesting RedditLoans permission',
                                    message: (
                                        `[Page](${window.location.href})\n\nDescribe action & reason you need permission`
                                    )
                                }),
                                React.createElement(
                                    React.Fragment,
                                    {key: '5'},
                                    ' to get permission.'
                                )
                            ]
                        )
                    ]
                )
            );
        }

        /**
         * Creates a 404 message that gives common troubleshooting steps for an
         * unexpected api 404.
         *
         * @param {string} actionName The action which failed due to the 404, e.g.,
         *   "save the comment"
         * @param {string} type The style of the alert
         */
        create404(actionName, type = 'error') {
            return React.createElement(
                Alert,
                {
                    type: type,
                    title: '404: Not Found'
                },
                React.createElement(
                    'p',
                    null,
                    [
                        React.createElement(
                            React.Fragment,
                            {key: '1'},
                            `Failed to ${actionName} since according to the server the ` +
                            'resource does not exist. This response can sometimes be returned when ' +
                            'you do not have permission to even know if a resource exists or not, so ' +
                            'the first thing to try is '
                        ),
                        this.createRefreshPageLink({body: 'refreshing the page'}),
                        React.createElement(
                            React.Fragment,
                            {key: '3'},
                            '. If that does not work, try '
                        ),
                        this.createLogoutLink({body: 'logging out'}),
                        React.createElement(
                            React.Fragment,
                            {key: '5'},
                            ' and logging back in. If after those steps you still get this message, '
                        ),
                        this.createContactSiteAdministratorLink({
                            subject: 'Unexpected 404',
                            message: (
                                `[Page](${window.location.href})\n\nExplanation of what you are doing on the page`
                            )
                        }),
                        React.createElement(
                            React.Fragment,
                            {key: '7'},
                            '.'
                        )
                    ]
                )
            )
        }

        /**
         * Creates a 422 message that explains what the server rejected about
         * the response and gives some common troubleshooting steps.
         *
         * @param {object} response The response from the server, which we will
         *   call json() on to get the real response body.
         * @param {string} type The style of alert to produce
         * @return {Promise} A promise for a react component.
         */
        create422(response, type = 'warning') {
            return new Promise((resolve, _) => {
                response.json().then((json) => {
                    // We expect one of two response formats:
                    // detail: [{loc: ['some text', 'some text'], msg: 'some text', type: 'some text'}, ...]
                    // or detail is just an object in which case it's as if the array is length-1

                    let details = Array.isArray(json.detail) ? json.detail : [json.detail];

                    let formattedDetails = details.map((det) => {
                        return `${det.loc.join('.')}: (${det.type}) - ${det.msg}`;
                    });

                    let markdownDetails = '- ' + formattedDetails.join('\n- ');
                    let reactDetails = React.createElement(
                        'ul',
                        {key: 'react-details'},
                        formattedDetails.map((fmted, idx) => {
                            return React.createElement(
                                'li',
                                {key: idx.toString()},
                                fmted
                            )
                        })
                    );

                    resolve(
                        React.createElement(
                            Alert,
                            {
                                type: type,
                                title: '422: Unprocessable Entity'
                            },
                            [
                                React.createElement(
                                    'p',
                                    {key: 'p1'},
                                    [
                                        React.createElement(
                                            React.Fragment,
                                            {key: '1'},
                                            'The request was successfully sent to the server, but the ' +
                                            'server rejected the request. The server said the request was ' +
                                            'correctly formed but contradictory, absurd, likely the result ' +
                                            'of a mistake, or attempting to perform an operation which is ' +
                                            'not supported. If you believe this error is incorrect, '
                                        ),
                                        this.createContactSiteAdministratorLink({
                                            subject: 'Unexpected 422',
                                            message: `[Page](${window.location.href})\n\nError:\n\n${markdownDetails}\n\n` +
                                            'Steps to reproduce:'
                                        }),
                                        React.createElement(
                                            React.Fragment,
                                            {key: '3'},
                                            '.'
                                        )
                                    ]
                                ),
                                React.createElement(
                                    'p',
                                    {key: 'p2'},
                                    'To help resolve the issue the server provided additional ' +
                                    'information. This information is presented as a series of ' +
                                    'errors. Each error is represented in the form '
                                ),
                                React.createElement(
                                    'pre',
                                    {key: 'p3'},
                                    React.createElement(
                                        'code',
                                        {className: 'language-plaintext'},
                                        'bad variable: (type of error) - error text'
                                    )
                                ),
                                React.createElement(
                                    'p',
                                    {key: 'p4'},
                                    [
                                        React.createElement(
                                            React.Fragment,
                                            {key: '1'},
                                            'If you cannot resolve the error yourself you may '
                                        ),
                                        this.createContactModsLink({
                                            subject: 'Having difficulty resolving 422',
                                            message: `[Page](${window.location.href})\n\nError:\n\n ${markdownDetails}` +
                                            '\n\nSteps to reproduce:\n\nWhat I expect to happen\n\nWhat I have tried'
                                        }),
                                        React.createElement(
                                            React.Fragment,
                                            {key: '3'},
                                            '.'
                                        )
                                    ]
                                )
                            ].concat([reactDetails])
                        )
                    )
                }).catch(() => {
                    resolve(
                        React.createElement(
                            Alert,
                            {
                                type: 'error',
                                title: '422: Unprocessable Entity'
                            },
                            [
                                React.createElement(
                                    'p',
                                    {key: 'p1'},
                                    'The request was successfully sent to the server, but the ' +
                                    'server rejected the request on the grounds that it understands ' +
                                    'the method and content type of the request (i.e., the general ' +
                                    'idea of the request), and the syntax of the request makes sense ' +
                                    '(i.e., it understood what we were asking), but the instructions ' +
                                    'themselves could not be executed because they were contradictory, ' +
                                    'infeasible, or simply absurd.'
                                ),
                                React.createElement(
                                    'p',
                                    {key: 'p2'},
                                    [
                                        React.createElement(
                                            React.Fragment,
                                            {key: '1'},
                                            'Normally the server provides additional information about what ' +
                                            'part of the request was incorrect. In this case the server did ' +
                                            'not provide that information in a way we understood. This is a ' +
                                            'bug, so although you may be able to resolve the issue it is ' +
                                            'recommended you '
                                        ),
                                        this.createContactSiteAdministratorLink({
                                            subject: 'Blank/invalid 422 response',
                                            message: `[Page](${window.location.href})\n\nSteps to reproduce go here`
                                        }),
                                        React.createElement(
                                            React.Fragment,
                                            {key: '3'},
                                            '.'
                                        )
                                    ]
                                )
                            ]
                        )
                    );
                })
            });
        }

        /**
         * Creates a 429 alert which tells the user where to check their
         * ratelimit settings and directs them to the appropriate locations
         * for changing their quota.
         *
         * @param {string} type The style of the alert
         */
        create429(type = 'warning') {
            return React.createElement(
                Alert,
                {
                    title: '429: Too Many Requests',
                    type: type
                },
                React.createElement(
                    React.Fragment,
                    null,
                    [
                        React.createElement(
                            'p',
                            {key: 'p1'},
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: '1'},
                                    'The request was successfully sent to the server, but the ' +
                                    'server did not attempt to process it on the grounds that ' +
                                    'either the global quota or your specific quota has been ' +
                                    'exceeded. To check your ratelimit quota go to '
                                ),
                                this.createMyAccountLink(),
                                React.createElement(
                                    React.Fragment,
                                    {key: '3'},
                                    ' and scroll down to API Ratelimits.'
                                )
                            ]
                        ),
                        React.createElement(
                            'p',
                            {key: 'p2'},
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: '1'},
                                    'If the global ratelimit applies to you but you want an ' +
                                    'exemption, '
                                ),
                                this.createContactModsLink({
                                    key: '2',
                                    subject: 'Global Ratelimit Exemption Request',
                                    message: (
                                        'I am getting unexpected 429s and would like an exemption ' +
                                        'from the global quota on redditloans.com'
                                    )
                                }),
                                React.createElement(
                                    React.Fragment,
                                    {key: '3'},
                                    '. If you want more resources allocated on your behalf at the ' +
                                    'expense of the site administrator, '
                                ),
                                this.createContactModsLink({
                                    key: '4',
                                    subject: 'Ratelimit Increase Request',
                                    message: (
                                        'I would like to have my ratelimit increased on redditloans.com ' +
                                        'for free, since I provide a clear and present benefit to ' +
                                        'the subreddit with my portion of the quota.\n\nExplanation here'
                                    )
                                }),
                                React.createElement(
                                    React.Fragment,
                                    {key: '5'},
                                    '. If you would like to purchase more resources to allocate on your ' +
                                    'behalf, '
                                ),
                                this.createContactSiteAdministratorLink({
                                    key: '6',
                                    subject: 'Ratelimit Increase Request (paid)',
                                    message: (
                                        'I would like to purchase additional resources towards my ' +
                                        'ratelimit quota on redditloans.com and am looking for the ' +
                                        'current pricing options.'
                                    )
                                }),
                                React.createElement(
                                    React.Fragment,
                                    {key: '7'},
                                    '.'
                                )
                            ]
                        )
                    ]
                )
            )
        }

        /**
         * Creates a generic alert for unexpected client-side error status code.
         * Provides a couple of troubleshooting steps.
         *
         * @param {number} status The actual status code returned
         * @param {string} type The style of the alert
         */
        createUnknown4xx(status, type = 'error') {
            return React.createElement(
                Alert,
                {
                    title: `${status}: Unknown`,
                    type: 'error'
                },
                [
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'The request was successfully sent to the server, but the ' +
                                'server responded with an unexpected error that implies a ' +
                                'client-side error. Try '
                            ),
                            this.createRefreshPageLink({body: 'refreshing the page'}),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                '. If you still get this message, '
                            ),
                            this.createContactSiteAdministratorLink({
                                subject: `Unexpected ${status} response`,
                                message: (
                                    `[Page](${window.location.href})\n\nSteps to reproduce`
                                )
                            }),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                '.'
                            )
                        ]
                    )
                ]
            )
        }

        /**
         * Creates a generic alert for an unexpected server-side error status code.
         * Provides a couple of troubleshooting steps.
         *
         * @param {number} status The actual status code returned
         * @param {string} type The style of the alert
         */
        createUnknown5xx(status, type = 'error') {
            return React.createElement(
                Alert,
                {
                    title: `${status}: Unknown`,
                    type: 'error'
                },
                [
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'The request was succesfully sent to the server, but the server ' +
                                'failed to process the request. This may be a temporary issue, ' +
                                'so try waiting a few minutes, '
                            ),
                            this.createRefreshPageLink({body: 'refreshing the page'}),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                ', and trying again. If this message persists, '
                            ),
                            this.createContactSiteAdministratorLink({
                                subject: `Unexpected ${status} response`,
                                message: (
                                    `[Page](${window.location.href})\n\nSteps to reproduce`
                                )
                            }),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                '.'
                            )
                        ]
                    )
                ]
            );
        }

        /**
         * Creates the appropriate generic alert based on the status code. This will
         * never show a specific alert, like 401, but it will decide to show e.g.
         * a client side alert vs a server side alert (and the corresponding
         * troubleshooting steps).
         *
         * @param {number} status The actual status code returned
         */
        createUnknown(status) {
            if (status < 500) {
                return this.createUnknown4xx(status);
            }
            return this.createUnknown5xx(status);
        }

        /**
         * Creates a generic fetch error alert with some troubleshooting steps.
         * This should be used when the fetch promise is rejected rather than
         * just a non-ok response code.
         *
         * @param {string} type The style of the alert to display
         */
        createFetchError(type = 'error') {
            return React.createElement(
                Alert,
                {
                    title: 'Failed to fetch',
                    type: type
                },
                [
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        React.createElement(
                            React.Fragment,
                            {key: '1'},
                            'We failed to send the request to the server. There are a ' +
                            'few possibilities for what happened. First, check your internet ' +
                            'connection by going to '
                        ),
                        React.createElement(
                            'a',
                            {
                                key: '2',
                                href: 'https://reddit.com',
                                referrerPolicy: 'strict-origin'
                            },
                            'Reddit'
                        ),
                        React.createElement(
                            React.Fragment,
                            {key: '3'},
                            '. If that works, try '
                        ),
                        this.createRefreshPageLink({body: 'refreshing the page'}),
                        React.createElement(
                            React.Fragment,
                            {key: '5'},
                            ' and trying again. If this error persists and you are not on an ' +
                            'official front-end it is likely a '
                        ),
                        React.createElement(
                            'a',
                            {
                                key: '6',
                                href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
                                referrerPolicy: 'strict-origin'
                            },
                            'CORS'
                        ),
                        React.createElement(
                            React.Fragment,
                            {key: '7'},
                            ' error combined with a server error. Server errors are often ' +
                            'temporary, so try waiting a few minutes and trying again. If ' +
                            'this message still persists, '
                        ),
                        this.createContactSiteAdministratorLink({
                            subject: 'Unexpected failed to fetch',
                            message: `[Page](${window.location.href}) via ${(navigator && navigator.userAgent) || 'unknown'}\n\nSteps to reproduce`
                        }),
                        React.createElement(
                            React.Fragment,
                            {key: '9'},
                            '.'
                        )
                    )
                ]
            )
        }

        /**
         * Create a promise for a react component using the given response
         * object.
         *
         * @param {string} actionName The action that failed
         * @param {*} response The response that just failed
         * @return {Promise} A promise for a react component describing the failure
         */
        createFromResponse(actionName, response) {
            return new Promise((resolve, _) => {
                if (!response.status) {
                    resolve(this.createFetchError());
                    return;
                }

                let status = response.status;

                if (status === 401) { resolve(this.create401()); }
                else if (status === 403) { resolve(this.create403()); }
                else if (status === 404) { resolve(this.create404(actionName)); }
                else if (status === 422) { resolve(this.create422(response)); }
                else if (status === 429) { resolve(this.create429()); }
                else { resolve(this.createUnknown(status)); }
            });
        }
    };

    return new AlertHelper();
})();
