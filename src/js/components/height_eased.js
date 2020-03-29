const HeightEased = (function() {
    let SIZE_PROPS = [
        ['transition', 'transition', 'none'],
        ['height', 'height', '0px'],
        ['padding-top', 'paddingTop', '0px'],
        ['padding-bottom', 'paddingBottom', '0px'],
        ['margin-top', 'marginTop', '0px'],
        ['margin-bottom', 'marginBottom', '0px']
    ];

    /**
     * Wraps a component to add a max-height easing functionality. That is to
     * say, when added it expands from no height to full height and when
     * removed it retracts from full height to no height.
     *
     * Adding is done "drop-in" style, but to remove the component you must
     * mark is as removing.
     *
     * @param {object} component The class of the component this is wrapping,
     *   e.g., 'div' or Alert
     * @param {object} componentArgs The arguments passed to the component
     * @param {array} componentChildren The children to the component
     * @param {string} style One of 'closed', 'expanding', 'expanded', or
     *   'closing'. Defaults to 'expanding'
     */
    class HeightEased extends React.Component {
        constructor(props) {
            super(props);
            this.animState = null;
            this.element = React.createRef();
        }

        render() {
            let compArgs = this.props.componentArgs ? Object.assign({}, this.props.componentArgs) : {};
            compArgs.key = 'wrapped_component';

            return React.createElement(
                'div',
                {className: 'height-eased', ref: this.element},
                [
                    React.createElement(
                        this.props.component,
                        compArgs,
                        this.props.componentChildren
                    )
                ]
            );
        }

        componentDidMount() {
            this.updateAnim();
        }

        componentDidUpdate() {
            this.updateAnim();
        }

        updateAnim() {
            if(!this.element.current) {
                return;
            }
            if(this.props.style === this.animState) {
                return;
            }
            var oldState = this.animState;
            this.animState = this.props.style ? this.props.style : 'expanding';

            if(oldState === null && this.animState === 'expanded') {
                // Just move us onto the screen
                this.element.current.style.position = 'static';
                return;
            }

            if(oldState === null && this.animState === 'closing') {
                this.element.current.style.position = 'static';
                oldState = 'expanded';
            }

            if(oldState === 'expanding' && this.animState === 'expanded') {
                // Just give it time
                return;
            }

            if(oldState === 'expanded' && this.animState === 'expanding') {
                // We'll skip the transition as there's no way this will
                // look good
                return;
            }

            if(oldState === 'closing' && this.animState === 'closed') {
                // Just give it time
                return;
            }

            if(oldState === 'closed' && this.animState === 'closing') {
                // We'll skip the transition as there's no way this will
                // look good
                return;
            }

            if(this.animState === 'expanded') {
                // We weren't expanding so we must have been closing or closed
                this.setExpandedNoTransition();
                return;
            }

            if(this.animState === 'closed') {
                // We weren't closing so we must have been expanding or expanded
                this.setClosed(false);
                return;
            }

            if (oldState === null) {
                this.element.current.style.position = 'absolute';
                this.element.current.style.left = '-99999px';
            }else if(oldState !== 'expanded' && oldState !== 'flashedExpanded') {
                // We can't trust our elements height, so we need to clear the
                // style and let the DOM refresh so we can
                if(oldState !== 'expanding') {
                    this.element.current.style.position = 'absolute';
                    this.element.current.style.left = '-99999px';
                }
                this.setExpandedNoTransition();
                this.animState = 'flashedExpanded';
                setTimeout(this.updateAnim.bind(this));
                return;
            }

            this.element.current.style.removeProperty('transition');

            let cs = window.getComputedStyle(this.element.current, null);
            let realProps = [];
            for(var i = 0; i < SIZE_PROPS.length; i++) {
                realProps.push(cs.getPropertyValue(SIZE_PROPS[i][0]));
            }

            setTimeout((() => {
                if(!this.element.current) { return; }
                if(this.animState === 'closing') {
                    this.element.current.style.transition = realProps[0];
                    this.element.current.style.maxHeight = realProps[1];
                    setTimeout((() => {
                        if(!this.element.current) { return; }
                        this.setClosed(true);
                    }).bind(this), 200); // larger is more reliable
                }else {
                    // expanding
                    this.setClosed(false);
                    this.element.current.style.position = 'static';
                    this.element.current.style.removeProperty('left');
                    setTimeout((() => {
                        if(!this.element.current) { return; }
                        this.element.current.style.transition = realProps[0];
                        setTimeout((() => {
                            if(!this.element.current) { return; }
                            this.setTo(realProps);
                            setTimeout((() => {
                                if(!this.element.current) { return; }
                                if(this.animState !== 'expanding') {
                                    return;
                                }
                                this.setExpandedNoTransition();
                                this.animState = 'expanded';
                            }).bind(this), 300); // this number should match transition speed
                        }).bind(this), 0);
                    }).bind(this), 200);
                }
            }).bind(this));
        }

        setClosed(transition) {
            for(var i = 0, len = SIZE_PROPS.length; i < len; i++) {
                if(transition && SIZE_PROPS[i][0] === 'transition') {
                    continue;
                }
                if(SIZE_PROPS[i][1] === 'height') {
                    continue;
                }

                this.element.current.style[SIZE_PROPS[i][1]] = SIZE_PROPS[i][2];
            }
            this.element.current.style.maxHeight = '0px';
        }

        setTo(realProps) {
            for(var i = 1, len = SIZE_PROPS.length; i < len; i++) {
                if(SIZE_PROPS[i][1] === 'height') {
                    this.element.current.style.maxHeight = realProps[i];
                }else {
                    this.element.current.style[SIZE_PROPS[i][1]] = realProps[i];
                }
            }
        }

        setExpandedNoTransition() {
            this.element.current.style.removeProperty('transition');
            this.element.current.style.transition = 'none';
            this.element.current.style.removeProperty('max-height');
            for(var i = 0, len = SIZE_PROPS.length; i < len; i++) {
                if(SIZE_PROPS[i][1] === 'height' || SIZE_PROPS[i][0] === 'transition') {
                    continue;
                }
                this.element.current.style.removeProperty(SIZE_PROPS[i][0]);
            }
            this.element.current.style.removeProperty('transition');
        }
    }

    HeightEased.propTypes = {
        component: PropTypes.any.isRequired,
        componentArgs: PropTypes.object,
        componentChildren: PropTypes.array,
        style: PropTypes.string
    };

    return HeightEased;
})();