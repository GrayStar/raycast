import {
    degreeToRadian,
    radianToVx,
    radianToVy,
} from 'app/utilities/math-utilities';

import Level from 'app/level/level';


const BYTES_PER_PIXEL = 4;

export default class Raycast {
    constructor(canvas, level) {
        // canvas
        this._canvas = canvas;
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._halfWidth = this._width / 2;
        this._halfHeight = this._height / 2;
        this._context = this._canvas.getContext('2d');

        this.MAP = level;
        this.MAP_ELEVATIONS = level.walls;
        this.MAP_WIDTH = level.width;
        this.MAP_HEIGHT = level.height;

        this._player = {
            position: {
                x: 1.5,
                y: 4,
                elevation: 0.5,
            },
            direction: {
                angle: 0,
            },
            moveSpeed: 4,
            rotationSpeed: 3,
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

        this._player.position.x += dx;
        this._player.position.y += dy;

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

    _drawFilledRect(x, y, width, height, color) {
        this._context.fillStyle = color;
        this._context.fillRect(x, y, width, height);
    }

    _raycast(elevation) {
        // Set up a buffer for elevations
        const wallBuffer = [];

        // Loop through each column (x) of pixels across the canvas
        for(let x = 0; x < this._width; x++) {
            // Only debug the center-most ray
            let debug = false;
            if (x === this._halfWidth) debug = true;

            // X-coordinate in camera space
            const cameraX = 2 * x / this._width - 1;

            // X and y direction of the ray
            const rayDirectionX = this._player.direction.x + this._camera.direction.x * cameraX;
            const rayDirectionY = this._player.direction.y + this._camera.direction.y * cameraX;

            // Current tile of the map the player is in
            let mapX = Math.floor(this._player.position.x);
            let mapY = Math.floor(this._player.position.y);

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
                sideDistanceX = (this._player.position.x - mapX) * deltaDistanceX;
            } else {
                stepX = 1;
                sideDistanceX = (mapX + 1 - this._player.position.x) * deltaDistanceX;
            }

            if (rayDirectionY < 0) {
                stepY = -1;
                sideDistanceY = (this._player.position.y - mapY) * deltaDistanceY;
            } else {
                stepY = 1;
                sideDistanceY = (mapY + 1 - this._player.position.y) * deltaDistanceY;
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
                if (mapX < 0 || mapX >= this.MAP_WIDTH || mapY < 0 || mapY >= this.MAP_HEIGHT) {
                    outsideBounds = true;
                    continue;
                }

                // Check if ray has hit a wall
                if (this.MAP.getWallTileByXY(mapX, mapY, elevation) > 0) {
                    // If the elevation is above the player, do not stop the cast,
                    // save the wall data to the buffer, this allows for overhangs
                    if (elevation > this._player.position.elevation) {
                        const {
                            lineHeight,
                            elevationOffset,
                            drawStart,
                            drawEnd,
                            color,
                        } = this._getColumnPropertiesFromRay(side, mapX, stepX, rayDirectionX, mapY, stepY, rayDirectionY, elevation);

                        wallBuffer.push({
                            x,
                            lineHeight,
                            elevationOffset,
                            drawStart,
                            color,
                        });
                    } else {
                        hit = true;
                    }
                }
            }

            // Stop all calucations if outside bounds of map
            if (outsideBounds) continue;

            const {
                lineHeight,
                elevationOffset,
                drawStart,
                color,
            } = this._getColumnPropertiesFromRay(side, mapX, stepX, rayDirectionX, mapY, stepY, rayDirectionY, elevation);

            // Color the debug column
            if (debug) color = '#FFF';

            // Draw wall sliver
            this._drawFilledRect(x, drawStart - elevationOffset, 1, lineHeight, color);
        }

        // draw wallBuffer in reverse order
        for(let i = wallBuffer.length - 1; i >= 0; i--) {
            const wall = wallBuffer[i];
            this._drawFilledRect(wall.x, wall.drawStart - wall.elevationOffset, 1, wall.lineHeight, wall.color);
        }
    }

    _getColumnPropertiesFromRay(side, mapX, stepX, rayDirectionX, mapY, stepY, rayDirectionY, elevation) {
        // Calculate distance projected on camera direction
        let rayDistance;
        if (side === 0) rayDistance = (mapX - this._player.position.x + (1 - stepX) / 2) / rayDirectionX;
        else rayDistance = (mapY - this._player.position.y + (1 - stepY) / 2) / rayDirectionY;

        // Calculate height of line to draw on screen
        const lineHeight = Math.floor(this._height / rayDistance);
        const halfLineHeight = lineHeight / 2;

        // Calculate the elevation offset
        const elevationOffset = Math.floor(lineHeight * elevation);

        // Calculate lowest and highest pixel to fill in current stripe
        let drawStart = -halfLineHeight + this._halfHeight;
        if (drawStart < 0) drawStart = 0;
        let drawEnd = halfLineHeight + this._halfHeight;
        if (drawEnd >= this._height) drawEnd = this._height - 1;

        let color;
        switch(this.MAP.getWallTileByXY(mapX, mapY, elevation)) {
              case 1:
                  color = '#F00';
                  break;
              case 2:
                  color = '#0F0';
                  break;
              case 3:
                  color = '#00F';
                  break;
              default:
                  color = '#FF0';
                  break;
        }

        // Give x and y sides different brightness
        if (side === 1) color = color.replace('F', '8');

        return {
            rayDistance,
            lineHeight,
            halfLineHeight,
            elevationOffset,
            drawStart,
            drawEnd,
            color,
        };
    }

    update(secondsElapsed) {
        this._drawFilledRect(0, 0, this._width, this._height, '#000000');

        // for each elevation within the level, cast rays
        for (let i = this.MAP_ELEVATIONS.length - 1; i >= 0; i--) {
            this._raycast(i);
        }

        this._handleControlStateInput(secondsElapsed);
    }
}