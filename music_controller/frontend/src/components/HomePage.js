import React, { Component } from "react";
import JoinRoomPage from "./JoinRoomPage";
import RoomSettingsPage from "./RoomSettingsPage";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
} from "react-router-dom";
import Room from "./Room";
import Info from "./Info";

export default class HomeComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			roomCode: null,
		};
		this.clearRoomCode = this.clearRoomCode.bind(this);
	}

	async componentDidMount() {
		fetch("/api/user-in-room")
			.then((response) => response.json())
			.then((data) => {
				this.setState({
					roomCode: data.code,
				});
			});
	}

	renderHomePage() {
		return (
			<Grid container spacing={3}>
				<Grid item xs={12} align="center">
					<Typography variant="h3" component="h3">
						House Party
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<ButtonGroup
						disableElevation
						variant="contained"
						color="primary"
					>
						<Button color="primary" to="/join" component={Link}>
							Join a Room
						</Button>
						<Button color="secondary" to="/create" component={Link}>
							Create a Room
						</Button>
						<Button color="default" to="/info" component={Link}>
							Info
						</Button>
					</ButtonGroup>
				</Grid>
			</Grid>
		);
	}

	clearRoomCode() {
		this.setState({
			roomCode: null,
		});
	}

	render() {
		return (
			<Router>
				<Switch>
					<Route
						exact
						path="/"
						render={() => {
							return this.state.roomCode ? (
								<Redirect to={`/room/${this.state.roomCode}`} />
							) : (
								this.renderHomePage()
							);
						}}
					></Route>
					<Route path="/join" component={JoinRoomPage} />
					<Route path="/create" component={RoomSettingsPage} />
					<Route
						path="/room/:roomCode"
						render={(props) => {
							return (
								<Room
									{...props}
									leaveRoomCallback={this.clearRoomCode}
								/>
							);
						}}
					/>
					<Route path="/info" component={Info}></Route>
				</Switch>
			</Router>
		);
	}
}
