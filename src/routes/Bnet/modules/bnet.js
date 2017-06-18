import {firebaseDb} from '../../../../firebase/'
const ref = firebaseDb.ref('nodemap');

import {v2f, f2v, wheelCanvas, pinchCanvas} from './canvasUtils'
import {createNode, assignNode, createNewNode, getBetterPoint, moveNode} from './nodeUtils'

// ------------------------------------
// Constants
// ------------------------------------
export const BNET_RECEIVE_DATA = 'BNET_RECEIVE_DATA'
export const BNET_CHANGE_TEXT = 'BNET_CHANGE_TEXT'
export const BNET_READY_CHANGE_TEXT = 'BNET_READY_CHANGE_TEXT'
export const BNET_COMPLETE_CHANGE_TEXT = 'BNET_COMPLETE_CHANGE_TEXT'
export const BNET_STORE_MENU_POINT = 'BNET_STORE_MENU_POINT'
export const BNET_ADD_NODE = 'BNET_ADD_NODE'
export const BNET_REMOVE_NODE = 'BNET_REMOVE_NODE'
export const BNET_CHANGE_NODE = 'BNET_CHANGE_NODE'
export const BNET_SELECT_NODE = 'BNET_SELECT_NODE'

export const BNET_CURSOR_DOWN = 'BNET_CURSOR_DOWN'
export const BNET_CURSOR_MOVE = 'BNET_CURSOR_MOVE'
export const BNET_MOVE_VIEW = 'BNET_MOVE_VIEW'
export const BNET_CURSOR_UP = 'BNET_CURSOR_UP'
export const BNET_CURSOR_WHEEL = 'BNET_CURSOR_WHEEL'
export const BNET_CURSOR_PINCH = 'BNET_CURSOR_PINCH'

// ------------------------------------
// Actions
// ------------------------------------

export function loadTodos() {
  return dispatch => {
    ref.off();
    // valueを購読する。変更があれば、以下の処理が実行される。
    ref.on('value',
      (snapshot) => {
        ref.off('value');
        dispatch(loadTodosSuccess(snapshot));
        ref.on('child_added',
          (snapshot) => {
            dispatch(addNodeSuccess(snapshot));
          },
          (error) => {
            dispatch(loadTodosError(error));
          }
        );
        ref.on('child_changed',
          (snapshot) => {
            dispatch(chnageNodeSuccess(snapshot));
          },
          (error) => {
            dispatch(loadTodosError(error));
          }
        );
      },
      (error) => {
        // ref.off('value');
        dispatch(loadTodosError(error));
      }
    );
    ref.on('child_removed',
      (snapshot) => {
        dispatch(removeNodeSuccess(snapshot));
      },
      (error) => {
        dispatch(loadTodosError(error));
      }
    );
  }
}

function loadTodosSuccess(snapshot){
  return {
    type: BNET_RECEIVE_DATA,
    payload: snapshot.val()
  }
}

function loadTodosError(error){
  return {
    type: 'TODOS_RECIVE_ERROR',
    message: error.message
  }
}

export function changeText (value = "") {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      let nextNode = Object.assign({}, node, {text : value});
      firebaseDb.ref(`nodemap/${node.id}`).update(nextNode)
      .catch(error => {
        console.log(error);
        return dispatch({
          type: 'SAVE_NODE_ERROR',
          message: error.message,
        });
      });
    }
  }
}

export function readyChangeText (value = "") {
  return {
    type    : BNET_READY_CHANGE_TEXT,
    payload : value
  }
}

export function completeChangeText () {
  return {
    type    : BNET_COMPLETE_CHANGE_TEXT,
    payload : 0
  }
}

function chnageNodeSuccess(snapshot){
  return {
    type: BNET_CHANGE_NODE,
    payload: snapshot.val()
  }
}

export function fieldClick (value) {
  return {
    type    : BNET_STORE_MENU_POINT,
    payload : value
  }
}

export function cutParent (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      let nextNode = Object.assign({}, node, {parentId : null});
      firebaseDb.ref(`nodemap/${node.id}`).update(nextNode)
      .catch(error => {
        console.log(error);
        return dispatch({
          type: 'SAVE_NODE_ERROR',
          message: error.message,
        });
      });
    }
  }
}

