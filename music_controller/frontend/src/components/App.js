import React, { Component } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import "./background.scss";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";

const darkTheme = createMuiTheme({
	palette: {
		type: "dark",
	},
});

export default class App extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ThemeProvider theme={darkTheme}>
				<div className="center">
					<HomePage />
				</div>
			</ThemeProvider>
		);
	}
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
