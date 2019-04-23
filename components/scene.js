import { Component } from 'react';
import * as THREE from 'three';

import PointerLockBlocker from 'app/components/pointer-lock-blocker';

//import PointerLockControls from 'app/level/pointer-lock-controls';
import PointerLockControls from 'app/components/pointer-lock-controls';
import Box from 'app/level/box';
import Plane from 'app/level/plane';
import Sprite from 'app/level/sprite';

import styles from 'app/scss/components/scene.scss';

const map = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];
const floorMap = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];
const mapWidth = 12;
const mapHeight = 8;

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
        this._maxRenderDistance = 1000;
        this._camera = new THREE.PerspectiveCamera(this._fov, this._width / this._height, this._minRenderDistance, this._maxRenderDistance);

        // scene
        this._skyColor = 0x3079B5;
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(this._skyColor);
        this._scene.fog = new THREE.Fog(this._skyColor, 0, this._maxRenderDistance);

        // ambient lighting (sun)
        this._light = new THREE.HemisphereLight();

        // point lighting (for shadow testing)
        this._pointLight = new THREE.PointLight(0xFFFFFF, 1, 500);
        this._pointLight.position.set(384, 224, 224);
        this._pointLight.castShadow = true;
        this._pointLightHelper = new THREE.CameraHelper(this._pointLight.shadow.camera);

        // ground
        this._plane = new Plane();

        // player
        this._playerVelocity = new THREE.Vector3();
        this._playerDirection = new THREE.Vector3();
        this._playerFriction = 9.8;
        this._playerSpeed = 3000;

        // sprites
        const sprite = new Sprite('https://i.imgur.com/NPO6nJU.png');
        sprite.mesh.position.x = 256;
        sprite.mesh.position.y = 32;
        sprite.mesh.position.z = 133;

        const sprite2 = new Sprite('https://i.imgur.com/NPO6nJU.png');
        sprite2.mesh.position.x = 96;
        sprite2.mesh.position.y = 32;
        sprite2.mesh.position.z = 196;

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

        // add map
        for (let y = 0; y < mapHeight; y++) {
            for(let x = 0; x < mapWidth; x++) {
                const index = y * mapWidth + x;
                const mapIndex = map[index];
                const floorIndex = floorMap[index];

                if (mapIndex > 0) {
                    const box = new Box();
                    box.mesh.position.x = 64 * x;
                    box.mesh.position.z = 64 * y;
                    box.mesh.position.y = 32;
                    this._scene.add(box.mesh);
                }

                if (floorIndex > 0) {
                    const plane = new Plane();
                    plane.mesh.position.x = 64 * x;
                    plane.mesh.position.z = 64 * y;
                    this._scene.add(plane.mesh);
                }
            }
        }

        // add sprites
        this._sprites.forEach(sprite => this._scene.add(sprite.mesh));

        // Add lights
        this._scene.add(this._light);
        this._scene.add(this._pointLight);
        this._scene.add(this._pointLightHelper);

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

    _moveControlsObject(seconds) {
        this._playerVelocity.x -= this._playerVelocity.x * this._playerFriction * seconds;
        this._playerVelocity.z -= this._playerVelocity.z * this._playerFriction * seconds;
        // this._playerVelocity.y -= 9.8 * 100 * seconds; // 100 = mass

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
