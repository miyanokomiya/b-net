import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {Link } from 'react-router'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton'
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import ContentCreate from 'material-ui/svg-icons/content/create'
import ContentDeleteSweep from 'material-ui/svg-icons/content/delete-sweep'
import ImageNavigateNext from 'material-ui/svg-icons/image/navigate-next'
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
    let date = new Date(props.created);

    let readyEditRoom = () => {
      props.readyEditRoom(props.id);
    }

    let deleteRoom = () => {
      props.deleteRoom(props.id);
    }

    let titleLink = (
      <Link ref="link" to={`/bnet?room-id=${props.id}`}>
        <div>
        {props.name || "No Name"}
        </div>
      </Link>
    );

    let onExpandChange = (newExpandedState) => {
      if (newExpandedState) {
        props.loadPassword(props.id)
      }
    };

    let postPassword = (e) => {
      e.preventDefault();
      let pass = this.refs.password.input.value;
      props.postPassword(props.id, pass);
    };

    let content = "";
    if (props.notAuth) {
      content = (
        <form onSubmit={postPassword}>
          <TextField
            hintText={"Hint: " + props.hint}
            floatingLabelText="Password"
            floatingLabelFixed={true}
            type="password"
            ref="password"
          />
          <FlatButton
            label="Submit"
            primary={true}
            type="submit"
          />
        </form>
      );
    } else {
      content = (
        <div>
          <IconButton tooltip="Edit" onTouchTap={readyEditRoom}>
            <ContentCreate />
          </IconButton>
          <IconButton tooltip="Delete" onTouchTap={deleteRoom}>
            <ContentDeleteSweep />
          </IconButton>
        </div>
      );
    }

    return (
      <div>
        <Card onExpandChange={onExpandChange} >
          <CardHeader
            title={titleLink}
            subtitle={`Created: ${date.toLocaleString()}`}
            actAsExpander={false}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            {content}
          </CardText>
        </Card>
      </div>
    )
  }
}

export default RoomCard
