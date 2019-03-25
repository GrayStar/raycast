import {
    degreeToRadian,
    radianToVx,
    radianToVy,
} from 'app/utilities/math-utilities';
import { stringTohex } from 'app/utilities/image-utilities';

if (typeof window !== 'undefined') { require('pixi.js'); }

export default class Raycast2 {
    constructor(width, height, container) {
        this._container = container;

        this._app = new PIXI.Application({ width, height });
        this._graphics = new PIXI.Graphics();

        this._stage = this._app.stage;
        this._stage.addChild(this._graphics);

        this._width = width;
        this._height = height;
        this._halfWidth = this._width / 2;
        this._halfHeight = this._height / 2;

        this._playerPositionX = 1.5;
        this._playerPositionY = 4;
        this._playerDirectionAngle = 0;
        this._playerDirectionRadian = degreeToRadian(this._playerDirectionAngle);
        this._playerDirectionX = radianToVx(this._playerDirectionRadian);
        this._playerDirectionY = radianToVy(this._playerDirectionRadian);
        this._playerMovementSpeed = 4;
        this._playerRotationSpeed = 4;

        this._cameraFov = 0.66;
        this._cameraDirectionRadian = this._playerDirectionRadian + (Math.PI / 2);
        this._cameraDirectionX = this._cameraFov * radianToVx(this._cameraDirectionRadian);
        this._cameraDirectionY = this._cameraFov * radianToVy(this._cameraDirectionRadian);

        this._map = [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 2, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 3, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
        ];
        this._mapWidth = 8;
        this._mapHeight = 8;
        this._mapWallTextures = [];

        this._keyCodes = {
            65: 'left',
            68: 'right',
            87: 'forward',
            83: 'backward',
            81: 'rotateLeft',
            69: 'rotateRight',
        };

        this._controlStates = {
            'left': false,
            'right': false,
            'forward': false,
            'backward': false,
            'rotateLeft': false,
            'rotateRight': false,
        };

        this._container.appendChild(this._app.view);

        this._texturesloaded = this._texturesloaded.bind(this);
        document.addEventListener('keydown', this._handleKeyEvent.bind(this, true), false);
        document.addEventListener('keyup', this._handleKeyEvent.bind(this, false), false);

        this._fpsText = new PIXI.Text('fps: 0', { fill: 'white' });
        this._stage.addChild(this._fpsText);
    }

    _handleKeyEvent(value, event) {
        var state = this._keyCodes[event.keyCode];
        if (typeof state === 'undefined') return;
        this._controlStates[state] = value;

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
    }

    _handleControlStateInput(secondsElapsed) {
        const rotationSpeed = secondsElapsed * this._playerRotationSpeed;
        const moveSpeed = secondsElapsed * this._playerMovementSpeed;

        let dx = 0;
        let dy = 0;

        if (this._controlStates.left) {
            dx -= this._cameraDirectionX * moveSpeed;
            dy -= this._cameraDirectionY * moveSpeed;
        }

        if (this._controlStates.right) {
            dx += this._cameraDirectionX * moveSpeed;
            dy += this._cameraDirectionY * moveSpeed;
        }

        if (this._controlStates.forward) {
            dx += this._playerDirectionX * moveSpeed;
            dy += this._playerDirectionY * moveSpeed;
        }

        if (this._controlStates.backward) {
            dx -= this._playerDirectionX * moveSpeed;
            dy -= this._playerDirectionY * moveSpeed;
        }

        this._playerPositionX += dx;
        this._playerPositionY += dy;

        if (this._controlStates.rotateLeft) {
            const oldPlayerDirectionX = this._playerDirectionX;
            const oldCameraDirectionX = this._cameraDirectionX;
            const sinNegativeRotationSpeed = Math.sin(-rotationSpeed);
            const cosNegativeRotationSpeed = Math.cos(-rotationSpeed);

            this._playerDirectionX = this._playerDirectionX * cosNegativeRotationSpeed - this._playerDirectionY * sinNegativeRotationSpeed;
            this._playerDirectionY = oldPlayerDirectionX * sinNegativeRotationSpeed + this._playerDirectionY * cosNegativeRotationSpeed;

            this._cameraDirectionX = this._cameraDirectionX * cosNegativeRotationSpeed - this._cameraDirectionY * sinNegativeRotationSpeed;
            this._cameraDirectionY = oldCameraDirectionX * sinNegativeRotationSpeed + this._cameraDirectionY * cosNegativeRotationSpeed;
        }

        if (this._controlStates.rotateRight) {
            const oldPlayerDirectionX = this._playerDirectionX;
            const oldCameraDirectionX = this._cameraDirectionX;
            const sinRotationSpeed = Math.sin(rotationSpeed);
            const cosRotationSpeed = Math.cos(rotationSpeed);

            this._playerDirectionX = this._playerDirectionX * cosRotationSpeed - this._playerDirectionY * sinRotationSpeed;
            this._playerDirectionY = oldPlayerDirectionX * sinRotationSpeed + this._playerDirectionY * cosRotationSpeed;

            this._cameraDirectionX = this._cameraDirectionX * cosRotationSpeed - this._cameraDirectionY * sinRotationSpeed;
            this._cameraDirectionY = oldCameraDirectionX * sinRotationSpeed + this._cameraDirectionY * cosRotationSpeed;
        }
    }

