import { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import styles from 'app/scss/components/footer.scss';

export default class Footer extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <footer>
                <Container>
                    <Row>
                        <Col xs={12}>
                            <h1>footer</h1>
                        </Col>
                    </Row>
                </Container>
            </footer>
        );
    }
}
