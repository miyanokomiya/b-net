import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path : 'room',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Room = require('./containers/RoomContainer').default
      const reducer = require('./modules/room').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'room', reducer })

      /*  Return getComponent   */
      cb(null, Room)

    /* Webpack named bundle   */
    }, 'room')
  }
})
