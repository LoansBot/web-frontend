const Captcha = (function() {
    /**
     * Describes a simple captcha display.
     *
     * @param {func} tokenGet A function we pass a function which will return
     *   the current captcha token as a string when it is available and null
     *   otherwise.
     * @param {func} tokenClear A function we pass a function which will clear
     *   the captcha token.
     */
    class Captcha extends React.Component {
        constructor(props) {
            super(props);
            this.setCallbacks = false;
        }

        render() {
            return React.createElement(
                'div',
                {
                    id: 'captcha',
                    className: 'h-captcha',
                    'data-sitekey': 'e8002362-19f0-44e5-8b63-3274e078b8f4'
                }
            );
        }

        componentDidMount() {
            this.trySetCallbacks();
        }

        trySetCallbacks() {
            if(typeof(hcaptcha) === 'undefined') {
                setTimeout(this.trySetCallbacks.bind(this), 500);
                return;
            }

            if(this.setCallbacks) {
                return;
            }
            this.setCallbacks = true;

            if(this.props.tokenGet) {
                this.props.tokenGet(() => {
                    try {
                        let response = hcaptcha.getResponse();
                        return response ? response : null;
                    }catch(error) {
                        console.log(error);
                        return null;
                    }
                });
            }

            if(this.props.tokenClear) {
                this.props.tokenClear(() => {
                    try {
                        hcaptcha.reset()
                    }catch(error) {
                        console.log(error);
                    }
                });
            }
        }
    }

    Captcha.propTypes = {
        tokenGet: PropTypes.func,
        tokenClear: PropTypes.func
    };

    return Captcha;
})();