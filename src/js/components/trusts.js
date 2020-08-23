const [
    UserCommentsViewWithAjax,
    UserTrustViewWithAjax,
    UserTrustLookupWithAjax,
    UserComment
] = (() => {
    /**
     * Describes a single comment made by a user regarding the trustworthiness
     * status of a different user. Comments are rendered as markdown.
     *
     * @param {string} author The username of the author if known.
     * @param {string} target The username of the user this comment is talking
     *   about.
     * @param {string} comment The raw comment, formatted as markdown.
     * @param {bool} editable True if the comment should show edit controls,
     *   false if it should not show edit controls.
     * @param {Date} createdAt When this comment was first posted
     * @param {Date} updatedAt When this comment was last updated
     *
     * @param {function} onEdit A function which we call when the user edits
     *   this comment. We pass the new comment body that should be used.
     * @param {function} editAlertSet A function which we call with a function
     *   which accepts one argument (alert), which is either null to hide the
     *   edit alert or a react component to render
     */
    class UserComment extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                sourceVisible: false,
                toggleEditButtonVisible: !!this.props.editable,
                editFormVisible: false,
                previewComment: this.props.comment,
                previewCounter: 0,
                editAlertVisible: false,
                editAlert: React.createElement(
                    Alert,
                    {
                        title: 'Alert Title',
                        text: 'Alert Text',
                        type: 'info'
                    }
                )
            };

            this.editTextQuery = null;
            this.timeout = null;

            this.setTextQuery = this.setTextQuery.bind(this);
            this.editTextChanged = this.editTextChanged.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {className: 'user-trust-comment'},
                [
                    React.createElement(
                        'div',
                        {
                            className: 'header',
                            key: 'header'
                        },
                        [
                            React.createElement(
                                'span',
                                {
                                    className: 'author',
                                    key: 'author'
                                },
                                this.props.author || '[deleted]'
                            ),
                            React.createElement(
                                'span',
                                {
                                    className: 'about',
                                    key: 'about'
                                },
                                `(about ${this.props.target})`
                            ),
                            React.createElement(
                                'span',
                                {
                                    className: 'created-at',
                                    key: 'created-at'
                                },
                                React.createElement(
                                    TextDateTime,
                                    {
                                        time: this.props.createdAt
                                    }
                                )
                            ),
                            React.createElement(
                                'span',
                                {
                                    className: 'updated-at',
                                    key: 'updated-at'
                                },
                                [
                                    React.createElement(
                                        React.Fragment,
                                        {key: 'pfx'},
                                        '(last edited '
                                    ),
                                    React.createElement(
                                        TextDateTime,
                                        {
                                            key: 'time',
                                            time: this.props.updatedAt
                                        }
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: 'sfx'},
                                        ')'
                                    )
                                ]
                            )
                        ]
                    ),
                    React.createElement(
                        'div',
                        {
                            className: 'comment',
                            key: 'body'
                        },
                        React.createElement(
                            ReactMarkdown,
                            {source: this.props.comment}
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            className: 'tool',
                            key: 'tool-show-source'
                        },
                        [
                            React.createElement(
                                Button,
                                {
                                    key: 'show-source-button',
                                    text: this.state.sourceVisible ? 'Hide Source' : 'Show Source',
                                    style: 'secondary',
                                    type: 'button',
                                    onClick: (() => {
                                        this.setState((state) => {
                                            let newState = Object.assign({}, state);
                                            newState.sourceVisible = !state.sourceVisible;
                                            return newState;
                                        });
                                    }).bind(this)
                                }
                            ),
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'source',
                                    initialState: 'closed',
                                    desiredState: this.state.sourceVisible ? 'expanded' : 'closed'
                                },
                                React.createElement(
                                    'pre',
                                    null,
                                    React.createElement(
                                        'code',
                                        {className: 'language-markdown'},
                                        this.props.comment
                                    )
                                )
                            )
                        ]
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'tool-edit',
                            initialState: this.props.editable ? 'expanded' : 'closed',
                            desiredState: this.props.editable ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            'div',
                            {
                                className: 'tool',
                                key: 'tool-edit'
                            },
                            [
                                React.createElement(
                                    Button,
                                    {
                                        key: 'edit-button',
                                        style: 'secondary',
                                        type: 'button',
                                        text: this.state.editFormVisible ? 'Hide Edit Form' : 'Show Edit Form',
                                        onClick: (() => {
                                            this.setState((state) => {
                                                let newState = Object.assign({}, state);
                                                newState.editFormVisible = !state.editFormVisible;
                                                return newState;
                                            })
                                        }).bind(this)
                                    }
                                ),
                                React.createElement(
                                    SmartHeightEased,
                                    {
                                        key: 'edit-form',
                                        initialState: 'closed',
                                        desiredState: this.state.editFormVisible ? 'expanded' : 'closed',
                                    },
                                    [
                                        React.createElement(
                                            TextArea,
                                            {
                                                key: 'text-area',
                                                text: this.props.comment,
                                                rows: 15,
                                                textQuery: this.setTextQuery,
                                                textChanged: this.editTextChanged
                                            }
                                        ),
                                        React.createElement(
                                            SmartHeightEased,
                                            {
                                                key: 'edit-alert',
                                                initialState: 'closed',
                                                desiredState: this.state.editAlertVisible ? 'expanded' : 'closed'
                                            },
                                            this.state.editAlert
                                        ),
                                        React.createElement(
                                            Button,
                                            {
                                                key: 'post-edit-button',
                                                style: 'primary',
                                                type: 'button',
                                                text: 'Save',
                                                onClick: (() => {
                                                    if (this.props.onEdit) {
                                                        this.props.onEdit(this.editTextQuery());
                                                    }
                                                }).bind(this)
                                            }
                                        ),
                                        React.createElement(
                                            ReactMarkdown,
                                            {
                                                key: `preview-${this.state.previewCounter}`,
                                                source: this.state.previewComment
                                            }
                                        )
                                    ]
                                )
                            ]
                        )
                    )
                ]
            );
        }

        componentDidMount() {
            if (this.props.editAlertSet) {
                this.props.editAlertSet(((alert) => {
                    if (alert === null || alert === undefined) {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.editAlertVisible = false;
                            return newState;
                        });
                    } else {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.editFormVisible = true;
                            newState.editAlert = alert;
                            newState.editAlertVisible = true;
                            return newState;
                        });
                    }
                }).bind(this));
            }
        }

        componentDidUpdate() {
            if (this.state.editFormVisible) {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            }
        }

        componentWillUnmount() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        setTextQuery(qry) {
            this.editTextQuery = qry;
        }

        editTextChanged() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.timeout = setTimeout((() => {
                this.timeout = null;
                let newText = this.editTextQuery();
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.previewComment = newText;
                    newState.previewCounter++;
                    return newState;
                });
            }).bind(this), 1000);
        }
    };

    UserComment.propTypes = {
        author: PropTypes.string,
        target: PropTypes.string.isRequired,
        comment: PropTypes.string.isRequired,
        editable: PropTypes.bool.isRequired,
        createdAt: PropTypes.instanceOf(Date).isRequired,
        updatedAt: PropTypes.instanceOf(Date).isRequired
    };

    class UserComments extends React.Component {
        render() {
            return React.createElement('p', null, 'UserComments');
        }
    };

    class UserCommentWithAjax extends React.Component {
        render() {
            return React.createElement('p', null, 'UserCommentWithAjax');
        }
    };

    class UserCommentsWithAjax extends React.Component {
        render() {
            return React.createElement('p', null, 'UserCommentsWithAjax');
        }
    };

    class UserTrustView extends React.Component {
        render() {
            return React.createElement('p', null, 'UserTrustView');
        }
    };

    class UserTrustViewWithAjax extends React.Component {
        render() {
            return React.createElement('p', null, 'UserTrustViewWithAjax');
        }
    };

    class UserTrustLookupWithAjax extends React.Component {
        render() {
            return React.createElement('p', null, 'UserTrustLookupWithAjax');
        }
    };

    return [
        UserCommentsWithAjax,
        UserTrustViewWithAjax,
        UserTrustLookupWithAjax,
        UserComment
    ];
})();
