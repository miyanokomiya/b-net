import {firebaseDb, TIMESTAMP} from '../../../../firebase/'
const ref = firebaseDb.ref('room');

// ------------------------------------
// Constants
// ------------------------------------
export const ROOM_LOAD_ROOM_SUCCESS = 'ROOM_LOAD_ROOM_SUCCESS'
export const ROOM_ADD_ROOM_SUCCESS = 'ROOM_ADD_ROOM_SUCCESS'
export const ROOM_EDIT_ROOM_SUCCESS = 'ROOM_EDIT_ROOM_SUCCESS'
export const ROOM_REMOVE_ROOM_SUCCESS = 'ROOM_REMOVE_ROOM_SUCCESS'

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
        dispatch(loadRoomListSuccess(snapshot));
        ref.on('child_added',
          (snapshot) => {
            dispatch(addRoomSuccess(snapshot));
          },
          (error) => {
            dispatch(loadTodosError(error));
          }
        );
        ref.on('child_changed',
          (snapshot) => {
            dispatch(editRoomSuccess(snapshot));
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
        dispatch(removeRoomSuccess(snapshot));
      },
      (error) => {
        dispatch(loadTodosError(error));
      }
    );
  }
}

function loadRoomListSuccess(snapshot){
  return {
    type: ROOM_LOAD_ROOM_SUCCESS,
    payload: snapshot.val()
  }
}

function loadTodosError(error){
  return {
    type: 'TODOS_RECIVE_ERROR',
    message: error.message
  }
}

function addRoom(value) {
  return (dispatch, getState) => {
    let room = createRoom();
    ref.push(room)
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        payload: error.message,
      });
    });
  }
}

function addRoomSuccess(value) {
  return {
    type: ROOM_ADD_ROOM_SUCCESS,
    payload: value
  }
}

function editRoom(key, data) {
  return (dispatch, getState) => {
    let room = data;
    firebaseDb.ref(`room/${key}`).update(room)
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        payload: error.message,
      });
    });
  }
}

function editRoomSuccess(value) {
  return {
    type: ROOM_EDIT_ROOM_SUCCESS,
    payload: value
  }
}

function deleteRoom(key) {
  return (dispatch, getState) => {
    firebaseDb.ref(`room/${key}`).remove()
    .catch(error => {
      console.log(error);
      return dispatch({
        type: 'SAVE_NODE_ERROR',
        payload: error.message,
      });
    });
  }
}

function removeRoomSuccess(value) {
  return {
    type: ROOM_REMOVE_ROOM_SUCCESS,
    payload: value
  }
}

export const actions = {
  loadTodos,
  addRoom,
  editRoom,
  deleteRoom,
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ROOM_LOAD_ROOM_SUCCESS] : (state, action) => {
    let roomMap = action.payload;
    // データ変更などによる不足データを補う
    for (let k in roomMap) {
      roomMap[k] = assignRoom(roomMap[k]);
    }

    return Object.assign({}, 
      state, 
      {
        roomMap : roomMap
      });
  },
  [ROOM_ADD_ROOM_SUCCESS] : (state, action) => {
    let data = action.payload;
    if (state.roomMap[data.key]) {
      return state;
    }
    
    // データ変更などによる不足データを補う
    let room = assignRoom(data.val());

    let nextRoomMap = Object.assign({}, state.roomMap);
    nextRoomMap[data.key] = room;

    return Object.assign({}, 
      state, 
      {
        roomMap : nextRoomMap,
      });
  },
  [ROOM_EDIT_ROOM_SUCCESS] : (state, action) => {
    let nextRoomMap = Object.assign({}, state.roomMap);
    nextRoomMap[action.payload.key] = action.payload.val();
    return Object.assign({}, 
      state, 
      {
        roomMap : nextRoomMap,
      });
  },
  [ROOM_REMOVE_ROOM_SUCCESS] : (state, action) => {
    let nextRoomMap = Object.assign({}, state.roomMap);
    delete nextRoomMap[action.payload.key];

    return Object.assign({}, 
      state, 
      {
        roomMap : nextRoomMap,
      });
  },
}

function createRoom() {
  return {
    created : TIMESTAMP,
    id : "",
    name : "bnet"
  };
}

function assignRoom(room) {
  let init = createRoom();
  return Object.assign({}, init, room);
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  roomMap : {},
}

export default function roomReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
