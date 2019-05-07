import { Component } from 'react';
import * as THREE from 'three';

import PointerLockBlocker from 'app/components/pointer-lock-blocker';
import PointerLockControls from 'app/components/pointer-lock-controls';
import Level from 'app/level/level';
import Box from 'app/level/box';
import Plane from 'app/level/plane';
import Sprite from 'app/level/sprite';

import styles from 'app/scss/components/scene.scss';

const level = new Level();
level.setWalls([
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
], -1);
level.setWalls([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
], 0);
level.setWalls([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
], 1);
level.setWalls([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
], 2);

const MAP_ELEVATIONS = level.walls.length;
const MAP_WIDTH = level.width;
const MAP_HEIGHT = level.height;
const TILE_SIZE = 16;

export default class Scene extends Component {
    constructor (props) {
        super(props);

        this.state = {
            looping: false,
            isLocked: false,
        };

        this._width = 800;
        this._height = 525;

        // renderer
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._width, this._height);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // camera
        this._fov = 66;
        this._minRenderDistance = 1;
        this._maxRenderDistance = 256;
        this._camera = new THREE.PerspectiveCamera(this._fov, this._width / this._height, this._minRenderDistance, this._maxRenderDistance);

        // scene
        this._skyColor = 0x3079B5;
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(this._skyColor);
        this._scene.fog = new THREE.Fog(this._skyColor, 0, this._maxRenderDistance);

        // ambient lighting (global illumination)
        this._ambientLight = new THREE.AmbientLight(0xffffff);

        // directional lighting (outdoor environments, "the sun")
        this._directionalLight = new THREE.DirectionalLight(0xffffff, 0.32);
        this._directionalLight.position.set(
            ((MAP_WIDTH / 2) * TILE_SIZE) - (TILE_SIZE / 2),
            64,
            ((MAP_HEIGHT / 2) * TILE_SIZE) - (TILE_SIZE / 2),
        );
        this._directionalLight.target.position.set(
            ((MAP_WIDTH / 2) * TILE_SIZE) - (TILE_SIZE / 2),
            0,
            ((MAP_HEIGHT / 2) * TILE_SIZE) - (TILE_SIZE / 2),
        );
        this._directionalLight.castShadow = true;
        this._directionalLight.shadow.camera.far = 256;
        this._directionalLight.shadow.camera.left = -MAP_WIDTH/2 * TILE_SIZE;
        this._directionalLight.shadow.camera.right = MAP_WIDTH/2 * TILE_SIZE;
        this._directionalLight.shadow.camera.top = MAP_HEIGHT/2 * TILE_SIZE;
        this._directionalLight.shadow.camera.bottom = -MAP_HEIGHT/2 * TILE_SIZE;
        this._directionalLightHelper = new THREE.CameraHelper(this._directionalLight.shadow.camera);

        // player
        this._playerVelocity = new THREE.Vector3();
        this._playerDirection = new THREE.Vector3();
        this._playerFriction = 9.8;
        this._playerGravity = 9.8;
        this._playerSpeed = 600;
        this._playerMass = 16;
        this._playerWidth = 4;
        this._playerHeight = 8;
        this._playerCanJump = false;
        this._playerJumpStrength = 80;

        this._collisionObjects = [];

        // sprites
        const sprite = new Sprite('/static/images/sprites/yellow-guy/yellow-guy-front.png');
        sprite.mesh.position.x = TILE_SIZE * 4;
        sprite.mesh.position.y = TILE_SIZE / 2;
        sprite.mesh.position.z = TILE_SIZE * 1;

        const sprite2 = new Sprite('/static/images/sprites/yellow-guy/yellow-guy-front.png');
        sprite2.mesh.position.x = TILE_SIZE * 4;
        sprite2.mesh.position.y = TILE_SIZE / 2;
        sprite2.mesh.position.z = TILE_SIZE * 6;

        this._sprites = [];
        this._sprites.push(sprite);
        this._sprites.push(sprite2);

        // controls
        this._codes = {
            65: 'left',
            68: 'right',
            87: 'forward',
            83: 'backward',
            32: 'jump',
        };
        this._controlStates = {
            'left': false,
            'right': false,
            'forward': false,
            'backward': false,
            'jump': false,
        };

