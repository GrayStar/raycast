export default class Bitmap {
    constructor(image, width, height) {
        this.width = width;
        this.height = height;

        this.imageBuffer = document.createElement('canvas');
        this.imageBuffer.width = this.width;
        this.imageBuffer.height = this.height;
        this.imageBufferContext = this.imageBuffer.getContext('2d');
        this.imageBufferContext.drawImage(image, 0, 0);
        this.imageData = this.imageBufferContext.getImageData(0, 0, this.width, this.height);

        this.data = this.imageData.data;

        delete this.imageBuffer;
        delete this.imageBufferContext;
        delete this.imageData
    }
}