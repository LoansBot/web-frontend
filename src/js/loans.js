ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'loans'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(LoanSummary, {
                key: 'loan-a',
                showRefreshButton: true,
                lender: 'foobar',
                borrower: 'barbaz',
                currencyCode: 'EUR',
                principalMinor: 31400,
                principalRepaymentMinor: 7639,
                createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * (24 * 3 + 7)),
                lastRepaidAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 18)
            }),
            React.createElement(LoanSummary, {
                key: 'loan-b',
                showRefreshButton: true,
                lender: 'foobar',
                borrower: 'barbaz',
                currencyCode: 'EUR',
                principalMinor: 31459,
                principalRepaymentMinor: 31459,
                createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * (24 * 3 + 7)),
                repaidAt: new Date(new Date().getTime() - 1000 * 60 * 17),
                lastRepaidAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 18)
            }),
            React.createElement(LoanSummary, {
                key: 'loan-c',
                showRefreshButton: true,
                lender: 'foobar',
                borrower: 'barbaz',
                currencyCode: 'EUR',
                principalMinor: 31459,
                principalRepaymentMinor: 7639,
                createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * (24 * 3 + 7)),
                unpaidAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 4),
                lastRepaidAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 18)
            })
        ])
    ]),
    document.getElementById('content')
);