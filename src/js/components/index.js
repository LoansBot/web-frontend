const [Index] = (function() {
    /**
     * The title of this page
     */
    class Title extends React.Component {
        render() {
            return React.createElement(
                'h1',
                null,
                'RedditLoans'
            );
        }
    }

    /**
     * Describes a summary section, which is a short blurb of text at the top
     * of the page just below the title.
     */
    class Summary extends React.Component {
        render() {
            return React.createElement(
                'section',
                null,
                [
                    React.createElement(
                        'h2',
                        {key: 'subtitle'},
                        'Summary'
                    ),
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'This website supplements the '
                            ),
                            React.createElement(
                                'a',
                                {key: '2', href: 'https://reddit.com/r/borrow'},
                                '/r/borrow'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                ' community, which facilitates peer-to-peer loans between ' +
                                'Reddit users. Only users with a minimum level of cumulative '
                            ),
                            React.createElement(
                                'a',
                                {key: '4', href: "https://reddit.zendesk.com/hc/en-us/articles/204511829-What-is-karma-"},
                                'karma'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                ' and account age are eligible to join the community. Those seeking loans ' +
                                'post publicly on the subreddit and those willing to fulfill loans respond. ' +
                                'The two negotiate privately, and if an agreement is reached the '
                            ),
                            React.createElement(
                                'a',
                                {key: '6', href: 'https://www.investopedia.com/terms/p/principal.asp'},
                                'principal'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '7'},
                                ' is shared publicly via a carefully formatted comment on the thread.'
                            )
                        ]
                    ),
                    React.createElement(
                        'p',
                        {key: 'p2'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'Later, when the borrower repays partially or completely, that is then also ' +
                                'shared publicly via another carefully formatted comment. Note that interest ' +
                                'is never publicly disclosed. If the borrower does not repay within time, the ' +
                                'lender may disclose that as well, again via a comment. This LoansBot detects these ' +
                                'comments and indexes them for searching. It also adds a variety of administrative ' +
                                'tools to help maintain a healthy community.'
                            )
                        ]
                    )
                ]
            )
        }
    }

    /**
     * Describes one of the cards on this page. The children are placed in the
     * body of the card. These focus cards explain the purpose of this website.
     *
     * @param {React.Component} title The title component for the card. May be
     *   a list of components instead. May also be a string for default formatting.
     * @param {React.Component} children The body components for the card. May
     *   also be a string to just get wrapped in a paragraph.
     */
    class FocusCard extends React.Component {
        render() {
            return React.createElement(
                'div',
                {className: 'index-focus-card'},
                [
                    React.createElement(
                        'h2',
                        {key: 'title'},
                        this.props.title
                    ),
                    React.createElement(
                        'div',
                        {key: 'body', className: 'card-body'},
                        this.props.children
                    )
                ]
            );
        }
    };

    FocusCard.propTypes = {
        title: PropTypes.instanceOf(React.Component),
        body: PropTypes.instanceOf(React.Component)
    };

    class MobileFriendlyFocusCard extends React.Component {
        render() {
            return React.createElement(
                FocusCard,
                {
                    title: 'Mobile Friendly'
                },
                [
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        'This website uses an aggressively simple design which is ' +
                        'naturally friendly to small screens and mobile devices. This ' +
                        'simplicity also means that this website is friendly to keyboard-only ' +
                        'users and every form of color-blindness. No ads, no third-party ' +
                        'tracking, and ubiquitous cache-control headers save battery life and ' +
                        'bandwidth.'
                    )
                ]
            )
        }
    };

    class OpenSourceFocusCard extends React.Component {
        render() {
            return React.createElement(
                FocusCard,
                {
                    title: 'Open Source'
                },
                [
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        'The LoansBot has always been open-source, and has always consisted ' +
                        'of at least two custom parts - a service for monitoring the ' +
                        'subreddit and a service for serving the website. The subreddit ' +
                        'monitoring part is generally referred to as the LoansBot as it contains ' +
                        'most of the business logic, whereas the site is referred to as the ' +
                        'LoansBot Site.'
                    ),
                    React.createElement(
                        'p',
                        {key: 'p2'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'In the first and second iterations of the source code powering ' +
                                'the LoansBot and the LoansBot Site, the LoansBot was written in '
                            ),
                            React.createElement(
                                'a',
                                {key: '2', href: 'https://go.java/'},
                                'Java'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                ' and the LoansBot Site was written in '
                            ),
                            React.createElement(
                                'a',
                                {key: '4', href: 'https://www.php.net/' },
                                'PHP'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                '. Everything ran on a single server, including the '
                            ),
                            React.createElement(
                                'a',
                                {key: '6', href: 'https://www.mysql.com/'},
                                'MySQL'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '7'},
                                ' database containing all of tracked and indexed loans. The first ' +
                                'iteration powered the bot from early 2013 through late 2014, and ' +
                                'the second iteration ('
                            ),
                            React.createElement(
                                'a',
                                {key: '8', href: 'https://github.com/Tjstretchalot/LoansBot'},
                                'LoansBot'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '9'},
                                ', '
                            ),
                            React.createElement(
                                'a',
                                {key: '10', href: 'https://github.com/Tjstretchalot/LoansBot-Site-New'},
                                'Site'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '11'},
                                ') through late 2020.'
                            )
                        ]
                    ),
                    React.createElement(
                        'p',
                        {key: 'p3'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'The third iteration of the website transitioned to a ' +
                                'multi-server architecture to handle the steadily increasing ' +
                                'load and corresponding increases to funding and business logic ' +
                                'complexity. The collection of repositories is available under the ' +
                                'GitHub organization '
                            ),
                            React.createElement(
                                'a',
                                {key: '2', href: 'https://github.com/LoansBot'},
                                'LoansBot'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                '. It is powered by '
                            ),
                            React.createElement(
                                'a',
                                {key: '4', href: "https://www.python.org/"},
                                'Python'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                ' for both the LoansBot and the LoansBot Site, and uses '
                            ),
                            React.createElement(
                                'a',
                                {key: '6', href: 'https://www.postgresql.org/'},
                                'PostgreSQL'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '7'},
                                ' as the database.'
                            )
                        ]
                    )
                ]
            )
        }
    };

    class StableFocusCard extends React.Component {
        render() {
            return React.createElement(
                FocusCard,
                {
                    title: 'Stable'
                },
                [
                    React.createElement(
                        'p',
                        {key: 'p1'},
                        'The LoansBot has been around since 2013 with continuous ' +
                        'community support and engagement. Although there have been periods ' +
                        'of only maintenance, during those times the LoansBot infrastructure ' +
                        'continued to be monitored and support was rapidly available. The LoansBot ' +
                        'has backed the database up regularly since 2014 and currently stores backups ' +
                        'for 372 days.'
                    ),
                    React.createElement(
                        'p',
                        {key: 'p2'},
                        'The LoansBot runs on an extremely robust infrastructure which is likely to ' +
                        'be around 10 years from now and can scale to meet our needs, both upward and ' +
                        'downward:'
                    ),
                    React.createElement(
                        'ul',
                        {key: 'p3'},
                        [
                            React.createElement(
                                'li',
                                {key: 'i0'},
                                React.createElement(
                                    'a',
                                    {href: 'https://aws.amazon.com/ec2/'},
                                    'Amazon EC2'
                                )
                            ),
                            React.createElement(
                                'li',
                                {key: 'i4'},
                                React.createElement(
                                    'a',
                                    {href: 'https://aws.amazon.com/s3/'},
                                    'Amazon S3'
                                )
                            ),
                            React.createElement(
                                'li',
                                {key: 'i1'},
                                [
                                    React.createElement(
                                        'a',
                                        {key: '1', href: 'https://www.postgresql.org/'},
                                        'PostgreSQL'
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: '2'},
                                        ' (Open Source)'
                                    )
                                ]
                            ),
                            React.createElement(
                                'li',
                                {key: 'i2'},
                                [
                                    React.createElement(
                                        'a',
                                        {key: '1', href: 'https://memcached.org/'},
                                        'Memcached'
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: '2'},
                                        ' (Open Source)'
                                    )
                                ]
                            ),
                            React.createElement(
                                'li',
                                {key: 'i3'},
                                [
                                    React.createElement(
                                        'a',
                                        {key: '1', href: 'https://www.rabbitmq.com/'},
                                        'RabbitMQ'
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: '2'},
                                        ' (Open Source)'
                                    )
                                ]
                            )
                        ]
                    ),
                    React.createElement(
                        'p',
                        {key: 'p4'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'The LoansBot is wary of the bleeding edge but has evolved as industry ' +
                                'standards change. For example, with the advent of log structured ' +
                                'key value stores, notably ',
                            ),
                            React.createElement(
                                'a',
                                {key: '2', href: 'https://rocksdb.org/'},
                                'RocksDB'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                ', a solution for efficiently using disk space has started to be incorporated ' +
                                'into the community. The LoansBot uses '
                            ),
                            React.createElement(
                                'a',
                                {key: '4', href: 'https://www.arangodb.com/'},
                                'ArangoDB'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                ' as its interface into this underlying algorithm. Log-structured engines ' +
                                'are particularly well-suited for pure key-value stores in memory-starved ' +
                                'contexts, filling a niche not served by traditional databases or caches, ' +
                                'and hence that is precisely what the LoansBot uses it for.'
                            )
                        ]
                    ),
                    React.createElement(
                        'p',
                        {key: 'p5'},
                        'For completeness sake, these are the critical dependencies for the Site, excluding ' +
                        'those already listed:'
                    ),
                    React.createElement(
                        'ul',
                        {key: 'p6'},
                        [
                            React.createElement(
                                'li',
                                {key: '1'},
                                [
                                    React.createElement(
                                        'a',
                                        {key: '1', href: 'https://www.nginx.com/'},
                                        'Nginx'
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: '2'},
                                        ' (Open Source)'
                                    )
                                ]
                            ),
                            React.createElement(
                                'li',
                                {key: '2'},
                                [
                                    React.createElement(
                                        'a',
                                        {key: '1', href: 'https://fastapi.tiangolo.com/'},
                                        'FastAPI'
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: '2'},
                                        ' (Open Source)'
                                    )
                                ]
                            ),
                            React.createElement(
                                'li',
                                {key: '3'},
                                [
                                    React.createElement(
                                        'a',
                                        {key: '1', href: 'https://reactjs.org/'},
                                        'React'
                                    ),
                                    React.createElement(
                                        React.Fragment,
                                        {key: '2'},
                                        ' (Open Source)'
                                    )
                                ]
                            ),
                            React.createElement(
                                'li',
                                {key: '4'},
                                React.createElement(
                                    'a',
                                    {href: 'https://www.hcaptcha.com/'},
                                    'hCaptcha'
                                )
                            )
                        ]
                    ),
                    React.createElement(
                        'p',
                        {key: 'p7'},
                        [
                            React.createElement(
                                React.Fragment,
                                {key: '1'},
                                'Note that '
                            ),
                            React.createElement(
                                'a',
                                {key: '2', href: 'https://nodejs.org/en/'},
                                'NodeJS'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '3'},
                                ' and build tools like '
                            ),
                            React.createElement(
                                'a',
                                {key: '4', href: 'https://webpack.js.org/'},
                                'webpack'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '5'},
                                ' are not part of this list. The NodeJS community has a track ' +
                                'record of constant breaking changes and absurdly slow build ' +
                                'times. These things can easily kill an open-source project. ' +
                                'Instead, a particular version of React is referenced from ' +
                                'a '
                            ),
                            React.createElement(
                                'a',
                                {key: '6', href: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/'},
                                'CDN'
                            ),
                            React.createElement(
                                React.Fragment,
                                {key: '7'},
                                '. The entire frontend requires no preprocessing and is served statically.'
                            )
                        ]
                    )
                ]
            )
        }
    };


    /**
     * Handles rendering the home page body section.
     */
    class Index extends React.Component {
        render() {
            return [
                React.createElement(Title, {key: 'title'}),
                React.createElement(Summary, {key: 'summary'}),
                React.createElement(OpenSourceFocusCard, {key: 'open-source'}),
                React.createElement(StableFocusCard, {key: 'stable'}),
                React.createElement(MobileFriendlyFocusCard, {key: 'mobile-friendly'})
            ];
        }
    };

    return [Index];
})();
