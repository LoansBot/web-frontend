const AutoCompleter = (() => {
    /**
     * A single suggestion within an auto completer
     *
     * @param {string} originalTerm The original term searched for so that we
     *   can highlight it. Example: "tj"
     * @param {string} predictiveTerm The entire predicted term that we are
     *   suggesting. Example: "tjstretchalot"
     * @param {function} onClick A function we call with the predictive term
     *   when one is clicked.
     * @param {function} focus A function which we call with a function which
     *   accepts no arguments and rips focus to this element.
     * @param {function} focusChanged A function which we call with true when
     *   we become focused and false when we lose focus.
     * @param {function} focusGet A function which we call with a function
     *   which returns true if this suggestion is focused and false otehrwise.
     */
    class AutoCompleteSuggestion extends React.Component {
        constructor(props) {
            super(props);

            this.element = React.createRef();
        }

        render() {
            let children = [];

            let currentIndex = 0;
            const haystack = this.props.predictiveTerm.toLowerCase();
            const needle = this.props.originalTerm.toLowerCase();
            while (currentIndex < haystack.length) {
                if (needle.length === 0) {
                    children.push(React.createElement(
                        React.Fragment,
                        {key: `substring-0`},
                        this.props.predictiveTerm
                    ));
                    break;
                }
                let foundIndex = haystack.indexOf(needle, currentIndex);
                if (foundIndex < 0) {
                    children.push(React.createElement(
                        React.Fragment,
                        {key: `substring-${children.length}`},
                        this.props.predictiveTerm.substring(currentIndex)
                    ));
                    break;
                }

                if (foundIndex > currentIndex) {
                    children.push(React.createElement(
                        React.Fragment,
                        {key: `substring-${children.length}`},
                        this.props.predictiveTerm.substring(currentIndex, foundIndex)
                    ));
                }

                children.push(React.createElement(
                    'strong',
                    {key: `substring-${children.length}`},
                    this.props.predictiveTerm.substring(foundIndex, foundIndex + needle.length)
                ));
                currentIndex = foundIndex + needle.length;
            }

            return React.createElement(
                Button,
                {
                    onClick: this.props.onClick,
                    focus: this.props.focus,
                    focusChanged: this.props.focusChanged,
                    focusGet: this.props.focusGet
                },
                children
            );
        }
    };

    AutoCompleteSuggestion.propTypes = {
        originalTerm: PropTypes.string.isRequired,
        predictiveTerm: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        focus: PropTypes.func,
        focusChanged: PropTypes.func,
        focusGet: PropTypes.func
    };

    /**
     * A list of suggestions within an auto completer.
     *
     * @param {string} originalTerm The original term that was searched for.
     * @param {list} predictiveTerms The list of terms we are suggesting.
     * @param {function} onClick A function we call with the predictive term
     *   when one is clicked.
     * @param {function} focus A function which we call with a function which
     *   accepts one optional argument, which is the index of the element to
     *   jump focus to.
     * @param {function} focusChanged A function which we call with the boolean
     *   true when one of our children become focused and false when one of our
     *   children becomes unfocused. May be called twice in quick suggestion
     *   (lost focus -> gained focus), and the order is not promised.
     * @param {function} focusGet A function which we call with a function
     *   which returns true if any of the suggestions are focused and false
     *   otherwise.
     * @param {function} tryMoveUp A function which we call with a function
     *   which tries to change the focused suggestion up one. Returns true
     *   if there was a selection above the selected one to go to, false
     *   otherwise.
     * @param {function} tryMoveDown A function which we call with a function
     *   which tries to change the focused suggestion down one. Returns true
     *   if there was a selection below the selected one to go to, false
     *   otherwise.
     */
    class AutoCompleteSuggestionList extends React.Component {
        constructor(props) {
            super(props);

            this.childrenFocusGet = [];
            this.childrenFocus = [];
        }

        render() {
            return React.createElement(
                'div',
                {className: 'autocompleter-suggestions'},
                this.props.predictiveTerms.map((trm, idx) => {
                    return React.createElement(
                        AutoCompleteSuggestion,
                        {
                            key: `suggestion-${idx}`,
                            originalTerm: this.props.originalTerm,
                            predictiveTerm: trm,
                            onClick: (() => {
                                if (!this.props.onClick) { return; }
                                this.props.onClick(this.props.predictiveTerms[idx]);
                            }).bind(this),
                            focus: ((fcs) => {
                                this.childrenFocus[idx] = fcs;
                            }).bind(this),
                            focusChanged: ((fcsd) => {
                                if (!this.props.focusChanged) { return; }
                                this.props.focusChanged(fcsd);
                            }).bind(this),
                            focusGet: ((fcsGet) => {
                                this.childrenFocusGet[idx] = fcsGet;
                            }).bind(this)
                        }
                    )
                })
            );
        }

        componentDidMount() {
            if (this.props.focus) {
                this.props.focus(((idx) => {
                    idx = idx || 0;
                    this.childrenFocus[idx]();
                }).bind(this));
            }

            if (this.props.focusGet) {
                this.props.focusGet((() => {
                    for (let idx = 0; idx < this.props.predictiveTerms.length; idx++) {
                        if (this.childrenFocusGet[idx]()) {
                            return true;
                        }
                    }
                    return false;
                }).bind(this));
            }

            if (this.props.tryMoveDown) {
                this.props.tryMoveDown((() => {
                    if (this.props.predictiveTerms.length === 0) { return; }

                    let currentIndex = -1;
                    for (let idx = 0; idx < this.props.predictiveTerms.length; idx++) {
                        if (this.childrenFocusGet[idx]()) {
                            currentIndex = idx;
                            break;
                        }
                    }

                    let newIndex = currentIndex + 1;
                    if (newIndex >= this.props.predictiveTerms.length) {
                        newIndex = 0;
                    }

                    this.childrenFocus[newIndex]();
                }).bind(this));
            }

            if (this.props.tryMoveUp) {
                this.props.tryMoveUp((() => {
                    if (this.props.predictiveTerms.length === 0) { return; }

                    let currentIndex = 0;
                    for (let idx = 0; idx < this.props.predictiveTerms.length; idx++) {
                        if (this.childrenFocusGet[idx]()) {
                            currentIndex = idx;
                            break;
                        }
                    }

                    let newIndex = currentIndex - 1;
                    if (newIndex < 0) {
                        newIndex = this.props.predictiveTerms.length - 1;
                    }

                    this.childrenFocus[newIndex]();
                }));
            }
        }

        componentDidUpdate() {
            this.childrenFocusGet = this.childrenFocusGet.slice(0, this.props.predictiveTerms.length);
            this.childrenFocus = this.childrenFocus.slice(0, this.props.predictiveTerms.length);
        }
    }

    AutoCompleteSuggestionList.propTypes = {
        originalTerm: PropTypes.string.isRequired,
        predictiveTerms: PropTypes.arrayOf(PropTypes.string).isRequired,
        onClick: PropTypes.func,
        focus: PropTypes.func,
        focusChanged: PropTypes.func,
        focusGet: PropTypes.func,
        tryMoveUp: PropTypes.func,
        tryMoveDown: PropTypes.func
    };

    /**
     * Shows a text field which allows the user to input text and see
     * suggestions.
     *
     * @param {string} labelText The label text for the form field
     * @param {function} valueQuery A function which we call with a function
     *   which accepts no arguments and returns the current value within the
     *   text input.
     * @param {function} valueChanged A function which we call with the new
     *   value in this input whenever it changes.
     * @param {function} valueSet A function which we call with a function
     *   which accepts some text and sets the value in the input to the given
     *   value.
     * @param {function} suggestionsRequest A function which we call with two
     *   arguments - the current value in the input and a function which acts
     *   as a callback. The function should be called with a list of predictive
     *   terms based on the value it was passed.
     * @param {bool} disabled If true then editing is disabled
     */
    class AutoCompleter extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                suggestionsTerm: null,
                suggestions: [],
                suggestionsState: 'closed'
            };

            this.suggestionCounter = 0;
            this.focusLostTimeout = null;

            this.element = React.createRef();
            this.textQuery = null;
            this.textSet = null;
            this.focusInput = null;
            this.focusInputGet = null;
            this.focusSuggestions = null;
            this.focusSuggestionsGet = null;
            this.tryMoveUp = null;
            this.tryMoveDown = null;

            this.valueChanged = this.valueChanged.bind(this);
            this.onSuggestionClick = this.onSuggestionClick.bind(this);
            this.setTextQuery = this.setTextQuery.bind(this);
            this.setTextSet = this.setTextSet.bind(this);
            this.setFocusInput = this.setFocusInput.bind(this);
            this.setFocusInputGet = this.setFocusInputGet.bind(this);
            this.inputFocusChanged = this.inputFocusChanged.bind(this);
            this.setFocusSuggestions = this.setFocusSuggestions.bind(this);
            this.setFocusSuggestionsGet = this.setFocusSuggestionsGet.bind(this);
            this.suggestionsFocusChanged = this.suggestionsFocusChanged.bind(this);
            this.checkIfFocusLost = this.checkIfFocusLost.bind(this);
            this.setTryMoveUp = this.setTryMoveUp.bind(this);
            this.setTryMoveDown = this.setTryMoveDown.bind(this);
            this.keydown = this.keydown.bind(this);
        }

        render() {
            return React.createElement(
                'div',
                {
                    className: 'autocompleter',
                    ref: this.element
                },
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'input',
                            labelText: this.props.labelText,
                        },
                        React.createElement(
                            TextInput,
                            {
                                type: 'text',
                                textQuery: this.setTextQuery,
                                textChanged: this.valueChanged,
                                textSet: this.setTextSet,
                                focus: this.setFocusInput,
                                focusChanged: this.inputFocusChanged,
                                focusGet: this.setFocusInputGet,
                                disabled: this.props.disabled
                            }
                        )
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'suggestions',
                            initialState: 'closed',
                            desiredState: this.props.disabled ? 'closed' : this.state.suggestionsState
                        },
                        React.createElement(
                            AutoCompleteSuggestionList,
                            {
                                key: 'suggestions',
                                originalTerm: this.state.suggestionsTerm,
                                predictiveTerms: this.state.suggestions,
                                onClick: this.onSuggestionClick,
                                tryMoveUp: this.setTryMoveUp,
                                tryMoveDown: this.setTryMoveDown,
                                focus: this.setFocusSuggestions,
                                focusChanged: this.suggestionsFocusChanged,
                                focusGet: this.setFocusSuggestionsGet
                            }
                        )
                    )
                ]
            );
        }

        componentDidMount() {
            this.element.current.addEventListener('keydown', this.keydown);
        }

        componentWillUnmount() {
            if (this.focusLostTimeout) { clearTimeout(this.focusLostTimeout); }
        }

        keydown(evt) {
            if (evt.key === 'ArrowUp') {
                if (this.focusSuggestionsGet()) {
                    if (!this.tryMoveUp()) {
                        this.focusInput();
                    }
                } else if (this.focusInputGet() && this.suggestions.length > 0) {
                    this.focusSuggestions(this.suggestions.length - 1);
                }
                evt.stopPropagation();
                evt.preventDefault();
            } else if (evt.key === 'ArrowDown') {
                if (this.focusSuggestionsGet()) {
                    if (!this.tryMoveDown()) {
                        this.focusInput();
                    }
                } else if (this.focusInputGet() && this.suggestions.length > 0) {
                    this.focusSuggestionsGet(this.suggestions(0));
                }
                evt.stopPropagation();
                evt.preventDefault();
            } else if (evt.key.length === 1 && (evt.key >= 'a' && evt.key <= 'z' || evt.key >= 'A' && evt.key <= 'Z')) {
                if (this.focusSuggestionsGet()) {
                    this.focusInput();
                    let newText = this.textQuery() + evt.key;
                    this.textSet(newText);
                    this.valueChanged(newText);
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            }
        }

        setTextQuery(query) {
            this.textQuery = query;

            if (this.props.valueQuery) {
                this.props.valueQuery(query);
            }
        }

        setTextSet(setter) {
            this.textSet = setter;

            if (this.props.valueSet) {
                this.props.valueSet(((val) => {
                    this.textSet(val);
                    this.valueChanged(val, true);
                }).bind(this));
            };
        }

        setFocusSuggestions(focus) {
            this.focusSuggestions = focus;
        }

        setFocusSuggestionsGet(getter){
            this.focusSuggestionsGet = getter;
        }

        setFocusInput(focus) {
            this.focusInput = focus;
        }

        setFocusInputGet(getter) {
            this.focusInputGet = getter;
        }

        setTryMoveUp(up) {
            this.tryMoveUp = up;
        }

        setTryMoveDown(down) {
            this.tryMoveDown = down;
        }

        inputFocusChanged(focused) {
            /* For right now it doesn't matter who gets focus */
            this.suggestionsFocusChanged(focused);
        }

        suggestionsFocusChanged(focused) {
            if (!focused) {
                if (this.focusLostTimeout !== null) {
                    this.clearTimeout(this.focusLostTimeout);
                }
                this.focusLostTimeout = setTimeout(this.checkIfFocusLost, 500);
            } else if (this.focusLostTimeout) {
                clearTimeout(this.focusLostTimeout);
                this.focusLostTimeout = null;
            } else {
                if (this.state.suggestionsState !== 'expanded' && this.state.suggestions.length > 0) {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.suggestionsState = 'expanded';
                        return newState;
                    });
                }
            }
        }

        checkIfFocusLost() {
            this.focusLostTimeout = null;

            if (!this.focused()) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.suggestionsState = 'closed';
                    return newState;
                });
            }
        }

        focused() {
            return this.focusInputGet() || this.focusSuggestionsGet();
        }

        valueChanged(newVal, suppressCallback) {
            suppressCallback = !!suppressCallback;

            if (!suppressCallback && this.props.valueChanged) {
                this.props.valueChanged(newVal);
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.suggestions = newState.suggestions.filter((val) => val.includes(newVal));
                return newState;
            });

            this.suggestionCounter += 1;
            const counter = this.suggestionCounter;

            if (!this.props.suggestionsRequest) { return; }

            this.props.suggestionsRequest(
                newVal, ((suggestions) => {
                    if (this.suggestionCounter !== counter) { return; }
                    this.setState(((state) => {
                        let newState = Object.assign({}, state);
                        newState.suggestionsTerm = newVal;
                        newState.suggestions = suggestions;
                        if (this.focused() && suggestions.length > 0) {
                            newState.suggestionsState = 'expanded';
                        }
                        return newState;
                    }).bind(this));
                }).bind(this)
            );
        }

        onSuggestionClick(suggested) {
            this.textSet(suggested);
            this.valueChanged(suggested);
        }
    };

    AutoCompleter.propTypes = {
        labelText: PropTypes.string.isRequired,
        valueQuery: PropTypes.func,
        valueChanged: PropTypes.func,
        valueSet: PropTypes.func,
        suggestionsRequest: PropTypes.func,
        disabled: PropTypes.bool
    };

    return AutoCompleter;
})();
