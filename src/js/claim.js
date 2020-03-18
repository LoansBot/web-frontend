ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'claim'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(ClaimForm, {key: 'claim-form'})
        ])
    ]),
    document.getElementById('content')
);
