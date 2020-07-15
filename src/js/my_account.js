(function() {
    if (!AuthHelper.isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }

    let token = AuthHelper.getAuthToken();

    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'my-account'}),
            React.createElement(
                'div',
                {key: 'main', className: 'main'},
                React.createElement(UserAjax, {
                    userId: token.userId
                })
            )
        ]),
        document.getElementById('content')
    );
})();
