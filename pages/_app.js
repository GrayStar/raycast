import uuidv4 from 'uuid/v4';

import React from 'react';

import App, { Container } from 'next/app';

import { Provider } from 'react-redux';

import withReduxStore from 'app/lib/with-redux-store';

/*
 * There is a known bug in Next.js right now regarding CSS and client-side route changes.
 *
 * issue reference:    https://github.com/zeit/next-plugins/issues/282
 * solution reference: https://github.com/zeit/next-plugins/issues/282#issuecomment-432127816
 *
 * This is a hack to ensure the CSS gets reloaded on every route change.
 *
 * NOTE: we only do this if the NODE_ENV is in dev mode,
 * as this does not happen in production builds.
 */
import Router from 'next/router';
Router.events.on('routeChangeComplete', () => {
    if (process.env.NODE_ENV !== 'production') {
        const els = document.querySelectorAll('link[href*="/_next/static/css/styles.chunk.css"]');
        const timestamp = new Date().valueOf();
        els[0].href = '/_next/static/css/styles.chunk.css?v=' + timestamp;
    }
});

class MyApp extends App {
    render() {
        const key = uuidv4();
        const { Component, pageProps, reduxStore } = this.props;

        return (
            <Container>
                <Provider store={ reduxStore }>
                    <Component key={ key } { ...pageProps }/>
                </Provider>
            </Container>
        );
    }
}

export default withReduxStore(MyApp);