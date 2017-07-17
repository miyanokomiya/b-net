import {firebaseDb, TIMESTAMP, firebaseAuth} from '../../../../firebase/'

import {v2f, f2v, v2fScaler, f2vScaler, wheelCanvas, pinchCanvas, getAdjustedViewArea} from './canvasUtils'
import {createNode, assignNode, createNewNode, getBetterPoint, moveNode, moveNodeAtPoint, getDescentMap} from './nodeUtils'

// ------------------------------------
// Constants
// ------------------------------------
export const BNET_RECEIVE_ROOM = 'BNET_RECEIVE_ROOM'
export const BNET_RECEIVE_DATA = 'BNET_RECEIVE_DATA'

export const BNET_READY_CHANGE_TEXT = 'BNET_READY_CHANGE_TEXT'
export const BNET_CHANGE_STATE = 'BNET_CHANGE_STATE'

export const BNET_ADD_NODE = 'BNET_ADD_NODE'
export const BNET_SELECT_AND_READY_CHANGE_TEXT = 'BNET_ABNET_SELECT_AND_READY_CHANGE_TEXTDD_NODE_AND_EDIT'
export const BNET_REMOVE_NODE = 'BNET_REMOVE_NODE'
export const BNET_CHANGE_NODE = 'BNET_CHANGE_NODE'
export const BNET_SELECT_NODE = 'BNET_SELECT_NODE'

export const BNET_CURSOR_DOWN_NODE = 'BNET_CURSOR_DOWN_NODE'
export const BNET_CURSOR_DOWN = 'BNET_CURSOR_DOWN'
export const BNET_CURSOR_MOVE = 'BNET_CURSOR_MOVE'
export const BNET_MOVE_VIEW = 'BNET_MOVE_VIEW'
export const BNET_CURSOR_UP = 'BNET_CURSOR_UP'
export const BNET_CURSOR_WHEEL = 'BNET_CURSOR_WHEEL'
export const BNET_CURSOR_PINCH = 'BNET_CURSOR_PINCH'

export const BNET_NOT_AUTH = 'BNET_NOT_AUTH'
export const BNET_CLEAR = 'BNET_CLEAR'

export const BNET_SELECT_FAMILY = 'BNET_SELECT_FAMILY'
export const BNET_READY_SELECT_PARENT = 'BNET_READY_SELECT_PARENT'
export const BNET_IMPORT_JSON = 'BNET_IMPORT_JSON'

const DEFAULT_ROOM = 'bnet-default'

/**
 * カーソルダウンからアップまでの短いとみなす時間
 */
const FAST_TIME_BETWEEN_DOWN_AND_UP = 200;

/**
 * カーソルダウンからダウンまでの短いとみなす時間
 */
const FAST_TIME_BETWEEN_DOWN_AND_DOWN = 300;

// ------------------------------------
// Actions
// ------------------------------------

/**
 * 接続を切る
 */
export function disConnect() {
  return (dispatch, getState) => {
    let state = getState();
    if (state.bnet.roomId) {
      firebaseDb.ref(`nodemap/${state.roomId}`).off();
    }
  }
}

