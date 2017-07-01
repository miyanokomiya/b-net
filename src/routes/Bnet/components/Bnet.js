import React from 'react'
import PropTypes from 'prop-types'
import Node from './Node'
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import './Bnet.scss'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton';
import {f2v} from '../modules/canvasUtils'
import {getAncestorMap, getDescentMap, getSizeMap} from '../modules/nodeUtils'
import {blue500, red500, greenA200, fullWhite} from 'material-ui/styles/colors';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import EditNodeMenu from './EditNodeMenu';
import Snackbar from 'material-ui/Snackbar';

class Bnet extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  state = {
    openSnackBar : false,
    snackBarMessage : "",
  }

  componentDidUpdate () {
    // メニュー位置を調整する
    let menu = ReactDOM.findDOMNode(this.refs.menu);
    if (menu) {
      let rect = menu.getBoundingClientRect();
      let node = this.props.nodeMap[this.props.target];
      if (node) {
        let p = f2v(this.props.viewArea, node);
        menu.style.left = p.x - rect.width / 2 + "px";
        menu.style.top = p.y + 10 + "px";
      } else {
        let p = this.props.menuPoint;
        menu.style.left = p.x - rect.width / 2 + "px";
        menu.style.top = p.y - 25 + "px";
      }

      if (this.refs.textInput) {
        let input = ReactDOM.findDOMNode(this.refs.textInput);
        input.style.width = rect.width + "px";
        this.refs.textInput.focus();
      }
    }
  }

  componentDidMount () {
    this.componentDidUpdate();
    this.props.loadTodos();

    this.adjustSvgBox();

    // 画面リサイズでsvg領域を調整
    this._adjustSvgBox = () => {
      this.adjustSvgBox();
    };
    window.addEventListener('resize', this._adjustSvgBox);
  }

  componentWillUnmount () {
    // イベントハンドラ片付け
    window.removeEventListener('resize', this._adjustSvgBox);
    this.props.disConnect();
  }

  adjustSvgBox () {
    let svgBox = this.refs.svgBox;
    svgBox.style.height = window.innerHeight - 80 + "px";
  }

  openSnackBar (message) {
    this.setState({
      openSnackBar: true,
      snackBarMessage : message,
    });
  }

  closeSnackBar () {
    this.setState({
      openSnackBar: false,
    });
  };

  render () {
    let props = this.props;
    let closeSnackBar = () => {
      this.closeSnackBar();
    };

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

    if (props.state === 1) {
      let node = props.nodeMap[props.target];
      if (node) {
        $input = (
          <form ref="menu" onSubmit={props.completeChangeText} style={{position : 'absolute'}}>
            <TextField name="nodeText" ref="textInput" defaultValue={node.text} style={{backgroundColor:'#fff'}} inputStyle={{textAlign : 'center'}} />
          </form>
        );
      }
    } else if (props.state === 4) {
      // 親ノード選択中
    } else if (props.target && !props.cursorState.drag) {

      let node = props.nodeMap[props.target];
      if (node) {
        // 子孫持ちかを調べる
        let descentMap = getDescentMap(props.nodeMap, node.id);

        let cutParent = (e) => {
          // スナックバー表示
          this.openSnackBar("Select parent node, without the family.");
          props.cutParent(e);
        };

        $input = (
          <EditNodeMenu ref="menu"
            hasDescent={Object.keys(descentMap).length > 0}
            hasParent={node.parentId}
            nodeShape={node.shape}
            nodeColor={node.color}
            addNode={props.addNode}
            readyChangeText={props.readyChangeText}
            completeChangeShape={props.completeChangeShape}
            completeChangeNodeColor={props.completeChangeNodeColor}
            selectFamily={props.selectFamily}
            cutParent={cutParent}
            removeNode={props.removeNode}
          />
        )
      }
    }

    let postPassword = () => {
      let pass = this.refs.password.input.value;
      props.postPassword(pass);
    };

    let dialog = !props.notAuth ? "" : (
      <Dialog
        title="Please Password"
        actions={[
          <FlatButton
            label="Submit"
            primary={true}
            keyboardFocused={true}
            onTouchTap={postPassword}
          />
        ]}
        modal={true}
        open={true} >
        <TextField
          hintText={"Hint: " + props.room.hint}
          floatingLabelText="Password"
          floatingLabelFixed={true}
          type="password"
          ref="password"
        />
      </Dialog>
    );

    let vewBox = props.viewArea.left + " " + props.viewArea.top + " " + props.viewArea.scale * props.width + " " + props.viewArea.scale * props.height;
      
    return (
      <div ref="svgBox" className="svg-box" >
        <svg className="svg-canvas" version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg"
            viewBox={vewBox}
            onMouseDown={props.cursorDown}
            onMouseUp={props.cursorUp}
            onMouseLeave={props.cursorUp}
            onMouseMove={props.cursorMove}
            onWheel={props.cursorWheel}
            onTouchStart={props.cursorDown}
            onTouchEnd={props.cursorUp}
            onTouchCancel={props.cursorUp}
            onTouchMove={props.cursorMove} >
          {
            (function() {
              let sizeMap = getSizeMap(props.nodeMap);

              let ancestorMap = getAncestorMap(props.nodeMap, props.target);

              let list = [];
              let lineList = [];
              let lineHelper = "";
              for (let k in props.nodeMap) {
                let node = props.nodeMap[k];
                let size = sizeMap[node.id] || 0;
                let family = (k in props.targetFamily);
                let isTarget = node.id === props.target;
                list.push(
                  <Node key={node.id}
                    id={node.id}
                    text={node.text}
                    x={node.x} y={node.y}
                    target={isTarget}
                    state={node.state}
                    shape={node.shape}
                    color={node.color}
                    readyChangeText={props.readyChangeText}
                    cursorUpNode={props.cursorUpNode}
                    cursorDownNode={props.cursorDownNode}
                    refSize={size}
                    family={family} />
                );

                let parent = props.nodeMap[node.parentId];
                if (parent) {
                  let key = `${node.id}-${parent.id}`;
                  let line = (
                    <line key={key}
                      x1={node.x}
                      y1={node.y}
                      x2={parent.x}
                      y2={parent.y}
                      className={ancestorMap[node.id] === parent.id ? "ancestor-line" : ""}
                    />
                  )
                  lineList.push(line);
                }
              }
              return lineList.concat(list);
            })()
          }
        </svg>

        <Snackbar
          open={this.state.openSnackBar}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={closeSnackBar}
        />
        
        {$input}
        {dialog}
      </div>
    );
  }
}

export default Bnet
