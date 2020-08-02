const FormElement = (function() {
    /**
     * Describes a form element, which is a label associated with a component.
     *
     * @param {string} labelText The text that goes on the label
     * @param {string} description If provided, shown below the element
     * @param {React.Component} component The form component we are wrapping
     *   as a class type.
     * @param {dict} componentArgs The args we pass to the component.
     */
    class FormElement extends React.Component {
        render() {
            let args = !this.props.componentArgs ? {} : Object.assign({}, this.props.componentArgs);
            args.key = 'input';
            return React.createElement(
                'label',
                {className: 'form-label'},
                [
                    React.createElement('span', {key: 'label', className: 'form-label-text'}, this.props.labelText),
                    React.createElement(this.props.component, args, null)
                ].concat(
                    !this.props.description ? [] : [
                        React.createElement(
                            'div',
                            {key: 'description', className: 'form-label-description'},
                            this.props.description
                        )
                    ]
                )
            );
        }
    }

    FormElement.propTypes = {
        labelText: PropTypes.string.isRequired,
        description: PropTypes.string,
        component: PropTypes.object.isRequired,
        componentArgs: PropTypes.object
    };

    return FormElement;
})();