export function addNode () {
  return (dispatch, getState) => {
    let node = createNewNode(getState().bnet);
    firebaseDb.ref(`nodemap/${node.id}`).update(node)
    .then(() => dispatch({
      type    : BNET_SELECT_NODE,
      payload : node.id
    }))
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        payload: error.message,
      });
    });
  }
}

function addNodeSuccess(snapshot){
  return {
    type: BNET_ADD_NODE,
    payload: snapshot.val()
  }
}

export function removeNode () {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    firebaseDb.ref(`nodemap/${node.id}`).remove()
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        payload: error.message,
      });
    });
  }
}

function removeNodeSuccess(snapshot){
  return {
    type: BNET_REMOVE_NODE,
    payload: snapshot.val()
  }
}

export function saveNode (value) {
    return (dispatch, getState) => {
    ref.push(value)
    .catch(error => dispatch({
      type: 'SAVE_NODE_ERROR',
      message: error.message,
    }));
  }
}

export function selectNode (value) {
  return {
    type    : BNET_SELECT_NODE,
    payload : value
  }
}

export function cursorDown (value) {
  return {
    type    : BNET_CURSOR_DOWN,
    payload : value
  }
}

export function cursorUp (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      firebaseDb.ref(`nodemap/${node.id}`).update(node)
      .then(() => dispatch({
        type    : BNET_CURSOR_UP,
        payload : value
      }))
      .catch(error => {
        console.log(error);
        return dispatch({
          type: 'SAVE_NODE_ERROR',
          message: error.message,
        });
      });
    } else {
      return dispatch({
        type    : BNET_CURSOR_UP,
        payload : value
      });
    }
  }
}

export function cursorMove (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    if (state.cursorState.drag && value.buttons > 0) {
      // 操作対象ノードを探す
      let node = state.nodeMap[state.target];
      if (node) {
        // ノードを移動
        let nextNode = moveNode(state, value.x, value.y, node);
        firebaseDb.ref(`nodemap/${nextNode.id}`).update(nextNode)
        .catch(error => {
          console.log(error);
          return dispatch({
            type: 'SAVE_NODE_ERROR',
            payload: error.message,
          });
        });

        return dispatch({
          type    : BNET_CURSOR_MOVE,
          payload : value
        });
      } else {
        return dispatch({
          type: BNET_MOVE_VIEW,
          payload: value,
        });
      }
    }
  }
}

export function cursorWheel (value) {
  return {
    type    : BNET_CURSOR_WHEEL,
    payload : value
  }
}

export function cursorPinch (value) {
  return {
    type    : BNET_CURSOR_PINCH,
    payload : value
  }
}

