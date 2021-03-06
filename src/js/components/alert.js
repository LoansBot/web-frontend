const Alert = (function() {

    /**
     * A simple error component. Displays a message.
     * @param {string} title The title for the component
     * @param {string} type One of 'success', 'info', 'warning', and 'error'
     * @param {string} text The text that is displayed. The children will be used
     *   instead if provided.
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
                        this.props.children && (() => {
                            if (typeof(this.props.children) === 'string') {
                                return React.createElement('p', null, this.props.children);
                            }
                            return this.props.children;
                        })() || React.createElement('p', null, this.props.text)
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
