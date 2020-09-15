const DateTimePicker = (function() {
    /**
     * A simple wrapper around a date and time selector. The date is always
     * wrapped with a Date object. When invalid the value is null.
     *
     * @param {Date} initialDatetime The datettime that is initially selected.
     * @param {func} datetimeQuery A function which we call with a function which
     *   will return the currently selected date or null if an invalid date is
     *   set.
     * @param {func} datetimeSet A function which we call with a function that
     *   accepts a Date and sets the value in the datetime picker to that date.
     * @param {func} datetimeChanged A function which is called with the new
     *   datetime whenever the datetime changes.
     * @param {bool} disabled True if this dropdown is disabled, false or null
     *   otherwise
     */
    class DateTimePicker extends React.Component {
        constructor(props) {
            super(props);
            this.inputRef = React.createRef();
        }

        render() {
            return React.createElement('input',
                {
                    ref: this.inputRef,
                    defaultValue: this.props.initialDatetime ? this.formatDate(this.props.initialDatetime) : '',
                    disabled: !!this.props.disabled,
                    className: 'datetime-picker',
                    type: 'datetime-local'
                }
            );
        }

        componentDidMount() {
            if (this.props.datetimeQuery) {
                this.props.datetimeQuery(
                    (() => this.getValue()).bind(this)
                );
            }

            if (this.props.datetimeSet) {
                this.props.datetimeSet(
                    ((val) => { this.inputRef.current.value = this.formatDate(val) }).bind(this)
                );
            }

            if (this.props.datetimeChanged) {
                this.inputRef.current.addEventListener('change', (() => {
                    this.props.datetimeChanged(this.getValue());
                }).bind(this));
            }
        }

        getValue() {
            let val = new Date(this.inputRef.current.value);
            if(isNaN(val.getTime())) {
                return null;
            }
            return val;
        }

        formatDate(val) {
            return `${val.getFullYear()}-${val.getMonth() < 9 ? '0' : ''}${val.getMonth() + 1}-${val.getDate() < 10 ? '0' : ''}${val.getDate()}T${val.getHours() < 10 ? '0' : ''}${val.getHours()}:${val.getMinutes() < 10 ? '0' : ''}${val.getMinutes()}:${val.getSeconds() < 10 ? '0' : ''}${val.getSeconds()}`;
        }
    }

    DateTimePicker.propTypes = {
        initialDatetime: PropTypes.object,
        datetimeQuery: PropTypes.func,
        datetimeSet: PropTypes.func,
        datetimeChanged: PropTypes.func,
        disabled: PropTypes.bool
    };

    return DateTimePicker;
})();
