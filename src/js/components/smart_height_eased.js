const SmartHeightEased = (() => {
    const MIN_DOM_RENDER_TIME = 30;
    const ANIMATION_TIME = 300;

    /**
     * A variant of HeightEased which is more opinionated, only rendering
     * complete closes and complete opens.
     *
     * Height easings require that the target component height, padding, and
     * margin is known. To ease an expansion we set them all to 0 and then
     * set a transition and ease them back. To ease a closing we set them all
     * to the full value and ease them to 0.
     *
     * This accepts children.
     *
     * @param {string} initialState The initial state of the component. Acts as
     *   an enum and must be one of 'closed', 'expanded'. This will no effect
     *   except for the first render.
     * @param {string} desiredState The desired state of this component. Acts
     *   as an enum and must be one of 'closed', 'expanded'. The component will
     *   be animated from its current state to the desired state.
     */
    class SmartHeightEased extends React.Component {
        constructor(props) {
            super(props);

            this.element = React.createRef();
            this.state = {
                currentState: props.initialState,
                timeout: -1,
                absoluteProps: null,
                measuredWidth: null
            }
        }

        render() {
            let props = Object.assign({}, this.calculateRenderProps());
            props.ref = this.element;
            return React.createElement(
                'div',
                props,
                this.props.children
            );
        }

        componentDidMount() {
            let newState = Object.assign({}, this.state);
            newState.timeout = setTimeout((() => {
                let newState2 = Object.assign({}, this.state);
                newState2.timeout = null;
                this.setState(newState2);
            }).bind(this), MIN_DOM_RENDER_TIME);
            this.setState(newState);
        }

        componentDidUpdate() {
            this.considerAnimate();
        }

        componentWillUnmount() {
            if (this.state.timeout) {
                clearTimeout(this.state.timeout);
            }
        }

        considerAnimate() {
            if (this.state.timeout !== null) {
                return;
            }
            /* no timeout -> we must be either be expanded or closed */

            if (this.state.currentState === this.props.desiredState) {
                return;
            }

            if (this.props.desiredState === 'expanded') {
                // Process:
                //   Move offscreen & render & measure
                //   Move back onscreen with preparing-to-expand
                //   Expanding
                //   Expanded

                let firstState = Object.assign({}, this.state);
                firstState.currentState = 'preparing-to-render-off-screen';
                firstState.timeout = setTimeout((() => {
                    let newState = Object.assign({}, this.state);
                    newState.measuredWidth = this.getCurrentWidth();
                    newState.currentState = 'render-off-screen';
                    let myTimeoutFn = (() => {
                        let absoluteProps = this.getCurrentAbsoluteProps();
                        if (absoluteProps.maxHeight === '0px') {
                            /* not ready yet */
                            let tmpNewState = Object.assign({}, this.state);
                            tmpNewState.timeout = setTimeout(myTimeoutFn, MIN_DOM_RENDER_TIME);
                            this.setState(tmpNewState);
                            return;
                        }

                        let newState2 = Object.assign({}, this.state);
                        newState2.currentState = 'preparing-to-expand-step-1';
                        newState2.measuredWidth = null;
                        newState2.absoluteProps = absoluteProps;
                        newState2.timeout = setTimeout((() => {
                            let newState2B = Object.assign({}, this.state);
                            newState2B.currentState = 'preparing-to-expand-step-2';
                            newState2B.timeout = setTimeout((() => {
                                let newState3 = Object.assign({}, this.state);
                                newState3.currentState = 'expanding';
                                newState3.timeout = setTimeout((() => {
                                    let newState4 = Object.assign({}, this.state);
                                    newState4.currentState = 'expanded';
                                    newState4.absoluteProps = null;
                                    newState4.timeout = setTimeout((() => {
                                        let newState5 = Object.assign({}, this.state);
                                        newState5.timeout = null;
                                        this.setState(newState5);
                                    }).bind(this), MIN_DOM_RENDER_TIME);
                                    this.setState(newState4);
                                }).bind(this), Math.max(ANIMATION_TIME, MIN_DOM_RENDER_TIME));
                                this.setState(newState3);
                            }).bind(this), MIN_DOM_RENDER_TIME);
                            this.setState(newState2B);
                        }).bind(this), MIN_DOM_RENDER_TIME);
                        this.setState(newState2);
                    }).bind(this);
                    newState.timeout = setTimeout(myTimeoutFn, MIN_DOM_RENDER_TIME);
                    this.setState(newState);
                }).bind(this), MIN_DOM_RENDER_TIME);
                this.setState(firstState);
                return;
            }

            if (this.props.desiredState === 'closed') {
                // Process:
                //   Measure & Switch to absolute props
                //   Add transition
                //   Closing
                //   Closed

                let newState = Object.assign({}, this.state);
                newState.currentState = 'preparing-to-close-step-1';
                newState.absoluteProps = this.getCurrentAbsoluteProps();
                newState.timeout = setTimeout((() => {
                    let newState2 = Object.assign({}, this.state);
                    newState2.currentState = 'preparing-to-close-step-2';
                    newState2.timeout = setTimeout((() => {
                        let newState3 = Object.assign({}, this.state);
                        newState3.currentState = 'closing';
                        newState3.timeout = setTimeout((() => {
                            let newState4 = Object.assign({}, this.state);
                            newState4.currentState = 'closed';
                            newState4.absoluteProps = null;
                            newState4.timeout = setTimeout((() => {
                                let newState5 = Object.assign({}, this.state);
                                newState5.timeout = null;
                                this.setState(newState5);
                            }).bind(this), MIN_DOM_RENDER_TIME);
                            this.setState(newState4);
                        }).bind(this), Math.max(MIN_DOM_RENDER_TIME, ANIMATION_TIME));
                        this.setState(newState3);
                    }).bind(this), MIN_DOM_RENDER_TIME);
                    this.setState(newState2);
                }).bind(this), MIN_DOM_RENDER_TIME);
                this.setState(newState);
            }
        }

        calculateRenderProps() {
            if (this.state.currentState === 'preparing-to-render-off-screen') {
                return this.getPreparingToRenderOffScreenProps();
            }

            if (this.state.currentState === 'render-off-screen') {
                return this.getRenderOffScreenProps();
            }

            if (this.state.currentState === 'preparing-to-expand-step-1') {
                return this.getPreparingToExpandStep1Props();
            }

            if (this.state.currentState === 'preparing-to-expand-step-2') {
                return this.getPreparingToExpandStep2Props();
            }

            if (this.state.currentState === 'expanding') {
                return this.getExpandingProps();
            }

            if (this.state.currentState === 'expanded') {
                return this.getOpenNoTransitionProps();
            }

            if (this.state.currentState === 'preparing-to-close-step-1') {
                return this.getPreparingToCloseStep1Props();
            }

            if (this.state.currentState === 'preparing-to-close-step-2') {
                return this.getPreparingToCloseStep2Props();
            }

            if (this.state.currentState === 'closing') {
                return this.getClosingProps();
            }

            if (this.state.currentState === 'closed') {
                return this.getClosedNoTransitionProps();
            }
        }

        getClosedNoTransitionProps() {
            return { className: 'smart-height-eased-full-closed' };
        }

        getOpenNoTransitionProps() {
            return { className: 'smart-height-eased-full-open' };
        }

        getPreparingToRenderOffScreenProps() {
            return {
                className: 'smart-height-eased-preparing-to-render-offscreen'
            }
        }

        getRenderOffScreenProps() {
            return {
                className: 'smart-height-eased-render-offscreen',
                style: {
                    width: this.state.measuredWidth
                }
            };
        }

        getPreparingToExpandStep1Props() {
            return { className: 'smart-height-eased-expanding' };
        }

        getPreparingToExpandStep2Props() {
            return {
                className: 'smart-height-eased-expanding',
                style: {
                    transition: 'max-height 0.3s, padding 0.3s, margin 0.3s'
                }
            };
        }

        getExpandingProps() {
            let newStyle = Object.assign({}, this.state.absoluteProps);
            newStyle.transition = 'max-height 0.3s, padding 0.3s, margin 0.3s';
            return {
                className: 'smart-height-eased-expanding',
                style: newStyle
            };
        }

        getPreparingToCloseStep1Props() {
            return {
                className: 'smart-height-eased-closing',
                style: this.state.absoluteProps
            };
        }

        getPreparingToCloseStep2Props() {
            let newStyle = Object.assign({}, this.state.absoluteProps);
            newStyle.transition = 'max-height 0.3s, padding 0.3s, margin 0.3s';
            return {
                className: 'smart-height-eased-closing',
                style: newStyle
            };
        }

        getClosingProps() {
            return {
                className: 'smart-height-eased-closing',
                style: {
                    transition: 'max-height 0.3s, padding 0.3s, margin 0.3s',
                    maxHeight: '0px',
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    marginTop: '0px',
                    marginBottom: '0px'
                }
            };
        }

        getCurrentAbsoluteProps() {
            let cs = window.getComputedStyle(this.element.current, null);
            return {
                maxHeight: cs.getPropertyValue('height'),
                paddingTop: cs.getPropertyValue('padding-top'),
                paddingBottom: cs.getPropertyValue('padding-bottom'),
                marginTop: cs.getPropertyValue('margin-top'),
                marginBottom: cs.getPropertyValue('margin-bottom')
            };
        }

        getCurrentWidth() {
            let cs = window.getComputedStyle(this.element.current, null);
            return cs.getPropertyValue('width');
        }
    }

    return SmartHeightEased;
})();