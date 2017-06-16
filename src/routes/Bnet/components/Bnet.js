import React from 'react'
import PropTypes from 'prop-types'
import Node from './Node'
import ReactDOM from 'react-dom'

class Bnet extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    changeText: PropTypes.func.isRequired,
  }

  componentDidUpdate () {
    let input = ReactDOM.findDOMNode(this.refs.textInput);
    if (input) {
      input && input.focus();
    }

    let menu = ReactDOM.findDOMNode(this.refs.menu);
    if (menu) {
      let rect = menu.getBoundingClientRect();
      menu.style.left = this.props.menuPoint.x - rect.width / 2 + "px";
      menu.style.top = this.props.menuPoint.y + 10 + "px";
    }
  }

  componentDidMount () {
    this.componentDidUpdate();
  }

  render () {
    let props = this.props;

    let $input = "";
    if (props.state === 1) {
      let node = props.nodeMap[props.target];
      $input = (
        <form ref="menu" onSubmit={props.completeChangeText} style={{position : 'absolute'}}>
          <input type="text" ref="textInput" value={node.text} onChange={props.changeText} />
          {/*<input type="submit" value="確定" >*/}
        </form>
      );
    } else if (props.state === 2) {
      $input = (
        <form ref="menu" style={{position : 'absolute'}}>
          <input type="button" value="追加" onClick={props.addNode} />
        </form>
      );
    } else if (props.state === 3) {
      $input = (
        <form ref="menu" style={{position : 'absolute'}}>
          <input type="button" value="追加" onClick={props.addNode} />
          <input type="button" value="編集" onClick={props.readyChangeText} />
        </form>
      );
    }
      
    return (
      <div style={{ margin: '0 auto', width : props.width, height : props.height, position : 'relative' }} >
        <svg version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg"
            viewBox={props.viewArea.left + " " + props.viewArea.top + " " + props.viewArea.scale * props.width + " " + props.viewArea.scale * props.height}
            onClick={props.fieldClick}
            onMouseDown={props.cursorDown}
            onMouseUp={props.cursorUp}
            onMouseMove={props.cursorMove}
            onWheel={props.cursorWheel}
            style={{border : '1px solid'}} >
          {
            (function() {
              let list = [];
              let lineList = [];
              for (let k in props.nodeMap) {
                let node = props.nodeMap[k];
                list.push(
                  <Node key={node.id} id={node.id} text={node.text} x={node.x} y={node.y}
                    state={node.state} readyChangeText={props.readyChangeText} showNodeMenu={props.showNodeMenu} />
                );

                let parent = props.nodeMap[node.parentId];
                if (parent) {
                  let line = (
                    <line key={node.id + "-" + parent.id} x1={node.x} y1={node.y} x2={parent.x} y2={parent.y} stroke="#e74c3c" strokeWidth="2" />
                  )
                  lineList.push(line);
                }
              }
              return lineList.concat(list);
            })()
          }
        </svg>
        
        {$input}
      </div>
    );
  }
}

export default Bnet
