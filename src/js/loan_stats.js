ReactDOM.render(
    [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'loan_stats'}),
        React.createElement(
            'div',
            {key: 'main', className: 'main'},
            React.createElement(LoanStats)
        ),
        React.createElement(Footer, {key: 'footer'})
    ],
    document.getElementById('content')
);
