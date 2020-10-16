(function() {
    let urlParams = new URLSearchParams(window.location.search);
    let endpointSlugParam = urlParams.get('slug');

    ReactDOM.render(
        [
            React.createElement(NavbarLoader, {key: 'nav', currentPage: 'endpoints'}),
            React.createElement('div', {key: 'main', className: 'main', style: { marginBottom: '25vh' }}, [
                React.createElement(
                    EndpointSelectFormWithAjaxAndView,
                    {key:'test', slug: endpointSlugParam}
                ),
                React.createElement(
                    PermissionRequired,
                    {key: 'add-endpoint', permissions: ['create-endpoint']},
                    React.createElement(
                        ToggledElement,
                        {
                            labelText: 'Show Add Endpoint Form'
                        },
                        React.createElement(
                            EndpointAddFormWithAjax,
                            {
                                onAdd: ((slug) => window.location = `/endpoints.html?slug=${slug}`)
                            }
                        )
                    )
                )
            ]),
            React.createElement(Footer, {key: 'footer'})
        ],
        document.getElementById('content')
    );
})();
