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

/**
 * A simple class that defines a HTML pushpin.
 */
class HtmlPushpin {

    /**********************
    * Public Properties
    ***********************/

    public anchor: Microsoft.Maps.Point;
    public location: Microsoft.Maps.Location;
    public metadata: any;

    /** This is an internal property used by the HtmlPushpinLayer. */
    public _element: HTMLElement;    

    /**********************
    * Constructor
    ***********************/
    
   /**
    * @constructor
    * @param loc The location of the pushpin.
    * @param html The HTML to display as the pushpin.
    * @param anchor An anchor to offset the position of the html so that it aligns with the location.
    */
    constructor(loc: Microsoft.Maps.Location, html: string, anchor?: Microsoft.Maps.Point) {
        this.location = loc;
        this.anchor = anchor;

        //A property for storing data relative to the pushpin.
        this.metadata = null;

        //Create the pushpins DOM element.
        this._element = document.createElement('div');
        this._element.innerHTML = html;
        this._element.style.position = 'absolute';
    }
}

/**
 * A reusable class for overlaying HTML elements as pushpins on the map.
 */
class HtmlPushpinLayer extends Microsoft.Maps.CustomOverlay {

    /**********************
    * Private Properties
    ***********************/

    /** Store the pushpins. */
    private _pushpins: HtmlPushpin[] = null;

    /** A variable to store the viewchange event handler id. */
    private viewChangeEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store a reference to the container for the HTML pushpins. */
    private container: HTMLElement = null;

    /**********************
    * Constructor
    ***********************/

    /**
    * @constructor
    */
    constructor(pushpins?: HtmlPushpin[]) {
        super({ beneathLabels: false });

        this._pushpins = pushpins || [];
    }
    
    /**********************
    * Overridden functions
    ***********************/

    /**
    * Layer added to map. Setup rendering container.
    */
    public onAdd() {
        //Create a div that will hold the pushpins.
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.left = '0px';
        this.container.style.top = '0px';

        this.setHtmlElement(this.container);
    }

    /**
     * Layer loaded, add map events for updating position of data.
     */
    public onLoad() {
        var self = this;

        //Reset pushpins as overlay is now loaded.
        self.setPushpins(self._pushpins);

        //Update the position of the pushpin when the view changes.
        this.viewChangeEventHandler = Microsoft.Maps.Events.addHandler(self.getMap(), 'viewchange', function () {
            self._updatePositions();
        });
    }

    /**
     * Layer removed from map. Release resources.
     */
    public onRemove() {
        this.setHtmlElement(null);

        //Remove the event handler that is attached to the map.
        Microsoft.Maps.Events.removeHandler(this.viewChangeEventHandler);
    }

    /**********************
    * Public Functions
    ***********************/

    /**
    * Adds a HTML pushpin or array of HTML pushpins to add to the layer.
    * @param pushpin A HTML pushpin or array of HTML pushpins to add to the layer.
    */
    public add(pushpin: HtmlPushpin | HtmlPushpin[]): void {
        if (pushpin) {
            if (pushpin instanceof HtmlPushpin) {
                this._pushpins.push(pushpin);
                this.container.appendChild(pushpin._element);
            } else if (pushpin instanceof Array) {
                //Add the pushpins to the container.
                for (var i = 0, len = pushpin.length; i < len; i++) {
                    this.container.appendChild(pushpin[i]._element);
                }
            }

            this._updatePositions();
        }
    }

    /**
     * Removes all pushpins in the layer.
     */
    public clear(): void {
        this._pushpins = [];
        this.container.innerHTML = '';
    }

    /**
     * Retrieves a bounding box that contains all the HTML Pushpin locations.
     * @returns A bounding box that contains all the HTML Pushpin locations.
     */
    public getBounds(): Microsoft.Maps.LocationRect {
        var locs = [];
        for (var i = 0, len = this._pushpins.length; i < len; i++) {
            locs.push(this._pushpins[i].location);
        }

        return Microsoft.Maps.LocationRect.fromLocations(locs);
    }

    /**
     * Retrieves all HTML pushpins in the layer.
     * @returns All HTML pushpins in the layer.
     */
    public getPushpins(): HtmlPushpin[] {
        return this._pushpins;
    }

    /**
    * Sets the pushpins to be overlaid on top of the map. This will remove any pushpins already in the layer.
    * @param pushpins The HTML pushpins to overlay on the map.
    */
    public setPushpins(pushpins: HtmlPushpin[]) {
        //Store the pushpin data.
        this._pushpins = pushpins  || [];

        //Clear the container.
        if (pushpins && this.container) {
            this.container.innerHTML = '';

            if (pushpins) {
                //Add the pushpins to the container.
                for (var i = 0, len = pushpins.length; i < len; i++) {
                    this.container.appendChild(pushpins[i]._element);
                }
            }
        }

        this._updatePositions();
    }

    /**********************
    * Private Functions
    ***********************/

    /**
    * Updates the position of a HTML pushpin element on the map.
    */
    private _updatePushpinPosition(pin: HtmlPushpin) {
        var map = this.getMap();

        if (map) {
            //Calculate the pixel location of the pushpin.
            var topLeft = <Microsoft.Maps.Point>map.tryLocationToPixel(pin.location, Microsoft.Maps.PixelReference.control);

            //Offset position to account for anchor.
            topLeft.x -= pin.anchor.x;
            topLeft.y -= pin.anchor.y;

            //Update the position of the pushpin element.
            pin._element.style.left = topLeft.x + 'px';
            pin._element.style.top = topLeft.y + 'px';
        }
    }

    /**
     * Updates the positions of all HTML pushpins in the layer.
     */
    private _updatePositions() {
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._updatePushpinPosition(this._pushpins[i]);
            }
        }
    }
}

//Call the module loaded function.
Microsoft.Maps.moduleLoaded('HtmlPushpinLayerModule');