export function loadTodos(val) {
  return (dispatch, getState) => {
    let state = getState();
    if (state.bnet.roomId) {
      firebaseDb.ref(`nodemap/${state.roomId}`).off();
    }
    let roomId = state.location.query["room-id"] || DEFAULT_ROOM;

    firebaseDb.ref(`room/${roomId}`).once('value', (snapshot) => {
      dispatch(loadRoomSuccess(snapshot));

      let ref = firebaseDb.ref(`nodemap/${roomId}`);
      ref.off();
      // valueを購読する。変更があれば、以下の処理が実行される。
      ref.once('value',
        (snapshot) => {
          dispatch(loadTodosSuccess({
            roomId : roomId,
            snapshot : snapshot,
            changeRoom : state.bnet.roomId !== roomId,
            viewArea : val,
          }));
          ref.on('child_added',
            (snapshot) => {
              dispatch(addNodeSuccess(snapshot));
            },
            (error) => {
              dispatch(loadTodosError(error));
            }
          );
          // 大量ノード同時編集に対応するためinvalidate実装を行う
          let timer = null;
          let info = {};
          ref.on('child_changed',
            (snapshot) => {
              info[snapshot.key] = snapshot.val();
              if (timer) {
                clearTimeout(timer);
              }
              timer = setTimeout(() => {
                dispatch(chnageNodeSuccess(info));
                info = {};
              }, 0);
            },
            (error) => {
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
        },
        (error) => {
          dispatch(loadTodosError(error));
        }
      );
    }, (error) => {
      dispatch(loadTodosError(error));
    });

    return dispatch({
      type    : BNET_CLEAR,
      payload : null
    });
  }
}

function loadRoomSuccess(value){
  return {
    type: BNET_RECEIVE_ROOM,
    payload: value
  }
}

function loadTodosSuccess(value){
  return {
    type: BNET_RECEIVE_DATA,
    payload: value
  }
}

function loadTodosError(error){
  if (error.code === 'PERMISSION_DENIED') {
    return {
      type: 'BNET_NOT_AUTH',
      message: error.message
    }
  } else {
    return {
      type: 'TODOS_RECIVE_ERROR',
      message: error.message
    }
  }
}

export function importJson (json) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let newMap = Object.assign({}, state.nodeMap);
    for (let k in newMap) {
      newMap[k] = null;
    }
    newMap = Object.assign({}, newMap, json.nodeMap);

    let ref = firebaseDb.ref(`nodemap/${state.roomId}`);
    ref.update(newMap)
    .then(() => {
      return dispatch({
        type    : BNET_IMPORT_JSON,
        payload : null
      });
    })
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        message: error.message,
      });
    });
  }
}

export function readyChangeText (value = "") {
  return {
    type    : BNET_READY_CHANGE_TEXT,
    payload : value
  }
}

export function initEditState () {
  return {
    type    : BNET_CHANGE_STATE,
    payload : 0
  }
}

