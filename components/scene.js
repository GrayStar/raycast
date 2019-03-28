import { Component } from 'react';
import * as THREE from 'three';

import PointerLockBlocker from 'app/components/pointer-lock-blocker';

//import PointerLockControls from 'app/level/pointer-lock-controls';
import PointerLockControls from 'app/components/pointer-lock-controls';
import Box from 'app/level/box';
import Plane from 'app/level/plane';

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

        // scene
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x3079B5);
        // this._scene.fog = new THREE.Fog(0xFFFFFF, 0, 768); // color, null, distance you can see in px

        // renderer
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._width, this._height);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // camera
        this._camera = new THREE.PerspectiveCamera(66, this._width / this._height, 1, 1000);

        // ambient lighting (sun)
        this._light = new THREE.HemisphereLight();

        // point lighting (for shadow testing)
        this._pointLight = new THREE.PointLight(0xFFFFFF, 1, 500);
        this._pointLight.position.set(384, 224, 256);
        this._pointLight.castShadow = true;
        this._pointLightHelper = new THREE.CameraHelper( this._pointLight.shadow.camera );

        // ground
        this._plane = new Plane();

        this._frame = this._frame.bind(this);
        this._handlePointerLockBlockerClick = this._handlePointerLockBlockerClick.bind(this);
        this._handleControlsUnlock = this._handleControlsUnlock.bind(this);
        this._handleWindowResize = this._handleWindowResize.bind(this);

        window.addEventListener('resize', this._handleWindowResize, false);
    }

    componentDidMount() {
        // Add controls
        this._scene.add(this._controls.object);

        // Add lights
        this._scene.add(this._light);
        this._scene.add(this._pointLight);
        this._scene.add(this._pointLightHelper);

        // Add solids
        // this._scene.add(this._plane.mesh);
        // this._scene.add(this._box.mesh);


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

        // Append THREE's canvas
        this._container.appendChild(this._renderer.domElement);
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
        this._renderer.render(this._scene, this._camera);
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
