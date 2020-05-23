const Money = (function() {
    /**
     * Formats a money amount which may be in an arbitrary currency. This
     * accepts the amount in the currencies most granular unit which avoids
     * most rounding issues, but requires a bit more effort to format.
     *
     * @param {string} currencyCode The ISO 4217 currency code that the money
     *   is provided in. If specified then we will attempt to format using the
     *   browser. We will fallback to the explicit symbol information.
     * @param {string} currencySymbol The fallback symbol to use for this
     *   currency if the currency code is not available or we could not
     *   determine the currency symbol using the code.
     * @param {string} currencySymbolOnLeft True if the currency symbol should
     *   go on the left, false if it should go on the right. This is only used
     *   if for whatever reason we can't format using the browser.
     * @param {number} currencyExponent The exponent on the currency. This will
     *   be used if available as it's necessary to use the browser formatting,
     *   but if unavailable we will try to guess it from how the currency is
     *   converted by the browser.
     * @param {number} minor The amount of the minor unit in this currency.
     */
    class Money extends React.Component {
        constructor(props) {
            super(props);

            var major;
            if (typeof(this.props.currencyExponent) === 'number') {
                major = this.props.minor * Math.pow(10, -this.props.currencyExponent);
            } else if (typeof(this.props.currencyCode) === 'string') {
                let zero = 0;
                let formattedZero = zero.toLocaleString('default', {style: 'currency', currency: this.props.currencyCode});
                let mtch = formattedZero.match(/\.(0+)/g);
                if (!mtch) {
                    major = this.props.minor;
                } else {
                    let realExp = mtch[0].length - 1;
                    major = this.props.minor * Math.pow(10, -realExp);
                }
            } else {
                major = this.props.minor * 0.01;
            }

            var formatted;
            if (this.props.currencyCode) {
                formatted = major.toLocaleString('default', {style: 'currency', currency: this.props.currencyCode});
            } else if (typeof(this.props.currencySymbol) !== 'number') {
                formatted = major.toLocaleString('default', {style: 'currency', currency: 'USD'})
            } else if (typeof(this.props.currencySymbolOnLeft) !== 'boolean' || this.props.currencySymbolOnLeft) {
                formatted = this.props.currencySymbol + major.toFixed(2);
            } else {
                formatted = major.toFixed(2) + this.props.currencySymbol;
            }

            this.state = {
                text: formatted
            };
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                this.state.text
            )
        }
    };

    Money.propTypes = {
        currencyCode: PropTypes.string,
        currencySymbol: PropTypes.string,
        currencySymbolOnLeft: PropTypes.bool,
        currencyExponent: PropTypes.number,
        minor: PropTypes.number.isRequired
    };

    return Money;
})();