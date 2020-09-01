(function() {
    let authInfo = AuthHelper.getAuthToken();

    if (!authInfo) {
        window.location.href = '/';
        return;
    }

    ReactDOM.render(
        [
            React.createElement(NavbarLoader, {key: 'nav', currentPage: 'trust-queue'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    UserTrustNextQueueItemAjax,
                    {key: 'trust-queue'}
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ],
        document.getElementById('content')
    );
})();
