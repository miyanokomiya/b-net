import React from 'react'
import { browserHistory, Router } from 'react-router'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Provider store={this.props.store}>
          <div style={{ height: '100%' }}>
            <Router history={browserHistory} children={this.props.routes} />
          </div>
        </Provider>
      </MuiThemeProvider>
    )
  }
}

export default App
