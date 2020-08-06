ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'log'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(LogFeedWithControlsAndLogic, {
                key: 'logs'
            })
        ]),
        React.createElement(Footer, {key: 'footer'})
    ]),
    document.getElementById('content')
);
