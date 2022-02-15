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
* Spider Clustering Manager
* Author: Ricky Brundritt
* License: MIT
* Based on: https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
*********************************************/

/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>

/**
* Options used to customize how the SpiderClusterManager renders clusters.
*/
interface ISpiderClusterOptions {
    /** Minimium number of pushpins in cluster before switching from circle to spiral spider layout. */
    circleSpiralSwitchover?: number;

    /** The minium pixel distance between pushpins and the cluster, when rendering spider layout as a circle. */
    minCircleLength?: number;

    /** The minium angle between pushpins in the spiral. */
    minSpiralAngleSeperation?: number;

    /** A factor that is used to grow the pixel distance of each pushpin from the center in the spiral. */
    spiralDistanceFactor?: number;

    /** Style of the stick connecting the pins to cluster. */
    stickStyle?: Microsoft.Maps.IPolylineOptions;

    /** Style of the sticks when a pin is hovered. */
    stickHoverStyle?: Microsoft.Maps.IPolylineOptions;

    /**
    * A callback function that is fired when an individual pin is clicked.
    * If the pin is part of a cluster, the cluster will also be returned in the callback.
    */
    pinSelected?: (pin: Microsoft.Maps.Pushpin, cluster: Microsoft.Maps.ClusterPushpin) => void;

    /** A callback that is fired when a pin is unselected or a spider cluster is collapsed. */
    pinUnselected?: () => void;

    /** A boolean indicating if the cluster layer is visible or not. */
    visible?: boolean;
}

/**
* An extened pushpin which is used to represent an individual pushpin in the spider cluster. 
*/
class SpiderPushpin extends Microsoft.Maps.Pushpin {
    /** The parent pushpin in which the spider pushpin is derived from. */
    public parentPin: Microsoft.Maps.Pushpin;

    /** The stick that connects the spider pushpin to the cluster. */
    public stick: Microsoft.Maps.Polyline;
}

/**
* Adds a clustering layer to the map which expands clusters into a spiral spider layout.
*/
class SpiderClusterManager {

    /**********************
    * Private Properties
    ***********************/

    private _map: Microsoft.Maps.Map;
    private _data: Microsoft.Maps.Pushpin[];
    private _spiderLayer: Microsoft.Maps.Layer;
    private _events: Microsoft.Maps.IHandlerId[] = [];
    private _currentCluster: Microsoft.Maps.ClusterPushpin;
    private _clusterLayer: Microsoft.Maps.ClusterLayer;

