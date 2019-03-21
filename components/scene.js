import { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import styles from 'app/scss/components/header.scss';

export default class Scene extends Component {
    constructor (props) {
        super(props);
        this.frame = this.frame.bind(this);
    }

    componentDidMount() {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._context = this._canvas.getContext('2d');
    }

    start() {
        this._lastTime = 0;
        requestAnimationFrame(this.frame);
    }

    frame(time) {
        const secondsElapsed = (time - this._lastTime) / 1000;
        this._lastTime = time;

        if (secondsElapsed < 0.2) this.update(secondsElapsed);
        requestAnimationFrame(this.frame);
    }

    drawFilledRect(x, y, width, height, color) {
        this._context.fillStyle = color;
        this._context.fillRect(x, y, width, height);
    }

    update(secondsElapsed) {
        this.drawFilledRect(0, 0, this._width, this._height / 2, '#FF0000');
    }

    render() {
        return (
            <canvas
                id='canvas'
                ref={ canvas => this._canvas = canvas }
                width='512'
                height='384'/>
        );
    }
}
