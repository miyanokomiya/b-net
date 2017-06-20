import React from 'react'
import { IndexLink, Link } from 'react-router'
import PropTypes from 'prop-types'
import './PageLayout.scss'
import AppBar from 'material-ui/AppBar';

class PageLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  render () {
    let props = this.props;
    let children = props.children;
    let linkList = (
      <div>
        <IndexLink to='/' activeClassName='page-layout__nav-item--active'>Home</IndexLink>
        {' | '}
        <Link to='/room' activeClassName='page-layout__nav-item--active'>Room</Link>
        {' | '}
        <Link to='/bnet' activeClassName='page-layout__nav-item--active'>Bnet</Link>
      </div>
    );

    return (
      <div className='container text-center'>
        <AppBar 
          title={linkList}
          showMenuIconButton={false}
        />
        <div className='page-layout__viewport'>
          {children}
        </div>
      </div>
    )
  }
}

// export const PageLayout = ({ children }) => (
//     <div className='container text-center'>
//     <AppBar 
//       title={children} 
//       iconClassNameRight="muidocs-icon-navigation-expand-more"
//     />
//     <IndexLink to='/' activeClassName='page-layout__nav-item--active'>Home</IndexLink>
//     {' · '}
//     <Link to='/counter' activeClassName='page-layout__nav-item--active'>Counter</Link>
//     {' · '}
//     <Link to='/bnet' activeClassName='page-layout__nav-item--active'>Bnet</Link>
//     <div className='page-layout__viewport'>
//       {children}
//     </div>
//   </div>
// )
// PageLayout.propTypes = {
//   children: PropTypes.node,
// }

export default PageLayout
