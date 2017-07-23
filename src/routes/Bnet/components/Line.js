import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {m, lineStyle} from './SvgStyle'

class Line extends React.Component {
  static propTypes = {
  }

  state = {
  }

  componentDidUpdate () {
  }

  componentDidMount () {
  }

  componentWillReceiveProps () {
  }

  render () {
    let props = this.props;
    let node = props.node;
    let parent = props.parent;

    let classList = [];
    // アニメーション有効切り替え
    if (props.animation) {
      classList.push("animate-line");
    }
    let center = {
      x : (node.x + parent.x) / 2,
      y : (node.y + parent.y) / 2,
    };
    let style = m(lineStyle.nodeLine, props.ancestor ? lineStyle.ancestorLine : {});
    let rad = Math.atan2(node.y - parent.y, node.x - parent.x);
    let r = 16;
    let points = `${center.x + r * Math.cos(rad)},${center.y + r * Math.sin(rad)} ${center.x + r * Math.cos(rad + Math.PI * 3 / 4)},${center.y + r * Math.sin(rad + Math.PI * 3 / 4)} ${center.x + r * Math.cos(rad + Math.PI * 5 / 4)},${center.y + r * Math.sin(rad + Math.PI * 5 / 4)}`;
                    

    return (
      <g style={style}>
        <line
          x1={node.x}
          y1={node.y}
          x2={parent.x}
          y2={parent.y}
          className={classList.join(" ")}
        />
        <polygon points={points} />
      </g>
    );
  }
}

export default Line