export const actions = {
  loadTodos,
  changeText,
  readyChangeText,
  completeChangeText,
  fieldClick,
  cutParent,
  addNode,
  removeNode,
  selectNode,
  cursorDown,
  cursorUp,
  cursorMove,
  cursorWheel,
  cursorPinch,
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [BNET_RECEIVE_DATA] : (state, action) => {
    let nodeMap = action.payload;
    // データ変更などによる不足データを補う
    for (let k in nodeMap) {
      nodeMap[k] = assignNode(nodeMap[k]);
    }

    return Object.assign({}, 
      state, 
      {
        nodeMap : Object.assign({}, state.nodeMap, nodeMap)
      });
  },
  [BNET_CHANGE_TEXT] : (state, action) => {
    let node = state.nodeMap[state.target];
    let obj = {};
    obj[node.id] = Object.assign({}, node, {
      text : action.payload
    });

    return Object.assign({}, 
      state, 
      {
        nodeMap : Object.assign({}, state.nodeMap, obj)
      });
  },
  [BNET_READY_CHANGE_TEXT] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        state : 1,
      });
  },
  [BNET_COMPLETE_CHANGE_TEXT] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        state : action.payload,
      });
  },
  [BNET_CHANGE_NODE] : (state, action) => {
    let node = action.payload;
    let nextNodeMap = Object.assign({}, state.nodeMap);
    nextNodeMap[node.id] = node;
    return Object.assign({}, 
      state, 
      {
        nodeMap : nextNodeMap,
      });
  },
  [BNET_ADD_NODE] : (state, action) => {
    let node = action.payload;
    if (state.nodeMap[node.id]) {
      // 追加済みは無視
      return state;
    } else {
      let nextNodeMap = Object.assign({}, state.nodeMap);
      nextNodeMap[node.id] = node;

      let p = v2f(state.viewArea, state.cursorState);
      let dx = node.x - p.x;
      let dy = node.y - p.y;

      let viewArea = Object.assign({}, state.viewArea, {
        left : state.viewArea.left + dx,
        top : state.viewArea.top + dy,
      });

      return Object.assign({}, 
        state, 
        {
          state : 1,
          target : node.id,
          nodeMap : nextNodeMap,
          viewArea : viewArea,
        });
    }
  },
  [BNET_REMOVE_NODE] : (state, action) => {
    let nextNodeMap = Object.assign({}, state.nodeMap);
    delete nextNodeMap[action.payload.id];

    return Object.assign({}, 
      state, 
      {
        nodeMap : nextNodeMap,
        state : 0,
      });
  },
  [BNET_SELECT_NODE] : (state, action) => {
    let node = state.nodeMap[action.payload];
    if (!node) {
      return state;
    }

    return Object.assign({}, 
      state, 
      {
        target : action.payload,
      });
  },
  [BNET_CURSOR_DOWN] : (state, action) => {
    if (action.payload.isMulitTouch) {
      return state;
    }

    let s = 0;
    let target = state.target;
    let timeDiff = action.payload.time - state.lastDownTime;
    let viewArea = state.viewArea;
    if (action.payload.onField) {
      target = null;
      if (timeDiff < 500) {
        s = 2;
      } else {
        s = 0;
      }
    } else {
      if (timeDiff < 500 && state.target) {
        let node = state.nodeMap[state.target];
        if (node) {
          s = 3;

          let p = v2f(state.viewArea, state.cursorState);
          let dx = node.x - p.x;
          let dy = node.y - p.y;

          viewArea = Object.assign({}, state.viewArea, {
            left : state.viewArea.left + dx,
            top : state.viewArea.top + dy,
          });
        }
      }
      if (s === 2) {
        s = 0;
      }
    }
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          x : action.payload.x,
          y : action.payload.y,
          drag : true,
          pinchDistance : 0,
        }),
        menuPoint : Object.assign({}, state.menuPoint,
        {
          x : action.payload.x,
          y : action.payload.y,
        }),
        state : s,
        lastDownTime : action.payload.time,
        target : target,
        viewArea : viewArea
      });
  },
  [BNET_CURSOR_UP] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          drag : false,
        }),
      });
  },
  [BNET_CURSOR_MOVE] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          x : action.payload.x,
          y : action.payload.y,
        }),
        state : 0,
      });
  },
  [BNET_MOVE_VIEW] : (state, action) => {
    let dx = action.payload.x - state.cursorState.x;
    let dy = action.payload.y - state.cursorState.y;
    dx *= state.viewArea.scale;
    dy *= state.viewArea.scale;

    // 表示移動
    let viewArea = Object.assign({}, state.viewArea, {
      left : state.viewArea.left - dx,
      top : state.viewArea.top - dy,
    });
    
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          x : action.payload.x,
          y : action.payload.y,
        }),
        viewArea : viewArea || state.viewArea,
        state : 0,
      });
  },
  [BNET_CURSOR_WHEEL] : (state, action) => {
    let va = wheelCanvas(state, action.payload.deltaX, action.payload);

    return Object.assign({},
      state, 
      {
        viewArea : va,
        state : 0,
      });
  },
  [BNET_CURSOR_PINCH] : (state, action) => {
    let p0 = action.payload[0];
    let p1 = action.payload[1];
    let result = pinchCanvas(state, p0, p1);
    let va = result[0];
    let d = result[1];

    return Object.assign({},
      state, 
      {
        viewArea : va,
        state : 0,
        cursorState : Object.assign({}, state.cursorState, {
          pinchDistance : d,
        }),
      });
  },
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  width : 2000,
  height : 2000,
  nodeMap : {},
  state : 0,
  target : null,
  menuPoint : {
    x : 0,
    y : 0
  },
  lastClickTime : 0,
  lastDownTime : 0,
  viewArea : {
    left : 0,
    top : 0,
    scale : 2,
  },
  cursorState : {
    x : 0,
    y : 0,
    delta : 1,
    drag : false,
    pinchDistance : 0,
  },
}

// for (let i = 0; i < 3; i++) {
//   let node = createNode();
//   node.id = `default_${i}`;
//   node.x = 100;
//   node.y += i * 30 + 100;
//   initialState.nodeMap[node.id] = node;
// }

export default function bnetReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
