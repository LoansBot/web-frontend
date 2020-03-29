const Alert = (function() {

    /**
     * A simple error component. Displays a message.
     * @param title The title for the component
     * @param type One of 'success', 'info', and 'error'
     * @param text The text that is displayed
     */
    class Alert extends React.Component {
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
    }

    Alert.propTypes = {
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
    };

    return Alert;
})();