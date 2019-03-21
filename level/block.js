export default class Block {
	constructor() {
		this._height = 1;
	}

	get height() {
		return this._height;
	}

	set height(value) {
		this._height = value;
	}
};
