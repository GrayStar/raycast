import { Link } from 'app/routes';
import { Container, Row, Col } from 'react-bootstrap';

import Page from 'app/components/page';
import Main from 'app/layouts/main';
import styles from 'app/scss/pages/about.scss';

import { getPokemonCardDetails } from 'app/api';

export default class About extends Page {
    constructor(props) {
        super(props);
    }

    static async _getInitialProps(context) {
        const response = await getPokemonCardDetails(context.query.id);
        return { card: response.card };
    }

    get _successState() {
        return (
            <Main title='About Page'>
                <article className={ styles.about }>
                    <Container>
                        <Row>
                            <Col xs={12}>

                                <p>
                                    <Link to='/' prefetch>
                                        <a>Back to List</a>
                                    </Link>
                                </p>

                                <div className={ styles['card-container'] }>
                                    <img src={ this.props.card.imageUrlHiRes } alt={ this.props.card.name }/>
                                </div>

                            </Col>
                        </Row>
                    </Container>
                </article>
            </Main>
        );
    }
}