export function completeChangeText (value = "") {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      let nextNode = Object.assign({}, node, {text : value});
      let ref = firebaseDb.ref(`nodemap/${state.roomId}/${node.id}`);
      ref.update(nextNode)
      .then(() => {
        return dispatch({
          type    : BNET_CHANGE_STATE,
          payload : 0
        });
      })
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

function completeChangeShape (value = 0) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      let nextNode = Object.assign({}, node, {shape : value});
      let ref = firebaseDb.ref(`nodemap/${state.roomId}/${node.id}`);
      ref.update(nextNode)
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

function completeChangeNodeColor (value = "#ffffff") {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      let nextNode = Object.assign({}, node, {color : value});
      let ref = firebaseDb.ref(`nodemap/${state.roomId}/${node.id}`);
      ref.update(nextNode)
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

function chnageNodeSuccess(val){
  return {
    type: BNET_CHANGE_NODE,
    payload: val
  }
}

export function cutParent (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let node = state.nodeMap[state.target];
    if (node) {
      let nextNode = Object.assign({}, node, {parentId : null});
      let ref = firebaseDb.ref(`nodemap/${state.roomId}/${node.id}`);
      ref.update(nextNode)
      .catch(error => {
        console.log(error);
        return dispatch({
          type: 'SAVE_NODE_ERROR',
          message: error.message,
        });
      });
    }

    return dispatch({
      type: BNET_READY_SELECT_PARENT,
      payload: null,
    });
  }
}

export function addNode () {
  return (dispatch, getState) => {
    _addNode(dispatch, getState);
  }
}

function _addNode(dispatch, getState) {
  let node = createNewNode(getState().bnet, true);
  var newPostKey = firebaseDb.ref().child('posts').push().key;
  node.id = newPostKey;
  node.created = TIMESTAMP;
  let state = getState().bnet;
  let ref = firebaseDb.ref(`nodemap/${state.roomId}/${node.id}`);
  ref.update(node)
  .then(() => dispatch({
    type    : BNET_SELECT_AND_READY_CHANGE_TEXT,
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
    // ファミリー
    let updates = {};
    updates[state.target] = null;
    for (let k in state.targetFamily) {
      updates[k] = null;
    }

    let ref = firebaseDb.ref(`nodemap/${state.roomId}`);
    ref.update(updates)
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
      let state = getState().bnet;
      let ref = firebaseDb.ref(`nodemap/${state.roomId}`);
      ref.push(value)
      .catch(error => dispatch({
        type: 'SAVE_NODE_ERROR',
        message: error.message,
      }));
  }
}

export function cursorUpNode (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;

    if (value.isTouchExist) {
      return;
    }

    let timeDiff = value.time - state.cursorState.cursorDownStartTime;
    if (timeDiff >= FAST_TIME_BETWEEN_DOWN_AND_UP) {
      return;
    }

    let node = state.nodeMap[state.target];
    let targetId = value.target;
    let nextParent = state.nodeMap[targetId];
    if (node && nextParent && state.state === 4) {
      // 親ノードへの参照を更新する

      // 自分と子孫を親にはできない
      let descentMap = getDescentMap(state.nodeMap, node.id, true);
      if (!(targetId in descentMap)) {
        let nextNode = Object.assign({}, node, {parentId : targetId});
        let ref = firebaseDb.ref(`nodemap/${state.roomId}/${node.id}`);
        ref.update(nextNode)
        .catch(error => {
          console.log(error);
          return dispatch({
            type: 'SAVE_NODE_ERROR',
            message: error.message,
          });
        });
      }

      return dispatch({
        type    : BNET_CHANGE_STATE,
        payload : 0
      });
    } else if (state.cursorState.drag) {
      // 選択済みノードが対象だったらテキスト編集に移行する
      if (state.target === targetId) {
        return dispatch({
          type: BNET_READY_CHANGE_TEXT,
          payload: null,
        });
      } else {
        return dispatch({
          type: BNET_SELECT_NODE,
          payload: targetId,
        });
      }
    }
  }
}

export function cursorDownNode (value) {
  return (dispatch, getState) => {
    if (!value.isMulitTouch) {
      return dispatch({
        type    : BNET_CURSOR_DOWN_NODE,
        payload : value.target
      });
    }
  }
}

export function cursorDown (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    let timeDiff = value.time - state.cursorState.cursorDownStartTime;
    let d2 = Math.pow(value.x - state.cursorState.x, 2) + Math.pow(value.x - state.cursorState.x, 2);
    // 洲早い２回操作、ある程度近くを２回 and フィールド上、マルチタッチではないなら新規ノード作成
    if (timeDiff < FAST_TIME_BETWEEN_DOWN_AND_DOWN && d2 < Math.pow(40, 2) && value.onField && !state.cursorState.drag) {
      _addNode(dispatch, getState);
    } else {
      return dispatch({
          type    : BNET_CURSOR_DOWN,
          payload : value
      });
    }
  }
}

export function cursorUp (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;

    // ノード移動を完了させる
    cursorMoveCommitExec();

    // カーソルダウンから間をおかずにアップしたかどうかをパラメータに追加
    let timeDiff = value.time - state.cursorState.cursorDownStartTime;

    return dispatch({
      type    : BNET_CURSOR_UP,
      payload : {
        fastUp : timeDiff < FAST_TIME_BETWEEN_DOWN_AND_UP,
        onField : value.onField,
      }
    });
  };
}

// ノード移動における通信量削減のための努力
let cursorMoveCommitTimer = null;
let cursorMoveCommitData = null;
let cursorMoveCommitFunc = null;
let cursorMoveCommitExec = () => {
  if (!cursorMoveCommitTimer) {
    clearTimeout(cursorMoveCommitTimer);
  }
  cursorMoveCommitTimer = null;
  if (cursorMoveCommitFunc) {
    cursorMoveCommitFunc();
    cursorMoveCommitFunc = null;
  }
};

