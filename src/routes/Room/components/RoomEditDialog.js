import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

class RoomEditDialog extends React.Component {
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

    let submit = (e) => {
      e.preventDefault();
      let data = {
        name : this.refs.roomNameInput.input.value,
        password : this.refs.roomPasswordInput.input.value,
        hint : this.refs.roomHintInput.input.value,
      };

      props.editComplete(data);
    };

    const actions = [
      <FlatButton
        label="Submit"
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
          title="Edit Room"
          actions={actions}
          modal={false}
          open={true}
          onRequestClose={this.handleClose} >
          <form onSubmit={submit}>
            <TextField
              hintText="Input your room's name."
              floatingLabelText="Name"
              floatingLabelFixed={true}
              ref="roomNameInput"
              defaultValue={props.name}
            />
            <br/>
            <TextField
              hintText="Omissible"
              floatingLabelText="Password"
              floatingLabelFixed={true}
              type="password"
              ref="roomPasswordInput"
              defaultValue={props.password}
            />
            <br/>
            <TextField
              hintText="Omissible"
              floatingLabelText="Hint of password"
              floatingLabelFixed={true}
              ref="roomHintInput"
              defaultValue={props.hint}
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

export default RoomEditDialog
