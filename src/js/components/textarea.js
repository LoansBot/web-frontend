const TextArea = (function() {
/**
     * A simple multi-line text-input. We support polling the value of the text
     * input and setting the value of the text input.
     *
     * @param {string} text The text to initialize the text input with
     * @param {number} rows The number of rows to initialize the text area with
     * @param {bool} disabled True if editing is disabled, false otherwise
     * @param {function} textQuery A function which we call after mounting
     *   with a function which will return the current text on this text input.
     * @param {function} textSet A function which we call after mounting
     *   with a function which will accept text and set the text of the
     *   input
     * @param {function} textChanged A function which we will call whenever
     *   the text on this input changes. We pass the new value of this input.
     * @param {function} focus A function which we call with a function which
     *   will rip focus to this text area.
     */
    class TextArea extends React.Component {
        constructor(props) {
            super(props);
            this.textareaRef = React.createRef();
            this.renderedText = null;
        }

        render() {
            return React.createElement(
                'textarea',
                {
                    ref: this.textareaRef,
                    className: 'textarea',
                    defaultValue: this.props.text,
                    disabled: this.props.disabled,
                    rows: this.props.rows
                }
            );
        }

        componentDidMount() {
            if (this.props.textQuery) {
                this.props.textQuery((() => this.textareaRef.current.value).bind(this));
            }

            if (this.props.textSet) {
                this.props.textSet(((text) => this.textareaRef.current.value = text.toString()).bind(this));
            }

            if (this.props.textChanged) {
                this.textareaRef.current.addEventListener('input', ((e) => {
                    this.props.textChanged(this.textareaRef.current.value);
                }).bind(this));
            }

            if (this.props.focus) {
                this.props.focus((() => this.textareaRef.current.focus()).bind(this));
            }
        }

        componentDidUpdate() {
            if (this.props.text && this.props.text != this.renderedText) {
                this.textareaRef.current.value = this.props.text;
                this.renderedText = this.props.text;
            }
        }
    }

    TextArea.propTypes = {
        text: PropTypes.string,
        rows: PropTypes.number,
        disabled: PropTypes.bool,
        textQuery: PropTypes.func,
        textSet: PropTypes.func,
        textChanged: PropTypes.func,
        focus: PropTypes.func
    };

    return TextArea;
})();