    _raycast() {
        // Loop through each column (x) of pixels across the canvas
        for(let x = 0; x < this._width; x++) {
            // Only debug the center-most ray
            let debug = false;
            if (x === this._halfWidth) debug = true;

            // X-coordinate in camera space
            const cameraX = 2 * x / this._width - 1;

            // X and y direction of the ray
            const rayDirectionX = this._playerDirectionX + this._cameraDirectionX * cameraX;
            const rayDirectionY = this._playerDirectionY + this._cameraDirectionY * cameraX;

            // Current tile of the map the player is in
            let mapX = Math.floor(this._playerPositionX);
            let mapY = Math.floor(this._playerPositionY);

            // Length of ray from current position to next x or y-side
            let sideDistanceX;
            let sideDistanceY;

            // Length of ray from one x or y-side to next x or y-side
            const deltaDistanceX = Math.abs(1 / rayDirectionX);
            const deltaDistanceY = Math.abs(1 / rayDirectionY);

            // What direction to step in either x or y-direction (either +1 or -1)
            let stepX;
            let stepY;

            // Calculate step and initial sideDistance
            if (rayDirectionX < 0) {
                stepX = -1;
                sideDistanceX = (this._playerPositionX - mapX) * deltaDistanceX;
            } else {
                stepX = 1;
                sideDistanceX = (mapX + 1 - this._playerPositionX) * deltaDistanceX;
            }

            if (rayDirectionY < 0) {
                stepY = -1;
                sideDistanceY = (this._playerPositionY - mapY) * deltaDistanceY;
            } else {
                stepY = 1;
                sideDistanceY = (mapY + 1 - this._playerPositionY) * deltaDistanceY;
            }

            // Perform DDA
            let hit = false; // Was a wall hit?
            let side; // Was a NS or a EW wall hit?
            let outsideBounds = false;

            while (hit === false && outsideBounds === false) {
                // Jump to next map square, OR in x-direction, OR in y-direction
                if (sideDistanceX < sideDistanceY) {
                    sideDistanceX += deltaDistanceX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistanceY += deltaDistanceY;
                    mapY += stepY;
                    side = 1;
                }

                // Break loop if ray goes outside bounds of map
                if (mapX < 0 || mapX >= this._mapWidth || mapY < 0 || mapY >= this._mapHeight) {
                    outsideBounds = true;
                    continue;
                }

                // Check if ray has hit a wall
                if (this._getMapTileByXY(mapX, mapY) > 0) hit = true;
            }

            // Stop all calucations if outside bounds of map
            if (outsideBounds) continue;

            // Calculate distance projected on camera direction
            let rayDistance;
            if (side === 0) rayDistance = (mapX - this._playerPositionX + (1 - stepX) / 2) / rayDirectionX;
            else rayDistance = (mapY - this._playerPositionY + (1 - stepY) / 2) / rayDirectionY;

            // Calculate height of line to draw on screen
            const lineHeight = Math.floor(this._height / rayDistance);
            const halfLineHeight = lineHeight / 2;

            // Calculate lowest and highest pixel to fill in current stripe
            let drawStart = -halfLineHeight + this._halfHeight;
            if (drawStart < 0) drawStart = 0;
            let drawEnd = halfLineHeight + this._halfHeight;
            if (drawEnd >= this._height) drawEnd = this._height;

            // Type of wall hit
            const mapIndex = this._getMapTileByXY(mapX, mapY);
            const texture = this._mapWallTextures[mapIndex];

            if (texture) {
                // Calculate value of wallX
                let wallX; // Where exactly on the wall the ray hit
                if (side === 0) wallX = this._playerPositionY + rayDistance * rayDirectionY;
                else wallX = this._playerPositionX + rayDistance * rayDirectionX;

                // X coordinate on the texture
                let textureX = Math.floor(wallX * texture.width);
                if (side === 0 && rayDirectionX > 0) textureX = texture.width - textureX - 1;
                if (side === 1 && rayDirectionY < 0) textureX = texture.width - textureX - 1;
            }

            // Choose wall color
            let color;
            switch(mapIndex) {
                case 1:
                    color = 'ff0000';
                    break;
                case 2:
                    color = '#00ff00';
                    break;
                case 3:
                    color = '#0000ff';
                    break;
                default:
                    color = '#ffffff';
            }

            // Give x and y sides different brightness
            if (side === 1) color = color.replace('f', '8');

            // Convert string to hex
            color = stringTohex(color);

            // Draw rect
            this._graphics
                .beginFill(color)
                .drawRect(x, drawStart, 1, lineHeight);
        }
    }

    _getMapTileByXY(x, y) {
        const index = y * this._mapWidth + x;
        return this._map[index];
    }

    loadTextures(textures) {
        textures.forEach(texture => {
            PIXI.loader.add(texture.title, texture.src);
        });

        PIXI.loader.load(this._texturesloaded);
    }

    _texturesloaded() {
        Object.keys(PIXI.loader.resources).forEach((resourceName, index) => {
            const resource = PIXI.loader.resources[resourceName];
            const sprite = new PIXI.Sprite(PIXI.loader.resources[resourceName].texture);
            const customTexture = {
                name: resource.name,
                width: resource.texture.width,
                height: resource.texture.height,
                data: this._app.renderer.extract.pixels(sprite),
            };

            this._mapWallTextures[index + 1] = customTexture;
        });
    }

    update(secondsElapsed) {
        this._graphics.clear();
        this._raycast();
        this._handleControlStateInput(secondsElapsed);

        const fps = Math.floor(1 / secondsElapsed);
        this._fpsText.text = `fps: ${fps}`;
    }
}