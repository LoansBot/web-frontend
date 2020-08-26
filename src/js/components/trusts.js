const [
    UserCommentsOnUserAndPostCommentWithAjax,
    UserTrustViewWithAjax,
    UserTrustLookupWithAjax
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
     * @param {bool} editDisabled If true the edit button area is shown but
     *   the actual edit button is disabled (usually used while saving)
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
                                        disabled: this.props.editDisabled,
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
            this.updateCodeFormatting();
        }

        componentDidUpdate() {
            if (this.state.editFormVisible) {
                this.updateCodeFormatting();
            }
        }

        updateCodeFormatting() {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
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
        updatedAt: PropTypes.instanceOf(Date).isRequired,
        editDisabled: PropTypes.bool,
        onEdit: PropTypes.func,
        editAlertSet: PropTypes.func
    };

    /**
     * The form for posting a comment. Shows a preview of what the post will
     * look like once saved.
     *
     * @param {bool} disabled If true the save button is disabled. Otherwise
     *   it's enabled.
     * @param {function} clearSet A function we call with a function which
     *   clears as the inputs on this component.
     * @param {function} onSave A function which we call when the user posts
     *   the comment. We pass the comment body.
     * @param {function} saveAlertSet A function which we call with a function
     *   which accepts one argument (alert), which is either null to hide the
     *   save alert or a react component to render.
     */
    class PostUserComment extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                saveAlert: React.createElement(
                    Alert,
                    {
                        title: 'Title',
                        text: 'Text',
                        type: 'info'
                    }
                ),
                saveAlertVisible: false,
                previewText: '',
                previewCounter: 0
            };
            this.timeout = null;
            this.textQuery = null;
            this.textSet = null;

            this.updatePreview = this.updatePreview.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {className: 'user-trust-comment'},
                [
                    React.createElement(
                        TextArea,
                        {
                            key: 'text-area',
                            rows: 15,
                            textQuery: ((qry) => this.textQuery = qry).bind(this),
                            textSet: ((str) => this.textSet = str).bind(this),
                            textChanged: (() => {
                                if (this.timeout) {
                                    clearTimeout(this.timeout);
                                }

                                this.timeout = setTimeout(this.updatePreview, 1000);
                            }).bind(this)
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'save-alert',
                            initialState: 'closed',
                            desiredState: this.state.saveAlertVisible ? 'expanded' : 'closed'
                        },
                        this.state.saveAlert
                    ),
                    React.createElement(
                        Button,
                        {
                            disabled: this.props.disabled,
                            key: 'submit-button',
                            text: 'Post',
                            style: 'primary',
                            type: 'button',
                            onClick: (() => {
                                if (this.props.onSave) {
                                    this.props.onSave(this.textQuery());
                                }
                            }).bind(this)
                        }
                    ),
                    React.createElement(
                        ReactMarkdown,
                        {
                            key: `preview-${this.state.previewCounter}`,
                            source: this.state.previewText
                        }
                    )
                ]
            )
        }

        updatePreview() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.previewText = this.textQuery();
                newState.previewCounter++;
                return newState;
            });
        }

        componentDidMount() {
            if (this.props.saveAlertSet) {
                this.props.saveAlertSet(((alert) => {
                    if (alert === null || alert === undefined) {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.saveAlertVisible = false;
                            return newState;
                        });
                    } else {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.saveAlert = alert;
                            newState.saveAlertVisible = true;
                            return newState;
                        })
                    }
                }).bind(this));
            }

            if (this.props.clearSet) {
                this.props.clearSet((() => {
                    this.textSet('');
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.previewText = '';
                        newState.previewCounter++;
                        return newState;
                    });
                }).bind(this));
            }
        }

        componentDidUpdate() {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }

        componentWillUnmount() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
    }

    PostUserComment.propTypes = {
        disabled: PropTypes.bool,
        clearSet: PropTypes.func,
        onSave: PropTypes.func,
        saveAlertSet: PropTypes.func
    }

    /**
     * This wraps a PostUserComment with the required logic to actually save
     * the comment to a particular user.
     *
     * @param {number} targetUserId The id of the user who we are posting a
     *   trust comment about.
     * @param {function} onCommentCreated A function we call when we create
     *   a comment with the id of the newly created comment.
     */
    class PostUserCommentWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                saving: false,
                counter: 0,
            }

            this.onSave = this.onSave.bind(this);
            this.setSaveAlertSet = this.setSaveAlertSet.bind(this);
            this.setClearSet = this.setClearSet.bind(this);

            this.saveAlertSet = null;
            this.clearSet = null;
        }

        render() {
            return React.createElement(
                PostUserComment,
                {
                    disabled: this.state.saving,
                    onSave: this.onSave,
                    saveAlertSet: this.setSaveAlertSet
                }
            )
        }

        onSave(comment) {
            if (this.state.saving) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.saving = true;
                return newState;
            });

            let handled = false;
            api_fetch(
                `/api/trusts/comments?target_user_id=${this.props.targetUserId}`,
                AuthHelper.auth({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        comment: comment
                    })
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('save comment', resp).then(this.saveFinished);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                let commentId = json.id;
                if (this.props.onCommentCreated) {
                    this.props.onCommentCreated(commentId);
                }
                this.saveFinished(
                    React.createElement(
                        Alert,
                        {
                            type: 'success',
                            title: 'Success',
                            text: 'Comment saved!'
                        }
                    )
                );
                this.clearSet();
            }).catch(() => {
                if (handled) { return; }

                this.saveFinished(AlertHelper.createFetchError());
            })
        }

        saveFinished(alert) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.saving = false;
                return newState;
            });

            if (alert) {
                this.saveAlertSet(alert)
            }
        }

        setSaveAlertSet(setter) {
            this.saveAlertSet = setter;
        }

        setClearSet(setter) {
            this.clearSet = setter;
        }
    };

    PostUserCommentWithAjax.propTypes = {
        targetUserId: PropTypes.number.isRequired,
        onCommentCreated: PropTypes.func
    }

    /**
     * Renders a users comment by loading it from an ajax call. Will allow
     * editing if the server says we can edit.
     *
     * @param {number} commentId The id of the comment to show
     */
    class UserCommentWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                state: 'loading',  // visible, errored
                errorAlert: React.createElement(
                    Alert,
                    {
                        title: 'Error',
                        text: 'Error',
                        type: 'error'
                    }
                ),
                comment: null,
                editDisabled: false
            };

            this.onEdit = this.onEdit.bind(this);
            this.setErroredWithAlert = this.setErroredWithAlert.bind(this);

            this.saveAlertSet = null;
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'spinner',
                            initialState: 'expanded',
                            desiredState: this.state.state === 'loading' ? 'expanded' : 'closed'
                        },
                        React.createElement(CenteredSpinner)
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'error',
                            initialState: 'closed',
                            desiredState: this.state.state === 'errored' ? 'expanded' : 'closed'
                        },
                        this.state.errorAlert
                    )
                ].concat(this.state.comment === null ? [] : [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'comment',
                            initialState: 'closed',
                            desiredState: this.state.state === 'visible' ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            UserComment,
                            {
                                author: this.state.comment.author,
                                target: this.state.comment.target,
                                comment: this.state.comment.comment,
                                editable: this.state.comment.editable,
                                createdAt: this.state.comment.createdAt,
                                updatedAt: this.state.comment.updatedAt,
                                editDisabled: this.state.editDisabled,
                                onEdit: this.onEdit,
                                editAlertSet: ((str) => this.editAlertSet = str).bind(this)
                            }
                        )
                    )
                ])
            );
        }

        componentDidMount() {
            this.loadComment(false);
        }

        onEdit(newText) {
            if (this.state.editDisabled) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.editDisabled = true;
                return newState;
            });

            let handled = false;
            api_fetch(
                `/api/trusts/comments/${this.props.commentId}`,
                AuthHelper.auth({
                    method: 'PUT',
                    body: JSON.stringify({
                        comment: newText
                    })
                })
            ).then(((res) => {
                if (handled) { return; }

                if (!res.ok) {
                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.editDisabled = false;
                        return newState;
                    });
                    AlertHelper.createFromResponse(res).then(this.saveAlertSet);
                    return;
                }

                this.loadComment(true);
            }).bind(this)).catch(() => {
                if (handled) { return; }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.editDisabled = false;
                    return newState;
                });
                this.saveAlertSet(AlertHelper.createFetchError());
            });
        }

        loadComment(force) {
            let headers = {}
            if (force) {
                headers['Cache-Control'] = 'no-cache';
                headers['Pragma'] = 'no-cache'
            };

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.state = 'loading';
                return newState;
            });

            let handled = false;
            api_fetch(
                `/api/trusts/comments/${this.props.commentId}`,
                AuthHelper.auth({headers: headers})
            ).then((res) => {
                if (handled) { return; }

                if (!res.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('fetch comment', res).then(this.setErroredWithAlert);
                    return;
                }

                return res.json();
            }).then((ogJson) => {
                if (handled) { return; }

                return new Promise((resolve, reject) => {
                    /* Enrich author and target */

                    let completed = new Array(2);
                    let newComment = {
                        id: ogJson.id,
                        comment: ogJson.comment,
                        editable: ogJson.editable,
                        createdAt: new Date(ogJson.created_at * 1000),
                        updatedAt: new Date(ogJson.updated_at * 1000)
                    };

                    if (ogJson.author_id) {
                        api_fetch(
                            `/api/users/${ogJson.author_id}`,
                            AuthHelper.auth()
                        ).then((innerRes) => {
                            if (handled) { return; }

                            if (!innerRes.ok) {
                                handled = true;
                                AlertHelper.createFromResponse('fetch author username', innerRes).then(this.setErroredWithAlert);
                                reject();
                                return;
                            }

                            return innerRes.json();
                        }).then((innerJson) => {
                            if (handled) { return; }

                            newComment.author = innerJson.username;
                            completed[0] = true;

                            if (!completed.includes(undefined)) {
                                resolve(newComment);
                            }
                        }).catch(() => {
                            if (handled) { return; }

                            handled = true;
                            this.setErroredWithAlert(AlertHelper.createFetchError());
                            reject();
                        })
                    } else {
                        completed[0] = true;
                    }


                    api_fetch(
                        `/api/users/${ogJson.target_id}`,
                        AuthHelper.auth()
                    ).then((innerRes) => {
                        if (handled) { return; }

                        if (!innerRes.ok) {
                            handled = true;
                            AlertHelper.createFromResponse('fetch target username', innerRes).then(this.setErroredWithAlert);
                            reject();
                            return;
                        }

                        return innerRes.json();
                    }).then((innerJson) => {
                        if (handled) { return; }

                        newComment.target = innerJson.username;
                        completed[1] = true;

                        if (!completed.includes(undefined)) {
                            resolve(newComment);
                        }
                    }).catch(() => {
                        if (handled) { return; }

                        handled = true;
                        this.setErroredWithAlert(AlertHelper.createFetchError());
                        reject();
                    })
                });
            }).then((enrichedComment) => {
                if (handled) { return; }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'visible';
                    newState.comment = enrichedComment;
                    newState.editDisabled = false;
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setErroredWithAlert(AlertHelper.createFetchError());
            })
        }

        setErroredWithAlert(alert) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.errorAlert = alert;
                newState.state = 'errored';
                return newState;
            });
        }
    };

    UserCommentWithAjax.propTypes = {
        commentId: PropTypes.number.isRequired
    };

    /**
     * Displays a list of user comments using ajax to load them all.
     *
     * @param {number} commentIds The ids of the comments to show.
     * @param {bool} showShowMore True if we should show a button to load more
     *   comments, false if we should not
     * @param {bool} showMoreDisabled True if the show more button is disabled
     *   if shown, false if the show more button is enabled if shown
     * @param {func} onShowMore A function we call when the user clicks the show
     *   more comments button.
     */
    class UserCommentsWithAjax extends React.Component {
        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        React.Fragment,
                        {key: 'comments'},
                        this.props.commentIds ? this.props.commentIds.map((commentId) => {
                            return React.createElement(
                                UserCommentWithAjax,
                                {key: `comment-${commentId}`, commentId: commentId}
                            );
                        }) : React.createElement(
                            Alert,
                            {
                                type: 'info',
                                title: 'Empty list',
                                text: 'There are no comments to display.'
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'show-more',
                            initialState: 'closed',
                            desiredState: this.props.showShowMore ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            Button,
                            {
                                type: 'button',
                                style: 'secondary',
                                text: 'Show More Comments',
                                disabled: this.props.showMoreDisabled,
                                onClick: this.props.onShowMore
                            }
                        )
                    )
                ]
            );
        }
    };

    UserCommentsWithAjax.propTypes = {
        commentIds: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
        showShowMore: PropTypes.bool,
        showMoreDisabled: PropTypes.bool,
        onShowMore: PropTypes.func
    };

    /**
     * Displays a list of user comments on a particular target user,
     * using ajax to fetch which comments to load and then ajax to
     * actually fetch the comments.
     *
     * @param {number} targetUserId The id of the target user to display
     *   comments on.
     * @param {func} onCommentPosted A function which we call with a function
     *   which accepts a comment id and adds it to the beginning of the
     *   displayed comments.
     */
    class UserCommentsOnUserWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                state: 'loading',
                alertShown: false,
                alert: React.createElement(
                    Alert,
                    {type: 'info', title: 'Info', text: 'Info'}
                ),
                commentIds: [],
                nextCreatedBefore: null,
                loadingMoreComments: false
            };

            this.onShowMore = this.onShowMore.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'spinner',
                            initialState: 'expanded',
                            desiredState: this.state.state === 'loading' ? 'expanded' : 'closed'
                        },
                        React.createElement(CenteredSpinner)
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertShown ? 'expanded' : 'closed'
                        },
                        this.state.alert
                    ),
                    React.createElement(
                        UserCommentsWithAjax,
                        {
                            key: 'comments',
                            commentIds: this.state.commentIds,
                            showShowMore: this.state.nextCreatedBefore !== null,
                            showMoreDisabled: this.state.loadingMoreComments,
                            onShowMore: this.onShowMore
                        }
                    )
                ]
            );
        }

        componentDidMount() {
            this.loadComments();

            if (this.props.onCommentPosted) {
                this.props.onCommentPosted(((commentId) => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.commentIds = [commentId].concat(newState.commentIds);
                        return newState;
                    })
                }).bind(this));
            }
        }

        onShowMore() {
            if (this.state.loadingMoreComments) { return; }
            if (this.state.nextCreatedBefore === null) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.loadingMoreComments = true;
                return newState;
            });

            this.loadComments();
        }

        loadComments() {
            let handled = false;

            let arrayParams = [
                ['target_user_id', this.props.targetUserId],
                ['order', 'desc'],
                ['limit', 5]
            ];
            if (this.state.nextCreatedBefore) {
                arrayParams.push(
                    ['created_before', this.state.nextCreatedBefore.getTime() / 1000.0]
                );
            }
            let queryParams = arrayParams.map(
                (arr) => `${arr[0]}=${encodeURIComponent(arr[1])}`
            ).join('&');
            api_fetch(
                `/api/trusts/comments?${queryParams}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('fetch comments', resp).then(((alert) => {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.state = 'errored';
                            newState.loadingMoreComments = false;
                            newState.alertShown = true;
                            newState.alert = alert;
                            return newState;
                        })
                    }).bind(this));
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'visible';
                    newState.commentIds = newState.commentIds.concat(json.comments);
                    newState.loadingMoreComments = false;
                    newState.alertShown = false;
                    newState.nextCreatedBefore = (
                        json.before_created_at ? new Date(json.before_created_at * 1000) : null
                    );
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                let alert = AlertHelper.createFetchError();
                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'errored';
                    newState.loadingMoreComments = false;
                    newState.alertShown = true;
                    newState.alert = alert;
                    return newState;
                })
            });
        }
    };

    UserCommentsOnUserWithAjax.propTypes = {
        targetUserId: PropTypes.number.isRequired,
        onCommentPosted: PropTypes.func
    };

    /**
     * Displays a list of user comments on a particular target user
     * and shows a form to post the comment.
     *
     * @param {number} targetUserId The id of the target user to display
     */
    class UserCommentsOnUserAndPostCommentWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                targetUsername: null
            };

            this.displayNewComment = null;

            this.setDisplayNewComment = this.setDisplayNewComment.bind(this);
            this.onCommentCreated = this.onCommentCreated.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {key: 'trust-comments-widget'},
                [
                    React.createElement(
                        'h3',
                        {key: 'title'},
                        'Trust comments for ' + (this.state.targetUsername || `User ${this.props.targetUserId}`)
                    ),
                    React.createElement(
                        PermissionRequired,
                        {
                            key: 'post-comment',
                            permissions: ['create-trust-comments']
                        },
                        React.createElement(
                            PostUserCommentWithAjax,
                            {
                                targetUserId: this.props.targetUserId,
                                onCommentCreated: this.onCommentCreated
                            }
                        ),
                    ),
                    React.createElement(
                        UserCommentsOnUserWithAjax,
                        {
                            key: 'show-comments',
                            targetUserId: this.props.targetUserId,
                            onCommentPosted: this.setDisplayNewComment
                        }
                    )
                ]
            )
        }

        componentDidMount() {
            this.loadUsername();
        }

        loadUsername() {
            let handled = false;
            api_fetch(
                `/api/users/${this.props.targetUserId}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.targetUsername = json.username;
                    return newState;
                });
            }).catch(() => {
                handled = true;
            });
        }

        setDisplayNewComment(setter) {
            this.displayNewComment = setter;
        }

        onCommentCreated(commentId) {
            if (this.displayNewComment) {
                this.displayNewComment(commentId);
            }
        }
    }

    UserCommentsOnUserAndPostCommentWithAjax.propTypes = {
        targetUserId: PropTypes.number.isRequired
    }

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
        UserCommentsOnUserAndPostCommentWithAjax,
        UserTrustViewWithAjax,
        UserTrustLookupWithAjax,
    ];
})();
