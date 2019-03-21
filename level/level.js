export default class Level {
    constructor() {
        this._wallMap = [];
        this._floorMap = [];
        this._ceilingMap = [];

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

    getFloorTileByXY(x, y, elevation) {
        const floorTileIndex = y * this._width + x;
        return this._floorMap[elevation][floorTileIndex];
    }

    getCeilingTileByXY(x, y, elevation) {
        const ceilingTileIndex = y * this._width + x;
        return this._ceilingMap[elevation][ceilingTileIndex];
    }

    setWalls(wallMap, elevationLevel) {
        this._width = wallMap[0].length;
        this._height = wallMap.length;
        this._wallMap[elevationLevel] = this._flattenArray(wallMap);
    }

    setFloors(floorMap, elevationLevel) {
        this._floorMap[elevationLevel] = this._flattenArray(floorMap);
    }

    setCeilings(ceilingMap, elevationLevel) {
        this._ceilingMap[elevationLevel] = this._flattenArray(ceilingMap);
    }

    getWallsByElevation(elevation) {
        return this._wallMap[elevation];
    }

    getFloorsByElevation(elevation) {
        return this._floorMap[elevation];
    }

    getCeilingsByElevation(elevation) {
        return this._ceilingMap[elevation];
    }

    get walls() {
        return this._wallMap;
    }

    get floors() {
        return this._floorMap;
    }

    get ceilings() {
        return this._ceilingMap;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
}
