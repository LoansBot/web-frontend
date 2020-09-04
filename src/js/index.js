ReactDOM.render(
    [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'home'}),
        React.createElement(Footer, {key: 'footer'})
    ],
    document.getElementById('content')
);
