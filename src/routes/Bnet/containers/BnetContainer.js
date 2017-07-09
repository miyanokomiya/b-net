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
  let dx = rect.left + window.pageXOffset;
  let dy = rect.top + window.pageYOffset;

  if (isTouch(e)) {
    let touch = e.touches[0];
    x = touch.pageX - dx;
    y = touch.pageY - dy;
  } else {
    x = e.pageX - dx;
    y = e.pageY - dy;
  }
  return {
    x : x,
    y : y,
  };
}

function isTouch(e) {
  return e.touches;
}

function isMulitTouch(e) {
  return isTouch(e) && e.touches.length > 1;
}

function isTouchExist(e) {
  return isTouch(e) && e.touches.length > 0;
}

function getPoints(e) {
  let ret = [];
  let rect = e.currentTarget.getBoundingClientRect();
  let dx = rect.left + window.pageXOffset;
  let dy = rect.top + window.pageYOffset;

  for (let i = 0; i < e.touches.length; i++) {
    let touch = e.touches[i];
    ret.push({
      x : touch.pageX - dx,
      y : touch.pageY - dy,
    });
  }
    
  return ret;
}

const mapDispatchToProps = {
  disConnect : () => actions.disConnect(),
  loadTodos : (val) => actions.loadTodos(val),
  readyChangeText : () => actions.readyChangeText(),
  completeChangeText : (e) => {
    e.preventDefault();
    return actions.completeChangeText(e.target.nodeText.value);
  },
  completeChangeShape : (e, value) => {
    return actions.completeChangeShape(value);
  },
  completeChangeNodeColor : (e, value) => {
    return actions.completeChangeNodeColor(value);
  },
  cutParent : (e) => actions.cutParent(),
  addNode : (e) => {
    return actions.addNode();
  },
  removeNode : (e) => {
    return actions.removeNode();
  },
  cursorUpNode : (e) => {
    return actions.cursorUpNode({
      target : e.currentTarget.getAttribute("data-id"),
      isTouchExist : isTouchExist(e),
      time : Date.now(),
    });
  },
  cursorDownNode : (e) => {
    return actions.cursorDownNode({
      target : e.currentTarget.getAttribute("data-id"),
      isMulitTouch : isMulitTouch(e),
    });
  },
  cursorDown : (e) => {
    e.preventDefault();
    let p = getPoint(e);
    // let g = e.target.closest("g");
    return actions.cursorDown({
      x : p.x,
      y : p.y,
      onField : e.currentTarget === e.target,
      time : Date.now(),
      isMulitTouch : isMulitTouch(e),
    });
  },
  cursorUp : (e) => {
    return actions.cursorUp({
      onField : e.currentTarget === e.target,
      time : Date.now(),
    });
  },
  cursorMove : (e) => {
    e.preventDefault();

    if (isMulitTouch(e)) {
      let list = getPoints(e);
      return actions.cursorPinch(list);
    } else {
      let p = getPoint(e);
      return actions.cursorMove({
        x : p.x,
        y : p.y,
        buttons : isTouch(e) ? 1 : e.buttons,
      });
    }
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
  postPassword : (pass) => actions.postPassword(pass),
  selectFamily : () => actions.selectFamily(),
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
