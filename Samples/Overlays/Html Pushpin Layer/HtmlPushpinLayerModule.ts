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

/** Options used to customize how a Html Pushpin is rendered. */
interface IHtmlPushpinOptions {
    /** The point on the pushpin icon, in pixels, which is anchored to the pushpin location. An anchor of (0,0) is the top left corner of the icon. */
    anchor?: Microsoft.Maps.Point;

    /** A boolean indicating whether the pushpin can be dragged to a new position with the mouse or by touch. */
    draggable?: boolean;

    /** The HTML that represents the pushpin. */
    htmlContent?: string | HTMLElement;

    /** The location of the pushpin. */
    location?: Microsoft.Maps.Location;
    
    /** A boolean indicating whether to show or hide the pushpin. The default value is true. A value of false indicates that the pushpin is hidden, although it is still an entity on the map. */
    visible?: boolean;
}

/** An Html Pushpin Event object. */
interface IHtmlPushpinEvent {
    /** The event that occurred. */
    eventName: string;

    /** If the target is a shape, this will be the layer that the shape is in. */
    layer: HtmlPushpinLayer;

    /** The map location of where the event occurred. */
    location?: Microsoft.Maps.Location;

    /** The x-value of the pixel coordinate on the page of the mouse cursor. */
    pageX: number;

    /** The y-value of the pixel coordinate on the page of the mouse cursor. */
    pageY: number;

    /** The pixel coordinate of the mouse cusrsor relative to the top left corner of the map div. */
    point: Microsoft.Maps.Point;

    /** The object that triggered the event. */
    target: HtmlPushpin;

    /** The type of the object that the event is attached to. Valid values include the following: ‘map’, 'layer', ‘polygon’, ‘polyline’, or ‘pushpin’ */
    targetType: string;
}

/**
 * A simple class that defines a HTML pushpin.
 */
class HtmlPushpin extends Microsoft.Maps.Pushpin {

    /**********************
    * Public Properties
    ***********************/

    public metadata: any;

    /**********************
    * Public Events
    ***********************/

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onDragStart: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onDrag: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onDragEnd: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onMouseDown: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onMouseUp: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onMouseOver: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onMouseOut: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onClick: (event: IHtmlPushpinEvent) => void;

    /**
    * @deprecated Use Microsoft.Maps.Events.addHandler
    */
    public onDoubleClick: (event: IHtmlPushpinEvent) => void;

    /**********************
    * Internal Properties
    ***********************/
    
    /** This is an internal property used by the HtmlPushpinLayer. */
    public _options: IHtmlPushpinOptions = {
        visible: true
    };

    public _element: HTMLDivElement;   
     
    public _layer: HtmlPushpinLayer;

    private _isDragging: boolean;
    
    /**********************
    * Constructor
    ***********************/
    
    /**
     * @constructor
     * @param loc The location of the pushpin.
     * @param htmlContent The HTML to display as the pushpin.
     * @param options The options used to customize how the pushpin is displayed.
     */
    constructor(loc: Microsoft.Maps.Location, htmlContent: string | HTMLElement, options?: IHtmlPushpinOptions) {       
        super(loc);

        //A property for storing data relative to the pushpin.
        this.metadata = null;

        //Create the pushpins DOM element.
        this._element = document.createElement('div');
        this._element.style.position = 'absolute';

        //Set the options.
        options = options || <IHtmlPushpinOptions>{};
        options.location = loc;
        options.htmlContent = htmlContent;
        this.setOptions(options);

        //Add event listeners
        var self = this;
        
        this._element.addEventListener('mousedown', (e) => { self._pinMouseDown(e) });
        this._element.addEventListener('mouseup', (e) => { self._pinMouseUp(e) });
        this._element.addEventListener('mouseover', (e) => { self._pinMouseEvent(e, 'mouseover', self.onMouseOver) });   
        this._element.addEventListener('mouseout', (e) => { self._pinMouseEvent(e, 'mouseout', self.onMouseOut) });   
        this._element.addEventListener('click', (e) => { self._pinMouseEvent(e, 'click', self.onClick) });
        this._element.addEventListener('dblclick', (e) => { self._pinMouseEvent(e, 'dblclick', self.onDoubleClick) });   
    }

