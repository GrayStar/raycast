import { Container, Row, Col } from 'react-bootstrap';

import Main from 'app/layouts/main';

import Page from 'app/components/page';
import Scene2 from 'app/components/scene-2';

import styles from 'app/scss/pages/index.scss';

export default class Index extends Page {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    get _successState() {
        return (
            <Main title='Index Page'>
                <article className={ styles.index }>
                    <Container>
                        <Row>
                            <Col sm={12}>
                                <Scene2 ref={ scene => this._scene = scene }/>
                            </Col>
                        </Row>
                    </Container>
                </article>
            </Main>
        );
    }
}
