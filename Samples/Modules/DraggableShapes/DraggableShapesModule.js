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
/********************************************
* Draggable Shapes Manager
* Author: Ricky Brundritt
* License: MIT
*********************************************/
/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
/**
* An enumeration which defines how a shape is dragged on the map.
*/
var DragMethod;
(function (DragMethod) {
    /** Shapes are dragged such that they maintain their Pixel dimensions. */
    DragMethod[DragMethod["pixel"] = 0] = "pixel";
    /** Shapes are dragged using geospatial accurate projections. The shape may become distorted when moved towards the poles. */
    DragMethod[DragMethod["geo"] = 1] = "geo";
})(DragMethod || (DragMethod = {}));
/**
* A class that makes it easy to make any shape draggable.
*/
var DraggableShapesManager = (function () {
    /**********************
    * Constructor
    ***********************/
    /**
     * @constructor
     * @param map The map to add the DraggableShapesManager to.
     * @param dragMethod The drag method to use.
     */
    function DraggableShapesManager(map, dragMethod) {
        this._dragMethod = DragMethod.pixel;
        this._shapes = [];
        this._map = map;
        if (typeof dragMethod != 'undefined') {
            this._dragMethod = dragMethod;
        }
        var self = this;
        //Update the shape as the mouse moves on the map.
        this._mapMoveEventId = Microsoft.Maps.Events.addHandler(this._map, 'mousemove', function (e) { self._updateShape(e); });
    }
    /**********************
    * Public Functions
    ***********************/
    /**
     * Disposes the DraggableShapesManager and releases it's resources.
     */
    DraggableShapesManager.prototype.dispose = function () {
        Microsoft.Maps.Events.removeHandler(this._mapMoveEventId);
        this._currentLocation = null;
        this._currentShape = null;
        this._currentPoint = null;
        this._map = null;
        this._dragMethod = null;
        for (var i = 0; i < this._shapes.length; i++) {
            this.disableDraggable(this._shapes[i]);
        }
        this._shapes = null;
    };
    /**
     * Adds draggable functionality to a shape.
     * @param shape The shape to add draggable functionality to.
     */
    DraggableShapesManager.prototype.makeDraggable = function (shape) {
        if (this._shapes.indexOf(shape) === -1) {
            if (shape instanceof Microsoft.Maps.Pushpin) {
                //Pushpins already support dragging.
                shape.setOptions({ draggable: true });
            }
            else {
                var s = shape;
                if (!s._dragevents) {
                    s._dragevents = [];
                }
                var self = this;
                s._dragevents.push(Microsoft.Maps.Events.addHandler(s, 'mousedown', function (e) {
                    //Lock map so it doesn't move when dragging.
                    self._map.setOptions({ disablePanning: true });
                    //Set the current draggable shape.
                    self._currentShape = e.target;
                    //Capture the mouse start location and pixel point.
                    self._currentLocation = e.location;
                    self._currentPoint = e.point;
                }));
                s._dragevents.push(Microsoft.Maps.Events.addHandler(s, 'mouseup', function (e) {
                    //Unlock map panning.
                    self._map.setOptions({ disablePanning: false });
                    //Set current shape to null, so that no updates will happen will mouse is up.
                    self._currentShape = null;
                }));
            }
        }
    };
    /**
     * Removes the draggable functionality of a shape.
     * @param shape The shape to remove the draggable functionality from.
     */
    DraggableShapesManager.prototype.disableDraggable = function (shape) {
        if (this._shapes.indexOf(shape) !== -1) {
            if (shape instanceof Microsoft.Maps.Pushpin) {
                //Pushpins already support dragging.
                shape.setOptions({ draggable: false });
            }
            else {
                var s = shape;
                if (s._dragevents) {
                    this._clearShapeEvents(s._dragevents);
                    s._dragevents = null;
                }
            }
            this._shapes.splice(this._shapes.indexOf(shape), 1);
        }
    };
    /**
     * Gets the drag method currently used by the DraggabeShapesManager.
     * @returns The drag method currently used by the DraggabeShapesManager.
     */
    DraggableShapesManager.prototype.getDragMethod = function () {
        return this._dragMethod;
    };
    /**
     * Sets the drag method used by the DraggabeShapesManager.
     * @param dragMethod The drag method used by the DraggabeShapesManager.
     */
    DraggableShapesManager.prototype.setDragMethod = function (dragMethod) {
        if (typeof dragMethod !== 'undefined') {
            this._dragMethod = dragMethod;
        }
    };
    /**********************
    * Private Functions
    ***********************/
    /**
     * Removes an array of event handler ID's to remove.
     * @param events An array of event handler ID's to remove.
     */
    DraggableShapesManager.prototype._clearShapeEvents = function (events) {
        for (var i = 0; i < events.length; i++) {
            Microsoft.Maps.Events.removeHandler(events[i]);
        }
    };
    /**
     * Updates a shapes position as it is being dragged.
     * @param e The mouse event argument.
     */
    DraggableShapesManager.prototype._updateShape = function (e) {
        if (this._currentShape) {
            //As an optimization, only update the shape if the mouse has moved atleast 5 pixels.
            //This will significantly reduce the number of recalculations and provide much better performance.
            var dx = this._currentPoint.x - e.point.x;
            var dy = this._currentPoint.y - e.point.y;
            if (dx * dx + dy * dy <= 25) {
                return;
            }
            if (this._dragMethod === DragMethod.pixel) {
                this._pixelAccurateUpdate(e);
            }
            else {
                this._geoAccurateUpdate(e);
            }
        }
    };
    /**
     * Updates the position of a shape as it dragged using a geospatially accurate shift.
     * @param e The mouse event argument.
     */
    DraggableShapesManager.prototype._geoAccurateUpdate = function (e) {
        var newLoc = e.location;
        var currentLocation = this._currentLocation;
        //Calculate the distance and heading from the last mouse location used to update the shape to the new location.
        var distance = Microsoft.Maps.SpatialMath.getDistanceTo(currentLocation, newLoc);
        var heading = Microsoft.Maps.SpatialMath.getHeading(currentLocation, newLoc);
        if (this._currentShape instanceof Microsoft.Maps.Polygon) {
            var polygon = this._currentShape;
            var rings = polygon.getRings();
            for (var i = 0, len = rings.length; i < len; i++) {
                rings[i] = this._shiftLocations(rings[i], heading, distance);
            }
            //Update the in rings ina polygon.
            polygon.setRings(rings);
        }
        else if (this._currentShape instanceof Microsoft.Maps.Polyline) {
            var line = this._currentShape;
            var locs = line.getLocations();
            //Update the locations of a polyline.
            line.setLocations(this._shiftLocations(locs, heading, distance));
        }
        else if (this._currentShape instanceof Microsoft.Maps.Pushpin) {
            //Although not needed, for completeness, this supports dragging of pushpins.
            var pin = this._currentShape;
            var locs = this._shiftLocations([pin.getLocation()], heading, distance);
            pin.setLocation(locs[0]);
        }
        //Store the new mouse location and point that was used to update the shape.
        this._currentLocation = newLoc;
        this._currentPoint = e.point;
    };
    /**
     * Updates the position of a shape as it dragged using a pixel accurate shift.
     * @param e The mouse event argument.
     */
    DraggableShapesManager.prototype._pixelAccurateUpdate = function (e) {
        //Shift the shape based on pixel offset.
        var newPoint = Microsoft.Maps.SpatialMath.Tiles.locationToGlobalPixel(e.location, 19);
        var point = Microsoft.Maps.SpatialMath.Tiles.locationToGlobalPixel(this._currentLocation, 19);
        var dx = point.x - newPoint.x;
        var dy = point.y - newPoint.y;
        if (this._currentShape instanceof Microsoft.Maps.Polygon) {
            var polygon = this._currentShape;
            var rings = polygon.getRings();
            for (var i = 0, len = rings.length; i < len; i++) {
                rings[i] = this._pixelShiftLocations(rings[i], dx, dy);
            }
            //Update the in rings ina polygon.
            polygon.setRings(rings);
        }
        else if (this._currentShape instanceof Microsoft.Maps.Polyline) {
            var line = this._currentShape;
            var locs = line.getLocations();
            //Update the locations of a polyline.
            line.setLocations(this._pixelShiftLocations(locs, dx, dy));
        }
        else if (this._currentShape instanceof Microsoft.Maps.Pushpin) {
            //Although not needed, for completeness, this supports dragging of pushpins.
            var pin = this._currentShape;
            var locs = this._pixelShiftLocations([pin.getLocation()], dx, dy);
            pin.setLocation(locs[0]);
        }
        //Store the new mouse location and point that was used to update the shape.
        this._currentLocation = e.location;
        this._currentPoint = e.point;
    };
    /**
     * Takes an array of locations and shifts them a specified distancein a specified direction.
     * @param locs The locations to shift.
     * @param heading The direction to shift the locations.
     * @param distance The distance to shift the locations.
     * @returns An array of shifted locations.
     */
    DraggableShapesManager.prototype._shiftLocations = function (locs, heading, distance) {
        //Based on the distance and heading, shift all locations in the array accordingly.
        var loc;
        for (var i = 0, len = locs.length; i < len; i++) {
            locs[i] = Microsoft.Maps.SpatialMath.getDestination(locs[i], heading, distance);
        }
        return locs;
    };
    /**
     * Takes an rray of locations and shifts them a specified distance in pixels at zoom level 19.
     * @param locs The locations to shift.
     * @param dx Horizontal offset distance to shift the locations in pixels at zoom level 19.
     * @param dy Vertical offset distance to shift the locations in pixels at zoom level 19.
     * @returns An array of shifted locations.
     */
    DraggableShapesManager.prototype._pixelShiftLocations = function (locs, dx, dy) {
        var mapWidth19 = Math.pow(2, 19) * 256;
        //Based on the distance and heading, shift all locations in the array accordingly.
        for (var i = 0, len = locs.length; i < len; i++) {
            var p = Microsoft.Maps.SpatialMath.Tiles.locationToGlobalPixel(locs[i], 19);
            p.x -= dx;
            p.y -= dy;
            if (p.x < 0) {
                p.x += mapWidth19;
            }
            else if (p.x > mapWidth19) {
                p.x -= mapWidth19;
            }
            locs[i] = Microsoft.Maps.SpatialMath.Tiles.globalPixelToLocation(p, 19);
        }
        return locs;
    };
    return DraggableShapesManager;
}());
//Load SpatialMath module dependancy.
Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', function () {
    Microsoft.Maps.moduleLoaded('DraggableShapesModule');
});
//# sourceMappingURL=DraggableShapesModule.js.map