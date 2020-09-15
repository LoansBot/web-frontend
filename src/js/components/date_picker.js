const DatePicker = (function() {
    /**
     * A simple wrapper around a date selector. The date is always
     * wrapped with a Date object. When invalid the value is null.
     *
     * @param {Date} initialDate The date that is initially selected.
     * @param {func} dateQuery A function which we call with a function which
     *   will return the currently selected date
     * @param {func} dateSet A function which we call with a function that
     *   accepts andate and sets the current date to that date.
     * @param {func} dateChanged A function which is called with the new
     *   date whenever the date changes.
     * @param {bool} disabled True if this dropdown is disabled, false or null
     *   otherwise
     */
    class DatePicker extends React.Component {
        constructor(props) {
            super(props);
            this.inputRef = React.createRef();
        }

        render() {
            return React.createElement('input',
                {
                    ref: this.inputRef,
                    defaultValue: this.props.initialDate ? this.formatDate(this.props.initialDate) : '',
                    disabled: !!this.props.disabled,
                    className: 'date-picker',
                    type: 'date'
                }
            );
        }

        componentDidMount() {
            if (this.props.dateQuery) {
                this.props.dateQuery(
                    (() => this.getValue()).bind(this)
                );
            }

            if (this.props.dateSet) {
                this.props.dateSet(
                    ((val) => { this.inputRef.current.value = this.formatDate(val) }).bind(this)
                );
            }

            if (this.props.dateChanged) {
                this.inputRef.current.addEventListener('change', (() => {
                    this.props.dateChanged(this.getValue());
                }).bind(this));
            }
        }

        getValue() {
            let val = this.parseDateInLocalTime(this.inputRef.current.value);
            if(isNaN(val.getTime())) {
                return null;
            }
            return val;
        }

        parseDateInLocalTime(isoDate) {
            if (isoDate === null || isoDate === undefined) {
                return null;
            }

            return new Date(...isoDate.split('-').map((s, idx) => parseInt(s) - (idx == 1 ? 1 : 0)));
        }

        formatDate(val) {
            return `${val.getFullYear()}-${val.getMonth() < 9 ? '0' : ''}${val.getMonth() + 1}-${val.getDate() < 10 ? '0' : ''}${val.getDate()}`;
        }
    }

    DatePicker.propTypes = {
        initialDate: PropTypes.instanceOf(Date),
        dateQuery: PropTypes.func,
        dateSet: PropTypes.func,
        dateChanged: PropTypes.func,
        disabled: PropTypes.bool
    };

    return DatePicker;
})();
