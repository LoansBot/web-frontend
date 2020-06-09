let curTime = new Date().getTime();

ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'loans'}),
        React.createElement('div',
            {key: 'main', className: 'main'},
            React.createElement(LoanFilterFormWithList)
        )
    ]),
    document.getElementById('content')
);