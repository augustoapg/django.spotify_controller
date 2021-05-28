import React, { Component } from "react";
import { Grid, Button, Typography } from "@material-ui/core";

export default class Room extends Component {
	constructor(props) {
		super(props);
		this.state = {
			votesToSkip: 2,
			guestCanPause: false,
			isHost: false,
		};
		this.roomCode = this.props.match.params.roomCode;
		this.getRoomDetails();
		this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
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

	render() {
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
}