import { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import styles from 'scss/components/header.scss';

export default class Header extends Component {
	constructor (props) {
        super(props);
    }

	render() {
		return (
			<header>
				<Grid>
                    <Row>
                        <Col xs={12}>
							<h1>header</h1>
						</Col>
					</Row>
				</Grid>
			</header>
		);
	}
}
