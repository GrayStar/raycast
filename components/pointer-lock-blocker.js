import { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import styles from 'app/scss/components/pointer-lock-blocker.scss';

export default class PointerLockBlocker extends Component {
    constructor(props) {
        super(props);

        this._handleClick = this._handleClick.bind(this);
    }

    _handleClick() {
        if (this.props.onClick) this.props.onClick();
    }

    render() {
        return (
            <div className={ styles['pointer-lock-blocker'] } onClick={ this._handleClick }>
                <h1>Click to lock pointer</h1>
            </div>
        );
    }
}