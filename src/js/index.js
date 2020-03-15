ReactDOM.render(
    React.createElement(NavBar,
        {
            row: [
                {
                    name: 'Home',
                    ariaLabel: 'Link to main page',
                    current: true,
                    url: '/'
                },
                {
                    name: 'Login',
                    ariaLabel: 'Link to login',
                    url: '/login'
                },
                {
                    name: 'Nested',
                    ariaLabel: 'Testing',
                    row: [
                        {
                            name: 'Item1',
                            ariaLabel: 'Testing item 1',
                            url: '#'
                        },
                        {
                            name: 'Item2',
                            ariaLabel: 'Testing item 2',
                            url: '#'
                        }
                    ]
                },
                {
                    name: 'Needed',
                    ariaLabel: 'Testing 2',
                    url: '/needed'
                }
            ]
        }
    ),
    document.getElementById('content')
);
