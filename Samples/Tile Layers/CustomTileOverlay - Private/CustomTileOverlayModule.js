///*
// * Copyright(c) 2017 Microsoft Corporation. All rights reserved. 
// * 
// * This code is licensed under the MIT License (MIT). 
// * 
// * Permission is hereby granted, free of charge, to any person obtaining a copy
// * of this software and associated documentation files (the "Software"), to deal 
// * in the Software without restriction, including without limitation the rights
// * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// * of the Software, and to permit persons to whom the Software is furnished to do 
// * so, subject to the following conditions: 
// * 
// * The above copyright notice and this permission notice shall be included in all
// * copies or substantial portions of the Software. 
// * 
// * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
// * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// * THE SOFTWARE. 
//*/
///// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
//interface ICustomTileOverlayOptions extends Microsoft.Maps.ITileLayerOptions {
//    tileHeight?: number;
//    tileWidth?: number;
//}
//interface CustomTile {
//    img: HTMLImageElement;
//    tileInfo: Microsoft.Maps.PyramidTileId;
//}
//class CustomTileOverlay extends Microsoft.Maps.CustomOverlay {
//    /**********************
//    * Private Properties
//    ***********************/
//    private _tileContainer: HTMLDivElement;
//    private _viewChangeEvent: Microsoft.Maps.IHandlerId;
//    private _viewChangeEndEvent: Microsoft.Maps.IHandlerId;
//    private _mapResizeEvent: Microsoft.Maps.IHandlerId;
//    private _zoomStart: number;
//    private _centerStart: Microsoft.Maps.Location;
//    private _tiles: CustomTile[] = [];
//    private _options: ICustomTileOverlayOptions = {
//        tileHeight: 256,
//        tileWidth: 256
//    };
//    /**********************
//    * Constructor
//    ***********************/
//    /**
//     * @contructor
//     * @param options The options used for rendering the tile overlay.
//     */
//    constructor(options: ICustomTileOverlayOptions) {
//        super();
//        this._options = options;
//        //TODO: validate options.
//    }
//    /**********************
//    * Overridden functions
//    ***********************/
//    /**
//     * CustomTileOverlay added to map, load canvas.
//     */
//    public onAdd() {
//        //Create a tile container for rendering.
//        this._tileContainer = document.createElement('div');
//        this._tileContainer.style.position = 'absolute';
//        this._tileContainer.style.left = '0px';
//        this._tileContainer.style.top = '0px';
//        //Add the tile container to the overlay.            
//        this.setHtmlElement(this._tileContainer);
//    };
//    /**
//     * CustomTileOverlay loaded, attach map events for updating overlay.
//     */
//    public onLoad() {
//        var self = this;
//        var map = self.getMap();
//        //Get the current map view information.
//        this._zoomStart = map.getZoom();
//        this._centerStart = map.getCenter();
//        //When the map moves, move the canvas accordingly. 
//        self._viewChangeEvent = Microsoft.Maps.Events.addHandler(map, 'viewchange', (e) => {
//            var style = map.getMapTypeId();
//            if (style === Microsoft.Maps.MapTypeId.streetside || style === Microsoft.Maps.MapTypeId.birdseye) {
//                //Don't show the overlay if the map is in Streetside or Birdseye mode.
//                self._tileContainer.style.display = 'none';
//            } else {
//                //Re-drawing the canvas as it moves would be too slow. Instead, scale and translate canvas element.
//                var zoomCurrent = map.getZoom();
//                var centerCurrent = map.getCenter();
//                //Calculate map scale based on zoom level difference.
//                var scale = Math.pow(2, zoomCurrent - self._zoomStart);
//                //Calculate the scaled dimensions of the canvas.
//                var newWidth = map.getWidth() * scale;
//                var newHeight = map.getHeight() * scale;
//                //Calculate offset of canvas based on zoom and center offsets.
//                var pixelPoints = map.tryLocationToPixel([self._centerStart, centerCurrent], Microsoft.Maps.PixelReference.control);
//                var centerOffsetX = pixelPoints[1].x - pixelPoints[0].x;
//                var centerOffsetY = pixelPoints[1].y - pixelPoints[0].y;
//                var x = (-(newWidth - map.getWidth()) / 2) - centerOffsetX;
//                var y = (-(newHeight - map.getHeight()) / 2) - centerOffsetY;
//                //Update the canvas CSS position and dimensions.
//                self._updatePosition(x, y, newWidth, newHeight);
//            }
//        });
//        //When the map stops moving, render new data on the canvas.
//        self._viewChangeEndEvent = Microsoft.Maps.Events.addHandler(map, 'viewchangeend', (e) => {
//            self.updateCanvas();
//        });
//        //Update the position of the overlay when the map is resized.
//        self._mapResizeEvent = Microsoft.Maps.Events.addHandler(this.getMap(), 'mapresize', (e) => {
//            self.updateCanvas();
//        });
//    }
//    /**
//     * When the CanvasLayer is removed from the map, release resources.
//     */
//    public onRemove() {
//        this.setHtmlElement(null);
//        //Remove all event handlers from the map.
//        Microsoft.Maps.Events.removeHandler(this._viewChangeEvent);
//        Microsoft.Maps.Events.removeHandler(this._viewChangeEndEvent);
//    }
//    /**********************
//    * Private Functions
//    ***********************/
//    private _createTile(tileInfo: Microsoft.Maps.PyramidTileId): HTMLImageElement {
//        var tile = <HTMLImageElement>document.createElement('img');
//        tile.setAttribute('role', 'presentation');
//        tile.alt = '';
//        tile.src = this._getTileUrl(tileInfo);
//        return tile;
//    }
//    private _getTileUrl(tileInfo: Microsoft.Maps.PyramidTileId): string {
//    }
//    /**
//     * Simple function for updating the CSS position and dimensions of the canvas.
//     * @param x The horizontal offset position of the canvas.
//     * @param y The vertical offset position of the canvas.
//     * @param w The width of the canvas.
//     * @param h The height of the canvas.
//     */
//    private _updatePosition(x: number, y: number, w: number, h: number) {
//    }
//    private updateCanvas() {
//        var map = this.getMap();
//        //Only render the canvas if it isn't in streetside mode.
//        if (map.getMapTypeId() !== Microsoft.Maps.MapTypeId.streetside) {
//            this._canvas.style.display = '';
//            //Reset CSS position and dimensions of canvas.
//            this._updatePosition(0, 0, map.getWidth(), map.getHeight());
//            //Redraw the canvas.
//            this._redraw();
//            //Get the current map view information.
//            this._zoomStart = map.getZoom();
//            this._centerStart = map.getCenter();
//        }
//    }
//}
////Call the module loaded function.
//Microsoft.Maps.moduleLoaded('CustomTileOverlayModule'); 
//# sourceMappingURL=CustomTileOverlayModule.js.map