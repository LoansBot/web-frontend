ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'log'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(
                'h1',
                {key: 'header'},
                'Rechecks'
            ),
            React.createElement(
                'p',
                {key: 'p1'},
                'This page allows you to request that the LoansBot inspect a comment '
                + 'as if it has never seen it before. If the comment contains a valid '
                + 'summon then this will cause the LoansBot to respond to it.'
            ),
            React.createElement(
                'p',
                {key: 'p2'},
                'In order for the LoansBot to find the comment, it needs to know the '
                + '"fullname" for both the comment and the thread it resides in. The '
                + 'easiest way to determine these is from the permalink for the comment. '
                + 'Using old reddit (enabled on reddit.com by going to "preferences" at '
                + 'the top-right, then under the bottom make sure the checkbox '
                + '"Use new Reddit as my default experience" is unchecked), there will '
                + 'be a "permalink" option under each comment. Click that and copy the '
                + 'URL it takes you to (or just right click then Copy Link Address) '
                + 'and paste that URL under "Comment Permalink" below to have the other '
                + 'fields autocompleted.'
            ),
            React.createElement(RecheckHelperAndToolWithAjax, {
                key: 'recheck-tool'
            }),
            React.createElement('div',
                {key: 'padding', style: { height: '35vh' }}
            ),
            React.createElement(Footer, {key: 'footer'})
        ])
    ]),
    document.getElementById('content')
);
