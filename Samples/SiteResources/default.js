var githubProjectUrl = 'https://github.com/Microsoft/BingMapsV8CodeSamples/blob/master/Samples/';
var currentSampleElm;

function loadSample(name, path, sourcePath) {
    var sampleNode = getSampleNode(name);
    if (sampleNode) {
        if (currentSampleElm) {
            currentSampleElm.classList.remove('selectedNode');
        }
        currentSampleElm = sampleNode;
        currentSampleElm.classList.add('selectedNode');
    }
    window.location.hash = encodeURIComponent(name);

    //Download HTML for sample.
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", path, false);

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            var sampleHtml = xmlHttp.responseText;

            sampleHtml = sampleHtml.replace(/\[YOUR_BING_MAPS_KEY\]/gi, BingMapsKey);

            var iframe = document.getElementById('displayWindow');

            var doc = iframe.document;

            if (iframe.contentDocument) {
                doc = iframe.contentDocument; // For NS6
            } else if (iframe.contentWindow) {
                doc = iframe.contentWindow.document; // For IE5.5 and IE6
            }

            doc.open();
            doc.writeln(sampleHtml);
            doc.close();

            if (sourcePath && sourcePath != '') {
                document.getElementById('sourceCodeLinkPanel').style.display = '';
                document.getElementById('newWindowLink').onclick = function () {
                    var win = window.open();
                    win.document.write(sampleHtml);
                };
                document.getElementById('sourceCodeLink').href = githubProjectUrl + sourcePath;
            }
            else {
                document.getElementById('sourceCodeLinkPanel').style.display = 'none';
            }

            iframe.focus();            
        }
    }

    xmlHttp.send();  
}

var spaceRx = /\s/g;

function getSampleNode(name) {
    name = decodeURIComponent(name);
    var sampleLinks = document.getElementById('SampleTreeView').getElementsByTagName('a');
    for (var i = 0; i < sampleLinks.length; i++) {
        if (sampleLinks[i].innerText === name) {
            return sampleLinks[i];
        }
    }
    return null;
}

function getSamplesParent(sampleElm) {
    return sampleElm.parentNode.parentNode.parentNode.parentNode.parentNode.id;
}

function loadSampleByHash(hash) {
    var redirect = sampleRedirects[hash];
    if (redirect) {
        hash = redirect;
    }
    var sampleNode = getSampleNode(hash);
    if (sampleNode) {
        currentSampleElm = sampleNode;
        currentSampleElm.classList.add('selectedNode');
        window.location = sampleNode.href;
        var childNodesArg = getSamplesParent(sampleNode);
        var parentId = childNodesArg.replace('Nodes', '');
        var nodeIndex = parentId.charAt(parentId.length - 1);
        if (/[0-9]+/.test(nodeIndex)) {
            TreeView_ToggleNode(SampleTreeView_Data, nodeIndex, document.getElementById(parentId), ' ', document.getElementById(childNodesArg));
        }
    }
}

window.onload = function () {
    if (WarningMessage) {
        alert(WarningMessage);
    }
    var hash = window.location.hash;
    if (hash) {
        hash = hash.replace('#', '');
        loadSampleByHash(hash);
    }

    return false;
};

$(function () {
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this, currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        }
    });

    SampleList.sort(function (a, b) {
        var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase();
        if (nameA < nameB)
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    });

    $("#searchTbx").autocomplete({
        delay: 0,
        source: SampleList,
        delay: 0,
        select: function (event, ui) {
            if (ui && ui.item && ui.item.action) {
                ui.item.action();
            }
        }
    }).click(function () {
        $(this).val('');
        });

    $("#searchTbx").val('Search the samples');
});

var sampleRedirects = {
    'CustomOverlay_HtmlPushpinLayer': 'Html%20Pushpin%20Layer',
    'QueryAPI_Nearby': 'Find%20Nearby%20Search%20-%20Query%20API',
    'CustomOverlay_CanvasLayer': 'Canvas%20Layer',
    "Map_ContextMenu": "Context%20Menu",
    "Map_KeyEvents": "Map%20Key%20Events",
    "Map_LazyLoading": "Lazy%20Loading%20the%20Map",
    "GeoJson_LocalFile": "GeoJson%20Drag%20and%20Drop",
    "Autosuggest_AddressForm": "Fill%20Address%20Form%20with%20Autosuggest",
    "Autosuggest_DefaultUI": "Autosugges%20with%20Map",
    "GeoXmlLayer%20-%20Local%20Data": "GeoXmlLayer%20-%20Same%20Domain",
    "Business%20Search%20Module": "POI%20Search%20Module",
    "GeoData_ChoroplethMap": "GeoData%20Choropleth%20Map",
    "DrawingTools_CustomToolbar": "Fully%20Custom%Drawing%20Toolbar",
    "QueryAPI%20-%20Load%20all%20results%20(parallel)": "Load%20all%20results%20(parallel)",
    "QueryAPI%20-%20Load%20all%20results%20(recursive)": "Load%20all%20results%20(recursive)",
    "QueryAPI_AlongRoute": "Search%20Along%20a%20Route",
    "QueryAPI_BasicIntersection": "Basic%20Intersection%20Search%20Query",
    "QueryAPI_ChoroplethMap": "Search%20Result%20Choropleth%20Map",
    "QueryAPI_DrawSearchArea": "Draw%20Search%20Area",
    "QueryAPI_FindByProperty": "Find%20By%20Property%20Query",
    "QueryAPI_Intersection": "Intersection%20Query",
    "QueryAPI_Paging": "Paging%20Search%20Results",
    "QueryAPI_SortByDrivingDistance": "Sort%20Query%20Results%20By%20Driving%20Distance",
    "Map_WithAngular1": "Basic%20Angular%201.6%20Map",
    "Pushpin%20Bar%20Chart%20(inline%20SVG)": "Bar%20Chart%20Pushpins%20(inline%20SVG)",
    "RestServices_jQuery": "RestServices_jQuery_JSONP",
    "Infobox_Custom": "Custom%20Infobox%20HTML%20Content",
    "Pushpin_DragEvents": "Draggable%20Pushpin",
    "Clustering_Basic": "Basic%20Clustering",
    "Clustering_Customization": "Cluster%20Layer%20Customizations",
    "Pushpin_FontBasedIcons": "Font%20Based%20Pushpin%20Icons",
    "Pushpin_DynamicCircles": "Scaled%20Circle%20(Bubbles)%20Pushpins"
};