    private _options: ISpiderClusterOptions = {
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
    constructor(map: Microsoft.Maps.Map, data: Microsoft.Maps.Pushpin[], options: ISpiderClusterOptions) {
        this._map = map;
        this._data = data;

        this._clusterLayer = new Microsoft.Maps.ClusterLayer(data, options);
        map.layers.insert(this._clusterLayer);

        this._spiderLayer = new Microsoft.Maps.Layer();
        map.layers.insert(this._spiderLayer);

        this.setOptions(options);

        this._events.push(Microsoft.Maps.Events.addHandler(map, 'click', (e) => { this.hideSpiderCluster(); }));
        this._events.push(Microsoft.Maps.Events.addHandler(map, 'viewchangestart', (e) => { this.hideSpiderCluster(); }));

        this._events.push(Microsoft.Maps.Events.addHandler(this._clusterLayer, 'click', (e) => { this._layerClickEvent(e); }));

        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'mouseover', (e) => {
            if (e.primitive instanceof SpiderPushpin) {
                (<SpiderPushpin>e.primitive).stick.setOptions(this._options.stickHoverStyle);
            }
        }));

        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'mouseout', (e) => {
            if (e.primitive instanceof SpiderPushpin) {
                (<SpiderPushpin>e.primitive).stick.setOptions(this._options.stickStyle);
            }
        }));

        this._events.push(Microsoft.Maps.Events.addHandler(this._spiderLayer, 'click', (e) => { this._layerClickEvent(e); }));
    }

    /**********************
    * Public Functions
    ***********************/

    /**
    * Disposes the SpiderClusterManager and releases it's resources.
    */
    public dispose(): void {
        this._spiderLayer.clear();
        this._map.layers.remove(this._spiderLayer);
        this._spiderLayer = null;

        for (var i = 0, len = this._events.length; i < len; i++) {
            Microsoft.Maps.Events.removeHandler(this._events[i]);
        }

        this._events = null;
    }

    /**
    * Gets the base ClusterLayer used by the SpiderClusterManager.
    * @returns The base ClusterLayer used by the SpiderClusterManager.
    */
    public getClusterLayer(): Microsoft.Maps.ClusterLayer {
        return this._clusterLayer;
    }

    /**
    * Collapses any open spider clusters.
    */
    private hideSpiderCluster(): void {
        //Show cluster and hide spider.
        if (this._currentCluster) {
            this._currentCluster.setOptions({ visible: true });
            this._spiderLayer.clear();
            this._currentCluster = null;
        }
    }

    /**
    * Sets the options used to customize how the SpiderClusterManager renders clusters.
    * @param options The options used to customize how the SpiderClusterManager renders clusters.
    */
    public setOptions(options: ISpiderClusterOptions): void {
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
    }

    /**
    * Expands a cluster into it's open spider layout.
    * @param cluster The cluster to show in it's open spider layout..
    */
    public showSpiderCluster(cluster: Microsoft.Maps.ClusterPushpin): void {
        this.hideSpiderCluster();
        this._currentCluster = cluster;

        if (cluster && cluster.containedPushpins) {
            //Create spider data.
            var pins = cluster.containedPushpins;

            var center = cluster.getLocation();
            var centerPoint = <Microsoft.Maps.Point>this._map.tryLocationToPixel(center, Microsoft.Maps.PixelReference.control);
            var point: Microsoft.Maps.Point;
            var loc: Microsoft.Maps.Location;
            var pin: SpiderPushpin;
            var stick: Microsoft.Maps.Polyline;
            var angle: number = 0;

            var makeSpiral: boolean = pins.length > this._options.circleSpiralSwitchover;

            var legPixelLength: number;
            var stepAngle: number;
            var stepLength: number;

            if (makeSpiral) {
                legPixelLength = this._options.minCircleLength / Math.PI;
                stepLength = 2 * Math.PI * this._options.spiralDistanceFactor;
            } else {
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
                } else {
                    angle = stepAngle * i;
                }

                point = new Microsoft.Maps.Point(
                    centerPoint.x + legPixelLength * Math.cos(angle),
                    centerPoint.y + legPixelLength * Math.sin(angle));

                loc = <Microsoft.Maps.Location>this._map.tryPixelToLocation(point, Microsoft.Maps.PixelReference.control);

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
    }

    /**********************
    * Private Functions
    ***********************/

    /**
    * Click event handler for when a shape in the cluster layer is clicked. 
    * @param e The mouse event argurment from the click event.
    */
    private _layerClickEvent(e: Microsoft.Maps.IMouseEventArgs): void {
        if (e.primitive instanceof Microsoft.Maps.ClusterPushpin) {
            if (this._options.pinUnselected) {
                this._options.pinUnselected();
            }

            this.showSpiderCluster(<Microsoft.Maps.ClusterPushpin>e.primitive);
        } else {
            if (this._options.pinSelected) {
                var pin = <Microsoft.Maps.Pushpin>e.primitive;

                if (e.primitive instanceof SpiderPushpin) {
                    this._options.pinSelected((<SpiderPushpin>pin).parentPin, this._currentCluster);
                } else {
                    this._options.pinSelected(pin, null);
                }
            }

            this.hideSpiderCluster();
        }
    }

    /**
    * Creates a copy of a pushpins basic options.
    * @param pin Pushpin to copy options from.
    * @returns A copy of a pushpins basic options.
    */
    private _getBasicPushpinOptions(pin: Microsoft.Maps.Pushpin): Microsoft.Maps.IPushpinOptions {
        return {
            anchor: pin.getAnchor(),
            color: pin.getColor(),
            icon: pin.getIcon(),
            roundClickableArea: pin.getRoundClickableArea(),
            text: pin.getText(),
            textOffset: pin.getTextOffset()
        };
    }
}

//Load Custering module which is a dependancy. 
Microsoft.Maps.loadModule('Microsoft.Maps.Clustering', () => {
    Microsoft.Maps.moduleLoaded('SpiderClusterManager');
});