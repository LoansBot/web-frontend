(function() {
    let authInfo = AuthHelper.getAuthToken();

    if (!authInfo) {
        window.location.href = '/';
        return;
    }

    ReactDOM.render(
        [
            React.createElement(NavbarLoader, {key: 'nav', currentPage: 'trusts'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    UserTrustViewWithAjax,
                    {
                        key: 'trust',
                        userId: 10
                    }
                ),
                React.createElement(
                    UserTrustControlsWithAjax,
                    {
                        key: 'test-controls',
                        targetUserId: 10
                    }
                ),
                React.createElement(
                    UserCommentsOnUserAndPostCommentWithAjax,
                    {
                        key: 'comments',
                        targetUserId: 10
                    }
                ),

                React.createElement(
                    PermissionRequired,
                    {key: 'lookup', permissions: ['view-others-trust']},
                    React.createElement(UserTrustLookupWithAjax)
                ),
                React.createElement(
                    PermissionRequired,
                    {
                        key: 'self',
                        permissions: ['view-others-trust'],
                        invert: true
                    },
                    React.createElement(
                        UserTrustViewWithAjax,
                        {key: 'self-trust', userId: authInfo.userId}
                    )
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ],
        document.getElementById('content')
    );
})();
