import { Link } from 'app/routes';
import { Grid, Row, Col } from 'react-bootstrap';
import axios from 'axios';

import Page from 'app/components/page';
import Main from 'app/layouts/main';
import styles from 'app/scss/pages/about.scss';

export default class About extends Page {
    constructor(props) {
        super(props);
    }

    static async _getInitialProps(context) {
        const response = await axios.get(`https://api.pokemontcg.io/v1/cards/${context.query.id}`);
        return { card: response.data.card };
    }

    get _successState() {
        return (
            <Main title='About Page'>
                <article className={ styles.about }>
                    <Grid>
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
                    </Grid>
                </article>
            </Main>
        );
    }
}
