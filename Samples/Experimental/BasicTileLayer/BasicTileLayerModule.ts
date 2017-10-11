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

/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>


interface IBasicTile {
    id: string;
    tileInfo: Microsoft.Maps.PyramidTileId;
    img: HTMLImageElement;
}

/**
 * A reusable class for overlaying HTML elements as pushpins on the map.
 */
class BasicTileLayer extends Microsoft.Maps.CustomOverlay {

    /**********************
    * Private Properties
    ***********************/

    /** A variable to store the viewchange event handler id. */
    private _viewChangeEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store the viewchangeend event handler id. */
    private _viewChangeEndEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store the map resize event handler id. */
    private _mapResizeEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store a reference to the container for the HTML pushpins. */
    private _container: HTMLElement = null;
    
    private _tileLayerOptions: Microsoft.Maps.ITileLayerOptions = {
        visible: true,
        mercator: null,
        opacity: 1,
        zIndex: 0,
        downloadTimeout: 10000
    };

    private _mapWidth: number;
    private _mapHeight: number;

    /**********************
    * Constructor
    ***********************/

    /**
    * @constructor
    */
    constructor(options: Microsoft.Maps.ITileLayerOptions) {
        super();
        
        if (!options) {
            throw 'A tile layer options must be specified in a BasicTileLayer.';
        } else if (!options.mercator) {
            throw 'A tile source must be specified in a BasicTileLayer.';
        }

        this.setOptions(options);
    }

    /**********************
    * Overridden functions
    ***********************/

    /**
    * Layer added to map. Setup rendering container.
    */
    public onAdd(): void {
        //Create a div that will hold the pushpins.
        this._container = document.createElement('div');
        this._container.style.position = 'absolute';
        this._container.style.left = '0px';
        this._container.style.top = '0px';

        this.setHtmlElement(this._container);
    }

    /**
     * Layer loaded, add map events for updating position of data.
     */
    public onLoad(): void {
        var map = this.getMap();

        this._mapWidth = map.getWidth();
        this._mapHeight = map.getHeight();

        //Update the position of the pushpin when the view changes. Hide the layer if map changed to streetside.
        this._viewChangeEventHandler = Microsoft.Maps.Events.addHandler(map, 'viewchange', (e) => { this._viewChange(); });
        this._viewChangeEndEventHandler = Microsoft.Maps.Events.addHandler(map, 'viewchangeend', (e) => { this._viewChanged(e); });

        //Update the position of the overlay when the map is resized.
        this._mapResizeEventHandler = Microsoft.Maps.Events.addHandler(map, 'mapresize', (e) => { this._viewChanged(e); });

        this.setOptions(this._tileLayerOptions);
    }

    /**
     * Layer removed from map. Release resources.
     */
    public onRemove(): void {
        this.setHtmlElement(null);

        //Remove the event handler that is attached to the map.
        Microsoft.Maps.Events.removeHandler(this._viewChangeEventHandler);
        Microsoft.Maps.Events.removeHandler(this._viewChangeEndEventHandler);
        Microsoft.Maps.Events.removeHandler(this._mapResizeEventHandler);

        for (var i = 0; i < this._tiles.length; i++) {
            if (this._tiles[i]) {
                this._tiles[i] = null;
                this._tileIds[i] = null;
            }
        }

        this._tiles = null;
        this._tileIds = null;
    }

    /**********************
    * Public Functions
    ***********************/

    /**
     * Retrieves the opacity of the layer.
     * @returns The opacity of the layer.
     */
    public getOpacity(): number {
        return this._tileLayerOptions.opacity;
    }

    /**
     * Retrieves the tile source of the layer.
     * @returnsTthe tile source of the layer.
     */
    public getTileSource(): Microsoft.Maps.TileSource {
        return this._tileLayerOptions.mercator;
    }
    
    /**
     * Retrieves the visibility of the layer.
     * @returns The visibility of the layer.
     */
    public getVisible(): boolean {
        return this._tileLayerOptions.visible;
    }

    /**
     * Retrieves the ZIndex of the layer.
     * @returns The ZIndex of the layer.
     */
    public getZIndex(): number {
        return this._tileLayerOptions.zIndex;
    }

    /**
     * Sets the opacity of the layer.
     * @param show The opacity of the layer.
     */
    public setOpacity(opacity: number): void {
        this._tileLayerOptions.opacity = opacity;
        this._container.style.opacity = opacity.toString();
    }

