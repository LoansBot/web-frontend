const TextInput = (function() {
    /**
     * A simple text-input. We support polling the value of the text input
     * and setting the value of the text input.
     *
     * @param {string} type The type to pass to the input.
     * @param {function} textQuery A function which we call after mounting
     *   with a function which will return the current text on this text input.
     * @param {function} textSet A function which we call after mounting
     *   with a function which will accept text and set the text of the
     *   input
     */
    class TextInput extends React.Component {
        constructor(props) {
            super(props);
            this.inputRef = React.createRef();
        }

        render() {
            return React.createElement(
                'input',
                {
                    type: this.props.type || 'text', ref: this.inputRef,
                    className: 'text-input'
                },
                null
            );
        }

        componentDidMount() {
            if (this.props.textQuery) {
                this.props.textQuery((() => this.inputRef.current.value).bind(this));
            }

            if (this.props.textSet) {
                this.props.textSet(((text) => this.inputRef.current.value = text).bind(this));
            }
        }
    }

    TextInput.propTypes = {
        type: PropTypes.string,
        textQuery: PropTypes.func,
        textSet: PropTypes.func
    };

    return TextInput;
})();