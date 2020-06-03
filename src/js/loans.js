let curTime = new Date().getTime();

ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'loans'}),
        React.createElement('div',
            {key: 'main', className: 'main'},
            React.createElement(
                LoanList,
                {
                    showRefreshButton: true,
                    showSeeMoreButton: true,
                    loanIds: [1, 2, 3, 4, 5, 6]
                }
            )
        )
    ]),
    document.getElementById('content')
);