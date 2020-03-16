ReactDOM.render(
    React.createElement('div', null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'login'}),
        React.createElement('div', {key: 'login-div', className: 'main'}, 'Hello world!')
    ]),
    document.getElementById('content')
);
