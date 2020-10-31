const [Footer] = (() => {
    /**
     * The footer displayed at the bottom of the page. We make it somewhat difficult
     * to scrape this information if you're not specifically targetting our site, to
     * reduce the amount of spam mail.
     */
    class Footer extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                hidden: window.scrollY !== 0
            }

            this.wasHidden = this.state.hidden;
            this.onScroll = this.onScroll.bind(this);
        }

        render() {
            let contactInfo = [87,114,105,116,116,101,110,32,98,121,32,84,105,109,111,116,104,121,32,77,111,111,114,101,32,40,47,117,47,84,106,115,116,114,101,116,99,104,97,108,111,116,41]

            let elements = [];
            for(let ch of contactInfo) {
                let numberOfFake = parseInt(Math.random() * 3);
                for(let i = 0; i < numberOfFake; i++) {
                    let css = {};
                    let ariaHidden = null;
                    let rnd = Math.random();
                    if (rnd < 0.3) {
                        css = {display: 'none'}
                    } else {
                        css = {display: 'inline-block', maxWidth: '0px', overflow: 'hidden'}
                        ariaHidden = 'true';
                    }
                    let ltr = 65 + parseInt(Math.random() * 26);
                    if (Math.random() < 0.5) { ltr = ltr + 32; }

                    elements.push(React.createElement(
                        'span',
                        {
                            key: `footer-${elements.length}`,
                            aria_hidden: ariaHidden,
                            style: css
                        },
                        String.fromCharCode(ltr)
                    ));
                }
                elements.push(
                    React.createElement(
                        'span',
                        {
                            key: `footer-${elements.length}`
                        },
                        String.fromCharCode(ch)
                    )
                );
            }

            return React.createElement(
                React.Fragment,
                null,
                [
                    React.createElement(
                        'div',
                        {style: {minHeight: '5vh'}, key: 'padding'}
                    ),
                    React.createElement(
                        'div',
                        (() => {
                            let result = {key: 'footer'};
                            if (!this.state.hidden) {
                                result.className = 'footer footer-fixed';
                            } else {
                                result.className = 'footer';
                            }
                            return result;
                        })(),
                        elements
                    )
                ]
            )
        }

        componentDidMount() {
            window.addEventListener('scroll', this.onScroll);
        }

        onScroll() {
            let shouldBeHidden = window.scrollY !== 0;
            if (shouldBeHidden === this.wasHidden) { return; }

            this.wasHidden = shouldBeHidden;
            this.setState({hidden: this.wasHidden});
        }
    }

    return [Footer];
})();
