import React, { PropTypes } from "react";
import { browserHistory } from "react-router";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import Dialog from "material-ui/Dialog";
import { Card, CardHeader, CardText } from "material-ui/Card";
import { List, ListItem } from "material-ui/List";
import ActionGrade from "material-ui/svg-icons/action/grade";
import Divider from "material-ui/Divider";
import Avatar from "material-ui/Avatar";
import { grey400, pinkA200, transparent } from "material-ui/styles/colors";
import IconButton from "material-ui/IconButton";
import CircularProgress from "material-ui/CircularProgress";
import Colors from "../../client/colors";

import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import { createContainer } from "meteor/react-meteor-data";
import { Games } from "../api/games.js";
import { Meteor } from "meteor/meteor";

const iconButtonElement = (
  <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
    <MoreVertIcon color={grey400} />
  </IconButton>
);

const rightIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>Change Game</MenuItem>
    <MenuItem>Exit Game</MenuItem>
  </IconMenu>
);

const containerStyle = {
  margin: "0 auto",
  width: "100%",
  display: "flex"
};

const CardStyle = {
  padding: 40,
  fontSize: 20,
  margin: "auto",
  textAlign: "center"
};

const style = {
  margin: 15
};



class Lobby extends React.Component {
  constructor() {
    super();
    if (Meteor.isDevelopment) {
      minPlayers = 4;
    } else {
      minPlayers = 6;
    }
    this.state={
      open:false,
      playerName:'',
      gameCode:''
    }
  }

  getGameInfo() {
    let games = this.props.games;
    return games.filter(game => {
      return this.props.params.gameCode === game.gameCode;
    })[0];
  }

  handleOpenJoin () {
    this.setState({open: true});
  }

  handleClose()  {
    this.setState({open: false,newGame: false});
  }

  joinGame() {
    Meteor.call('games.addPlayer', this.state.code, this.state.playerName, (err) => {
      if (!err) {
        localStorage.setItem('name', this.state.playerName);
        localStorage.setItem('gameCode', this.state.code);
        localStorage.removeItem('admin');
      } else {
        alert('Something bad happened.');
      }
      this.setState({open: false});
    });
  }

  componentWillMount(prevProps, prevState) {
    if (localStorage.getItem('gameCode') !== this.props.routeParams.gameCode) {
      this.handleOpenJoin();
      this.setState({code: this.props.routeParams.gameCode});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let games = this.props.games;
    const currentGame = games.filter(game => {
      return this.props.params.gameCode === game.gameCode;
    });
    if (currentGame[0].gameStatus === "preGame") {
      browserHistory.push(`/pregame/${this.props.params.gameCode}`);
    }
  }

  goToPregame() {
    Meteor.call("games.shuffle", this.props.params.gameCode);
    browserHistory.push(`/pregame/${this.props.params.gameCode}`);
  }

  //======================================================
  // RENDERING
  //======================================================

  renderPlayerFeatures() {
    const admin = localStorage.getItem("admin");
    if (admin) {
      const currentGame = this.getGameInfo();
      if (currentGame.player.length >= minPlayers) {
        isDisabled = false;
        text = "Go to your room";
      } else {
        isDisabled = true;
        text = "Waiting for more players";
      }
      return (
        <RaisedButton
          style={{ margin: "auto", display: "flex", width: "100%", height: 60 }}
          label={text}
          disabled={isDisabled}
          onTouchTap={() => this.goToPregame()}
          backgroundColor="#BEDB39"
          labelColor="white"
        />
      );
    }
    return (
      <div>
        <RaisedButton
          style={{ margin: "auto", display: "flex", width: "100%" }}
          label="Waiting to Start..."
          backgroundColor="#BEDB39"
          labelColor="white"
        />
      </div>
    );
  }

  renderPlayers() {
    const currentGame = this.getGameInfo();
    if (currentGame) {
      return currentGame.player.map((player, i) => {
        const you = player.name === this.props.name ? " (you)" : "";
        return (
          <div key={i}>
            <ListItem
              primaryText={`${player.name}${you}`}
              rightAvatar={
                <Avatar src="https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_face_black_24px.svg" />
              }
            />
          </div>
        );
      });
    }
    return null;
  }

  renderPlayerForm() {
    const actionsJoin = [
      <RaisedButton
        style={{display: 'flex', margin:'auto', height: 60}}
        labelColor="white"
        label="OK"
        backgroundColor=  {Colors.primary}
        keyboardFocused={true}
        onTouchTap={this.joinGame.bind(this)}
      />,
      <Divider />,
      <RaisedButton
        style={{display: 'flex', margin:'auto', height: 60}}
        label="Cancel"
        // secondary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
    ];

    return (
      <Dialog
        style={{
          margin: 'auto',
          textAlign: 'center'
        }}
        actions={actionsJoin}
        modal={true}
        open={this.state.open}
      >

        <TextField
          name= "player"
          hintText="Your name (required)"
          onChange={(event, playerName) => this.setState({playerName})}
        />
      </Dialog>
    );
  }

  render() {
    return (
      <div>
        <div>
          {this.renderPlayerForm()}
        </div>
        <div style={containerStyle}>
          <div style={{ margin: "auto", width: "inherit" }}>
            <Card style={{ margin: "auto" }}>
              <List
                style={{
                  backgroundColor: "#BEDB39",
                  color: "white"
                }}
              >
                <ListItem
                  primaryText="Code"
                  secondaryText={this.props.params.gameCode}
                  rightIconButton={rightIconMenu}
                  leftIcon={<ActionGrade color={pinkA200} />}
                />
              </List>
              <Divider />
              <List className="scrollable-list">
                {this.renderPlayers()}
              </List>
            </Card>
            <div style={{ textAlign: "center" }} />
            <div className="bottom-info">
              {this.renderPlayerFeatures()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default createContainer(() => {
  return {
    name: localStorage.getItem("name"),
    gameCode: localStorage.getItem("gameCode"),
    games: Games.find({}, { sort: { createdAt: -1 } }).fetch()
  };
}, Lobby);
