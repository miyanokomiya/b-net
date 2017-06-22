import React from 'react'
import PropTypes from 'prop-types'
import Node from './Node'
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import ActionHome from 'material-ui/svg-icons/action/home'
import ContentCreate from 'material-ui/svg-icons/content/create'
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import ContentDeleteSweep from 'material-ui/svg-icons/content/delete-sweep'
import ContentContentCut from 'material-ui/svg-icons/content/content-cut'
import './Bnet.scss'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton';
import {f2v} from '../modules/canvasUtils'

class Bnet extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    changeText: PropTypes.func.isRequired,
  }

  componentDidUpdate () {
    if (this.refs.textInput) {
      this.refs.textInput.focus();
    }

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
  }

  adjustSvgBox () {
    let svgBox = this.refs.svgBox;
    svgBox.style.height = window.innerHeight - 80 + "px";
  }

  render () {
    let props = this.props;

    let $input = "";
    if (props.state === 1) {
      let node = props.nodeMap[props.target];
      if (node) {
        $input = (
          <form ref="menu" onSubmit={props.completeChangeText} style={{position : 'absolute'}}>
            <TextField name="textInput" ref="textInput" value={node.text} onChange={props.changeText} style={{backgroundColor:'#fff'}} inputStyle={{textAlign : 'center'}} />
          </form>
        );
      }
    } else if (props.state === 2) {
      $input = (
        <form ref="menu" style={{position : 'absolute'}}>
          <IconButton tooltip="Add" onTouchTap={props.addNode}>
            <ContentAddBox />
          </IconButton>
        </form>
      );
    } else if (props.target && !props.cursorState.drag) {
      let node = props.nodeMap[props.target];
      if (node) {
        let cutButton = !props.nodeMap[node.parentId] ? "" : (
          <IconButton tooltip="Cut" onTouchTap={props.cutParent}>
            <ContentContentCut />
          </IconButton>
        );
        $input = (
          <form ref="menu" style={{position : 'absolute'}}>
            <IconButton tooltip="Add" onTouchTap={props.addNode}>
              <ContentAddBox />
            </IconButton>
            <IconButton tooltip="Edit" onTouchTap={props.readyChangeText}>
              <ContentCreate />
            </IconButton>
            {cutButton}
            <IconButton tooltip="Delete" onTouchTap={props.removeNode}>
              <ContentDeleteSweep />
            </IconButton>
          </form>
        );
      }
    }

    let postPassword = () => {
      let pass = this.refs.password.input.value;
      props.postPassword(pass);
    };

    let dialog = !props.notAuth ? "" : (
      <Dialog
        title="Not Auth"
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
          hintText="Input this room's password."
          floatingLabelText="Password"
          floatingLabelFixed={true}
          ref="password"
        />
      </Dialog>
    );

    let vewBox = props.viewArea.left + " " + props.viewArea.top + " " + props.viewArea.scale * props.width + " " + props.viewArea.scale * props.height;
      
    return (
      <div ref="svgBox" className="svg-box" >
        <svg className="svg-canvas" version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg"
            viewBox={vewBox}
            onClick={props.fieldClick}
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
              let sizeMap = {};
              for (let k in props.nodeMap) {
                let node = props.nodeMap[k];
                if (node.parentId) {
                  if (sizeMap[node.parentId]) {
                    sizeMap[node.parentId]++;
                  } else {
                    sizeMap[node.parentId] = 1;
                  }
                }
              }

              let list = [];
              let lineList = [];
              for (let k in props.nodeMap) {
                let node = props.nodeMap[k];
                let size = sizeMap[node.id] || 0;
                list.push(
                  <Node key={node.id} id={node.id} text={node.text} x={node.x} y={node.y} target={node.id === props.target}
                    state={node.state} readyChangeText={props.readyChangeText} selectNode={props.selectNode} refSize={size} />
                );

                let parent = props.nodeMap[node.parentId];
                if (parent) {
                  let line = (
                    <line key={node.id + "-" + parent.id} x1={node.x} y1={node.y} x2={parent.x} y2={parent.y} />
                  )
                  lineList.push(line);
                }
              }
              return lineList.concat(list);
            })()
          }
        </svg>
        
        {$input}
        {dialog}
      </div>
    );
  }
}

export default Bnet
