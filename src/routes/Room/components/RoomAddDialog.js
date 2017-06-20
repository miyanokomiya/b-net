import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton'
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import ContentCreate from 'material-ui/svg-icons/content/create'
import ContentDeleteSweep from 'material-ui/svg-icons/content/delete-sweep'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

class RoomCard extends React.Component {
  static propTypes = {
  }

  componentDidUpdate () {
  }

  componentDidMount () {
    this.componentDidUpdate();
  }

  render () {
    let props = this.props;

    let submit = () => {
        this.props.submit({
        name : this.refs.roomNameInput.input.value,
        password : this.refs.roomPasswordInput.input.value,
      });
    };

    const actions = [
      <FlatButton
        label="Create"
        primary={true}
        keyboardFocused={true}
        onTouchTap={submit}
      />,
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={props.cancel}
      />,
    ];

    return (
      <div>
        <Dialog
          title="New Room"
          actions={actions}
          modal={false}
          open={true}
          onRequestClose={props.cancel} >
          <TextField
            hintText="Input your room's name."
            floatingLabelText="Name"
            floatingLabelFixed={true}
            ref="roomNameInput"
          />
          <TextField
            hintText="Input your room's password."
            floatingLabelText="Password"
            floatingLabelFixed={true}
            ref="roomPasswordInput"
          />
        </Dialog>
      </div>
    )
  }
}

export default RoomCard
