(function() {
    let urlParams = new URLSearchParams(window.location.search);
    let loanIdParam = urlParams.get('id');
    if (loanIdParam === null || loanIdParam === undefined) {
        window.location.replace('/loans.html');
        return;
    }

    let loanId = parseInt(loanIdParam);
    if (isNaN(loanId)) {
        window.location.replace('/loans.html');
        return;
    }

    ReactDOM.render(
        [
            React.createElement(NavbarLoader, {key: 'nav', currentPage: 'loans'}),
            React.createElement('div', {key: 'main', className: 'main', style: { marginBottom: '25vh' }}, [
                React.createElement(LoanDetailsAjax, {key: 'details', loanId: loanId}),
                React.createElement(
                    PermissionRequired,
                    {key: 'edit', permissions: ['edit_loans']},
                    React.createElement(EditLoanFormWithLogic, {loanId: loanId})
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ],
        document.getElementById('content')
    );
})();
