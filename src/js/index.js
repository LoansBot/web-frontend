ReactDOM.render(
    [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'home'}),
        React.createElement(
            'div',
            {key: 'main', className: 'main'},
            React.createElement(Index)
        ),
        React.createElement(Footer, {key: 'footer'})
    ],
    document.getElementById('content')
);
