import { Component } from 'react';
import * as THREE from 'three';

import Controls from 'app/level/controls';
import Box from 'app/level/box';

export default class Scene extends Component {
    constructor (props) {
        super(props);

        this.state = { looping: false };

        this._frame = this._frame.bind(this);
        this._handleWindowResize = this._handleWindowResize.bind(this);

        window.addEventListener('resize', this._handleWindowResize, false);
    }

    componentDidMount() {
        this._width = 800;
        this._height = 525;

        // scene
        this._scene = new THREE.Scene();

        // renderer
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._width, this._height);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // camera and controls
        this._camera = new THREE.PerspectiveCamera(66, this._width / this._height, 1, 1000);
        this._controls = new Controls(this._camera, this._container);
        this._velocity = new THREE.Vector3();
        this._scene.add(this._controls.object);

        // ambient lighting (sun)
        this._light = new THREE.HemisphereLight();
        this._scene.add(this._light);

        // point lighting (for shadow testing)
        this._pointLight = new THREE.PointLight(0xFFFFFF, 1, 320);
        this._pointLight.position.set(64, 192, 0);
        this._pointLight.castShadow = true;
        this._scene.add(this._pointLight);
        this._pointLightHelper = new THREE.CameraHelper( this._pointLight.shadow.camera );
        this._scene.add(this._pointLightHelper);

        // ground
        this._groundGeometry = new THREE.PlaneGeometry(256, 256, 4, 4);
        this._groundMaterial = new THREE.MeshLambertMaterial({ color: 0xA1DDBD, side: THREE.DoubleSide });
        this._groundMesh = new THREE.Mesh(this._groundGeometry, this._groundMaterial);
        this._groundMesh.rotation.x = -(Math.PI / 2);
        this._groundMesh.receiveShadow = true;
        this._scene.add(this._groundMesh);

        // box
        this._box = new Box();
        this._box.mesh.position.y = 64;
        this._scene.add(this._box.mesh);

        // append THREE's canvas
        this._container.appendChild(this._renderer.domElement);
    }

    _handleWindowResize() {
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height);
    }

    _frame(time) {
        if (!this.state.looping) return;

        const secondsElapsed = (time - this._lastTime) / 1000;
        this._lastTime = time;

        if (secondsElapsed < 0.2) this._update(secondsElapsed);
        requestAnimationFrame(this._frame);
    }

    _update(secondsElapsed) {
        this._box.mesh.rotation.x += 0.01;
        this._box.mesh.rotation.y += 0.03;

        this._controls.object.translateX(this._velocity.x * secondsElapsed);
        this._controls.object.translateY(this._velocity.y * secondsElapsed);
        this._controls.object.translateZ(this._velocity.z * secondsElapsed);

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

    render() {
        return (
            <div style={{ width: this._width, height: this._height }} ref={ container => this._container = container }></div>
        );
    }
}
