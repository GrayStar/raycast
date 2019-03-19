import { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import styles from 'app/scss/components/header.scss';

export default class Header extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <header>
                <Container>
                    <Row>
                        <Col xs={12}>
                            <h1>header</h1>
                        </Col>
                    </Row>
                </Container>
            </header>
        );
    }
}
