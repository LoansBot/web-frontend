const FormElement = (function() {
    /**
     * Describes a form element, which is a label associated with a component.
     *
     * @param {string} labelText The text that goes on the label
     * @param {React.Component} component The form component we are wrapping
     *   as a class type.
     * @param {dict} componentArgs The args we pass to the component.
     */
    class FormElement extends React.Component {
        render() {
            let args = this.props.componentArgs || {};
            args.key = 'input';
            return React.createElement('label', {className: 'form-label'}, [
                React.createElement('span', {key: 'label', className: 'form-label-text'}, this.props.labelText),
                React.createElement(this.props.component, args, null)
            ])
        }
    }

    FormElement.propTypes = {
        labelText: PropTypes.string.isRequired,
        component: PropTypes.object.isRequired,
        componentArgs: PropTypes.object
    };

    return FormElement;
})();