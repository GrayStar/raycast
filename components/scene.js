import { Component } from 'react';

import Bitmap from 'app/level/bitmap';
import Block from 'app/level/block';
import Level from 'app/level/level';
import Raycast from 'app/level/raycast';

import { getImage } from 'app/utilities/image-utilities';

export default class Scene extends Component {
    constructor (props) {
        super(props);

        this.state = { looping: false };

        this.frame = this.frame.bind(this);
    }

    async componentDidMount() {
        // load images
        const [
            stoneBlockImage,
            stoneBlockImageWithGrass,
            grassImage,
            grassWithFlowerImage,
        ] = await Promise.all([
            getImage('https://i.imgur.com/1jkxxi1.png'),
            getImage('https://i.imgur.com/yeTdmkj.png'),
            getImage('https://i.imgur.com/zlzCIOE.png'),
            getImage('https://i.imgur.com/LbwCpCJ.png'),
        ]);

        // create texture bitmaps
        const stoneBlockTexture = new Bitmap(stoneBlockImage, 16, 16);
        const stoneBlockTextureWithGrass = new Bitmap(stoneBlockImageWithGrass, 16, 16);
        const grassTexture = new Bitmap(grassImage, 16, 16);
        const grassWithFlowerTexture = new Bitmap(grassWithFlowerImage, 16, 16);

        // declare block types
        const wallBlocks = [];
        wallBlocks[1] = new Block(stoneBlockTexture);
        wallBlocks[2] = new Block(stoneBlockTextureWithGrass);

        // generate a new level
        const level = new Level(wallBlocks);
        level.setWalls([
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ], 0);
        level.setWalls([
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ], 1);

        // ray cast the level to the canvas
        this._raycast = new Raycast(this._canvas, level);
    }

    start() {
        this.setState({ looping: true }, () => {
            this._lastTime = 0;
            requestAnimationFrame(this.frame);
        });
    }

    stop() {
        this.setState({ looping: false });
    }

    frame(time) {
        if (!this.state.looping) return;

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
