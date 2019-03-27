import * as THREE from 'three';

const PI_2 = Math.PI / 2;

export default class Controls {
	constructor(camera, domElement) {
		this._domElement = domElement || document.body;
		this._isLocked = false;

		camera.rotation.set(0, 0, 0);

		this._pitchObject = new THREE.Object3D();
		this._pitchObject.add(camera);

		this._yawObject = new THREE.Object3D();
		this._yawObject.position.y = 10;
		this._yawObject.add(this._pitchObject);

		this._handleMouseMove = this._handleMouseMove.bind(this);
		this._handleMouseMove = this._handleMouseMove.bind(this);
		this._handlePointerLockChange = this._handlePointerLockChange.bind(this);
		this._handlePointerLockError = this._handlePointerLockError.bind(this);

		this.connect();
	}

	_handleMouseMove(event) {
		if (this._isLocked === false) return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		this._yawObject.rotation.y -= movementX * 0.002;
		this._pitchObject.rotation.x -= movementY * 0.002;

		this._pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this._pitchObject.rotation.x));
	}

	_handlePointerLockChange() {
		if (document.pointerLockElement === this._domElement) {
			this._isLocked = true;
	 	} else {
	 		this._isLocked = false;
	 	}
	}

	_handlePointerLockError() {
		console.error('PointerLockControls: Unable to use Pointer Lock API');
	}

	connect() {
		document.addEventListener('mousemove', this._handleMouseMove, false);
		document.addEventListener('pointerlockchange', this._handlePointerLockChange, false);
		document.addEventListener('pointerlockerror', this._handlePointerLockError, false);
	}

	disconnect() {
		document.removeEventListener('mousemove', this._handleMouseMove, false);
		document.removeEventListener('pointerlockchange', this._handlePointerLockChange, false);
		document.removeEventListener('pointerlockerror', this._handlePointerLockError, false);
	}

	dispose() {
		this.disconnect();
	}

	lock() {
		this._domElement.requestPointerLock();
	}

	unlock() {
		document.exitPointerLock();
	}

	get object() {
		return this._yawObject;
	}

	getDirection() {
		// assumes the camera itself is not rotated
		const direction = new THREE.Vector3(0, 0, -1);
		const rotation = new THREE.Euler(0, 0, 0, 'YXZ');

		return (v) => {
			rotation.set( this._pitchObject.rotation.x, this._yawObject.rotation.y, 0 );

			v.copy(direction).applyEuler(rotation);

			return v;
		}
	}
}
