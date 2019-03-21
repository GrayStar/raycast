import { Container, Row, Col } from 'react-bootstrap';

import Main from 'app/layouts/main';

import Page from 'app/components/page';
import Scene from 'app/components/scene';

import styles from 'app/scss/pages/index.scss';

export default class Index extends Page {
    componentDidMount() {
        this._scene.start();
    }

    get _successState() {
        return (
            <Main title='Index Page'>
                <article className={ styles.index }>
                    <Container>
                        <Row>
                            <Col sm={12}>
                                <Scene ref={ scene => this._scene = scene }/>
                            </Col>
                        </Row>
                    </Container>
                </article>
            </Main>
        );
    }
}
