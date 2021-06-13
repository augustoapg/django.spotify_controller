import React, { Component } from "react";
import {
	Grid,
	Typography,
	Card,
	LinearProgress,
	IconButton,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";

export default class MusicPlayer extends Component {
	constructor(props) {
		super(props);
		this.pauseSong = this.pauseSong.bind(this);
		this.playSong = this.playSong.bind(this);
		this.state = {
			isHost: this.props.isHost,
			guestCanPause: this.props.guestCanPause,
		};
		this.renderDefault = this.renderDefault.bind(this);
		this.renderPlayer = this.renderPlayer.bind(this);
	}

	pauseSong() {
		const requestOptions = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotify/pause", requestOptions).then((response) => {
			if (!response.ok) {
				this.props.showAlert("You don't have permission to play/pause");
			}
		});
	}

	playSong() {
		const requestOptions = {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotify/play", requestOptions).then((response) => {
			if (!response.ok) {
				this.props.showAlert("You don't have permission to play/pause");
			}
		});
	}

	skipSong() {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		fetch("/spotify/skip", requestOptions).then((response) => {
			if (!response.ok) {
				if (response.status === 400) {
					this.props.showAlert("You have already voted to skip.");
				} else {
					this.props.showAlert(
						"There was an error skipping the song"
					);
				}
			}
		});
	}

	renderDefault() {
		return (
			<Card>
				<Grid container alignItems="center">
					<Grid item align="center" xs={12}>
						<Typography component="h5" variant="h5">
							No music found. Please play a song on your Spotify.
						</Typography>
					</Grid>
				</Grid>
			</Card>
		);
	}

	renderPlayer() {
		const songProgress = (this.props.time / this.props.duration) * 100;
		return (
			<Card>
				<Grid container alignItems="center">
					<Grid item align="center" xs={4}>
						<img
							src={this.props.image_url}
							width="100%"
							height="100%"
						/>
					</Grid>
					<Grid item align="center" xs={8}>
						<Typography component="h5" variant="h5">
							{this.props.title}
						</Typography>
						<Typography color="textSecondary" variant="subtitle1">
							{this.props.artist}
						</Typography>
						<div>
							<IconButton
								disabled={
									!this.props.isHost &&
									!this.props.guestCanPause
								}
								onClick={() => {
									this.props.is_playing
										? this.pauseSong()
										: this.playSong();
								}}
							>
								{this.props.is_playing ? (
									<PauseIcon />
								) : (
									<PlayArrowIcon />
								)}
							</IconButton>
							<IconButton onClick={() => this.skipSong()}>
								{this.props.votes} / {this.props.votes_required}
								<SkipNextIcon />
							</IconButton>
						</div>
					</Grid>
				</Grid>
				<LinearProgress variant="determinate" value={songProgress} />
			</Card>
		);
	}

	render() {
		return this.props.title ? this.renderPlayer() : this.renderDefault();
	}
}
