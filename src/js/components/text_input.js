const TextInput = (function() {
    /**
     * A simple text-input. We support polling the value of the text input
     * and setting the value of the text input. If this has type "number" we
     * coerce the types to numbers.
     *
     * @param {string} type The type to pass to the input.
     * @param {string} text The text to initialize the text input with
     * @param {number} min If the type is number, this is the minimum input
     * @param {number} max If the type is number, this is the maximum input
     * @param {number} step If the type is number, this is the step amount
     * @param {function} textQuery A function which we call after mounting
     *   with a function which will return the current text on this text input.
     * @param {function} textSet A function which we call after mounting
     *   with a function which will accept text and set the text of the
     *   input
     * @param {function} textChanged A function which we will call whenever
     *   the text on this input changes. We pass the new value of this input.
     * @param {function} focus A function which we will call with a function
     *   which focuses this text input
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
                    min: this.props.min, max: this.props.max, step: this.props.step,
                    className: 'text-input',
                    defaultValue: this.props.text
                }
            );
        }

        componentDidMount() {
            if(this.props.textQuery) {
                this.props.textQuery((() => this.getValue()).bind(this));
            }

            if(this.props.textSet) {
                this.props.textSet(((text) => {
                    this.inputRef.current.value = text === null ? '' : text.toString();
                }).bind(this));
            }

            if(this.props.textChanged) {
                this.inputRef.current.addEventListener('input', ((e) => {
                    this.props.textChanged(this.getValue());
                }).bind(this));
            }

            if(this.props.focus) {
                this.props.focus((() => this.inputRef.current.focus()).bind(this));
            }
        }

        getValue() {
            let val = this.inputRef.current.value;
            if(this.props.type == 'number') {
                if (val === '') {
                    return null;
                }
                return parseFloat(val);
            }
            return val;
        }
    }

    TextInput.propTypes = {
        type: PropTypes.string,
        text: PropTypes.string,
        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.number,
        textQuery: PropTypes.func,
        textSet: PropTypes.func,
        textChanged: PropTypes.func
    };

    return TextInput;
})();