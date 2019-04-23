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
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
], 0);
level.setWalls([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
], 1);
level.setWalls([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
        this._directionalLight.shadowCameraFar = 256;
        this._directionalLight.shadowCameraLeft = -MAP_WIDTH/2 * TILE_SIZE;
        this._directionalLight.shadowCameraRight = MAP_WIDTH/2 * TILE_SIZE;
        this._directionalLight.shadowCameraTop = MAP_HEIGHT/2 * TILE_SIZE;
        this._directionalLight.shadowCameraBottom = -MAP_HEIGHT/2 * TILE_SIZE;
        this._directionalLightHelper = new THREE.CameraHelper(this._directionalLight.shadow.camera);

        // player
        this._playerVelocity = new THREE.Vector3();
        this._playerDirection = new THREE.Vector3();
        this._playerFriction = 9.8;
        this._playerSpeed = 750;
        this._playerMass = 100;

        // sprites
        const sprite = new Sprite('https://i.imgur.com/NPO6nJU.png');
        sprite.mesh.position.x = TILE_SIZE * 4;
        sprite.mesh.position.y = TILE_SIZE / 2;
        sprite.mesh.position.z = TILE_SIZE * 1;

        const sprite2 = new Sprite('https://i.imgur.com/NPO6nJU.png');
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
        };
        this._controlStates = {
            'left': false,
            'right': false,
            'forward': false,
            'backward': false,
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

        // add map (-1 for floow layer)
        for (let y = -1; y < MAP_ELEVATIONS; y++) {
            for (let z = 0; z < MAP_HEIGHT; z++) {
                for(let x = 0; x < MAP_WIDTH; x++) {
                    const mapIndex = level.getWallTileByXY(x, z, y);

                    if (mapIndex === 0) continue;
                    const box = new Box();
                    box.mesh.position.x = TILE_SIZE * x;
                    box.mesh.position.z = TILE_SIZE * z;
                    box.mesh.position.y = (TILE_SIZE * y) + (TILE_SIZE / 2);
                    this._scene.add(box.mesh);
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
        this._playerVelocity.x -= this._playerVelocity.x * this._playerFriction * seconds;
        this._playerVelocity.z -= this._playerVelocity.z * this._playerFriction * seconds;
        // this._playerVelocity.y -= 9.8 * this._playerMass * seconds;

        this._playerDirection.z = Number(this._controlStates.forward) - Number(this._controlStates.backward);
        this._playerDirection.x = Number(this._controlStates.left) - Number(this._controlStates.right);
        this._playerDirection.normalize();

        if (this._controlStates.forward || this._controlStates.backward) {
            this._playerVelocity.z -= this._playerDirection.z * this._playerSpeed * seconds;
        }

        if (this._controlStates.left || this._controlStates.right) {
            this._playerVelocity.x -= this._playerDirection.x * this._playerSpeed * seconds;
        }

        if (!this._controls) return;
        this._controls.object.translateX(this._playerVelocity.x * seconds);
        this._controls.object.translateY(this._playerVelocity.y * seconds);
        this._controls.object.translateZ(this._playerVelocity.z * seconds);
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

        this._sprites.forEach(sprite => {
            // the _controls object should always exist, probably shout refactor this out
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
