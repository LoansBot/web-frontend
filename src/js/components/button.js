const Button = (function() {
    /**
     * A simple button wrapper.
     *
     * @param {string} text The text that is displayed on the button.
     * @param {string} style A style indicator, either 'primary' or
     *   'secondary'. Defaults to 'primary'
     * @param {string} type The type, forwarded directly to the button if
     *   specified. Typically 'submit'
     * @param {function} onClick Called whenever this button is clicked; passed
     *   the click event.
     * @param {function} focus A function which we call with a function which will
     *   rip focus to this button
     * @param {bool} disabled True if this button should be rendered in the
     *   disabled state, false or null otherwise
     */
    class Button extends React.Component {
        constructor(props) {
            super(props);
            this.buttonRef = React.createRef();
        }

        render() {
            return React.createElement(
                'button',
                {
                    ref: this.buttonRef,
                    className: 'button' + (this.props.style ? ` button-${this.props.style}` : ''),
                    type: this.props.type,
                    disabled: !!this.props.disabled
                },
                this.props.text + (this.props.disabled ? ' (disabled)' : '')
            );
        }

        componentDidMount() {
            if(this.props.onClick) {
                this.buttonRef.current.addEventListener('click', (e) => this.props.onClick(e));
            }

            if(this.props.focus) {
                this.props.focus((() => this.buttonRef.current.focus()).bind(this));
            }
        }
    }

    Button.propTypes = {
        text: PropTypes.string.isRequired,
        type: PropTypes.string,
        style: PropTypes.string,
        onClick: PropTypes.func,
        focus: PropTypes.func,
        disabled: PropTypes.bool
    };

    return Button;
})();