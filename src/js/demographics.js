(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get('user_id'));

    let authInfo = AuthHelper.getAuthToken();
    let isSelf = authInfo && (userId === authInfo.userId);
    let currentPage = isSelf ? 'my-demographics' : 'others-demographics';

    ReactDOM.render(
        React.createElement(React.Fragment, null, [
            React.createElement(NavbarLoader, {key: 'navbar', currentPage: currentPage}),
            React.createElement('div', {key: 'main', className: 'main'}, [
                React.createElement(
                    DemographicsShowAjaxAndView,
                    {key: 'user-demos', userId: userId}
                )
            ])
        ]),
        document.getElementById('content')
    );
})();
