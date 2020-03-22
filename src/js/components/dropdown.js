const DropDown = (function() {
    /**
     * A simple wrapper around a dropdown. Required keyboard-controls are
     * described at https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
     * which are, at the time of writing (and hence what we currently support):
     * - Prominent focus highlighting.
     * - When we receive focus we expand, focus, and select the first option
     * - Down arrow focuses and selects the next option. Does not wrap around.
     * - Up arrow focuses and selects the previous option. Does not wrap around.
     * - Home moves to the first option
     * - End moves to the last option
     * - Typeahead support with rapid succession support.
     * - On mobile it pops up the options when clicked
     *
     * @param {array} options An array of options which are visible in this
     *   dropdown, where each option is an object with a key and text. The
     *   key is what will be used for referencing the option.
     * @param {string} initialOption The key in options that is initially
     *   selected. Null or an invalid key for no initial selection.
     * @param {func} optionQuery A function which we call with a function which
     *   will return the currently selected option key
     * @param {func} optionSet A function which we call with a function that
     *   accepts an option key and sets the current option to that key.
     * @param {func} optionChanged A function which is called with the new
     *   option key whenever the option on this dropdown changes.
     * @param {bool} disabled True if this dropdown is disabled, false or null
     *   otherwise
     */
    class DropDown extends React.Component {
        constructor(props) {
            super(props);
            this.selectRef = React.createRef();
        }

        render() {
            return React.createElement('select',
                {
                    ref: this.selectRef,
                    disabled: !!this.props.disabled,
                    className: 'single-select',
                    defaultValue: this.props.initialOption
                },
                this.props.options.map((elm, idx) => {
                    return React.createElement(
                        'option',
                        {
                            key: elm.key,
                            value: elm.key,
                            className: 'single-select-option'
                        },
                        elm.text
                    );
                })
            );
        }

        componentDidMount() {
            if (this.props.optionQuery) {
                this.props.optionQuery(
                    (() => this.selectRef.current.value).bind(this)
                );
            }

            if (this.props.optionSet) {
                this.props.optionSet(
                    ((val) => this.selectRef.current.value = val).bind(this)
                );
            }

            if (this.props.optionChanged) {
                this.selectRef.current.addEventListener('change', ((e) => {
                    this.props.optionChanged(this.selectRef.current.value);
                }).bind(this));
            }
        }
    }

    DropDown.propTypes = {
        options: PropTypes.arrayOf(PropTypes.shape({
            text: PropTypes.string.isRequired,
            key: PropTypes.string.isRequired
        })).isRequired,
        initialOption: PropTypes.number,
        optionQuery: PropTypes.func,
        optionSet: PropTypes.func,
        optionChanged: PropTypes.func,
        disabled: PropTypes.bool
    };

    return DropDown;
})();