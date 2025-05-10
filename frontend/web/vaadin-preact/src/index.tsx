import { render } from 'preact';

import preactLogo from './assets/preact.svg';
import './style.css';

import '@vaadin/button/theme/material/vaadin-button.js';

export function App() {
	return (
		<div>
			<vaadin-button theme="primary">Primary</vaadin-button>
		</div>
	);
}

function Resource(props) {
	return (
		<a href={props.href} target="_blank" class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
}

render(<App />, document.getElementById('app'));
