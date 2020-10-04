const [EndpointSelectFormWithAjaxAndView, EndpointAddFormWithAjax] = (() => {
    /**
     * Describes a view for a particular endpoint parameter, which optionally
     * shows a "show children" button and an "show description" button. It's
     * assumed that the location and path are clear from the heirarchy.
     *
     * @param {string} name The name for this parameter
     * @param {string} varType The type for this parameter
     * @param {string} descriptionMarkdown The markdown description for this
     *   parameter, if we have it. Otherwise null.
     * @param {string} initialDescriptionState If specified should be either
     *   'expanded' or 'closed' and is used as if by SmartHeightEased for
     *   deciding whether or not to ease out the description if the description
     *   starts out visible. If not specified the description is not eased out.
     * @param {boolean} descriptionVisible True if we should show the
     *   description for this parameter immediately. Must only be set if the
     *   description is set. False, null, or undefined to not show the
     *   description until the user clicks a button.
     * @param {boolean} showGetDescription True to show a button to get the
     *   description for this variable, false not to show that button. This
     *   will essentially make the "toggle description" button visible even
     *   when we don't actually have a description
     * @param {func} getDescriptionAlertSet Called with a function which sets the
     *   alert on the get description button.
     * @param {func} onGetDescription Called when the user requests the description
     *   using the button shown when showGetDescription is true.
     * @param {boolean} initialChildrenState If specified should either be
     *   'expanded' or 'closed' and is used as if by SmartHeightEased for deciding
     *   whether or not to ease out the children if the children start out visible.
     *   If not specified the children are not eased out.
     * @param {boolean} expandChildrenTristate True if the children are expanded. False
     *   if the children are not expanded but there are children. Null or undefined if
     *   there are no children.
     * @param {func} onChildrenExpandedChanged A function which is called when the
     *   user clicks the button to toggle if the children are expanded or not, which
     *   is only posisble if expandChildrenTristate is neither null nor undefined.
     *   Passed the new value for expandChildrenTristate.
     */
    class EndpointParamView extends React.Component {
        constructor(props) {
            super(props);

            this.ogDescriptionVisible = !!props.descriptionVisible;
            this.ogChildrenVisible = !!props.expandChildrenTristate;

            this.state = {
                descriptionVisible: this.ogDescriptionVisible,
                justGotDescription: false,
                childrenVisible: this.ogChildrenVisible
            };

            this.timeout = null;
            this.renderedDescription = false;

            this.toggleDescription = this.toggleDescription.bind(this);
            this.toggleChildren = this.toggleChildren.bind(this);
            this.clearJustGotDescription = this.clearJustGotDescription.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {
                    className: 'endpoint-param'
                },
                [
                    React.createElement(
                        'div',
                        {
                            className: 'endpoint-param-header',
                            key: 'header'
                        },
                        React.createElement(
                            'span',
                            {className: 'param-name', key: 'name'},
                            this.props.name
                        ),
                        React.createElement(
                            React.Fragment,
                            {key: 'space'},
                            ' '
                        ),
                        React.createElement(
                            'span',
                            {className: 'param-type', key: 'type'},
                            this.props.varType
                        )
                    )
                ].concat((this.props.descriptionMarkdown || this.props.showGetDescription) ? [
                    React.createElement(
                        Alertable,
                        {
                            key: 'toggle-description-button',
                            alertSet: this.props.getDescriptionAlertSet
                        },
                        React.createElement(
                            Button,
                            {
                                type: 'button',
                                text: (this.props.descriptionMarkdown && this.state.descriptionVisible) ? 'Hide Param Description' : 'Show Param Description',
                                disabled: !this.props.descriptionMarkdown && this.state.justGotDescription,
                                onClick: this.toggleDescription
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'description',
                            initialState: this.props.initialDescriptionState || (
                                this.ogDescriptionVisible ? 'expanded' : 'closed'
                            ),
                            desiredState: (this.props.descriptionMarkdown && this.state.descriptionVisible) ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            'div',
                            {className: 'param-description'},
                            React.createElement(
                                ReactMarkdown,
                                {source: this.props.descriptionMarkdown || ''}
                            )
                        )
                    )
                ] : []).concat((this.props.expandChildrenTristate !== null && this.props.expandChildrenTristate !== undefined) ? [
                    React.createElement(
                        Button,
                        {
                            key: 'toggle-children',
                            type: 'button',
                            text: this.state.childrenVisible ? 'Hide Children' : 'Show Children',
                            onClick: this.toggleChildren
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'children',
                            initialState: this.props.initialChildrenState || (
                                this.ogChildrenVisible ? 'expanded' : 'closed'
                            ),
                            desiredState: this.state.childrenVisible ? 'expanded' : 'closed'
                        },
                        this.props.children
                    )
                ] : [])
            );
        }

        componentDidMount() {
            this.considerUpdateHighlighting();
        }

        componentDidUpdate() {
            this.considerUpdateHighlighting();
        }

        considerUpdateHighlighting() {
            if (this.renderedDescription) {
                return;
            }

            if (this.props.descriptionMarkdown && this.state.descriptionVisible) {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
                this.renderedDescription = true;
            }
        }

        componentWillUnmount() {
            if (this.timer) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        toggleDescription() {
            if (this.state.justGotDescription) { return; }

            if (this.props.descriptionMarkdown) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.descriptionVisible = !newState.descriptionVisible;
                    return newState;
                });
                return;
            }

            if (this.props.onGetDescription) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.justGotDescription = true;
                    newState.descriptionVisible = true;
                    return newState;
                });

                if (this.timeout) {
                    clearTimeout(this.timeout);
                }

                this.timeout = setTimeout(this.clearJustGotDescription, 1000);

                this.props.onGetDescription();
            }
        }

        clearJustGotDescription() {
            this.timeout = null;
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.justGotDescription = false;
                return newState;
            })
        }

        toggleChildren() {
            let newVisible = !this.state.childrenVisible;
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.childrenVisible = newVisible;
                return newState;
            });

            if (this.props.onChildrenExpandedChanged) {
                this.props.onChildrenExpandedChanged(newVisible);
            }
        }
    }

    EndpointParamView.propTypes = {
        name: PropTypes.string,
        varType: PropTypes.string.isRequired,
        descriptionMarkdown: PropTypes.string,
        initialDescriptionState: PropTypes.string,
        descriptionVisible: PropTypes.bool,
        showGetDescription: PropTypes.bool,
        onGetDescription: PropTypes.func,
        initialChildrenState: PropTypes.string,
        expandChildrenTristate: PropTypes.bool
    }

    /**
     * Renders an endpoint alternative, fetching the description using ajax.
     *
     * @param {string} fromEndpointSlug The slug of the endpoint this is explaining
     *   how to migrate away from.
     * @param {string} toEndpointSlug The slug of the endpoint this is explaining
     *   how to migrate toward.
     */
    class EndpointAlternativeViewWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                description: 'Loading..',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.load = this.load.bind(this);
        }

        render() {
            return React.createElement(
                Alertable,
                {
                    alertSet: this.setSetAlert
                },
                React.createElement(
                    'div',
                    {className: 'endpoint-alternative'},
                    [
                        React.createElement(
                            'p',
                            {key: 'header'},
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: '1'},
                                    'Posted '
                                ),
                                React.createElement(
                                    TextDateTime,
                                    {key: '2', time: this.state.createdAt}
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '3'},
                                    '.'
                                )
                            ].concat((this.state.updatedAt.getTime() !== this.state.createdAt.getTime()) ? [
                                React.createElement(
                                    React.Fragment,
                                    {key: '4'},
                                    ' Last updated '
                                ),
                                React.createElement(
                                    TextDateTime,
                                    {key: '5', time: this.state.updatedAt}
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '6'},
                                    '.'
                                )
                            ] : [])
                        ),
                        React.createElement(
                            'div',
                            {key: 'desc', className: 'alternative-description-wrapper'},
                            React.createElement(
                                ReactMarkdown,
                                {key: 'markdown', source: this.state.description}
                            )
                        )
                    ]
                )
            )
        }

        componentDidMount() {
            this.load(false);
        }

        componentDidUpdate() {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }

        setSetAlert(alrt) {
            this.setAlert = alrt;
        }

        load(force) {
            let params = {};
            if (force) {
                params.headers = {'Content-Cache': 'no-cache', 'Pragma': 'no-cache'};
            }

            let handled = false;
            api_fetch(
                `/api/endpoints/migrate/${this.props.fromEndpointSlug}/${this.props.toEndpointSlug}`,
                AuthHelper.auth(params)
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('get alternative', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.description = json.explanation_markdown;
                    newState.createdAt = new Date(json.created_at * 1000);
                    newState.updatedAt = new Date(json.updated_at * 1000);
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            })
        }
    }

    EndpointAlternativeViewWithAjax.propTypes = {
        fromEndpointSlug: PropTypes.string.isRequired,
        toEndpointSlug: PropTypes.string.isRequired
    }

    /**
     * Displays an endpoint with the given attributes, where the alternatives
     * and parameters are swapped in with the specified components when
     * expanded.
     *
     * @param {string} slug The slug of this endpoint
     * @param {string} path The main path to reach this endpoint, e.g., /api/users
     * @param {string} verb The HTTP verb for this endpoint, e.g., GET
     * @param {string} descriptionMarkdown The markdown description for this
     *   endpoint
     * @param {boolean} descriptionShown If the description starts off in the
     *   expanded state. There will be a button to toggle the description. If
     *   null or undefined this is treated as true.
     * @param {array} params An array of objects with the following keys:
     *   - `location (str)`: The location where this parameter is, acts as an
     *     enum and is one of `query`, `header`, `body`
     *   - `path (array)`: An array of strings which is the path to the variable
     *     within the location. For `query` and `header` this is always `''`,
     *     for body this will be the path to the object containing the variable,
     *     e.g., for the body `{"foo": {"bar": {"baz": 3}}}`, the `path` of `baz`
     *     is `['foo', 'bar']`
     *   - `name (str)`: The name of the parameter.
     *   - `varType (str)`: The type of the variable in an arbitrary format
     *   - `addedDate (Date)`: The date when this parameter was added to this
     *     endpoint. Time part is ignored.
     *   - `getDescription (func)`: A function which returns a promise for the
     *     description of this parameter. Passed a function which sets the alert
     *     for the description. Should return falsey on error and truthy on
     *     success.
     * @param {array} alternatives An array of objects with the following keys:
     *   - `toEndpointSlug (str)`: The slug of the endpoint that can be used
     *     instead of this endpoint.
     *   - `component (React.Component)`: The component to render when this
     *     alternative is expanded. Will typically be an
     *     `EndpointAlternativeViewWithAjax`
     * @param {string} deprecationReasonMarkdown Null if this endpoint is not
     *   deprecated. Otherwise this is a markdown description for why this
     *   endpoint is deprecated.
     * @param {boolean} deprecationReasonShown If the deprecation reason starts
     *   off expanded if this endpoint is deprecated. If null or undefined it is
     *   treated as true.
     * @param {Date} deprecatedOn Null if this endpoint is not deprecated.
     *   Otherwise this is the date (the time part is ignored) when this
     *   endpoint was first deprecated.
     * @param {Date} sunsetsOn Null if this endpoint is not deprecated.
     *   Otherwise this is the date (the time part is ignored) when this
     *   endpoint will stop working (or had stopped working if in the past).
     *   For our purposes if we haven't set a sunset date the endpoint is not
     *   deprecated. This is usually 6-36 months after the deprecation date.
     * @param {Date} createdAt When this endpoint record was created
     * @param {Date} updatedAt When this endpoint record was last updated
     */
    class EndpointView extends React.Component {
        constructor(props) {
            super(props);

            this.ogDescriptionShown = (
                this.props.descriptionShown !== null && this.props.descriptionShown !== undefined
                ? !!props.descriptionShown : true
            );

            this.ogDeprecationReasonShown = (
                this.props.deprecationReasonShown !== null && this.props.deprecationReasonShown !== undefined
                ? !!props.deprecationReasonShown : true
            );

            this.pathParams = this.props.params.filter((p) => p.location === 'path');
            this.queryParams = this.props.params.filter((p) => p.location === 'query');
            this.headerParams = this.props.params.filter((p) => p.location === 'header');
            this.bodyParams = this.props.params.filter((p) => p.location === 'body');

            this.pathParamSetAlerts = {};

            this.pathParamSetSetAlerts = Object.fromEntries(
                this.pathParams.map((p) => {
                    return [
                        p.name,
                        ((str) => {
                            this.pathParamSetAlerts[p.name] = str;
                        }).bind(this)
                    ];
                })
            );

            this.pathParamGetDescs = Object.fromEntries(
                this.pathParams.map((p) => {
                    return [
                        p.name,
                        (() => {
                            p.getDescription(this.pathParamSetAlerts[p.name]).then((desc) => {
                                if (!desc) { return; }

                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.expandedPathParamNames = Object.assign({}, newState.expandedPathParamNames);
                                    newState.expandedPathParamNames[p.name] = desc;
                                    return newState;
                                });
                            });
                        }).bind(this)
                    ];
                })
            );

            this.queryParamSetAlerts = {};

            this.queryParamsSetSetAlerts = Object.fromEntries(
                this.queryParams.map((p) => {
                    return [
                        p.name,
                        ((str) => {
                            this.queryParamSetAlerts[p.name] = str;
                        }).bind(this)
                    ];
                })
            );

            this.queryParamGetDescs = Object.fromEntries(
                this.queryParams.map((p) => {
                    return [
                        p.name,
                        (() => {
                            p.getDescription(this.queryParamSetAlerts[p.name]).then((desc) => {
                                if (!desc) { return; }

                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.expandedQueryParamNames = Object.assign({}, newState.expandedQueryParamNames);
                                    newState.expandedQueryParamNames[p.name] = desc;
                                    return newState;
                                });
                            });
                        }).bind(this)
                    ];
                })
            );

            this.headerParamsSetAlerts = {};

            this.headerParamsSetSetAlerts = Object.fromEntries(
                this.headerParams.map((p) => {
                    return [
                        p.name,
                        ((str) => {
                            this.headerParamsSetAlerts[p.name] = str;
                        })
                    ];
                })
            );

            this.headerParamGetDescs = Object.fromEntries(
                this.headerParams.map((p) => {
                    return [
                        p.name,
                        (() => {
                            p.getDescription(this.headerParamsSetAlerts[p.name]).then((desc) => {
                                if (!desc) { return; }

                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.expandedHeaderParamNames = Object.assign({}, newState.expandedHeaderParamNames);
                                    newState.expandedHeaderParamNames[p.name] = desc
                                    return newState;
                                });
                            });
                        }).bind(this)
                    ]
                })
            );

            // unflatten the parameters. we're going to precompute all the necessary
            // callbacks (way faster for complicated endpoints, not really much harder).
            /*
             * All the funcs respect the copy-on-write semantics of component state. they
             * perform the minimum number of possible copies for this tree structure.
             *
             * Example body parameter
             * {"bar": {"baz": {"buz": 3}}}
             * Assume only bar.baz.buz has a description (minimum allowed docs)
             *
             * bodyParameter becomes
             * {
             *   name: '',
             *   onChildrenExpandedChanged: (func toggles corresponding childrenExpanded in stateOfBody),
             *   children: {
             *     bar: {
             *       name: "bar",
             *       onChildrenExpandedChanged: (func),
             *       children: {
             *         buz: {
             *           name: "buz",
             *           onGetDescription: (func sets corresponding description in stateOfBody),
             *           setDescriptionAlert: (func shows an alert),
             *           setSetDescriptionAlert: (func sets setDescriptionAlert)
             *           varType: 'int', addedDate: Date, getDescription: func
             *         }
             *       }
             *     }
             *   }
             * }
             *
             * stateOfBody becomes
             * {
             *   canExpandDescription: false,
             *   description: null,
             *   childrenExpanded: false,
             *   children: {
             *     bar: {
             *       canExpandDescription: false,
             *       description: null,
             *       childrenExpanded: false,
             *       children: {
             *         buz: {
             *           canExpandDescription: true,
             *           description: null,
             *         }
             *       }
             *     }
             *   }
             * }
             */
            this.bodyParameter = null;
            let stateOfBody = null;
            if (this.bodyParams.length > 0) {
                this.bodyParameter = {name: '[Root]', varType: 'object'};
                stateOfBody = {};

                this.bodyParams.forEach((p) => { // capturing is important
                    let parent = this.bodyParameter;
                    let parentState = stateOfBody;
                    p.path.forEach((pathPart, pathIndex) => { // capturing is important
                        if (!parent.children) {
                            parent.children = {};
                            parent.onChildrenExpandedChanged = ((newExpanded) => {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.stateOfBody = Object.assign({}, newState.stateOfBody);

                                    let innerParentState = newState.stateOfBody;
                                    for (let innerPathIndex = 0; innerPathIndex < pathIndex; innerPathIndex++) {
                                        innerParentState.children[p.path[innerPathIndex]] = Object.assign(
                                            {}, innerParentState.children[p.path[innerPathIndex]]
                                        );
                                        innerParentState = innerParentState.children[p.path[innerPathIndex]];
                                    }
                                    innerParentState.childrenExpanded = newExpanded;

                                    return newState;
                                });
                            }).bind(this);
                        }

                        parent.children[pathPart] = parent.children[pathPart] || {varType: 'object', name: pathPart};
                        parent = parent.children[pathPart];

                        parentState.children = parentState.children || {};
                        parentState.childrenExpanded = false;
                        parentState.children[pathPart] = parentState.children[pathPart] || {canExpandDescription: false};

                        parentState = parentState.children[pathPart];
                        parentState.description = null;
                    });

                    let child = parent;
                    let childState = parentState;
                    if (p.name) {
                        child.varType = child.varType || 'str';
                        child.name = child.name || p.name;

                        if (!child.children) {
                            child.children = {};
                            child.onChildrenExpandedChanged = ((newExpanded) => {
                                this.setState((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.stateOfBody = Object.assign({}, newState.stateOfBody);

                                    let innerParentState = newState.stateOfBody;
                                    for (let innerPathPart of p.path) {
                                        innerParentState.children[innerPathPart] = Object.assign(
                                            {}, innerParentState.children[innerPathPart]
                                        );
                                        innerParentState = innerParentState.children[innerPathPart];
                                    }

                                    innerParentState.childrenExpanded = newExpanded;
                                    return newState;
                                });
                            }).bind(this);
                        }

                        child.children[p.name] = child.children[p.name] || {};
                        child = child.children[p.name];

                        childState.children = childState.children || {};
                        childState.childrenExpanded = false;
                        childState.children[p.name] = childState.children[p.name] || {canExpandDescription: false};
                        childState = childState.children[p.name];
                    }

                    child.original = p;
                    child.name = p.name;
                    child.varType = p.varType;
                    child.addedDate = p.addedDate;
                    child.setDescriptionAlert = null;
                    child.setSetDescriptionAlert = ((capturedChild) => ((str) => {
                        capturedChild.setDescriptionAlert = str;
                    }).bind(this))(child);
                    child.getDescription = p.getDescription;
                    child.onGetDescription = ((capturedChild) => (() => {
                        capturedChild.getDescription(capturedChild.setDescriptionAlert).then((desc) => {
                            if (!desc) { return; }

                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.stateOfBody = Object.assign({}, newState.stateOfBody);

                                let innerParentState = newState.stateOfBody;
                                for (let innerPathPart of p.path) {
                                    innerParentState.children[innerPathPart] = Object.assign({}, innerParentState.children[innerPathPart]);
                                    innerParentState = innerParentState.children[innerPathPart];
                                }

                                let innerChildState = innerParentState;
                                if (p.name) {
                                    innerChildState.children[p.name] = Object.assign({}, innerChildState.children[p.name]);
                                    innerChildState = innerChildState.children[p.name];
                                }
                                innerChildState.description = desc;
                                return newState;
                            });
                        });
                    }).bind(this))(child);

                    childState.canExpandDescription = true;
                });
            };

            this.alternativeToggles = Object.fromEntries(
                this.props.alternatives.map((alt) => {
                    return [
                        alt.toEndpointSlug,
                        (() => {
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.expandedAlternatives = new Set(newState.expandedAlternatives);
                                if (newState.expandedAlternatives.has(alt.toEndpointSlug)) {
                                    newState.expandedAlternatives.delete(alt.toEndpointSlug);
                                } else {
                                    newState.expandedAlternatives.add(alt.toEndpointSlug);
                                    newState.initializedAlternatives.add(alt.toEndpointSlug);
                                }
                                return newState;
                            })
                        }).bind(this)
                    ];
                })
            );

            this.state = {
                expandedAlternatives: new Set(),
                initializedAlternatives: new Set(),
                expandedPathParamNames: {},
                expandedQueryParamNames: {},
                expandedHeaderParamNames: {},
                stateOfBody: stateOfBody,
                descriptionShown: this.ogDescriptionShown,
                deprecationReasonShown: this.ogDeprecationReasonShown
            };

            this.renderedDescription = false;

            this.toggleDescription = this.toggleDescription.bind(this);
            this.toggleDeprecationReason = this.toggleDeprecationReason.bind(this);
        }

        render() {
            let now = new Date();
            return React.createElement(
                'div',
                {className: 'endpoint'},
                [
                    React.createElement(
                        'h2',
                        {key: 'slug'},
                        this.props.slug
                    ),
                    React.createElement(
                        'p',
                        {key: 'verb-and-path', className: 'endpoint-verb-and-path'},
                        React.createElement(
                            'span',
                            {className: 'endpoint-verb', key: 'verb'},
                            this.props.verb
                        ),
                        React.createElement(
                            React.Fragment,
                            {key: 'space'},
                            ' '
                        ),
                        React.createElement(
                            'span',
                            {className: 'endpoint-path', key: 'path'},
                            this.props.path
                        )
                    ),
                    React.createElement(
                        'div',
                        {key: 'timestamps', className: 'endpoint-timestamps'},
                        React.createElement(
                            'p',
                            null,
                            `Posted on ${this.props.createdAt.toLocaleDateString()} at ${this.props.createdAt.toLocaleTimeString()}.` + (
                                this.props.updatedAt.getTime() !== this.props.createdAt.getTime() ? (
                                    ` Last edited on ${this.props.updatedAt.toLocaleDateString()} at ${this.props.updatedAt.toLocaleTimeString()}.`
                                ) : ''
                            )
                        )
                    )
                ].concat(this.props.deprecatedOn && (now >= this.props.deprecatedOn && now < this.props.sunsetsOn) ? [
                    React.createElement(
                        Alert,
                        {
                            key: 'deprecated-alert',
                            title: 'Deprecated',
                            type: 'warning'
                        },
                        React.createElement(
                            'p',
                            null,
                            (
                                'This endpoint is deprecated, meaning that it ' +
                                'no longer recommended that new projects use this ' +
                                'endpoint and it is recommended old projects migrate ' +
                                'away from this endpoint. For help finding alternatives ' +
                                'and how to migrate see below.'
                            )
                        )
                    )
                ] : []).concat(this.props.deprecatedOn && now >= this.props.sunsetsOn ? [
                    React.createElement[(
                        Alert,
                        {
                            key: 'sunsetted-alert',
                            title: 'Sunsetted',
                            type: 'danger'
                        },
                        React.createElement(
                            'p',
                            null,
                            (
                                'This endpoint has already been sunsetted, meaning it ' +
                                'no longer works. For help finding alternatives ' +
                                'and how to migrate see below.'
                            )
                        )
                    )]
                ] : []).concat([
                    React.createElement(
                        Button,
                        {
                            key: 'toggle-description-button',
                            text: this.state.descriptionShown ? 'Hide Endpoint Description' : 'Show Endpoint Description',
                            type: 'button',
                            onClick: this.toggleDescription
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'description',
                            initialState: this.ogDescriptionShown ? 'expanded' : 'closed',
                            desiredState: this.state.descriptionShown ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            'div',
                            {className: 'description-wrapper'},
                            React.createElement(
                                ReactMarkdown,
                                {source: this.props.descriptionMarkdown}
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        {className: 'params', key: 'params'},
                        [
                            React.createElement(
                                'h3',
                                {key: 'header'},
                                'Parameters'
                            )
                        ].concat(this.pathParams.length > 0 ? [
                            React.createElement(
                                'div',
                                {className: 'path-params', key: 'path-params'},
                                [
                                    React.createElement(
                                        'h4',
                                        {key: 'header'},
                                        'Path Parameters'
                                    ),
                                    React.createElement(
                                        'ul',
                                        {key: 'ul', className: 'param-list'},
                                        this.pathParams.map((param) => {
                                            return this.renderStandardParam(
                                                param,
                                                this.state.expandedPathParamNames[param.name],
                                                this.pathParamGetDescs[param.name]
                                            );
                                        })
                                    )
                                ]
                            )
                        ] : []).concat(this.queryParams.length > 0 ? [
                            React.createElement(
                                'div',
                                {className: 'query-params', key: 'query-params'},
                                [
                                    React.createElement(
                                        'h4',
                                        {key: 'header'},
                                        'Query Parameters'
                                    ),
                                    React.createElement(
                                        'ul',
                                        {key: 'ul', className: 'param-list'},
                                        this.queryParams.map((param) => {
                                            return this.renderStandardParam(
                                                param,
                                                this.state.expandedQueryParamNames[param.name],
                                                this.queryParamGetDescs[param.name]
                                            );
                                        })
                                    )
                                ]
                            )
                        ] : []).concat(this.headerParams.length > 0 ? [
                            React.createElement(
                                'div',
                                {className: 'header-params', key: 'header-params'},
                                [
                                    React.createElement(
                                        'h4',
                                        {key: 'header'},
                                        'Header Parameters'
                                    ),
                                    React.createElement(
                                        'ul',
                                        {key: 'ul', className: 'param-list'},
                                        this.headerParams.map((param) => {
                                            return this.renderStandardParam(
                                                param,
                                                this.state.expandedHeaderParamNames[param.name],
                                                this.headerParamGetDescs[param.name]
                                            );
                                        })
                                    )
                                ]
                            )
                        ] : []).concat(this.bodyParams.length > 0 ? [
                            React.createElement(
                                'div',
                                {className: 'body-params', key: 'body-params'},
                                [
                                    React.createElement(
                                        'h4',
                                        {key: 'body'},
                                        'Body Parameters'
                                    ),
                                    this.renderBodyParam(this.bodyParameter, this.state.stateOfBody)
                                ]
                            )
                        ] : [])
                    )
                ]).concat(this.props.alternatives ? [
                    React.createElement(
                        'div',
                        {className: 'alternatives', key: 'alternatives'},
                        [
                            React.createElement(
                                'h3',
                                {key: 'header'},
                                'Alternatives'
                            ),
                            React.createElement(
                                'ul',
                                {key: 'alternatives'},
                                this.props.alternatives.map((alt) => {
                                    let expanded = this.state.expandedAlternatives.has(alt.toEndpointSlug);
                                    let initialized = this.state.initializedAlternatives.has(alt.toEndpointSlug);
                                    return React.createElement(
                                        'li',
                                        {
                                            key: alt.toEndpointSlug,
                                            className: `alternative alternative-${expanded ? 'expanded' : 'closed'}`
                                        },
                                        [
                                            React.createElement(
                                                Button,
                                                {
                                                    key: 'toggle-alternative',
                                                    text: expanded ? `Hide ${alt.toEndpointSlug}` : `Show ${alt.toEndpointSlug}`,
                                                    type: 'button',
                                                    onClick: this.alternativeToggles[alt.toEndpointSlug]
                                                }
                                            )
                                        ].concat(initialized ? [
                                            React.createElement(
                                                SmartHeightEased,
                                                {
                                                    key: 'alternative',
                                                    initialState: 'closed',
                                                    desiredState: expanded ? 'expanded' : 'closed'
                                                },
                                                React.createElement(
                                                    EndpointAlternativeViewWithAjax,
                                                    {
                                                        fromEndpointSlug: this.props.slug,
                                                        toEndpointSlug: alt.toEndpointSlug
                                                    }
                                                )
                                            )
                                        ] : [])
                                    );
                                })
                            )
                        ]
                    )
                ] : []).concat((this.props.deprecatedOn && this.props.deprecatedOn < now) ? [
                    React.createElement(
                        'div',
                        {className: 'deprecated', key: 'deprecated'},
                        [
                            React.createElement(
                                'h3',
                                {key: 'header'},
                                'Deprecation'
                            ),
                            React.createElement(
                                'p',
                                {key: 'deprecated-since'},
                                'This endpoint has been deprecated since ' +
                                this.props.deprecatedOn.toLocaleDateString() + ' and ' +
                                (this.props.sunsetsOn < now ? ' sunsetted ' : ' will sunset ') +
                                'on ' + this.props.sunsetsOn.toLocaleDateString() + '.'
                            ),
                            React.createElement(
                                Button,
                                {
                                    key: 'toggle-deprecation-reason-button',
                                    text: this.state.deprecationReasonShown ? 'Hide Deprecation Reason' : 'Show Deprecation Reason',
                                    type: 'button',
                                    onClick: this.toggleDeprecationReason
                                }
                            ),
                            React.createElement(
                                SmartHeightEased,
                                {
                                    key: 'deprecation-reason',
                                    initialState: this.ogDeprecationReasonShown ? 'expanded' : 'closed',
                                    desiredState: this.state.deprecationReasonShown ? 'expanded' : 'closed'
                                },
                                React.createElement(
                                    'div',
                                    {className: 'description-wrapper'},
                                    React.createElement(
                                        ReactMarkdown,
                                        {source: this.props.deprecationReasonMarkdown}
                                    )
                                )
                            )
                        ]
                    )
                ] : [])
            );
        }

        componentDidMount() {
            this.considerUpdateHighlighting();
        }

        componentDidUpdate() {
            this.considerUpdateHighlighting();
        }

        considerUpdateHighlighting() {
            if (this.renderedDescription) {
                return;
            }

            if (this.props.descriptionShown || this.props.deprecationReasonShown) {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
                this.renderedDescription = true;
            }
        }

        toggleDescription() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.descriptionShown = !newState.descriptionShown;
                return newState;
            });
        }

        toggleDeprecationReason() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.deprecationReasonShown = !newState.deprecationReasonShown;
                return newState;
            });
        }

        renderStandardParam(param, desc, getDesc) {
            return React.createElement(
                'li',
                {key: `param-${param.name}`},
                React.createElement(
                    EndpointParamView,
                    {
                        name: param.name,
                        varType: param.varType,
                        descriptionMarkdown: desc,
                        showGetDescription: getDesc !== null && getDesc !== undefined,
                        onGetDescription: getDesc
                    }
                )
            );
        }

        renderBodyParam(param, state) {
            return React.createElement(
                EndpointParamView,
                {
                    key: 'body-param',
                    name: param.name,
                    varType: param.varType,
                    descriptionMarkdown: state.description,
                    showGetDescription: state.canExpandDescription,
                    getDescriptionAlertSet: param.setSetDescriptionAlert,
                    onGetDescription: param.onGetDescription,
                    expandChildrenTristate: state.childrenExpanded,
                    onChildrenExpandedChanged: param.onChildrenExpandedChanged
                },
                param.children ? Object.entries(param.children).map((ele) => {
                    let childKey = ele[0];
                    let childParam = ele[1];
                    let childState = state.children[childKey];

                    return this.renderBodyParam(childParam, childState);
                }) : null
            );
        }
    }

    EndpointView.propTypes = {
        slug: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        verb: PropTypes.string.isRequired,
        descriptionMarkdown: PropTypes.string.isRequired,
        descriptionShown: PropTypes.bool,
        params: PropTypes.arrayOf(
            PropTypes.shape({
                location: PropTypes.string.isRequired,
                path: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
                name: PropTypes.string.isRequired,
                varType: PropTypes.string.isRequired,
                addedDate: PropTypes.instanceOf(Date).isRequired,
                getDescription: PropTypes.func.isRequired
            }).isRequired
        ).isRequired,
        alternatives: PropTypes.arrayOf(
            PropTypes.shape({
                toEndpointSlug: PropTypes.string.isRequired,
                component: PropTypes.instanceOf(React.Component).isRequired
            }).isRequired
        ).isRequired,
        deprecationReasonMarkdown: PropTypes.string,
        deprecationReasonShown: PropTypes.bool,
        deprecatedOn: PropTypes.instanceOf(Date),
        sunsetsOn: PropTypes.instanceOf(Date),
        createdAt: PropTypes.instanceOf(Date).isRequired,
        updatedAt: PropTypes.instanceOf(Date).isRequired
    };

    /**
     * Describes a form for editing an endpoint. For detailed documentation on
     * each part which can be edited, see EndpointView. This does not allow
     * the user to edit the parameters / alternatives, since they have their
     * own edit forms (see EndpointParamEditForm, EndpointAlternativeEditForm)
     *
     * @param {string} slug The slug of the endpoint which is being edited.
     * @param {boolean} slugEditable True if the user can write in a new slug,
     *   false if they cannot. Typically true when using this as a create form
     *   and false for using this as an edit form.
     * @param {string} path The current path for the endpoint
     * @param {string} verb The current verb for the endpoint
     * @param {string} descriptionMarkdown The current markdown description
     * @param {string} deprecationReasonMarkdown The current deprecation reason
     * @param {Date} deprecatedOn The current deprecated date
     * @param {Date} sunsetsOn The current sunset date
     * @param {string} cta The text on the final button. Defaults to "Submit Edit"
     * @param {func} alertSet A function which sets the submit button alert, as
     *   if by Alertable
     * @param {func} onSubmit A function called when the user submits an edit;
     *   passed (
     *     slug, newPath, newVerb, newDescriptionMarkdown,
     *     newDeprecationReasonMarkdown, newDeprecatedOn, newSunsetsOn
     *   )
     */
    class EndpointEditForm extends React.Component {
        constructor(props) {
            super(props);

            let initiallyDeprecated = !!this.props.deprecatedOn;
            this.state = {
                valid: false,
                changed: false,
                disabled: false,
                descriptionPreview: this.props.descriptionMarkdown,
                initiallyDeprecated: initiallyDeprecated,
                deprecationReasonPreview: this.props.deprecationReasonMarkdown,
                deprecated: initiallyDeprecated
            };

            this.descriptionPreviewTimeout = null;
            this.deprecationReasonPreviewTimeout = null;
            this.submitTimeout = null;
            this.previewNeedsCodeHighlight = true;

            this.setAlert = null;
            this.getSlug = null;
            this.getPath = null;
            this.getVerb = null;
            this.getDescriptionMarkdown = null;
            this.getDeprecatedOn = null;
            this.getSunsetsOn = null;
            this.getDeprecationReason = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.setGetSlug = this.setGetSlug.bind(this);
            this.setGetPath = this.setGetPath.bind(this);
            this.setGetVerb = this.setGetVerb.bind(this);
            this.setGetDescriptionMarkdown = this.setGetDescriptionMarkdown.bind(this);
            this.setGetDeprecatedOn = this.setGetDeprecatedOn.bind(this);
            this.setGetSunsetsOn = this.setGetSunsetsOn.bind(this);
            this.setGetDeprecationReason = this.setGetDeprecationReason.bind(this);

            this.onSlugChanged = this.onSlugChanged.bind(this);
            this.onPathChanged = this.onPathChanged.bind(this);
            this.onVerbChanged = this.onVerbChanged.bind(this);
            this.onDescriptionMarkdownChanged = this.onDescriptionMarkdownChanged.bind(this);
            this.onDeprecatedOnChanged = this.onDeprecatedOnChanged.bind(this);
            this.onSunsetsOnChanged = this.onSunsetsOnChanged.bind(this);
            this.onDeprecationReasonChanged = this.onDeprecationReasonChanged.bind(this);

            this.updateDescriptionPreview = this.updateDescriptionPreview.bind(this);
            this.updateDeprecationReasonPreview = this.updateDeprecationReasonPreview.bind(this);
            this.toggleDeprecated = this.toggleDeprecated.bind(this);
            this.checkValid = this.checkValid.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
            this.clearDisabled = this.clearDisabled.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {className: 'endpoint-edit-form'},
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'slug',
                            labelText: 'Slug',
                            description: 'The unique external identifier for this endpoint.'
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: 'text',
                                text: this.props.slug,
                                disabled: this.state.disabled || !this.props.slugEditable,
                                textChanged: this.onSlugChanged,
                                textQuery: this.setGetSlug
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'path',
                            labelText: 'Path',
                            description: 'The absolute path to the endpoint starting with a slash, e.g., /endpoints.html'
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: 'text',
                                text: this.props.path,
                                disabled: this.state.disabled,
                                textChanged: this.onPathChanged,
                                textQuery: this.setGetPath
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'verb',
                            labelText: 'Verb',
                            description: 'The HTTP verb used to access this endpoint. All uppercase, e.g., GET or POST.'
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: 'text',
                                text: this.props.verb,
                                disabled: this.state.disabled,
                                textChanged: this.onVerbChanged,
                                textQuery: this.setGetVerb
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'description-markdown',
                            labelText: 'Description',
                            description: (
                                'The description of the endpoint. Formatted using markdown; a preview is ' +
                                'just below the text area. On most browsers text areas are resizable, so ' +
                                'resize as needed.'
                            )
                        },
                        React.createElement(
                            TextArea,
                            {
                                text: this.props.descriptionMarkdown,
                                rows: 5,
                                disabled: this.state.disabled,
                                textChanged: this.onDescriptionMarkdownChanged,
                                textQuery: this.setGetDescriptionMarkdown
                            }
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            key: 'description-preview',
                            className: 'description-wrapper'
                        },
                        React.createElement(
                            ReactMarkdown,
                            {source: this.state.descriptionPreview}
                        )
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'toggle-deprecated',
                            type: 'button',
                            style: 'primary',
                            text: this.state.deprecated ? 'Undeprecate' : 'Deprecate',
                            disabled: this.state.disabled,
                            onClick: this.toggleDeprecated
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'deprecated-fields',
                            initialState: this.state.initiallyDeprecated ? 'expanded' : 'closed',
                            desiredState: this.state.deprecated ? 'expanded' : 'closed'
                        },
                        [
                            React.createElement(
                                FormElement,
                                {
                                    key: 'deprecated-on',
                                    labelText: 'Deprecated On',
                                    description: 'The date on which this endpoint is officially deprecated.'
                                },
                                React.createElement(
                                    DatePicker,
                                    {
                                        initialDate: this.props.deprecatedOn || getCurrentDate(),
                                        dateQuery: this.setGetDeprecatedOn,
                                        dateChanged: this.onDeprecatedOnChanged,
                                        disabled: this.state.disabled
                                    }
                                )
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'sunsets-on',
                                    labelText: 'Sunsets On',
                                    description: (
                                        'The date on which this endpoint will stop working. The endpoint ' +
                                        'must be modified to use the legacy helper and should be moved to ' +
                                        'the legacy folder, but besides that the sunsetting schedule (including ' +
                                        'alerting affected users) is automatic.'
                                    )
                                },
                                React.createElement(
                                    DatePicker,
                                    {
                                        initialDate: this.props.sunsetsOn || new Date(new Date().getFullYear() + 3, new Date().getMonth(), new Date().getDate()),
                                        dateQuery: this.setGetSunsetsOn,
                                        dateChanged: this.onSunsetsOnChanged,
                                        disabled: this.state.disabled
                                    }
                                )
                            ),
                            React.createElement(
                                FormElement,
                                {
                                    key: 'deprecation-reason',
                                    labelText: 'Deprecation Reason',
                                    description: (
                                        'The reason this endpoint is deprecated. Formatted using markdown, a preview ' +
                                        'is just below. Remember that most browsers support resizing text areas!'
                                    )
                                },
                                React.createElement(
                                    TextArea,
                                    {
                                        text: this.props.deprecationReasonMarkdown,
                                        rows: 5,
                                        disabled: this.state.disabled,
                                        textChanged: this.onDeprecationReasonChanged,
                                        textQuery: this.setGetDeprecationReason
                                    }
                                )
                            ),
                            React.createElement(
                                'div',
                                {
                                    key: 'deprecation-reason-preview',
                                    className: 'description-wrapper'
                                },
                                React.createElement(
                                    ReactMarkdown,
                                    {source: this.state.deprecationReasonPreview}
                                )
                            )
                        ]
                    ),
                    React.createElement(
                        Alertable,
                        {
                            key: 'submit',
                            alertSet: this.setSetAlert
                        },
                        React.createElement(
                            Button,
                            {
                                type: 'button',
                                type: 'primary',
                                disabled: this.state.disabled || !this.state.valid || !this.state.changed,
                                text: this.props.cta || 'Submit Edit',
                                onClick: this.onSubmit
                            }
                        )
                    )
                ]
            );
        }

        componentDidMount() {
            this.checkValid();
            this.updateHighlighting();
        }

        componentDidUpdate() {
            if (this.previewNeedsCodeHighlight) {
                this.previewNeedsCodeHighlight = false;
                this.updateHighlighting();
            }
        }

        componentWillUnmount() {
            if (this.descriptionPreviewTimeout) {
                clearTimeout(this.descriptionPreviewTimeout);
                this.descriptionPreviewTimeout = null;
            }

            if (this.deprecationReasonPreviewTimeout) {
                clearTimeout(this.deprecationReasonPreviewTimeout);
                this.deprecationReasonPreviewTimeout = null;
            }

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }
        }

        updateHighlighting() {
            this.previewNeedsCodeHighlight = false;
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }

        setSetAlert(str) {
            this.setAlert = str;
            if (this.props.alertSet) { this.props.alertSet(str); }
        }

        setGetSlug(gtr) {
            this.getSlug = gtr;
        }

        setGetPath(gtr) {
            this.getPath = gtr;
        }

        setGetVerb(gtr) {
            this.getVerb = gtr;
        }

        setGetDescriptionMarkdown(gtr) {
            this.getDescriptionMarkdown = gtr;
        }

        setGetDeprecatedOn(gtr) {
            this.getDeprecatedOn = gtr;
        }

        setGetSunsetsOn(gtr) {
            this.getSunsetsOn = gtr;
        }

        setGetDeprecationReason(gtr) {
            this.getDeprecationReason = gtr;
        }

        onSlugChanged(newSlug) {
            this.checkValid();
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.slug, newSlug);
        }

        onPathChanged(newPath) {
            this.checkValid();
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.path, newPath);
        }

        onVerbChanged(newVerb) {
            this.checkValid();
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.verb, newVerb);
        }

        onDescriptionMarkdownChanged(newDescriptionMarkdown) {
            this.checkValid();
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.descriptionMarkdown, newDescriptionMarkdown);
            if (this.descriptionPreviewTimeout) {
                clearTimeout(this.descriptionPreviewTimeout);
            }
            this.descriptionPreviewTimeout = setTimeout(this.updateDescriptionPreview, 1000);
        }

        onDeprecatedOnChanged(newDeprecatedOn) {
            this.checkValid();
            this.setChangedIfNotEqualsOtherwiseCheck(
                newDeprecatedOn === null ? null : newDeprecatedOn.getTime(),
                this.props.deprecatedOn === null ? null : this.props.deprecatedOn.getTime()
            );
        }

        onSunsetsOnChanged(newSunsetsOn) {
            this.checkValid();
            this.setChangedIfNotEqualsOtherwiseCheck(
                newSunsetsOn === null ? null : newSunsetsOn.getTime(),
                this.props.sunsetsOn === null ? null : this.props.sunsetsOn.getTime()
            );
        }

        onDeprecationReasonChanged(newDeprecReasonMarkdown) {
            this.checkValid();
            if (this.deprecationReasonPreviewTimeout) {
                clearTimeout(this.deprecationReasonPreviewTimeout);
            }
            this.deprecationReasonPreviewTimeout = setTimeout(this.updateDeprecationReasonPreview, 1000);
        }

        updateDescriptionPreview() {
            this.descriptionPreviewTimeout = null;
            let newPreview = this.getDescriptionMarkdown();

            this.previewNeedsCodeHighlight = true;
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.descriptionPreview = newPreview;
                return newState;
            });
        }

        updateDeprecationReasonPreview() {
            this.deprecationReasonPreviewTimeout = null;
            let newPreview = this.getDeprecationReason();

            this.previewNeedsCodeHighlight = true;
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.deprecationReasonPreview = newPreview;
                return newState;
            });
        }

        toggleDeprecated() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.deprecated = !newState.deprecated;

                setTimeout((() => {
                    this.setChangedIfNotEqualsOtherwiseCheck(false, false);
                    this.checkValid();
                }).bind(this), 0)

                return newState;
            });
        }

        checkValid() {
            let errors = [];

            let path = this.getPath();
            let verb = this.getVerb();
            let descMarkdown = this.getDescriptionMarkdown();
            let deprReasonMarkdown = this.getDeprecationReason();
            let deprecatedOn = this.getDeprecatedOn();
            let sunsetsOn = this.getSunsetsOn();

            if (!path.startsWith('/')) {
                errors.push('Path should start with a forward slash');
            }

            if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(verb)) {
                errors.push('Verb should be one of the 5 standard HTTP verbs');
            }

            if (descMarkdown.trim().length < 5) {
                errors.push('Description markdown should be at least 5 characters');
            }

            if (this.state.deprecated) {
                if (deprReasonMarkdown.trim().length < 5) {
                    errors.push('Deprecation reason should be at least 5 characters');
                }

                if (deprecatedOn === null) {
                    errors.push('Deprecation date should be set');
                }

                if (sunsetsOn === null) {
                    errors.push('Sunset date should be set');
                }

                if (deprecatedOn !== null && sunsetsOn !== null && sunsetsOn <= deprecatedOn) {
                    errors.push('Sunset date should be after deprecation date');
                }
            }

            this.setFormErrors(errors);
        }

        setFormErrors(errors) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.valid = errors.length === 0;
                return newState;
            });

            if (!this.setAlert) { return; }
            this.setAlert(AlertHelper.createFormErrors(errors));
        }

        setChangedIfNotEqualsOtherwiseCheck(a, b) {
            let changed = (
                a !== b ||
                this.getSlug() !== this.props.slug ||
                this.getPath() !== this.props.path ||
                this.getVerb() !== this.props.verb ||
                this.getDescriptionMarkdown() !== this.props.descriptionMarkdown ||
                this.state.deprecated !== !!this.props.deprecatedOn ||
                this.state.deprecated && (
                    this.getDeprecationReason() != this.props.deprecationReasonMarkdown ||
                    this.getDeprecatedOn() === null ||
                    this.getSunsetsOn() === null ||
                    this.getDeprecatedOn().getTime() !== this.props.deprecatedOn.getTime() ||
                    this.getSunsetsOn().getTime() !== this.props.sunsetsOn.getTime()
                )
            );

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.changed = changed;
                return newState;
            });
        }

        onSubmit() {
            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                return newState;
            });

            if (this.props.onSubmit) {
                if (this.state.deprecated) {
                    this.props.onSubmit(
                        this.getSlug(), this.getPath(), this.getVerb(),
                        this.getDescriptionMarkdown(), this.getDeprecationReason(),
                        this.getDeprecatedOn(), this.getSunsetsOn()
                    );
                } else {
                    this.props.onSubmit(
                        this.getSlug(), this.getPath(), this.getVerb(),
                        this.getDescriptionMarkdown(), null, null, null
                    );
                }
            }

            this.submitTimeout = setTimeout(this.clearDisabled, 5000);
        }

        clearDisabled() {
            this.submitTimeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = false;
                return newState;
            });
        }
    }

    /**
     * Shows a form for editing an endpoint which will also manage actually
     * performing the edit with ajax. Parameters are analagous to those defined
     * in EndpointView.
     *
     * @param {string} slug The slug of the endpoint which is being edited.
     * @param {string} path The current path for the endpoint
     * @param {string} verb The current verb for the endpoint
     * @param {string} descriptionMarkdown The current markdown description
     * @param {string} deprecationReasonMarkdown The current deprecation reason
     * @param {Date} deprecatedOn The current deprecated date
     * @param {Date} sunsetsOn The current sunset date
     * @param {func} onEdit A function we call with no arguments when the edit
     *   completes successfully.
     */
    class EndpointEditFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                EndpointEditForm,
                {
                    slug: this.props.slug,
                    slugEditable: false,
                    path: this.props.path,
                    verb: this.props.verb,
                    descriptionMarkdown: this.props.descriptionMarkdown,
                    deprecationReasonMarkdown: this.props.deprecationReasonMarkdown,
                    deprecatedOn: this.props.deprecatedOn,
                    sunsetsOn: this.props.sunsetsOn,
                    alertSet: this.setSetAlert,
                    onSubmit: this.onSubmit
                }
            );
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSubmit(slug, newPath, newVerb, newDescriptionMarkdown,
                 newDeprecationReasonMarkdown, newDeprecatedOn, newSunsetsOn) {
            let handled = false;

            api_fetch(
                `/api/endpoints/${slug}`,
                AuthHelper.auth({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        path: newPath,
                        verb: newVerb,
                        description_markdown: newDescriptionMarkdown,
                        deprecation_reason_markdown: newDeprecationReasonMarkdown,
                        deprecated_on: formatDateISO8601(newDeprecatedOn),
                        sunsets_on: formatDateISO8601(newSunsetsOn)
                    })
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('edit endpoint', resp).then(this.setAlert);
                    return;
                }

                handled = true;
                if (this.props.onEdit) { this.props.onEdit(); }
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            });
        }
    }

    /**
     * Shows a form for adding an endpoint which will also actually create the
     * endpoint with ajax.
     *
     * @param {func} onAdd A function we call with the slug of the endpoint that
     *   was just created when an endpoint is added.
     */
    class EndpointAddFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                EndpointEditForm,
                {
                    slugEditable: true,
                    cta: 'Add Endpoint',
                    alertSet: this.setSetAlert,
                    onSubmit: this.onSubmit
                }
            );
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSubmit(slug, path, verb, descMarkdown, deprReasonMarkdown, deprOn, sunsOn) {
            let handled = false;

            api_fetch(
                `/api/endpoints/${slug}`,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).then((resp) => {
                if (handled) { return; }

                if (resp.ok) {
                    handled = true;
                    this.setAlert(
                        React.createElement(
                            Alert,
                            {
                                title: 'Endpoint already exists',
                                text: (
                                    'An endpoint with this slug already exists. ' +
                                    'If you want to edit the endpoint, use the edit ' +
                                    'form.'
                                ),
                                type: 'warning'
                            }
                        )
                    );
                    return;
                }

                if (resp.status !== 404) {
                    handled = true;
                    AlertHelper.createFromResponse('verify unique slug', resp).then(this.setAlert);
                    return;
                }

                return api_fetch(
                    `/api/endpoints/${slug}`,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            path: path,
                            verb: verb,
                            description_markdown: descMarkdown,
                            deprecation_reason_markdown: deprReasonMarkdown,
                            deprecated_on: formatDateISO8601(deprOn),
                            sunsets_on: formatDateISO8601(sunsOn)
                        })
                    })
                );
            }).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('create endpoint', resp).then(this.setAlert);
                    return;
                }

                return api_fetch(
                    `/api/endpoints/${slug}`,
                    AuthHelper.auth({
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    })
                )
            }).then((resp) => {
                if (handled) { return; }

                handled = true;
                if (this.props.onAdd) { this.props.onAdd(slug); }
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            });
        }
    }

    /**
     * Describes a form for editing a particular parameter within an endpoint.
     *
     * @param {string} location The location for this parameter; one of "query",
     *   "header", and "body". Only editable if identityEditable is true.
     * @param {array} path The path to the parameter within the location. Only
     *   editable if identityEditable is true.
     * @param {string} name The name of the parameter at the path. Only editable
     *   if identityEditable is true.
     * @param {boolean} identityEditable True if the location path and name are
     *   editable, false if they are not editable.
     * @param {string} varType The current variable type for this parameter
     * @param {string} descriptionMarkdown The current description for this parameter
     * @param {func} alertSet A function we call with a function which sets the
     *   submit button alert.
     * @param {func} onSubmit A function we call when the user hits submit. Passed
     *   (newLocation, newPath, newName, newVarType, newDescriptionMarkdown)
     */
    class EndpointEditParamForm extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                descriptionPreview: this.props.descriptionMarkdown,
                pathShown: this.props.location === 'body',
                disabled: false,
                valid: false,
                changed: false
            };

            this.previewNeedsCodeHighlight = true;
            this.descriptionPreviewTimeout = null;
            this.submitTimeout = null;

            this.setAlert = null;
            this.getLocation = null;
            this.getPath = null;
            this.getName = null;
            this.getVarType = null;
            this.getDescriptionMarkdown = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.setGetLocation = this.setGetLocation.bind(this);
            this.setGetPath = this.setGetPath.bind(this);
            this.setGetName = this.setGetName.bind(this);
            this.setGetVarType = this.setGetVarType.bind(this);
            this.setGetDescriptionMarkdown = this.setGetDescriptionMarkdown.bind(this);

            this.onLocationChanged = this.onLocationChanged.bind(this);
            this.onPathChanged = this.onPathChanged.bind(this);
            this.onNameChanged = this.onNameChanged.bind(this);
            this.onVarTypeChanged = this.onVarTypeChanged.bind(this);
            this.onDescriptionMarkdownChanged = this.onDescriptionMarkdownChanged.bind(this);

            this.updateHighlighting = this.updateHighlighting.bind(this);
            this.updateDescriptionPreview = this.updateDescriptionPreview.bind(this);
            this.setChangedIfNotEqualsOtherwiseCheck = this.setChangedIfNotEqualsOtherwiseCheck.bind(this);
            this.checkValid = this.checkValid.bind(this);
            this.setFormErrors = this.setFormErrors.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
            this.clearDisabled = this.clearDisabled.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {className: 'endpoint-param-edit-form'},
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'location',
                            labelText: 'Location',
                            description: 'The part of the HTTP request containing this parameter'
                        },
                        React.createElement(
                            DropDown,
                            {
                                options: [
                                    {key: 'path', text: 'Path'},
                                    {key: 'query', text: 'Query'},
                                    {key: 'header', text: 'Header'},
                                    {key: 'body', text: 'Body'}
                                ],
                                initialOption: this.props.location,
                                optionQuery: this.setGetLocation,
                                optionChanged: this.onLocationChanged,
                                disabled: this.state.disabled || !this.props.identityEditable
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'path',
                            initialState: this.props.location === 'body' ? 'expanded' : 'closed',
                            desiredState: this.state.pathShown ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            FormElement,
                            {
                                labelText: 'Path',
                                description: 'The path to this parameter within the body, dot-separated'
                            },
                            React.createElement(
                                TextInput,
                                {
                                    type: 'text',
                                    text: this.props.path.join('.'),
                                    textQuery: this.setGetPath,
                                    textChanged: this.onPathChanged,
                                    disabled: this.state.disabled || !this.props.identityEditable
                                }
                            )
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'name',
                            labelText: 'Name',
                            description: 'The name for this parameter as specified in requests. Lowercase for header parameters.'
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: 'text',
                                text: this.props.name,
                                textQuery: this.setGetName,
                                textChanged: this.onNameChanged,
                                disabled: this.state.disabled || !this.props.identityEditable
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'var-type',
                            labelText: 'Variable Type',
                            description: 'The type for this variable, as if in Python. E.g. str, None'
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: 'text',
                                text: this.props.varType,
                                textQuery: this.setGetVarType,
                                textChanged: this.onVarTypeChanged,
                                disabled: this.state.disabled
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'description',
                            labelText: 'Description',
                            description:(
                                'The description for this variable. A preview is shown ' +
                                'below. Remember - most browsers let you resize text areas.'
                            )
                        },
                        React.createElement(
                            TextArea,
                            {
                                text: this.props.descriptionMarkdown,
                                rows: 5,
                                textQuery: this.setGetDescriptionMarkdown,
                                textChanged: this.onDescriptionMarkdownChanged,
                                disabled: this.state.disabled
                            }
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            key: 'description-preview',
                            className: 'param-description'
                        },
                        React.createElement(
                            ReactMarkdown,
                            {source: this.state.descriptionPreview}
                        )
                    ),
                    React.createElement(
                        Alertable,
                        {
                            key: 'submit',
                            alertSet: this.setSetAlert
                        },
                        React.createElement(
                            Button,
                            {
                                text: 'Submit Edit',
                                disabled: this.state.disabled || !this.state.changed || !this.state.valid,
                                onClick: this.onSubmit
                            }
                        )
                    )
                ]
            );
        }

        componentDidMount() {
            this.checkValid();
            this.updateHighlighting();
        }

        componentDidUpdate() {
            this.updateHighlighting();
        }

        componentWillUnmount() {
            if (this.descriptionPreviewTimeout) {
                clearTimeout(this.descriptionPreviewTimeout);
                this.descriptionPreviewTimeout = null;
            }

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }
        }

        updateHighlighting() {
            if (this.previewNeedsCodeHighlight) {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
                this.previewNeedsCodeHighlight = false;
            }
        }

        setSetAlert(str) {
            this.setAlert = str;
            if (this.props.alertSet) { this.props.alertSet(str); }
        }

        setGetLocation(gtr) {
            this.getLocation = gtr;
        }

        setGetPath(gtr) {
            this.getPath = gtr;
        }

        setGetName(gtr) {
            this.getName = gtr;
        }

        setGetVarType(gtr) {
            this.getVarType = gtr;
        }

        setGetDescriptionMarkdown(gtr) {
            this.getDescriptionMarkdown = gtr;
        }

        onLocationChanged(newLocation) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.location, newLocation);
            this.checkValid();

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.pathShown = newLocation === 'body';
                return newState;
            });
        }

        onPathChanged(newPath) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.path, newPath);
            this.checkValid();
        }

        onNameChanged(newName) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.name, newName);
            this.checkValid();
        }

        onVarTypeChanged(newVarType) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.newVarType, newVarType);
            this.checkValid();
        }

        onDescriptionMarkdownChanged(newDescriptionMarkdown) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.descriptionMarkdown, newDescriptionMarkdown);
            this.checkValid();

            if (this.descriptionPreviewTimeout !== null) {
                clearTimeout(this.descriptionPreviewTimeout);
            }

            this.descriptionPreviewTimeout = setTimeout(this.updateDescriptionPreview, 1000);
        }

        updateDescriptionPreview() {
            this.descriptionPreviewTimeout = null;

            this.previewNeedsCodeHighlight = true;
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.descriptionPreview = this.getDescriptionMarkdown();
                return newState;
            });
        }

        setChangedIfNotEqualsOtherwiseCheck(a, b) {
            let changed = (
                a !== b ||
                this.props.location !== this.getLocation() ||
                this.props.path.join('.') !== this.getPath() ||
                this.props.name !== this.getName() ||
                this.props.varType !== this.getVarType() ||
                this.props.descriptionMarkdown !== this.getDescriptionMarkdown()
            );

            if (changed !== this.state.changed) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.changed = changed;
                    return newState;
                });
            }
        }

        checkValid() {
            let errors = [];

            let location = this.getLocation();
            if (!['path', 'query', 'header', 'body'].includes(location)) {
                errors.push('Location should be one of path, query, header, body');
            }

            let pathStr = location !== 'body' ? '' : this.getPath();
            if (pathStr !== '') {
                let path = pathStr.split('.');
                path.forEach((ele, idx) => {
                    if (!/[a-z_]/.test(ele)) {
                        errors.push(`Path should only contain snake case parts; found '${ele}' at index ${idx}`);
                    }
                });
            }

            let name = this.getName();
            if (name.trim().length < 1) {
                errors.push('Name should not be blank');
            }

            let varType = this.getVarType();
            if (varType.trim().length < 1) {
                errors.push('Var type should not be blank');
            }

            let desc = this.getDescriptionMarkdown();
            if (desc.trim().length < 5) {
                errors.push('Description should be at least 5 characters');
            }

            this.setFormErrors(errors);
        }

        setFormErrors(errors) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.valid = errors.length === 0;
                return newState;
            });

            if (!this.setAlert) { return; }
            this.setAlert(AlertHelper.createFormErrors(errors));
        }

        onSubmit() {
            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = true;
                return newState;
            });

            if (this.props.onSubmit) {
                this.props.onSubmit(
                    this.getLocation(), this.getPath().split('.'), this.getName(),
                    this.getVarType(), this.getDescriptionMarkdown()
                );
            }

            this.submitTimeout = setTimeout(this.clearDisabled, 5000);
        }

        clearDisabled() {
            this.submitTimeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = false;
                return newState;
            });
        }
    }

    EndpointEditParamForm.propTypes = {
        location: PropTypes.string,
        path: PropTypes.arrayOf(PropTypes.string.isRequired),
        name: PropTypes.string,
        identityEditable: PropTypes.bool,
        varType: PropTypes.string,
        descriptionMarkdown: PropTypes.string,
        alertSet: PropTypes.func,
        onSubmit: PropTypes.func
    }

    /**
     * Renders an edit form for a parameter with the given state and handles
     * actually submitting the edit via ajax.
     *
     * @param {string} endpointSlug The slug for the endpoint this parameter
     *   is in.
     * @param {string} location The location of this parameter
     * @param {array} path The path for this parameter
     * @param {string} name The name for this parameter
     * @param {string} varType The current variable type for this parameter
     * @param {string} descriptionMarkdown The current description for this
     *   parameter
     * @param {func} onEdit Called when this parameter is successfully edited.
     *   Should cache bust.
     */
    class EndpointEditParamFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                EndpointEditParamForm,
                {
                    location: this.props.location,
                    path: this.props.path,
                    name: this.props.name,
                    identityEditable: false,
                    varType: this.props.varType,
                    descriptionMarkdown: this.props.descriptionMarkdown,
                    alertSet: this.setSetAlert,
                    onSubmit: this.onSubmit
                }
            )
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSubmit(newLocation, newPath, newName, newVarType, newDescriptionMarkdown) {
            let queryParams = {};
            if (newLocation === 'body' && newPath.length > 0) {
                queryParams.path = newPath.join('.')
            }
            queryParams.name = newName;

            let queryParamsFmtd = (
                Object.entries(queryParams)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map((arr) => `${arr[0]}=${encodeURIComponent(arr[1])}`)
                .join('&')
            );

            this.setAlert();
            let handled = false;
            api_fetch(
                `/api/endpoints/${this.props.endpointSlug}/params/${newLocation}?${queryParamsFmtd}`,
                AuthHelper.auth({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        var_type: newVarType,
                        description_markdown: newDescriptionMarkdown
                    })
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('edit param', resp).then(this.setAlert);
                    return;
                }

                handled = true;
                if (this.props.onEdit) { this.props.onEdit(); }
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            })
        }
    };

    EndpointEditParamFormWithAjax.propTypes = {
        endpointSlug: PropTypes.string.isRequired,
        location: PropTypes.string,
        path: PropTypes.arrayOf(PropTypes.string.isRequired),
        name: PropTypes.string,
        varType: PropTypes.string,
        descriptionMarkdown: PropTypes.string,
        onEdit: PropTypes.func
    };

    /**
     * Shows a form to add a parameter to the given endpoint and handles the
     * ajax call to make it happen.
     *
     * @param {string} endpointSlug The slug of the endpoint this parameter is
     *   being added to
     * @param {func} onAdd Called with newLoc, newPath, newName when the
     *   parameter is saved.
     */
    class EndpointAddParamFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                EndpointEditParamForm,
                {
                    location: 'query',
                    path: [],
                    name: '',
                    identityEditable: true,
                    varType: 'str',
                    descriptionMarkdown: '',
                    alertSet: this.setSetAlert,
                    onSubmit: this.onSubmit
                }
            );
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSubmit(newLocation, newPath, newName, newVarType, newDescriptionMarkdown) {
            let queryParams = {};
            if (newLocation === 'body' && newPath.length > 0) {
                queryParams.path = newPath.join('.');
            }
            queryParams.name = newName;

            let queryParamsFmtd = (
                Object.entries(queryParams)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map((arr) => `${arr[0]}=${encodeURIComponent(arr[1])}`)
                .join('&')
            );
            let url = `/api/endpoints/${this.props.endpointSlug}/params/${newLocation}?${queryParamsFmtd}`;

            let handled = false;
            api_fetch(
                url,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).then((resp) => {
                if (handled) { return; }

                if (resp.status === 404) {
                    return;
                }

                handled = true;
                if (!resp.ok) {
                    AlertHelper.createFromResponse('verify param identity is unique', resp).then(this.setAlert);
                } else {
                    this.setAlert(
                        React.createElement(
                            Alert,
                            {
                                title: 'Identity not unique',
                                text: (
                                    'A parameter with this location, path, and name ' +
                                    'already exists on this endpoint. Use the edit form ' +
                                    'to edit.'
                                ),
                                type: 'warning'
                            }
                        )
                    );
                }
            }).then(() => {
                if (handled) { return; }

                return api_fetch(
                    url,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            var_type: newVarType,
                            description_markdown: newDescriptionMarkdown
                        })
                    })
                );
            }).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('insert param', resp).then(this.setAlert);
                    return;
                }

                handled = true;
                if (this.props.onAdd) { this.props.onAdd(newLocation, newPath, newName); }
            }).catch(() => {
                if (handled) { return; }

                this.setAlert(AlertHelper.createFetchError());
            })
        }
    };

    EndpointAddParamFormWithAjax.propTypes = {
        endpointSlug: PropTypes.string.isRequired,
        onAdd: PropTypes.func
    };

    /**
     * Shows a form for editing a particular alternative endpoint. This is
     * presumably rendered within the context of the from endpoint slug.
     *
     * @param {string} toEndpointSlug The slug of the endpoint
     * @param {bool} identityEditable True if toEndpointSlug is editable, false
     *   otherwise.
     * @param {string} descriptionMarkdown The current description for how to
     *   switch from the current endpoint to the endpoint with the slug
     *   toEndpointSlug
     * @param {func} alertSet A function we call with a function which sets the
     *   alert on the submit button.
     * @param {func} onSubmit A function we call with
     *   `(newToEndpointSlug, newDescriptionMarkdown)` when the submit button is
     *   pressed
     */
    class EndpointEditAlternativeForm extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                disabled: false,
                valid: false,
                changed: false,
                descriptionPreview: this.props.descriptionMarkdown
            };

            this.submitTimeout = null;
            this.descriptionPreviewTimeout = null;
            this.previewNeedsCodeHighlight = true;

            this.setAlert = null;
            this.getToEndpointSlug = null;
            this.getDescriptionMarkdown = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.setGetToEndpointSlug = this.setGetToEndpointSlug.bind(this);
            this.setGetDescriptionMarkdown = this.setGetDescriptionMarkdown.bind(this);

            this.onToEndpointSlugChanged = this.onToEndpointSlugChanged.bind(this);
            this.onDescriptionMarkdownChanged = this.onDescriptionMarkdownChanged.bind(this);

            this.updateDescriptionPreview = this.updateDescriptionPreview.bind(this);
            this.updateHighlighting = this.updateHighlighting.bind(this);
            this.setChangedIfNotEqualsOtherwiseCheck = this.setChangedIfNotEqualsOtherwiseCheck.bind(this);
            this.checkValid = this.checkValid.bind(this);
            this.setFormErrors = this.setFormErrors.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
            this.clearDisabled = this.clearDisabled.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {className: 'endpoint-alternative-edit-form'},
                [
                    React.createElement(
                        EndpointSelectFormWithAjax,
                        {
                            key: 'to-endpoint-form',
                            slug: this.props.toEndpointSlug,
                            disabled: this.state.disabled || !this.props.identityEditable,
                            slugQuery: this.setGetToEndpointSlug,
                            slugChanged: this.onToEndpointSlugChanged
                        }
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'description',
                            labelText: 'Description',
                            description: (
                                'Explain how to migrate to this endpoint. Markdown formatted, ' +
                                'remember that most browsers support resizing text areas. A ' +
                                'preview is shown below.'
                            )
                        },
                        React.createElement(
                            TextArea,
                            {
                                text: this.props.descriptionMarkdown,
                                rows: 5,
                                disabled: this.state.disabled,
                                textQuery: this.setGetDescriptionMarkdown,
                                textChanged: this.onDescriptionMarkdownChanged
                            }
                        )
                    ),
                    React.createElement(
                        'div',
                        {
                            key: 'description-preview',
                            className: 'alternative-description-wrapper'
                        },
                        React.createElement(
                            ReactMarkdown,
                            {source: this.state.descriptionPreview}
                        )
                    ),
                    React.createElement(
                        Alertable,
                        {
                            key: 'submit',
                            alertSet: this.setSetAlert
                        },
                        React.createElement(
                            Button,
                            {
                                text: 'Submit Edit',
                                type: 'button',
                                style: 'primary',
                                disabled: (
                                    this.state.disabled ||
                                    !this.state.valid ||
                                    !this.state.changed
                                ),
                                onClick: this.onSubmit
                            }
                        )
                    )
                ]
            )
        }

        componentDidMount() {
            this.updateHighlighting();
        }

        componentDidUpdate() {
            this.updateHighlighting();
        }

        componentWillUnmount() {
            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
                this.submitTimeout = null;
            }

            if (this.descriptionPreviewTimeout) {
                clearTimeout(this.descriptionPreviewTimeout);
                this.descriptionPreviewTimeout = null;
            }
        }

        updateHighlighting() {
            if (this.previewNeedsCodeHighlight) {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
                this.previewNeedsCodeHighlight = false;
            }
        }

        setSetAlert(str) {
            this.setAlert = str;

            if (this.props.alertSet) { this.props.alertSet(str); }
        }

        setGetToEndpointSlug(gtr) {
            this.getToEndpointSlug = gtr;
        }

        setGetDescriptionMarkdown(gtr) {
            this.getDescriptionMarkdown = gtr;
        }

        onToEndpointSlugChanged(newSlug) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.slug, newSlug);
            this.checkValid();
        }

        onDescriptionMarkdownChanged(newDesc) {
            this.setChangedIfNotEqualsOtherwiseCheck(this.props.descriptionMarkdown, newDesc);
            this.checkValid();

            if (this.descriptionPreviewTimeout) {
                clearTimeout(this.descriptionPreviewTimeout);
            }

            this.descriptionPreviewTimeout = setTimeout(this.updateDescriptionPreview, 1000);
        }

        updateDescriptionPreview() {
            let newDescriptionMarkdown = this.getDescriptionMarkdown();
            this.previewNeedsCodeHighlight = true;
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.descriptionPreview = newDescriptionMarkdown;
                return newState;
            });
        }

        setChangedIfNotEqualsOtherwiseCheck(a, b) {
            let changed = (
                a !== b ||
                this.getToEndpointSlug() !== this.props.toEndpointSlug ||
                this.getDescriptionMarkdown() !== this.props.descriptionMarkdown
            );

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.changed = changed;
                return newState;
            });
        }

        checkValid() {
            let errors = [];

            let toEndpointSlug = this.getToEndpointSlug();
            if (!toEndpointSlug) {
                errors.push('You must select the migration target endpoint');
            }

            let descMarkdown = this.getDescriptionMarkdown();
            if (descMarkdown.trim().length < 5) {
                errors.push('The description must be at least 5 characters');
            }

            this.setFormErrors(errors);
        }

        setFormErrors(errors) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.valid = errors.length === 0;
                return newState;
            });

            if (!this.setAlert) { return; }
            this.setAlert(AlertHelper.createFormErrors(errors));
        }

        onSubmit() {
            this.setAlert();

            if (this.submitTimeout) {
                clearTimeout(this.submitTimeout);
            }
            this.submitTimeout = setTimeout(this.clearDisabled, 5000);

            if (this.props.onSubmit) {
                this.props.onSubmit(this.getToEndpointSlug(), this.getDescriptionMarkdown());
            }
        }

        clearDisabled() {
            this.submitTimeout = null;

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.disabled = false;
                return newState;
            });
        }
    }

    EndpointEditAlternativeForm.propTypes = {
        toEndpointSlug: PropTypes.string,
        identityEditable: PropTypes.bool,
        descriptionMarkdown: PropTypes.string,
        alertSet: PropTypes.func,
        onSubmit: PropTypes.func
    };

    /**
     * Shows an EndpointEditAlternativeForm and handles actually performing the
     * edit with ajax.
     *
     * @param {string} fromEndpointSlug The slug of the endpoint to switch from
     * @param {string} toEndpointSlug The slug of the endpoint to switch to
     * @param {string} descriptionMarkdown The current description
     * @param {func} onEdit A function called with no arguments when the
     *   alternative is succesfully edited.
     */
    class EndpointEditAlternativeFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                EndpointEditAlternativeForm,
                {
                    toEndpointSlug: this.props.toEndpointSlug,
                    identityEditable: false,
                    descriptionMarkdown: this.props.descriptionMarkdown,
                    alertSet: this.setSetAlert,
                    onSubmit: this.onSubmit
                }
            );
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSubmit(newToEndpointSlug, newDescriptionMarkdown) {
            let handled = false;

            api_fetch(
                `/api/endpoints/migrate/${this.props.fromEndpointSlug}/${newToEndpointSlug}`,
                AuthHelper.auth({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'PUT',
                    body: JSON.stringify({
                        explanation_markdown: newDescriptionMarkdown
                    })
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('edit endpoint', resp).then(this.setAlert);
                    return;
                }

                handled = true;
                if (this.props.onEdit) { this.props.onEdit(); }
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            });
        }
    }

    EndpointEditAlternativeFormWithAjax.propTypes = {
        fromEndpointSlug: PropTypes.string.isRequired,
        toEndpointSlug: PropTypes.string.isRequired,
        descriptionMarkdown: PropTypes.string.isRequired,
        onEdit: PropTypes.func
    };

    /**
     * Shows an EndpointEditAlternativeForm and handles actually performing the
     * insert with ajax. Presumably the from endpoint is clear from context.
     *
     * @param {string} fromEndpointSlug The slug of the endpoint to switch from.
     * @param {func} onAdd A function called with newToEndpointSlug when the
     *   alternative is successfully added.
     */
    class EndpointAddAlternativeFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.setAlert = null;

            this.setSetAlert = this.setSetAlert.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }

        render() {
            return React.createElement(
                EndpointEditAlternativeForm,
                {
                    toEndpointSlug: '',
                    descriptionMarkdown: '',
                    identityEditable: true,
                    alertSet: this.setSetAlert,
                    onSubmit: this.onSubmit
                }
            );
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        onSubmit(newToEndpointSlug, newDescriptionMarkdown) {
            if (newToEndpointSlug === this.props.fromEndpointSlug) {
                this.setAlert(
                    React.createElement(
                        Alert,
                        {
                            title: 'Cannot migrate to the same endpoint',
                            text: 'Select a different endpoint as the target.',
                            type: 'warning'
                        }
                    )
                );
                return;
            }

            let url = `/api/endpoints/migrate/${this.props.fromEndpointSlug}/${newToEndpointSlug}`;

            let handled = false;
            api_fetch(
                url,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).then((resp) => {
                if (handled) { return; }

                if (resp.status === 404) {
                    return;
                }

                handled = true;
                if (!resp.ok) {
                    AlertHelper.createFromResponse('verify alternative identity is unique', resp).then(this.setAlert);
                } else {
                    this.setAlert(
                        React.createElement(
                            Alert,
                            {
                                title: 'Identity not unique',
                                text: (
                                    'A alternative with this target endpoint slug ' +
                                    'already exists on this endpoint. Use the edit form ' +
                                    'to edit.'
                                ),
                                type: 'warning'
                            }
                        )
                    );
                }
            }).then(() => {
                if (handled) { return; }

                return api_fetch(
                    url,
                    AuthHelper.auth({
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            explanation_markdown: newDescriptionMarkdown
                        })
                    })
                );
            }).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('insert endpoint', resp).then(this.setAlert);
                    return;
                }

                handled = true;
                if (this.props.onAdd) { this.props.onAdd(newToEndpointSlug); }
            }).catch(() => {
                if (handled) { return; }

                this.setAlert(AlertHelper.createFetchError());
            });
        }
    };

    EndpointAddAlternativeFormWithAjax.propTypes = {
        fromEndpointSlug: PropTypes.string.isRequired,
        onAdd: PropTypes.func
    };

    /**
     * Shows a form for editing an endpoint or any of its parameters or
     * alternatives, or adding parameters or alternatives.
     *
     * @param {string} slug The slug for the endpoint
     * @param {string} path The current path for the endpoint
     * @param {string} verb The current verb for the endpoint
     * @param {string} descriptionMarkdown The current markdown description
     * @param {string} deprecationReasonMarkdown The current deprecation reason
     * @param {Date} deprecatedOn The current deprecated date
     * @param {Date} sunsetsOn The current sunset date
     * @param {array} params The current parameters for this endpoint, where
     *   each parameter is an object which has the following keys:
     *   - `location (str)`: The location (query/header/body) of the parameter
     *   - `path (array[str])`: The path to the parameter within the location
     *   - `name (str)`: The name of the parameter
     *   - `varType (str)`: The type of the parameter
     * @param {array} alternatives The current alternatives to this endpoint,
     *   where each parameter is an object with the following keys:
     *   - `toEndpointSlug (str)`: The slug for the alternative endpoint
     * @param {func} onEdit A function we call with no arguments when an edit
     *   completes successfully.
     */
    class EndpointCompleteEditFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                expandedParamIndices: new Set(),
                loadedParamDescriptions: new Array(this.props.params.length),
                addingParam: false,
                expandedAlternativeIndices: new Set(),
                loadedAlternativeDescriptions: new Array(this.props.alternatives.length),
                addingAlternative: false
            };

            this.paramSetAlerts = new Array(this.props.params.length);
            this.alternativeSetAlerts = new Array(this.props.alternatives.length);

            this.paramSetSetAlerts = this.props.params.map((_, idx) => {
                return ((str) => { this.paramSetAlerts[idx] = str; }).bind(this)
            });

            this.paramToggles = this.props.params.map((_, idx) => {
                return this.toggleParam.bind(this, idx);
            });

            this.paramOnEdits = this.props.params.map((_, idx) => {
                return this.onParamEdit.bind(this, idx);
            });

            this.paramOnDeletes = this.props.params.map((_, idx) => {
                return this.onParamDelete.bind(this, idx);
            });

            this.alternativeSetSetAlerts = this.props.alternatives.map((_, idx) => {
                return ((str) => { this.alternativeSetAlerts[idx] = str; });
            });

            this.alternativeToggles = this.props.params.map((_, idx) => {
                return this.toggleAlternative.bind(this, idx);
            });

            this.alternativeOnEdits = this.props.alternatives.map((_, idx) => {
                return this.onAlternativeEdit.bind(this, idx);
            });

            this.alternativeOnDeletes = this.props.alternatives.map((_, idx) => {
                return this.onAlternativeDelete.bind(this, idx);
            });

            this.toggleAddParam = this.toggleAddParam.bind(this);
            this.onAddParam = this.onAddParam.bind(this);
            this.toggleAddAlternative = this.toggleAddAlternative.bind(this);
            this.onAddAlternative = this.onAddAlternative.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        EndpointEditFormWithAjax,
                        {
                            key: 'endpoint-edit',
                            slug: this.props.slug,
                            path: this.props.path,
                            verb: this.props.verb,
                            descriptionMarkdown: this.props.descriptionMarkdown,
                            deprecationReasonMarkdown: this.props.deprecationReasonMarkdown,
                            deprecatedOn: this.props.deprecatedOn,
                            sunsetsOn: this.props.sunsetsOn,
                            onEdit: this.props.onEdit
                        }
                    ),
                    React.createElement(
                        React.Fragment,
                        {key: 'params-edit'},
                        this.props.params.map((param, idx) => {
                            let paramShortName = `${param.location}${param.path.length > 0 ? '.' : ''}${param.path.join('.')}.${param.name}`;
                            return React.createElement(
                                React.Fragment,
                                {
                                    key: `param-${param.location}-${param.path.join('.')}-${param.name}`
                                },
                                [
                                    React.createElement(
                                        Alertable,
                                        {
                                            key: 'btn',
                                            alertSet: this.paramSetSetAlerts[idx]
                                        },
                                        React.createElement(
                                            Button,
                                            {
                                                key: 'btn',
                                                text: (
                                                    this.state.expandedParamIndices.has(idx) ?
                                                    `Close Param ${paramShortName}` :
                                                    `Expand Param ${paramShortName}`
                                                ),
                                                style: 'primary',
                                                disabled: (
                                                    this.state.expandedParamIndices.has(idx) &&
                                                    !this.state.loadedParamDescriptions[idx]
                                                ),
                                                onClick: this.paramToggles[idx]
                                            }
                                        )
                                    )
                                ].concat(this.state.loadedParamDescriptions[idx] ? [
                                    React.createElement(
                                        SmartHeightEased,
                                        {
                                            key: 'frm',
                                            initialState: 'closed',
                                            desiredState: this.state.expandedParamIndices.has(idx) ? 'expanded' : 'closed'
                                        },
                                        [
                                            React.createElement(
                                                Button,
                                                {
                                                    key: 'delete-button',
                                                    text: 'Delete',
                                                    style: 'secondary',
                                                    type: 'button',
                                                    onClick: this.paramOnDeletes[idx]
                                                }
                                            ),
                                            React.createElement(
                                                EndpointEditParamFormWithAjax,
                                                {
                                                    key: 'edit-form',
                                                    endpointSlug: this.props.slug,
                                                    location: param.location,
                                                    path: param.path,
                                                    name: param.name,
                                                    varType: param.varType,
                                                    descriptionMarkdown: this.state.loadedParamDescriptions[idx],
                                                    onEdit: this.paramOnEdits[idx]
                                                }
                                            )
                                        ]
                                    )
                                ] : [])
                            );
                        })
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'params-add-btn',
                            type: 'button',
                            style: 'secondary',
                            text: this.state.addingParam ? 'Close Add Param Form' : 'Show Add Param Form',
                            onClick: this.toggleAddParam
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'params-add-form',
                            initialState: 'closed',
                            desiredState: this.state.addingParam ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            EndpointAddParamFormWithAjax,
                            {
                                endpointSlug: this.props.slug,
                                onAdd: this.onAddParam
                            }
                        )
                    ),
                    React.createElement(
                        React.Fragment,
                        {key: 'alternatives-edit'},
                        this.props.alternatives.map((alt, idx) => {
                            return React.createElement(
                                React.Fragment,
                                {
                                    key: `alt-${alt.toEndpointSlug}`
                                },
                                [
                                    React.createElement(
                                        Alertable,
                                        {
                                            key: 'btn',
                                            alertSet: this.alternativeSetSetAlerts[idx]
                                        },
                                        React.createElement(
                                            Button,
                                            {
                                                key: 'btn',
                                                text: (
                                                    this.state.expandedAlternativeIndices.has(idx) ?
                                                    `Close Alternative ${alt.toEndpointSlug}` :
                                                    `Expand Alternative ${alt.toEndpointSlug}`
                                                ),
                                                style: 'primary',
                                                disabled: (
                                                    this.state.expandedAlternativeIndices.has(idx) &&
                                                    !this.state.loadedAlternativeDescriptions[idx]
                                                ),
                                                onClick: this.alternativeToggles[idx]
                                            }
                                        )
                                    )
                                ].concat(this.state.loadedAlternativeDescriptions[idx] ? [
                                    React.createElement(
                                        SmartHeightEased,
                                        {
                                            key: 'frm',
                                            initialState: 'closed',
                                            desiredState: this.state.expandedAlternativeIndices.has(idx) ? 'expanded' : 'closed'
                                        },
                                        [
                                            React.createElement(
                                                Button,
                                                {
                                                    key: 'delete-button',
                                                    text: 'Delete',
                                                    style: 'secondary',
                                                    type: 'button',
                                                    onClick: this.alternativeOnDeletes[idx]
                                                }
                                            ),
                                            React.createElement(
                                                EndpointEditAlternativeFormWithAjax,
                                                {
                                                    key: 'edit-form',
                                                    fromEndpointSlug: this.props.slug,
                                                    toEndpointSlug: alt.toEndpointSlug,
                                                    descriptionMarkdown: this.state.loadedAlternativeDescriptions[idx],
                                                    onEdit: this.alternativeOnEdits[idx]
                                                }
                                            )
                                        ]
                                    )
                                ] : [])
                            );
                        })
                    ),
                    React.createElement(
                        Button,
                        {
                            key: 'alternative-add-btn',
                            type: 'button',
                            style: 'secondary',
                            text: this.state.addingAlternative ? 'Close Add Alternative Form' : 'Show Add Alternative Form',
                            onClick: this.toggleAddAlternative
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alternatives-add-form',
                            initialState: 'closed',
                            desiredState: this.state.addingAlternative ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            EndpointAddAlternativeFormWithAjax,
                            {
                                fromEndpointSlug: this.props.slug,
                                onAdd: this.onAddAlternative
                            }
                        )
                    )
                ]
            );
        }

        toggleParam(idx) {
            this.paramSetAlerts[idx]();

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.expandedParamIndices = new Set(newState.expandedParamIndices);
                if (newState.expandedParamIndices.has(idx)) {
                    newState.expandedParamIndices.delete(idx);
                } else {
                    newState.expandedParamIndices.add(idx);
                }
                return newState;
            });

            if (!this.state.loadedParamDescriptions[idx]) {
                let param = this.props.params[idx];
                let queryParamsFmtd = this.getFormattedQueryParametersForParam(param);
                let handled = false;
                api_fetch(
                    `/api/endpoints/${this.props.slug}/params/${param.location}?${queryParamsFmtd}`,
                    AuthHelper.auth()
                ).then((resp) => {
                    if (handled) { return; }

                    if (!resp.ok) {
                        handled = true;
                        AlertHelper.createFromResponse('fetch param', resp).then(this.paramSetAlerts[idx]);
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.expandedParamIndices = new Set(newState.expandedParamIndices);
                            newState.expandedParamIndices.delete(idx);
                            return newState;
                        });
                        return;
                    }

                    return resp.json();
                }).then((json) => {
                    if (handled) { return; }

                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loadedParamDescriptions = newState.loadedParamDescriptions.slice();
                        newState.loadedParamDescriptions[idx] = json.description_markdown;
                        return newState;
                    });
                }).catch(() => {
                    if (handled) { return; }

                    handled = true;
                    this.paramSetAlerts[idx](AlertHelper.createFetchError());
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.expandedParamIndices = new Set(newState.expandedParamIndices);
                        newState.expandedParamIndices.delete(idx);
                        return newState;
                    });
                });
            }
        }

        onParamEdit(idx) {
            let param = this.props.params[idx];
            let queryParamsFmtd = this.getFormattedQueryParametersForParam(param);
            api_fetch(
                `/api/endpoints/${this.props.slug}/params/${param.location}?${queryParamsFmtd}`,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).finally(() => {
                if (this.props.onEdit) { this.props.onEdit(); }
            });
        }

        onParamDelete(idx) {
            let param = this.props.params[idx];
            let queryParamsFmtd = this.getFormattedQueryParametersForParam(param);
            let url = `/api/endpoints/${this.props.slug}/params/${param.location}?${queryParamsFmtd}`;
            let handled = false;
            api_fetch(
                url,
                AuthHelper.auth({
                    method: 'DELETE'
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('delete param', resp).then(this.paramSetAlerts[idx]);
                    return;
                }

                return api_fetch(
                    url,
                    AuthHelper.auth({
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    })
                );
            }).then(() => {
                if (handled) { return; }

                handled = true;
                if (this.props.onEdit) { this.props.onEdit(); }
            }).catch(() => {
                if (handled) { return; }

                this.paramSetAlerts[idx](AlertHelper.createFetchError());
            });
        }

        toggleAlternative(idx) {
            this.alternativeSetAlerts[idx]();

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.expandedAlternativeIndices = new Set(newState.expandedAlternativeIndices);
                if (newState.expandedAlternativeIndices.has(idx)) {
                    newState.expandedAlternativeIndices.delete(idx);
                } else {
                    newState.expandedAlternativeIndices.add(idx);
                }
                return newState;
            });

            if (!this.state.loadedAlternativeDescriptions[idx]) {
                let alt = this.props.alternatives[idx];
                let handled = false;
                api_fetch(
                    `/api/endpoints/migrate/${this.props.slug}/${alt.toEndpointSlug}`,
                    AuthHelper.auth()
                ).then((resp) => {
                    if (handled) { return; }

                    if (!resp.ok) {
                        handled = true;
                        AlertHelper.createFromResponse('fetch alternative', resp).then(this.alternativeSetAlerts[idx]);
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.expandedAlternativeIndices = new Set(newState.expandedAlternativeIndices);
                            newState.expandedAlternativeIndices.delete(idx);
                            return newState;
                        });
                        return;
                    }

                    return resp.json();
                }).then((json) => {
                    if (handled) { return; }

                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.loadedAlternativeDescriptions = Object.assign({}, newState.loadedAlternativeDescriptions);
                        newState.loadedAlternativeDescriptions[idx] = json.explanation_markdown;
                        return newState;
                    });
                }).catch(() => {
                    if (handled) { return; }

                    handled = true;
                    this.alternativeSetAlerts[idx](AlertHelper.createFetchError());
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.expandedAlternativeIndices = new Set(newState.expandedAlternativeIndices);
                        newState.expandedAlternativeIndices.delete(idx);
                        return newState;
                    });
                });
            }
        }

        onAlternativeEdit(idx) {
            let alt = this.props.alternatives[idx];
            api_fetch(
                `/api/endpoints/migrate/${this.props.slug}/${alt.toEndpointSlug}`,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).finally(() => {
                if (this.props.onEdit) { this.props.onEdit(); }
            });
        }

        onAlternativeDelete(idx) {
            let alt = this.props.alternatives[idx];
            let url = `/api/endpoints/migrate/${this.props.slug}/${alt.toEndpointSlug}`;

            let handled = false;
            api_fetch(
                url,
                AuthHelper.auth({
                    method: 'DELETE'
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('delete alt', resp).then(this.alternativeSetAlerts[idx]);
                    return;
                }

                return api_fetch(
                    url,
                    AuthHelper.auth({
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                        }
                    })
                );
            }).then(() => {
                if (handled) { return; }

                handled = true;
                if (this.props.onEdit) { this.props.onEdit(); }
            }).catch(() => {
                if (handled) { return; }

                this.alternativeSetAlerts[idx](AlertHelper.createFetchError());
            });
        }

        toggleAddParam() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.addingParam = !newState.addingParam;
                return newState;
            });
        }

        onAddParam(newLocation, newPath, newName) {
            let queryParamsFmtd = this.getFormattedQueryParametersForParam({
                location: newLocation, path: newPath, name: newName
            });
            api_fetch(
                `/api/endpoints/${this.props.slug}/params/${newLocation}?${queryParamsFmtd}`,
                AuthHelper.auth({
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).finally(() => {
                if (this.props.onEdit) { this.props.onEdit(); }
            })
        }

        toggleAddAlternative() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.addingAlternative = !newState.addingAlternative;
                return newState;
            })
        }

        onAddAlternative(newToEndpointSlug) {
            api_fetch(
                `/api/endpoints/migrate/${this.props.slug}/${newToEndpointSlug}`,
                AuthHelper.auth({
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
            ).finally(() => {
                if (this.props.onEdit) { this.props.onEdit(); }
            });
        }

        getFormattedQueryParametersForParam(param) {
            let queryParams = {
                name: param.name
            };
            if (param.path.length > 0) {
                queryParams.path = param.path.join('.');
            }

            return (
                Object.entries(queryParams)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map((arr) => `${arr[0]}=${encodeURIComponent(arr[1])}`)
                .join('&')
            );
        }
    }

    EndpointCompleteEditFormWithAjax.propTypes = {
        slug: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        verb: PropTypes.string.isRequired,
        descriptionMarkdown: PropTypes.string.isRequired,
        deprecationReasonMarkdown: PropTypes.string,
        deprecatedOn: PropTypes.instanceOf(Date),
        sunsetsOn: PropTypes.instanceOf(Date),
        params: PropTypes.arrayOf(PropTypes.shape({
            location: PropTypes.string.isRequired,
            path: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
            name: PropTypes.string.isRequired,
            varType: PropTypes.string.isRequired
        }).isRequired).isRequired,
        alternatives: PropTypes.arrayOf(PropTypes.shape({
            toEndpointSlug: PropTypes.string.isRequired
        }).isRequired).isRequired,
        onEdit: PropTypes.func
    };

    /**
     * Renders an endpoint based on its slug. This will show the edit form if
     * the logged in user has permission to do so. Handles networking the get
     * requests.
     *
     * @param {string} slug The slug of the endpoint to show.
     */
    class EndpointViewWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                endpoint: {
                    path: '/loading',
                    verb: 'GET',
                    descriptionMarkdown: 'Endpoint loading...',
                    params: [],
                    alternatives: [],
                    deprecationReasonMarkdown: null,
                    deprecatedOn: null,
                    sunsetsOn: null,
                    createdAt: new Date(1970, 1, 1),
                    updatedAt: new Date(1970, 1, 1)
                },
                controlsShown: false,
                controlsDisabled: true,
                deletePartOneComplete: false,
                deletePartTwoComplete: false,
                editing: false,
                editingCounter: 0,
                endpointShown: true
            }

            this.clearAlertTimeout = null;

            this.setAlert = null;
            this.getPhaseTwoDeleteText = null;
            this.setPhaseTwoDeleteText = null;

            this.load = this.load.bind(this);
            this.setSetAlert = this.setSetAlert.bind(this);
            this.setGetPhaseTwoDeleteText = this.setGetPhaseTwoDeleteText.bind(this);
            this.setSetPhaseTwoDeleteText = this.setSetPhaseTwoDeleteText.bind(this);
            this.onRefresh = this.onRefresh.bind(this);
            this.toggleEdit = this.toggleEdit.bind(this);
            this.onEdit = this.onEdit.bind(this);
            this.togglePhaseOneDelete = this.togglePhaseOneDelete.bind(this);
            this.onPhaseTwoDeleteTextChanged = this.onPhaseTwoDeleteTextChanged.bind(this);
            this.onDelete = this.onDelete.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        Alertable,
                        {
                            key: 'controls-alert',
                            alertSet: this.setSetAlert
                        },
                        React.createElement(
                            SmartHeightEased,
                            {
                                key: 'controls',
                                initialState: 'closed',
                                desiredState: this.state.controlsShown ? 'expanded' : 'closed'
                            },
                            [
                                React.createElement(
                                    PermissionRequired,
                                    {
                                        key: 'refresh',
                                        permissions: ['update-endpoint']
                                    },
                                    React.createElement(
                                        Button,
                                        {
                                            style: 'secondary',
                                            type: 'button',
                                            text: 'Refresh',
                                            disabled: this.state.controlsDisabled,
                                            onClick: this.onRefresh
                                        }
                                    )
                                ),
                                React.createElement(
                                    PermissionRequired,
                                    {
                                        key: 'edit',
                                        permissions: ['update-endpoint']
                                    },
                                    React.createElement(
                                        Button,
                                        {
                                            style: 'secondary',
                                            type: 'button',
                                            text: this.state.editing ? 'Hide Edit Form' : 'Show Edit Form',
                                            disabled: this.state.controlsDisabled,
                                            onClick: this.toggleEdit
                                        }
                                    )
                                ),
                                React.createElement(
                                    PermissionRequired,
                                    {
                                        key: 'delete',
                                        permissions: ['delete-endpoint']
                                    },
                                    [
                                        React.createElement(
                                            Button,
                                            {
                                                key: 'phase-1',
                                                style: 'secondary',
                                                type: 'button',
                                                text: this.state.deletePartOneComplete ? 'Return to Safety' : 'Delete',
                                                disabled: this.state.controlsDisabled,
                                                onClick: this.togglePhaseOneDelete
                                            }
                                        ),
                                        React.createElement(
                                            SmartHeightEased,
                                            {
                                                key: 'phase-2',
                                                initialState: 'closed',
                                                desiredState: this.state.deletePartOneComplete ? 'expanded' : 'closed'
                                            },
                                            React.createElement(
                                                FormElement,
                                                {
                                                    key: 'confirm-slug',
                                                    labelText: 'Confirm Endpoint Slug',
                                                    description: 'You will have one more button to press.'
                                                },
                                                React.createElement(
                                                    TextInput,
                                                    {
                                                        type: 'text',
                                                        textQuery: this.setGetPhaseTwoDeleteText,
                                                        textSet: this.setSetPhaseTwoDeleteText,
                                                        textChanged: this.onPhaseTwoDeleteTextChanged,
                                                        disabled: this.state.controlsDisabled
                                                    }
                                                )
                                            )
                                        ),
                                        React.createElement(
                                            SmartHeightEased,
                                            {
                                                key: 'phase-3',
                                                initialState: 'closed',
                                                desiredState: this.state.deletePartTwoComplete ? 'expanded' : 'closed'
                                            },
                                            React.createElement(
                                                Button,
                                                {
                                                    type: 'button',
                                                    style: 'primary',
                                                    text: `Really Delete ${this.props.slug}`,
                                                    disabled: this.state.controlsDisabled,
                                                    onClick: this.onDelete
                                                }
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'edit-form',
                            initialState: 'closed',
                            desiredState: this.state.editing ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            EndpointCompleteEditFormWithAjax,
                            {
                                key: `edit-form-${this.props.slug}-${this.state.endpoint.path}-${this.state.editingCounter}`,
                                slug: this.props.slug,
                                path: this.state.endpoint.path,
                                verb: this.state.endpoint.verb,
                                descriptionMarkdown: this.state.endpoint.descriptionMarkdown,
                                deprecationReasonMarkdown: this.state.endpoint.deprecationReasonMarkdown,
                                deprecatedOn: this.state.endpoint.deprecatedOn,
                                sunsetsOn: this.state.endpoint.sunsetsOn,
                                params: this.state.endpoint.params,
                                alternatives: this.state.endpoint.alternatives,
                                onEdit: this.onEdit
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'endpoint',
                            initialState: 'expanded',
                            desiredState: this.state.endpointShown ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            EndpointView,
                            {
                                key: `endpoint-${this.props.slug}-${this.state.endpoint.path}-${this.state.editingCounter}`,
                                slug: this.props.slug,
                                path: this.state.endpoint.path,
                                verb: this.state.endpoint.verb,
                                descriptionMarkdown: this.state.endpoint.descriptionMarkdown,
                                params: this.state.endpoint.params,
                                alternatives: this.state.endpoint.alternatives,
                                deprecationReasonMarkdown: this.state.endpoint.deprecationReasonMarkdown,
                                deprecatedOn: this.state.endpoint.deprecatedOn,
                                sunsetsOn: this.state.endpoint.sunsetsOn,
                                createdAt: this.state.endpoint.createdAt,
                                updatedAt: this.state.endpoint.updatedAt
                            }
                        )
                    )
                ]
            )
        }

        componentDidMount() {
            this.load(false);
        }

        componentWillUnmount() {
            if (this.clearAlertTimeout) {
                clearTimeout(this.clearAlertTimeout);
                this.clearAlertTimeout = null;
            }
        }

        load(force) {
            if (this.setPhaseTwoDeleteText) {
                this.setPhaseTwoDeleteText('');
            }

            if (this.clearAlertTimeout) {
                clearTimeout(this.clearAlertTimeout);
                this.clearAlertTimeout = null;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.controlsDisabled = true;
                newState.deletePartOneComplete = false;
                newState.deletePartTwoComplete = false;
                return newState;
            });

            let params = {};
            if (force) {
                params.headers = {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                };
            }

            let handled = false;
            api_fetch(
                `/api/endpoints/${this.props.slug}`,
                AuthHelper.auth(params)
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('get endpoint', resp).then((alrt) => {
                        this.setState((state) => {
                            let newState = Object.assign({}, state);
                            newState.controlsDisabled = false;
                            newState.endpointShown = false;
                            return newState;
                        });

                        this.setAlert(alrt);
                    });
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                if (this.clearAlertTimeout) {
                    clearTimeout(this.clearAlertTimeout);
                    this.clearAlertTimeout = null;
                }
                this.clearAlertTimeout = setTimeout(this.setAlert, 5000);
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.controlsDisabled = false;
                    newState.controlsShown = true;
                    newState.endpointShown = true;
                    newState.editingCounter++;
                    newState.endpoint = {
                        path: json.path,
                        verb: json.verb,
                        descriptionMarkdown: json.description_markdown,
                        params: json.params.map((p) => {
                            return {
                                location: p.location,
                                path: p.path,
                                name: p.name,
                                varType: p.var_type,
                                addedDate: this.parseDateInLocalTime(p.added_date),
                                getDescription: this.createGetDescription(this.props.slug, p.location, p.path, p.name, false)
                            };
                        }),
                        alternatives: json.alternatives.map((altSlug) => {
                            return {
                                toEndpointSlug: altSlug,
                                component: React.createElement(
                                    'p',
                                    null,
                                    `alternative ${this.props.slug} -> ${altSlug}`
                                )
                            };
                        }),
                        deprecationReasonMarkdown: json.deprecation_reason_markdown,
                        deprecatedOn: this.parseDateInLocalTime(json.deprecated_on),
                        sunsetsOn: this.parseDateInLocalTime(json.sunsets_on),
                        createdAt: new Date(json.created_at * 1000),
                        updatedAt: new Date(json.updated_at * 1000)
                    };
                    return newState;
                })
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            })
        }

        /* new Date() does not respect that isoformat without timestamp should
         * be interpreted as local time. it instead interprets it as utc time,
         * which causes it to look like the previous date a lot of the time
         *
         * only supports YYYY-MM-DD
         */
        parseDateInLocalTime(isoDate) {
            if (isoDate === null || isoDate === undefined) {
                return null;
            }

            return new Date(...isoDate.split('-').map((s, idx) => parseInt(s) - (idx == 1 ? 1 : 0)));
        }

        createGetDescription(endpointSlug, loc, path, name, force) {
            return ((setAlert) => {
                let handled = false;
                let params = {};
                if (force) {
                    params.headers = {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    };
                }

                let queryParams = {};
                if (loc === 'body' && path.length > 0) {
                    queryParams.path = path.join('.');
                }
                queryParams.name = name;

                let queryParamsFmtd = (
                    Object.entries(queryParams)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map((arr) => `${arr[0]}=${encodeURIComponent(arr[1])}`)
                    .join('&')
                );

                return api_fetch(
                    `/api/endpoints/${endpointSlug}/params/${loc}?${queryParamsFmtd}`,
                    AuthHelper.auth(params)
                ).then((resp) => {
                    if (handled) { return; }

                    if (!resp.ok) {
                        handled = true;
                        AlertHelper.createFromResponse('get param', resp).then(setAlert);
                        return;
                    }

                    return resp.json();
                }).then((json) => {
                    if (handled) { return; }

                    handled = true;
                    return json.description_markdown;
                }).catch(() => {
                    if (handled) { return; }

                    handled = true;
                    setAlert(AlertHelper.createFetchError());
                });
            }).bind(this);
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        setGetPhaseTwoDeleteText(gtr) {
            this.getPhaseTwoDeleteText = gtr;
        }

        setSetPhaseTwoDeleteText(str) {
            this.setPhaseTwoDeleteText = str;
        }

        onRefresh() {
            /* we don't cache bust for this button; only when we know we're out of date */
            this.setAlert(
                React.createElement(
                    Alert,
                    {
                        type: 'info',
                        title: 'Reload',
                        text: (
                            'The endpoint below was reloaded, bypassing the browser cache and reverse proxy cache.'
                        )
                    }
                )
            )
            this.load(true);
        }

        toggleEdit() {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.editing = !newState.editing;
                return newState;
            });
        }

        onEdit() {
            this.load(true);
            this.toggleEdit();
        }

        togglePhaseOneDelete() {
            this.setPhaseTwoDeleteText('');

            if (this.state.deletePartOneComplete) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.deletePartOneComplete = false;
                    newState.deletePartTwoComplete = false;
                    return newState;
                });
            } else {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.deletePartOneComplete = true;
                    newState.deletePartTwoComplete = false;
                    return newState;
                });
            }
        }

        onPhaseTwoDeleteTextChanged(newText) {
            if (!this.state.deletePartOneComplete) { return; }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.deletePartTwoComplete = newText === this.props.slug;
                return newState;
            });
        }

        onDelete() {
            if (!this.state.deletePartTwoComplete) { return; }

            let handled = false;
            api_fetch(
                `/api/endpoints/${this.props.slug}`,
                AuthHelper.auth({
                    method: 'DELETE'
                })
            ).then((resp) => {
                if (handled) { return; }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('delete endpoint', resp).then(this.setAlert);
                    return;
                }

                handled = true;
                this.load(true);
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            })
        }
    }

    EndpointViewWithAjax.propTypes = {
        slug: PropTypes.string.isRequired
    }

    /**
     * Shows a auto-suggestion box which uses ajax to make suggestions and
     * check if endpoint slugs exist. If the endpoint slug does exist this
     * will trigger the `slugChanged` callback.
     *
     * @param {string} slug The initial slug to select
     * @param {func} valueQuery Called with a function which accepts no
     *   arguments and returns the actual raw value currently in the textbox
     * @param {func} valueSet Called with a function which accepts one
     *   argument and sets the actual raw value currently in the textbox.
     * @param {func} slugQuery Called with a function which returns the same
     *   as valueQuery if the current raw value is a real slug, otherwise null.
     * @param {func} slugChanged Called whenever a valid slug is put into the
     *   textbox. Passed the endpoint slug. This can be triggered by valueSet
     *   so be aware of infinite loops.
     * @param {bool} disabled If true a disabled form state is shown and the
     *   user cannot edit the form.
     */
    class EndpointSelectFormWithAjax extends React.Component {
        constructor(props) {
            super(props);

            this.fetchCounter = 0;
            this.lastValidFetchCounter = -1;
            this.suggestCounter = 0;

            this.getValue = null;
            this.setValue = null;
            this.setAlert = null;
            this.setSecondaryAlert = null;

            this.setGetValue = this.setGetValue.bind(this);
            this.setSetValue = this.setSetValue.bind(this);
            this.setSetAlert = this.setSetAlert.bind(this);
            this.setSetSecondaryAlert = this.setSetSecondaryAlert.bind(this);
            this.onValueChanged = this.onValueChanged.bind(this);
            this.handleSuggestionsRequest = this.handleSuggestionsRequest.bind(this);
        }

        render() {
            return React.createElement(
                Alertable,
                {
                    alertSet: this.setSetAlert
                },
                React.createElement(
                    Alertable,
                    {
                        alertSet: this.setSetSecondaryAlert
                    },
                    React.createElement(
                        AutoCompleter,
                        {
                            disabled: this.props.disabled,
                            labelText: 'Endpoint slug',
                            valueQuery: this.setGetValue,
                            valueChanged: this.onValueChanged,
                            valueSet: this.setSetValue,
                            suggestionsRequest: this.handleSuggestionsRequest
                        }
                    )
                )
            );
        }

        setGetValue(qry) {
            this.getValue = qry;

            if (this.props.valueQuery) {
                this.props.valueQuery(qry);
            }

            if (this.props.slugQuery) {
                this.props.slugQuery(
                    (() => {
                        if (this.fetchCounter !== this.lastValidFetchCounter) {
                            return null;
                        }

                        return this.getValue();
                    }).bind(this)
                );
            }
        }

        setSetValue(str) {
            this.setValue = str;

            if (this.props.valueSet) {
                this.props.valueSet(str);
            }

            if (this.props.slug) {
                setTimeout((() => {
                    str(this.props.slug);
                    this.onValueChanged(this.props.slug);
                }).bind(this), 50);
            }
        }

        setSetAlert(str) {
            this.setAlert = str;
        }

        setSetSecondaryAlert(str) {
            this.setSecondaryAlert = str;
        }

        onValueChanged(newValue) {
            // We could use a HEAD request, but this endpoint has aggressive
            // cache control settings, so if this isn't already in the cache
            // then filling the cache is likely to be useful.

            this.setAlert();

            let handled = false;
            let myFetchCounter = ++this.fetchCounter;
            api_fetch(
                `/api/endpoints/${newValue}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }
                if (this.fetchCounter != myFetchCounter) {
                    handled = true;
                    return;
                }

                if (resp.status === 404) {
                    handled = true;
                    return;
                }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse(
                        'check if endpoint exists', resp
                    ).then((alrt) => {
                        if (this.fetchCounter != myFetchCounter) { return; }
                        this.setAlert(alrt);
                    });
                    return;
                }

                handled = true;
                this.lastValidFetchCounter = myFetchCounter;
                if (this.props.slugChanged) {
                    this.props.slugChanged(newValue);
                }
            }).catch(() => {
                if (handled) { return; }
                if (myFetchCounter !== this.fetchCounter) {
                    handled = true;
                    return;
                }
                handled = true;
                this.setAlert(AlertHelper.createFetchError());
            });
        }

        handleSuggestionsRequest(query, callback) {
            this.setSecondaryAlert();

            let handled = false;
            let mySuggestCounter = ++this.suggestCounter;
            api_fetch(
                `/api/endpoints/suggest?q=${encodeURIComponent(query)}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (handled) { return; }
                if (mySuggestCounter !== this.suggestCounter) {
                    handled = true;
                    return;
                }

                if (!resp.ok) {
                    handled = true;
                    AlertHelper.createFromResponse('get suggestion', resp).then((alrt) => {
                        if (mySuggestCounter !== this.suggestCounter) { return; }
                        this.setSecondaryAlert(alrt);
                    });
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }
                if (mySuggestCounter !== this.suggestCounter) {
                    handled = true;
                    return;
                }

                handled = true;
                callback(json.suggestions);
            }).catch(() => {
                if (handled) { return; }
                if (mySuggestCounter !== this.suggestCounter) {
                    handled = true;
                    return;
                }

                handled = true;
                this.setSecondaryAlert(AlertHelper.createFetchError());
            })
        }
    }

    EndpointSelectFormWithAjax.propTypes = {
        slug: PropTypes.string,
        valueQuery: PropTypes.func,
        valueSet: PropTypes.func,
        slugQuery: PropTypes.func,
        slugChanged: PropTypes.func,
        disabled: PropTypes.bool
    };

    /**
     * Shows an auto-completion search tool for endpoints using the endpoint
     * slug. May be seeded with an initial value.
     *
     * @param {string} slug The initial slug filled into the box.
     */
    class EndpointSelectFormWithAjaxAndView extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currentSlug: null
            };

            this.setValue = null;

            this.setSetValue = this.setSetValue.bind(this);
            this.onSlugChanged = this.onSlugChanged.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        EndpointSelectFormWithAjax,
                        {
                            key: 'select-form',
                            valueSet: this.setSetValue,
                            slugChanged: this.onSlugChanged
                        }
                    ),
                ].concat(this.state.currentSlug ? [
                    React.createElement(
                        EndpointViewWithAjax,
                        {
                            key: `endpoint-${this.state.currentSlug}`,
                            slug: this.state.currentSlug
                        }
                    )
                ] : [])
            )
        }

        componentDidMount() {
            if (this.props.slug) {
                this.setValue(this.props.slug);
                this.onSlugChanged(this.props.slug);
            }
        }

        setSetValue(str) {
            this.setValue = str;
        }

        onSlugChanged(slug) {
            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.currentSlug = slug;
                return newState;
            })
        }
    }

    EndpointSelectFormWithAjaxAndView.propTypes = {
        slug: PropTypes.string
    };

    return [EndpointSelectFormWithAjaxAndView, EndpointAddFormWithAjax];
})();