    /**
     * Disposes the pushpin and releases its resources.
     */
    public dispose(): void {
        //Remove mouse events.
        if (this._element) {
            var self = this;

            this._element.removeEventListener('mousedown', (e) => { self._pinMouseDown(<MouseEvent>e) });
            this._element.removeEventListener('mouseup', (e) => { self._pinMouseUp(<MouseEvent>e) });
            this._element.removeEventListener('mouseover', (e) => { self._pinMouseEvent(<MouseEvent>e, 'mouseover', self.onMouseOver) });
            this._element.removeEventListener('mouseout', (e) => { self._pinMouseEvent(<MouseEvent>e, 'mouseout', self.onMouseOut) });
            this._element.removeEventListener('click', (e) => { self._pinMouseEvent(<MouseEvent>e, 'click', self.onClick) });
            this._element.removeEventListener('dblclick', (e) => { self._pinMouseEvent(<MouseEvent>e, 'dblclick', self.onDoubleClick) }); 
        }

        this._layer = null;
        this._options = null;
        this._element = null;
        this._isDragging = null;

        this.onDrag = null;
        this.onDragStart = null;
        this.onDragEnd = null;

        this.metadata = null;
    }

    /**
     * Gets the anchor point of the pushpin.
     * @returns The anchor point of the pushpin.
     */
    public getAnchor(): Microsoft.Maps.Point {
        return this._options.anchor;
    }

    /**
     * Gets a boolean indicating if the pushpin is draggable or not.
     * @returns A boolean indicating if the pushpin is draggable or not.
     */
    public getDraggable(): boolean {
        return this._options.draggable;
    }

    /**
     * Gets the Html content of the pushpins.
     * @returns The Html content of the pushpins.
     */
    public getHtmlContent(): string | HTMLElement {
        return this._options.htmlContent;
    }

    /**
     * Gets the location of the pushpin.
     * @returns The location of the pushpin.
     */
    public getLocation(): Microsoft.Maps.Location {
        return this._options.location;
    }

    /**
     * Gets the visibility option of the pushpin.
     * @returns The visibility of the pushpin.
     */
    public getVisible(): boolean {
        return this._options.visible;
    }

    /**
     * Sets the location of the pushpin.
     * @param loc The location to display the pushpin at.
     */
    public setLocation(loc: Microsoft.Maps.Location): void {
        if (this._layer && loc && loc instanceof Microsoft.Maps.Location) {
            this._options.location = loc;
            this._layer._updatePushpinPosition(this);
        }
    }

    /**
     * Sets the options of the pushpin.
     * @param options The options of the pushpin.
     */
    public setOptions(options: IHtmlPushpinOptions): void {
        var reposition = false;

        if (options.anchor && options.anchor instanceof Microsoft.Maps.Point) {
            this._options.anchor = options.anchor;
            reposition = true;
        }

        if (options.location && options.location instanceof Microsoft.Maps.Location) {
            this._options.location = options.location;
            reposition = true;
        }

        if (typeof options.draggable === 'boolean') {
            this._options.draggable = options.draggable;
        }

        if (typeof options.visible === 'boolean') {
            this._options.visible = options.visible;

            if (options.visible) {
                this._element.style.display = '';
            } else {
                this._element.style.display = 'none';
            }

            reposition = true;
        }

        if (options.htmlContent) {
            this._options.htmlContent = options.htmlContent;

            if (this._element) {
                if (typeof options.htmlContent === 'string') {
                    this._element.innerHTML = <string>options.htmlContent;
                } else {
                    //Remove any child elements.
                    for (var i = 0, len = this._element.childElementCount; i < len; i++) {
                        this._element.removeChild(this._element.childNodes[i])
                    }

                    this._element.appendChild(<HTMLElement>options.htmlContent);
                }
            }
        }

        if (this._layer && reposition) {
            this._layer._updatePushpinPosition(this);
        }
    }

    /**********************
    * Private Functions
    ***********************/

    /**
    * Generic mouse event handler.
    * @param e The mouse event.
    * @param eventName The name of the event.
    * @param eventHandler The event handler to process the event.
    */
    private _pinMouseEvent(e: MouseEvent, eventName: string, eventHandler: (event: IHtmlPushpinEvent) => void): void {
        if (Microsoft.Maps.Events.hasHandler(this, eventName)) {
            Microsoft.Maps.Events.invoke(this, eventName, this._getEventInfo(eventName, e));
        } else if (eventHandler) {
            eventHandler(this._getEventInfo(eventName, e));
        }
    }