export function cursorMove (value) {
  return (dispatch, getState) => {
    let state = getState().bnet;
    if (state.state === 0 && state.cursorState.drag && value.buttons > 0) {
      // 操作対象ノードを探す
      let node = state.nodeMap[state.target];
      if (node && state.cursorState.targetDrag) {
        // 移動先計算
        let p = {
          x : v2fScaler(state.viewArea, value.x - state.cursorState.cursorDownStartPoint.x),
          y : v2fScaler(state.viewArea, value.y - state.cursorState.cursorDownStartPoint.y)
        };
        p.x += state.cursorState.cursorDownStartTargetPoint.x;
        p.y += state.cursorState.cursorDownStartTargetPoint.y;

        // ノードを移動
        let nextNode = Object.assign({}, node, {
          x : p.x,
          y : p.y,
        });
        let dx = nextNode.x - node.x;
        let dy = nextNode.y - node.y;
        // ファミリー
        let nextFamily = {};
        nextFamily[state.target] = nextNode;
        for (let k in state.targetFamily) {
          let n = state.nodeMap[k];
          if (n) {
            nextFamily[k] = Object.assign({}, n, {
              x : n.x + dx,
              y : n.y + dy,
            });
          }
        }

        cursorMoveCommitData = nextFamily;
        let count = Object.keys(cursorMoveCommitData).length;

        // 移動が一定時間止まった場合のみコミットするならこの処理入れる
        // インターバル通信で十分か？
        // if (count > 1) {
        //   if (cursorMoveCommitTimer) {
        //     clearTimeout(cursorMoveCommitTimer);
        //     cursorMoveCommitTimer = null;
        //   }
        // }

        // ローカルでは即時反映に見せる
        value = Object.assign({}, value, {
          nodeMap : cursorMoveCommitData,
        });

        if (!cursorMoveCommitTimer) {
          cursorMoveCommitFunc = () => {
            let ref = firebaseDb.ref(`nodemap/${state.roomId}`);
            ref.update(cursorMoveCommitData)
            .catch(error => {
              console.log(error);
              return dispatch({
                type: 'SAVE_NODE_ERROR',
                payload: error.message,
              });
            });
          }

          cursorMoveCommitTimer = setTimeout(() => {
            cursorMoveCommitExec();
            // 要素数に応じてインターバルを増やす
          }, 50 + Math.min((count - 1) * 50, 950));
        }
        
        return dispatch({
          type    : BNET_CURSOR_MOVE,
          payload : value
        });
      } else {
        // ビューを移動
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

export function postPassword (value) {
  return (dispatch, getState) => {
    let state = getState();
    let roomId = state.location.query["room-id"] || DEFAULT_ROOM;
    let user = firebaseAuth.currentUser;
    let update = {};
    update[roomId] = value;
    let ref = firebaseDb.ref(`user/${user.uid}/room`);
    ref.update(update)
    .then(() => {
      dispatch(loadTodos());
    })
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        payload: error.message,
      });
    });
  }
}

function selectFamily(value){
  return {
    type: BNET_SELECT_FAMILY,
    payload: value
  }
}

