ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'login'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(LoginFormWithLogic, {
                key: 'login-form'
            })
        ])
    ]),
    document.getElementById('content')
);
