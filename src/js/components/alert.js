const Alert = (function() {
    let SIZE_PROPS = [
        ['transition', 'transition'],
        ['height', 'height'],
        ['padding-top', 'paddingTop'],
        ['padding-bottom', 'paddingBottom'],
        ['margin-top', 'marginTop'],
        ['margin-bottom', 'marginBottom']
    ];

    /**
     * A simple error component. Displays a message.
     * @param title The title for the component
     * @param type One of 'success', 'info', and 'error'
     * @param text The text that is displayed
     */
    class Alert extends React.Component {
        constructor(props) {
            super(props);
            this.element = React.createRef();
            this.computedText = null;
            this.realProps = null;
        }

        render() {
            return React.createElement(
                'div',
                {ref: this.element, role: 'alert', className: `alert-${this.props.type}`},
                [
                    React.createElement(
                        'span',
                        {key: 'title', className: 'alert-title'},
                        this.props.title
                    ),
                    React.createElement(
                        'div',
                        {key: 'body', className: 'alert-body'},
                        this.props.text
                    )
                ]
            );
        }

        componentDidMount() {
            let cs = window.getComputedStyle(this.element.current, null);
            this.realProps = {};
            for(var i = 0; i < SIZE_PROPS.length; i++) {
                this.realProps[SIZE_PROPS[i][0]] = cs.getPropertyValue(SIZE_PROPS[i][0]);
            }
            this.computedText = this.props.text;

            this.element.current.style.transition = "none";
            this.element.current.style.maxHeight = "0px";
            this.element.current.style.paddingTop = "0px";
            this.element.current.style.paddingBottom = "0px";
            this.element.current.style.marginTop = "0px";
            this.element.current.style.marginBottom = "0px";
            setTimeout((() => {
                for(var i = 0; i < SIZE_PROPS.length; i++) {
                    this.element.current.style[SIZE_PROPS[i][1]] = this.realProps[SIZE_PROPS[i][0]];
                }
                this.element.current.style.maxHeight = this.realProps['height'];
            }).bind(this), 10);
        }

        componentDidUpdate() {
            if (this.computedText === this.props.text) {
                return;
            }

            let oldProps = this.realProps;
            for(var i = 0; i < SIZE_PROPS.length; i++) {
                this.element.current.style[SIZE_PROPS[i][1]] = null;
            }
            this.element.current.style.transition = "none";
            this.element.current.style.maxHeight = null;

            let cs = window.getComputedStyle(this.element.current, null);
            this.realProps = {};
            for(var i = 0; i < SIZE_PROPS.length; i++) {
                this.realProps[SIZE_PROPS[i][0]] = cs.getPropertyValue(SIZE_PROPS[i][0]);
            }
            this.realProps['transition'] = oldProps['transition'];
            this.computedText = this.props.text;

            for(var i = 0; i < SIZE_PROPS.length; i++) {
                this.element.current.style[SIZE_PROPS[i][1]] = oldProps[SIZE_PROPS[i][0]];
            }
            this.element.current.style.maxHeight = oldProps['height'];

            setTimeout((() => {
                for(var i = 0; i < SIZE_PROPS.length; i++) {
                    this.element.current.style[SIZE_PROPS[i][1]] = this.realProps[SIZE_PROPS[i][0]];
                }
                this.element.current.style.maxHeight = this.realProps['height'];
            }).bind(this), 10);
        }
    }

    Alert.propTypes = {
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    };

    return Alert;
})();