// ------------------------------------
// Constants
// ------------------------------------
export const BNET_CHANGE_TEXT = 'BNET_CHANGE_TEXT'
export const BNET_READY_CHANGE_TEXT = 'BNET_READY_CHANGE_TEXT'
export const BNET_COMPLETE_CHANGE_TEXT = 'BNET_COMPLETE_CHANGE_TEXT'
export const BNET_STORE_MENU_POINT = 'BNET_STORE_MENU_POINT'
export const BNET_ADD_NODE = 'BNET_ADD_NODE'
export const BNET_SHOW_NODE_MENU = 'BNET_SHOW_NODE_MENU'

export const BNET_CURSOR_DOWN = 'BNET_CURSOR_DOWN'
export const BNET_CURSOR_MOVE = 'BNET_CURSOR_MOVE'
export const BNET_CURSOR_UP = 'BNET_CURSOR_UP'
export const BNET_CURSOR_WHEEL = 'BNET_CURSOR_WHEEL'

// ------------------------------------
// Actions
// ------------------------------------

export function changeText (value = "") {
  return {
    type    : BNET_CHANGE_TEXT,
    payload : value
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

export function fieldClick (value) {
  return {
    type    : BNET_STORE_MENU_POINT,
    payload : value
  }
}

export function addNode (value) {
  return {
    type    : BNET_ADD_NODE,
    payload : value
  }
}

export function showNodeMenu (value) {
  return {
    type    : BNET_SHOW_NODE_MENU,
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
  return {
    type    : BNET_CURSOR_UP,
    payload : value
  }
}

export function cursorMove (value) {
  return {
    type    : BNET_CURSOR_MOVE,
    payload : value
  }
}

export function cursorWheel (value) {
  return {
    type    : BNET_CURSOR_WHEEL,
    payload : value
  }
}

export const actions = {
  changeText,
  readyChangeText,
  completeChangeText,
  fieldClick,
  addNode,
  showNodeMenu,
  cursorDown,
  cursorUp,
  cursorMove,
  cursorWheel,
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
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
  [BNET_STORE_MENU_POINT] : (state, action) => {
    let s = state.state;
    let target = state.target;

    let timeDiff = action.payload.time - state.lastClickTime;
    if (action.payload.onField) {
      if (timeDiff < 200) {
        s = 2;
        target = null;
      } else {
        s = 0;
      }
    } else {
      if (s === 2) {
        s = 0;
      }
    }

    return Object.assign({}, 
      state, 
      {
        menuPoint : {
          x : action.payload.x,
          y : action.payload.y,
        },
        state : s,
        target : target,
        lastClickTime : action.payload.time
      });
  },
  [BNET_ADD_NODE] : (state, action) => {
    let node = createNode();
    node.parentId = state.target;
    if (node.parentId) {
      let parent = state.nodeMap[node.parentId];
      node.x = parent.x + 30;
      node.y = parent.y + 30;
    } else {
      let p = v2f(state.viewArea, state.menuPoint)
      node.x = p.x;
      node.y = p.y;
    }
    let obj = {};
    obj[node.id] = node;

    return Object.assign({}, 
      state, 
      {
        nodeMap : Object.assign({}, state.nodeMap, obj),
        state : 0,
        menuPoint : {
          x : action.payload.x,
          y : action.payload.y,
        },
      });
  },
  [BNET_SHOW_NODE_MENU] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        state : 3,
        target : action.payload.target,
      });
  },
  [BNET_CURSOR_DOWN] : (state, action) => {
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          x : action.payload.x,
          y : action.payload.y,
          drag : true,
        }),
        target : action.payload.target,
        state : 0,
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
    if (!state.cursorState.drag) {
      return state;
    }

    let dx = action.payload.x - state.cursorState.x;
    let dy = action.payload.y - state.cursorState.y;
    dx *= state.viewArea.scale;
    dy *= state.viewArea.scale;

    let nodeMap, viewArea;
    if (state.target) {
      let node = state.nodeMap[state.target];
      let nextNode = Object.assign({}, node, {
        x : node.x + dx,
        y : node.y + dy,
      });
      let nodeMapDiff = {};
      nodeMapDiff[nextNode.id] = nextNode;
      nodeMap = Object.assign({}, state.nodeMap, nodeMapDiff);
    } else {
      viewArea = Object.assign({}, state.viewArea, {
        left : state.viewArea.left - dx,
        top : state.viewArea.top - dy,
      });
    }
    
    return Object.assign({}, 
      state, 
      {
        cursorState : Object.assign({}, state.cursorState,
        {
          x : action.payload.x,
          y : action.payload.y,
        }),
        viewArea : viewArea || state.viewArea,
        nodeMap : nodeMap || state.nodeMap,
        state : 0,
      });
  },
  [BNET_CURSOR_WHEEL] : (state, action) => {
    let scale = state.viewArea.scale / Math.pow(1.01, action.payload.deltaX);
    scale = Math.max(scale, 0.1);
    scale = Math.min(scale, 10);

    // カーソル位置を基準にスケール変更
    let tmpViewArea = Object.assign({}, state.viewArea, {
      scale : scale,
    });
    let f = v2f(state.viewArea, action.payload);
    let f2 = v2f(tmpViewArea, action.payload);
    let dx = f.x - f2.x;
    let dy = f.y - f2.y;

    return Object.assign({},
      state, 
      {
        viewArea : Object.assign({}, state.viewArea,
        {
          scale : scale,
          left : state.viewArea.left + dx,
          top : state.viewArea.top + dy,
        }),
        state : 0,
      });
  },
}

function generateUuid() {
    // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
    // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case "x":
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case "y":
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join("");
}

export function createNode() {
  return {
    x : 0,
    y : 0,
    parentId : null,
    text : "",
    id : generateUuid(),
  };
}

function v2f(viewArea, p) {
  return {
    x : p.x * viewArea.scale + viewArea.left,
    y : p.y * viewArea.scale + viewArea.top,
  }
}
function f2v(viewArea, p) {
  return {
    x : (p.x - viewArea.left) / viewArea.scale,
    y : (p.y - viewArea.top) / viewArea.scale,
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  width : 400,
  height : 250,
  nodeMap : {},
  state : 0,
  target : null,
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
    delta : 1,
    drag : false,
  },
}

for (let i = 0; i < 3; i++) {
  let node = createNode();
  node.x = 100;
  node.y += i * 30 + 100;
  initialState.nodeMap[node.id] = node;
}

export default function bnetReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
