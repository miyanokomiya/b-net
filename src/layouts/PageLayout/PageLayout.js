import React from 'react'
import { IndexLink, Link } from 'react-router'
import PropTypes from 'prop-types'
import './PageLayout.scss'
import AppBar from 'material-ui/AppBar';
import ActionHome from 'material-ui/svg-icons/action/home'
import IconButton from 'material-ui/IconButton'
import {blue500, red500, greenA200, fullWhite} from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class PageLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render () {
    let props = this.props;
    let children = props.children;
    let linkList = (
      <div>
        {/*<IndexLink to='/' activeClassName='page-layout__nav-item--active'>Home</IndexLink>
        {' | '}
        <IndexLink to='/room' activeClassName='page-layout__nav-item--active'>Room</IndexLink>
        {' | '}
        <Link to='/bnet' activeClassName='page-layout__nav-item--active'>Bnet</Link>
        */}
      </div>
    );

    return (
      <div className='container text-center'>
        <div className='page-layout__viewport'>
          {children}
        </div>
      </div>
    )
  }
}

export default PageLayout