    /**
     * Mouse down event handler.
     * @param e The mouse event.
     */
    private _pinMouseDown(e: MouseEvent): void {
        if (this._options.draggable) {
            this._isDragging = true;  

            this._layer._dragTarget = this;

            if (Microsoft.Maps.Events.hasHandler(this, 'dragstart')) {
                Microsoft.Maps.Events.invoke(this, 'dragstart', this._getEventInfo('dragstart', e));
            } else if (this.onDragStart) {
                this.onDragStart(this._getEventInfo('dragstart', e));
            } 
        }
        
        if (Microsoft.Maps.Events.hasHandler(this, 'mousedown')) {
            Microsoft.Maps.Events.invoke(this, 'mousedown', this._getEventInfo('mousedown', e));
        } else if (this.onMouseDown) {
            this.onMouseDown(this._getEventInfo('mousedown', e));
        }
    }

    /**
     * Mouse up event handler.
     * @param e The mouse event.
     */
    public _pinMouseUp(e: MouseEvent): void {
        if (this._isDragging) {
            this._isDragging = false;
            this._layer._dragTarget = null;

            if (Microsoft.Maps.Events.hasHandler(this, 'dragend')) {
                Microsoft.Maps.Events.invoke(this, 'dragend', this._getEventInfo('dragend', e));
            } else if (this.onDragEnd) {
                this.onDragEnd(this._getEventInfo('dragend', e));
            }
        }

        if (Microsoft.Maps.Events.hasHandler(this, 'mouseup')) {
            Microsoft.Maps.Events.invoke(this, 'mouseup', this._getEventInfo('mouseup', e));
        } else if (this.onMouseDown) {
            this.onMouseDown(this._getEventInfo('mouseup', e));
        }
    }

    /**
     * Mouse move event handler.
     * @param e The mouse event.
     */
    public _pinDragged(e: IHtmlPushpinEvent): void {  
        if (this.onDrag) {
            this.onDrag(e);
        }
    }

    /**
     * Converts a mouse event into a Html Pushpin event.
     * @param eventName The name of the event that occured.
     * @param e The original mouse event.
     * @returns An Html Pushpin event.
     */
    private _getEventInfo(eventName: string, e: MouseEvent): IHtmlPushpinEvent {
        var x = 0;
        var y = 0;

        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        var point = new Microsoft.Maps.Point(x, y);

       return <IHtmlPushpinEvent>{
           eventName: eventName,
            layer: this._layer,
            pageX: x,
            pageY: y,
            point: point,
            target: this,
            targetType: 'HtmlPushpin',
            location: <Microsoft.Maps.Location>this._layer.getMap().tryPixelToLocation(point, Microsoft.Maps.PixelReference.page)
        };
    }
}

/**
 * A reusable class for overlaying HTML elements as pushpins on the map.
 */
class HtmlPushpinLayer extends Microsoft.Maps.CustomOverlay {

    /**********************
    * Private Properties
    ***********************/

    /** Internal property */
    public _dragTarget: HtmlPushpin;

    /** Store the pushpins. */
    private _pushpins: HtmlPushpin[] = null;

    /** A variable to store the viewchange event handler id. */
    private _viewChangeEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store the viewchangeend event handler id. */
    private _viewChangeEndEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store the map resize event handler id. */
    private _mapResizeEventHandler: Microsoft.Maps.IHandlerId = null;

    /** A variable to store a reference to the container for the HTML pushpins. */
    private _container: HTMLElement = null;

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

        //Reset pushpins as overlay is now loaded.
        this._renderPushpins();

        var map = this.getMap();

        //Update the position of the pushpin when the view changes. Hide the layer if map changed to streetside.
        this._viewChangeEventHandler = Microsoft.Maps.Events.addHandler(map, 'viewchange', (e) => { this._viewChanged(); });
        this._viewChangeEndEventHandler = Microsoft.Maps.Events.addHandler(map, 'viewchangeend', (e) => { this._viewChanged(); });
        
        //Update the position of the overlay when the map is resized.
        this._mapResizeEventHandler = Microsoft.Maps.Events.addHandler(map, 'mapresize', (e) => { this._updatePositions(); });

