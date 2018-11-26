import React, { Component } from 'react';
import { Link } from 'app/routes';
import { Grid, Row, Col } from 'react-bootstrap';
import axios from 'axios';

import Error from 'app/pages/_error';
import Main from 'app/layouts/main';
import styles from 'app/scss/pages/about.scss';

export default class About extends Component {
    constructor(props) {
        super(props);
    }

    static async getInitialProps(context) {
        try {
            const response = await axios.get(`https://api.pokemontcg.io/v1/cards/${context.query.id}`);

            return {
                card: response.data.card
            };
        } catch(error) {
            return {
                statusCode: error.response.data.status,
                statusText: error.response.data.error,
            };
        }

    }

    render() {
        if (!this.props.card) return <Error statusCode={ this.props.statusCode }/>

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
