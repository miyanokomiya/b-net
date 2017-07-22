import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {m, nodeStyle} from './SvgStyle'
import ToggleStarBorder from 'material-ui/svg-icons/toggle/star-border.js'

class Node extends React.Component {
  static propTypes = {
    readyChangeText : PropTypes.func.isRequired,
  }

  state = {
    adjusted : false,
  }

  componentDidUpdate () {
    let props = this.props;
    let node = props.node;

    // 内容が変更されていたらサイズ調整を行う
    if (!this.state.adjusted) {
      let text = ReactDOM.findDOMNode(this.refs.text);
      var bbox = text.getBBox();

      let userStar = ReactDOM.findDOMNode(this.refs.userStar);


      if (node.shape === 1) {
        let ellipse = ReactDOM.findDOMNode(this.refs.shape);
        let edgeH = 16 + bbox.width / 10;
        let edgeV = 16 + edgeH / 10;
        ellipse.rx.baseVal.value = (bbox.width) / 2 + edgeH;
        ellipse.ry.baseVal.value = (bbox.height) / 2 + edgeV;
        ellipse.cx.baseVal.value = bbox.x + bbox.width / 2;
        ellipse.cy.baseVal.value = bbox.y + bbox.height / 2;
      } else if (node.shape === 2) {
        let circle = ReactDOM.findDOMNode(this.refs.shape);
        let margin = 16;
        circle.r.baseVal.value = (Math.max(bbox.width, bbox.height)) / 2 + margin;
        circle.cx.baseVal.value = bbox.x + bbox.width / 2;
        circle.cy.baseVal.value = bbox.y + bbox.height / 2;
      } else if (node.shape === 3) {
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
        let margin = 12;
        rect.x.baseVal.value = bbox.x - margin * 3;
        rect.y.baseVal.value = bbox.y - margin;
        rect.width.baseVal.value = bbox.width + margin * 6;
        rect.height.baseVal.value = bbox.height + margin * 2;
      }

      // 調整済み
      this.setState({
        adjusted : true
      });
    }
  }

  componentDidMount () {
    this.componentDidUpdate();
  }

  componentWillReceiveProps () {
    // 調整が必要
    this.setState({
      adjusted : false
    });
  }

  render () {
    let props = this.props;
    let node = props.node;
    let height = 30 + props.refSize * 7;
    let shapeStyle = nodeStyle.shape;
    if (props.target) {
      shapeStyle = m(shapeStyle, nodeStyle.shapeTarget);
    }
    if (props.family) {
      shapeStyle = m(shapeStyle, nodeStyle.shapeFamily);
    }

    let shape = "";
    if (node.shape === 1) {
      shape = (
        <ellipse style={shapeStyle} ref="shape" fill={node.color} rx={5} ry={5} cx={5} cy={5} />
      );
    } else if (node.shape === 2) {
      shape = (
        <circle style={shapeStyle} ref="shape" fill={node.color} r={5} cx={5} cy={5} />
      );
    } else if (node.shape === 3) {
      shape = (
        <polygon style={shapeStyle} ref="shape" fill={node.color} points="0,0 0,0 0,0 0,0" />
      );
    } else {
      shape = (
        <rect style={shapeStyle} ref="shape" fill={node.color} width={5} height={5} x={5} y={5} />
      );
    }

    let text = null;
    let value = "";
    if (node.text) {
      // 複数行は分割してtext要素を作成することで実現する
      let lines = node.text.split(/\r\n|\r|\n/);
      value = [];
      lines.forEach((line, i) => {
        // リンクに対応
        if (line.startsWith("http://") || line.startsWith("https://")) {
          value.push(
            <text style={nodeStyle.text} key={i} x={node.x} y={node.y + i * height} fontSize={height} >
              <a fill="blue" href={line} target="_blank">{line}</a>
            </text>
          );
        } else {
          // 上下の空行はサイズ認識してくれない
          value.push(
            <text style={nodeStyle.text} key={i} x={node.x} y={node.y + i * height} fontSize={height} >
              {line || ".."}
            </text>
          );
        }
      });
    } else {
      // 空の時の表示
      value = (
        <text style={nodeStyle.text} x={node.x} y={node.y} fontSize={height} >
          {"-bnet-"}
        </text>
      );
    }

    text = (
      <g ref="text">
        {value}
      </g>
    );

    let userStar = [];
    if (node.userStar) {
      let nodeStarList = Object.keys(node.userStar);
      let odd = (nodeStarList.length % 2 === 0);
      let size = height * 1.5;
      let rate = size / 28;
      let dSufix = `l ${-5 * rate},${7 * rate} l ${-8 * rate},${0 * rate} l ${5 * rate},${5 * rate} l ${-3 * rate},${8 * rate} l ${11 * rate},${-5 * rate} l ${11 * rate},${5 * rate} l ${-3 * rate},${-8 * rate} l ${5 * rate},${-5 * rate} l ${-8 * rate},${0 * rate} Z`;
      nodeStarList.forEach((user, i) => {
        let dx = 0;
        if (odd) {
          dx = Math.floor((i + 1) / 2) * size;
          dx = (i % 2) === 0 ? -dx : dx;
          dx -= size / 2;
        } else {
          if (i > 0) {
            dx = Math.floor((i + 1) / 2) * size + size / 2;
            dx = (i % 2) === 0 ? -dx : dx;
          }
        }
        let d = `M ${node.x + dx},${node.y - 2.2 * height} ${dSufix}`;
        userStar.push((
          <path key={i} className={props.target || props.family ? "" : "appeal"} style={nodeStyle.star} fill={node.color} d={d} />
        ));
      });
    }

    return (
      <g onMouseUp={props.cursorUpNode}
        onTouchEnd={props.cursorUpNode}
        onMouseDown={props.cursorDownNode}
        onTouchStart={props.cursorDownNode}
        data-id={node.id}
        style={nodeStyle.g}
      >
        {shape}
        {text}
        {userStar}
      </g>
    )
  }
}

export default Node
