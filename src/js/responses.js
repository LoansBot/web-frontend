ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'responses'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(ResponsesWidget, {
                key: 'responses'
            })
        ])
    ]),
    document.getElementById('content')
);
