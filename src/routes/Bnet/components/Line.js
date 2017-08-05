import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {m, lineStyle} from './SvgStyle'

const MIN_VALUE = 0.001;
const CURVATURE_RATE = 1 / 40;
const DIFF_RAD = CURVATURE_RATE * 3.2;

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

    let style = m(lineStyle.nodeLine, props.ancestor ? lineStyle.ancestorLine : {});

    const distance = Math.pow(Math.pow(node.x - parent.x, 2) + Math.pow(node.y - parent.y, 2), 1/2);
    let line = "";
    let polygon = "";

    // 近すぎたら線を作らない
    if (distance > MIN_VALUE) {
      let rad = Math.atan2(node.y - parent.y, node.x - parent.x);
      let r = 16;

      const center = {
        x : (node.x + parent.x) / 2,
        y : (node.y + parent.y) / 2,
      };

      // 向きマーカーを作る
      // 線の曲がりに合わせる(目分量調整)
      let adRad = rad + DIFF_RAD;
      let p0 = `${center.x + r * Math.cos(adRad)},${center.y + r * Math.sin(adRad)}`;
      let p1 = `${center.x + r * Math.cos(adRad + Math.PI * 3 / 4)},${center.y + r * Math.sin(adRad + Math.PI * 3 / 4)}`;
      let p2 = `${center.x + r / 3 * Math.cos(adRad + Math.PI)},${center.y + r / 3 * Math.sin(adRad + Math.PI)}`;
      let p3 = `${center.x + r * Math.cos(adRad + Math.PI * 5 / 4)},${center.y + r * Math.sin(adRad + Math.PI * 5 / 4)}`;
      let points = `${p0} ${p1} ${p2} ${p3}`;
      polygon = (
        <polygon points={points} style={{fill:style.stroke, strokeLinejoin:'round'}} />
      );

      // 微妙に揺らげる
      // 距離に依らない曲率にする
      const margin = distance * CURVATURE_RATE;
      const a = {
        x : (node.x + center.x) / 2,
        y : (node.y + center.y) / 2,
      };
      const b = {
        x : (parent.x + center.x) / 2,
        y : (parent.y + center.y) / 2,
      };
      const c = {
        x : margin * Math.cos(rad + Math.PI / 2) + a.x,
        y : margin * Math.sin(rad + Math.PI / 2) + a.y,
      };
      const d = {
        x : margin * Math.cos(rad - Math.PI / 2) + b.x,
        y : margin * Math.sin(rad - Math.PI / 2) + b.y,
      };

      line = (
        <path
          d={`M ${node.x},${node.y} Q ${c.x},${c.y} ${center.x},${center.y} T ${parent.x},${parent.y}`}
          className={classList.join(" ")}
        />
      );

      // line = (
      //   <line
      //     x1={node.x}
      //     y1={node.y}
      //     x2={parent.x}
      //     y2={parent.y}
      //     className={classList.join(" ")}
      //   />
      // );

    }

    return (
      <g style={style}>
        {line}
        {polygon}
      </g>
    );
  }
}

export default Line
