export default class Level {
    constructor() {
        this._wallMap = [];

        this._width = 0;
        this._height = 0;
    }

    _flattenArray(array) {
        return [].concat.apply([], array);
    }

    getWallTileByXY(x, y, elevation) {
        const wallTileIndex = y * this._width + x;
        return this._wallMap[elevation][wallTileIndex];
    }

    setWalls(wallMap, elevationLevel) {
        this._width = wallMap[0].length;
        this._height = wallMap.length;
        this._wallMap[elevationLevel] = this._flattenArray(wallMap);
    }

    getWallsByElevation(elevation) {
        return this._wallMap[elevation];
    }

    get walls() {
        return this._wallMap;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
}