    /**
     * Sets the options of the layer.
     * @param opt The options of the layer.
     */
    public setOptions(opt: Microsoft.Maps.ITileLayerOptions): void {

        if (opt) {
            if (typeof opt.opacity === 'number') {
                this.setOpacity(opt.opacity);
            }

            if (typeof opt.visible === 'boolean') {
                this.setVisible(opt.visible);
            }

            if (typeof opt.zIndex === 'number') {
                this.setZIndex(opt.zIndex);
            }

            if (opt.mercator) {
                this._tileLayerOptions.mercator = new Microsoft.Maps.TileSource({
                    bounds: opt.mercator.getBounds() || new Microsoft.Maps.LocationRect(new Microsoft.Maps.Location(0,0), 360, 180),
                    maxZoom: opt.mercator.getMaxZoom() || 21,
                    minZoom: opt.mercator.getMinZoom() || 1,
                    uriConstructor: opt.mercator.getUriConstructor()
                });

                this._reloadTiles();
            }
        }
    }

    /**
     * Sets the visibility of the layer.
     * @param show The visibility of the layer.
     */
    public setVisible(show: boolean): void {
        this._tileLayerOptions.visible = show;

        if (show) {
            this._container.style.display = '';
        } else {
            this._container.style.display = 'none';
        }        
    }

    /**
     * Sets the zIndex of the layer.
     * @param idx The zIndex of the layer.
     */
    public setZIndex(idx: number) {
        this._tileLayerOptions.zIndex = idx;
        this._container.style.zIndex = idx.toString();
    }

    /**********************
    * Private Functions
    ***********************/

    private _viewChange() {
        //Hide tile layer when moving the map for now.
        var zoom = this._map.getZoom();

        var self = this;
        setTimeout(() => {
            if (self._currentZoom !== zoom) {
                var scale = Math.pow(2, zoom - self._currentZoom);
                self._container.style.transform = 'scale(' + scale + ')';
                self._container.style.transformOrigin = (self._mapWidth / 2) + 'px ' + (self._mapHeight / 2) + 'px';

                self._updatePositions(false);
            } else {
                self._container.style.transform = '';
                self._updatePositions(false);
            }
        }, 0);
    }

    private _viewChanged(e) {
        this._mapWidth = this._map.getWidth();
        this._mapHeight = this._map.getHeight();

        this._container.style.transformOrigin = (this._mapWidth / 2) + 'px ' + (this._mapHeight/2) + 'px';

        var mapType = this._map.getMapTypeId();

        if (mapType !== Microsoft.Maps.MapTypeId.streetside && mapType !== Microsoft.Maps.MapTypeId.birdseye && this._tileLayerOptions.visible) {        
            var self = this;
            setTimeout(() => {
                self._reloadTiles();
                self._container.style.display = '';
            }, 0);
        }
    }

    private _tiles: IBasicTile[] = [];
    private _tileIds: string[] = [];
    private _currentZoom: number;
    private _currentCenter: Microsoft.Maps.Location;
    private _mapSize: number;
    private _tileDownloadTimer: number;

    /**
    * Reloads all tiles on the layer.
    */
    private _reloadTiles(): void {
        if (!this._container || !this._map) {
            return;
        }

        this._container.style.transform = '';

        var center = this._map.getCenter();
        var zoom = this._map.getZoom();
        
        if (zoom >= this._tileLayerOptions.mercator.getMinZoom() && zoom <= this._tileLayerOptions.mercator.getMaxZoom()) {
            var dx = Math.ceil(this._mapWidth / 512) + 1;
            var dy = Math.ceil(this._mapHeight / 512) + 1;

            var cpx = Microsoft.Maps.SpatialMath.Tiles.locationToGlobalPixel(center, zoom);
            var topLeftGlobalPixel = new Microsoft.Maps.Point(cpx.x - this._mapWidth / 2, cpx.y - this._mapHeight / 2);

            this._mapSize = Microsoft.Maps.SpatialMath.Tiles.mapSize(zoom)/256-1;

            var centerTile = Microsoft.Maps.SpatialMath.Tiles.locationToTile(center, zoom);

            this._createTile(centerTile.x, centerTile.y, zoom, topLeftGlobalPixel);

            var minX = Math.max(0, centerTile.x - dx);
            var maxX = Math.min(centerTile.x + dx, this._mapSize-1);
            var minY = Math.max(0, centerTile.y - dy);
            var maxY = Math.min(centerTile.y + dy, this._mapSize - 1);
            
            //for (var x = minX; x <= maxX; x++) {
            //    for (var y = minY; y <= maxY; y++) {
            //        this._createTile(x, y, zoom, topLeftGlobalPixel);
            //    }
            //}

            var midX = Math.floor((maxX + minX)/2);
            var midY = Math.floor((maxY + minY)/2);

            //Load tiles from the middle out.
            for (var x = 0; x <= maxX - midX; x++) {                
                for (var y = 0; y <= maxY - midY; y++) {
                    if (midX - x >= minX) {
                        if (midY - y >= minY) {
                            this._createTile(midX - x, midY - y, zoom, topLeftGlobalPixel);
                        }

                        if (midY + y <= maxY) {
                            this._createTile(midX - x, midY + y, zoom, topLeftGlobalPixel);
                        }
                    }

                    if (midX + x <= maxX) {
                        if (midY - y >= minY) {
                            this._createTile(midX + x, midY - y, zoom, topLeftGlobalPixel);
                        }

                        if (midY + y <= maxY) {
                            this._createTile(midX + x, midY + y, zoom, topLeftGlobalPixel);
                        }
                    }

                   // this._createTile(x, y, zoom, topLeftGlobalPixel);
                }
            }
        }

        this._updatePositions(true);

        if (typeof this._tileDownloadTimer === 'number') {
            clearTimeout(this._tileDownloadTimer);
        }

        this._tileDownloadTimer = setTimeout(() => { this._removeOldTiles() }, this._tileLayerOptions.downloadTimeout);

        this._currentZoom = zoom;
        this._currentCenter = center;
    }

