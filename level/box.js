import * as THREE from 'three';

export default class Box {
    constructor() {
    	// Load textures
        this._topTexture = new THREE.TextureLoader().load('https://i.imgur.com/yeTdmkj.png');
        this._sideTexture = new THREE.TextureLoader().load('https://i.imgur.com/1jkxxi1.png');

        // Set texture filter mode
        this._topTexture.magFilter = THREE.NearestFilter;
        this._sideTexture.magFilter = THREE.NearestFilter;

        // Create geometry
        this._cubeGeometry = new THREE.BoxBufferGeometry(64, 64, 64);

        // Create materials
        this._cubeMaterials = [
            new THREE.MeshLambertMaterial({ map: this._sideTexture }), // right
            new THREE.MeshLambertMaterial({ map: this._sideTexture }), // left
            new THREE.MeshLambertMaterial({ map: this._topTexture }), // top
            new THREE.MeshLambertMaterial({ color: 0xA1DDBD }), // bottom
            new THREE.MeshLambertMaterial({ map: this._sideTexture }), // front
            new THREE.MeshLambertMaterial({ map: this._sideTexture }), // back
        ];

        // Apply materials to each face of the geometry to create mesh
        this._cubeMesh = new THREE.Mesh(this._cubeGeometry, this._cubeMaterials);

        // Allow mesh to cast shadows
        this._cubeMesh.castShadow = true;
    }

    get mesh() {
        return this._cubeMesh;
    }
}