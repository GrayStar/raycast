import * as THREE from 'three';
import { PI_2 } from 'app/utilities/math-utilities';

export default class Sprite {
    constructor(textureSource) {
        // Load textures
        this._spriteTexture = new THREE.TextureLoader().load(textureSource);
        this._spriteTexture.magFilter = THREE.NearestFilter;

        // Create geometry
        this._spriteGeometry = new THREE.PlaneBufferGeometry(64, 64);

        // Make material double sided, apply sprite texture
        this._spriteMaterial = new THREE.MeshLambertMaterial({
            map: this._spriteTexture,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
        });

        // Apply material to geometry
        this._spriteMesh = new THREE.Mesh(this._spriteGeometry, this._spriteMaterial);

        // Allow mesh to recieve/cast shadows
        this._spriteMesh.castShadow = true;
        this._spriteMesh.receiveShadow = true;
    }

    get mesh() {
        return this._spriteMesh;
    }

    get texture() {
        return this._spriteTexture;
    }
}