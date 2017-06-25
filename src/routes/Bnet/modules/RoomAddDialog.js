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

class RoomAddDialog extends React.Component {
  static propTypes = {
  }

  componentDidUpdate () {
    if (this.refs.roomNameInput) {
      this.refs.roomNameInput.focus();
    }
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
        hint : this.refs.roomHintInput.input.value,
      });
    };

    const actions = [
      <FlatButton
        label="Create"
        primary={true}
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
          onRequestClose={props.cancel}
        >
          <form onSubmit={submit}>
            <TextField
              floatingLabelText="Name"
              floatingLabelFixed={true}
              ref="roomNameInput"
            />
            <br/>
            <TextField
              hintText="Omissible"
              floatingLabelText="Password"
              floatingLabelFixed={true}
              type="password"
              ref="roomPasswordInput"
            />
            <br/>
            <TextField
              hintText="Omissible"
              floatingLabelText="Hint of password"
              floatingLabelFixed={true}
              ref="roomHintInput"
            />
            <FlatButton
              type="submit"
              label="Submit"
              primary={true}
              style={{display:"none"}}
            />
          </form>
        </Dialog>
      </div>
    )
  }
}

export default RoomAddDialog
