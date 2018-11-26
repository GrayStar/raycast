import React, { Component } from 'react';
import { Link } from 'app/routes';
import { Grid, Row, Col } from 'react-bootstrap';

import Main from 'app/layouts/main';
import styles from 'app/scss/pages/error.scss';

export default class Error extends Component {
    constructor(props) {
        super(props);
    }

    static getInitialProps({ res, xhr }) {
        const statusCode = res ? res.statusCode : (xhr ? xhr.status : null);
        return { statusCode };
    }

    render() {
        return (
            <Main title='Error Page'>
                <article className={ styles.error }>
                    <Grid>
                        <Row>
                            <Col xs={12}>

                                <p>{
                                    this.props.statusCode
                                    ? `An error:${this.props.statusCode} occurred on server`
                                    : 'An error occurred on client'
                                }</p>

                                <p>
                                    <Link to='/'><a>Home</a></Link>
                                </p>

                            </Col>
                        </Row>
                    </Grid>
                </article>
            </Main>
        );
    }
}
