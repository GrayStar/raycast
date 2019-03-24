import {
    degreeToRadian,
    radianToVx,
    radianToVy,
} from 'app/utilities/math-utilities';

if (typeof window !== 'undefined') { require('pixi.js'); }

export default class Raycast2 {
	constructor(width, height) {
		this._app = new PIXI.Application({ width, height });

		this._width = width;
		this._height = height;
		this._halfWidth = this._width / 2;
		this._halfHeight = this._height / 2;

		this._playerPositionX = 1.5;
		this._playerPositionY = 4;
		this._playerDirectionAngle = 0
		this._playerDirectionRadian = degreeToRadian(this._playerDirectionAngle);
        this._playerDirectionX = radianToVx(this._playerDirectionX);
        this._playerDirectionY = radianToVy(this._playerDirectionY);

        this._cameraFov = 0.66;
        this._cameraDirectionRadian = this._playerDirectionRadian + (Math.PI / 2);
        this._cameraDirectionX = this._cameraFov * radianToVx(this._cameraDirectionRadian);
        this._cameraDirectionY = this._cameraFov * radianToVy(this._cameraDirectionRadian);
	}

	_raycast() {
		for(let x = 0; x < this._width; x++) {

		}
	}

    renderApp() {
    	document.body.appendChild(this._app.view);
    }
}