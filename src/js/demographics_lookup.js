(function() {
    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'demographics-lookup'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    DemographicsLookupAjaxAndView,
                    {key: 'user-demos'}
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ]),
        document.getElementById('content')
    );
})();
