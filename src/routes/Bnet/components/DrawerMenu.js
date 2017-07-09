import React from 'react'
import PropTypes from 'prop-types'
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';

/**
 * drawerメニューコンポーネント
 */
class DrawerMenu extends React.Component {
  static propTypes = {
  }

  state = {
  }

  render () {
    let props = this.props;
    
    return (
        <Drawer
            width={100}
            openSecondary={true}
            open={props.open}
            docked={false}
            onRequestChange={props.onRequestChange}
        >
            <FlatButton
                label="Export"
                primary={true}
                fullWidth={true}
                keyboardFocused={true}
                onTouchTap={props.execExport}
            />
        </Drawer>
    );
  }
}

export default DrawerMenu