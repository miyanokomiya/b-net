import {firebaseDb, TIMESTAMP, firebaseAuth} from '../../../../firebase/'
const ref = firebaseDb.ref('room');

// ------------------------------------
// Constants
// ------------------------------------
export const ROOM_LOAD_ROOM_SUCCESS = 'ROOM_LOAD_ROOM_SUCCESS'
export const ROOM_ADD_ROOM_SUCCESS = 'ROOM_ADD_ROOM_SUCCESS'
export const ROOM_EDIT_ROOM_SUCCESS = 'ROOM_EDIT_ROOM_SUCCESS'
export const ROOM_REMOVE_ROOM_SUCCESS = 'ROOM_REMOVE_ROOM_SUCCESS'
export const ROOM_GET_PASSWORD_SUCCESS = 'ROOM_GET_PASSWORD_SUCCESS'
export const ROOM_NOT_AUTH = 'ROOM_NOT_AUTH'

// ------------------------------------
// Actions
// ------------------------------------

/**
 * 接続を切る
 */
export function disConnect() {
  return (dispatch, getState) => {
    ref.off();
  }
}

export function loadTodos() {
  return dispatch => {
    ref.off();
    // valueを購読する。変更があれば、以下の処理が実行される。
    ref.once('value',
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
        ref.on('child_removed',
          (snapshot) => {
            dispatch(removeRoomSuccess(snapshot));
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

function addRoom(data) {
  return (dispatch, getState) => {
    // ルームのパスワードはルームデータから隔離して保存
    let room = assignRoom({
      name : data.name,
      hint : data.hint,
    });
    var newPostKey = firebaseDb.ref().child('posts').push().key;
    var updates = {};
    updates['/room/' + newPostKey] = room;
    if (data.password) {
      updates['/roomkey/' + newPostKey] = data.password;
      let user = firebaseAuth.currentUser;
      updates['/user/' + user.uid + '/room/' + newPostKey] = data.password;
    }

    firebaseDb.ref().update(updates)
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
    // ルームのパスワードはルームデータから隔離して保存
    let room = assignRoom({
      name : data.name,
      hint : data.hint,
    });
    var updates = {};
    updates['/room/' + key] = room;
    let password = null;
    if (data.password) {
      password = data.password;
    }

    updates['/roomkey/' + key] = password;
    let user = firebaseAuth.currentUser;
    updates['/user/' + user.uid + '/room/' + key] = password;

    firebaseDb.ref().update(updates)
    .then(() => {
      // ローカルのパスワード更新
      return dispatch({
        type: ROOM_GET_PASSWORD_SUCCESS,
        payload: {
          roomId : key,
          password : data.password,
        },
      });
    })
    .catch(error => {
      if (error.code === 'PERMISSION_DENIED') {
        // 認証されていない
        return dispatch({
          type: ROOM_NOT_AUTH,
          payload: key
        });
      } else {
        return dispatch({
          type: 'TODOS_RECIVE_ERROR',
          message: error.message
        });
      }
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
    var updates = {};
    updates['/room/' + key] = null;
    updates['/roomkey/' + key] = null;
    updates['/nodemap/' + key] = null;
    let user = firebaseAuth.currentUser;
    updates['/user/' + user.uid + '/room/' + key] = null;
    firebaseDb.ref().update(updates)
    .catch(error => {
      if (error.code === 'PERMISSION_DENIED') {
        // 認証されていない
        return dispatch({
          type: ROOM_NOT_AUTH,
          payload: key
        });
      } else {
        return dispatch({
          type: 'TODOS_RECIVE_ERROR',
          message: error.message
        });
      }
    });
  }
}

function removeRoomSuccess(value) {
  return {
    type: ROOM_REMOVE_ROOM_SUCCESS,
    payload: value
  }
}

function loadPassword(roomId) {
  return (dispatch, getState) => {
    // 部屋パスワードを取得する
    firebaseDb.ref(`roomkey/${roomId}`).once('value',
      (snapshot) => {
        // 認証済みあれば成功する
        return dispatch({
          type: ROOM_GET_PASSWORD_SUCCESS,
          payload: {
            roomId : snapshot.key,
            password : snapshot.val(),
          },
        });
      },
      (error) => {
        if (error.code === 'PERMISSION_DENIED') {
          // 認証されていない
          return dispatch({
            type: ROOM_NOT_AUTH,
            payload: roomId
          });
        } else {
          return dispatch({
            type: 'TODOS_RECIVE_ERROR',
            message: error.message
          });
        }
      }
    );
  }
}

function postPassword (roomId, value) {
  return (dispatch, getState) => {
    let user = firebaseAuth.currentUser;
    let update = {};
    update[roomId] = value;
    let ref = firebaseDb.ref(`user/${user.uid}/room`);
    ref.update(update)
    .then(() => {
      // 認証成功したか試す
      dispatch(loadPassword(roomId));
    })
    .catch(error => {
    });
  }
}

export const actions = {
  disConnect,
  loadTodos,
  addRoom,
  editRoom,
  deleteRoom,
  loadPassword,
  postPassword,
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
    let room = state.roomMap[action.payload.key];
    nextRoomMap[action.payload.key] = Object.assign({}, room, action.payload.val());
    return Object.assign({},
      state, 
      {
        roomMap : nextRoomMap,
      });
  },
  [ROOM_REMOVE_ROOM_SUCCESS] : (state, action) => {
    let key = action.payload.key;
    let nextRoomMap = Object.assign({}, state.roomMap);
    delete nextRoomMap[key];

    // 認証情報削除
    let nextPasswordMap = Object.assign({}, state.passwordMap);
    delete nextPasswordMap[key];

    return Object.assign({}, state, {
      roomMap : nextRoomMap,
      passwordMap : nextPasswordMap
    });
  },
  [ROOM_GET_PASSWORD_SUCCESS] : (state, action) => {
    let key = action.payload.roomId;
    let val = action.payload.password;
    // 認証情報保存
    let nextPasswordMap = Object.assign({}, state.passwordMap);
    nextPasswordMap[key] = val;

    return Object.assign({}, state, {
      passwordMap : nextPasswordMap
    });
  },
  [ROOM_NOT_AUTH] : (state, action) => {
    let key = action.payload;
    // 認証情報削除
    let nextPasswordMap = Object.assign({}, state.passwordMap);
    delete nextPasswordMap[key];

    return Object.assign({}, state, {
      passwordMap : nextPasswordMap
    });
  },
}

function createRoom() {
  return {
    created : TIMESTAMP,
    name : "bnet",
    hint : "",
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
  passwordMap : {},
}

export default function roomReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
