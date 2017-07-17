import React from 'react'
import PropTypes from 'prop-types'
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import Download from 'material-ui/svg-icons/file/file-download';
import Upload from 'material-ui/svg-icons/file/file-upload';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

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
            width={160}
            openSecondary={true}
            open={props.open}
            docked={false}
            onRequestChange={props.onRequestChange}
        >
            <Menu>
                <MenuItem primaryText="JSON" leftIcon={<Upload />} onTouchTap={props.execImportJson} />
                <Divider />
                <MenuItem primaryText="SVG" leftIcon={<Download />} onTouchTap={props.execExportSvg} />
                <MenuItem primaryText="JSON" leftIcon={<Download />} onTouchTap={props.execExportJson} />
            </Menu>
        </Drawer>
    );
  }
}

export default DrawerMenu