const [DemographicsLookupAjaxAndView, DemographicsShowAjaxAndView, DemographicsByUserAjaxAndView] = (function() {
    /**
     * Shows the demographics information for the given user, without the option
     * to edit anything.
     *
     * @param {string} email
     * @param {string} name
     * @param {string} streetAddress
     * @param {string} city
     * @param {string} state
     * @param {string} zip
     * @param {string} country
     */
    class DemographicsShow extends React.Component {
        render() {
            return React.createElement(
                'ul',
                {
                    className: 'demographics-show'
                },
                ['email', 'name', 'streetAddress', 'city', 'state', 'zip', 'country'].map((key) => {
                    if (this.props[key] === null || this.props[key] === undefined) {
                        return React.createElement(
                            React.Fragment,
                            {key: key}
                        );
                    }

                    return React.createElement(
                        'li',
                        {key: key},
                        (key
                        .replace(/(\w)([A-Z])/, '$1 $2')
                        .replace(' (\w)', (x) => ' ' + x.toUpperCase())
                        .replace(/^(\w)/, (x) => x.toUpperCase())) + (
                            ': ' + this.props[key]
                        )
                    )
                })
            );
        }
    };

    DemographicsShow.propTypes = {
        email: PropTypes.string,
        name: PropTypes.string,
        streetAddress: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        country: PropTypes.string
    };

    /**
     * Renders the actual form used for filling in demographics information,
     * without any of the associated logic.
     *
     * @param {string} person The person the form is in, may either be the
     *   string "second" for second person or "third" for third person.
     *   Defaults to second person.
     * @param {string} emailInitial The initial value for the email field.
     * @param {function} emailQuery A function we call with a function which
     *   requires no arguments and returns the value in the email field.
     * @param {string} nameInitial The initial value for the name field
     * @param {function} nameQuery A function we call with a function which
     *   requires no arguments and returns the value in the name field.
     * @param {string} streetAddressInitial The initial value for the street
     *   address field.
     * @param {function} streetAddressQuery A function we call with a function
     *   which requires no arguments and returns the value in the street
     *   address field.
     * @param {string} cityInitial The initial value for the city field.
     * @param {function} cityQuery A function we call with a function which
     *   requires no arguments and returns the value in the city field.
     * @param {string} stateInitial The initial value for the state field.
     * @param {function} stateQuery A function we call with a function which
     *   requires no arguments and returns the value in the state field.
     * @param {string} zipInitial The initial value for the zip field.
     * @param {function} zipQuery A function we call with a function which
     *   requires no arguments and returns the value in the zip field.
     * @param {string} countryInitial The initial value for the country field.
     * @param {function} countryQuery A function we call with a function that
     *   requires no arguments and returns the value in the country field.
     */
    class DemographicsForm extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                person: this.props.person || 'second'
            };
        }
        render() {
            return React.createElement(
                'div',
                {className: 'demographics-form'},
                [
                    ['email', 'Email', 'Your preferred email address.', 'The users email address.'],
                    ['name', 'Full Name', 'Your full legal name as it would be displayed on government ID.', 'The users full legal name.'],
                    ['streetAddress', 'Street Address', 'The street address where you live, if applicable, otherwise leave blank.', 'The users street address.'],
                    ['zip', 'Postal Code', 'The postal code or zip code where you live, if applicable, otherwise leave blank.', 'The users postal or zip code.'],
                    ['city', 'City', 'The city you live in, if applicable, otherwise leave blank.', 'The users city or nearest equivalent.'],
                    ['state', 'State', 'The state or province you live in.', 'The users state or province.'],
                    ['country', 'Country', 'The country you live in.', 'The users country']
                ].map(((arr) => {
                    let key = arr[0];
                    let title = arr[1];
                    let desc = this.state.person === 'second' ? arr[2] : arr[3];

                    return React.createElement(
                        FormElement,
                        {
                            key: key,
                            labelText: title,
                            description: desc,
                            component: TextInput,
                            componentArgs: {
                                type: 'text',
                                text: this.props[key + 'Initial'],
                                textQuery: this.props[key + 'Query'],
                            }
                        },
                    );
                }).bind(this))
            );
        }
    };

    DemographicsForm.propTypes = {
        emailInitial: PropTypes.string,
        emailQuery: PropTypes.func,
        nameInitial: PropTypes.string,
        nameQuery: PropTypes.func,
        streetAddressInitial: PropTypes.string,
        streetAddressQuery: PropTypes.func,
        cityInitial: PropTypes.string,
        cityQuery: PropTypes.func,
        stateInitial: PropTypes.string,
        stateQuery: PropTypes.func,
        zipInitial: PropTypes.string,
        zipQuery: PropTypes.func,
        countryInitial: PropTypes.string,
        countryQuery: PropTypes.func
    };

    /**
     * Shows the necessary components for editing demographics for the given
     * user, given the specified initial state.
     *
     * @param {number} userId
     * @param {string} email
     * @param {string} name
     * @param {string} streetAddress
     * @param {string} city
     * @param {string} state
     * @param {string} zip
     * @param {string} country
     * @param {function} onUpdated A function we call after successfully updating
     *   the demographics info. Passed a table for the new state, where the keys
     *   are email, name, streetAddress, city, state, zip, and country.
     */
    class DemographicsEditFormWithAjax extends React.Component {
        // DemographicsForm
        // Captcha + Edit Button
        // -> PUT /api/users/{req_user_id}/demographics

        constructor(props) {
            super(props);

            this.state = {
                loading: false,
                alert: {
                    title: 'title',
                    text: 'text',
                    type: 'info'
                },
                alertState: 'closed'
            }
            this.query = {};
            this.tokenGet = null;
            this.tokenClear = null;

            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            let createQuery = ((name) => ((query) => {this.query[name] = query}).bind(this)).bind(this);
            let token = AuthHelper.getAuthToken();
            let isSelf = token !== null && token.userId === this.props.userId;

            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        DemographicsForm,
                        {
                            key: 'demographics-form',
                            emailInitial: this.props.email,
                            emailQuery: createQuery('email'),
                            nameInitial: this.props.name,
                            nameQuery: createQuery('name'),
                            streetAddressInitial: this.props.streetAddress,
                            streetAddressQuery: createQuery('streetAddress'),
                            cityInitial: this.props.city,
                            cityQuery: createQuery('city'),
                            stateInitial: this.props.state,
                            stateQuery: createQuery('state'),
                            zipInitial: this.props.zip,
                            zipQuery: createQuery('zip'),
                            countryInitial: this.props.country,
                            countryQuery: createQuery('country')
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                key: 'alert',
                                title: this.state.alert.title,
                                type: this.state.alert.type,
                                text: this.state.alert.text
                            }
                        )
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'consent-to-process',
                            type: 'info',
                            title: 'Consent to process',
                            text: (
                                'This information is not required to use the services ' +
                                'provided by the LoansBot. ' +
                                'By submitting this information, you are verifying that ' +
                                (
                                    isSelf ? (
                                        'you consent to us using this data to verify you are '
                                    ) : (
                                        'the data subject consents to us using this data to verify that they are '
                                    )
                                ) +
                                'providing the same information to all lenders (without ' +
                                'sharing this information with lenders), for us to ' +
                                'view and process this data for fraud prevention, including ' +
                                'identity theft, and for us to respond to requests for ' +
                                'information where we are legally obligated to do so, such as ' +
                                'due to a subpoena. Your information will be stored transiently on ' +
                                'AWS EC2 instances and durably on AWS S3.'
                            )
                        }
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'ability-to-withdraw-consent',
                            type: 'info',
                            title: 'Ability to withdraw consent',
                            text: (
                                'At any time this consent can be withdrawn. There are two ways ' +
                                'we allow you to do this - you can edit this form with all blank ' +
                                'values or you can purge your data. If you edit with all blank ' +
                                'values we will only use the historical information where we are legally ' +
                                'obligated to do so or by ' +
                                (isSelf ? 'your' : 'the data subject\'s') +
                                ' request. If you edit with all blank values ' +
                                (isSelf ? 'you' : 'the data subject') + ' may provide consent again at a ' +
                                'later date by updating your information. If you purge the information we ' +
                                'will also delete our historical records, except backups, but we will not ' +
                                'allow ' + (isSelf ? 'you' : 'the data subject') + ' to provide consent to ' +
                                'process in the future. Backups are permanently deleted after 372 days.'
                            )
                        }
                    ),
                    React.createElement(
                        Captcha,
                        {
                            key: 'edit-captcha',
                            tokenGet: ((gtr) => this.tokenGet = gtr).bind(this),
                            tokenClear: ((clr) => this.tokenClear = clr).bind(this)
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'edit-submit',
                            text: 'Update Demographics',
                            style: 'primary',
                            disabled: this.state.loading,
                            onClick: this.onSubmit
                        }
                    )
                ]
            );
        }

        onSubmit() {
            if (this.state.loading) { return; }

            let token = this.tokenGet();
            if (token === null) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = {
                        title: 'Prove you are human',
                        text: (
                            'Please fill out the captcha to prove you are human. Captchas are ' +
                            'required on sensitive operations as one method of preventing ' +
                            'various types of attacks.'
                        )
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
                return;
            }

            let bodyParams = {};
            bodyParams.user_id = this.props.userId;

            for (let key in this.query) {
                let val = this.query[key]();
                if (val !== null && val !== undefined && val.trim().length > 0) {
                    bodyParams[key.replace(/\w[A-Z]/, (x) => x[0] + '_' + x[1].toLowerCase())] = val.trim();
                }
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                newState.alertState = 'closed';
                return newState;
            });

            api_fetch(
                `/api/users/${this.props.userId}/demographics?captcha=${token}`,
                AuthHelper.auth({
                    method: 'PUT',
                    body: JSON.stringify(bodyParams)
                })
            ).then(((resp) => {
                if (!resp.ok) { return Promise.reject(resp); }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = {
                        title: 'Update Successful',
                        type: 'success',
                        text: 'Your demographic information has been updated.'
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });

                if (this.props.onUpdated) {
                    this.props.onUpdated({
                        email: bodyParams.email,
                        name: bodyParams.name,
                        streetAddress: bodyParams.street_address,
                        city: bodyParams.city,
                        state: bodyParams.state,
                        zip: bodyParams.zip,
                        country: bodyParams.country
                    });
                }

                this.tokenClear();
            }).bind(this)).catch(((e) => {
                console.log('Failed to PUT demographics:');
                console.log(e);

                if (e === null || e === undefined || typeof(e) !== 'object' || typeof(e.status) !== 'number') {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loading = false;
                        newState.alert = {
                            title: 'Unexpected Error',
                            type: 'error',
                            text: (
                                'Failed to update demographics. An unexpected error was encountered. This ' +
                                'may have been a server issue. Wait a bit and try again - if the issue ' +
                                'persists, contact the site administrator.'
                            )
                        };
                        newState.alertState = 'expanded';
                        return newState;
                    });
                } else {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.laoding = false;
                        newState.alertState = 'expanded';

                        if (e.status === 401) {
                            newState.alert = {
                                title: '401: Unauthorized',
                                type: 'error',
                                text: (
                                    'The server responded that our authorization token is expired. ' +
                                    'You need to login again. If the navbar has a logout button instead ' +
                                    'of a login button, logout then log back in.'
                                )
                            }
                        } else if (e.status === 403) {
                            newState.alert = {
                                title: '403: Forbidden',
                                type: 'error',
                                text: (
                                    'The server responded that we do not have permission to perform ' +
                                    'this operation. Note that some permissions decay quicker than ' +
                                    'others, meaning that we may be willing to let you view your loans and ' +
                                    'other logged-in operations but not let you see your demographic information. ' +
                                    'So if you believe you should have permission to do this, try logging out ' +
                                    'then logging back in and trying again. If still unsuccessful, contact the ' +
                                    'site administrator.'
                                )
                            };
                        } else if (e.status === 404) {
                            newState.alert = {
                                title: '404: Not Found',
                                type: 'error',
                                text: (
                                    'The server responded that this user does not exist. The simplest ' +
                                    'reason this might happen is if the user was hard-deleted since the ' +
                                    'page was loaded. However, it could also be a side-effect of us not ' +
                                    'having sufficient permission to view this user, which could be fixed ' +
                                    'by logging out and logging back in. If still unsuccessful, contact ' +
                                    'the site administrator.'
                                )
                            };
                        } else if (e.status === 429) {
                            newState.alert = {
                                title: '429: Rate Limited',
                                type: 'error',
                                text: (
                                    'The server responded that the request may have been valid, but we ' +
                                    'have exceeded our quota for requests. If we wait 10 minutes and try ' +
                                    'again it should be accepted or get a more useful error. You can view ' +
                                    'how quickly your quota gets refilled under Account -> My Account, ' +
                                    'beneath "User Specific Ratelimit" (if checked). If unchecked, you can ' +
                                    'view the current limits under src/ratelimit_helper.py at ' +
                                    'https://github.com/LoansBot/web-backend.'
                                )
                            };
                        } else if (e.status === 451) {
                            newState.alert = {
                                title: '451: Unavailable for Legal Reasons',
                                type: 'error',
                                text: (
                                    'The server responded that it could not complete this request due to ' +
                                    'legal reasons. The simplest reason this might happen is that they ' +
                                    'purged demographic information. If a users demographic information ' +
                                    'is purged it cannot be edited in the future.'
                                )
                            };
                        } else if (e.status < 500) {
                            newState.alert = {
                                title: `${e.status}: Unknown`,
                                type: 'error',
                                text: (
                                    'The server responded with an unexpected client-side error. Contact the ' +
                                    'site administrator.'
                                )
                            }
                        } else {
                            newState.alert = {
                                title: `${e.status}: Unknown`,
                                type: 'error',
                                text: (
                                    'The server responded with a server-side error. Contact the ' +
                                    'site administrator.'
                                )
                            }
                        }
                    });
                }

                this.tokenClear();
            }).bind(this))
        }
    }

    DemographicsEditFormWithAjax.propTypes = {
        userId: PropTypes.number.isRequired,
        email: PropTypes.string,
        name: PropTypes.string,
        streetAddress: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        country: PropTypes.string,
        onUpdated: PropTypes.func
    };

    /**
     * Shows a form where the user can input demographics information - email,
     * name, street address, etc, and find users with matching information. This
     * requires filling out a captcha.
     */
    class DemographicsLookupAjaxAndView extends React.Component {
        // Permissions "view-others-demographics" and "lookup-demographics"
        // Warning (Logged)
        // Explanation
        //   link to https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE
        // Reason
        // DemographicsForm
        // -> GET /api/users/demographics cache-control no-store pragma no-cache
        //    + Handle carefully: 403
        // -> list of DemographicsShow associated with usernames
        constructor(props) {
            super(props);

            this.state = {
                loading: false,
                alert: {
                    title: 'some title',
                    text: 'some text',
                    type: 'primary'
                },
                alertState: 'closed',
                displayLegalCategoryDisclaimer: false,
                searchMadeAt: null,
                matches: []
            };

            this.tokenGet = null;
            this.tokenClear = null;

            this.reasonCategoryQuery = null;
            this.reasonQuery = null;

            this.queries = {};
            this.search = this.search.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        Alert,
                        {
                            key: 'main-disclaimer',
                            title: 'Sensitive Operation',
                            type: 'warning',
                            text: (
                                'This operation requests sensitive information on other users and ' +
                                'should only be done if there is a clear reason to do so. This ' +
                                'operation will be logged - including what you search, the reason you ' +
                                'provided, and what the results are. Acceptable reasons to do this are ' +
                                'verifying lenders are receiving consistent information from the borrower, ' +
                                'fraud prevention (including identity theft), and responses to requests for ' +
                                'information where we are legally obligated. This list is exhaustive - if the ' +
                                'reason is not in this list, you cannot use this form. List which reason, and any ' +
                                'additional context if appropriate, below.'
                            )
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'legal-category-disclaimer',
                            initialState: 'closed',
                            desiredState: this.state.displayLegalCategoryDisclaimer ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            Alert,
                            {
                                title: 'Verify The Document and Recipient',
                                type: 'info',
                                text: (
                                    'It is essential to verify the document and recipient to ensure ' +
                                    'no information is leaked. There should be an address or telephone ' +
                                    'number to reach the person who signed the subpoena (or other request). ' +
                                    'They should always be contacted to verify they in fact sent the request. ' +
                                    'The subpoena should be issued against the site administrator.'
                                )
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'reason-category',
                            labelText: 'Reason Category',
                            component: DropDown,
                            componentArgs: {
                                initialOption: 'borrower-consistency',
                                options: [
                                    {key: 'borrower-consistency', text: 'Borrower Consistency'},
                                    {key: 'fraud', text: 'Fraud Prevention'},
                                    {key: 'legal', text: 'Legally Obligated'}
                                ],
                                optionQuery: ((query) => this.reasonCategoryQuery = query).bind(this),
                                optionChanged: ((newKey) => {
                                    let shouldDisplayLegalCategoryDisclaimer = newKey === 'legal';

                                    if (shouldDisplayLegalCategoryDisclaimer != this.state.displayLegalCategoryDisclaimer) {
                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.displayLegalCategoryDisclaimer = shouldDisplayLegalCategoryDisclaimer;
                                            return newState;
                                        });
                                    }
                                }).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'reason-additional',
                            labelText: 'Reason (Additional Context)',
                            component: TextInput,
                            componentArgs: {
                                type: 'text',
                                textQuery: ((query) => this.reasonQuery = query).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        Alert,
                        {
                            key: 'search-explanation',
                            title: 'How to search',
                            type: 'info'
                        },
                        [
                            React.createElement(
                                React.Fragment,
                                {key: 'alert-text-1'},
                                (
                                    'These searches are directly against the data stored in the ' +
                                    'database, where any blank fields are always considered a match for ' +
                                    'the search and non-blank fields are compared using the ILIKE ' +
                                    'comparison operator, AKA., the case-insensitive LIKE operator. '
                                )
                            ),
                            React.createElement(
                                'a',
                                {
                                    key: 'alert-link',
                                    href: 'https://www.postgresql.org/docs/current/functions-matching.html'
                                },
                                'Read more about this operator.'
                            )
                        ]
                    ),
                    React.createElement(
                        DemographicsForm,
                        (() => {
                            let fields = [
                                'email',
                                'name',
                                'streetAddress',
                                'city',
                                'state',
                                'zip',
                                'country',
                            ];

                            let result = {key: 'demos-form', person: 'third'};
                            fields.forEach((field) => {
                                result[field + 'Query'] = ((qry) => this.queries[field] = qry).bind(this);
                            });
                            return result;
                        })()
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'dynamic-alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                type: this.state.alert.type,
                                title: this.state.alert.title,
                                text: this.state.alert.text,
                            }
                        )
                    ),
                    React.createElement(
                        Captcha,
                        {
                            key: 'captcha',
                            tokenGet: ((gtr) => this.tokenGet = gtr).bind(this),
                            tokenClear: ((clr) => this.tokenClear = clr).bind(this)
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'search',
                            text: 'Search',
                            disabled: this.state.loading,
                            onClick: this.search
                        }
                    )
                ].concat(this.state.matches.length === 0 ? [] : [
                    React.createElement(
                        Alert,
                        {
                            key: 'matched-at',
                            type: 'info',
                            title: 'Search Completed'
                        },
                        [
                            React.createElement(
                                React.Fragment,
                                {key: 'text-1'},
                                'The results below were produced at '
                            ),
                            React.createElement(
                                TextDateTime,
                                {
                                    key: 'search-made-at',
                                    time: this.state.searchMadeAt,
                                    style: 'absolute'
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {key: 'matches', className: 'demographics-lookup-matches'},
                        this.state.matches.map((match, idx) => {
                            return React.createElement(
                                Alert,
                                {
                                    key: `${match.userId}-${idx}`,
                                    type: 'info',
                                    title: match.username
                                },
                                React.createElement(
                                    DemographicsShow,
                                    match
                                )
                            );
                        })
                    )
                ])
            )
        }

        search() {
            if (this.state.loading) { return; }

            let token = this.tokenGet();
            if (token === null || token === undefined) {
                this.tokenClear();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'warning',
                        title: 'Fill out Captcha',
                        text: 'Please fill out the captcha to prove you are human'
                    };
                    newState.searchMadeAt = null;
                    newState.matches = [];
                    return newState;
                });
                return;
            }

            let reasonCategory = this.reasonCategoryQuery();
            let reason = null;
            if (reasonCategory === 'borrower-consistency') {
                reason = 'Borrower Consistency';
            } else if (reasonCategory === 'fraud') {
                reason = 'Fraud';
            } else if (reasonCategory === 'legal') {
                reason = 'Legally Obligated';
            } else {
                reason = reasonCategory || '(no category)';
            }

            let searchParams = {};
            for (let key in this.queries) {
                let val = this.queries[key]();
                if (val === null || val === undefined || val.trim().length === 0) {
                    continue;
                }

                let trimmedVal = val.trim();
                let foundRealFilter = false;
                for (let ch of trimmedVal) {
                    if (ch !== '%' && ch !== '_') {
                        foundRealFilter = true;
                        break;
                    }
                }
                if (!foundRealFilter) {
                    continue;
                }

                let snakeCasedKey = key.replace(/\w[A-Z]/g, ((x) => x[0] + '_' + x[1].toLowerCase()));
                searchParams[snakeCasedKey] = val.trim();
            }

            if (searchParams.length < 1) {
                this.tokenClear();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'warning',
                        title: 'Search too general',
                        text: 'The search you made is too broad. You must have at least one filter.'
                    };
                    newState.searchMadeAt = null;
                    newState.matches = [];
                    return newState;
                });
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                newState.alertState = 'closed';
                return newState;
            });

            searchParams.limit = 5;
            searchParams.captcha = token;

            let searchString = '';
            for(let key of searchParams) {
                if (searchString.length === 0) {
                    searchString += '?'
                } else {
                    searchString += '&';
                }
                searchString += encodeURIComponent(key) + '=' + encodeURIComponent(searchParams[key]);
            }

            api_fetch(
                '/api/users/demographics' + searchString,
                AuthHelper.auth({
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
            ).then(((resp) => {
                this.tokenClear();
                if (!resp.ok) {
                    let title = null;
                    let text = null;
                    if (resp.status === 400) {
                        title = '400: Bad Request';
                        text = 'The server rejected the request as malformed. Contact the site administrator.';
                    } else if (resp.status === 401) {
                        title = '401: Unauthorized';
                        text = 'The server rejected the request as missing authorization. Logout and log back in.';
                    } else if (resp.status === 403) {
                        title = '403: Forbidden';
                        text = (
                            'The server rejected the request, stating that we provided authorization ' +
                            'but the credentials were not sufficient for accessing this resource. If ' +
                            'you think you should have permission, log out and log back in. Note that ' +
                            'we expire highly sensitive permissions such as this one much faster than ' +
                            'other permissions, so you have to log out and log back in to regain the ' +
                            'permission.'
                        );
                    } else if (resp.status === 429) {
                        title = '429: Too Many Requests';
                        text = (
                            'The server rejected the request, stating that the format appeared correct ' +
                            'and the authorization may have been valid, however it is preventing the ' +
                            'request because you have exceeded your quota. Wait 10 minutes and try again.'
                        );
                    } else {
                        title = `${resp.status}: ${resp.statusText || 'Unknown'}`;
                        text = 'The server gave an unexpected response. Contact the site administrator.'
                    }

                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.alertState = 'expanded';
                        newState.alert = {
                            type: 'error',
                            title: title,
                            text: text
                        };
                        newState.searchMadeAt = null;
                        newState.matches = [];
                        return newState;
                    });
                    return;
                }

                return resp.json();
            }).bind(this)).then(((json) => {
                if (!json) { return; }
                if (jsons.hits.length === 0) {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loading = false;
                        newState.alertState = 'expanded';
                        newState.alert = {
                            type: 'info',
                            title: 'No Matches',
                            text: 'Your search returned no results.'
                        };
                        return newState;
                    });
                    return;
                }

                /* for each user id we're going to grab a username */
                return new Promise((resolve, reject) => {
                    let rejected = false;
                    json.hits.forEach((match) => {
                        if (rejected) { return; }

                        api_fetch(
                            `/api/users/${match.user_id}`,
                            AuthHelper.auth()
                        ).then((resp) => {
                            if (rejected) { return; }
                            if (!resp.ok) {
                                reject(resp);
                                rejected = true;
                                return;
                            }
                            return resp.json();
                        }).then((json) => {
                            if (rejected) { return; }
                            match.username = json.username;
                            if (json.hits.filter((i) => i.username === null || i.username === undefined).length === 0) {
                                resolve(json);
                            }
                        }).catch(() => {
                            if (rejected) { return; }
                            reject();
                            rejected = true;
                        });
                    });
                });
            }).bind(this)).then(((enrichedJson) => {
                if (!enrichedJson) { return; }
                this.tokenClear();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alertState = 'closed';
                    newState.searchMadeAt = new Date();
                    newState.matches = enrichedJson.hits;
                    return newState;
                });
            }).bind(this)).catch((() => {
                this.tokenClear();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'error',
                        title: 'Failed to fetch',
                        text: (
                            'Failed to contact the server. Check your internet connection or contact ' +
                            'the site administrator.'
                        )
                    };
                    newState.searchMadeAt = null;
                    newState.matches = [];
                    return newState;
                });
            }).bind(this));
        }
    };

    /**
     * Shows the user demographics on the user with the given name. This will
     * require the user fill out a captcha to get the actual information. This
     * shows various controls below the actual demographics, including the ability
     * to edit or purge the info, if the user has sufficient permissions.
     *
     * @param {number} userId The id for the user whose demographics
     *   information should be shown after filling out a captcha.
     */
    class DemographicsShowAjaxAndView extends React.Component {
        // Check AuthHelper getAuthToken
        // View permission:  selfInfo ? "view-self-demographics"  : "view-others-demographics"
        // Edit permission:  selfInfo ? "edit-self-demographics"  : "edit-others-demographics"
        // Purge permission: selfInfo ? "purge-self-demographics" : "purge-others-demographics"

        // Alert + Captcha
        // -> GET /api/users/{req_user_id}/demographics cache-control no-cache pragma no-cache
        //    + Handle carefully:
        //      - 403: Forbidden, may need to login again
        //      - 404: User does not exist
        //      - 451: Unavailable for legal reasons (account purged)
        // -> GET /api/users/{req_user_id} (for username)
        // -> Remove select form / captcha, swap with title "Viewing /u/{username}", button
        //    "Return to Search"
        // -> DemographicsShow
        // -> if EDIT permission: Edit button (swap DemographicsShow for DemographicsEditFormWithAjax)
        // -> if PURGE permission:
        //    -> Advise using alternative method (edit all forms to blank)
        //    -> Purge button
        //       -> Toggle a new div
        //       -> Irreversible operation warning
        //       -> Textbox which must be exactly the username to enable real purge button
        //       -> Captcha + Confirm Purge button
        //       -> DELETE /api/users/{req_user_id}/demographics cache-control no-cache pragma no-cache
        //       -> remove demo show / controls, show 451 alert

        constructor(props) {
            super(props);

            this.state = {
                loading: true,
                alert: {
                    title: 'foo',
                    text: 'bar',
                    type: 'info'
                },
                alertState: 'closed',
                isSelfInfo: false,
                viewCaptchaAndButtonState: 'closed',
                demographicsState: 'closed',
                toggleEditButtonState: 'closed',
                editFormState: 'closed',
                purgeFirstClickButtonState: 'closed',
                purgeConfirmCounter: 0,
                purgeConfirmButtonState: 'closed',
                purgeCaptchaAndButtonState: 'closed',
                username: `(loading user ${this.props.userId})`,
                demographics: {
                    email: null,
                    name: null,
                    streetAddress: null,
                    city: null,
                    state: null,
                    zip: null,
                    country: null
                }
            }
            this.hasPermissionToView = null;
            this.hasPermissionToEdit = null;
            this.hasPermissionToPurge = null;

            this.editQueries = {
                email: null,
                name: null,
                streetAddress: null,
                city: null,
                state: null,
                zip: null,
                country: null
            };
            this.viewTokenGet = null;
            this.viewTokenClear = null;
            this.purgeTokenGet = null;
            this.purgeTokenClear = null;

            this.fetchInfo = this.fetchInfo.bind(this);
            this.onEdit = this.onEdit.bind(this);
            this.purge = this.purge.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'generic-alert',
                            initialState: 'closed',
                            desiredState: this.state.alertState
                        },
                        React.createElement(
                            Alert,
                            {
                                type: this.state.alert.type,
                                title: this.state.alert.title,
                                text: this.state.alert.text
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'view-captcha-and-button-state',
                            initialState: 'closed',
                            desiredState: this.state.viewCaptchaAndButtonState
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'view-captcha-verify-alert',
                                    type: 'info',
                                    title: 'Verify'
                                },
                                this.state.isSelfInfo ? React.createElement(
                                    'p',
                                    null,
                                    'You are about to view your demographics information. ' +
                                    'To confirm this is really you the person, please fill out the ' +
                                    'captcha.'
                                ) : React.createElement(
                                    'p',
                                    null,
                                    [
                                        React.createElement(
                                            React.Fragment,
                                            {key: '1'},
                                            'You are about to view the demographics information for '
                                        ),
                                        React.createElement(
                                            'a',
                                            {key: '2', href: `https://reddit.com/u/${encodeURIComponent(this.state.username)}`},
                                            `/u/${this.state.username}`
                                        ),
                                        React.createElement(
                                            React.Fragment,
                                            {key: '3'},
                                            '. You appear to have the required credentials to do this, however, ' +
                                            'you should only use these credentials by direct user request, to ' +
                                            'investigate fraud or identity theft, and to respond to requests for ' +
                                            'information where we are legally obligated to do so. If this is for ' +
                                            'a legal request, you should verify the source of the request, e.g., ' +
                                            'subpoena, prior to responding. Never share this information with non-' +
                                            'moderators except for the user in question.'
                                        )
                                    ]
                                )
                            ),
                            React.createElement(
                                Captcha,
                                {
                                    key: 'view-captcha',
                                    tokenGet: ((gtr) => this.viewTokenGet = gtr).bind(this),
                                    tokenClear: ((clr) => this.viewTokenClear = clr).bind(this)
                                }
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'view-button',
                                    type: 'primary',
                                    disabled: this.state.loading,
                                    text: 'Fetch Info',
                                    onClick: this.fetchInfo
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'demographics',
                            initialState: 'closed',
                            desiredState: this.state.demographicsState
                        },
                        React.createElement(
                            DemographicsShow,
                            {
                                email: this.state.demographics.email,
                                name: this.state.demographics.name,
                                streetAddress: this.state.demographics.streetAddress,
                                city: this.state.demographics.city,
                                state: this.state.demographics.state,
                                zip: this.state.demographics.zip,
                                country: this.state.demographics.country
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'toggle-edit-form',
                            initialState: 'closed',
                            desiredState: this.state.toggleEditButtonState
                        },
                        React.createElement(
                            Button,
                            {
                                type: 'primary',
                                text: this.state.editFormState === 'closed' ? 'Expand Edit Form' : 'Close Edit Form',
                                disabled: this.state.loading,
                                onClick: (() => {
                                    if (this.state.loading) { return; }

                                    this.setState((state) => {
                                        let newState = Object.assign({}, state);
                                        newState.editFormState = (
                                            state.editFormState === 'closed' ? 'expanded' : 'closed'
                                        );
                                        return newState;
                                    });
                                }).bind(this)
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'edit-form',
                            initialState: 'closed',
                            desiredState: this.state.editFormState
                        },
                        React.createElement(
                            DemographicsEditFormWithAjax,
                            {
                                userId: this.props.userId,
                                email: this.state.demographics.email,
                                name: this.state.demographics.name,
                                streetAddress: this.state.demographics.streetAddress,
                                city: this.state.demographics.city,
                                state: this.state.demographics.state,
                                zip: this.state.demographics.zip,
                                country: this.state.demographics.country,
                                onUpdated: this.onEdit
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'purge-first-click',
                            initialState: 'closed',
                            desiredState: this.state.purgeFirstClickButtonState
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'purge-info-1',
                                    type: 'info',
                                    title: 'Purge',
                                    text: (
                                        'Purging this information is an extreme action which deletes ' +
                                        'the information and our history on it. There will be another ' +
                                        'confirmation after you click Purge.'
                                    )
                                }
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'confirm-button',
                                    type: 'secondary',
                                    disabled: this.state.loading,
                                    text: 'Purge',
                                    onClick: (() => {
                                        if (this.state.loading) { return; }

                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.purgeFirstClickButtonState = 'closed';
                                            newState.purgeConfirmButtonState = 'expanded';
                                            newState.purgeConfirmCounter += 1;
                                            return newState;
                                        })
                                    }).bind(this)
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'purge-confirm',
                            initialState: 'closed',
                            desiredState: this.state.purgeConfirmButtonState
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'purge-info-2',
                                    type: 'warning',
                                    title: 'Purge',
                                    text: (
                                        'Purging will delete this demographic information from our ' +
                                        'database and will delete our stored history on this information. ' +
                                        'This means we will no longer know who had access to what information, ' +
                                        'nor who made what edits. Once this operation is performed, we will not ' +
                                        'allow any new demographics information to be submitted.'
                                    )
                                }
                            ),
                            React.createElement(
                                Alert,
                                {
                                    key: 'purge-info-3',
                                    type: 'warning',
                                    title: 'Alternative',
                                    text: (
                                        'You are allowed to edit all your demographics fields to empty ' +
                                        'instead. This will not delete our records on this information ' +
                                        'within the database, however these records are only used for ' +
                                        'responding to legal requests where we are obligated to do so and ' +
                                        'where the user themself request it.'
                                    )
                                }
                            ),
                            React.createElement(
                                Alert,
                                {
                                    key: 'purge-info-4',
                                    type: 'info',
                                    title: 'Backups',
                                    text: (
                                        'We maintain backups of our database, which are stored in AWS S3, ' +
                                        'for 372 days. This will not delete or modify any backups. We only ' +
                                        'use backups in response to legal requests where we are obligated ' +
                                        'to do so. After the most recent backup containing this information is ' +
                                        'expired this information will be permanently gone.'
                                    )
                                }
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'purge-confirm-return-to-safety',
                                    type: 'primary',
                                    text: 'Return to Safety',
                                    disabled: this.state.loading,
                                    onClick: (() => {
                                        if (this.state.loading) { return; }

                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.purgeFirstClickButtonState = 'expanded';
                                            newState.purgeConfirmButtonState = 'closed';
                                            newState.purgeConfirmCounter += 1;
                                            return newState;
                                        });
                                    })
                                }
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: `purge-confirm-text-${this.state.purgeConfirmCounter}`,
                                    labelText: 'Confirm Username',
                                    description: (
                                        'Please type the username of the user whose account ' +
                                        `information you are about to purge: ${this.state.username}`
                                    ),
                                    component: TextInput,
                                    componentArgs: {
                                        type: 'text',
                                        disabled: this.state.loading,
                                        textChanged: ((newText) => {
                                            if (this.state.loading) { return; }
                                            if (newText === this.state.username) {
                                                this.setState((state) => {
                                                    let newState = Object.assign({}, state);
                                                    newState.purgeConfirmButtonState = 'closed';
                                                    newState.purgeConfirmCounter += 1;
                                                    newState.purgeCaptchaAndButtonState = 'expanded';
                                                    return newState;
                                                });
                                            }
                                        }).bind(this)
                                    }
                                }
                            )
                        ]
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'purge-captcha-and-submit',
                            initialState: 'closed',
                            desiredState: this.state.purgeCaptchaAndButtonState
                        },
                        [
                            React.createElement(
                                Alert,
                                {
                                    key: 'purge-info-5',
                                    title: 'Irreversible Operation',
                                    type: 'warning',
                                    text: (
                                        'There will be no more confirmation dialogs. You are purging ' +
                                        `the user demographics information on /u/${this.state.username}.`
                                    )
                                }
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'purge-final-return-to-safety',
                                    type: 'primary',
                                    text: 'Return to Safety',
                                    disabled: this.state.loading,
                                    onClick: (() => {
                                        if (this.state.loading) { return; }

                                        this.purgeTokenClear();
                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.purgeFirstClickButtonState = 'expanded';
                                            newState.purgeConfirmButtonState = 'closed';
                                            newState.purgeCaptchaAndButtonState = 'closed';
                                            return newState;
                                        });
                                    })
                                }
                            ),
                            React.createElement(
                                Captcha,
                                {
                                    key: 'purge-captcha',
                                    tokenGet: ((gtr) => this.purgeTokenGet = gtr).bind(this),
                                    tokenClear: ((clr) => this.purgeTokenClear = clr).bind(this)
                                }
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'purge-button',
                                    type: 'secondary',
                                    text: 'Purge Account Information',
                                    disabled: this.state.loading,
                                    onClick: this.purge
                                }
                            )
                        ]
                    )
                ]
            )
        }

        componentDidMount() {
            this.fetchUsernameAndPermissions();
        }

        fetchUsernameAndPermissions() {
            let rejected = false;
            let finished = new Array(2);
            let info = AuthHelper.getAuthToken();
            if (info === null) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = {
                        title: 'Not Logged In',
                        type: 'warning',
                        text: 'You need to login to view user demographics.'
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
                return;
            }

            function onSuccess(idx) {
                finished[idx] = true;
                if (finished.includes(undefined)) { return; }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alertState = 'closed';
                    newState.viewCaptchaAndButtonState = 'expanded';
                    return newState;
                });
            }
            onSuccess = onSuccess.bind(this);

            api_fetch(
                `/api/users/${this.props.userId}${this.props.userId === info.userId ? '/me' : ''}`,
                AuthHelper.auth()
            ).then(((resp) => {
                if (rejected) { return; }
                if (!resp.ok) {
                    if (resp.status === 404) {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.loading = false;
                            newState.alert = {
                                title: '404: Not Found',
                                type: 'error',
                                text: `Cannot show demographics for ${this.props.userId} - no such user exists`
                            };
                            newState.alertState = 'expanded';
                            return newState;
                        });
                        rejected = true;
                        return;
                    } else {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.loading = false;
                            newState.alert = {
                                title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                type: 'error',
                                text: (
                                    'The server gave an unexpected response when getting ' +
                                    `the username for user ${this.props.userId} - wait a bit ` +
                                    'and try again or contact the site administrator.'
                                )
                            };
                            newState.alertState = 'expanded';
                            return newState;
                        });
                        rejected = true;
                        return;
                    }
                }

                return resp.json();
            }).bind(this)).then(((json) => {
                if (rejected) { return; }
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.username = json.username;
                    newState.isSelfInfo = this.props.userId === info.userId;
                    return newState;
                });
                onSuccess(0);
            }).bind(this)).catch((() => {
                if (rejected) { return; }
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = {
                        title: 'Failed to fetch',
                        type: 'error',
                        text: (
                            'Failed to contact the server for information on ' +
                            `user id ${this.props.userId} - check your internet ` +
                            'connection, try again later, or contact the site ' +
                            'administrator.'
                        )
                    };
                    return newState;
                });
                rejected = true;
            }).bind(this))


            api_fetch(
                `/api/users/${info.userId}/permissions`,
                AuthHelper.auth()
            ).then((resp) => {
                if (rejected) { return; }
                if (!resp.ok) {
                    if (resp.status === 403) {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.loading = false;
                            newState.alert = {
                                title: '403: Forbidden',
                                type: 'error',
                                text: (
                                    'The server rejected the request to view our own permissions. ' +
                                    'You need to login again.'
                                )
                            };
                            newState.alertState = 'expanded';
                            return newState;
                        });
                        rejected = true;
                        return;
                    } else {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.loading = false;
                            newState.alert = {
                                title: `${resp.status}: ${resp.statusText || 'Unknown'}`,
                                type: 'error',
                                text: (
                                    'The server gave an unexpected resposne code when requesting ' +
                                    'to view our permissions. Try again later or contact the site ' +
                                    'administrator.'
                                )
                            };
                            newState.alertState = 'expanded';
                            return newState;
                        });
                        rejected = true;
                        return;
                    }
                }

                return resp.json();
            }).then(((json) => {
                if (rejected) { return; }
                let tryingToViewSelf = this.props.userId == info.userId;

                let permissionType = tryingToViewSelf ? 'self' : 'others';
                let viewPermission = `view-${permissionType}-demographics`;
                let editPermission = `edit-${permissionType}-demographics`;
                let purgePermission = `purge-${permissionType}-demographics`;

                if (!json.permissions.includes(viewPermission)) {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loading = false;
                        newState.alert = {
                            title: 'Insufficient Permissions',
                            type: 'warning',
                            text: (
                                'You do not have sufficient permissions to view this users demographic ' +
                                'information. If you believe this is a mistake, logout and log back in. ' +
                                'If you still do not have permission, contact the moderators.'
                            )
                        };
                        newState.alertState = 'expanded';
                        return newState;
                    });
                    rejected = true;
                    return;
                }

                this.hasPermissionToView = true;
                this.hasPermissionToEdit = json.permissions.includes(editPermission);
                this.hasPermissionToPurge = json.permissions.includes(purgePermission);
                onSuccess(1);
            }).bind(this)).catch((e) => {
                console.log(e);
                if (rejected) { return; }
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = {
                        title: 'Failed to fetch',
                        type: 'error',
                        text: (
                            'We failed to contact the server to determine your permissions. ' +
                            'Check your internet connection, logout then log back in, or contact ' +
                            'the site administrator.'
                        )
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
                rejected = true;
            });
        }

        fetchInfo() {
            let token = this.viewTokenGet();
            if (token === null) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = {
                        title: 'Complete Captcha',
                        text: 'You must complete the captcha to view demographics information.',
                        type: 'info'
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                return newState;
            });

            api_fetch(
                `/api/users/${this.props.userId}/demographics?captcha=${encodeURIComponent(token)}`,
                AuthHelper.auth({
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                })
            ).then(((resp) => {
                this.viewTokenClear();
                this.purgeTokenClear(); // just in case
                if (!resp.ok) {
                    let title = null;
                    let text = null;

                    if (resp.status === 401) {
                        title = '401: Unauthorized';
                        text = (
                            'The server rejected our request as missing authorization. ' +
                            'You probably just need to logout and login again, but if ' +
                            'that does not help then contact the site administrator.'
                        );
                    } else if (resp.status === 403) {
                        title = '403: Forbidden';
                        text = (
                            'The server rejected our request, stating that although we ' +
                            'provided credentials, they were not sufficient for viewing ' +
                            'this demographic information. We checked for if we have the ' +
                            'necessary permission earlier, so it is likely you just need ' +
                            'to log out and log back in. The server requires fresh ' +
                            'credentials in order to view or manipulate sensitive information.'
                        );
                    } else if (resp.status === 404) {
                        title = '404: Not Found';
                        text = (
                            'The server rejected the request for information, stating that ' +
                            'the user does not exist. This can also happen if your credentials ' +
                            'are simply insufficient to know about the users existence. Either ' +
                            'way, the first step is to reload the page or logout and log back ' +
                            'in, otherwise contact the server administrator.'
                        );
                    } else if (resp.status === 429) {
                        title = '429: Too Many Requests';
                        text = (
                            'The server rejected the request for demographics information. They did ' +
                            'so not because the request was malformed or your credentials were invalid, ' +
                            'but instead because they have detected a surge of requests and are rate ' +
                            'limiting you. Most likely you can wait a few minutes and try again. You can ' +
                            'also check your ratelimiting settings under Account -> My Account. Contact ' +
                            'the moderators if you need your quota expanded.'
                        );
                    } else if (resp.status === 451) {
                        title = '451: Unavailable For Legal Reasons';
                        text = (
                            'The server rejected the request, stating that although the user exists, ' +
                            'their demographics information cannot be viewed or edited, if it even still ' +
                            'exists. Most likely the users demographics information has been purged. There '
                        );
                    } else {
                        title = `${resp.status}: ${resp.statusText || 'Unknown'}`;
                        text = (
                            'The server rejected the request for an unexpected reason. Log out and log ' +
                            'back in, wait a few minutes and try again later, or contact the site ' +
                            'administrator.'
                        );
                    }

                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loading = false;
                        newState.alert = {
                            type: 'error',
                            title: title,
                            text: text
                        };
                        newState.alertState = 'expanded';
                        return newState;
                    });
                    return;
                }

                return resp.json();
            }).bind(this)).then(((json) => {
                if (!json) { return; }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.viewCaptchaAndButtonState = 'closed';
                    newState.editFormState = 'closed';
                    newState.toggleEditButtonState = this.hasPermissionToEdit ? 'expanded' : 'closed';
                    newState.purgeFirstClickButtonState = this.hasPermissionToPurge ? 'expanded' : 'closed';
                    newState.purgeConfirmButtonState = 'closed';
                    newState.purgeCaptchaAndButtonState = 'closed';
                    newState.demographicsState = 'expanded';
                    newState.demographics = {
                        email: json.email,
                        name: json.name,
                        streetAddress: json.street_address,
                        city: json.city,
                        state: json.state,
                        zip: json.zip,
                        country: json.country
                    };
                    return newState;
                })
            }).bind(this)).catch((() => {
                this.viewTokenClear();
                this.purgeTokenClear();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = {
                        type: 'error',
                        title: 'Failed to fetch',
                        text: (
                            'We failed to contact the server. Check your internet connection, ' +
                            'wait a few minutes, or contact the site administrator.'
                        )
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
            }).bind(this));
        }

        onEdit(demographics) {
            this.purgeTokenClear(); // just in case

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = false;
                newState.alert = {
                    title: 'Success',
                    type: 'success',
                    text: (
                        'You have successfully edited demographic information. The new information ' +
                        'is shown below.'
                    )
                };
                newState.alertState = 'expanded';
                newState.demographicsState = 'expanded';
                newState.editFormState = 'closed';
                newState.demographics = {
                    email: demographics.email,
                    name: demographics.name,
                    streetAddress: demographics.streetAddress,
                    city: demographics.city,
                    state: demographics.state,
                    zip: demographics.zip,
                    country: demographics.country
                };
                return newState;
            });
        }

        purge() {
            if (this.state.loading) { return; }

            let token = this.purgeTokenGet();
            if (token === null) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = {
                        title: 'Fill out captcha',
                        type: 'warning',
                        text: 'You must complete the captcha to purge this account.'
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loading = true;
                return newState;
            });

            api_fetch(
                `/api/users/${this.props.userId}/demographics?captcha=${encodeURIComponent(token)}`,
                AuthHelper.auth({
                    method: 'DELETE',
                    headers: {
                        'Content-Cache': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).then(((resp) => {
                this.purgeTokenClear();
                if (!resp.ok) {
                    let title = null;
                    let text = null;
                    if (resp.status === 401) {
                        title = '401: Unauthorized';
                        text = (
                            'The purge was unsuccessful; the server claimed we did ' +
                            'not provide valid credentials. Log out and log back in; if ' +
                            'the problem persists, contact the site administrator.'
                        );
                    } else if (resp.status === 403) {
                        title = '403: Forbidden';
                        text = (
                            'The purge was unsuccessful; the server claimed you have ' +
                            'insufficient credentials to perform this operation. Log out ' +
                            'and log back in; if the problem persists, contact the site ' +
                            'administrator.'
                        );
                    } else if (resp.status === 404) {
                        title = '404: Not Found';
                        text = (
                            'The purge was unsuccessful; the server claims no user with the ' +
                            `id ${this.props.userId} exists. Hard refresh the page, clear your ` +
                            'cache, log out and log back in, wait a few minutes, or contact the ' +
                            'site administrator.'
                        );
                    } else if (resp.status === 429) {
                        title = '429: Too Many Requests';
                        text = (
                            'The purge was unsuccessful; the server claims you have exceeded ' +
                            'your request quota. Wait a few minutes and try again, view your ' +
                            'ratelimiting settings in Account -> My Account, log out and log ' +
                            'back in, or contact the moderators.'
                        );
                    } else if (resp.status === 451) {
                        title = '451: Unavailable For Legal Reasons';
                        text = (
                            'The purge was unsuccessful; someone probably beat you to it. The ' +
                            'server says this resource cannot be accessed, if it even still exists, ' +
                            'for legal reasons. This usually meants the users demographics have ' +
                            'already been purged. Hard refresh the page or clear your cache to verify ' +
                            'the account is deleted. If not, contact the site administrator.'
                        )
                    } else {
                        title = `${resp.status} ${resp.statusText || 'Unknown'}`;
                        text = (
                            'The purge failed for an unexpected reason. Wait a few minutes and try ' +
                            'again or contact the site administrator.'
                        );
                    }

                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loading = false;
                        newState.alert = {
                            type: 'error',
                            title: title,
                            text: text
                        };
                        newState.alertState = 'expanded';
                        newState.purgeFirstClickButtonState = 'expanded';
                        newState.purgeConfirmButtonState = 'closed';
                        newState.purgeCaptchaAndButtonState = 'closed';
                        return newState;
                    });
                    return;
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.viewCaptchaAndButtonState = 'closed';
                    newState.demographicsState = 'closed';
                    newState.editFormState = 'closed';
                    newState.toggleEditButtonState = 'closed';
                    newState.purgeFirstClickButtonState = 'closed';
                    newState.purgeConfirmButtonState = 'closed';
                    newState.purgeCaptchaAndButtonState = 'closed';
                    newState.alert = {
                        title: 'Information Purged',
                        type: 'success',
                        text: (
                            'This information has been purged from our active records. We maintain ' +
                            'backups for 372 days, after which this information will be completely ' +
                            'gone. We only use backups in the event of data loss or where legally ' +
                            'obligated to do so.'
                        )
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });
            }).bind(this)).catch((() => {
                this.purgeTokenClear();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.alert = {
                        type: 'error',
                        title: 'Failed to fetch',
                        text: (
                            'Failed to contact the server to purge this account. Check ' +
                            'your internet connection, wait a few minutes and try again, ' +
                            'or contact the site administrator.'
                        )
                    };
                    newState.alertState = 'expanded';
                    newState.purgeFirstClickButtonState = 'expanded';
                    newState.purgeConfirmButtonState = 'closed';
                    newState.purgeCaptchaAndButtonState = 'closed';
                    return newState;
                });
            }).bind(this))
        }
    };

    DemographicsShowAjaxAndView.propTypes = {
        userId: PropTypes.number.isRequired
    };

    /**
     * Shows a convienent way to select a user in the database, and once a user is
     * selected renders a form to view, edit, or purge their demographic information.
     */
    class DemographicsByUserAjaxAndView extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                userIdShown: null
            }
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        UserSelectFormWithAjax,
                        {
                            key: 'user-select',
                            userIdChanged: ((userId) => {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.userIdShown = userId;
                                    return newState;
                                });
                            }).bind(this)
                        }
                    )
                ].concat(!this.state.userIdShown ? [] : [
                    React.createElement(
                        DemographicsShowAjaxAndView,
                        {
                            key: `demographics-${this.state.userIdShown}`,
                            userId: this.state.userIdShown
                        }
                    )
                ])
            );
        }
    };


    // TODO: make a page (/demographics_lookup.html) which renders DemographicsLookupAjaxAndView
    return [DemographicsLookupAjaxAndView, DemographicsShowAjaxAndView, DemographicsByUserAjaxAndView];
})();
