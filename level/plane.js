import * as THREE from 'three';

import { PI_2 } from 'app/utilities/math-utilities';

export default class Plane {
    constructor() {
        // Create geometry
        this._planeGeometry = new THREE.PlaneGeometry(64, 64, 1, 1);

        // Make material double sided
        this._planeMaterial = new THREE.MeshLambertMaterial({ color: 0xA1DDBD, side: THREE.DoubleSide });

        // Apply material to geometry
        this._planeMesh = new THREE.Mesh(this._planeGeometry, this._planeMaterial);

        // Rotate plane to be flat like a floor or ceiling
        this._planeMesh.rotation.x = -PI_2;

        // Allow mesh to cast shadows
        this._planeMesh.receiveShadow = true;
    }

    get mesh() {
        return this._planeMesh;
    }
}