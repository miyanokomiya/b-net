import React from 'react'
import PropTypes from 'prop-types'
import Node from './Node'
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import './Bnet.scss'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton';
import {f2v, v2f, v2fScaler} from '../modules/canvasUtils'
import {getAncestorMap, getDescentMap, getSizeMap} from '../modules/nodeUtils'
import {blue500, red500, greenA200, fullWhite} from 'material-ui/styles/colors';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import EditNodeMenu from './EditNodeMenu';
import Snackbar from 'material-ui/Snackbar';
import AppBar from 'material-ui/AppBar';
import ActionHome from 'material-ui/svg-icons/action/home'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { IndexLink, Link } from 'react-router'
import MoreVert from 'material-ui/svg-icons/navigation/more-vert'
import DrawerMenu from './DrawerMenu'
import {m, svgStyle, lineStyle} from './SvgStyle'
import {firebaseAuth} from '../../../../firebase/'

class Bnet extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  state = {
    openSnackBar : false,
    snackBarMessage : "",
    openDrawer : false,
  }

  componentDidUpdate () {
    // メニュー位置を調整する
    let menu = ReactDOM.findDOMNode(this.refs.menu);
    if (menu) {
      let rect = menu.getBoundingClientRect();
      let node = this.props.nodeMap[this.props.target];
      if (node) {
        let nodeDom = ReactDOM.findDOMNode(this.refs.target);
        let nodeRect = nodeDom.getBoundingClientRect();
        let p = {
          x : nodeRect.left + nodeRect.width / 2,
          y : nodeRect.top + nodeRect.height / 2
        };
        // 余白も考慮する必要あり(16はなぜかずれる)
        const space = ReactDOM.findDOMNode(this.refs.svgBox);
        const spaceRect = space.getBoundingClientRect();
        menu.style.left = p.x - rect.width / 2 - spaceRect.left + "px";
        menu.style.top = p.y - spaceRect.top + rect.height / 2 + "px";
      }
    }

    if (this.refs.textInput) {
      this.refs.textInput.input.refs.input.focus();
    }
  }

  componentDidMount () {
    this.componentDidUpdate();
    this.adjustSvgBox();
    let svgBox = this.refs.svgBox;
    this.props.loadTodos({
      width : svgBox.clientWidth,
      height : svgBox.clientHeight,
    });

    // 画面リサイズでsvg領域を調整
    this._adjustSvgBox = () => {
      this.adjustSvgBox();
    };
    window.addEventListener('resize', this._adjustSvgBox);
  }

  componentWillUnmount () {
    // イベントハンドラ片付け
    window.removeEventListener('resize', this._adjustSvgBox);
    this.props.disConnect();
  }

  adjustSvgBox () {
    let svgBox = this.refs.svgBox;
    svgBox.style.height = window.innerHeight - 80 + "px";
  }

  openSnackBar (message) {
    this.setState({
      openSnackBar: true,
      snackBarMessage : message,
    });
  }

  /**
   * SVG出力
   */
  serializeSvg () {
    let svgDom = ReactDOM.findDOMNode(this.refs.svg).cloneNode(true);

    // 表示領域をキャンバス領域とするよう調整
    let svgBox = ReactDOM.findDOMNode(this.refs.svgBox);
    let viewBox = svgDom.attributes.viewBox;
    let values = viewBox.value.split(" ");
    // キャンバスサイズを表示サイズに合わせる
    svgDom.attributes.width.value = v2fScaler(this.props.viewArea, svgBox.clientWidth);
    svgDom.attributes.height.value = v2fScaler(this.props.viewArea, svgBox.clientHeight);
    // viewBoxをキャンバスサイズに合わせる(違和感のある調整だがこれでうまくいく)
    values[2] = svgDom.attributes.width.value;
    values[3] = svgDom.attributes.height.value;
    viewBox.value = values.join(" ");

    let serializer = new XMLSerializer();
    let xml = serializer.serializeToString(svgDom);

    this.downloadText(xml, `${this.props.room.name || "b-net"}.svg`);
  }

  /**
   * json出力
   */
  serializeJson () {
    let obj = {
      nodeMap : this.props.nodeMap,
      room : this.props.room,
    }
    let json = JSON.stringify(obj);
    this.downloadText(json, `${this.props.room.name || "b-net"}.json`);
  }

  /**
   * テキストファイルダウンロード
   * @param {String} text 内容
   * @param {String} fileName ファイル名 
   */
  downloadText (text, fileName) {
    // ダウンロード処理
    var blob = new Blob([ text ], { "type" : "text/plain" });
    if (window.navigator.msSaveBlob) { 
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.target = '_blank';
      a.download = fileName;
      a.click();
    }
  }

  /**
   * jsonインポート
   */
  importJson() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", (e) => {
      let file = e.target.files;
      //FileReaderの作成
      let reader = new FileReader();
      //テキスト形式で読み込む
      reader.readAsText(file[0]);
      
      //読込終了後の処理
      reader.onload = (ev) => {
        try {
          let json = JSON.parse(reader.result);
          this.props.importJson(json);
        } catch (e) {
          this.openSnackBar("Invalid file.");
        }
      }
    });
    input.click();
  }

  render () {
    let props = this.props;

    let textDialog = "";
    let editMenu = "";

    let iconSize = 18;
    let buttonStyle = {
      backgroundColor: blue500,
      borderRadius: "3px",
      width: iconSize*2,
      height: iconSize*2,
      padding: iconSize/2,
      margin: 1,
    };
    let iconStyle = {
      width: iconSize,
      height: iconSize,
    };

    if (props.state === 1) {
      let node = props.nodeMap[props.target];
      if (node) {
        let completeChangeText = (e) => {
          e.preventDefault();
          const text = this.refs.textInput.input.refs.input.value;
          props.completeChangeText(text);
        };

        textDialog = (
          <Dialog
            title="Node Text"
            actions={[
              <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={completeChangeText}
              />,
              <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={props.initEditState}
              />
            ]}
            onRequestClose={props.initEditState}
            open={true} >
            <TextField
              hintText={"bnet"}
              multiLine={true}
              fullWidth={true}
              rows={5}
              textareaStyle={{textAlign : "center"}}
              ref="textInput"
              defaultValue={node.text}
            />
          </Dialog>
        );
      }
    } else if (props.state === 4) {
      // 親ノード選択中
    } else if (props.target && !props.cursorState.drag) {

      let node = props.nodeMap[props.target];
      if (node) {
        // 子孫持ちかを調べる
        let descentMap = getDescentMap(props.nodeMap, node.id);

        let cutParent = (e) => {
          // スナックバー表示
          this.openSnackBar("Select parent node, without the family.");
          props.cutParent(e);
        };

        editMenu = (
          <EditNodeMenu ref="menu"
            hasDescent={Object.keys(descentMap).length > 0}
            hasParent={node.parentId}
            nodeShape={node.shape}
            nodeColor={node.color}
            isStar={node.userStar[firebaseAuth.currentUser.uid]}
            addNode={props.addNode}
            readyChangeText={props.readyChangeText}
            completeChangeShape={props.completeChangeShape}
            completeChangeNodeColor={props.completeChangeNodeColor}
            completeChangeNodeStar={props.completeChangeNodeStar}
            selectFamily={props.selectFamily}
            cutParent={cutParent}
            removeNode={props.removeNode}
          />
        )
      }
    }

    let postPassword = () => {
      let pass = this.refs.password.input.value;
      props.postPassword(pass);
    };

    let dialog = !props.notAuth ? "" : (
      <Dialog
        title="Please Password"
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
          hintText={"Hint: " + props.room.hint}
          floatingLabelText="Password"
          floatingLabelFixed={true}
          type="password"
          ref="password"
        />
      </Dialog>
    );

    let vewBox = props.viewArea.left + " " + props.viewArea.top + " " + props.width * props.viewArea.scale + " " + props.height * props.viewArea.scale;
      
    return (
      <div>
        <MuiThemeProvider>
          <AppBar 
            title={props.room.name}
            showMenuIconButton={true}
            iconElementLeft={
              <Link to='/room'>
                <IconButton><ActionHome color={fullWhite} /></IconButton>
              </Link>
            }
            iconElementRight={
              <IconButton
                onTouchTap={() => this.setState({openDrawer:true})}
              >
                <MoreVert
                  color={fullWhite}
                />
              </IconButton>
            }
          />
        </MuiThemeProvider>

        <DrawerMenu
          open={this.state.openDrawer}
          onRequestChange={(openDrawer) => this.setState({openDrawer})}
          execExportSvg={() => {this.serializeSvg()}}
          execExportJson={() => {this.serializeJson()}}
          execImportJson={(e) => {this.importJson(e)}}
        />

        <div ref="svgBox" className="svg-box" >
          <svg ref="svg" style={svgStyle} version="1.1" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg"
              viewBox={vewBox}
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
                let sizeMap = getSizeMap(props.nodeMap);

                let ancestorMap = getAncestorMap(props.nodeMap, props.target);

                let list = [];
                let lineList = [];
                let lineHelper = "";
                for (let k in props.nodeMap) {
                  let node = props.nodeMap[k];
                  let size = sizeMap[node.id] || 0;
                  let family = (k in props.targetFamily);
                  let isTarget = node.id === props.target;
                  list.push(
                    <Node key={node.id} ref={isTarget ? "target" : ""}
                      id={node.id}
                      text={node.text}
                      x={node.x} y={node.y}
                      target={isTarget}
                      state={node.state}
                      shape={node.shape}
                      color={node.color}
                      userStar={node.userStar}
                      readyChangeText={props.readyChangeText}
                      cursorUpNode={props.cursorUpNode}
                      cursorDownNode={props.cursorDownNode}
                      refSize={size}
                      family={family} />
                  );

                  let parent = props.nodeMap[node.parentId];
                  if (parent) {
                    let key = `${node.id}-${parent.id}`;
                    let classList = [];
                    // ビュー移動中でなければラインアニメーション用クラス追加
                    // →スムーズになるきがする
                    if (!props.cursorState.drag || props.cursorState.targetDrag) {
                      classList.push("animate-line");
                    }
                    let line = (
                      <line key={key}
                        x1={node.x}
                        y1={node.y}
                        x2={parent.x}
                        y2={parent.y}
                        style={m(lineStyle.nodeLine, ancestorMap[node.id] === parent.id ? lineStyle.ancestorLine : {})}
                        className={classList.join(" ")}
                      />
                    )
                    lineList.push(line);
                  }
                }
                return lineList.concat(list);
              })()
            }
            <line x1={0} y1={-50} x2={0} y2={50} style={lineStyle.crossLine} />
            <line x1={-50} y1={0} x2={50} y2={0} style={lineStyle.crossLine} />
          </svg>
          {editMenu}
        </div>
        {textDialog}
        {dialog}

        <Snackbar
          open={this.state.openSnackBar}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={() => this.setState({openSnackBar:false})}
        />
      </div>
    );
  }
}

export default Bnet
