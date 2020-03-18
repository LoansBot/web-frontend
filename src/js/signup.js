ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'signup'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(SignupFormWithLogic, {key: 'signup-form'})
        ])
    ]),
    document.getElementById('content')
);