        this._frame = this._frame.bind(this);
        this._handlePointerLockBlockerClick = this._handlePointerLockBlockerClick.bind(this);
        this._handleControlsUnlock = this._handleControlsUnlock.bind(this);
        this._handleWindowResize = this._handleWindowResize.bind(this);

        document.addEventListener('keydown', this._handleOnKey.bind(this, true), false);
        document.addEventListener('keyup', this._handleOnKey.bind(this, false), false);
        window.addEventListener('resize', this._handleWindowResize, false);
    }

    componentDidMount() {
        // Add controls
        this._scene.add(this._controls.object);

        // add map (start at -1 for floor layer)
        for (let y = -1; y < MAP_ELEVATIONS; y++) {
            for (let z = 0; z < MAP_HEIGHT; z++) {
                for(let x = 0; x < MAP_WIDTH; x++) {
                    const mapIndex = level.getWallTileByXY(x, z, y);

                    if (mapIndex === 0) continue;

                    const box = new Box();
                    box.mesh.position.x = TILE_SIZE * x;
                    box.mesh.position.z = TILE_SIZE * z;
                    box.mesh.position.y = (TILE_SIZE * y) + (TILE_SIZE / 2);
                    box.mesh.geometry.boundingBox = new THREE.Box3().setFromObject(box.mesh);

                    this._scene.add(box.mesh);
                    this._collisionObjects.push(box.mesh);
                }
            }
        }

        // add sprites
        this._sprites.forEach(sprite => this._scene.add(sprite.mesh));

        // Add lights
        this._scene.add(this._ambientLight);
        this._scene.add(this._directionalLight);
        this._scene.add(this._directionalLight.target);
        this._scene.add(this._directionalLightHelper);

        // Append THREE's canvas
        this._container.appendChild(this._renderer.domElement);
    }

    _handleOnKey(value, event) {
        const state = this._codes[event.keyCode];
        if (typeof state === 'undefined') return;
        this._controlStates[state] = value;

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
    }

    _handleWindowResize() {
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height);
    }

    _handlePointerLockBlockerClick() {
        this.setState({ isLocked: true });
    }

    _handleControlsUnlock() {
        this.setState({ isLocked: false });
    }

    _moveControlsObject(seconds) {
        if (!this._controls) return;

        // Always apply friction and gravity
        this._playerVelocity.x -= this._playerVelocity.x * this._playerFriction * seconds;
        this._playerVelocity.y -= this._playerGravity * this._playerMass * seconds;
        this._playerVelocity.z -= this._playerVelocity.z * this._playerFriction * seconds;

        // Remove player x/z velocity when number gets small enough
        // (friction will never fully remove it)
        if (this._playerVelocity.x < 1 && this._playerVelocity.x > -1) this._playerVelocity.x = 0;
        if (this._playerVelocity.z < 1 && this._playerVelocity.z > -1) this._playerVelocity.z = 0;

        // Figure out direction of camera
        // (cameras look down their own negative axis, thus we need the '-' to invert it)
        const cameraDirection = this._controls.object.getWorldDirection(this._playerDirection);
        const directionX = -cameraDirection.x;
        const directionZ = -cameraDirection.z;
        const planeX = directionZ;
        const planeZ = -directionX;

        // Handle controlStates
        if (this._controlStates.forward) {
            this._playerVelocity.x += directionX * (this._playerSpeed * seconds);
            this._playerVelocity.z += directionZ * (this._playerSpeed * seconds);
        }
        if (this._controlStates.backward) {
            this._playerVelocity.x -= directionX * (this._playerSpeed * seconds);
            this._playerVelocity.z -= directionZ * (this._playerSpeed * seconds);
        }
        if (this._controlStates.left) {
            this._playerVelocity.x += planeX * (this._playerSpeed * seconds);
            this._playerVelocity.z += planeZ * (this._playerSpeed * seconds);
        }
        if (this._controlStates.right) {
            this._playerVelocity.x -= planeX * (this._playerSpeed * seconds);
            this._playerVelocity.z -= planeZ * (this._playerSpeed * seconds);
        }
        if (this._controlStates.jump && this._playerCanJump) this._playerVelocity.y += this._playerJumpStrength;

        // Save off current position
        const currentX = this._controls.object.position.x;
        const currentY = this._controls.object.position.y;
        const currentZ = this._controls.object.position.z;

        // Predict next position
        let nextX = this._controls.object.position.x + (this._playerVelocity.x * seconds);
        let nextY = this._controls.object.position.y + (this._playerVelocity.y * seconds);
        let nextZ = this._controls.object.position.z + (this._playerVelocity.z * seconds);

        // Check x collisions (east/west)
        if (this._playerVelocity.x !== 0) {
            const nextXPosition = new THREE.Vector3(nextX, currentY, currentZ);
            const collision = this._checkCollision(nextXPosition);

            if (collision) {
                if (this._playerVelocity.x > 0) {
                    nextX = collision.min.x - this._playerWidth;
                } else if (this._playerVelocity.x < 0) {
                    nextX = collision.max.x + this._playerWidth;
                }
            }
        }

        // Check y collisions (up/down)
        if (this._playerVelocity.y !== 0) {
            const nextYPosition = new THREE.Vector3(currentX, nextY, currentZ);
            const collision = this._checkCollision(nextYPosition);

            this._playerCanJump = false;

            if (collision) {
                if (this._playerVelocity.y < 0) {
                    this._playerVelocity.y = 0;
                    nextY = collision.max.y + this._playerHeight;
                    this._playerCanJump = true;
                } else if (this._playerVelocity.y > 0) {
                    this._playerVelocity.y = 0;
                    nextY = collision.min.y - this._playerHeight;
                }
            }
        }

        // Check z collisions (north/south)
        if (this._playerVelocity.z !== 0) {
            const nextZPosition = new THREE.Vector3(currentX, currentY, nextZ);
            const collision = this._checkCollision(nextZPosition);

            if (collision) {
                if (this._playerVelocity.z > 0) {
                    nextZ = collision.min.z - this._playerWidth;
                } if (this._playerVelocity.z < 0) {
                    nextZ = collision.max.z + this._playerWidth;
                }
            }
        }

        // Update player position
        this._controls.object.position.x = nextX;
        this._controls.object.position.y = nextY;
        this._controls.object.position.z = nextZ;
    }

    _checkCollision(positionVector3) {
        for(let i = 0; i < this._collisionObjects.length; i++) {
            const collisionObject = this._collisionObjects[i];
            const objectPosition = collisionObject.position;
            const objectBoundingBox = collisionObject.geometry.boundingBox;

            if ((positionVector3.x + this._playerWidth > objectBoundingBox.min.x && positionVector3.x - this._playerWidth < objectBoundingBox.max.x) &&
                (positionVector3.y + this._playerHeight > objectBoundingBox.min.y && positionVector3.y - this._playerHeight < objectBoundingBox.max.y) &&
                (positionVector3.z + this._playerWidth > objectBoundingBox.min.z && positionVector3.z - this._playerWidth < objectBoundingBox.max.z)) {
                return objectBoundingBox;
            }
        }
    }

    _frame(time) {
        if (!this.state.looping) return;

        const secondsElapsed = (time - this._lastTime) / 1000;
        this._lastTime = time;

        if (secondsElapsed < 0.2) this._update(secondsElapsed);
        requestAnimationFrame(this._frame);
    }

    _update(secondsElapsed) {
        this._moveControlsObject(secondsElapsed);
        this._renderer.render(this._scene, this._camera);

        // Have all sprites look at the camera
        this._sprites.forEach(sprite => {
            // the _controls object should always exist, probably should refactor this out
            if (this._controls) sprite.render(this._controls.object);
        });
    }

    start() {
        this.setState({ looping: true }, () => {
            this._lastTime = 0;
            requestAnimationFrame(this._frame);
        });
    }

    stop() {
        this.setState({ looping: false });
    }

    get _pointerLockBlocker() {
        if (this.state.isLocked) return null;
        return <PointerLockBlocker onClick={ this._handlePointerLockBlockerClick }/>;
    }

    render() {
        return (
            <div
                className={ styles.scene }
                style={{ width: this._width, height: this._height }}
                ref={ container => this._container = container }>
                <PointerLockControls
                    ref={ controls => this._controls = controls }
                    camera={ this._camera }
                    domElement={ this._container }
                    isLocked={ this.state.isLocked }
                    onUnlock={ this._handleControlsUnlock }/>
                { this._pointerLockBlocker }
            </div>
        );
    }
}
