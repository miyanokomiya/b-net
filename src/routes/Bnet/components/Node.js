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
    let props = this.props;
    let text = ReactDOM.findDOMNode(this.refs.text);
    var bbox = text.getBBox();

    if (props.shape === 1) {
      let ellipse = ReactDOM.findDOMNode(this.refs.ellipse);
      let margin = 8;
      ellipse.rx.baseVal.value = (bbox.width) / 2 + margin;
      ellipse.ry.baseVal.value = (bbox.height) / 2 + margin;
      ellipse.cx.baseVal.value = bbox.x + bbox.width / 2;
      ellipse.cy.baseVal.value = bbox.y + bbox.height / 2;
    } else {
      let rect = ReactDOM.findDOMNode(this.refs.rect);
      let margin = 5;
      rect.x.baseVal.value = bbox.x - margin;
      rect.y.baseVal.value = bbox.y - margin;
      rect.width.baseVal.value = bbox.width + margin * 2;
      rect.height.baseVal.value = bbox.height + margin * 2;
    }
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

    let shape = "";
    if (props.shape === 1) {
      shape = (
        <ellipse className="shape" ref="ellipse" rx={width/2} ry={height/2} cx={props.x + width / 2} cy={props.y + height * 4 / 5} />
      );
    } else {
      shape = (
        <rect className="shape" ref="rect" width={width} height={height} x={props.x - width / 2} y={props.y - height * 4 / 5} />
      );
    }

    return (
      <g onMouseUp={props.selectNode}
        onTouchEnd={props.selectNode}
        onMouseDown={props.cursorDownNode}
        onTouchStart={props.cursorDownNode}
        data-id={props.id}
        className={className}>
        {shape}
        <text ref="text" x={props.x} y={props.y} fontSize={height} >
          {props.text || "-bnet-"}
        </text>
      </g>
    )
  }
}

export default Node
