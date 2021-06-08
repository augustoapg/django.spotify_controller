import React, { useState, useEffect } from "react";
import { Grid, Button, Typography, IconButton } from "@material-ui/core";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { Link } from "react-router-dom";

const pages = {
	JOIN: "pages.join",
	CREATE: "pages.create",
};

export default function Info(props) {
	const [page, setPage] = useState(pages.JOIN);

	const joinInfo = () => {
		return "To join a room, simply click on Join a Room, enter the room code and click on Enter Room. If you don't have a Room Code, you can create a new room by clicking the Create a Room button.";
	};

	const createInfo = () => {
		return "To create a new Room, click on Create a Room, choose the room settings you'd like and click on Create a Room. You will see the room code in the header of the page. You can give this code to whomever you want so they can join your room.";
	};

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} align="center">
				<Typography component="h4" variant="h4">
					What is House Party?
				</Typography>
				<Grid item xs={12} align="center">
					<Typography variant="body1">
						{page === pages.JOIN ? joinInfo() : createInfo()}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					<IconButton
						onClick={() => {
							page === pages.JOIN
								? setPage(pages.CREATE)
								: setPage(pages.JOIN);
						}}
					>
						{page === pages.JOIN ? (
							<NavigateNextIcon />
						) : (
							<NavigateBeforeIcon />
						)}
					</IconButton>
				</Grid>
			</Grid>
			<Grid item xs={12} align="center">
				<Button
					color="secondary"
					variant="contained"
					to="/"
					component={Link}
				>
					Back
				</Button>
			</Grid>
		</Grid>
	);
}
