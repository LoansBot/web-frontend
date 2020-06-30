const [Spinner, CenteredSpinner] = (function() {
    /**
     * A simple spinner from loading.io
     */
    class Spinner extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'lds-roller'},
                [1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                    return React.createElement('div', {key: `roller-${i}`});
                })
            )
        }
    }

    class CenteredSpinner extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'standard-spinner-wrapper'},
                Spinner
            );
        }
    }

    return [Spinner, CenteredSpinner];
})();
