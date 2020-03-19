(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const forgotPasswordVariant = urlParams.get('forgot') === 'true';

    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'signup'}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(SignupFormWithLogic, {
                    key: 'signup-form',
                    forgotVariant: forgotPasswordVariant
                })
            ])
        ]),
        document.getElementById('content')
    );
})();
