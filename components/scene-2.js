import { Component } from 'react';

import Raycast2 from 'app/level/raycast-2';

export default class Scene2 extends Component {
    componentDidMount() {
    	const raycast = new Raycast2(512, 384);
    	raycast.renderApp();
    }

    render() {
        return null;
    }
}
