const [
    UserCommentsOnUserAndPostCommentWithAjax,
    UserTrustViewWithAjax,
    UserTrustLookupWithAjax,
    UserTrustControlsWithAjax,
    UserTrustNextQueueItemAjax
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
                    headers: {
                        'Content-Type': 'application/json'
                    },
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
                    AlertHelper.createFromResponse('edit comment', res).then(this.saveAlertSet);
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
     * actually fetch the comments. This also occassionally searches
     * for newer comments.
     *
     * @param {number} targetUserId The id of the target user to display
     *   comments on.
     * @param {func} onCommentPosted A function which we call with a function
     *   which accepts a comment id and adds it to the beginning of the
     *   displayed comments.
     * @param {func} newerCommentsFetch A function which we call with a function
     *   which accepts no arguments and fetches newer comments for this user, i.e.,
     *   comments newer than when we last refreshed comments.
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
                nextCreatedAfter: null,
                nextCreatedBefore: null,
                loadingMoreComments: false
            };

            this.fetchNewerCommentsTimeout = null;
            this.loadedAt = new Date();

            this.onShowMore = this.onShowMore.bind(this);
            this.fetchNewerComments = this.fetchNewerComments.bind(this);
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
            this.loadComments(false);
            this.fetchNewerCommentsTimeout = setTimeout(this.fetchNewerComments, 10000);

            if (this.props.onCommentPosted) {
                this.props.onCommentPosted(((commentId) => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.commentIds = [commentId].concat(newState.commentIds);
                        return newState;
                    })
                }).bind(this));
            }

            if (this.props.newerCommentsFetch) {
                this.props.newerCommentsFetch((() => this.fetchNewerComments(true)).bind(this));
            }
        }

        componentWillUnmount() {
            if (this.fetchNewerCommentsTimeout) {
                clearTimeout(this.fetchNewerCommentsTimeout);
                this.fetchNewerCommentsTimeout = null;
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

            this.loadComments(false);
        }

        fetchNewerComments(force) {
            if (force) {
                if (this.fetchNewerCommentsTimeout) {
                    clearTimeout(this.fetchNewerCommentsTimeout);
                }
                this.fetchNewerCommentsTimeout = null;
            } else {
                this.fetchNewerCommentsTimeout = null;

                let msSinceLoad = new Date().getTime() - this.loadedAt.getTime();
                if (msSinceLoad > 1000 * 60 * 60) {
                    console.log('auto-disabled comment reloading (1 hour since load)');
                    return;
                }

                if (document.hidden) {
                    this.fetchNewerCommentsTimeout = setTimeout(
                        this.fetchNewerComments,
                        60_000
                    );
                    return;
                }
            }

            this.loadComments(true);
        }

        loadComments(fetchNewer) {
            fetchNewer = !!fetchNewer;

            let handled = false;

            let arrayParams = [
                ['target_user_id', this.props.targetUserId],
                ['limit', 5]
            ];
            if (fetchNewer) {
                arrayParams.push(['order', 'asc']);
                arrayParams.push(['created_after', this.state.nextCreatedAfter.getTime() / 1000.0]);

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.nextCreatedAfter = new Date();
                    return newState;
                });
            } else {
                arrayParams.push(['order', 'desc']);
                if (this.state.nextCreatedBefore) {
                    arrayParams.push(
                        ['created_before', this.state.nextCreatedBefore.getTime() / 1000.0]
                    );
                } else {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.nextCreatedAfter = new Date();
                        return newState;
                    });
                }
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
                    // deduplication is required since we race createdAfter

                    let newState = Object.assign({}, state);
                    newState.state = 'visible';
                    if (fetchNewer) {
                        let existingCommentIds = new Set(newState.commentIds);
                        let commentIdsToPrependReversed = [];
                        for (let i = json.comments.length - 1; i >= 0; i--) {
                            let commentId = json.comments[i];
                            if (!existingCommentIds.has(commentId)) {
                                commentIdsToPrependReversed.push(commentId);
                                existingCommentIds.add(commentId);
                            }
                        }
                        newState.commentIds = commentIdsToPrependReversed.reverse().concat(newState.commentIds);
                    } else {
                        let existingCommentIds = new Set(newState.commentIds);
                        newState.commentIds = newState.commentIds.slice();
                        for (let commentId of json.comments) {
                            if (!existingCommentIds.has(commentId)) {
                                newState.commentIds.push(commentId);
                                existingCommentIds.add(commentId);
                            }
                        }
                        newState.nextCreatedBefore = (
                            json.before_created_at ? new Date(json.before_created_at * 1000) : null
                        );
                    }
                    newState.loadingMoreComments = false;
                    newState.alertShown = false;
                    return newState;
                });

                if (fetchNewer) {
                    if (this.fetchNewerCommentsTimeout) {
                        clearTimeout(this.fetchNewerCommentsTimeout);
                    }
                    this.fetchNewerCommentsTimeout = setTimeout(this.fetchNewerComments, 10000);
                }
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

            this.fetchNewerComments = null;

            this.setFetchNewerComments = this.setFetchNewerComments.bind(this);
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
                            newerCommentsFetch: this.setFetchNewerComments
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

        setFetchNewerComments(setter) {
            this.fetchNewerComments = setter;
        }

        onCommentCreated() {
            this.fetchNewerComments();
        }
    }

    UserCommentsOnUserAndPostCommentWithAjax.propTypes = {
        targetUserId: PropTypes.number.isRequired
    }

    /**
     * Shows the trust status of a given user as specified. Accepts children
     * which are rendered at the bottom of this card.
     *
     * @param {number} userId The id of the user
     * @param {string} username The username of the user
     * @param {string} trustStatus The enum describing the trust status of the
     *   user. One of "good", "bad", and "unknown"
     * @param {string} reason The reason for their trust status. Should be null
     *   if no reason was provided, either because the trust status is unknown
     *   and no moderator has commented on it or because we don't have
     *   permission to view the trust reason.
     */
    class UserTrustView extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: `user-trust-view user-trust-view-${this.props.trustStatus}`},
                [
                    React.createElement(
                        'span',
                        {key: 'username', className: 'username'},
                        this.props.username
                    ),
                    React.createElement(
                        'span',
                        {className: 'trust-status', key: 'status'},
                        (() => {
                            if (this.props.trustStatus === 'good') {
                                return 'Good lender standing';
                            } else if (this.props.trustStatus === 'bad') {
                                return 'Bad lender standing';
                            } else {
                                return 'Unknown lender standing';
                            }
                        })()
                    ),
                    React.createElement(
                        'p',
                        {className: 'status-explanation', key: 'explanation'},
                        (() => {
                            if (this.props.trustStatus === 'good') {
                                return (
                                    'As a lender this user appears to be legitimate. There ' +
                                    'are no active bans or censures against this user and they are not ' +
                                    'part of an ongoing investigation.'
                                );
                            } else if (this.props.trustStatus === 'bad') {
                                return (
                                    'As a lender, this user has an ongoing ban, censure, or investigation.'
                                );
                            } else {
                                return (
                                    'As a lender, this user is still forming a relationship ' +
                                    'with the subreddit.'
                                );
                            }
                        })()
                    ),
                    React.createElement(
                        React.Fragment,
                        {key: 'children'},
                        this.props.children
                    )
                ].concat((this.props.reason === null || this.props.reason === undefined) ? [] : [
                    React.createElement(
                        'div',
                        {key: 'reason', className: 'reason'},
                        [
                            React.createElement(
                                'div',
                                {key: 'header', className: 'header'},
                                'Private moderator-provided reason'
                            ),
                            React.createElement(
                                ReactMarkdown,
                                {key: 'reason', source: this.props.reason}
                            )
                        ]
                    )
                ])
            );
        }

        componentDidMount() {
            if (this.props.reason !== null && this.props.reason !== undefined) {
                this.updateCodeFormatting()
            }
        }

        componentDidUpdate() {
            if (this.props.reason !== null && this.props.reason !== undefined) {
                this.updateCodeFormatting()
            }
        }

        updateCodeFormatting() {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
    };

    UserTrustView.propTypes = {
        userId: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
        trustStatus: PropTypes.string.isRequired,
        reason: PropTypes.string
    }

    /**
     * Renders a single user trust control with the given name.
     *
     * @param {string} name The name of the control
     */
    class UserTrustControl extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'user-trust-control'},
                [
                    React.createElement(
                        'div',
                        {key: 'header', className: 'header'},
                        this.props.name,
                    ),
                    React.createElement(
                        React.Fragment,
                        {key: 'children'},
                        this.props.children
                    )
                ]
            )
        }
    }

    UserTrustControl.propTypes = {
        name: PropTypes.string.isRequired
    };

    /**
     * Renders the user trust control to set the status of a particular
     * target.
     *
     * @param {func} onSetStatus Called if the user indicates they want to set
     *   the target users status. Invoked with (status, reason), where status is
     *   the new status value, which is one of 'good', 'bad', and 'unknown'.
     */
    class UserTrustControlSetStatus extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                statusSelected: false,
                reasonAcceptable: false,
                justSubmitted: false
            };

            this.setReasonAlert = null;
            this.queryStatus = null;
            this.reasonTimeout = null;
            this.submitTimeout = null;

            this.setQueryStatus = this.setQueryStatus.bind(this);
            this.statusChanged = this.statusChanged.bind(this);

            this.setSetReasonAlert = this.setSetReasonAlert.bind(this);
            this.setQueryReason = this.setQueryReason.bind(this);
            this.reasonChanged = this.reasonChanged.bind(this);
            this.checkReason = this.checkReason.bind(this);

            this.onSubmit = this.onSubmit.bind(this);
            this.clearSubmitCD = this.clearSubmitCD.bind(this);
        }

        render() {
            return React.createElement(
                UserTrustControl,
                {
                    name: 'Set Trust Status'
                },
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'status-dropdown',
                            labelText: 'Trust status'
                        },
                        React.createElement(
                            DropDown,
                            {
                                options: (this.state.statusSelected ? [] : [
                                    {key: 'unselected', text: 'Select One'}
                                ]).concat([
                                    {key: 'unknown', text: 'Unknown'},
                                    {key: 'good', text: 'Good'},
                                    {key: 'bad', text: 'Bad'}
                                ]),
                                optionQuery: this.setQueryStatus,
                                optionChanged: this.statusChanged
                            }
                        )
                    ),
                    React.createElement(
                        Alertable,
                        {
                            alertSet: this.setSetReasonAlert,
                            key: 'reason'
                        },
                        React.createElement(
                            FormElement,
                            {
                                labelText: 'Reason',
                                description: (
                                    'Will not be shared publicly but it must be supplied. ' +
                                    'May be markdown formatted.'
                                )
                            },
                            React.createElement(
                                TextArea,
                                {
                                    rows: 3,
                                    textQuery: this.setQueryReason,
                                    textChanged: this.reasonChanged
                                }
                            )
                        )
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit',
                            type: 'primary',
                            text: 'Change Status',
                            disabled: (
                                !this.state.statusSelected ||
                                !this.state.reasonAcceptable ||
                                this.state.justSubmitted
                            ),
                            onClick: this.onSubmit
                        }
                    )
                ]
            )
        }

        componentWillUnmount() {
            if (this.reasonTimeout) {
                clearTimeout(this.reasonTimeout);
                this.reasonTimeout = null;
            }

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }
        }

        setQueryStatus(qry) {
            this.queryStatus = qry;
        }

        statusChanged(newStatus) {
            if (this.state.statusSelected) { return; }
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.statusSelected = true;
                return newState;
            });
        }

        setSetReasonAlert(str) {
            this.setReasonAlert = str;
        }

        setQueryReason(qry) {
            this.queryReason = qry;
        }

        reasonChanged() {
            if (this.reasonTimeout) {
                clearTimeout(this.reasonTimeout);
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.reasonAcceptable = false;
                return newState;
            });

            this.reasonTimeout = setTimeout(this.checkReason, 500)
        }

        checkReason() {
            this.reasonTimeout = null;
            let reason = this.queryReason();

            if (reason.length === 0) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.reasonAcceptable = false;
                    return newState;
                });
                this.setReasonAlert();
                return;
            }

            if (reason.length < 5) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.reasonAcceptable = false;
                    return newState;
                });

                this.setReasonAlert(
                    React.createElement(
                        Alert,
                        {
                            title: 'Reason too short',
                            type: 'info',
                            text: 'The reason must be at least 5 characters long.'
                        }
                    )
                );
                return;
            }


            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.reasonAcceptable = true;
                return newState;
            });
            this.setReasonAlert();
        }

        onSubmit() {
            if (this.state.justSubmitted) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = true;
                return newState;
            });

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
            }
            this.submitTimeout = setTimeout(this.clearSubmitCD, 3000);

            if (this.props.onSetStatus) {
                let status = this.queryStatus();
                let reason = this.queryReason();

                this.props.onSetStatus(status, reason);
            }
        }

        clearSubmitCD() {
            this.submitTimeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = false;
                return newState;
            })
        }
    };

    UserTrustControlSetStatus.propTypes = {
        onSetStatus: PropTypes.func
    };

    /**
     * Renders the user trust control to add a particular target user to the
     * trust queue after they have completed a certain minimum number of loans
     * as lender. When they are added back to the main trust queue this also
     * specifies the target review time to set (if later than the time when
     * they complete the loans).
     *
     * @param {func} onDelayForLoans Called when the user request that the
     *   target be readded to the trust queue after they complete a certain
     *   number of loans as lender. Passed (loans, minReviewAt) where loans
     *   is an integer number of completed loans as lender and minReviewAt
     *   is a Date for the earliest time they should be added back to the
     *   queue even if they have completed all the requested loans sooner.
     */
    class UserTrustControlDelayForLoans extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                acceptableNumberOfLoans: false,
                justSubmitted: false,
                initialReviewDate: new Date()
            };

            this.queryNumberOfLoans = null;
            this.queryReviewDate = null;
            this.setNumberOfLoansAlert = null;
            this.submitTimeout = null;

            this.setSetNumberOfLoansAlert = this.setSetNumberOfLoansAlert.bind(this);
            this.setQueryNumberOfLoans = this.setQueryNumberOfLoans.bind(this);
            this.onNumberOfLoansChanged = this.onNumberOfLoansChanged.bind(this);
            this.setQueryReviewDate = this.setQueryReviewDate.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
            this.clearSubmitCD = this.clearSubmitCD.bind(this);
        }

        render() {
            return React.createElement(
                UserTrustControl,
                {name: 'Delay Review based on Number of Loans'},
                [
                    React.createElement(
                        Alertable,
                        {
                            key: 'number-of-loans',
                            alertSet: this.setSetNumberOfLoansAlert
                        },
                        React.createElement(
                            FormElement,
                            {
                                labelText: 'Number of loans completed as lender',
                                description: (
                                    'This user will be readded to the trust review queue once ' +
                                    'they complete this number of loans as lender.'
                                )
                            },
                            React.createElement(
                                TextInput,
                                {
                                    type: 'number',
                                    min: 1,
                                    step: 1,
                                    textQuery: this.setQueryNumberOfLoans,
                                    textChanged: this.onNumberOfLoansChanged
                                }
                            )
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'review-date',
                            labelText: 'Minimum review date',
                            description: (
                                'When this user gets re-added to the trust review queue, what ' +
                                'date should we specify as the target review date? If it is ' +
                                'later than the date they complete the loans they may not be ' +
                                'in the front of the queue. Optional, defaults to now (top of queue).'
                            )
                        },
                        React.createElement(
                            DateTimePicker,
                            {
                                initialDatetime: this.state.initialReviewDate,
                                datetimeQuery: this.setQueryReviewDate
                            }
                        )
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit',
                            text: 'Save Delay',
                            type: 'primary',
                            disabled: (
                                !this.state.acceptableNumberOfLoans ||
                                this.state.justSubmitted
                            ),
                            onClick: this.onSubmit
                        }
                    )
                ]
            )
        }

        componentWillUnmount() {
            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }
        }

        setSetNumberOfLoansAlert(str) {
            this.setNumberOfLoansAlert = str;
        }

        setQueryNumberOfLoans(qry) {
            this.queryNumberOfLoans = qry;
        }

        onNumberOfLoansChanged(val) {
            if (!val || val <= 0) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.acceptableNumberOfLoans = false;
                    return newState;
                });

                this.setNumberOfLoansAlert(
                    React.createElement(
                        Alert,
                        {
                            title: 'Must be positive',
                            type: 'info',
                            text: 'The number of loans must be positive'
                        }
                    )
                );
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.acceptableNumberOfLoans = true;
                return newState;
            });
            this.setNumberOfLoansAlert();
        }

        setQueryReviewDate(qry) {
            this.queryReviewDate = qry;
        }

        onSubmit() {
            if (this.state.justSubmitted) { return; }

            if (this.props.onDelayForLoans) {
                let numberOfLoans = this.queryNumberOfLoans();
                let reviewDate = this.queryReviewDate() || new Date();

                this.props.onDelayForLoans(numberOfLoans, reviewDate);
            }

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = true;
                return newState;
            });

            this.submitTimeout = setTimeout(this.clearSubmitCD, 3000);
        }

        clearSubmitCD() {
            this.submitTimeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = false;
                return newState;
            });
        }
    };

    UserTrustControlDelayForLoans.propTypes = {
        onDelayForLoans: PropTypes.func
    }

    /**
     * Renders the user trust control to set or change the review date for the
     * given target user. Since it's not possible to lookup a particular users
     * review date in the queue, instead this should change a particular review
     * items review date (if rendered within the context of a queue item),
     * otherwise this should add a new item to the trust queue for the target
     * user which has the target date.
     *
     * @param {func} onSetOrChangeQueueTime Called when the user requests to
     *   update the trust queue time for this user. Passed (newReviewAt) which
     *   is the new trust queue review date that the user wants as a Date.
     */
    class UserTrustControlSetOrChangeQueueTime extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                initialQueueTime: new Date(new Date().getTime() + (1000*60*60*24*14)),
                acceptableQueueTime: true,
                justSubmitted: false
            };

            this.queryQueueTime = null;
            this.setQueueTimeAlert = null;
            this.submitTimeout = null;

            this.setQueryQueueTime = this.setQueryQueueTime.bind(this);
            this.setSetQueueTimeAlert = this.setSetQueueTimeAlert.bind(this);
            this.queueTimeChanged = this.queueTimeChanged.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
            this.clearSubmitCD = this.clearSubmitCD.bind(this);
        }

        render() {
            return React.createElement(
                UserTrustControl,
                {name: 'Review Later'},
                [
                    React.createElement(
                        Alertable,
                        {
                            alertSet: this.setSetQueueTimeAlert,
                            key: 'review-date'
                        },
                        React.createElement(
                            FormElement,
                            {
                                labelText: 'Review date'
                            },
                            React.createElement(
                                DateTimePicker,
                                {
                                    initialDatetime: this.state.initialQueueTime,
                                    datetimeQuery: this.setQueryQueueTime,
                                    datetimeChanged: this.queueTimeChanged
                                }
                            )
                        )
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit',
                            text: 'Set Review Date',
                            type: 'primary',
                            disabled: !this.state.acceptableQueueTime || this.state.justSubmitted,
                            onClick: this.onSubmit
                        }
                    )
                ]
            );
        }

        componentWillUnmount() {
            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }
        }

        setQueryQueueTime(qry) {
            this.queryQueueTime = qry;
        }

        setSetQueueTimeAlert(str) {
            this.setQueueTimeAlert = str;
        }

        queueTimeChanged(newTime) {
            if (!newTime) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.acceptableQueueTime = false;
                    return newState;
                });

                this.setQueueTimeAlert(
                    React.createElement(
                        Alert,
                        {
                            type: 'info',
                            title: 'Invalid queue time',
                            text: 'Make sure the date and time are filled out.'
                        }
                    )
                );
                return;
            }

            if (newTime < new Date()) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.acceptableQueueTime = false;
                    return newState;
                });

                this.setQueueTimeAlert(
                    React.createElement(
                        Alert,
                        {
                            type: 'info',
                            title: 'Queue time in past',
                            text: 'The time you have selected is in the past!'
                        }
                    )
                );
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.acceptableQueueTime = true;
                return newState;
            });
            this.setQueueTimeAlert();
        };

        onSubmit() {
            if (this.state.justSubmitted) { return; }

            let reviewDate = this.queryQueueTime();
            if (!reviewDate) { return; }

            if (this.props.onSetOrChangeQueueTime) {
                this.props.onSetOrChangeQueueTime(reviewDate);
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = true;
                return newState;
            });

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
            }

            this.submitTimeout = setTimeout(this.clearSubmitCD, 3000);
        }

        clearSubmitCD() {
            this.submitTimeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = false;
                return newState;
            });
        }
    };

    /**
     * Renders the user trust control to just remove this item from the queue.
     * This only makes sense if rendered in the context of a trust queue item.
     *
     * @param {func} onRemoveFromQueue Called when the user requests to remove
     *   this item from the queue.
     */
    class UserTrustControlRemoveFromQueue extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                justSubmitted: false
            };

            this.timeout = null;

            this.clearJustSubmitted = this.clearJustSubmitted.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                UserTrustControl,
                {
                    name: 'Remove from queue'
                },
                React.createElement(
                    Button,
                    {
                        type: 'primary',
                        text: 'Remove from queue',
                        disabled: this.state.justSubmitted,
                        onClick: this.onSubmit
                    }
                )
            );
        }

        componentWillUnmount() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        clearJustSubmitted() {
            this.timeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = false;
                return newState;
            });
        }

        onSubmit() {
            if (this.state.justSubmitted) { return; }
            if (this.timeout) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justSubmitted = true;
                return newState;
            });

            this.timeout = setTimeout(this.clearJustSubmitted, 3000);

            if (this.props.onRemoveFromQueue) {
                this.props.onRemoveFromQueue();
            }
        }
    };

    /**
     * Renders the user trust controls when told which parts the authenticated
     * user has permission to do.
     *
     * @param {bool} canSetStatus True if the user has permission to set the
     *   trust status for this user, false if they do not. Note we should be
     *   careful to delete the corresponding queue item if this is being done
     *   in the context of the trust queue. False if they do not.
     * @param {func} onSetStatus Called when the user requests the status for
     *   this user be changed. Passed (status, reason), where status is the
     *   new status value, which is one of 'good', 'bad', and 'unknown'.
     * @param {func} setStatusAlertSet Called with a function that will set the
     *   alert status for the set status button.
     * @param {bool} canDelayForLoans True if the user can upsert this users
     *   loan delay, causing them to automatically get added back to the trust
     *   queue after reaching a certain number of completed loans as lender.
     *   False if they do not.
     * @param {func} onDelayForLoans Called when the user request that this
     *   user be readded to the trust queue after they complete a certain
     *   number of loans as lender. Passed (loans, minReviewAt) where loans
     *   is an integer number of completed loans as lender and minReviewAt
     *   is a Date for the earliest time they should be added back to the
     *   queue even if they have completed all the requested loans sooner.
     * @param {func} delayForLoansAlertSet Called with a function that will set
     *   the alert status for the delay for loans button.
     * @param {bool} canSetOrChangeQueueTime True if the user can set a trust
     *   queue time (or change the current set queue time within this item).
     *   False if the user cannot set or change the trust queue time for this
     *   user.
     * @param {func} onSetOrChangeQueueTime Called when the user requests to
     *   update the trust queue time for this user. Passed (newReviewAt) which
     *   is the new trust queue review date that the user wants as a Date.
     * @param {func} setOrChangeQueueTimeAlertSet Called with a function that
     *   will set the alert status for the set or change queue time button.
     * @param {bool} canRemoveFromQueue True if the user can remove this
     *   queue item, false if there is not a queue item in this context or they
     *   cannot remove it.
     * @param {func} onRemoveFromQueue Called when the user requests that we
     *   remove this queue item.
     * @param {func} removeFromQueueAlertSet Called with a function that will set
     *   the alert status for the remove from queue button.
     */
    class UserTrustControls extends React.Component {
        render() {
            return React.createElement(
                React.Fragment,
                null,
                [].concat(this.props.canSetStatus ? [
                    React.createElement(
                        Alertable,
                        {
                            key: 'set-status',
                            alertSet: this.props.setStatusAlertSet
                        },
                        React.createElement(
                            UserTrustControlSetStatus,
                            {onSetStatus: this.props.onSetStatus}
                        )
                    )
                ] : []).concat(this.props.canDelayForLoans ? [
                    React.createElement(
                        Alertable,
                        {
                            key: 'delay-for-loans',
                            alertSet: this.props.delayForLoansAlertSet
                        },
                        React.createElement(
                            UserTrustControlDelayForLoans,
                            {onDelayForLoans: this.props.onDelayForLoans}
                        )
                    )
                ] : []).concat(this.props.canSetOrChangeQueueTime ? [
                    React.createElement(
                        Alertable,
                        {
                            key: 'set-or-change-queue-time',
                            alertSet: this.props.setOrChangeQueueTimeAlertSet
                        },
                        React.createElement(
                            UserTrustControlSetOrChangeQueueTime,
                            {onSetOrChangeQueueTime: this.props.onSetOrChangeQueueTime}
                        )
                    )
                ] : []).concat(this.props.canRemoveFromQueue ? [
                    React.createElement(
                        Alertable,
                        {
                            key: 'remove-from-queue',
                            alertSet: this.props.removeFromQueueAlertSet
                        },
                        React.createElement(
                            UserTrustControlRemoveFromQueue,
                            {onRemoveFromQueue: this.props.onRemoveFromQueue}
                        )
                    )
                ]: [])
            );
        }
    }

    UserTrustControls.propTypes = {
        canSetStatus: PropTypes.bool,
        onSetStatus: PropTypes.func,
        setStatusAlertSet: PropTypes.func,
        canDelayForLoans: PropTypes.bool,
        onDelayForLoans: PropTypes.func,
        delayForLoansAlertSet: PropTypes.func,
        canSetOrChangeQueueTime: PropTypes.bool,
        onSetOrChangeQueueTime: PropTypes.func,
        setOrChangeQueueTimeAlertSet: PropTypes.func,
        canRemoveFromQueue: PropTypes.bool,
        onRemoveFromQueue: PropTypes.func,
        removeFromQueueAlertSet: PropTypes.func
    };

    /**
     * Renders the user trust controls appropriate for the logged in users
     * permissions when targeting the given user, potentially within the
     * context of a particular queue item.
     *
     * @param {number} targetUserId The user id that is being targeted
     * @param {string} queueItemUuid If we're in the context of a particular
     *   queue item for this user, this is should be the uuid of that queue
     *   item. Otherwise this should be null
     * @param {function} onChanged A function we call when the trust status or
     *   queue for this component changed.
     */
    class UserTrustControlsWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                loading: true,
                disabled: true,
                username: null,
                canSetStatus: false,
                canDelayForLoans: false,
                canSetQueueTime: false,
                canRemoveFromQueue: false
            };

            this.setAlert = null;
            this.setAlertForSetStatus = null;
            this.setAlertForDelayForLoans = null;
            this.setAlertForSetQueueTime = null;
            this.setAlertForRemoveFromQueue = null;
            this.timeouts = {};

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSetStatus = this.onSetStatus.bind(this);
            this.setSetAlertForSetStatus = this.setSetAlertForSetStatus.bind(this);
            this.onDelayForLoans = this.onDelayForLoans.bind(this);
            this.setSetAlertForDelayForLoans = this.setSetAlertForDelayForLoans.bind(this);
            this.onSetQueueTime = this.onSetQueueTime.bind(this);
            this.setSetAlertForSetQueueTime = this.setSetAlertForSetQueueTime.bind(this);
            this.onRemoveFromQueue = this.onRemoveFromQueue.bind(this);
            this.setSetAlertForRemoveFromQueue = this.setSetAlertForRemoveFromQueue.bind(this);
        }

        render() {
            return React.createElement(
                SmartHeightEased,
                {
                    initialState: 'closed',
                    desiredState: this.state.loading ? 'closed' : 'expanded'
                },
                React.createElement(
                    Alertable,
                    {alertSet: this.setSetAlert},
                    React.createElement(
                        UserTrustControls,
                        {
                            canSetStatus: this.state.canSetStatus,
                            onSetStatus: this.onSetStatus,
                            setStatusAlertSet: this.setSetAlertForSetStatus,
                            canDelayForLoans: this.state.canDelayForLoans,
                            onDelayForLoans: this.onDelayForLoans,
                            delayForLoansAlertSet: this.setSetAlertForDelayForLoans,
                            canSetOrChangeQueueTime: this.state.canSetQueueTime,
                            onSetOrChangeQueueTime: this.onSetQueueTime,
                            setOrChangeQueueTimeAlertSet: this.setSetAlertForSetQueueTime,
                            canRemoveFromQueue: this.state.canRemoveFromQueue,
                            onRemoveFromQueue: this.onRemoveFromQueue,
                            removeFromQueueAlertSet: this.setSetAlertForRemoveFromQueue
                        }
                    )
                )
            );
        }

        componentDidMount() {
            this.load();
        }

        componentWillUnmount() {
            for (let key in this.timeouts) {
                if (this.timeouts[key]) {
                    clearTimeout(this.timeouts[key]);
                }
            }
            this.timeouts = {};
        }

        load() {
            let completed = new Array(2);

            this.loadUsername(completed, 0);
            this.loadPermissions(completed, 1);
        }

        loadSectionFinished(completed) {
            if (completed.includes(false)) { return; }
            if (completed.includes(undefined)) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = false;
                newState.loading = false;
                return newState;
            });
        }

        loadUsername(completed, idx) {
            let handled = false;
            api_fetch(
                `/api/users/${this.props.targetUserId}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }
                if (completed.includes(false)) { return; }

                if (!resp.ok) {
                    handled = true;
                    completed[idx] = false;

                    AlertHelper.createFromResponse('fetch target username', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }
                if (completed.includes(false)) { return; }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.username = json.username;
                    return newState;
                });
                handled = true;
                completed[idx] = true;
                this.loadSectionFinished(completed);
            }).catch(() => {
                if (handled) { return; }
                if (completed.includes(false)) { return; }

                handled = true;
                completed[idx] = false;

                this.setAlert(AlertHelper.createFetchError());
            });
        }

        loadPermissions(completed, idx) {
            let info = AuthHelper.getAuthToken();
            if (!info) {
                completed[idx] = true;
                this.loadSectionFinished(completed);
                return;
            }

            let handled = false;
            api_fetch(
                `/api/users/${info.userId}/permissions`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }
                if (completed.includes(false)) { return; }

                if (!resp.ok) {
                    handled = true;
                    completed[idx] = false;
                    AlertHelper.createFromResponse('load your permissions', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }
                if (completed.includes(false)) { return; }

                let permsSet = new Set(json.permissions);
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.canSetQueueTime = permsSet.has(
                        this.props.queueItemUuid ? 'edit-trust-queue' : 'add-trust-queue'
                    );
                    newState.canSetStatus = (
                        permsSet.has('upsert-trusts') &&
                        (!this.props.queueItemUuid || permsSet.has('remove-trust-queue'))
                    );
                    newState.canDelayForLoans = (
                        permsSet.has('add-trust-queue') && permsSet.has('edit-trust-queue') &&
                        (!this.props.queueItemUuid || permsSet.has('remove-trust-queue'))
                    );
                    newState.canRemoveFromQueue = (
                        this.props.queueItemUuid && permsSet.has('remove-trust-queue')
                    );
                    return newState;
                });

                handled = true;
                completed[idx] = true;
                this.loadSectionFinished(completed);
            }).catch(() => {
                if (handled) { return; }
                if (completed.includes(false)) { return; }

                handled = true;
                completed[idx] = false;

                this.setAlert(AlertHelper.createFetchError());
            });
        }

        createRequestStartedAlert() {
            return React.createElement(
                Alert,
                {
                    type: 'info',
                    title: 'Sending request'
                },
                React.createElement(CenteredSpinner)
            )
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSetStatus(status, reason) {
            if (this.state.disabled) { return; }

            if (this.timeouts.statusChanged) {
                clearTimeout(this.timeouts.statusChanged);
                this.timeouts.statusChanged = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                return newState;
            });

            this.setAlertForSetStatus(this.createRequestStartedAlert());

            let handled = false;
            api_fetch(
                '/api/trusts',
                AuthHelper.auth({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: this.props.targetUserId,
                        status: status,
                        reason: reason
                    })
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    AlertHelper.createFromResponse('set trust status', resp).then(this.setAlertForSetStatus);

                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.disabled = false;
                        return newState;
                    });
                    return;
                }

                if (this.props.queueItemUuid) {
                    return api_fetch(
                        `/api/trusts/${this.props.queueItemUuid}`,
                        AuthHelper.auth({method: 'DELETE'})
                    );
                }
            }).then((resp) => {
                if (handled) { return; }
                if (!this.props.queueItemUuid) { return; }

                if (!resp.ok) {
                    AlertHelper.createFromResponse('set trust status', resp).then(this.setAlertForSetStatus);

                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.disabled = false;
                        return newState;
                    });
                    return;
                }
            }).then(() => {
                if (handled) { return; }

                if (this.props.onChanged) {
                    this.props.onChanged();
                }

                this.setAlertForSetStatus(
                    React.createElement(
                        Alert,
                        {
                            title: 'Status changed',
                            type: 'success',
                            text: 'The trust status for this user has been updated.'
                        }
                    )
                );

                if (this.timeouts.statusChanged) {
                    clearTimeout(this.timeouts.statusChanged);
                    this.timeouts.statusChanged = null;
                }

                this.timeouts.statusChanged = setTimeout(this.setAlertForSetStatus, 5000);
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                this.setAlertForSetStatus(AlertHelper.createFetchError());
            });
        }

        setSetAlertForSetStatus(str) {
            this.setAlertForSetStatus = str;
        }

        onDelayForLoans(loans, minReviewAt) {
            if (this.state.disabled) { return; }

            minReviewAt = minReviewAt || new Date();

            if (this.timeouts.delayForLoans) {
                clearTimeout(this.timeouts.delayForLoans);
                this.timeouts.delayForLoans = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                return newState;
            });

            this.setAlertForDelayForLoans(this.createRequestStartedAlert());

            let handled = false;
            api_fetch(
                '/api/trusts/loan_delays',
                AuthHelper.auth({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.state.username,
                        loans_completed_as_lender: loans,
                        review_no_earlier_than: minReviewAt.getTime() / 1000.0
                    })
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;

                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.disabled = false;
                        return newState;
                    });

                    AlertHelper.createFromResponse('delay for loans', resp).then(this.setAlertForDelayForLoans);
                    return;
                }

                if (this.props.queueItemUuid) {
                    return api_fetch(
                        `/api/trusts/${this.props.queueItemUuid}`,
                        AuthHelper.auth({method: 'DELETE'})
                    );
                }
            }).then((resp) => {
                if (handled) { return; }
                if (!this.props.queueItemUuid) { return; }

                if (!resp.ok) {
                    handled = true;

                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.disabled = false;
                        return newState;
                    });

                    AlertHelper.createFromResponse('delay for loans', resp).then(this.setAlertForDelayForLoans);
                }
            }).then(() => {
                if (handled) { return; }
                handled = true;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                if (this.props.onChanged) {
                    this.props.onChanged();
                }

                this.setAlertForDelayForLoans(
                    React.createElement(
                        Alert,
                        {
                            title: 'Reminder set',
                            type: 'success',
                            text: (
                                'This user will be added to the trust queue after reaching ' +
                                `${loans} loans completed as lender.`
                            )
                        }
                    )
                );

                if (this.timeouts.delayForLoans) {
                    clearTimeout(this.timeouts.delayForLoans);
                    this.timeouts.delayForLoans = null;
                }

                this.timeouts.delayForLoans = setTimeout(this.setAlertForDelayForLoans, 5000);
            }).catch(() => {
                if (handled) { return; }
                handled = true;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                this.setAlertForDelayForLoans(AlertHelper.createFetchError());
            })
        }

        setSetAlertForDelayForLoans(str) {
            this.setAlertForDelayForLoans = str;
        }

        onSetQueueTime(newReviewAt) {
            if (this.state.disabled) { return; }

            if (this.timeouts.setQueueTime) {
                clearTimeout(this.timeouts.setQueueTime);
                this.timeouts.setQueueTime = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                return newState;
            });

            this.setAlertForSetQueueTime(this.createRequestStartedAlert());

            let handled = false;
            (
                this.props.queueItemUuid ?
                api_fetch(
                    `/api/trusts/queue/${this.props.queueItemUuid}`,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            review_at: newReviewAt.getTime() / 1000.0
                        })
                    })
                ) :
                api_fetch(
                    '/api/trusts/queue',
                    AuthHelper.auth({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: this.state.username,
                            review_at: newReviewAt.getTime() / 1000.0
                        })
                    })
                )
            ).then((resp) => {
                if (handled) { return; }
                handled = true;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                if (!resp.ok) {
                    AlertHelper.createFromResponse('set review time', resp).then(this.setAlertForSetQueueTime);
                    return;
                }

                if (this.props.onChanged) {
                    this.props.onChanged();
                }

                this.setAlertForSetQueueTime(
                    React.createElement(
                        Alert,
                        {
                            title: 'Review time set',
                            type: 'success',
                            text: `The review time for ${this.state.username} has been updated.`
                        }
                    )
                );

                if (this.timeouts.setQueueTime) {
                    clearTimeout(this.timeouts.setQueueTime);
                    this.timeouts.setQueueTime = null;
                }

                this.timeouts.setQueueTime = setTimeout(this.setAlertForSetQueueTime, 5000);
            }).catch(() => {
                if (handled) { return; }
                handled = true;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                this.setAlertForSetQueueTime(AlertHelper.createFetchError());
            })
        }

        setSetAlertForSetQueueTime(str) {
            this.setAlertForSetQueueTime = str;
        }

        onRemoveFromQueue() {
            if (this.state.disabled) { return; }

            if (this.timeouts.removeFromQueue) {
                clearTimeout(this.timeouts.removeFromQueue);
                this.timeouts.removeFromQueue = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                return newState;
            });

            this.setAlertForRemoveFromQueue(this.createRequestStartedAlert());

            let handled = false;
            api_fetch(
                `/api/trusts/queue/${this.props.queueItemUuid}`,
                AuthHelper.auth({
                    method: 'DELETE'
                })
            ).then((resp) => {
                handled = true;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                if (!resp.ok) {
                    AlertHelper.createFromResponse('delete from queue', resp).then(this.setAlertForRemoveFromQueue);
                    return;
                }

                this.setAlertForRemoveFromQueue(
                    React.createElement(
                        Alert,
                        {
                            title: 'Removed from queue',
                            type: 'success',
                            text: (
                                'This item in the queue has been removed. ' +
                                'Press reload at the bottom of the page to get the next ' +
                                'item in the queue.'
                            )
                        }
                    )
                );

                if (this.timeouts.removeFromQueue) {
                    clearTimeout(this.timeouts.removeFromQueue);
                    this.timeouts.removeFromQueue = null;
                }

                this.timeouts.removeFromQueue = setTimeout(this.setAlertForRemoveFromQueue, 5000);
            }).catch(() => {
                if (handled) { return; }
                handled = true;

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.disabled = false;
                    return newState;
                });

                this.setAlertForRemoveFromQueue(AlertHelper.createFetchError());
            });
        }

        setSetAlertForRemoveFromQueue(str) {
            this.setAlertForRemoveFromQueue = str;
        }
    }

    UserTrustControlsWithAjax.propTypes = {
        targetUserId: PropTypes.number.isRequired,
        queueItemUuid: PropTypes.string
    };

    /**
     * Shows the trust status of the given user, fetching it via an ajax call.
     * This will always fetch the highly cached variant first and then may
     * fetch the trust reason afterward if the user has sufficient permissions
     * to do so.
     *
     * @param {number} userId The id of the user
     */
    class UserTrustViewWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                state: 'loading',
                alertVisible: false,
                alert: React.createElement(
                    Alert,
                    {
                        type: 'info',
                        title: 'Info',
                        text: 'info'
                    }
                ),
                username: null,
                trustStatus: null,
                reason: null
            }
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
                            desiredState: this.state.alertVisible ? 'expanded' : 'closed'
                        },
                        this.state.alert
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'trust-status',
                            initialState: 'closed',
                            desiredState: this.state.state === 'visible' ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            UserTrustView,
                            {
                                userId: this.props.userId,
                                username: this.state.username || 'username',
                                trustStatus: this.state.trustStatus || 'unknown',
                                reason: this.state.reason
                            }
                        )
                    )
                ]
            )
        }

        componentDidMount() {
            this.loadInfo();
        }

        loadInfo() {
            let gotUsername = null;
            let gotPublicInfo = null;
            let gotPrivateInfo = null;

            api_fetch(
                `/api/users/${this.props.userId}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (gotUsername !== null) { return; }

                if (!resp.ok) {
                    gotUsername = false;
                    AlertHelper.createFromResponse('fetch username', resp).then((alert) =>
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.state = 'errored';
                            newState.alertVisible = true;
                            newState.alert = alert;
                            return newState;
                        })
                    );
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (gotUsername !== null) { return; }

                gotUsername = true;
                let hadGotInfo = gotPublicInfo;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    if (hadGotInfo) {
                        newState.state = 'visible';
                        newState.alertVisible = false;
                    }
                    newState.username = json.username;
                    return newState;
                });
            }).catch(() => {
                if (gotUsername !== null) { return; }

                gotUsername = false;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'errored';
                    newState.alertVisible = true;
                    newState.alert = AlertHelper.createFetchError();
                    return newState;
                });
            })

            api_fetch(
                `/api/trusts/${this.props.userId}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (gotPublicInfo !== null) { return; }

                if (!resp.ok) {
                    gotPublicInfo = false;
                    AlertHelper.createFromResponse('fetch standard trust info', resp).then((alert) => {
                        if (!gotPublicInfo) {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.state = 'errored';
                                newState.alertVisible = true;
                                newState.alert = alert;
                                return newState;
                            })
                        }
                    });
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (gotPublicInfo !== null) { return; }

                gotPublicInfo = true;
                let hadGotUsername = gotUsername;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    if (hadGotUsername) {
                        newState.state = 'visible';
                        newState.alertVisible = false;
                    }
                    newState.trustStatus = json.status;
                    return newState;
                });
            }).catch(() => {
                if (gotPublicInfo !== null) { return; }

                gotPublicInfo = false;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'errored';
                    newState.alertVisible = true;
                    newState.alert = AlertHelper.createFetchError();
                    return newState;
                });
            });

            this.considerLoadReason().then((json) => {
                if (gotPrivateInfo !== null) { return; }
                gotPrivateInfo = true;
                gotPublicInfo = true;

                let hadGotUsername = gotUsername;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    if (hadGotUsername) {
                        newState.state = 'visible';
                        newState.alertVisible = false;
                    }
                    newState.trustStatus = json.status;
                    newState.reason = json.reason;
                    return newState;
                });
            }).catch(() => {
                if (gotPrivateInfo !== null) { return; }
                gotPrivateInfo = false;
            });
        }

        considerLoadReason() {
            return new Promise((resolve, reject) => {
                let authtoken = AuthHelper.getAuthToken();

                if (authtoken === null) {
                    reject();
                    return;
                }

                let requiredViewPerm = (
                    authtoken.userId === this.props.userId ? 'view-self-trust' : 'view-others-trust'
                );

                let requiredViewReasonPerm = 'view-trust-reasons';

                let handled = false;
                api_fetch(
                    `/api/users/${authtoken.userId}/permissions`,
                    AuthHelper.auth()
                ).then((resp) => {
                    if (!resp.ok) {
                        handled = true;
                        reject();
                        return;
                    }

                    return resp.json();
                }).then((json) => {
                    if (handled) { return; }

                    let permsSet = new Set(json.permissions);
                    if (!permsSet.has(requiredViewPerm)) {
                        handled = true;
                        reject();
                        return;
                    }

                    if (!permsSet.has(requiredViewReasonPerm)) {
                        handled = true;
                        reject();
                        return;
                    }

                    return api_fetch(
                        `/api/trusts/${this.props.userId}/private`,
                        AuthHelper.auth()
                    );
                }).then((resp) => {
                    if (handled) { return; }

                    if (!resp.ok) {
                        handled = true;
                        reject();
                        return;
                    }

                    return resp.json();
                }).then((json) => {
                    if (handled) { return; }
                    handled = true;
                    resolve(json);
                }).catch(() => {
                    if (handled) { return; }

                    reject();
                });
            });
        }
    };

    UserTrustViewWithAjax.propTypes = {
        userId: PropTypes.number.isRequired
    }

    /**
     * Renders all the components that describe a users trust status via ajax
     * calls as appropriate for the user.
     *
     * @param {number} userId The id of the user to render
     * @param {string} queueItemUuid The id of the queue item we're in the context
     *   of, if we're in the context of a queue item
     */
    class UserTrustFullViewWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                trustViewCounter: 0
            };

            this.onTrustStatusChanged = this.onTrustStatusChanged.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        UserTrustViewWithAjax,
                        {
                            key: `trust-view-${this.props.userId}-${this.state.trustViewCounter}`,
                            userId: this.props.userId
                        }
                    ),
                    React.createElement(
                        UserTrustControlsWithAjax,
                        {
                            key: 'controls',
                            targetUserId: this.props.userId,
                            queueItemUuid: this.props.queueItemUuid,
                            onChanged: this.onTrustStatusChanged
                        }
                    ),
                    React.createElement(
                        PermissionRequired,
                        {
                            key: 'comments',
                            permissions: ['view-trust-comments']
                        },
                        React.createElement(
                            UserCommentsOnUserAndPostCommentWithAjax,
                            {
                                key: `trust-comments-${this.props.userId}-${this.state.trustViewCounter}`,
                                targetUserId: this.props.userId
                            }
                        )
                    )
                ]
            )
        }

        onTrustStatusChanged() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.trustViewCounter++;
                return newState;
            });
        }
    }

    UserTrustFullViewWithAjax.propTypes = {
        userId: PropTypes.number.isRequired
    };

    /**
     * Renders a text input to lookup users by their username and then view
     * their trust status based on that. If the user has permission, this
     * will also include controls for manipulating the users trust status
     * and the trust comments on the user.
     */
    class UserTrustLookupWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                userId: null,
                trustVisible: false,
                trustViewCounter: 0
            };

            this.onUserIdChanged = this.onUserIdChanged.bind(this);
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
                            userIdChanged: this.onUserIdChanged
                        }
                    )
                ].concat(this.state.userId === null ? [] : [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'trust',
                            initialState: 'closed',
                            desiredState: this.state.trustVisible ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            UserTrustFullViewWithAjax,
                            {
                                key: 'trust-view',
                                userId: this.state.userId
                            }
                        )
                    )
                ])
            );
        }

        onUserIdChanged(newUserId) {
            if (newUserId === null) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.trustVisible = false;
                    return newState;
                });
            } else {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    if (newState.userId !== newUserId) {
                        newState.trustViewCounter++;
                    }
                    newState.userId = newUserId;
                    newState.trustVisible = true;
                    return newState;
                });
            }
        }
    };

    /**
     * Renders a trust queue item within a trust queue. This shows the review
     * time for the user and then delegates to a user trust full view. This
     *
     * @param {string} uuid The unique identifier for this trust queue item
     * @param {string} username The username of the user this item is for
     * @param {number} userId The user id of the user this item is for
     * @param {Date} reviewAt The time at which this user is set to be reviewed
     */
    class UserTrustQueueItem extends React.Component {
        render() {
            let isDue = this.props.reviewAt <= new Date();
            return React.createElement(
                'div',
                {
                    className: `trust-queue-item trust-queue-item-${isDue ? 'due' : 'future'}`
                },
                [
                    React.createElement(
                        'h2',
                        {key: 'review-at', className: 'review-at'},
                        React.createElement(
                            React.Fragment,
                            null,
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: 'prefix'},
                                    'Set to be reviewed '
                                ),
                                React.createElement(
                                    TextDateTime,
                                    {
                                        key: 'time',
                                        time: this.props.reviewAt
                                    }
                                )
                            ]
                        )
                    ),
                    React.createElement(
                        UserTrustFullViewWithAjax,
                        {
                            key: 'trust-view',
                            userId: this.props.userId,
                            queueItemUuid: this.props.uuid
                        }
                    )
                ]
            );
        }
    };

    UserTrustQueueItem.propTypes = {
        uuid: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        userId: PropTypes.number.isRequired,
        reviewAt: PropTypes.instanceOf(Date).isRequired
    }

    /**
     * Renders a trust queue item within a trust queue, enriching the parameters
     * which aren't directly passed with ajax.
     *
     * @param {string} uuid The unique identifier for this trust queue item
     * @param {string} username The username of the user this item is for
     * @param {Date} reviewAt The time at which this user is set to be reviewed
     */
    class UserTrustQueueItemAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                userId: null
            };

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
        }

        render() {
            return React.createElement(
                Alertable,
                {
                    alertSet: this.setSetAlert
                },
                this.state.userId === null ? React.createElement(React.Fragment) : React.createElement(
                    UserTrustQueueItem,
                    {
                        uuid: this.props.uuid,
                        username: this.props.username,
                        userId: this.state.userId,
                        reviewAt: this.props.reviewAt
                    }
                )
            );
        }

        componentDidMount() {
            this.loadUserId();
        }

        loadUserId() {
            let handled = false;
            api_fetch(
                `/api/users/lookup?q=${encodeURIComponent(this.props.username)}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('fetch user id', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.userId = json.id;
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                this.setAlert(AlertHelper.createFetchError());
            })
        }

        setSetAlert(str) {
            this.setAlert = str;
        }
    }

    UserTrustQueueItemAjax.propTypes = {
        uuid: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        reviewAt: PropTypes.instanceOf(Date).isRequired
    };

    /**
     * Uses ajax to fetch the next queue item in the queue, if there is one,
     * and then render it.
     */
    class UserTrustNextQueueItemAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                itemA: {
                    visible: false,
                    uuid: null,
                    username: null,
                    reviewAt: null
                },
                itemB: {
                    visible: false,
                    uuid: null,
                    username: null,
                    reviewAt: null
                },
                queueEmpty: false,
                reloadDisabled: true
            };

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.reload = this.reload.bind(this);
        }

        render() {
            return React.createElement(
                Alertable,
                {
                    alertSet: this.setSetAlert
                },
                [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'done-alert',
                            initialState: 'closed',
                            desiredState: this.state.queueEmpty ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            Alert,
                            {
                                type: 'success',
                                title: 'Queue empty',
                                text: (
                                    'Great work! There are no users which are due for a review. We will ' +
                                    'show who is coming up below, if anyone is coming up.'
                                )
                            }
                        )
                    )
                ].concat(this.state.itemA.uuid === null ? [] : [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: `queue-item-${this.state.itemA.uuid}`,
                            initialState: 'expanded',
                            desiredState: this.state.itemA.visible ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            UserTrustQueueItemAjax,
                            {
                                uuid: this.state.itemA.uuid,
                                username: this.state.itemA.username,
                                reviewAt: this.state.itemA.reviewAt
                            }
                        )
                    )
                ]).concat(this.state.itemB.uuid === null ? [] : [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: `queue-item-${this.state.itemB.uuid}`,
                            initialState: 'expanded',
                            desiredState: this.state.itemB.visible ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            UserTrustQueueItemAjax,
                            {
                                uuid: this.state.itemB.uuid,
                                username: this.state.itemB.username,
                                reviewAt: this.state.itemB.reviewAt
                            }
                        )
                    )
                ]).concat([
                    React.createElement(
                        Button,
                        {
                            key: 'reload',
                            type: 'secondary',
                            text: 'Reload',
                            disabled: this.state.reloadDisabled,
                            onClick: this.reload
                        }
                    )
                ])
            );
        }

        componentDidMount() {
            this.reload(true);
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        reload(force) {
            if (!force && this.state.reloadDisabled) { return; }

            let usingItemA = !this.state.itemA.visible;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.reloadDisabled = true;
                newState.itemA = Object.assign({}, newState.itemA);
                newState.itemA.visible = false;
                newState.itemB = Object.assign({}, newState.itemB);
                newState.itemB.visible = false;
                return newState;
            });

            let handled = false;
            api_fetch(
                '/api/trusts/queue?limit=1',
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    this.enableReload();
                    AlertHelper.createFromResponse('fetch queue', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                if (json.queue.length === 0) {
                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.reloadDisabled = false;
                        newState.queueEmpty = true;
                        return newState;
                    });
                    return;
                }

                handled = true;
                let item = {
                    uuid: json.queue[0].uuid,
                    username: json.queue[0].username,
                    reviewAt: new Date(json.queue[0].review_at * 1000)
                };

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.reloadDisabled = false;
                    newState.queueEmpty = item.reviewAt > new Date();
                    let toUpdate = null;
                    if (usingItemA) {
                        newState.itemA = Object.assign({}, newState.itemA);
                        toUpdate = newState.itemA;
                    } else {
                        newState.itemB = Object.assign({}, newState.itemB);
                        toUpdate = newState.itemB;
                    }
                    toUpdate.visible = true;
                    toUpdate.uuid = item.uuid;
                    toUpdate.username = item.username;
                    toUpdate.reviewAt = item.reviewAt;
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.enableReload();
                this.setAlert(AlertHelper.createFetchError());
            });
        }

        enableReload() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.reloadDisabled = false;
                return newState;
            });
        }
    }

    return [
        UserCommentsOnUserAndPostCommentWithAjax,
        UserTrustViewWithAjax,
        UserTrustLookupWithAjax,
        UserTrustControlsWithAjax,
        UserTrustNextQueueItemAjax
    ];
})();
