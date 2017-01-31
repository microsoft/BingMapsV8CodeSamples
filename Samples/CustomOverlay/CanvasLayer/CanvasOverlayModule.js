/*
 * Copyright(c) 2017 Microsoft Corporation. All rights reserved.
 *
 * This code is licensed under the MIT License (MIT).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../Resources/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
var CanvasOverlay = (function (_super) {
    __extends(CanvasOverlay, _super);
    /**********************
    * Constructor
    ***********************/
    /**
     * @contructor
     * @param drawCallback A callback function that is triggered when the canvas is ready to be rendered for the current map view.
     */
    function CanvasOverlay(drawCallback) {
        _super.call(this);
        this._drawCallback = drawCallback;
    }
    /**********************
    * Overridden functions
    ***********************/
    /**
     * CanvasOverlay added to map, load canvas.
     */
    CanvasOverlay.prototype.onAdd = function () {
        //Create a canvas for rendering.
        this._canvas = document.createElement('canvas');
        this._canvas.style.position = 'absolute';
        this._canvas.style.left = '0px';
        this._canvas.style.top = '0px';
        //Add the canvas to the overlay.            
        this.setHtmlElement(this._canvas);
    };
    ;
    /**
     * CanvasOverlay loaded, attach map events for updating canvas.
     */
    CanvasOverlay.prototype.onLoad = function () {
        var self = this;
        var map = self.getMap();
        //Get the current map view information.
        var zoomStart = map.getZoom();
        var centerStart = map.getCenter();
        //Redraw the canvas.
        self._redraw();
        //When the map moves, move the canvas accordingly. 
        self._viewChangeEvent = Microsoft.Maps.Events.addHandler(map, 'viewchange', function (e) {
            if (map.getMapTypeId() == Microsoft.Maps.MapTypeId.streetside) {
                //Don't show the canvas if the map is in Streetside mode.
                self._canvas.style.display = 'none';
            }
            else {
                //Re-drawing the canvas as it moves would be too slow. Instead, scale and translate canvas element.
                var zoomCurrent = map.getZoom();
                var centerCurrent = map.getCenter();
                //Calculate map scale based on zoom level difference.
                var scale = Math.pow(2, zoomCurrent - zoomStart);
                //Calculate the scaled dimensions of the canvas.
                var newWidth = map.getWidth() * scale;
                var newHeight = map.getHeight() * scale;
                //Calculate offset of canvas based on zoom and center offsets.
                var pixelPoints = map.tryLocationToPixel([centerStart, centerCurrent], Microsoft.Maps.PixelReference.control);
                var centerOffsetX = pixelPoints[1].x - pixelPoints[0].x;
                var centerOffsetY = pixelPoints[1].y - pixelPoints[0].y;
                var x = (-(newWidth - map.getWidth()) / 2) - centerOffsetX;
                var y = (-(newHeight - map.getHeight()) / 2) - centerOffsetY;
                //Update the canvas CSS position and dimensions.
                self._updatePosition(x, y, newWidth, newHeight);
            }
        });
        //When the map stops moving, render new data on the canvas.
        self._viewChangeEndEvent = Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function (e) {
            //Only render the canvas if it isn't in streetside mode.
            if (map.getMapTypeId() != Microsoft.Maps.MapTypeId.streetside) {
                self._canvas.style.display = '';
                //Reset CSS position and dimensions of canvas.
                self._updatePosition(0, 0, map.getWidth(), map.getHeight());
                //Redraw the canvas.
                self._redraw();
                //Get the current map view information.
                zoomStart = map.getZoom();
                centerStart = map.getCenter();
            }
        });
    };
    /**
     * When the CanvasLayer is removed from the map, release resources.
     */
    CanvasOverlay.prototype.onRemove = function () {
        this.setHtmlElement(null);
        this._canvas = null;
        //Remove all event handlers from the map.
        Microsoft.Maps.Events.removeHandler(this._viewChangeEvent);
        Microsoft.Maps.Events.removeHandler(this._viewChangeEndEvent);
    };
    /**********************
    * Private Functions
    ***********************/
    /**
     * Simple function for updating the CSS position and dimensions of the canvas.
     * @param x The horizontal offset position of the canvas.
     * @param y The vertical offset position of the canvas.
     * @param w The width of the canvas.
     * @param h The height of the canvas.
     */
    CanvasOverlay.prototype._updatePosition = function (x, y, w, h) {
        //Update CSS position.
        this._canvas.style.left = x + 'px';
        this._canvas.style.top = y + 'px';
        //Update CSS dimensions.
        this._canvas.style.width = w + 'px';
        this._canvas.style.height = h + 'px';
    };
    /**
     * Redraws the canvas for the current map view.
     */
    CanvasOverlay.prototype._redraw = function () {
        //Clear canvas by updating dimensions. This also ensures canvas stays the same size as the map.
        this._canvas.width = this.getMap().getWidth();
        this._canvas.height = this.getMap().getHeight();
        //Call the drawing callback function if specified.
        if (this._drawCallback) {
            this._drawCallback(this._canvas);
        }
    };
    return CanvasOverlay;
}(Microsoft.Maps.CustomOverlay));
//Call the module loaded function.
Microsoft.Maps.moduleLoaded('CanvasOverlayModule');
//# sourceMappingURL=CanvasOverlayModule.js.map