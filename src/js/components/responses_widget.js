const ResponsesWidget = (function() {
    /**
     * Describes a view for the current value of a response. This does not
     * allow editing.
     *
     * @param {string} body The current body of the response
     * @param {string} desc The current description of what this response is
     *   used for
     * @param {Date} updatedAt When the response was last updated
     */
    class ResponseCurrentView extends React.Component {
        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        'div',
                        {
                            key: 'label',
                            className: 'response-preview-label',
                        },
                        [
                            React.createElement(
                                'span',
                                {
                                    key: 'response-updated-at-pre',
                                    className: 'response-updated-at-pre'
                                },
                                'Since last updated on '
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-updated-at-date',
                                    className: 'response-updated-at-date'
                                },
                                this.props.updatedAt.toLocaleDateString()
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-updated-at-pre-time',
                                    className: 'response-updated-at-pre-time'
                                },
                                ' at '
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-updated-at-time',
                                    className: 'response-updated-at-time'
                                },
                                this.props.updatedAt.toLocaleTimeString()
                            )
                        ]
                    ),
                    React.createElement(FormElement,
                        {
                            key: 'response-preview',
                            labelText: 'Response Format',
                            component: TextArea,
                            componentArgs: {
                                text: this.props.body,
                                disabled: true
                            }
                        }
                    ),
                    React.createElement(FormElement,
                        {
                            key: 'response-desc',
                            labelText: 'Description (not publicly visible)',
                            component: TextArea,
                            componentArgs: {
                                text: this.props.desc,
                                disabled: true
                            }
                        }
                    )
                ]
            );
        }
    }

    ResponseCurrentView.propTypes = {
        body: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        updatedAt: PropTypes.instanceOf(Date).isRequired
    }

    /**
     * Renders the most current value of a given response.
     *
     * @param {string} body The current value of the response
     * @param {string} desc The current description of what the response is
     *   used for
     * @param {Date} createdAt When the response was first created
     * @param {Date} updatedAt When the response was last updated
     */
    class Response extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                editing: false,
                editValue: this.props.body,
                editDescValue: this.props.desc,
                editReason: null,
            };

            this.editValueGet = null;
            this.editDescValueGet = null;
            this.editReasonGet = null;
            this.editValueFocus = null;
            this.ripFocusToEdit = false;
        }

        render() {
            if(!this.state.editing) {
                return React.createElement(
                    'div',
                    {className: 'response-current-view'},
                    [
                        React.createElement(ResponseCurrentView,
                            {
                                key: 'response-current',
                                body: this.props.body,
                                desc: this.props.desc,
                                updatedAt: this.props.updatedAt
                            }
                        ),
                        React.createElement(Button,
                            {
                                key: 'edit',
                                text: 'Edit',
                                type: 'button',
                                onClick: (() => {
                                    let newState = Object.assign({}, this.state);
                                    newState.editing = true;
                                    this.ripFocusToEdit = true;
                                    this.setState(newState);
                                }).bind(this)
                            })
                    ]
                );
            }

            return React.createElement(
                'div',
                {className: 'response-current-edit'},
                [
                    React.createElement(FormElement,
                        {
                            labelText: 'New response value',
                            key: 'response-edit-textarea',
                            component: TextArea,
                            componentArgs: {
                                text: this.state.editValue,
                                textQuery: ((gtr) => this.editValueGet = gtr).bind(this),
                                focus: ((fcs) => this.editValueFocus = fcs).bind(this)
                            }
                        }
                    ),
                    React.createElement(FormElement,
                        {
                            labelText: 'New description (not publicly visible)',
                            key: 'response-edit-desc-textarea',
                            component: TextArea,
                            componentArgs: {
                                text: this.state.editDescValue,
                                textQuery: ((gtr) => this.editDescValueGet = gtr).bind(this)
                            }
                        }
                    ),
                    React.createElement(FormElement,
                        {
                            labelText: 'Reason for edit (>=5 chars)',
                            key: 'response-edit-reason',
                            component: TextInput,
                            componentArgs: {
                                text: this.state.editReason,
                                textQuery: ((gtr) => this.editReasonGet = gtr).bind(this)
                            }
                        }
                    ),
                    React.createElement(Button,
                        {
                            key: 'update-btn',
                            text: 'Update',
                            type: 'button'
                        }
                    ),
                    React.createElement(Button,
                        {
                            key: 'cancel-btn',
                            text: 'Cancel',
                            type: 'button',
                            onClick: (() => {
                                let newState = Object.assign({}, this.state);
                                newState.editing = false;
                                newState.editValue = this.editValueGet();
                                newState.editDescValue = this.editDescValueGet();
                                newState.editReason = this.editReasonGet();
                                this.setState(newState);
                            }).bind(this)
                        }
                    )
                ]
            )
        }

        componentDidUpdate() {
            if(this.ripFocusToEdit) {
                this.editValueFocus();
                this.ripFocusToEdit = false;
            }
        }
    }

    Response.propTypes = {
        body: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        createdAt: PropTypes.instanceOf(Date).isRequired,
        updatedAt: PropTypes.instanceOf(Date)
    };

    /**
     * Renders a single edit from the past for a particular response.
     *
     * @param {string} body The body of the response after the edit
     * @param {string} desc The description of the response after the edit
     * @param {object} editedBy Who edited the response, if known. Has two
     *   keys - id and username. This will be null if the user who originally
     *   made the edit was deleted.
     * @param {Date} editedAt When the edit occurred
     */
    class ResponseEdit extends React.Component {
        constructor(props) {
            super(props);
        }

        render() {
            return React.createElement(
                'div',
                {
                    className: 'response-edit'
                },
                [
                    React.createElement(
                        'div',
                        {
                            key: 'response-edit-title',
                            className: 'response-edit-title'
                        },
                        [
                            (function() {
                                // Edited by?
                                if (!this.props.editedBy) {
                                    return React.createElement(
                                        'span',
                                        {
                                            key: 'response-no-edited-by',
                                            className: 'response-no-edited-by',
                                            aria_label: 'The user who edited this response has been deleted.'
                                        },
                                        '(no edited-by)'
                                    );
                                }

                                return React.createElement(
                                    'span',
                                    {
                                        key: 'response-edited-by',
                                        className: 'response-edited-by'
                                    },
                                    this.props.editedBy.username
                                );
                            }).bind(this)(),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-edited-at-pre',
                                    className: 'response-edited-at-pre'
                                },
                                ' changed it on '
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-edited-at-date',
                                    className: 'response-edited-at-date'
                                },
                                this.props.editedAt.toLocaleDateString()
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-edited-at-pre-time',
                                    className: 'response-edited-at-pre-time'
                                },
                                ' at '
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-edited-at-time',
                                    className: 'response-edited-at-time'
                                },
                                this.props.editedAt.toLocaleTimeString()
                            ),
                            React.createElement(
                                'span',
                                {
                                    key: 'response-edited-at-post',
                                    className: 'response-edited-at-post'
                                },
                                ' to '
                            )
                        ]
                    ),
                    React.createElement(FormElement,
                        {
                            key: 'body-textarea',
                            labelText: 'Response Format',
                            component: TextArea,
                            componentArgs: {
                                text: this.props.body,
                                disabled: true
                            }
                        }
                    ),
                    React.createElement(FormElement,
                        {
                            key: 'desc-textarea',
                            labelText: 'Description (not publicly visible)',
                            component: TextArea,
                            componentArgs: {
                                text: this.props.desc,
                                disabled: true
                            }
                        }
                    )
                ]
            );
        }
    }

    ResponseEdit.propTypes = {
        body: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        editedBy: PropTypes.shape({
            id: PropTypes.number.isRequired,
            username: PropTypes.string.isRequired
        }),
        editedAt: PropTypes.instanceOf(Date).isRequired
    };

    /**
     * Renders all the given modifications to a particular response, one at a
     * time, in order.
     *
     * @param {array} history The history of the response, from newest to
     *   oldest, where each item has a body, desc, editedBy, and editedAt.
     */
    class ResponseHistory extends React.Component {
        render() {
            return React.createElement(
                React.Fragment,
                null,
                this.props.history.map((itm, idx) => {
                    return React.createElement(
                        ResponseEdit,
                        {
                            key: `response-edit-${idx}`,
                            body: itm.body,
                            desc: itm.desc,
                            editedBy: itm.editedBy,
                            editedAt: itm.editedAt
                        }
                    )
                })
            );
        }
    };

    ResponseHistory.propTypes = {
        history: PropTypes.arrayOf(PropTypes.shape({
            body: PropTypes.string.isRequired,
            desc: PropTypes.string.isRequired,
            editedBy: PropTypes.shape({
                id: PropTypes.number.isRequired,
                username: PropTypes.string.isRequired
            }),
            editedAt: PropTypes.instanceOf(Date).isRequired
        })).isRequired
    };

    /**
     * A complete widget for editing a single response, assuming that the
     * current state has already been loaded and nobody else is modifying
     * it.
     *
     * @param {string} name The name of the response that is being edited
     */
    class ResponseWidget extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: false,
                body: null,
                desc: null,
                createdAt: null,
                updatedAt: null,
                historyLoaded: false,
                historyLoading: false,
                history: null
            }
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        Response,
                        {
                            key: 'response',
                            body: this.props.body,
                            desc: this.props.desc,
                            createdAt: this.props.createdAt,
                            updatedAt: this.props.updatedAt
                        }
                    ),
                    (function() {
                        if (this.state.historyLoaded) {
                            if (this.state.history.length === 0) {
                                return React.createElement(React.Fragment, null, null);
                            }
                            return React.createElement(
                                ResponseHistory,
                                {
                                    key: 'history',
                                    history: this.state.history
                                }
                            );
                        }

                        return React.createElement(
                            Button,
                            {
                                key: 'history-load-btn',
                                text: 'Load History',
                                style: 'secondary',
                                disabled: this.state.historyLoading
                            }
                        );
                    }).bind(this)()
                ]
            );
        }
    }

    ResponseWidget.propTypes = {
        name: PropTypes.string.isRequired
    };

    /**
     * A complete widget for viewing and editing responses. Contains a dropdown
     * to select which response that the user wants to edit, and then puts the
     * appropriate ResponseWidget below that.
     */
    class ResponsesWidget extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                loading: true,
                errored: false,
                error: null,
                errorAnim: null,
                addResponseAlert: null,
                addResponseAlertAnim: null,
                addResponseExpanded: false,
                addResponseName: '',
                addResponseBody: '',
                addResponseDesc: '',
                addResponseDisabled: false,
                responses: [],
                selectedResponseInd: null
            }

            this.loadResponses(false);
            this.addResponseWasExpanded = false;
            this.addResponseNameGet = null;
            this.addResponseBodyGet = null;
            this.addResponseDescGet = null;
            this.addResponseFocus = null;
            this.addResponseRipFocus = false;
        }

        render() {
            if(this.state.loading) {
                return React.createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            if(this.state.errored) {
                return React.createElement(
                    HeightEased,
                    {
                        component: Alert,
                        componentArgs: {
                            title: this.state.error.title,
                            text: this.state.error.text,
                            type: 'error'
                        }
                    }
                );
            }

            if (this.state.responses.length > 0) {
                return React.createElement(
                    React.Fragment,
                    null,
                    [
                        React.createElement(FormElement, {
                                key: 'responses-choice',
                                labelText: 'Select which response to view',
                                component: DropDown,
                                componentArgs: {
                                    options: this.state.responses.map((resp) => {
                                        return { key: resp.name, text: resp.name };
                                    }),
                                    initialOption: this.state.responses[this.state.selectedResponseInd].name
                                }
                            }
                        ),
                        React.createElement(ResponseWidget, (function() {
                            let res = Object.assign({}, this.state.responses[this.state.selectedResponseInd]);
                            res.key = 'response';
                            return res;
                        }).bind(this)()),
                        this.createAddResponseSection()
                    ]
                );
            }

            return this.createAddResponseSection();
        }

        componentDidUpdate() {
            this.considerFocus();
            this.addResponseWasExpanded = this.state.addResponseExpanded;
        }

        considerFocus() {
            if(this.addResponseRipFocus) {
                if(this.addResponseFocus) {
                    this.addResponseRipFocus = false;
                    this.addResponseFocus();
                }else {
                    console.log('Waiting on focus callbacks..');
                    setTimeout(this.considerFocus.bind(this), 500);
                }
            }
        }

        createAddResponseSection() {
            return React.createElement(
                React.Fragment,
                {key: 'add-response-section'},
                [
                    (function() {
                        if(this.state.addResponseAlert === null) {
                            return React.createElement(
                                React.Fragment,
                                {key: 'add-response-alert'}
                            );
                        }
                        return React.createElement(
                            HeightEased,
                            {
                                key: 'add-response-alert',
                                component: Alert,
                                componentArgs: {
                                    title: this.state.addResponseAlert.title,
                                    type: this.state.addResponseAlert.type,
                                    text: this.state.addResponseAlert.text
                                },
                                style: this.state.addResponseAlertAnim
                            }
                        );
                    }).bind(this)(),
                    this.createAddResponseForm()
                ]
            )
        }

        createAddResponseForm() {
            if (!this.state.addResponseExpanded) {
                return React.createElement(
                    React.Fragment,
                    {key: 'add-response-minimized'},
                    [
                        React.createElement(
                            HeightEased,
                            {
                                key: 'add-response-btn',
                                style: this.addResponseWasExpanded ? 'expanding' : 'expanded',
                                component: Button,
                                componentArgs: {
                                    text: 'Add Response',
                                    type: 'button',
                                    style: 'secondary',
                                    onClick: (() => {
                                        this.setState(((state) => {
                                            this.addResponseRipFocus = true;
                                            let newState = Object.assign({}, state);
                                            newState.addResponseExpanded = true;
                                            return newState;
                                        }).bind(this));
                                    }).bind(this),
                                    focus: ((fcs) => this.addResponseFocus = fcs).bind(this)
                                }
                            }
                        ),
                        React.createElement(
                            HeightEased,
                            {
                                key: 'add-response-expanded-minimizing',
                                style: this.addResponseWasExpanded ? 'closing' : 'closed',
                                component: React.Fragment,
                                componentChildren: this.createResponseAddExpandedChildren(true)
                            }
                        )
                    ]
                )
            }

            return React.createElement(
                React.Fragment,
                {key: 'add-response-expanded'},
                [
                    React.createElement(
                        HeightEased,
                        {
                            key: 'add-response-btn-removing',
                            style: this.addResponseWasExpanded ? 'closed' : 'closing',
                            component: Button,
                            componentArgs: {
                                text: 'Add Response',
                                disabled: true
                            }
                        }
                    ),
                    React.createElement(
                        HeightEased,
                        {
                            key: 'add-response',
                            style: this.addResponseWasExpanded ? 'expanded' : 'expanding',
                            component: React.Fragment,
                            componentChildren: this.createResponseAddExpandedChildren(false)
                        }
                    )
                ]
            );

        }

        createResponseAddExpandedChildren(fake) {
            return [
                React.createElement(
                    FormElement,
                    {
                        key: 'name',
                        component: TextInput,
                        labelText: 'New Response Name',
                        componentArgs: {
                            type: 'text',
                            text: this.state.addResponseName,
                            textQuery: ((gtr) => this.addResponseNameGet = gtr).bind(this),
                            focus: ((fcs) => {
                                if(!fake)
                                    this.addResponseFocus = fcs;
                            }).bind(this)
                        }
                    }
                ),
                React.createElement(
                    FormElement,
                    {
                        key: 'body',
                        component: TextArea,
                        labelText: 'New Response Body',
                        componentArgs: {
                            type: 'text',
                            text: this.state.addResponseBody,
                            textQuery: ((gtr) => this.addResponseBodyGet = gtr).bind(this)
                        }
                    }
                ),
                React.createElement(
                    FormElement,
                    {
                        key: 'desc',
                        component: TextArea,
                        labelText: 'New Response Description',
                        componentArgs: {
                            text: this.state.addResponseDesc,
                            textQuery: ((gtr) => this.addResponseDescGet = gtr).bind(this)
                        }
                    }
                ),
                React.createElement(
                    Button,
                    {
                        key: 'submit',
                        text: 'Add Response',
                        type: 'button',
                        style: 'primary',
                        disabled: this.state.addResponseDisabled,
                        onClick: (() => {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.addResponseDisabled = true;
                                return newState;
                            });

                            this.addResponse();
                        }).bind(this)
                    }
                ),
                React.createElement(
                    Button,
                    {
                        key: 'cancel',
                        text: 'Cancel',
                        type: 'button',
                        style: 'secondary',
                        onClick: (() => {
                            this.setState(((state) => {
                                let newState = Object.assign({}, state);
                                newState.addResponseExpanded = false;
                                newState.addResponseName = this.addResponseNameGet();
                                newState.addResponseBody = this.addResponseBodyGet();
                                newState.addResponseDesc = this.addResponseDescGet();
                                return newState;
                            }).bind(this));
                            setTimeout((() => {
                                this.addResponseFocus();
                            }).bind(this), 500);
                        }).bind(this)
                    }
                )
            ];
        }

        addResponse() {
            return api_fetch('/api/responses', AuthHelper.auth({
                method: 'POST',
                credentials: 'omit',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: this.state.addResponseName,
                    body: this.state.addResponseBody,
                    desc: this.state.addResponseDesc
                })
            })).then(((resp) => {
                if(resp.status === 200) {
                    return loadResponses(true);
                }

                if(resp.status === 403) {
                    return Promise.reject({
                        title: 'Forbidden',
                        text: 'You do not have permission to access this endpoint'
                    });
                }else if(resp.status === 409) {
                    return Promise.reject({
                        title: 'Response Name Taken',
                        text: 'A response with that name already exists'
                    });
                }else if(resp.status === 429) {
                    console.log(resp.json());
                    return Promise.reject({
                        title: 'Client Error',
                        text: 'The server rejected our arguments; the console may have more info.'
                    });
                }else if(resp.status === 500) {
                    return Promise.reject({
                        title: 'Internal Server Error',
                        text: 'Something went wrong, and it may take a while to fix. Contact your system administrator.'
                    });
                }else if(resp.status === 503) {
                    return Promise.reject({
                        title: 'Temporarily Unavailable',
                        text: 'The server is temporarily unable to service this request, possibly due to increased load. Try again later.'
                    });
                }else {
                    console.log(resp);
                    return Promise.reject({
                        title: resp.statusText,
                        text: `${resp.status}: ${resp.statusText}`
                    });
                }
            }).bind(this)).then((() => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.addResponseDisabled = false;
                    newState.addResponseExpanded = false;
                    return newState;
                })
            }).bind(this)).catch(((error) => {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.addResponseAlert = {
                        title: error.title,
                        text: error.text,
                        type: 'error'
                    }
                    if(newState.addResponseAlertAnim === 'expanding' || newState.addResponseAlertAnim === 'expanded') {
                        newState.addResponseAlertAnim = 'expanded';
                    }else {
                        newState.addResponseAlertAnim = 'expanding';
                    }
                    return newState;
                });
                console.log('queuing closing anim');
                setTimeout((() => {
                    this.setState((state) => {
                        if(state.addResponseAlertAnim !== 'expanding' && state.addResponseAlertAnim !== 'expanded') {
                            return state;
                        }
                        let newState = Object.assign({}, state);
                        newState.addResponseAlertAnim = 'closing';
                        newState.addResponseDisabled = false;
                        return newState;
                    });
                }).bind(this), 5000);
            }).bind(this))
        }

        loadResponses(bustCache) {
            return api_fetch('/api/responses', AuthHelper.auth({
                cache: bustCache ? 'no-cache' : 'default'
            })).then((resp) => {
                if(resp.status === 200) {
                    return resp.json();
                }

                if(resp.status === 403) {
                    return Promise.reject({
                        title: 'No permission',
                        text: (
                            'You do not have permission to view responses. ' +
                            'If you believe you should have permission, contact ' +
                            'the moderators of /r/borrow by sending a message to ' +
                            'the modmail.'
                        )
                    });
                }

                return Promise.reject({
                    title: 'Failed to load responses',
                    text: `${resp.status}: ${resp.statusText}`
                });
            }).then((json) => {
                this.setState(((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.responses = json.responses;
                    if(json.responses.length !== 0) {
                        newState.responses.selectedResponseInd = 0;
                    }
                    return newState;
                }));
            }).catch(((error) => {
                this.setState(((state) => {
                    let newState = Object.assign({}, state);
                    newState.loading = false;
                    newState.errored = true;
                    newState.error = error;
                    newState.errorAnim = 'expanding';
                    return newState;
                }));
            }).bind(this));
        }
    }

    ResponsesWidget.propTypes = {};

    return ResponsesWidget;
})();