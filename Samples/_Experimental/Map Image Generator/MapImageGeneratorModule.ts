/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>

/************
* This module wraps the map and generates images from it.
*
* Warning!!!
* This is an experimental module. It accesses the maps DOM in an unsupported way and can break at anytime.
*
* Known limitations
* - Does not support navigation controls, scale bars, Infoboxes, AnimatedTileLayers, TileLayers, and most Custom Overlays
* - CORS required for map tiles and custom pushpin images.
* - Streetside imagery is not supported.
* - Bing Maps terms of use does not allow Ordnance Survey or Birdseye imagery to be "printed".
*/

/**
* Options for the Map Image Generator
*/
interface MapImageGeneratorOptions {
    /**
    * URL to where the dark bing logo image is.
    */
    darkBingLogoUrl?: string;

    /**
    * URL to where the light bing logo image is.
    */
    lightBingLogoUrl?: string;
}

/**
 * A simple class for generating an image from a map.
 */
class MapImageGenerator {
    /**********************
    * Private Properties
    ***********************/
    
    private _map: Microsoft.Maps.Map;

    private _options: MapImageGeneratorOptions = {
        darkBingLogoUrl: '/Common/images/BingLogoDark.png',
        lightBingLogoUrl: '/Common/images/BingLogoLight.png'
    };

   /**********************
   * Constructor
   ***********************/

    /**
     * @constructor
     * @param map The map to be able to generate images from.
     * @param options Options which specify where the bing URL can be found.
     */
    constructor(map: Microsoft.Maps.Map, options: MapImageGeneratorOptions) {
        this._map = map;
    }

   /**********************
   * Public Functions
   ***********************/

    /**
    * Generates a Image object for an image of the map.
    * @param successCallback A callback function to return the image to.
    * @param errorCallback A callback function for returning error messages.
    */
    public getImage(successCallback: (image: HTMLImageElement) => void, errorCallback?: (error: string) => void): void {
        if (!successCallback) {
            return;
        }

        this.getDataUri((dataUri) => {
            var img = new Image();
            img.onload = () => {
                successCallback(img);
            };
            img.src = dataUri;
        }, errorCallback);
    }

    /**
     * Generates a DataUri for an image of the map.
     * @param successCallback A callback function to return the dataUri to.
     * @param errorCallback A callback function for returning error messages.
     */
    public getDataUri(successCallback: (dataUri: string) => void, errorCallback?: (error: string) => void): void {
        if (!successCallback) {
            return;
        }

        this.getMapCanvas((mapCanvas) => {
            try {
                //Throws security error when images/tiles are hosted on different domain and don't have CORs enabled and img.crossOrigin = "anonymous";
                var url = mapCanvas.toDataURL('image/png');
                successCallback(url);
            } catch (e) {
                if (errorCallback) {
                    errorCallback(e.message);
                }
            }
        }, (e) => {
            if (errorCallback) {
                errorCallback(e);
            }
        });
    }

    /**
     * Generates a Blob for an image of the map.
     * @param successCallback A callback function to return the Blob to.
     * @param errorCallback A callback function for returning error messages.
     */
    public getBlob(successCallback: (blob: Blob) => void, errorCallback?: (error: string) => void): void {
        if (!successCallback || !Blob) {
            return;
        }

        this.getDataUri((dataUri) => {
            successCallback(this.dataUritoBlob(dataUri));
        }, errorCallback);
    }

   /**********************
   * Private Functions
   ***********************/

    /**
     * Generates a canvas image of the map.
     * @param succesCallback A callback function that is called when the map image canvas is successfully generated.
     */
    private getMapCanvas(successCallback: (mapCanvas: HTMLCanvasElement) => void, errorCallback?: (error: string) => void): void {
        try {
            var root = this._map.getRootElement();
            var canvases = root.getElementsByTagName('canvas');

            var mapCanvas = document.createElement('canvas');
            mapCanvas.width = this._map.getWidth();
            mapCanvas.height = this._map.getHeight();

            var ctx = mapCanvas.getContext('2d');

            for (var i = 0; i < canvases.length; i++) {
                var c = canvases[i];

                var offsetLeft = 0;
                var offsetTop = 0;
                var width = mapCanvas.width;
                var height = mapCanvas.height;

                // skip canvases with zero height or width
                if (c.width === 0 || c.height === 0)
                {
                    continue;
                }

                if (c.width != mapCanvas.width && c.height != mapCanvas.height) {
                    offsetLeft = c.offsetLeft * -1;
                    offsetTop = c.offsetTop * -1;
                    width = mapCanvas.width;
                    height = mapCanvas.height;

                    var sw = parseInt(c.style.width);

                    if (sw !== c.width) {
                        var scale = c.width / sw;

                        offsetLeft *= scale;
                        offsetTop *= scale;
                        width *= scale;
                        height *= scale;
                    }
                }

                ctx.drawImage(c, offsetLeft, offsetTop, width, height, 0, 0, mapCanvas.width, mapCanvas.height);
            }

            var logoUrl;

            switch (this._map.getMapTypeId()) {
                case Microsoft.Maps.MapTypeId.aerial:
                    ctx.fillStyle = 'white';
                    logoUrl = this._options.lightBingLogoUrl;
                    break;
                case Microsoft.Maps.MapTypeId.streetside:
                    throw 'Streetside is not supported.';
                case Microsoft.Maps.MapTypeId.birdseye:
                case Microsoft.Maps.MapTypeId.ordnanceSurvey:
                    throw 'The Bing Maps terms of use does not allow printing this type of imagery.';
                default:
                    ctx.fillStyle = 'black';
                    logoUrl = this._options.darkBingLogoUrl;
                    break;
            }

            //Add copyright information.
            var copyrights = root.getElementsByClassName('CopyrightAttributionStyle')[0].innerHTML;

            ctx.font = "10px Verdana";
            var copyrightWidth = ctx.measureText(copyrights).width;
            ctx.fillText(copyrights, mapCanvas.width - copyrightWidth - 5, mapCanvas.height - 5);

            //Add logo to canvas.
            var logoImg = new Image();
            logoImg.onload = () => {
                ctx.drawImage(logoImg, 5, mapCanvas.height - 22);
                successCallback(mapCanvas);
            };
            logoImg.onerror = () => {
                if (errorCallback) {
                    errorCallback('Unable to load Bing logo. Map image generation failed.');
                }
            };
            logoImg.src = logoUrl;
        } catch (e) {
            if (errorCallback) {
                errorCallback(e.message);
            }
        }
    }

    /**
     * Converts a dataUri to Blob.
     * @param dataUri The dataUri to convert.
     * @returns A blob containing the data from the dataUri.
     */
    private dataUritoBlob(dataUri): Blob {
        //Convert base64 to raw binary data held in a string.
        var byteString = atob(dataUri.split(',')[1]);

        //Extract the mime type.
        var mimeType = dataUri.split(',')[0].split(':')[1].split(';')[0];

        //Write the bytes of the string to an ArrayBuffer.
        var ab = new ArrayBuffer(byteString.length);
        var dw = new DataView(ab);
        for (var i = 0; i < byteString.length; i++) {
            dw.setUint8(i, byteString.charCodeAt(i));
        }

        //Convert the ArrayBuffer to a blob.
        return new Blob([ab], { type: mimeType });
    }
}

Microsoft.Maps.moduleLoaded('MapImageGeneratorModule');