const LogFeedWithControlsAndLogic = (function() {
    /**
     * Describes a single item within the log.
     *
     * @param {number} id The id from the server
     * @param {string} application The application name that made this log
     * @param {string} identifier Where in the application made the log
     * @param {string} level The message severity, e.g, 'WARN'
     * @param {string} message The message
     * @param {Date} createdAt when the message was created
     */
    class LogItem extends React.Component {
        render() {
            return React.createElement(
                'li',
                {
                    className: `log-item log-item-${this.props.level}`
                },
                [
                    React.createElement(
                        'span',
                        {
                            key: 'created-at',
                            className: `log-created-at`
                        },
                        this.props.createdAt.toLocaleString()
                    ),
                    React.createElement(
                        'span',
                        {
                            key: 'application',
                            className: `log-application log-application-${this.props.application}`
                        },
                        this.props.application
                    ),
                    React.createElement(
                        'span',
                        {
                            key: 'identifier',
                            className: 'log-identifier'
                        },
                        this.props.identifier
                    ),
                    React.createElement(
                        'span',
                        {
                            key: 'level',
                            className: `log-level log-level-${this.props.level}`,
                            aria_hidden: 'true'
                        },
                        this.props.level
                    ),
                    React.createElement(
                        'span',
                        {
                            key: 'message',
                            className: `log-message`
                        },
                        this.props.message
                    )
                ]
            );
        }
    };

    LogItem.propTypes = {
        id: PropTypes.number.isRequired,
        application: PropTypes.string.isRequired,
        identifier: PropTypes.string.isRequired,
        level: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        createdAt: PropTypes.object.isRequired
    };

    /**
     * Describes a feed of logs, which just a list of logitems.
     *
     * @param {array} items The items which belong to this feed, where each
     *   element is an object with the properties for LogItem
     */
    class LogFeed extends React.Component {
        render() {
            return React.createElement(
                'ul',
                {
                    className: 'log-feed'
                },
                this.props.items.map((itm) => {
                    let props = Object.assign({}, itm);
                    props.key = itm.id.toString();
                    return React.createElement(LogItem, props);
                })
            );
        }
    };

    LogFeed.propTypes = {
        items: PropTypes.array.isRequired
    }

    /**
     * Contains all of the controls for a log feed and callbacks for when they
     * change. Since presumably any of these triggering requires a re-render,
     * this does not support query/set style usage.
     *
     * @param {bool} tail If this is initialized with "tail" mode enabled
     * @param {number} level The minimum log-level from 0 (trace) to error (4).
     * @param {string} filterText The filter on messages that we get.
     * @param {Date} start If tail is not enabled, fetch logs from this date
     * @param {number} maxVisible The maximum number of visible items in the feed.
     * @param {array} applications The application exist as an array of objects
     *   where each object has 'id' as a number and 'name' as a string.
     * @param {number} application The currently selected application or null for
     *   no application filter
     * @param {bool} noSearchAutoWrap If true, send exactly what is specified as
     *   the search parameter. If false, send it surrounded with '%'.
     * @param {func} tailChanged A function which we call when the "tail" value
     *   changes. We pass it the new value
     * @param {func} tailSet A function we call with a function which will set
     *   the visible "tail" value, since we're auto-disabling it sometimes.
     * @param {func} levelChanged A function we pass the new level when it
     *  changes
     * @param {func} filterTextChanged A functino we pass the new filter text
     *   when it changes
     * @param {func} startChanged A function we pass the new "start at time"
     *   when it changes
     * @param {func} maxVisibleChanged A function we pass the new max visible
     *   count when it changes
     * @param {func} applicationChanged A function we pass the new application
     *   id to filter results to when it changes
     * @param {func} noSearchAutoWrapChanged A function we pass the new value
     *   for no-search-auto-wrap when it changes.
     */
    class LogControls extends React.Component {
        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(FormElement, {
                        key: 'tail',
                        labelText: 'Automatically Refresh (tail-mode)',
                        component: CheckBox,
                        componentArgs: {
                            checked: this.props.tail,
                            checkedChanged: this.props.tailChanged,
                            checkedSet: this.props.tailSet
                        }
                    }),
                    React.createElement(FormElement, {
                        key: 'level',
                        labelText: 'Minimum Log Level',
                        component: DropDown,
                        componentArgs: {
                            initialOption: (this.props.level !== undefined && this.props.level !== null) ?  this.props.level.toString() : '0',
                            options: [
                                {key: '0', text: 'Trace'},
                                {key: '1', text: 'Debug'},
                                {key: '2', text: 'Info'},
                                {key: '3', text: 'Warn'},
                                {key: '4', text: 'Error'}
                            ],
                            optionChanged: ((newKey) => {
                                this.props.levelChanged(parseInt(newKey));
                            }).bind(this)
                        }
                    }),
                    React.createElement(FormElement, {
                        key: 'text-filter',
                        labelText: 'Text Filter (tail speed reduced to 60 seconds)',
                        component: TextInput,
                        componentArgs: {
                            text: this.props.filterText,
                            textChanged: this.props.filterTextChanged
                        }
                    }),
                    React.createElement(FormElement, {
                        key: 'start',
                        labelText: 'Get logs starting at (must not be tailing):',
                        component: DateTimePicker,
                        componentArgs: {
                            disabled: this.props.tail,
                            initialDatetime: this.props.start,
                            datetimeChanged: this.props.startChanged
                        }
                    }),
                    React.createElement(FormElement, {
                        key: 'max-visible',
                        labelText: 'Maximum number of visible rows',
                        component: TextInput,
                        componentArgs: {
                            text: this.props.maxVisible,
                            type: 'number',
                            min: 5,
                            step: 5,
                            max: 100,
                            textChanged: this.props.maxVisibleChanged
                        }
                    }),
                    React.createElement(FormElement, {
                        key: 'application',
                        labelText: 'Restrict logs to application',
                        component: DropDown,
                        componentArgs: {
                            initialOption: this.props.application ? this.props.application.toString() : null,
                            options: (function() {
                                let res = [{key: '__no-filter', text: 'No filter'}];
                                for(var i = 0, len = this.props.applications.length; i < len; i++) {
                                    let elm = this.props.applications[i];
                                    res.push({ key: elm.id.toString(), text: elm.name })
                                }
                                return res;
                            }).bind(this)(),
                            optionChanged: ((newOpt) => {
                                if(this.props.applicationChanged) {
                                    this.props.applicationChanged(newOpt == '__no-filter' ? null : newOpt);
                                }
                            }).bind(this)
                        }
                    }),
                    React.createElement(FormElement, {
                        key: 'search-auto-wrap',
                        labelText: 'Send search as specified',
                        component: CheckBox,
                        componentArgs: {
                            checked: this.props.noSearchAutoWrap,
                            checkedChanged: this.props.noSearchAutoWrapChanged
                        }
                    })
                ]
            )
        }
    };

    LogControls.propTypes = {
        tail: PropTypes.bool,
        level: PropTypes.number,
        filterText: PropTypes.string,
        start: PropTypes.object,
        maxVisible: PropTypes.number,
        applications: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })),
        noSearchAutoWrap: PropTypes.bool,
        tailChanged: PropTypes.func,
        tailSet: PropTypes.func,
        levelChanged: PropTypes.func,
        filterTextChanged: PropTypes.func,
        startChanged: PropTypes.func,
        maxVisibleChanged: PropTypes.func,
        applicationChanged: PropTypes.func,
        noSearchAutoWrapChanged: PropTypes.func
    }

    const LOG_LEVEL_TO_NAME = ['trace', 'debug', 'info', 'warn', 'error'];
    class LogFeedWithControlsAndLogic extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                tail: false,
                level: 1,
                filterText: '',
                start: null,
                maxVisible: 10,
                applications: {},
                application: null,
                lastSeenId: null,
                items: [],
                noSearchAutoWrap: false,
                tailsRemaining: 0,
                justTailed: false
            }
            this.tailQueued = false;
            this.tailSet = null;

            setTimeout((function() {
                this.updateApplications().then(this.updateLogs.bind(this));
            }).bind(this), 0);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'auto-refresh',
                            initialState: 'closed',
                            desiredState: this.state.tail ? 'expanded' : 'closed'
                        },
                        React.createElement(
                            'div',
                            null,
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: 'text'},
                                    'Tailing..'
                                )
                            ].concat(this.state.justTailed ? [
                                React.createElement(
                                    React.Fragment,
                                    {key: 'extra-dot'},
                                    '.'
                                )
                            ] : [])
                        )
                    ),
                    React.createElement(
                        LogFeed,
                        {key: 'feed', items: this.state.items}
                    ),
                    React.createElement(
                        LogControls,
                        {
                            key: 'controls',
                            tail: this.state.tail,
                            tailChanged: ((newTail) => {
                                let newState = Object.assign(this.state);
                                newState.tail = newTail;
                                newState.tailsRemaining = 12 * 60;
                                newState.lastSeenId = null;
                                this.setState(newState);
                            }).bind(this),
                            tailSet: ((s) => this.tailSet = s).bind(this),
                            level: this.state.level,
                            levelChanged: ((newLevel) => {
                                let newState = Object.assign(this.state);
                                newState.level = newLevel;
                                this.setState(newState, this.updateLogs.bind(this));
                            }).bind(this),
                            filterText: this.state.filterText,
                            filterTextChanged: ((newFilter) => {
                                let newState = Object.assign(this.state);
                                newState.filterText = newFilter;
                                this.setState(newState, this.updateLogs.bind(this));
                            }).bind(this),
                            start: this.state.start,
                            startChanged: ((newStart) => {
                                let newState = Object.assign(this.state);
                                newState.start = newStart;
                                this.setState(newState, this.updateLogs.bind(this));
                            }).bind(this),
                            maxVisible: this.state.maxVisible,
                            maxVisibleChanged: ((newMax) => {
                                let newState = Object.assign(this.state);
                                newState.maxVisible = newMax;
                                this.setState(newState, this.updateLogs.bind(this));
                            }).bind(this),
                            applications: Object.keys(this.state.applications).map((elm) => {
                                return { id: parseInt(elm), name: this.state.applications[elm].name };
                            }),
                            application: this.state.application,
                            applicationChanged: ((newApp) => {
                                let newState = Object.assign(this.state);
                                newState.application = newApp;
                                this.setState(newState, this.updateLogs.bind(this));
                            }).bind(this),
                            noSearchAutoWrap: this.state.noSearchAutoWrap,
                            noSearchAutoWrapChanged: ((newVal) => {
                                let newState = Object.assign(this.state);
                                newState.noSearchAutoWrap = newVal;
                                this.setState(newState, this.updateLogs.bind(this));
                            }).bind(this)
                        }
                    )
                ]
            );
        }

        componentDidUpdate() {
            if (this.state.tail && !this.tailQueued) {
                if (this.state.tailsRemaining <= 0) {
                    console.log('Tailing automatically disabled (been tailing a long time)');
                    let newState = Object.assign({}, this.state);
                    newState.tail = false;
                    this.setState(newState);
                    this.tailSet(false);
                }else {
                    this.tailQueued = true;
                    setTimeout(
                        (() => {
                            this.tailQueued = false;
                            this.updateLogs(true);
                            this.setState((state) => {
                                let newState = Object.assign({}, state);
                                newState.justTailed = true;
                                return newState;
                            });

                            setTimeout((() => {
                                this.setState(((state) => {
                                    let newState = Object.assign({}, state);
                                    newState.justTailed = false;
                                    return newState;
                                }).bind(this));
                            }).bind(this), 1000);
                        }).bind(this),
                        this.state.filterText.length == 0 ? 5000 : 60000
                    );
                }
            }
        }

        updateApplications(force) {
            return api_fetch(
                '/api/logs/applications', AuthHelper.auth({
                    cache: force ? 'no-cache' : 'default'
                })
            ).then((resp) => {
                if(resp.status === 200) {
                    return resp.json();
                }

                return Promise.reject(resp.statusText);
            }).then((data) => {
                let newState = Object.assign({}, this.state);
                newState.applications = data.applications;
                this.setState(newState);
            });
        }

        updateLogs(tail) {
            let params = {
                limit: this.state.maxVisible,
                min_level: this.state.level
            };

            if(tail && this.state.lastSeenId) {
                params.min_id = this.state.lastSeenId + 1;
            }else {
                tail = false;

                if(this.state.start !== null) {
                    params.min_created_at = Math.floor(this.state.start.getTime() / 1000);
                }
            }

            if(this.state.application !== null) {
                params.application_ids = this.state.application.toString();
            }

            if(this.state.filterText.length > 0) {
                let realFilterText = this.state.noSearchAutoWrap ? this.state.filterText : `%${this.state.filterText}%`;
                params.search = encodeURIComponent(realFilterText);
            }

            let url = '/api/logs?';
            for(const param in params) {
                if(param !== null && param !== undefined) {
                    url += `${param}=${params[param]}&`;
                }
            }


            return api_fetch(url, AuthHelper.auth()).then((resp) => {
                if(resp.status === 200) {
                    return resp.json();
                }

                return Promise.reject(resp.statusText);
            }).then((data) => {
                let newState = Object.assign({}, this.state);
                var needReloadApplications = false;
                newState.items = data.logs.map((elm) => {
                    var app = this.state.applications[elm.app_id.toString()];
                    if(!app) {
                        app = '(loading)';
                        needReloadApplications = true;
                    }else {
                        app = app.name;
                    }

                    return {
                        id: elm.id,
                        application: app,
                        identifier: elm.identifier,
                        level: LOG_LEVEL_TO_NAME[elm.level],
                        message: elm.message,
                        createdAt: new Date(elm.created_at * 1000)
                    };
                });
                if (tail || this.state.start !== null) {
                    newState.items = newState.items.reverse();
                }

                if(tail && this.state.items && newState.items.length < this.state.maxVisible) {
                    let toKeep = this.state.maxVisible - newState.items.length;
                    newState.items = newState.items.concat(this.state.items.slice(0, toKeep));
                }

                if(newState.items.length > 0) {
                    newState.lastSeenId = newState.items[0].id;
                }else {
                    newState.lastSeenId = null;
                }

                if(tail) {
                    newState.tailsRemaining--;
                }

                this.setState(newState);

                if (needReloadApplications) {
                    this.updateApplications(true).then(this.updateLogs.bind(this));
                }
            });
        }
    };

    LogFeedWithControlsAndLogic.propTypes = {};

    return LogFeedWithControlsAndLogic;
})();
