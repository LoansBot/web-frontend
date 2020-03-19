const TextInput = (function() {
    /**
     * A simple text-input. We support polling the value of the text input
     * and setting the value of the text input.
     *
     * @param {string} type The type to pass to the input.
     * @param {string} text The text to initialize the text input with
     * @param {function} textQuery A function which we call after mounting
     *   with a function which will return the current text on this text input.
     * @param {function} textSet A function which we call after mounting
     *   with a function which will accept text and set the text of the
     *   input
     * @param {function} textChanged A function which we will call whenever
     *   the text on this input changes. We pass the input event.
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
                this.props.text
            );
        }

        componentDidMount() {
            if (this.props.textQuery) {
                this.props.textQuery((() => this.inputRef.current.value).bind(this));
            }

            if (this.props.textSet) {
                this.props.textSet(((text) => this.inputRef.current.value = text).bind(this));
            }

            if (this.props.textChanged) {
                this.inputRef.current.addEventListener('input', this.props.textChanged);
            }
        }
    }

    TextInput.propTypes = {
        type: PropTypes.string,
        text: PropTypes.string,
        textQuery: PropTypes.func,
        textSet: PropTypes.func,
        textChanged: PropTypes.func
    };

    return TextInput;
})();