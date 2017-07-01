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
      let ellipse = ReactDOM.findDOMNode(this.refs.shape);
      let edgeH = 8 + bbox.width / 10;
      let edgeV = 8 + edgeH / 10;
      ellipse.rx.baseVal.value = (bbox.width) / 2 + edgeH;
      ellipse.ry.baseVal.value = (bbox.height) / 2 + edgeV;
      ellipse.cx.baseVal.value = bbox.x + bbox.width / 2;
      ellipse.cy.baseVal.value = bbox.y + bbox.height / 2;
    } else if (props.shape === 2) {
      let circle = ReactDOM.findDOMNode(this.refs.shape);
      let margin = 8;
      circle.r.baseVal.value = (Math.max(bbox.width, bbox.height)) / 2 + margin;
      circle.cx.baseVal.value = bbox.x + bbox.width / 2;
      circle.cy.baseVal.value = bbox.y + bbox.height / 2;
    } else if (props.shape === 3) {
      let polygon = ReactDOM.findDOMNode(this.refs.shape);
      let margin = 48;
      let cx = bbox.x + bbox.width / 2;
      let cy = bbox.y + bbox.height / 2;
      let edgeH = bbox.width * 2 / 5;
      let edgeV = bbox.height / 3 + edgeH / 5;
      
      // pointsはSVGPointListなので仕様に従う
      // →一部ブラウザでは配列アクセスができなかった
      let p0 = polygon.points.getItem(0);
      p0.x = cx - bbox.width/2 - edgeH;
      p0.y = cy;
      let p1 = polygon.points.getItem(1);
      p1.x = cx;
      p1.y = cy + bbox.height/2 + edgeV;
      let p2 = polygon.points.getItem(2);
      p2.x = cx + bbox.width/2 + edgeH;
      p2.y = cy;
      let p3 = polygon.points.getItem(3);
      p3.x = cx;
      p3.y = cy - bbox.height/2 - edgeV;
    } else {
      let rect = ReactDOM.findDOMNode(this.refs.shape);
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
    let height = 30 + props.refSize * 7;
    let className = "node ";
    if (props.target) {
      className += "target ";
    }
    if (props.family) {
      className += "family ";
    }

    let shape = "";
    if (props.shape === 1) {
      shape = (
        <ellipse className="shape" ref="shape" rx={5} ry={5} cx={5} cy={5} />
      );
    } else if (props.shape === 2) {
      shape = (
        <circle className="shape" ref="shape" r={5} cx={5} cy={5} />
      );
    } else if (props.shape === 3) {
      shape = (
        <polygon className="shape" ref="shape" points="0,0 0,0 0,0 0,0" />
      );
    } else {
      shape = (
        <rect className="shape" ref="shape" width={5} height={5} x={5} y={5} />
      );
    }

    return (
      <g onMouseUp={props.cursorUpNode}
        onTouchEnd={props.cursorUpNode}
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
