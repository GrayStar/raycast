import { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import styles from 'scss/components/footer.scss';

export default class Footer extends Component {
	constructor (props) {
        super(props);
    }

	render() {
		return (
			<footer>
				<Grid>
                    <Row>
                        <Col xs={12}>
							<h1>footer</h1>
						</Col>
					</Row>
				</Grid>
			</footer>
		);
	}
}
