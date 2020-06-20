ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'my-account'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            'FooBar'
        ])
    ]),
    document.getElementById('content')
);
