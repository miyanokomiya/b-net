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
      <Link to={`/bnet?room-id=${props.id}`}>
        {props.name || "No Name"}
      </Link>
    );

    return (
      <div>
        <Card>
          <CardHeader
            title={titleLink}
            subtitle={`Created: ${date.toLocaleString()}`}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            <IconButton tooltip="Edit" onTouchTap={readyEditRoom}>
              <ContentCreate />
            </IconButton>
            <IconButton tooltip="Delete" onTouchTap={deleteRoom}>
              <ContentDeleteSweep />
            </IconButton>
          </CardText>
        </Card>
      </div>
    )
  }
}

export default RoomCard
