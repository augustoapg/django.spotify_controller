import React, { Component } from "react";
import {
	Grid,
	Typography,
	Button,
	TextField,
	FormHelperText,
	FormControl,
	Radio,
	RadioGroup,
	FormControlLabel,
	Collapse,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import Alert from "@material-ui/lab/Alert";

export default class RoomSettingsPage extends Component {
	static defaultProps = {
		votesToSkip: 2,
		guestCanPause: true,
		update: false,
		roomCode: null,
		updateCallback: () => {},
	};

	constructor(props) {
		super(props);
		this.state = {
			votesToSkip: this.props.votesToSkip,
			guestCanPause: this.props.guestCanPause,
			successMessage: "",
			errorMessage: "",
		};
		this.handleGuestCanPauseChange =
			this.handleGuestCanPauseChange.bind(this);
		this.handleCreateRoomButtonPressed =
			this.handleCreateRoomButtonPressed.bind(this);
		this.handleVotesChange = this.handleVotesChange.bind(this);
		this.renderCreateButtons = this.renderCreateButtons.bind(this);
		this.renderUpdateButtons = this.renderUpdateButtons.bind(this);
		this.handleUpdateRoomButtonPressed =
			this.handleUpdateRoomButtonPressed.bind(this);
	}

	handleVotesChange(e) {
		this.setState({
			votesToSkip: e.target.value,
		});
	}

	handleGuestCanPauseChange(e) {
		this.setState({
			guestCanPause: e.target.value === "true" ? true : false,
		});
	}

	handleCreateRoomButtonPressed() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				votes_to_skip: this.state.votesToSkip,
				guest_can_pause: this.state.guestCanPause,
			}),
		};
		fetch("/api/create-room", requestOptions)
			.then((response) => response.json())
			.then((data) => this.props.history.push(`/room/${data.code}`));
	}

	handleUpdateRoomButtonPressed() {
		console.log(this.props);
		const requestOptions = {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				votes_to_skip: this.state.votesToSkip,
				guest_can_pause: this.state.guestCanPause,
				code: this.props.roomCode,
			}),
		};
		fetch("/api/update-room", requestOptions).then((response) => {
			if (response.ok) {
				this.setState({
					successMessage: "Room updated successfully!",
				});
			} else {
				this.setState({
					errorMessage: "Error updating the room",
				});
			}
			this.props.updateCallback();
		});
	}

	renderCreateButtons() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Button
						color="primary"
						variant="contained"
						onClick={this.handleCreateRoomButtonPressed}
					>
						Create A Room
					</Button>
				</Grid>
				<Grid item xs={12} align="center">
					<Button
						color="secondary"
						variant="contained"
						component={Link}
						to="/"
					>
						Back
					</Button>
				</Grid>
			</Grid>
		);
	}

	renderUpdateButtons() {
		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Button
						color="primary"
						variant="contained"
						onClick={this.handleUpdateRoomButtonPressed}
					>
						Update Room
					</Button>
				</Grid>
			</Grid>
		);
	}

	render() {
		const title = this.props.update ? "Update Room" : "Create a Room";

		return (
			<Grid container spacing={1}>
				<Grid item xs={12} align="center">
					<Collapse
						in={
							this.state.errorMessage != "" ||
							this.state.successMessage != ""
						}
					>
						{this.state.successMessage !== "" ? (
							<Alert
								severity="success"
								onClose={() => {
									this.setState({ successMessage: "" });
								}}
							>
								{this.state.successMessage}
							</Alert>
						) : (
							<Alert
								severity="error"
								onClose={() => {
									this.setState({ errorMessage: "" });
								}}
							>
								{this.state.errorMessage}
							</Alert>
						)}
					</Collapse>
				</Grid>
				<Grid item xs={12} align="center">
					<Typography component="h4" variant="h4">
						{title}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<FormControl component="fieldset">
						<FormHelperText>
							<div align="center">
								Guest Control of Playback State
							</div>
						</FormHelperText>
						<RadioGroup
							row
							defaultValue={"" + this.props.guestCanPause}
							onChange={this.handleGuestCanPauseChange}
						>
							<FormControlLabel
								value="true"
								control={<Radio color="primary" />}
								label="Play/Pause"
								labelPlacement="bottom"
							/>
							<FormControlLabel
								value="false"
								control={<Radio color="secondary" />}
								label="No Control"
								labelPlacement="bottom"
							/>
						</RadioGroup>
					</FormControl>
				</Grid>
				<Grid item xs={12} align="center">
					<FormControl>
						<TextField
							required={true}
							type="number"
							defaultValue={this.state.votesToSkip}
							inputProps={{
								min: 1,
								style: { textAlign: "center" },
							}}
							onChange={this.handleVotesChange}
						/>
						<FormHelperText>
							<div align="center">
								Votes Required to Skip Song
							</div>
						</FormHelperText>
					</FormControl>
				</Grid>
				{this.props.update
					? this.renderUpdateButtons()
					: this.renderCreateButtons()}
			</Grid>
		);
	}
}
