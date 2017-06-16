// ------------------------------------
// Constants
// ------------------------------------
export const BNET_NODE_WRITE = 'BNET_NODE_WRITE'

// ------------------------------------
// Actions
// ------------------------------------
export function write (value = '') {
  return {
    type    : BNET_NODE_WRITE,
    payload : value
  }
}

export const actions = {
  write,
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [BNET_NODE_WRITE]    : (state, action) => value,
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = 0
export default function counterReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
