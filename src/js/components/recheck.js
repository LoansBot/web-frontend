const [RecheckHelperAndToolWithAjax] = (function() {
    /**
     * A helper tool for grabbing comment/link fullnames from a link. This
     * is shown as a simple text input.
     *
     * @param {function} emptyChanged We call this function with a boolean
     *   every time the emptiness status of this field changes. The boolean
     *   is true if the field is now empty and false if the field is now not
     *   empty.
     * @param {function} valueChanged We call this function with two values -
     *   the link fullname and the comment fullname - whenever we are able to
     *   parse them from the link.
     * @param {function} focus We call this with a function which will rip
     *   focus to our text input
     */
    class RecheckLinkField extends React.Component {
        constructor(props) {
            super(props);

            this.textChanged = this.textChanged.bind(this);
            this.lastValue = '';
        }

        render() {
            return React.createElement(
                TextInput,
                {
                    type: 'text',
                    textChanged: this.textChanged,
                    focus: this.props.focus
                }
            );
        }

        textChanged(newValue) {
            if (this.lastValue.length === 0 && newValue.length !== 0 && this.props.emptyChanged) {
                this.props.emptyChanged(false);
            }

            if (this.lastValue.length !== 0 && newValue.length === 0 && this.props.emptyChanged) {
                this.props.emptyChanged(true);
            }
            this.lastValue = newValue;

            let re = /https?:\/\/(old\.|www\.)?reddit.com\/(r\/[\w_-]+\/)?comments\/(?<linkId>[\w\d]+)\/[\w_-]+\/(?<commentId>[\w\d]+)(\/|\?|#|$)/

            let match = re.exec(newValue);
            if (!match) { return; }

            if (this.props.valueChanged) {
                this.props.valueChanged(
                    't3_' + match.groups.linkId, 't1_' + match.groups.commentId
                );
            }
        }
    };

    RecheckLinkField.propTypes = {
        emptyChanged: PropTypes.func,
        valueChanged: PropTypes.func,
        focus: PropTypes.func
    };

    /**
     * Displays 3 fields - a field where a link can be pasted in, a field for
     * a comment fullname, and a field for a link fullname. When the link one
     * is filled the comment fullname and link fullname fields are disabled
     * and are shown with the parsed comment/link fullname from the url.
     *
     * Below these fields is the button to submit which says "Request Recheck".
     */
    class RecheckHelperAndToolWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: {
                    title: 'Test Title',
                    type: 'info',
                    text: 'You should not see this'
                },
                alertState: 'closed',
                linkEmpty: true,
                loading: false
            };

            this.linkFocus = null;
            this.linkFullnameQuery = null;
            this.linkFullnameSet = null;
            this.linkFullnameFocus = null;
            this.commentFullnameQuery = null;
            this.commentFullnameSet = null;
            this.commentFullnameFocus = null;

            this.linkEmptyChanged = this.linkEmptyChanged.bind(this);
            this.linkValueChanged = this.linkValueChanged.bind(this);
            this.submit = this.submit.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {className: 'recheck-helper-and-tool-with-ajax'},
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'link',
                            labelText: 'Comment Permalink URL',
                            component: RecheckLinkField,
                            componentArgs: {
                                emptyChanged: this.linkEmptyChanged,
                                valueChanged: this.linkValueChanged,
                                focus: ((fcs) => this.linkFocus = fcs).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'link-fullname',
                            labelText: 'Link Fullname (t3_abc)',
                            component: TextInput,
                            componentArgs: {
                                disabled: !this.state.linkEmpty,
                                textQuery: ((qry) => this.linkFullnameQuery = qry).bind(this),
                                textSet: ((str) => this.linkFullnameSet = str).bind(this),
                                focus: ((fcs) => this.linkFullnameFocus = fcs).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'comment-fullname',
                            labelText: 'Comment Fullname (t1_xyz)',
                            component: TextInput,
                            componentArgs: {
                                disabled: !this.state.linkEmpty,
                                textQuery: ((qry) => this.commentFullnameQuery = qry).bind(this),
                                textSet: ((str) => this.commentFullnameSet = str).bind(this),
                                focus: ((fcs) => this.commentFullnameFocus = fcs).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'submit',
                            text: 'Recheck Comment',
                            style: 'primary',
                            type: 'button',
                            onClick: this.submit,
                            disabled: this.state.loading
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
                                key: 'real-alert',
                                title: this.state.alert.title,
                                type: this.state.alert.type,
                                text: this.state.alert.text
                            }
                        )
                    )
                ]
            );
        }

        linkEmptyChanged(empty) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.linkEmpty = empty;
                return newState;
            })
        }

        linkValueChanged(linkFullname, commentFullname) {
            this.linkFullnameSet(linkFullname);
            this.commentFullnameSet(commentFullname);
        }

        submit() {
            if (this.state.loading) { return false; }

            const linkFullname = this.linkFullnameQuery();
            const commentFullname = this.commentFullnameQuery();

            if (!linkFullname.startsWith('t3_')) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = {
                        title: 'Bad link fullname',
                        type: 'warning',
                        text: (
                            'The link fullname field is invalid. Make sure the link fullname ' +
                            'field is filled in and starts with t3_. If using a link, make sure ' +
                            'the link is correct.'
                        )
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });

                if (this.state.linkEmpty) {
                    this.linkFullnameFocus();
                } else {
                    this.linkFocus();
                }
                return;
            }

            if (!commentFullname.startsWith('t1_')) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alert = {
                        title: 'Bad comment fullname',
                        type: 'warning',
                        text: (
                            'The comment fullname field is invalid. Make sure the comment fullname ' +
                            'field is filled in and starts with t1_. If using a link, make sure the ' +
                            'comment is correct.'
                        )
                    };
                    newState.alertState = 'expanded';
                    return newState;
                });

                if (this.state.linkEmpty) {
                    this.commentFullnameFocus();
                } else {
                    this.linkFocus();
                }
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.alertState = 'expanded';
                newState.alert = {
                    type: 'info',
                    title: 'Sending Request',
                    text: 'Submitting request to recheck to the server...'
                };
                newState.loading = true;
                return newState;
            });

            api_fetch(
                '/api/loansbot/rechecks',
                AuthHelper.auth({
                    method: 'POST',
                    body: JSON.stringify({
                        link_fullname: linkFullname,
                        comment_fullname: commentFullname
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            ).then((resp) => {
                if (!resp.ok) {
                    return Promise.reject({
                        type: 'error',
                        title: resp.status === 429 ? 'Ratelimited' : 'Failure',
                        text: resp.status === 429 ? (
                            'The server responded that you have exhausted your quota. ' +
                            'Rechecks can cause the loansbot to post comments, which we ' +
                            'do not want to do too often, even by request. Wait a few ' +
                            'minutes and try again.'
                        ) : (
                            `The server responded with status code ${resp.status} which ` +
                            'indicates failure. Wait a few minutes and try again, google ' +
                            `HTTP status code ${resp.status} and check the network tab, or ` +
                            'contact the site administrator.'
                        )
                    });
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertState = 'expanded';
                    newState.alert = {
                        type: 'success',
                        title: 'Successfully Queued Recheck',
                        text: (
                            'The loansbot should recheck the comment within a few minutes. ' +
                            'If it still does not detect a summon it will not respond and you ' +
                            'should double check the comment or contact the moderators (or read ' +
                            'the logs if you are a moderator).'
                        )
                    };
                    newState.loading = true;
                    return newState;
                });
            }).catch((e) => {
                if (typeof(e) !== 'object' || typeof(e.title) !== 'string') {
                    e = {
                        type: 'error',
                        title: 'Unexpected Error',
                        text: (
                            'There was a failure to fetch, which usually indicates ' +
                            'this is a non-official front-end and there was a server ' +
                            'error'
                        )
                    };
                }

                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertState = 'expanded';
                    newState.alert = e;
                    newState.loading = false;
                    return newState;
                });
            });
        }
    };

    return [RecheckHelperAndToolWithAjax];
})();
