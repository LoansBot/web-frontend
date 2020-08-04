(function() {
    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'others-demographics'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    DemographicsByUserAjaxAndView,
                    {key: 'user-select', userId: userId}
                )
            ])
        ]),
        document.getElementById('content')
    );
})();
