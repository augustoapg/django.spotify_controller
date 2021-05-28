import React, { Component } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import RoomSettingsPage from "./RoomSettingsPage";

export default class Room extends Component {
	constructor(props) {
		super(props);
		this.state = {
			votesToSkip: 2,
			guestCanPause: false,
			isHost: false,
			showSettings: false			
		};
		this.roomCode = this.props.match.params.roomCode;
		this.getRoomDetails = this.getRoomDetails.bind(this);
		this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
		this.updateShowSettings = this.updateShowSettings.bind(this);
		this.renderRoomPage = this.renderRoomPage.bind(this);
		this.renderSettingsButton = this.renderSettingsButton.bind(this);
		this.renderSettingsPage = this.renderSettingsPage.bind(this);
		this.getRoomDetails();
	}

	updateShowSettings(value) {
		this.setState({
			showSettings: value,
		});
	}

	renderSettingsButton() {
		return (
			<Grid item xs={12} align="center">
				<Button
					variant="contained"
					color="primary"
					onClick={() => this.updateShowSettings(true)}
				>
					Settings
				</Button>
			</Grid>
		);
	}

	renderSettingsPage() {
		console.log("settings page");
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<RoomSettingsPage
						update={true}
						votesToSkip={this.state.votesToSkip}
						guestCanPause={this.state.guestCanPause}
						roomCode={this.roomCode}
						updateCallback={this.getRoomDetails}
					/>
				</Grid>
				<Grid item xs={12} align="center">
					<Button
						variant="contained"
						color="secondary"
						onClick={() => this.updateShowSettings(false)}
					>
						Close
					</Button>
				</Grid>
			</Grid>
		);
	}

	leaveButtonPressed() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/api/leave-room", requestOptions).then((_response) => {
			this.props.leaveRoomCallback();
			this.props.history.push("/");
		});
	}

	getRoomDetails() {
		fetch(`/api/get-room?code=${this.roomCode}`)
			.then((response) => {
				if (!response.ok) {
					this.props.leaveRoomCallback();
					this.props.history.push("/");
				}
				return response.json();
			})
			.then((data) => {
				this.setState({
					votesToSkip: data.votes_to_skip,
					guestCanPause: data.guest_can_pause,
					isHost: data.is_host,
				});
			});
	}

	renderRoomPage() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Typography variant="h4" component="h4">
						Code: {this.roomCode}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<Typography variant="h6" component="h6">
						Votes: {this.state.votesToSkip}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<Typography variant="h6" component="h6">
						Guest can pause: {"" + this.state.guestCanPause}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<Typography variant="h6" component="h6">
						Is Host: {"" + this.state.isHost}
					</Typography>
				</Grid>
				{this.state.isHost ? this.renderSettingsButton() : null}
				<Grid item xs={12} align="center">
					<Button
						color="secondary"
						variant="contained"
						onClick={this.leaveButtonPressed}
					>
						Leave Room
					</Button>
				</Grid>
			</Grid>
		);
	}

	render() {
		return this.state.showSettings
			? this.renderSettingsPage()
			: this.renderRoomPage();
	}
}
