const Alertable = (() => {
    /**
     * Describes something which can specify an alert which is eased in when
     * displayed and eased out when no longer relevant. The child is the
     * alertable object.
     *
     * @param {func} alertSet A function we call with a function that accepts
     *   either a React component or null. If passed with a React component it
     *   becomes the alert for this alertable and the alert becomes visible. If
     *   passed null/undefined the alert becomes hidden.
     */
    class Alertable extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: React.createElement(
                    Alert,
                    {type: 'info', title: 'info', text: 'info'}
                ),
                alertVisible: false
            }

            this.setAlert = this.setAlert.bind(this);
        };

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        React.Fragment,
                        {key: 'children'},
                        this.props.children
                    ),
                    React.createElement(
                        SmartHeightEased,
                        {
                            key: 'alert',
                            initialState: 'closed',
                            desiredState: this.state.alertVisible ? 'expanded' : 'closed'
                        },
                        this.state.alert
                    )
                ]
            );
        }

        componentDidMount() {
            if (this.props.alertSet) {
                this.props.alertSet(this.setAlert);
            }
        }

        setAlert(alert) {
            if (alert === null || alert === undefined) {
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.alertVisible = false;
                    return newState;
                });
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.alertVisible = true;
                newState.alert = alert;
                return newState;
            })
        }
    }

    Alertable.propTypes = {
        alertSet: PropTypes.func
    };

    return Alertable;
})();
