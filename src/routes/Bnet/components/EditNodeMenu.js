import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import ContentCreate from 'material-ui/svg-icons/content/create'
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import ContentDeleteSweep from 'material-ui/svg-icons/content/delete-sweep'
import ContentContentCut from 'material-ui/svg-icons/content/content-cut'
import FlatButton from 'material-ui/FlatButton';
import HardwareDeviceHub from 'material-ui/svg-icons/hardware/device-hub'
import {blue500, red500, greenA200, fullWhite} from 'material-ui/styles/colors';
import ToggleCheckBoxOutlineBlank from 'material-ui/svg-icons/toggle/check-box-outline-blank'
import ToggleRadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-checked'
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import ImagePalette from 'material-ui/svg-icons/image/palette'
import ActionThumbUp from 'material-ui/svg-icons/action/thumb-up'
import ActionThumbDown from 'material-ui/svg-icons/action/thumb-down'

class EditNodeMenu extends React.Component {
  static propTypes = {
  }

  render () {
    let props = this.props;

    let $input = "";

    let iconSize = 18;
    let buttonStyle = {
      backgroundColor: blue500,
      borderRadius: "3px",
      width: iconSize*2,
      height: iconSize*2,
      padding: iconSize/2,
      margin: 1,
    };
    let iconStyle = {
      width: iconSize,
      height: iconSize,
    };

    // 削除は目立たないように
    let removeButtonStyle = Object.assign({}, buttonStyle, {
      backgroundColor: "#999"
    });
    
    // スターボタン、自分がスター付けていたらスター解除ボタン
    let starButton = (
      <IconButton tooltip="" onTouchTap={props.completeChangeNodeStar} style={buttonStyle} iconStyle={iconStyle}>
        {props.isStar ? <ActionThumbDown color={fullWhite} /> : <ActionThumbUp color={fullWhite} />}
      </IconButton>
    );
    // ノード追加ボタン
    let addNodeButton = (
      <IconButton tooltip="" onTouchTap={props.addNode} style={buttonStyle} iconStyle={iconStyle}>
        <ContentAddBox color={fullWhite} />
      </IconButton>
    );
    // テキスト編集ボタン
    let editTextButton = (
      <IconButton tooltip="" onTouchTap={props.readyChangeText} style={buttonStyle} iconStyle={iconStyle}>
        <ContentCreate color={fullWhite} />
      </IconButton>
    );
    // 形状選択ボタン＆メニュー
    let selectShapeButton = (
      <IconMenu
        iconButtonElement={
          <IconButton tooltip="" style={buttonStyle} iconStyle={iconStyle}>
            <ToggleCheckBoxOutlineBlank color={fullWhite} />
          </IconButton>
        }
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        value={props.nodeShape}
        onChange={props.completeChangeShape}
      >
        <MenuItem value={0} primaryText="Rectangle" />
        <MenuItem value={1} primaryText="Elipse" />
        <MenuItem value={2} primaryText="Circle" />
        <MenuItem value={3} primaryText="Diamond" />
      </IconMenu>
    );
    // 色選択ボタン＆メニュー
    let selectColorButton = (
      <IconMenu
        iconButtonElement={
          <IconButton tooltip="" style={buttonStyle} iconStyle={iconStyle}>
            <ImagePalette color={fullWhite} />
          </IconButton>
        }
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        value={props.nodeColor}
        onChange={props.completeChangeNodeColor}
      >
        <MenuItem value={"#ffffff"} primaryText="White" style={{backgroundColor:"#ffffff"}} />
        <MenuItem value={"#32cd32"} primaryText="Green" style={{backgroundColor:"#32cd32"}} />
        <MenuItem value={"#ffd700"} primaryText="Yellow" style={{backgroundColor:"#ffd700"}} />
        <MenuItem value={"#ff6347"} primaryText="Red" style={{backgroundColor:"#ff6347"}} />
      </IconMenu>
    );
    // 子孫がいるなら子孫一括選択ボタンを表示
    let selectFamilyButton = !props.hasDescent ? "" : (
      <IconButton tooltip="" onTouchTap={props.selectFamily} style={buttonStyle} iconStyle={iconStyle}>
        <HardwareDeviceHub color={fullWhite} />
      </IconButton>
    );
    // 親切り替えボタン
    let cutButton = (
      <IconButton tooltip="" onTouchTap={props.cutParent} style={buttonStyle} iconStyle={iconStyle}>
        <ActionSupervisorAccount color={fullWhite} />
      </IconButton>
    );
    // ノード削除ボタン
    let removeNodeButton = (
      <IconButton tooltip="" onTouchTap={props.removeNode} style={removeButtonStyle} iconStyle={iconStyle}>
        <ContentDeleteSweep color={fullWhite} />
      </IconButton>
    );
    
    return (
      <form style={{position : 'absolute', display : 'inline-table'}}>
        {starButton}
        {addNodeButton}
        {/*editTextButton*/}
        {selectShapeButton}
        {selectColorButton}<br/>
        {selectFamilyButton}
        {cutButton}
        {removeNodeButton}
      </form>
    );
  }
}

export default EditNodeMenu
