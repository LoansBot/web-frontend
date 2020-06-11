const ToggledElement = (() => {
    /**
     * Describes a simple toggled element. The children components are hidden
     * when the element is not checked.
     *
     * @param {string} labelText The text that we put above the checkbox.
     * @param {boolean} initialEnabled True if this element is initially
     *   checked, false if this element is initially unchecked. Defaults to
     *   false.
     * @param {boolean} disabled True if this checkbox is disabled, false if
     *   this element is enabled. Defaults to false.
     * @param {function} enabledQuery If specified we call this function with a
     *   function which returns true if enabled is checked and false otherwise.
     * @param {function} enabledSet If specified we call this function with a
     *   function which accepts one argument: a boolean for if the box should
     *   be checked or not.
     * @param {function} enabledChanged If specified we invoke this function
     *   with the new checked value whenever it changes.
     */
    class ToggledElement extends React.Component {
        constructor(props) {
            super(props);

            this.checkQuery = null;
            this.checkSet = null;
        }

        render() {
            let checked = (this.checkQuery === null ? !!this.props.initialEnabled : this.checkQuery());

            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'checkbox',
                            labelText: this.props.labelText,
                            component: CheckBox,
                            componentArgs: {
                                checked: this.props.initialEnabled,
                                disabled: this.props.disabled,
                                checkedSet: ((setter) => {
                                    this.checkSet = setter;
                                    if (this.props.enabledSet) {
                                        this.props.enabledSet(((val) => {
                                            this.checkSet(val);
                                            this.forceUpdate();
                                        }).bind(this));
                                    }
                                }).bind(this),
                                checkedQuery: ((query) => {
                                    this.checkQuery = query;
                                    if (this.props.enabledQuery) {
                                        this.props.enabledQuery(query);
                                    }
                                }).bind(this),
                                checkedChanged: (() => {
                                    this.forceUpdate();
                                    if (this.props.enabledChanged) {
                                        this.props.enabledChanged();
                                    }
                                }).bind(this)
                            }
                        }
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'children',
                            initialState: this.props.initialEnabled ? 'expanded' : 'closed',
                            desiredState: checked ? 'expanded' : 'closed'
                        },
                        this.props.children
                    )
                ]
            );
        }
    };

    ToggledElement.propTypes = {
        labelText: PropTypes.string,
        initialEnabled: PropTypes.bool,
        disabled: PropTypes.bool,
        enabledQuery: PropTypes.func,
        enabledSet: PropTypes.func,
        enabledChanged: PropTypes.func
    };

    return ToggledElement;
})();