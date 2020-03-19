const NavBar = (function() {
  var cE = React.createElement;

  /**
   * Describes a single item within a navbar. This requires a handler for when
   * the item is clicked, but there need to be other handlers at the row-level
   * to support roving tab-indexes and general keyboard support.
   *
   * @param {string} name The name displayed on this item
   * @param {bool} active True if this is the current page, false otherwise
   * @param {bool} opensMenu True if this item opens a menu, false otherwise
   * @param {bool} expanded True if this item is expanding a menu, false
   *  otherwise
   * @param {bool} focusable True if this item is focusable, false otherwise
   * @param {string} ariaLabel The aria label for this item
   * @param {function} clicked This function is invoked when this item is
   *  clicked.
   * @param {bool} shouldRipFocus True if this item should steal focus after
   *  it is rendered, false not to. Always treated as false if not focusable
   * @param {function} refocus A function which we call with a function which
   *  will force focus onto this item
   */
  class NavBarItem extends React.Component {
    constructor(props) {
      super(props);
      this.element = React.createRef();
    }

    render() {
      let parentProps = {
        className: (
          'navbar-item'
          + (this.props.active ? ' navbar-item-active' : '')
          + (this.props.expanded ? ' navbar-item-expanded' : '')
        ),
        ref: this.element,
        tabIndex: this.props.focusable ? '0' : '-1',
        aria_label: this.props.ariaLabel
      };
      if (this.props.opensMenu) {
        parentProps.aria_has_popup = '1';
        parentProps.aria_expanded = '1';
      }
      if (this.props.active) {
        parentProps.aria_current = 'page';
      }

      return cE('div', parentProps, this.props.name);
    }

    componentDidMount() {
      this.element.current.addEventListener('click', ((_) => this.handleClick()).bind(this));
      if (this.props.refocus) {
        this.props.refocus((() => {
          this.element.current.focus()
        }).bind(this));
      }
      this.ripFocus();
    }

    componentDidUpdate() {
      this.ripFocus();
    }

    ripFocus() {
      if (this.props.focusable && this.props.shouldRipFocus) {
        this.element.current.focus();
      }
    }

    handleClick() {
      if (this.props.clicked) {
        this.props.clicked();
      }
    }
  };

  NavBarItem.propTypes = {
    name: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    opensMenu: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
    ariaLabel: PropTypes.string.isRequired,
    focusable: PropTypes.bool.isRequired,
    clicked: PropTypes.func.isRequired,
    focused: PropTypes.func.isRequired,
    shouldRipFocus: PropTypes.bool.isRequired,
    refocus: PropTypes.func
  };


  /**
   * This describes a single row of a navbar. This requires click handlers on
   * each button. It displays an array of navbar items horizontally. It uses
   * a roving tab-index and supports type-ahead. See NavBar for details.
   *
   * @param {object[]} items The items on this row, where each item has th
   *   following structure:
   *   - name: The visible name on the row
   *   - ariaLabel: Additional information for screen readers
   *   - active: True if the item is active, false otherwise
   *   - opensMenu: True if this item opens a menu, false otherwise (for aria
   *     purposes)
   *   - expanded: False if opensMenu is false, otherwise true if the menu is
   *     expanded and false otherwise (for aria and display).
   *   - enter: A function which is called when the user tries to open the
   *     item as if it were a submenu. Returns true if there was a submenu to
   *     enter and false otherwise. A null function is treated as if it were
   *     () => false;
   *   - apply: A function which is called when the user tries to apply the
   *     action associated with this item. This should navigate if this item
   *     is a url. Returns true if navigation occurred and false otherwise.
   * @param {function} exit A function which is called when the user tries to
   *     close this row. Returns true if this was a nested row and hence it
   *     could be closed and false if nothing happened. A null function is
   *     treated as if it were () => false
   * @param {string} ariaLabel The label applied to this nav-bar. Should be
   *   short.
   * @param {string} ariaDesc If not null, this is attached as a description
   *   to this navbar with an invisible div and aria-describedby. Should be
   *   short. If set, must also set ariaDescId to a unique id.
   * @param {string} ariaDescId A unique id to use for the aria-describedby
   *   div.
   * @param {number} focusedIndex The index within this navbar row which should
   *   be focused if we are tabbed to
   * @param {bool} shouldRipFocus If true, we will force the windows focus to
   *   focused index after mounting
   * @param {function} onFocusChanged If not null, we call it whenever the
   *   focus within this row changes state. We pass 1 arg - the new index.
   * @param {bool} easeHeight If true, we will mount at a max-height of 0 and
   *   clear that value immediately, which will allow easings to trigger.
   * @param {bool} closing If true, easeHeight will be ignored. We will mount
   *   with a max-height equal to the auto height and immediately set it to 0,
   *   allowing easings to trigger.
   * @param {function} refocus A function which we call with a function which
   *   will immediately rip focus to our navbar item
   */
  class NavBarRow extends React.Component {
    constructor(props) {
      super(props);
      this.element = React.createRef();
      this.focusedItem = null;
      this.state = {
        focusedIndex: this.props.focusedIndex,
        shouldRipFocus: this.props.shouldRipFocus
      };
      this.setToClosing = false;
      this.setToExpanding = false;
      this.lastSawKey = Date.now();
      this.currentSearch = '';
      this.refocusers = [];
      this.realHeight = null;
    }

    getFocusedIndex() { return this.state.focusedIndex; }

    render() {
      let children = this.props.items.map((item, idx) => {
        return cE(NavBarItem,
          {
            name: item.name,
            key: item.name,
            active: item.active,
            opensMenu: item.opensMenu,
            expanded: item.expanded,
            focusable: !this.props.closing && idx == this.state.focusedIndex,
            shouldRipFocus: this.state.shouldRipFocus,
            ariaLabel: item.ariaLabel,
            clicked: item.enter ? item.enter.bind(item) : item.apply.bind(item),
            refocus: ((rfc) => this.refocusers[idx] = rfc).bind(this)
          }
        );
      });
      this.focusedItem = children[this.state.focusedIndex];

      if (this.props.ariaDesc) {
        return cE(
          React.Fragment, null, [
            cE('div',
              {
                key: 'navbar',
                ref: this.element,
                className: 'navbar-row' + (this.props.closing ? ' navbar-row-closing' : ''),
                aria_describedby: this.props.ariaDescId
              },
              children
            ),
            cE('div',
              {
                key: 'desc',
                id: this.props.ariaDescId,
                style: {display: 'none'}
              },
              this.props.ariaDesc
            )
          ]
        );
      }

      return cE('div',
        {
          ref: this.element,
          className: 'navbar-row' + (this.props.closing ? ' navbar-row-closing' : '')
        },
        children
      );
    }

    componentDidMount() {
      this.element.current.addEventListener('keydown', this.onKeyDown.bind(this));
      this.updateAnims();
      if(this.props.refocus) {
        this.props.refocus((() => this.refocusers[this.state.focusedIndex]()).bind(this));
      }
    }

    componentDidUpdate() {
      if (this.props.onFocusChanged) {
        this.props.onFocusChanged(this.state.focusedIndex);
      }
      this.updateAnims();
    }

    updateAnims() {
      this.realHeight = this.realHeight || this.element.current.clientHeight;

      if (this.props.closing && !this.setToClosing) {
        this.state.shouldRipFocus = false;
        this.element.current.style.maxHeight = this.realHeight + "px";
        this.element.current.style.marginTop = "1em";
        setTimeout((() => {
          this.element.current.style.maxHeight = "0px";
          this.element.current.style.marginTop = "0px";
        }).bind(this), 0);
        this.setToClosing = true;
        this.setToExpanding = false;
      }else if (this.props.easeHeight && !this.setToExpanding) {
        this.element.current.style.maxHeight = "0px";
        this.element.current.style.marginTop = "0px";
        setTimeout((() => {
          this.element.current.style.maxHeight = this.realHeight + "px";
          this.element.current.style.marginTop = "1em";
        }).bind(this), 0);
        this.setToClosing = false;
        this.setToExpanding = true;
      }
    }

    moveFocusTo(idx) {
      this.setState((state) => {
        let res = Object.assign({}, state);
        res.focusedIndex = idx;
        res.shouldRipFocus = true;
        return res;
      });
    }

    moveFocusRight() {
      this.setState(((state) => {
        let res = Object.assign({}, state);
        res.focusedIndex = (state.focusedIndex + 1) % this.props.items.length;
        res.shouldRipFocus = true;
        return res;
      }).bind(this));
    }

    moveFocusLeft() {
      this.setState(((state) => {
        let res = Object.assign({}, state);
        res.focusedIndex = (state.focusedIndex + this.props.items.length - 1) % this.props.items.length;
        res.shouldRipFocus = true;
        return res;
      }).bind(this));
    }

    moveFocusStart() {
      this.moveFocusTo(0);
    }

    moveFocusEnd() {
      this.moveFocusTo(this.props.items.length - 1);
    }

    isWithinLookaheadTime() {
      if (this.currentSearch === '')
        return false;

      return (Date.now() - this.lastSawKey) < 1000;
    }

    clearLookahead() {
      this.currentSearch = '';
    }

    addLookahead(chr) {
      this.currentSearch += chr;
      this.lastSawKey = Date.now();
    }

    attemptLookahead() {
      var bestIndex = -1;
      for (var i = this.state.focusedIndex; i < this.props.items.length; i++) {
        if (this.props.items[i].name.toLowerCase().startsWith(this.currentSearch.toLowerCase())) {
          bestIndex = i;
          break;
        }
      }

      if (bestIndex === -1) {
        for (var i = 0; i < this.state.focusedIndex; i++) {
          if (this.props.items[i].name.toLowerCase().startsWith(this.currentSearch.toLowerCase())) {
            bestIndex = i;
            break;
          }
        }
      }

      if (bestIndex === -1) {
        return false;
      }

      if(this.state.focusedIndex === bestIndex) {
        return true;
      }

      this.moveFocusTo(bestIndex);
      return true;
    }

    onKeyDown(e) {
      if (e.key === 'ArrowRight') {
        this.moveFocusRight();
      }else if(e.key === 'ArrowLeft') {
        this.moveFocusLeft();
      }else if (e.key == 'ArrowUp') {
        this.props.exit();
      }else if (e.key == ' ' || e.key == 'ArrowDown') {
        let itm = this.props.items[this.state.focusedIndex];
        if (itm.enter) {
          this.state.shouldRipFocus = false;
          itm.enter();
        }
      }else if (e.key === 'Home') {
        this.moveFocusStart();
      }else if (e.key === 'End') {
        this.moveFocusEnd();
      }else if(e.key === 'Enter') {
        let itm = this.props.items[this.state.focusedIndex];
        if (itm.enter) {
          this.state.shouldRipFocus = false;
          itm.enter();
        }else {
          if (!itm.active) {
            itm.apply();
          }
        }
      }else if (e.key === 'Escape') {
        if (this.isWithinLookaheadTime()) {
          this.clearLookahead();
        }else {
          this.props.exit();
        }
      }else if (e.key.length === 1) {
        if (!this.isWithinLookaheadTime()) {
          this.clearLookahead();
        }
        this.addLookahead(e.key);
        this.attemptLookahead();
      }

      e.stopPropagation();
      return false;
    }
  };

  NavBarRow.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      ariaLabel: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
      opensMenu: PropTypes.bool.isRequired,
      expanded: PropTypes.bool.isRequired,
      enter: PropTypes.func,
      apply: PropTypes.func.isRequired
    })).isRequired,
    exit: PropTypes.func,
    ariaLabel: PropTypes.string.isRequired,
    ariaDesc: PropTypes.string,
    ariaDescId: PropTypes.string,
    focusedIndex: PropTypes.number.isRequired,
    shouldRipFocus: PropTypes.bool.isRequired,
    onFocusChanged: PropTypes.func,
    easeHeight: PropTypes.bool,
    closing: PropTypes.bool,
    refocus: PropTypes.func
  };


  /**
   * This describes a NavBar with a fixed set of elements. This supports up to
   * one level of nesting, which is visually displayed as a second navbar row
   * which shows up beneath the primary navbar row when a nested category is
   * clicked.
   *
   * The following accessibility features are implemented:
   *   - We use a <nav> element on the primary and secondary rows,
   *     where both are appropriately labelled with aria-label.
   *   - We tag the current page as aria-current="page"
   *   - We clearly highlight the focused elements on the navbar
   *   - We use a roving tab-index
   *   - We add a description to indicate keyboard and type-ahead support.
   *   - Items which open menus have aria-haspopup=menu and have aria-expanded
   *     set appropriately. Since we manipulate the submenu using javascript,
   *     we do not copy these tags to the submenu.
   *   - Enter opens the submenu and places focus on its first item OR clicks
   *     the link
   *   - Space and down arrow will open the submenu and place focus on the
   *     first item, if there is a submenu. Otherwise, it does nothing.
   *   - Up arrow will open the submenu and place focus on the last item,
   *     if there is a submenu. Otherwise, it does nothing.
   *   - Right arrow will move focus to the next item, wrapping to the first
   *     at the end.
   *   - Left arrow will move focus to the previous item, wrapping to the last
   *     item
   *   - Home moves to the first item in the row
   *   - End moves to the last item in the row
   *   - Type-ahead: type a character or multiple characters in rapid
   *     succession to jump to the next item in the current row which starts
   *     with the given character(s).
   *   - Escape will close the submenu if there is one, otherwise do nothing
   *
   * @param {object[]} row An array of objects where each item has the
   *   structure:
   *   - name: The text that displayed on the button.
   *   - ariaLabel: The aria-label associated with the button
   *   - current: True if this is the current page, false or null otherwise
   *   - url: The url that the user is redirected to when the button is
   *     clicked. Should not be set alongside "row", since the row won't be
   *     visible if the user is redirected.
   *   - row: The row that should become visible below the primary navbar row
   *     when this item is clicked. Should not be set alongside "url". Should
   *     be an array of dictionaries just like NavBar#row
   */
  class NavBar extends React.Component {
    constructor(props) {
      super(props);
      this.element = React.createRef();
      this.workingPrimaryFocusIndex = 0;
      this.workingSecondaryFocusIndex = 0;
      this.state = {
        expandedIndex: null,
        closingExpanded: false,
        shouldRipPrimaryFocus: false,
        shouldRipSecondaryFocus: false,
        primaryFocusIndex: 0,
        secondaryFocusIndex: 0
      };
      this.refocusMain = null;
      this.refocusSub = null;
    }

    render() {
      let mainBar = cE(NavBarRow,
        {
          items: this.props.row.map((item, idx) => {
            return {
              name: item.name,
              ariaLabel: item.ariaLabel,
              active: item.current,
              opensMenu: !!item.row,
              expanded: idx === this.state.expandedIndex,
              enter: (item.row ? () => {
                if (idx == this.state.expandedIndex && !this.state.closingExpanded) {
                  this.setState({
                    expandedIndex: this.state.expandedIndex,
                    closingExpanded: true,
                    shouldRipPrimaryFocus: true,
                    shouldRipSecondaryFocus: false,
                    primaryFocusIndex: this.workingPrimaryFocusIndex,
                    secondaryFocusIndex: 0
                  });
                }else {
                  this.setState({
                    expandedIndex: idx,
                    closingExpanded: false,
                    shouldRipPrimaryFocus: false,
                    shouldRipSecondaryFocus: true,
                    primaryFocusIndex: this.workingPrimaryFocusIndex,
                    secondaryFocusIndex: this.workingSecondaryFocusIndex
                  });
                  if (this.refocusSub) {
                    this.refocusSub();
                  }
                }
              } : null),
              apply: (item.url ? (_) => {
                window.location.href = item.url;
              } : null)
            };
          }),
          key: 'primary',
          exit: (_) => false,
          ariaLabel: 'Primary Menu',
          ariaDesc: 'Arrows and Enter to Control',
          ariaDescId: 'navbar-primary-desc',
          focusedIndex: this.state.primaryFocusIndex,
          shouldRipFocus: this.state.shouldRipPrimaryFocus,
          onFocusChanged: (idx) => { this.workingPrimaryFocusIndex = idx; },
          refocus: ((rfc) => this.refocusMain = rfc).bind(this)
        }
      );
      let children = [mainBar];
      if (this.state.expandedIndex !== null) {
        children.push(cE(NavBarRow,
          {
            items: this.props.row[this.state.expandedIndex].row.map(item => {
              return {
                name: item.name,
                ariaLabel: item.ariaLabel,
                active: item.current,
                opensMenu: false,
                expanded: false,
                enter: null,
                apply: (_) => {window.location.href = item.url; }
              };
            }),
            key: 'secondary',
            exit: () => {
              if (!this.state.closing) {
                this.refocusMain();
                this.setState({
                  expandedIndex: this.state.expandedIndex,
                  closingExpanded: true,
                  shouldRipPrimaryFocus: true,
                  shouldRipSecondaryFocus: false,
                  primaryFocusIndex: this.workingPrimaryFocusIndex,
                  secondaryFocusIndex: this.workingSecondaryFocusIndex
                });
              }
            },
            ariaLabel: 'Secondary Menu',
            focusedIndex: this.state.secondaryFocusIndex,
            shouldRipFocus: this.state.shouldRipSecondaryFocus,
            onFocusChanged: (idx) => { this.workingSecondaryFocusIndex = idx; },
            easeHeight: true,
            closing: this.state.closingExpanded,
            refocus: ((rfc) => this.refocusSub = rfc).bind(this)
          }
        ));
      }

      return cE('nav', {className: 'navbar'}, children);
    }
  };

  NavBar.propTypes = {
    row: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      ariaLabel: PropTypes.string.isRequired,
      current: PropTypes.bool,
      url: PropTypes.string,
      row: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        ariaLabel: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired
      }))
    })).isRequired
  };


  return NavBar;
})();
