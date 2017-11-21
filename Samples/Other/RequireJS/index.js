requirejs.config({
    'paths': {
        'jquery': '//ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.0.min',
        'async': '//cdnjs.cloudflare.com/ajax/libs/requirejs-plugins/1.0.3/async'
    }
});

require(
    [
        'jquery',
        'async!https://www.bing.com/mapspreview/sdk/mapcontrol'
        //Alternatively: 'async!https://www.bing.com/mapspreview/sdk/mapcontrol?key=[YOUR_BING_MAPS_KEY]'
    ],
    function () {
        var map = new Microsoft.Maps.Map('#myMap', {
            credentials: bingMapsKey
        });
    }
);