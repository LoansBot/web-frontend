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
                    UserComment,
                    {
                        key: 'test',
                        author: 'Tjstretchalot',
                        target: 'FoxK56',
                        comment: '# This is a test\n\n ```js\nvar foo = {};\n```\n',
                        editable: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        onEdit: ((txt) => {
                            console.log(txt);
                        })
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
