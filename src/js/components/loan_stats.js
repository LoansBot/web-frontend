const [LoanStats] = (function() {
    /**
     * A tiny wrapper around toastui line charts
     *
     * @param {string} containerID A unique id to use for this container
     * @param {string} title The title for this chart
     * @param {string} xAxis The label for the x-axis for this chart
     * @param {string} yAxis The label for the y-axis for this chart
     * @param {object} data The underyling plot data. Has the following keys:
     *   - `categories (list[str])`: The name of each category
     *   - `series (list[object])`: A list of objects with the following keys:
     *      - `name (str)`: The name for this series
     *      - `data (list[float])`: The value with index-correspondence with
     *        categories
     */
    class ToastChart extends React.Component {
        constructor(props) {
            super(props);

            this.containerRef = React.createRef();
            this.chart = null;
        }

        render() {
            return React.createElement(
                'div',
                {id: this.props.containerID, ref: this.containerRef}
            )
        }

        componentDidMount() {
            this.initChart()
        }

        componentDidUpdate() {
            this.chart.destroy()
            this.initChart()
        }

        initChart() {
            this.chart = tui.chart.lineChart(
                this.containerRef.current,
                this.props.data,
                {
                    chart: { title: this.props.title },
                    xAxis: { title: this.props.xAxis },
                    yAxis: { title: this.props.yAxis }
                }
            )
        }
    }

    /**
     * Shows the loan statistics. This consists of a dropdown for selecting the
     * unit (count vs usd) and frequency (monthly vs quarterly) and displaying it
     * as a plot.
     */
    class LoanStats extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                state: 'initializing',
                plot: null,
                unit: 'usd'
            }

            this.getFrequency = null;
            this.getUnit = null;
            this.setAlert = null;

            this.setGetFrequency = this.setGetFrequency.bind(this);
            this.setGetUnit = this.setGetUnit.bind(this);
            this.setSetAlert = this.setSetAlert.bind(this);
            this.updateChart = this.updateChart.bind(this);
        }

        render() {
            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        FormElement,
                        {
                            key: 'frequencies',
                            labelText: 'Frequency'
                        },
                        React.createElement(
                            DropDown,
                            {
                                options: [
                                    {key: 'monthly', text: 'Monthly'},
                                    {key: 'quarterly', text: 'Quarterly'}
                                ],
                                initialOption: 'quarterly',
                                optionQuery: this.setGetFrequency,
                                optionChanged: this.updateChart
                            }
                        )
                    ),
                    React.createElement(
                        FormElement,
                        {
                            key: 'units',
                            labelText: 'Unit'
                        },
                        React.createElement(
                            DropDown,
                            {
                                options: [
                                    {key: 'count', text: 'Count'},
                                    {key: 'usd', text: 'USD Equivalent'}
                                ],
                                initialOption: 'usd',
                                optionQuery: this.setGetUnit,
                                optionChanged: this.updateChart
                            }
                        )
                    ),
                    React.createElement(
                        Alertable,
                        {
                            key: 'chart',
                            alertSet: this.setSetAlert
                        },
                        this.renderChart()
                    )
                ]
            )
        }

        renderChart() {
            if (this.state.state !== 'loaded') {
                return React.createElement(React.Fragment);
            }

            return React.createElement(
                ToastChart,
                this.state.plot
            )
        }

        componentDidMount() {
            this.updateChart();
        }

        updateChart() {
            if (this.state.state === 'loading') {
                return;
            }

            this.setState((state) => {
                let newState = Object.assign({}, state);
                newState.state = 'loading';
                return newState;
            });

            let handled = false;
            api_fetch(
                `/api/loans/stats/${this.getUnit()}/${this.getFrequency()}`,
                AuthHelper.auth()
            ).then((resp) => {
                if (!resp.ok) {
                    handled = true;
                    this.setState((state) => {
                        let newState = Object.assign({}, state);
                        newState.state = 'errored';
                        return newState;
                    });
                    AlertHelper.createFromResponse('fetch stats', resp).then(this.setAlert);
                    return;
                }

                return resp.json();
            }).then((json) => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'loaded';
                    newState.plot = {
                        containerID: 'loans-stats',
                        title: json.title,
                        xAxis: json.xAxis,
                        yAxis: json.yAxis,
                        data: json.data
                    };
                    return newState;
                });
            }).catch(() => {
                if (handled) { return; }

                handled = true;
                this.setState((state) => {
                    let newState = Object.assign({}, state);
                    newState.state = 'errored';
                    return newState;
                });
                this.setAlert(AlertHelper.createFetchError());
            })
        }

        setGetFrequency(gtr) {
            this.getFrequency = gtr;
        }

        setGetUnit(gtr) {
            this.getUnit = gtr;
        }

        setSetAlert(str) {
            this.setAlert = str;
        }
    };

    return [LoanStats]
})();
