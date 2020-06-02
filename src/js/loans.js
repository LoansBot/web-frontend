let curTime = new Date().getTime();

ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'loans'}),
        React.createElement('div',
            {key: 'main', className: 'main'},
            [1, 2, 3, 4, 5, 6].map((i) => {
                return React.createElement(LoanSummaryWithClickToDetails, { loanId: i, key: `loan-${i}` })
            })
        )
    ]),
    document.getElementById('content')
);