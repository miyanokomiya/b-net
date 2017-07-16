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

  state = {
    adjusted : false,
  }

  componentDidUpdate () {
    let props = this.props;

    // 内容が変更されていたらサイズ調整を行う
    if (!this.state.adjusted) {
      let text = ReactDOM.findDOMNode(this.refs.text);
      var bbox = text.getBBox();

      if (props.shape === 1) {
        let ellipse = ReactDOM.findDOMNode(this.refs.shape);
        let edgeH = 16 + bbox.width / 10;
        let edgeV = 16 + edgeH / 10;
        ellipse.rx.baseVal.value = (bbox.width) / 2 + edgeH;
        ellipse.ry.baseVal.value = (bbox.height) / 2 + edgeV;
        ellipse.cx.baseVal.value = bbox.x + bbox.width / 2;
        ellipse.cy.baseVal.value = bbox.y + bbox.height / 2;
      } else if (props.shape === 2) {
        let circle = ReactDOM.findDOMNode(this.refs.shape);
        let margin = 16;
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
        <ellipse className="shape" ref="shape" fill={props.color} rx={5} ry={5} cx={5} cy={5} />
      );
    } else if (props.shape === 2) {
      shape = (
        <circle className="shape" ref="shape" fill={props.color} r={5} cx={5} cy={5} />
      );
    } else if (props.shape === 3) {
      shape = (
        <polygon className="shape" ref="shape" fill={props.color} points="0,0 0,0 0,0 0,0" />
      );
    } else {
      shape = (
        <rect className="shape" ref="shape" fill={props.color} width={5} height={5} x={5} y={5} />
      );
    }

    // リンクを張れるようにする
    let text = null;
    if (props.target && props.text.startsWith("http://") || props.text.startsWith("https://")) {
      text = (
        <text ref="text" x={props.x} y={props.y} fontSize={height} >
          <a fill="blue" href={props.text} target="_blank">{props.text}</a>
        </text>
      );
    } else {
      let value = "";
      if (props.text) {
        // 複数行は分割してtext要素を作成することで実現する
        let lines = props.text.split(/\r\n|\r|\n/);
        value = [];
        // 上下の空行はサイズ認識してくれない
        lines.forEach((line, i) => {
          value.push(
            <text key={i} x={props.x} y={props.y + i * height} fontSize={height} >
              {line || ".."}
            </text>
          );
        });
      } else {
        // 空の時の表示
        value = (
          <text x={props.x} y={props.y} fontSize={height} >
            {"-bnet-"}
          </text>
        );
      }
      text = (
        <g ref="text">
          {value}
        </g>
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
        {text}
      </g>
    )
  }
}

export default Node
