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
    rect.y.baseVal.value = bbox.y;
    rect.width.baseVal.value = bbox.width + margin * 2;
    rect.height.baseVal.value = bbox.height;
  }

  componentDidMount () {
    this.componentDidUpdate();
  }

  render () {
    let props = this.props;
    let width = props.text.length * 20;
    let height = 20;
    let fill = "#fff";

    return (
      <g onDoubleClick={props.showNodeMenu} data-id={props.id}>
        <rect ref="rect" width={width} height={height} x={props.x - width / 2} y={props.y - height * 4 / 5} fill={fill} stroke="#666" strokeWidth={height / 10} />
        <text ref="text" x={props.x} y={props.y} fontSize={height} fill="black" stroke="black" textAnchor="middle">
          {props.text || "-"}
        </text>
      </g>
    )
  }
}

export default Node