    private _createTile(tileX: number, tileY: number, zoom: number, topLeftGlobalPixel: Microsoft.Maps.Point): void {
        var tileId = tileX + '_' + tileY + '_' + zoom;

        var tileIdx = this._tileIds.indexOf(tileId);
        var tile = null;

        if (tileIdx > -1) {
            tile = this._tiles[tileIdx];
        }

        if (!tile) {

            var self = this;

            var tileInfo = new Microsoft.Maps.PyramidTileId(tileX, tileY, zoom);

            var bounds = Microsoft.Maps.SpatialMath.Tiles.tileToLocationRect(tileInfo);

            if (this._tileLayerOptions.mercator.getBounds().intersects(bounds)) {

                tileIdx = self._tileIds.length;
                self._tileIds.push(tileId);

                self._tiles[tileIdx] = {
                    id: tileId,
                    tileInfo: tileInfo,
                    img: null
                };

                var tileUrl = '';

                var urlCon = this._tileLayerOptions.mercator.getUriConstructor();

                if (typeof urlCon === "function") {
                    tileUrl = urlCon(tileInfo);
                } else {
                    tileUrl = urlCon.replace(/{quadkey}/gi, tileInfo.quadKey).replace(/{x}/gi, tileInfo.x.toString()).replace(/{y}/gi, tileInfo.y.toString()).replace(/{zoom}/gi, tileInfo.zoom.toString())
                        .replace(/{bbox}/gi, bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth());
                }

                var img = new Image(256, 256);
                img.style.position = 'absolute';
                img.style.pointerEvents = 'none';

                img.onload = (image) => {
                    if (self._tiles[tileIdx]) {
                        //Set position.
                        img.style.top = (self._tiles[tileIdx].tileInfo.y * 256 - topLeftGlobalPixel.y) + 'px';
                        img.style.left = (self._tiles[tileIdx].tileInfo.x * 256 - topLeftGlobalPixel.x) + 'px';

                        self._container.appendChild(img);
                        self._tiles[tileIdx].img = img;
                    }
                };

                img.onerror = () => {
                    self._tiles[tileIdx] = null;
                };

                if (tileUrl !== '') {
                    img.src = tileUrl;
                }
            }
        } else if (tile.img) {
            //Tile already exists, update its position.
            tile.img.style.top = (tileY * 256 - topLeftGlobalPixel.y) + 'px';
            tile.img.style.left = (tileX * 256 - topLeftGlobalPixel.x) + 'px';
        }
    }

    /**
     * Updates the positions of all tiles in the layer.
     */
    private _updatePositions(removeTiles: boolean): void {
        var center = this._map.getCenter();
        var zoom = this._map.getZoom();
        
        var cpx = Microsoft.Maps.SpatialMath.Tiles.locationToGlobalPixel(center, zoom);
        var topLeftGlobalPixel = new Microsoft.Maps.Point(cpx.x - this._mapWidth / 2, cpx.y - this._mapHeight / 2);
        
        for (var i = 0; i < this._tiles.length; i++) {
            if (this._tiles[i]) {
                if (removeTiles && this._tiles[i].tileInfo.zoom !== zoom) {

                    if (this._tiles[i].img) {
                        this._container.removeChild(this._tiles[i].img);
                    }

                    this._tiles[i] = null;
                    this._tileIds[i] = null;
                } else if (this._tiles[i].img) {
                    this._tiles[i].img.style.top = (this._tiles[i].tileInfo.y * 256 - topLeftGlobalPixel.y) + 'px';
                    this._tiles[i].img.style.left = (this._tiles[i].tileInfo.x * 256 - topLeftGlobalPixel.x) + 'px';
                }
            }
        }
    }

    private _removeOldTiles(): void {
        var currentTiles = [];
        var currentTileIdx = [];
        
        for (var i = 0; i< this._tiles.length; i++) {
            if (this._tiles[i]) {
                currentTiles.push(this._tiles[i]);
                currentTileIdx.push(this._tiles[i].id);
            }
        }

        this._tiles = currentTiles;
        this._tileIds = currentTileIdx;
    }
}

//Load dependancy module.
Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', () => {
    //Call the module loaded function.
    Microsoft.Maps.moduleLoaded('BasicTileLayerModule');
});