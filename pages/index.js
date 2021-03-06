import { Container, Row, Col } from 'react-bootstrap';

import Main from 'app/layouts/main';

import Page from 'app/components/page';
import Scene from 'app/components/scene';

import styles from 'app/scss/pages/index.scss';

export default class Index extends Page {
    constructor(props) {
        super(props);

        this.state = { loaded: false };

        this._handleStartButtonClick = this._handleStartButtonClick.bind(this);
        this._handleStopButtonClick = this._handleStopButtonClick.bind(this);
    }

    componentDidMount() {
        this.setState({ loaded: true }, () => {
            this._scene.start();
        });
    }

    _handleStartButtonClick() {
        this._scene.start();
    }

    _handleStopButtonClick() {
        this._scene.stop();
    }

    get _loadedScene() {
        if (this.state.loaded) return <Scene ref={ scene => this._scene = scene }/>;
        return null;
    }

    get _successState() {
        return (
            <Main title='Index Page'>
                <article className={ styles.index }>
                    <Container>
                        <Row>
                            <Col sm={12}>
                                { this._loadedScene }
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <p>Scene starts automatically</p>
                                <button onClick={ this._handleStartButtonClick }>Start Scene</button>
                                <button onClick={ this._handleStopButtonClick }>Stop Scene</button>
                            </Col>
                        </Row>
                    </Container>
                </article>
            </Main>
        );
    }
}
