import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path : 'bnet',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Bnet = require('./containers/BnetContainer').default
      const reducer = require('./modules/bnet').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'bnet', reducer })

      /*  Return getComponent   */
      cb(null, Bnet)

    /* Webpack named bundle   */
    }, 'bnet')
  }
})
