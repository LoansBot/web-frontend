(function() {
    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'others-settings'}),
            React.createElement(
                'div',
                {key: 'main', className: 'main'},
                React.createElement(UserSelectFormWithAjaxAndView)
            ),
            React.createElement(Footer, {key: 'footer'})
        ]),
        document.getElementById('content')
    );
})();
