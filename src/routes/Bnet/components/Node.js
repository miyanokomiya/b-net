import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

class Node extends React.Component {
  static propTypes = {
    text : PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,

    fill : PropTypes.string,

    readyChangeText : PropTypes.func.isRequired,
  }

  componentDidUpdate () {
    let text = ReactDOM.findDOMNode(this.refs.text);
    var bbox = text.getBBox();

    let rect = ReactDOM.findDOMNode(this.refs.rect);
    let margin = 5;
    rect.x.baseVal.value = bbox.x - margin;
    rect.y.baseVal.value = bbox.y - margin;
    rect.width.baseVal.value = bbox.width + margin * 2;
    rect.height.baseVal.value = bbox.height + margin * 2;
  }

  componentDidMount () {
    this.componentDidUpdate();
  }

  render () {
    let props = this.props;
    let width = props.text.length * 20;
    let height = 30 + props.refSize * 7;
    let className = "";
    if (props.target) {
      className += "target ";
    }
    if (props.family) {
      className += "family ";
    }

    return (
      <g onMouseUp={props.selectNode}
        onTouchEnd={props.selectNode}
        onMouseDown={props.cursorDownNode}
        onTouchStart={props.cursorDownNode}
        data-id={props.id}
        className={className}>
        <rect ref="rect" width={width} height={height} x={props.x - width / 2} y={props.y - height * 4 / 5} />
        <text ref="text" x={props.x} y={props.y} fontSize={height} >
          {props.text || "-bnet-"}
        </text>
      </g>
    )
  }
}

export default Node
