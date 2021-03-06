(function() {
    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'others-demographics'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    DemographicsByUserAjaxAndView,
                    {key: 'user-select'}
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ]),
        document.getElementById('content')
    );
})();
