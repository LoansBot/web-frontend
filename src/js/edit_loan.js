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
                    {key: 'edit'},
                    React.createElement(EditLoanFormWithLogic, {loanId: loanId})
                )
            ])
        ],
        document.getElementById('content')
    );
})();
