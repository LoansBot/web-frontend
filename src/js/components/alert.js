const Alert = (function() {
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
            this.realHeight = null;
            this.realPaddingTop = null;
            this.realPaddingBottom = null;
            this.realMarginTop = null;
            this.realMarginBottom = null;
            this.realTransition = null;
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
            if (this.realHeight === null) {
                let cs = window.getComputedStyle(this.element.current, null);
                this.realHeight = cs.getPropertyValue('height');
                this.realPaddingTop = cs.getPropertyValue('padding-top');
                this.realPaddingBottom = cs.getPropertyValue('padding-bottom');
                this.realMarginTop = cs.getPropertyValue('margin-top');
                this.realMarginBottom = cs.getPropertyValue('margin-bottom');
                this.realTransition = cs.getPropertyValue("transition");
            }

            this.element.current.style.transition = "none";
            this.element.current.style.maxHeight = "0px";
            this.element.current.style.paddingTop = "0px";
            this.element.current.style.paddingBottom = "0px";
            this.element.current.style.marginTop = "0px";
            this.element.current.style.marginBottom = "0px";
            setTimeout((() => {
                this.element.current.style.transition = this.realTransition;
                this.element.current.style.maxHeight = this.realHeight;
                this.element.current.style.paddingTop = this.realPaddingTop;
                this.element.current.style.paddingBottom = this.realPaddingBottom;
                this.element.current.style.marginTop =  this.realMarginTop;
                this.element.current.style.marginBottom = this.realMarginBottom;
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