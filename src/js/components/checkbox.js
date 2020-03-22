const CheckBox = (function() {
    /**
     * Wraps a simple checkbox. Use space to toggle when focused, or click.
     *
     * @param {bool} checked True if this starts checked, false otherwise
     * @param {bool} disabled True if this is disabled (i.e., the user cannot
     *   change the value), false if the user can change the value
     * @param {func} checkedSet A function which is called with a function that
     *   sets the checked value on the checkbox. Accepts one argument - a bool.
     * @param {func} checkedQuery A function which is called with a function
     *   which returns true if the checkbox is currently checked and false
     *   otherwise.
     * @param {func} checkedChanged A function which will be called whenever the
     *   checked value on the checkbox changes. Passed one value - the new
     *   checked value.
     */
    class CheckBox extends React.Component {
        constructor(props) {
            super(props);
            this.checkedRef = React.createRef();
        }

        render() {
            return React.createElement('input',
                {
                    ref: this.checkedRef,
                    type: 'checkbox',
                    defaultChecked: !!this.props.checked,
                    disabled: !!this.props.disabled,
                    className: 'checkbox'
                }
            );
        }

        componentDidMount() {
            if (this.props.checkedSet) {
                this.props.checkedSet(
                    ((val) => this.checkedRef.current.checked = !!val).bind(this)
                );
            }

            if (this.props.checkedQuery) {
                this.props.checkedQuery(
                    (() => this.checkedRef.current.checked).bind(this)
                );
            }

            if (this.props.checkedChanged) {
                this.checkedRef.current.addEventListener('change', ((e) => {
                    this.props.checkedChanged(this.checkedRef.current.checked);
                }).bind(this));
            }
        }
    }

    CheckBox.propTypes = {
        checked: PropTypes.bool,
        disabled: PropTypes.bool,
        checkedSet: PropTypes.func,
        checkedQuery: PropTypes.func,
        checkedChanged: PropTypes.func
    };

    return CheckBox;
})();