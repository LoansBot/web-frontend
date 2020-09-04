(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('user_id'));
    const token = urlParams.get('token');

    if (isNaN(userId) || !token || token.trim().length === 0) {
        ReactDOM.render(
            React.createElement(React.Fragment, null, [
                React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'claim'}),
                React.createElement('div', {key: 'main', className: 'main'}, [
                    React.createElement(
                        Alert,
                        {
                            key: 'alert',
                            type: 'error',
                            title: 'Invalid Claim URL'
                        },
                        React.createElement(
                            'p',
                            null,
                            [
                                React.createElement(
                                    React.Fragment,
                                    {key: '1'},
                                    'This page cannot be rendered as specified. You should have gotten a '
                                ),
                                React.createElement(
                                    'a',
                                    {
                                        key: '2',
                                        href: 'https://en.wikipedia.org/wiki/URL'
                                    },
                                    'url'
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '3'},
                                    ' which had a '
                                ),
                                React.createElement(
                                    'a',
                                    {
                                        key: '4',
                                        href: 'https://en.wikipedia.org/wiki/Query_string'
                                    },
                                    'query string'
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '5'},
                                    ' which included the '
                                ),
                                React.createElement(
                                    'a',
                                    {
                                        key: '6',
                                        href: 'https://en.wikipedia.org/wiki/Primary_key'
                                    },
                                    'primary key'
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '7'},
                                    ' of your user '
                                ),
                                React.createElement(
                                    'a',
                                    {
                                        key: '8',
                                        href: 'https://en.wikipedia.org/wiki/Row_(database)'
                                    },
                                    'row'
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '9'},
                                    ' in our '
                                ),
                                React.createElement(
                                    'a',
                                    {
                                        key: '10',
                                        href: 'https://en.wikipedia.org/wiki/Database'
                                    },
                                    'database'
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '11'},
                                    ' alongside a '
                                ),
                                React.createElement(
                                    'a',
                                    {
                                        key: '12',
                                        href: 'https://en.wikipedia.org/wiki/Shared_secret'
                                    },
                                    'shared secret'
                                ),
                                React.createElement(
                                    React.Fragment,
                                    {key: '13'},
                                    ' which proves you control the reddit account.'
                                )
                            ]
                        )
                    )
                ])
            ]),
            document.getElementById('content')
        );
        return;
    }

    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'claim'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    ClaimFormWithLogic,
                    {key: 'claim-form', userId: userId, token: token}
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ]),
        document.getElementById('content')
    );
})();
