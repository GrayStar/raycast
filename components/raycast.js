import {
    degreeToRadian,
    radianToVx,
    radianToVy,
} from 'app/utilities/math-utilities';

const BYTES_PER_PIXEL = 4;

const map = [
    1, 1, 1, 1, 1, 1, 1, 3,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 2,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 3,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
];
const mapWidth = 8;
const mapHeight = 8;

export default class Raycast {
    constructor(canvas) {
        this._canvas = canvas;
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._context = this._canvas.getContext('2d');

        this._player = {
            position: {
                x: 2,
                y: 2,
                moveSpeed: 4,
                rotationSpeed: 3,
            },
            direction: {
                angle: 0,
            },
        };
        this._player.direction.radian = degreeToRadian(this._player.direction.angle);
        this._player.direction.x = radianToVx(this._player.direction.radian);
        this._player.direction.y = radianToVy(this._player.direction.radian);

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

        this._camera = {
            fov: 0.66,
            direction: {},
        };
        this._camera.direction.radian = this._player.direction.radian + (Math.PI / 2);
        this._camera.direction.x = this._camera.fov * radianToVx(this._camera.direction.radian);
        this._camera.direction.y = this._camera.fov * radianToVy(this._camera.direction.radian);

        document.addEventListener('keydown', this._handleKeyEvent.bind(this, true), false);
        document.addEventListener('keyup', this._handleKeyEvent.bind(this, false), false);
    }

    _handleKeyEvent(value, event) {
        var state = this._keyCodes[event.keyCode];
        if (typeof state === 'undefined') return;
        this._controlStates[state] = value;

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
    }

    _handleControlStateInput(secondsElapsed) {
        const rotationSpeed = secondsElapsed * this._player.rotationSpeed;
        const moveSpeed = secondsElapsed * this._player.moveSpeed;

        let dx = 0;
        let dy = 0;

        if (this._controlStates.left) {
            dx -= this._camera.direction.x * moveSpeed;
            dy -= this._camera.direction.y * moveSpeed;
        }

        if (this._controlStates.right) {
            dx += this._camera.direction.x * moveSpeed;
            dy += this._camera.direction.y * moveSpeed;
        }

        if (this._controlStates.forward) {
            dx += this._player.direction.x * moveSpeed;
            dy += this._player.direction.y * moveSpeed;
        }

        if (this._controlStates.backward) {
            dx -= this._player.direction.x * moveSpeed;
            dy -= this._player.direction.y * moveSpeed;
        }

        this.posX += dx;
        this.posY += dy;

        if (this._controlStates.rotateLeft) {
            const oldPlayerDirectionX = this._player.direction.x;
            const oldCameraDirectionX = this._camera.direction.x;
            const sinNegativeRotationSpeed = Math.sin(-rotationSpeed);
            const cosNegativeRotationSpeed = Math.cos(-rotationSpeed);

            this._player.direction.x = this._player.direction.x * cosNegativeRotationSpeed - this._player.direction.y * sinNegativeRotationSpeed;
            this._player.direction.y = oldPlayerDirectionX * sinNegativeRotationSpeed + this._player.direction.y * cosNegativeRotationSpeed;

            this._camera.direction.x = this._camera.direction.x * cosNegativeRotationSpeed - this._camera.direction.y * sinNegativeRotationSpeed;
            this._camera.direction.y = oldCameraDirectionX * sinNegativeRotationSpeed + this._camera.direction.y * cosNegativeRotationSpeed;
        }

        if (this._controlStates.rotateRight) {
            const oldPlayerDirectionX = this._player.direction.x;
            const oldCameraDirectionX = this._camera.direction.x;
            const sinRotationSpeed = Math.sin(rotationSpeed);
            const cosRotationSpeed = Math.cos(rotationSpeed);

            this._player.direction.x = this._player.direction.x * cosRotationSpeed - this._player.direction.y * sinRotationSpeed;
            this._player.direction.y = oldPlayerDirectionX * sinRotationSpeed + this._player.direction.y * cosRotationSpeed;

            this._camera.direction.x = this._camera.direction.x * cosRotationSpeed - this._camera.direction.y * sinRotationSpeed;
            this._camera.direction.y = oldCameraDirectionX * sinRotationSpeed + this._camera.direction.y * cosRotationSpeed;
        }
    }

    drawFilledRect(x, y, width, height, color) {
        this._context.fillStyle = color;
        this._context.fillRect(x, y, width, height);
    }

    raycast() {
        for(let x = 0; x < this._width; x++) {
            const ray = { direction: {} };
            const cameraX = 2 * x / this._width - 1; // x-coordinate in camera space

            ray.direction.x = this._player.direction.x + this._camera.direction.x * cameraX;
            ray.direction.y = this._player.direction.y + this._camera.direction.y * cameraX;

            // which tile of the map we're in
            let mapX = Math.floor(this._player.position.x);
            let mapY = Math.floor(this._player.position.y);

             // length of ray from current position to next x or y-side
            let sideDistX;
            let sideDistY;

            // length of ray from one x or y-side to next x or y-side
            const deltaDistX = Math.abs(1 / ray.direction.x);
            const deltaDistY = Math.abs(1 / ray.direction.y);
            let perpWallDist;

            // what direction to step in x or y-direction (either +1 or -1)
            let stepX;
            let stepY;

            let hit = 0; // was there a wall hit?
            let side; // was a NS or a EW wall hit?

            // calculate step and initial sideDist
            if (ray.direction.x < 0) {
                stepX = -1;
                sideDistX = (this._player.position.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1 - this._player.position.x) * deltaDistX;
            }

            if (ray.direction.y < 0) {
                stepY = -1;
                sideDistY = (this._player.position.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1 - this._player.position.y) * deltaDistY;
            }

            // perform DDA
            while (hit === 0) {
                // jump to next map square, OR in x-direction, OR in y-direction
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                // Check if ray has hit a wall
                if (this.getMapTileByXY(mapX, mapY) > 0) hit = 1;
            }

            console.log('mapX', mapX);
            console.log('mapY', mapY);

            // Calculate distance projected on camera direction
            if (side === 0) perpWallDist = (mapX - this._player.position.x + (1 - stepX) / 2) / ray.direction.x;
            else perpWallDist = (mapY - this._player.position.y + (1 - stepY) / 2) / ray.direction.y;

            // Calculate height of line to draw on screen
            const lineHeight = parseInt(this._height / perpWallDist);
            const playerElevationOffset = Math.floor(this.playerElevation * lineHeight);

            // calculate lowest and highest pixel to fill in current stripe
            let drawStart = (-lineHeight / 2 + this._height / 2);
            if (drawStart < 0) drawStart = 0;

            let drawEnd = (lineHeight / 2 + this._height / 2);
            if (drawEnd >= this._height) drawEnd = this._height - 1;

            //choose wall color
            let color
            switch(this.getMapTileByXY(mapX, mapY))
            {
                  case 1:
                      color = '#F00';
                      break;
                  case 2:
                      color = '#0F0';
                      break;
                  case 3:
                      color = '#00F';
                      break;
                  case 4:
                      color = '#FFF';
                      break;
                  default:
                      color = '#FF0';
                      break;
            }

            //give x and y sides different brightness
            if (side == 1) color = color.replace('F', '8');

            this.drawFilledRect(x, drawStart, 1, lineHeight, color);
        }
    }

    getMapTileByXY(x, y) {
        return y * mapWidth + x;
    }

    update(secondsElapsed) {
        this.drawFilledRect(0, 0, this._width, this._height, '#000000');
        this.raycast();
        this._handleControlStateInput();
    }
}