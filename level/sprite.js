import * as THREE from 'three';

export default class Sprite {
    constructor(textureSource) {
        // Load texture
        this._spriteTexture = new THREE.TextureLoader().load(textureSource);

        // Set texture filter mode
        this._spriteTexture.magFilter = THREE.NearestFilter;

        // Make material double sided, apply sprite texture, allow transparency
        this._spriteMaterial = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            map: this._spriteTexture,
            alphaTest: 0.5,
        });

        // Create geometry
        this._spriteGeometry = new THREE.PlaneBufferGeometry(64, 64);

        // Apply material to geometry
        this._spriteMesh = new THREE.Mesh(this._spriteGeometry, this._spriteMaterial);

        // Allow mesh to cast/recieve shadows
        this._spriteMesh.castShadow = true;
        this._spriteMesh.receiveShadow = true;

        // Allow shadow to reflect alphaTest of the texture
        this._spriteMesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({
            map: this._spriteTexture,
            alphaTest: 0.5,
        });
    }

    get mesh() {
        return this._spriteMesh;
    }
}