import { connect } from 'react-redux';
import { incrementCount } from 'app/store/actions';

import hashedImage from 'app/static/images/test.png';

import { Link, Router } from 'app/routes';
import { Container, Row, Col } from 'react-bootstrap';

import Page from 'app/components/page';
import Main from 'app/layouts/main';
import styles from 'app/scss/pages/index.scss';

import { getPokemonCards } from 'app/api';

class Index extends Page {
    constructor(props) {
        super(props);
    }

    static async _getInitialProps(context) {
        const response = await getPokemonCards();
        return { cards: response.cards };
    }

    _handleIncrementButtonClick() {
        const { dispatch } = this.props;
        dispatch(incrementCount());
    }

    _handleButtonClick() {
        Router.pushRoute('/card/ex8-98');
    }

    _handleBrokenButtonClick() {
        Router.pushRoute('/nothing');
    }

    _handleBrokenLinkClick() {
        Router.pushRoute('/card/nothing');
    }

    get _list() {
        return this.props.cards.map(currentCard => {
            return (
                <li key={currentCard.id}>
                    <p>
                        <Link route={`/card/${ currentCard.id }`}>
                            <a>{ currentCard.name }</a>
                        </Link>
                    </p>
                </li>
            );
        });
    }

    get _successState() {
        return (
            <Main title='Index Page'>
                <article className={ styles.index }>
                    <Container>
                        <Row>
                            <Col sm={12}>
                                { this.props.count }
                                <button onClick={ this._handleIncrementButtonClick.bind(this) }>Increment</button>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12} md={6}>
                                <h2>Static Hashed Image</h2>
                                <img src={ `${this.staticFilePath}${hashedImage}` } alt='Static Hashed Image'/>
                            </Col>
                            <Col xs={12} md={6}>
                                <h2>Static Image</h2>
                                <img src='/static/images/test.png' alt='Static Image'/>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <h2>Index Page</h2>

                                <button onClick={ this._handleButtonClick.bind(this) }>Imperative Link (Working)</button>
                                <button onClick={ this._handleBrokenButtonClick.bind(this) }>Imperative Link (Missing Route)</button>
                                <button onClick={ this._handleBrokenLinkClick.bind(this) }>Imperative Link (Broken Endpoint)</button>

                                <ul>
                                    { this._list }
                                </ul>
                            </Col>
                        </Row>
                    </Container>
                </article>
            </Main>
        );
    }
}

function mapStateToProps(state) {
    return state;
}

export default connect(mapStateToProps)(Index);