        map.getRootElement().addEventListener('mousemove', (e) => { this._updateDragPushpin(<MouseEvent>e); });
        document.body.addEventListener('mouseup', (e) => { if (this._dragTarget) { this._dragTarget._pinMouseUp(<MouseEvent>e); } });
    }

    /**
     * Layer removed from map. Release resources.
     */
    public onRemove(): void {
        this.setHtmlElement(null);
        this._dragTarget = null;

        //Remove the event handler that is attached to the map.
        Microsoft.Maps.Events.removeHandler(this._viewChangeEventHandler);
        Microsoft.Maps.Events.removeHandler(this._viewChangeEndEventHandler);
        Microsoft.Maps.Events.removeHandler(this._mapResizeEventHandler);

        var map = this.getMap();

        if (map) {
            map.getRootElement().removeEventListener('mousemove', (e) => { this._updateDragPushpin(<MouseEvent>e); });
            document.body.removeEventListener('mouseup', (e) => { if (this._dragTarget) { this._dragTarget._pinMouseUp(<MouseEvent>e); } });
        }
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
                pushpin._layer = this;

                if (this._container) {
                    this._container.appendChild(pushpin._element);
                }
            } else if (pushpin instanceof Array) {
                //Add the pushpins to the container.
                for (var i = 0, len = pushpin.length; i < len; i++) {
                    pushpin[i]._layer = this;

                    if (this._container) {
                        this._container.appendChild(pushpin[i]._element);
                    }
                }
            }

            this._updatePositions();
        }
    }

    /**
     * Removes all pushpins in the layer.
     */
    public clear(): void {
        //Clear any pushpins already in the layer.
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._pushpins[i].dispose();
            }
        }

        this._pushpins = [];
        if (this._container) {
            this._container.innerHTML = '';
        }
    }

    /**
     * Retrieves a bounding box that contains all the HTML Pushpin locations.
     * @returns A bounding box that contains all the HTML Pushpin locations.
     */
    public getBounds(): Microsoft.Maps.LocationRect {
        var locs = [];
        for (var i = 0, len = this._pushpins.length; i < len; i++) {
            locs.push(this._pushpins[i].getLocation());
        }

        if (locs.length > 0) {
            return Microsoft.Maps.LocationRect.fromLocations(locs);
        }

        return null;
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
    public setPushpins(pushpins: HtmlPushpin[]): void {
        this.clear();

        if (pushpins) {    
            this._pushpins = pushpins;
            this._renderPushpins();
        }
    }

    /**********************
    * Private Functions
    ***********************/

    private _viewChanged() {
        if (this.getMap().getMapTypeId() === Microsoft.Maps.MapTypeId.streetside) {
            this._container.style.display = 'none';
        } else {
            this._container.style.display = '';
            this._updatePositions();
        }
    }

    /**
    * Renders the pushpins on the layer.
    */
    private _renderPushpins(): void {
        //Add the pushpins to the container.
        for (var i = 0, len = this._pushpins.length; i < len; i++) {
            this._pushpins[i]._layer = this;
            this._container.appendChild(this._pushpins[i]._element);
        }

        this._updatePositions();
    }

    /**
    * Updates the position of a HTML pushpin element on the map.
    */
    public _updatePushpinPosition(pin: HtmlPushpin): void {
        if (pin.getVisible()) {
            var map = this.getMap();

            if (map) {
                //Calculate the pixel location of the pushpin.
                var topLeft = <Microsoft.Maps.Point>map.tryLocationToPixel(pin.getLocation(), Microsoft.Maps.PixelReference.control);

                //Offset position to account for anchor.
                var anchor = pin.getAnchor();
                topLeft.x -= anchor.x;
                topLeft.y -= anchor.y;

                //Update the position of the pushpin element.
                pin._element.style.left = topLeft.x + 'px';
                pin._element.style.top = topLeft.y + 'px';
            }
        }
    }

    private _updateDragPushpin(e: MouseEvent): void {
        if (this._dragTarget) {
            var map = this.getMap();

            if (map) {
                var x = 0;
                var y = 0;

                if (e.pageX || e.pageY) {
                    x = e.pageX;
                    y = e.pageY;
                }
                else {
                    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                var point = new Microsoft.Maps.Point(x, y);
                var loc = <Microsoft.Maps.Location>map.tryPixelToLocation(point, Microsoft.Maps.PixelReference.page);
                this._dragTarget.setLocation(loc);

                this._dragTarget._pinDragged({
                    eventName: 'drag',
                    layer: this,
                    location: loc,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    point: point,
                    target: this._dragTarget,
                    targetType: 'HtmlPushpin'
                });

                e.preventDefault();
            }            
        }
    }

    /**
     * Updates the positions of all HTML pushpins in the layer.
     */
    private _updatePositions(): void {
        if (this._pushpins) {
            for (var i = 0, len = this._pushpins.length; i < len; i++) {
                this._updatePushpinPosition(this._pushpins[i]);
            }
        }
    }
}

//Call the module loaded function.
Microsoft.Maps.moduleLoaded('HtmlPushpinLayerModule');