import * as THREE from 'three';

export default class Sprite {
    constructor(textureSource) {
        // Load textures
        this._spriteTexture = new THREE.TextureLoader().load(textureSource);
        this._spriteTexture.magFilter = THREE.NearestFilter;

        // Make material double sided, apply sprite texture
        this._spriteMaterial = new THREE.MeshLambertMaterial({
            map: this._spriteTexture,
            side: THREE.DoubleSide,
            transparent: true,
        });

        // Create geometry
        this._spriteGeometry = new THREE.PlaneBufferGeometry(64, 64);

        // Apply material to geometry
        this._spriteMesh = new THREE.Mesh(this._spriteGeometry, this._spriteMaterial);

        // Allow mesh to recieve/cast shadows
        this._spriteMesh.castShadow = true;
        this._spriteMesh.receiveShadow = true;

        // Allow transparency in shadow
        this._spriteMesh.customDepthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            map: this._spriteTexture,
            alphaTest: 0.5,
        });
    }

    get mesh() {
        return this._spriteMesh;
    }
}