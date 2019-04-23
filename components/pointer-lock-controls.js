import { Component } from 'react';
import * as THREE from 'three';

import { PI_2 } from 'app/utilities/math-utilities';

export default class PointerLockControls extends Component {
	constructor(props) {
		super(props);

		this._domElement = this.props.domElement || document.body;

		this._pitchObject = new THREE.Object3D();
		this._pitchObject.add(this.props.camera);

		this._yawObject = new THREE.Object3D();
		this._yawObject.position.y = 8; // temp (height of player)
		this._yawObject.position.z = 0; // temp
		this._yawObject.position.x = 0; // temp
		this._yawObject.add(this._pitchObject);

		this._handleMouseMove = this._handleMouseMove.bind(this);
		this._handlePointerLockChange = this._handlePointerLockChange.bind(this);
		this._handlePointerLockError = this._handlePointerLockError.bind(this);
	}

	componentDidMount() {
		this.props.camera.rotation.set(0, 0, 0);
		this._yawObject.rotation.y = -PI_2;

		document.addEventListener('mousemove', this._handleMouseMove, false);
		document.addEventListener('pointerlockchange', this._handlePointerLockChange, false);
		document.addEventListener('pointerlockerror', this._handlePointerLockError, false);
	}

	componentWillUnmount() {
		document.removeEventListener('mousemove', this._handleMouseMove, false);
		document.removeEventListener('pointerlockchange', this._handlePointerLockChange, false);
		document.removeEventListener('pointerlockerror', this._handlePointerLockError, false);
	}

	componentDidUpdate(prevProps) {
		if (this.props.isLocked !== prevProps.isLocked) {
			if (this.props.isLocked) this._lock();
		}
	}

	_handleMouseMove(event) {
		if (this.props.isLocked === false) return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		this._yawObject.rotation.y -= movementX * 0.002;
		this._pitchObject.rotation.x -= movementY * 0.002;

		this._pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this._pitchObject.rotation.x));
	}

	_handlePointerLockChange() {
		if (document.pointerLockElement !== this._domElement) this._unlock();
	}

	_handlePointerLockError() {
		console.error('PointerLockControls: Unable to use Pointer Lock API');
	}

	_lock() {
		this._domElement.requestPointerLock();
	}

	_unlock() {
		if (this.props.onUnlock) this.props.onUnlock();
		document.exitPointerLock();
	}

	get object() {
		return this._yawObject;
	}

	getDirection() {
		const direction = new THREE.Vector3(0, 0, -1);
		const rotation = new THREE.Euler(0, 0, 0, 'YXZ');

		return (vector) => {
			rotation.set(this._pitchObject.rotation.x, this._yawObject.rotation.y, 0);
			vector.copy(direction).applyEuler(rotation);

			return vector;
		}
	}

	render() {
		return null;
	}
}
