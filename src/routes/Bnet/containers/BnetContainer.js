import { connect } from 'react-redux'
import { actions } from '../modules/bnet'

/*  This is a container component. Notice it does not contain any JSX,
    nor does it import React. This component is **only** responsible for
    wiring in the actions and state necessary to render a presentational
    component - in this case, the counter:   */

import Bnet from '../components/Bnet'

/*  Object of action creators (can also be function that returns object).
    Keys will be passed as props to presentational components. Here we are
    implementing our wrapper around increment; the component doesn't care   */

function getPoint(e) {
    let x, y;
    let rect = e.currentTarget.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;
    return {
      x : x,
      y : y,
    };
}

const mapDispatchToProps = {
  increment : () => actions.increment(3),
  doubleAsync : () => actions.doubleAsync(),
  changeText : (e) => actions.changeText(e.target.value),
  readyChangeText : () => actions.readyChangeText(),
  completeChangeText : (e) => {
    e.preventDefault();
    return actions.completeChangeText();
  },
  fieldClick : (e) => {
    let p = getPoint(e);
    return actions.fieldClick({
      x : p.x,
      y : p.y,
      onField : e.currentTarget === e.target,
      time : Date.now(),
    });
  },
  addNode : (e) => {
    let p = getPoint(e);
    return actions.addNode({
      x : p.x,
      y : p.y,
    });
  },
  showNodeMenu : (e) => {
    return actions.showNodeMenu({
      target : e.currentTarget.getAttribute("data-id"),
    });
  },
  cursorDown : (e) => {
    e.preventDefault();
    let p = getPoint(e);
    let g = e.target.closest("g");
    return actions.cursorDown({
      x : p.x,
      y : p.y,
      onField : e.currentTarget === e.target,
      target : g ? g.getAttribute("data-id") : null,
    });
  },
  cursorUp : (e) => {
    return actions.cursorUp();
  },
  cursorMove : (e) => {
    let p = getPoint(e);
    return actions.cursorMove({
      x : p.x,
      y : p.y,
    });
  },
  cursorWheel : (e) => {
    e.preventDefault();
    let p = getPoint(e);
    return actions.cursorWheel({
      x : p.x,
      y : p.y,
      deltaX : e.deltaY,
    });
  },
}

const mapStateToProps = (state) => state.bnet

/*  Note: mapStateToProps is where you should use `reselect` to create selectors, ie:

    import { createSelector } from 'reselect'
    const counter = (state) => state.counter
    const tripleCount = createSelector(counter, (count) => count * 3)
    const mapStateToProps = (state) => ({
      counter: tripleCount(state)
    })

    Selectors can compute derived data, allowing Redux to store the minimal possible state.
    Selectors are efficient. A selector is not recomputed unless one of its arguments change.
    Selectors are composable. They can be used as input to other selectors.
    https://github.com/reactjs/reselect    */

export default connect(mapStateToProps, mapDispatchToProps)(Bnet)