export const actions = {
  disConnect,
  loadTodos,
  importJson,
  readyChangeText,
  initEditState,
  completeChangeText,
  completeChangeShape,
  completeChangeNodeColor,
  cutParent,
  addNode,
  removeNode,
  cursorUpNode,
  cursorDownNode,
  cursorDown,
  cursorUp,
  cursorMove,
  cursorWheel,
  cursorPinch,
  postPassword,
  selectFamily
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [BNET_CLEAR] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        nodeMap : {},
        notAuth : false,
      });
  },
  [BNET_NOT_AUTH] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        notAuth : true
      });
  },
  [BNET_RECEIVE_ROOM] : (state, action) => {
    let room = action.payload.val();

    return Object.assign({}, 
      state, 
      {
        roomId : action.payload.key,
        room : room,
      });
  },
  [BNET_RECEIVE_DATA] : (state, action) => {
    let nodeMap = action.payload.snapshot.val() || {};
    // データ変更などによる不足データを補う
    for (let k in nodeMap) {
      nodeMap[k] = assignNode(nodeMap[k]);
    }

    let viewArea = state.viewArea;
    if (action.payload.changeRoom) {
      // 部屋変更だったら位置を初期化
      viewArea = getAdjustedViewArea(nodeMap, action.payload.viewArea.width, action.payload.viewArea.height);
    }

    return Object.assign({}, 
      state, 
      {
        nodeMap : nodeMap,
        viewArea : viewArea,
        notAuth : false,
        state : 0,
        target : null,
        targetFamily : {},
      });
  },
  [BNET_IMPORT_JSON] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        state : 0,
        target : null,
        targetFamily : {},
      });
  },
  [BNET_READY_CHANGE_TEXT] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        state : 1,
      });
  },
  [BNET_CHANGE_STATE] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        state : action.payload,
        // target : null,
        // targetFamily : {},
      });
  },
  [BNET_CHANGE_NODE] : (state, action) => {
    let nextNodeMap = Object.assign({}, state.nodeMap, action.payload);
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

      return Object.assign({}, 
        state, 
        {
          nodeMap : nextNodeMap,
        });
    }
  },
  [BNET_SELECT_AND_READY_CHANGE_TEXT] : (state, action) => {
    let node = state.nodeMap[action.payload];

    return Object.assign({}, state, {
      state : 1,
      target : node.id,
      targetFamily : {},
      // viewArea : viewArea,
    });
  },
  [BNET_REMOVE_NODE] : (state, action) => {
    let nextNodeMap = Object.assign({}, state.nodeMap);
    delete nextNodeMap[action.payload.id];

    let target = state.target;
    let targetFamily = state.targetFamily;
    // 選択ノードが削除された
    if (target === action.payload.id) {
      target = null;
      targetFamily = {};
    }

    return Object.assign({}, 
      state, 
      {
        nodeMap : nextNodeMap,
        state : 0,
        target : target,
        targetFamily : targetFamily,
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
        targetFamily : state.target === action.payload ? state.targetFamily : {},
      });
  },
  [BNET_CURSOR_DOWN_NODE] : (state, action) => {
    let newTarget = (action.payload !== state.target);
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          drag : !newTarget,
          targetDrag : !newTarget,
        }),
      });
  },
  [BNET_CURSOR_DOWN] : (state, action) => {
    if (action.payload.isMulitTouch) {
      // ピンチ距離リセット
      return Object.assign({}, state, {
        cursorState : Object.assign({}, state.cursorState, {
          pinchDistance : 0,
        }),
      });
    }

    let s = 0;
    let target = state.target;
    let timeDiff = action.payload.time - state.cursorDownStartTime;
    let viewArea = state.viewArea;
    if (action.payload.onField) {
      // target = null;
      s = 0;
    } else {
      if (state.state === 4) {
        s = 4;
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
          cursorDownStartTime : action.payload.time,
          cursorDownStartPoint : {
            x : action.payload.x,
            y : action.payload.y,
          },
          cursorDownStartTargetPoint : target && state.nodeMap[target] ? {
            x : state.nodeMap[target].x,
            y : state.nodeMap[target].y,
          } : {
            x : 0,
            y : 0
          }
        }),
        menuPoint : Object.assign({}, state.menuPoint,
        {
          x : action.payload.x,
          y : action.payload.y,
        }),
        state : s,
        target : target,
        targetFamily : state.target === target ? state.targetFamily : {},
        viewArea : viewArea
      });
  },
  [BNET_CURSOR_UP] : (state, action) => {
    // フィールド場でカーソルダウンからアップが素早かった場合は選択解除
    let target = state.target;
    let targetFamily = state.targetFamily;
    if (action.payload.onField && action.payload.fastUp) {
      target = null;
      targetFamily = {};
    }

    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          drag : false,
          targetDrag : false,
        }),
        target : target,
        targetFamily : targetFamily,
      });
  },
  [BNET_CURSOR_MOVE] : (state, action) => {
    let nodeMap = action.payload.nodeMap || state.nodeMap;
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          x : action.payload.x,
          y : action.payload.y,
        }),
        state : 0,
        nodeMap : Object.assign({}, state.nodeMap, nodeMap)
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
  [BNET_SELECT_FAMILY] : (state, action) => {
    if (Object.keys(state.targetFamily).length) {
      return Object.assign({},
      state, 
      {
        targetFamily : {},
      });
    }

    let targetFamily = getDescentMap(state.nodeMap, state.target);

    return Object.assign({},
      state, 
      {
        targetFamily : targetFamily,
      });
  },
  [BNET_READY_SELECT_PARENT] : (state, action) => {
    return Object.assign({},
      state, 
      {
        state : 4,
      });
  },
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  width : 2000,
  height : 2000,
  roomId : DEFAULT_ROOM,
  room : {
    name : "",
    hint : "",
  },
  nodeMap : {},
  state : 0,
  notAuth : false,
  target : null,
  targetFamily : {},
  menuPoint : {
    x : 0,
    y : 0
  },
  lastClickTime : 0,
  viewArea : {
    left : 0,
    top : 0,
    scale : 2,
  },
  cursorState : {
    x : 0,
    y : 0,
    // ドラッグ中フラグ
    drag : false,
    // target内からドラッグを開始したフラグ
    targetDrag : false,
    // 最新のピンチ距離
    pinchDistance : 0,
    // カーソルダウン開始時間
    cursorDownStartTime : 0,
    // カーソルダウン開始位置
    cursorDownStartPoint : {
      x : 0,
      y : 0
    },
    // カーソルダウン開始時の操作対象ノード位置
    cursorDownStartTargetPoint : {
      x : 0,
      y : 0
    }
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
