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
                    type: this.props.type
                },
                this.props.text
            );
        }

        componentDidMount() {
            if(this.props.onClick) {
                this.buttonRef.current.addEventListener('click', (e) => this.props.onClick(e));
            }
        }
    }

    Button.propTypes = {
        text: PropTypes.string.isRequired,
        type: PropTypes.string,
        style: PropTypes.string,
        onClick: PropTypes.func
    };

    return Button;
})();