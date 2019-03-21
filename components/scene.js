import { Component } from 'react';
import Raycast from 'app/components/raycast';

export default class Scene extends Component {
    constructor (props) {
        super(props);
        this.frame = this.frame.bind(this);
    }

    componentDidMount() {
        this._raycast = new Raycast(this._canvas);
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

    update(secondsElapsed) {
        this._raycast.update(secondsElapsed);
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
