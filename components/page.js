import { Component } from 'react';

import getConfig from 'next/config';
import { Router } from 'next/router';

import Main from 'app/layouts/main';

import Error from 'app/pages/_error';

export default class Page extends Component {
    constructor(props) {
        super(props);

        this.STATES = {
            LOADING: 'LOADING',
            SUCCESS: 'SUCCESS',
            ERROR: 'ERROR',
        };

        this.state = {
            currentState: this.STATES.LOADING,
        };

        // Determine file path for hashed static assets
        const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
        this.staticFilePath = serverRuntimeConfig.staticFilePath ?
            serverRuntimeConfig.staticFilePath :
            publicRuntimeConfig.staticFilePath;

        // Bind route change events to help display currentState
        this._handleRouteChangeStart = this._handleRouteChangeStart.bind(this);
        Router.events.on('routeChangeStart', this._handleRouteChangeStart);
    }

    // Generic getInitialProps defined by Next.js,
    // allows for error handling on routes that are defined, but contain bad urls.
    // Routes that are undefined are automatically handled by Next.js.
    static async getInitialProps(context) {
        try {
            const initialProps = await this._getInitialProps(context);
            return initialProps;
        } catch(error) {
            const statusCode = error.response.data.status || 404;
            const statusText = error.response.data.error || 'Not Found';

            return {
                statusCode,
                statusText,
            };
        };
    }

    // Custom getInitialProps defined by us,
    // to be overwritten in classes that extend this one.
    static async _getInitialProps(context) {
        return {};
    }

    // Check if Next.js's getInitialProps caught an error,
    // If so set the page's currentState to ERROR.
    componentWillMount() {
        if (this.props.statusCode) {
            this.setState({ currentState: this.STATES.ERROR });
        } else {
            this.setState({ currentState: this.STATES.SUCCESS });
        }
    }

    // Remove route change events when component unmounts.
    componentWillUnmount() {
        Router.events.off('routeChangeStart', this._handleRouteChangeStart);
    }

    // Force page to show loading state on route change start.
    _handleRouteChangeStart(url) {
        this.setState({ currentState: this.STATES.LOADING });
    }

    get _loadingState() {
        return (
            <Main title='Loading...'>
                <p>Loading...</p>
            </Main>
        );
    }

    get _successState() {
        throw new Error('_successState must be defined.');
    }

    get _errorState() {
        return <Error statusCode={ this.props.statusCode }/>
    }

    get _currentState() {
        switch(this.state.currentState) {
            case this.STATES.LOADING:
                return this._loadingState;
                break;
            case this.STATES.SUCCESS:
                return this._successState;
                break;
            case this.STATES.ERROR:
                return this._errorState;
                break;
            default:
                return this._loadingState;
        }
    }

    render() {
        return this._currentState;
    }
}
