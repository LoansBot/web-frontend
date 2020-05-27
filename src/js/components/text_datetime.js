const TextDateTime = (function() {
    /**
     * Formats a date in either a relative format with a minimum of hour-level
     * granularity (e.g., 6 days 13 hours ago) or in an unambiguous absolute
     * format (e.g., Jun 1st, 2023).
     *
     * @param {Date} time The time to display
     * @param {string, null} style Either the string 'relative', 'absolute', or
     *   null to automatically choose based on when the time occurred.
     */
    class TextDateTime extends React.Component {
        constructor(props) {
            super(props);

            let thresholdMS = 1000 * 60 * 60 * 24 * 10;
            let useRelative = (
                this.props.style === 'relative' ||
                (
                    this.props.style !== 'absolute' &&
                    Math.abs(new Date().getTime() - this.props.time.getTime()) < thresholdMS
                )
            );
            this.state = {
                relative: useRelative,
                lastTick: new Date()
            };
        }

        render() {
            var text;
            if (this.state.relative) {
                let msBeforeNow = new Date().getTime() - this.props.time.getTime();
                let absRelMs = Math.abs(msBeforeNow);

                let seconds = 1000;
                let minutes = 60 * seconds;
                let hours = 60 * minutes;
                let days = 24 * hours;

                var absRelText;
                if (absRelMs < 10 * seconds) {
                    absRelText = 'a few seconds';
                } else if (absRelMs < minutes) {
                    absRelText = 'less than a minute';
                } else if (absRelMs < 5 * minutes) {
                    absRelText = 'a few minutes';
                } else if (absRelMs < hours) {
                    absRelText = Math.floor(absRelMs / minutes) + ' minutes';
                } else if (absRelMs < 2 * hours) {
                    absRelText = 'an hour or so'
                } else if (absRelMs < 36 * hours) {
                    absRelText = Math.floor(absRelMs / hours) + ' hours';
                } else if (absRelMs < 2 * days) {
                    absRelText = 'one day ' + Math.floor((absRelMs - days) / hours) + ' hours';
                } else {
                    let absDays = Math.floor(absRelMs / days);
                    let absHours = Math.floor((absRelMs - absDays * days) / hours);

                    absRelText = absDays + ' days ' + absHours + ' hours';
                }

                if (msBeforeNow > 0) {
                    text = absRelText + ' ago'
                } else {
                    text = 'in ' + absRelText;
                }
            }else {
                let myFormat = new Intl.DateTimeFormat(
                    'default',
                    {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    });
                text = myFormat.format(this.props.time);
            }

            return React.createElement(
                React.Fragment,
                null,
                text
            );
        }

        componentDidMount() {
            if (this.state.relative) {
                this.interval = setInterval((() => {
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.lastTick = new Date();
                        return newState;
                    });
                }).bind(this), 60000);
            } else {
                this.interval = null;
            }
        }

        componentWillUnmount() {
            if(this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    };

    TextDateTime.propTypes = {
        time: PropTypes.instanceOf(Date).isRequired,
        style: PropTypes.string
    }

    return TextDateTime;
})();
