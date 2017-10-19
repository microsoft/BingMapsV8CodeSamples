/****************************************************************************
* Author: Ricky Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: January 19th, 2012
*
* Source: http://bingmapsv7modules.codeplex.com/
* 
* Description:
* This plugin allows you to import GPX files into Bing Maps. A GPX feed will be downloaded 
* and parsed into an EntityCollection which can then be added to the map. Additional metadata is 
* captured and stored in a metadata tag on each shape and on the base EntityCollection thus making 
* it easy to relate shapes to their metadata. Also note that the base EntityCollection will have 
* LocationRect property in the metadata if bound information is found in the GPX metadata. This can 
* be used to set the map view. Also note that the extension tag is not supported.
*
* Currently supports:
*
* Feed Tags:
*   - gpx
*   - metadata
*   - wpt
*   - rte
*   - trk
*
* metadata Tags:
*   - name
*   - desc
*   - author
*   - copyright
*   - time
*   - timeSpecified
*   - keywords
*   - bounds
*   - link
*
****************************************************************************/

var GPXParser = function () {
    var _defaultOptions = {
        pushpinOptions: {},
        routeOptions: {
            //strokeColor: new Microsoft.Maps.Color(200, 255, 165, 0),
            strokeThickness: 5
        },
        trackOptions: {
            //strokeColor: new Microsoft.Maps.Color(200, 255, 165, 0),
            strokeThickness: 5
        }
    };

    /*****************
    * Private Methods
    ******************/

    //Creates a new object that is a merge of two other objects 
    function mergeObjects(obj1, obj2) {
        var obj3 = {};

        for (var p in obj1) {
            try {
                // Property in destination object set; update its value. 
                if (obj1[p].constructor == Object) {
                    obj3[p] = mergeObjects(obj3[p], obj1[p]);

                } else {
                    obj3[p] = obj1[p];
                }

            } catch (e) {
                // Property in destination object not set; create it and set its value. 
                obj3[p] = obj1[p];
            }
        }

        for (var p in obj2) {
            try {
                // Property in destination object set; update its value. 
                if (obj2[p].constructor == Object) {
                    obj3[p] = mergeObjects(obj3[p], obj2[p]);

                } else {
                    obj3[p] = obj2[p];
                }

            } catch (e) {
                // Property in destination object not set; create it and set its value. 
                obj3[p] = obj2[p];
            }
        }

        return obj3;
    }

    //Method for parsing a GPX file
    function parseGPX(xmlDoc, options) {
        var GPX_Collection = new Microsoft.Maps.Layer();

        var nodes = xmlDoc.getElementsByTagName("metadata"), i, j, geom, nodeCount, wp;

        if (nodes.length == 0) {
            //GPX V1.0 files do not use a metadata tag and instead put the metadata directly in the GPX tag
            nodes = xmlDoc.getElementsByTagName("gpx");
        }

        if (nodes != null && nodes.length > 0) {
            GPX_Collection.metadata = parseMetadata(nodes[0]);

            if (GPX_Collection.metadata.bounds != null && GPX_Collection.metadata.bounds != undefined) {
                GPX_Collection.metadata.LocationRect = new Microsoft.Maps.LocationRect.fromEdges(
                    GPX_Collection.metadata.bounds.maxlat, //North
                    GPX_Collection.metadata.bounds.minlon, //West
                    GPX_Collection.metadata.bounds.minlat, //South
                    GPX_Collection.metadata.bounds.maxlon  //East
                );
            }
        }

        nodes = xmlDoc.getElementsByTagName("trk");
        nodeCount = nodes.length;

        for (i = 0; i < nodeCount; i++) {
            geom = parseTrack(nodes[i], options);

            for (j = 0; j < geom.length; j++) {
                GPX_Collection.add(geom[j]);
            }
        }

        nodes = xmlDoc.getElementsByTagName("rte");
        nodeCount = nodes.length;

        for (i = 0; i < nodeCount; i++) {
            geom = parseRoute(nodes[i], options);

            if (geom != null) {
                GPX_Collection.add(geom);
            }
        }

        nodes = xmlDoc.getElementsByTagName("wpt");
        nodeCount = nodes.length;

        for (i = 0; i < nodeCount; i++) {
            wp = parseWaypoint(nodes[i]);

            if (wp != null) {
                geom = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(wp.lat, wp.lon), options.pushpinOptions);
                geom.metadata = wp;

                //if (wp.sym != null && wp.sym != undefined && wp.sym != '') {
                //    geom.setOptions({ icon: wp.sym });
                //}

                GPX_Collection.add(geom);
            }
        }

        return GPX_Collection;
    }

    function parseRoute(node, options) {
        var m = { waypoints: [] }, points = [];

        if (node != null) {
            var tagName, waypoint;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "number":
                        m.number = parseString(node.attributes[i]);
                        break;
                    default:
                        break;
                }
            }

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "name":
                    case "cmt":
                    case "desc":
                    case "src":
                    case "type":
                    case "number":
                        m[tagName] = parseString(node.childNodes[i]);
                        break;
                    case "link":
                        if (m.link == null || m.link == undefined) {
                            m.link = [];
                        }

                        m.link.push(parseLink(node.childNodes[i]));
                        break;
                    case "rtept":
                        waypoint = parseWaypoint(node.childNodes[i]);
                        m.waypoints.push(waypoint); //store waypoint metadata
                        points.push(new Microsoft.Maps.Location(waypoint.lat, waypoint.lon));
                        break;
                        break;
                    default:
                        break;
                }
            }
        }

        if (points.length >= 2) {
            var route = new Microsoft.Maps.Polyline(points, options.routeOptions);
            route.metadata = m;
            return route;
        }

        return null;
    }

    function parseTrack(node, options) {
        var m = {}, segments = [];

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "number":
                        m.number = parseString(node.attributes[i]);
                        break;
                    default:
                        break;
                }
            }

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "name":
                    case "cmt":
                    case "desc":
                    case "src":
                    case "type":
                    case "number":
                        m[tagName] = parseString(node.childNodes[i]);
                        break;
                    case "link":
                        if (m.link == null || m.link == undefined) {
                            m.link = [];
                        }

                        m.link.push(parseLink(node.childNodes[i]));
                        break;
                    case "trkseg":
                        segments.push(parseTrackSegment(node.childNodes[i]));
                        break;
                    default:
                        break;
                }
            }
        }

        if (segments.length >= 1) {
            var geoms = [], track;

            for (var i = 0; i < segments.length; i++) {
                track = new Microsoft.Maps.Polyline(segments[i].points, options.trackOptions);
                track.metadata = m;
                track.metadata.waypoints = segments[i].waypoints;
                geoms.push(track);
            }

            return geoms;
        }

        return [];
    }

    //return an array of Microsoft.Maps.Location objects.
    function parseTrackSegment(node) {
        var metadata = { points: [], waypoints: [] };

        if (node != null) {
            var tagName, waypoint;

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "trkpt":
                        waypoint = parseWaypoint(node.childNodes[i]);
                        metadata.waypoints.push(waypoint); //store waypoint metadata
                        metadata.points.push(new Microsoft.Maps.Location(waypoint.lat, waypoint.lon));
                        break;
                    default:
                        break;
                }
            }
        }

        return metadata;
    }

    function parseWaypoint(node) {
        var waypoint = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "lat":
                    case "lon":
                        waypoint[tagName] = parseDouble(parseString(node.attributes[i]), 6);
                        break;
                    case "eleSpecified":
                    case "timeSpecified":
                    case "magvarSpecified":
                    case "geoidheightSpecified":
                    case "fixSpecified":
                    case "magvarSpecified":
                    case "hdopSpecified":
                    case "vdopSpecified":
                    case "pdopSpecified":
                    case "ageofdgpsdataSpecified":
                    case "magvarSpecified":
                        waypoint[tagName] = parseBool(parseString(node.attributes[i]));
                        break;
                    case "sat":
                    case "dgpsid":
                        waypoint[tagName] = parseString(node.attributes[i]);
                        break;
                    default:
                        break;
                }
            }

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "ele":
                    case "magvar":
                    case "geoidheight":
                    case "hdop":
                    case "vdop":
                    case "pdop":
                    case "ageofdgpsdata":
                        waypoint[tagName] = parseDouble(parseString(node.childNodes[i]));
                        break;
                    case "name":
                    case "cmt":
                    case "desc":
                    case "src":
                    case "sym":
                    case "time":
                    case "type":
                        waypoint[tagName] = parseString(node.childNodes[i]);
                        break;
                    case "link":
                        if (waypoint.link == null || waypoint.link == undefined) {
                            waypoint.link = [];
                        }

                        waypoint.link.push(parseLink(node.childNodes[i]));
                        break;
                    default:
                        break;
                }
            }
        }

        return waypoint;
    }

    function parseMetadata(node) {
        var metadata = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName.toLowerCase();

                switch (tagName) {
                    case "name":
                    case "desc":
                    case "time":
                    case "keywords":
                        metadata[tagName] = parseString(node.childNodes[i]);
                        break;
                    case "author":
                        metadata.author = parseAuthor(node.childNodes[i]);
                        break;
                    case "copyright":
                        metadata.copyright = parseCopyright(node.childNodes[i]);
                        break;
                    case "link":
                        if (metadata.link == null || metadata.link == undefined) {
                            metadata.link = [];
                        }

                        metadata.link.push(parseLink(node.childNodes[i]));
                        break;
                    case "bounds":
                        metadata.bounds = parseBounds(node.childNodes[i]);
                        break;
                    default:
                        break;
                }
            }
        }

        return metadata;
    }

    function parseAuthor(node) {
        var a = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "name":
                        a.name = parseString(node.childNodes[i]);
                        break;
                    case "email":
                        a.email = parseEmail(node.childNodes[i]);
                        break;
                    case "link":
                        a.link = parseLink(node.childNodes[i]);
                        break;
                    default:
                        break;
                }
            }
        }

        return a;
    }

    function parseEmail(node) {
        var e = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "id":
                    case "domain":
                        e[tagName] = parseString(node.attributes[i]);
                        break;
                    default:
                        break;
                }
            }
        }

        return e;
    }

    function parseCopyright(node) {
        var cr = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "author":
                        cr.author = parseString(node.attributes[i]);
                        break;
                    default:
                        break;
                }
            }

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "year":
                    case "license":
                        cr[tagName] = parseString(node.childNodes[i]);
                        break;
                    default:
                        break;
                }
            }
        }

        return cr;
    }

    function parseLink(node) {
        var link = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "href":
                        link.href = parseString(node.attributes[i]);
                        break;
                    default:
                        break;
                }
            }

            for (var i = 0; i < node.childNodes.length; i++) {
                tagName = node.childNodes[i].nodeName;

                switch (tagName) {
                    case "text":
                    case "type":
                        link[tagName] = parseString(node.childNodes[i]);
                        break;
                    default:
                        break;
                }
            }
        }

        return link;
    }

    //Consider turing into LocationRect
    function parseBounds(node) {
        var b = {};

        if (node != null) {
            var tagName;

            for (var i = 0; i < node.attributes.length; i++) {
                tagName = node.attributes[i].nodeName;

                switch (tagName) {
                    case "minlat":
                    case "minlon":
                    case "maxlat":
                    case "maxlon":
                        b[tagName] = parseDouble(parseString(node.attributes[i]), 6);
                        break;
                    default:
                        break;
                }
            }
        }

        return b;
    }

    function parseDouble(value, maxDecimals) {
        if (value != null && value != undefined) {
            try {
                if (maxDecimals != null) {
                    var multiplier = Math.pow(10, maxDecimals);
                    return Math.round(parseFloat(value) * multiplier) / multiplier;
                } else {
                    return parseFloat(value);
                }
            }
            catch (e) { }
        }

        return 0;
    }

    function parseBool(value) {
        try {
            switch (value.toLowerCase()) {
                case "true":
                case "yes":
                case "1":
                    return true;
                case "false":
                case "no":
                case "0":
                case null:
                    return false;
                default:
                    return Boolean(value);
            }
        }
        catch (e) { }

        return false;
    }

    function parseString(value) {
        if (value.text) {
            return value.text;
        } else if (value.textContent) {
            return value.textContent;
        } else if (value.value) {
            return value.value;
        } else if (value.nodeValue) {
            return value.nodeValue;
        }

        return value;
    }

    /****************
    * Public Methods
    *****************/

    this.Parse = function (feed, callback, options) {
        options = mergeObjects(_defaultOptions, options);

        var xmlHttp;
        if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    throw (e);
                }
            }
        }

        xmlHttp.open("GET", feed, false);

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                var xmlDoc = xmlHttp.responseXML;
                callback(parseGPX(xmlDoc, options));
            }
        }

        xmlHttp.send();        
    };
};

//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('GPXParserModule');