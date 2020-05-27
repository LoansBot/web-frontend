let curTime = new Date().getTime();

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
                createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 7)),
                lastRepaidAt: new Date(curTime - 1000 * 60 * 60 * 18)
            }),
            React.createElement(LoanSummary, {
                key: 'loan-b',
                showRefreshButton: true,
                lender: 'foobar',
                borrower: 'barbaz',
                currencyCode: 'EUR',
                principalMinor: 31459,
                principalRepaymentMinor: 31459,
                createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 7)),
                repaidAt: new Date(curTime - 1000 * 60 * 17),
                lastRepaidAt: new Date(curTime - 1000 * 60 * 60 * 18)
            }),
            React.createElement(LoanSummary, {
                key: 'loan-c',
                showRefreshButton: true,
                lender: 'foobar',
                borrower: 'barbaz',
                currencyCode: 'EUR',
                principalMinor: 31459,
                principalRepaymentMinor: 7639,
                createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 7)),
                unpaidAt: new Date(curTime - 1000 * 60 * 60 * 4),
                lastRepaidAt: new Date(curTime - 1000 * 60 * 60 * 18)
            }),
            React.createElement(LoanSummary, {
                key: 'loan-b-no-refresh',
                showRefreshButton: false,
                lender: 'foobar',
                borrower: 'barbaz',
                currencyCode: 'EUR',
                principalMinor: 31459,
                principalRepaymentMinor: 31459,
                createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 7)),
                repaidAt: new Date(curTime - 1000 * 60 * 17),
                lastRepaidAt: new Date(curTime - 1000 * 60 * 60 * 18)
            }),
            React.createElement(LoanDetails, {
                key: 'loan-d',
                showRefreshButton: true,
                loanId: 42069,
                events: [
                    {
                        eventType: 'creation',
                        createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 4 + 3)),
                        creationType: 0,
                        creationPermalink: '#'
                    },
                    {
                        eventType: 'admin',
                        oldPrincipalMinor: 1337,
                        oldPrincipalRepaymentMinor: 0,
                        newPrincipalMinor: 80085,
                        newPrincipalRepaymentMinor: 100,
                        oldCreatedAt: new Date(curTime - 1000 * 60 * 60 * (24 * 4 + 3)),
                        newCreatedAt: new Date(curTime - 1000 * 60 * 60 * (24 * 5 + 22)),
                        oldRepaidAt: null,
                        newRepaidAt: null,
                        oldUnpaidAt: null,
                        newUnpaidAt: null,
                        oldDeletedAt: null,
                        newDeletedAt: null
                    },
                    {
                        eventType: 'unpaid',
                        createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 17)),
                        unpaid: true
                    },
                    {
                        eventType: 'repayment',
                        createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 13)),
                        repaymentMinor: 7734
                    },
                    {
                        eventType: 'unpaid',
                        createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 13) + 1000 * 2),
                        unpaid: false
                    },
                    {
                        eventType: 'admin',
                        oldPrincipalMinor: 80085,
                        oldPrincipalRepaymentMinor: 7834,
                        newPrincipalMinor: 80085,
                        newPrincipalRepaymentMinor: 7734,
                        oldCreatedAt: new Date(curTime - 1000 * 60 * 60 * (24 * 5 + 22)),
                        newCreatedAt: new Date(curTime - 1000 * 60 * 60 * (24 * 5 + 22)),
                        oldRepaidAt: null,
                        newRepaidAt: null,
                        oldUnpaidAt: null,
                        newUnpaidAt: null,
                        oldDeletedAt: null,
                        newDeletedAt: null
                    },
                    {
                        eventType: 'repayment',
                        createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 2)),
                        repaymentMinor: 80085 - 7734
                    }
                ],
                lender: 'fake-1',
                borrower: 'fake-2',
                currencyCode: 'JPY',
                principalMinor: 80085,
                principalRepaymentMinor: 80085,
                createdAt: new Date(curTime - 1000 * 60 * 60 * (24 * 5 + 22)),
                repaidAt: new Date(curTime - 1000 * 60 * 60 * (24 * 2)),
                lastRepaidAt: new Date(curTime - 1000 * 60 * 60 * (24 * 3 + 13))
            })
        ])
    ]),
    document.getElementById('content')
);