import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import RoomCard from './RoomCard'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import ContentCreate from 'material-ui/svg-icons/content/create'
import RoomAddDialog from './RoomAddDialog'
import RoomEditDialog from './RoomEditDialog'
import {fullWhite} from 'material-ui/styles/colors';

class Room extends React.Component {
  static propTypes = {
  }
  
  state = {
    open: false,
    openAddDialog: false,
    editRoomId : null,
  };

  componentDidUpdate () {
    if (this.refs.roomNameInput) {
      this.refs.roomNameInput.focus();
    }
  }

  componentDidMount () {
    this.componentDidUpdate();
    this.props.loadTodos();
  }

  componentWillUnmount () {
    this.props.disConnect();
  }

  openEditDialog = (key) => {
    this.setState({open: true, editRoomId: key});
  };

  closeEditDialog = () => {
    this.setState({editRoomId: null});
  };

  openAddDialog = () => {
    this.setState({openAddDialog: true});
  };

  closeAddDialog = () => {
    this.setState({openAddDialog: false});
  };

  submitAddDialog = (data) => {
    this.setState({openAddDialog: false});
    this.props.addRoom(data);
  };

  editComplete = (data) => {
    this.props.editComplete(this.state.editRoomId, data);
    this.closeEditDialog();
  };

  render () {
    let props = this.props;
    let openEditDialog = this.openEditDialog;

    let editDialog = "";
    if (this.state.editRoomId) {
      let editRoomId = this.state.editRoomId;
      let room = this.props.roomMap[editRoomId];
      editDialog = (
        <RoomEditDialog
          roomId={editRoomId}
          name={room.name}
          password={props.passwordMap[editRoomId]}
          hint={room.hint}
          editComplete={this.editComplete}
          cancel={this.closeEditDialog} />
      );
    }
    

    let roomAddDialog = !this.state.openAddDialog ? "" : (
      <RoomAddDialog submit={this.submitAddDialog} cancel={this.closeAddDialog} />
    );

    let confirmDeleteRoom = (roomId) => {
      this.setState({deleteTarget: roomId});
    };

    let cancelDeleteRoom = () => {
      this.setState({deleteTarget: null});
    };

    let execDeleteRoom = (roomId) => {
      props.deleteRoom(this.state.deleteTarget);
      this.setState({deleteTarget: null});
    };

    let confirmDeleteDialog = !this.state.deleteTarget ? "" : (
      <Dialog
        title="Confirm"
        actions={[
          <FlatButton
            label="Delete"
            primary={true}
            onTouchTap={execDeleteRoom}
          />,
          <FlatButton
            label="Cancel"
            primary={true}
            keyboardFocused={true}
            onTouchTap={cancelDeleteRoom}
          />,
        ]}
        modal={false}
        open={true}
        onRequestClose={cancelDeleteRoom} >
        Are you sure that you want to delete?
      </Dialog>
    );

    return (
      <div>
        {/*<IconButton tooltip="Add" onTouchTap={this.openAddDialog}>
          <ContentAddBox />
        </IconButton>*/}
        <FlatButton
          backgroundColor="#a4c639"
          hoverColor="#8AA62F"
          icon={<ContentAddBox color={fullWhite} />}
          style={{
            margin: "5px 0", width: "100%",
          }}
          onTouchTap={this.openAddDialog}
        />
        {(function() {
          let list = [];
          for (let k in props.roomMap) {
            let room = props.roomMap[k];
            list.push(
              <RoomCard
                key={k}
                id={k}
                created={room.created}
                name={room.name}
                hint={room.hint}
                notAuth={!(k in props.passwordMap)}
                readyEditRoom={openEditDialog}
                deleteRoom={confirmDeleteRoom}
                loadPassword={props.loadPassword}
                postPassword={props.postPassword} />
            )
          }
          return list.reverse();
        })()}

        {editDialog}
        {roomAddDialog}
        {confirmDeleteDialog}
      </div>
    )
  }
}

export default Room
