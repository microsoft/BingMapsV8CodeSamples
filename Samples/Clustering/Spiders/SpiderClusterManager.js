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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
/**
* An extened pushpin which is used to represent an individual pushpin in the spider cluster.
*/
var SpiderPushpin = (function (_super) {
    __extends(SpiderPushpin, _super);
    function SpiderPushpin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SpiderPushpin;
}(Microsoft.Maps.Pushpin));
/**
* Adds a clustering layer to the map which expands clusters into a spiral spider layout.
*/
var SpiderClusterManager = (function () {
    /**********************
    * Constructor
    ***********************/
    /**
    * @constructor
    * A cluster manager that expands clusters when selectd into a spiral layout.
    * @param map A map instance to add the cluster layer to.
    * @param data An array of pushpins to cluster in the layer.
    * @param options A combination of SpiderClusterManager and Cluster options.
    */
    function SpiderClusterManager(map, data, options) {
        var _this = this;
        this._events = [];
        this._options = {
            circleSpiralSwitchover: 9,
            minCircleLength: 30,
            minSpiralAngleSeperation: 25,
            spiralDistanceFactor: 5,
            stickStyle: {
                strokeColor: 'black',
                strokeThickness: 2
            },
            stickHoverStyle: {
                strokeColor: 'red'
            },
            pinSelected: null,
            pinUnselected: null
        };
        this._map = map;
        this._data = data;
        this._clusterLayer = new Microsoft.Maps.ClusterLayer(data, options);
        map.layers.insert(this._clusterLayer);
        this._spiderLayer = new Microsoft.Maps.Layer();
        map.layers.insert(this._spiderLayer);
        this.setOptions(options);
        this._events.push(Microsoft.Maps.Events.addHandler(map, 'click', function (e) { _this.hideSpiderCluster(); }));
        this._events.push(Microsoft.Maps.Events.addHandler(map, 'viewchangestart', function (e) { _this.hideSpiderCluster(); }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._clusterLayer, 'click', function (e) { _this._layerClickEvent(e); }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'mouseover', function (e) {
            if (e.primitive instanceof SpiderPushpin) {
                e.primitive.stick.setOptions(_this._options.stickHoverStyle);
            }
        }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'mouseout', function (e) {
            if (e.primitive instanceof SpiderPushpin) {
                e.primitive.stick.setOptions(_this._options.stickStyle);
            }
        }));
        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'click', function (e) { _this._layerClickEvent(e); }));
    }
    /**********************
    * Public Functions
    ***********************/
    /**
    * Disposes the SpiderClusterManager and releases it's resources.
    */
    SpiderClusterManager.prototype.dispose = function () {
        this._spiderLayer.clear();
        this._map.layers.remove(this._spiderLayer);
        this._spiderLayer = null;
        for (var i = 0, len = this._events.length; i < len; i++) {
            Microsoft.Maps.Events.removeHandler(this._events[i]);
        }
        this._events = null;
    };
    /**
    * Gets the base ClusterLayer used by the SpiderClusterManager.
    * @returns The base ClusterLayer used by the SpiderClusterManager.
    */
    SpiderClusterManager.prototype.getClusterLayer = function () {
        return this._clusterLayer;
    };
    /**
    * Collapses any open spider clusters.
    */
    SpiderClusterManager.prototype.hideSpiderCluster = function () {
        //Show cluster and hide spider.
        if (this._currentCluster) {
            this._currentCluster.setOptions({ visible: true });
            this._spiderLayer.clear();
            this._currentCluster = null;
        }
    };
    /**
    * Sets the options used to customize how the SpiderClusterManager renders clusters.
    * @param options The options used to customize how the SpiderClusterManager renders clusters.
    */
    SpiderClusterManager.prototype.setOptions = function (options) {
        this.hideSpiderCluster();
        if (options) {
            if (typeof options.circleSpiralSwitchover === 'number') {
                this._options.circleSpiralSwitchover = options.circleSpiralSwitchover;
            }
            if (typeof options.minSpiralAngleSeperation === 'number') {
                this._options.minSpiralAngleSeperation = options.minSpiralAngleSeperation;
            }
            if (typeof options.spiralDistanceFactor === 'number') {
                this._options.spiralDistanceFactor = options.spiralDistanceFactor;
            }
            if (typeof options.minCircleLength === 'number') {
                this._options.minCircleLength = options.minCircleLength;
            }
            if (options.stickHoverStyle) {
                this._options.stickHoverStyle = options.stickHoverStyle;
            }
            if (options.stickStyle) {
                this._options.stickStyle = options.stickStyle;
            }
            if (options.pinSelected) {
                this._options.pinSelected = options.pinSelected;
            }
            if (options.pinUnselected) {
                this._options.pinUnselected = options.pinUnselected;
            }
            if (typeof options.visible === 'boolean') {
                this._options.visible = options.visible;
            }
            this._clusterLayer.setOptions(options);
        }
    };
    /**
    * Expands a cluster into it's open spider layout.
    * @param cluster The cluster to show in it's open spider layout..
    */
    SpiderClusterManager.prototype.showSpiderCluster = function (cluster) {
        this.hideSpiderCluster();
        this._currentCluster = cluster;
        if (cluster && cluster.containedPushpins) {
            //Create spider data.
            var pins = cluster.containedPushpins;
            var center = cluster.getLocation();
            var centerPoint = this._map.tryLocationToPixel(center, Microsoft.Maps.PixelReference.control);
            var point;
            var loc;
            var pin;
            var stick;
            var angle = 0;
            var makeSpiral = pins.length > this._options.circleSpiralSwitchover;
            var legPixelLength;
            var stepAngle;
            var stepLength;
            if (makeSpiral) {
                legPixelLength = this._options.minCircleLength / Math.PI;
                stepLength = 2 * Math.PI * this._options.spiralDistanceFactor;
            }
            else {
                stepAngle = 2 * Math.PI / pins.length;
                legPixelLength = (this._options.spiralDistanceFactor / stepAngle / Math.PI / 2) * pins.length;
                if (legPixelLength < this._options.minCircleLength) {
                    legPixelLength = this._options.minCircleLength;
                }
            }
            for (var i = 0, len = pins.length; i < len; i++) {
                //Calculate spider pin location.
                if (makeSpiral) {
                    angle += this._options.minSpiralAngleSeperation / legPixelLength + i * 0.0005;
                    legPixelLength += stepLength / angle;
                }
                else {
                    angle = stepAngle * i;
                }
                point = new Microsoft.Maps.Point(centerPoint.x + legPixelLength * Math.cos(angle), centerPoint.y + legPixelLength * Math.sin(angle));
                loc = this._map.tryPixelToLocation(point, Microsoft.Maps.PixelReference.control);
                //Create stick to pin.
                stick = new Microsoft.Maps.Polyline([center, loc], this._options.stickStyle);
                this._spiderLayer.add(stick);
                //Create pin in spiral that contains same metadata as parent pin.
                pin = new SpiderPushpin(loc);
                pin.metadata = pins[i].metadata;
                pin.stick = stick;
                pin.parentPin = pins[i];
                pin.setOptions(this._getBasicPushpinOptions(pins[i]));
                this._spiderLayer.add(pin);
            }
            //Hide Cluster
            this._currentCluster.setOptions({ visible: false });
        }
    };
    /**********************
    * Private Functions
    ***********************/
    /**
    * Click event handler for when a shape in the cluster layer is clicked.
    * @param e The mouse event argurment from the click event.
    */
    SpiderClusterManager.prototype._layerClickEvent = function (e) {
        if (e.primitive instanceof Microsoft.Maps.ClusterPushpin) {
            if (this._options.pinUnselected) {
                this._options.pinUnselected();
            }
            this.showSpiderCluster(e.primitive);
        }
        else {
            if (this._options.pinSelected) {
                var pin = e.primitive;
                if (e.primitive instanceof SpiderPushpin) {
                    this._options.pinSelected(pin.parentPin, this._currentCluster);
                }
                else {
                    this._options.pinSelected(pin, null);
                }
            }
            this.hideSpiderCluster();
        }
    };
    /**
    * Creates a copy of a pushpins basic options.
    * @param pin Pushpin to copy options from.
    * @returns A copy of a pushpins basic options.
    */
    SpiderClusterManager.prototype._getBasicPushpinOptions = function (pin) {
        return {
            anchor: pin.getAnchor(),
            color: pin.getColor(),
            icon: pin.getIcon(),
            roundClickableArea: pin.getRoundClickableArea(),
            text: pin.getText(),
            textOffset: pin.getTextOffset()
        };
    };
    return SpiderClusterManager;
}());
//Load Custering module which is a dependancy. 
Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', function () {
    Microsoft.Maps.moduleLoaded('SpiderClusterManager');
});
//# sourceMappingURL=SpiderClusterManager.js.map