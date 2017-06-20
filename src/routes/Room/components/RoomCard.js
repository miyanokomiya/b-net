import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton'
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import ContentCreate from 'material-ui/svg-icons/content/create'
import ContentDeleteSweep from 'material-ui/svg-icons/content/delete-sweep'

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

    return (
      <div>
        <Card>
          <CardHeader
            title={props.name}
            subtitle={date.toLocaleString()}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardActions>
            <IconButton tooltip="Edit" onTouchTap={readyEditRoom}>
              <ContentCreate />
            </IconButton>
            <IconButton tooltip="Delete" onTouchTap={deleteRoom}>
              <ContentDeleteSweep />
            </IconButton>
          </CardActions>
          <CardText expandable={true}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
            Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
            Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
          </CardText>
        </Card>
      </div>
    )
  }
}

export default RoomCard
