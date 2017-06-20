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

class Room extends React.Component {
  static propTypes = {
  }
  
  state = {
    open: false,
  };

  componentDidUpdate () {
  }

  componentDidMount () {
    this.componentDidUpdate();
    this.props.loadTodos();
  }

  handleOpen = (key) => {
    let room = this.props.roomMap[key];
    this.setState({open: true, key: key, room: room});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  editComplete = () => {
    let data = {
      name : this.refs.roomNameInput.input.value
    };

    this.props.editComplete(this.state.key, data);
    this.handleClose();
  };

  render () {
    let props = this.props;
    const actions = [
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.editComplete}
      />,
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
    ];

    let handleOpen = this.handleOpen;

    let dialog = !this.state.open ? "" : (
      <Dialog
        title="Edit Room"
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={this.handleClose} >
        <TextField
          hintText="Input your room's name."
          floatingLabelText="Name"
          floatingLabelFixed={true}
          ref="roomNameInput"
          defaultValue={this.state.room.name}
        />
      </Dialog>
    );

    return (
      <div>
        <IconButton tooltip="Add" onTouchTap={props.addRoom}>
          <ContentAddBox />
        </IconButton>
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
                readyEditRoom={handleOpen}
                deleteRoom={props.deleteRoom} />
            )
          }
          return list.reverse();
        })()}

        {dialog}
      </div>
    )
  }
}

export default Room
