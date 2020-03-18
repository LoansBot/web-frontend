(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('user_id'));
    const token = urlParams.get('token');
    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'claim'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    ClaimFormWithLogic,
                    {key: 'claim-form', userId: userId, token: token}
                )
            ])
        ]),
        document.getElementById('content')
    );
})();
