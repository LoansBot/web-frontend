const ResponsesWidget = (function() {
    /**
     * Describes a view for the current value of a response. This does not
     * allow editing.
     *
     * @param {string} body The current body of the response
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
                    React.createElement(TextArea,
                        {
                            key: 'response-preview',
                            text: this.props.body,
                            disabled: true
                        }
                    )
                ]
            );
        }
    }

    ResponseCurrentView.propTypes = {
        body: PropTypes.string.isRequired,
        updatedAt: PropTypes.instanceOf(Date).isRequired
    }

    /**
     * Renders the most current value of a given response.
     *
     * @param {string} body The current value of the response
     * @param {Date} createdAt When the response was first created
     * @param {Date} updatedAt When the response was last updated
     */
    class Response extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                editing: false,
                editValue: this.props.body,
                editReason: null,
            };

            this.editValueGet = null;
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
        createdAt: PropTypes.instanceOf(Date).isRequired,
        updatedAt: PropTypes.instanceOf(Date)
    };

    /**
     * Renders a single edit from the past for a particular response.
     *
     * @param {string} body The body of the response after the edit
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
                    ),
                    React.createElement(TextArea,
                        {
                            key: 'textarea',
                            text: this.props.body,
                            disabled: true
                        }
                    )
                ]
            );
        }
    }

    ResponseEdit.propTypes = {
        body: PropTypes.string.isRequired,
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
     *   oldest, where each item has a body, editedBy, and editedAt.
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
     * @param {string} body The body of the response today
     * @param {Date} createdAt When the responses first version was first
     *   saved to the database
     * @param {Date} updatedAt When the responses most recent version was saved
     *   to the database
     * @param {array} history The history of the response, from newest to
     *   oldest, where each item has a body (the string body after the edit
     *   was made), who edited it (editedBy is an object with an id and
     *   username field) and when the edit occurred (editedAt).
     */
    class ResponseWidget extends React.Component {
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
                            createdAt: this.props.createdAt,
                            updatedAt: this.props.updatedAt
                        }
                    ),
                    React.createElement(
                        ResponseHistory,
                        {
                            key: 'history',
                            history: this.props.history
                        }
                    )
                ]
            );
        }
    }

    ResponseWidget.propTypes = {
        name: PropTypes.string.isRequired,
        body: PropTypes.string.isRequired,
        createdAt: PropTypes.instanceOf(Date).isRequired,
        updatedAt: PropTypes.instanceOf(Date).isRequired,
        history: PropTypes.arrayOf(PropTypes.shape({
            body: PropTypes.string.isRequired,
            editedBy: PropTypes.shape({
                id: PropTypes.number.isRequired,
                username: PropTypes.string.isRequired
            }),
            editedAt: PropTypes.instanceOf(Date).isRequired
        })).isRequired
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
                responses: [
                    {
                        name: 'foo_bar',
                        body: 'This is <my> response',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        history: [
                            {
                                body: 'This was my response',
                                editedBy: {
                                    id: 1,
                                    username: 'Tjstretchalot'
                                },
                                editedAt: new Date()
                            }
                        ]
                    }
                ],
                selectedResponseInd: 0
            }
        }

        render() {
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
                    }).bind(this)())
                ]
            );
        }
    }

    ResponsesWidget.propTypes = {};

    return ResponsesWidget;
})();