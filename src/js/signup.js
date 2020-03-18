ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'signup'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(SignupForm, {key: 'signup-form'})
        ])
    ]),
    document.getElementById('content')
);
