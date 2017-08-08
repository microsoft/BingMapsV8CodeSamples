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
var Microsoft;
(function (Microsoft) {
    var Maps;
    (function (Maps) {
        var Search;
        (function (Search) {
            /**
            * Represents a search result pushpin.
            */
            var IPoiPushpin = (function (_super) {
                __extends(IPoiPushpin, _super);
                function IPoiPushpin() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return IPoiPushpin;
            }(Microsoft.Maps.Pushpin));
            Search.IPoiPushpin = IPoiPushpin;
            /**
             * A list of all entity types.
             * Entity Types as defined here: https://msdn.microsoft.com/en-us/library/hh478191.aspx
             */
            Search._entityTypeSynonyms = [
                //Petrol/Gasoline Station - 5540
                {
                    id: '5540',
                    syn: [
                        ['gasstation', 'servicestation', 'gas', 'petro', 'petrostation', 'gasoline', 'gasolinestation'],
                        ['76'],
                        ['7eleven'],
                        ['chevron'],
                        ['arco'],
                        ['costco'],
                        ['shell'],
                        ['hess'],
                        ['valero'],
                        ['sunoco'],
                        ['bp', 'britishpetrolum'],
                        ['exxonmobil', 'exxon'],
                    ]
                },
                //Restaurant - 5800
                {
                    id: '5800',
                    syn: [
                        ['food', 'restaurant', 'cuisine'],
                        ['beer', 'pub', 'tavern', 'taproom', 'cocktail', 'wine'],
                        ['italian', 'pizza', 'pizzeria', 'trattoria', 'ristorante'],
                        ['sub', 'sandwich', 'deli'],
                        ['bakery', 'bakeries'],
                        ['chinese'],
                        ['thai'],
                        ['bbq', 'barbeque'],
                        ['kfc', 'kentuckyfriedchicken'],
                        ['mcdonalds'],
                        ['burgerking'],
                        ['subway'],
                        ['pizzahut'],
                        ['dominos'],
                        ['tacobell'],
                        ['papajohns'],
                        ['dairyqueen'],
                        ['baskinrobbins'],
                        ['littlecaesars'],
                        ['krispykreme'],
                        ['wendys']
                    ]
                },
                //Nightlife - 5813
                {
                    id: '5813',
                    syn: [
                        ['beer', 'pub', 'disco', 'cocktaillounge', 'nightclub', 'beerhouse', 'tavern', 'taproom', 'cocktail', 'wine']
                    ]
                },
                //Shopping - 6512
                {
                    id: '5813',
                    syn: [
                        ['mall', 'shoppingcenter', 'stripmall', 'marketplace', 'store'],
                        ['walmart', 'walmartsuperstore'],
                        ['costco'],
                        ['thehomedepot', 'homedepot'],
                        ['walgreens'],
                        ['cvscaremark'],
                        ['target'],
                        ['lowes'],
                        ['macys'],
                        ['bestbuy'],
                        ['sears'],
                        ['kohls'],
                        ['meijer'],
                        ['nordstrom'],
                        ['gap']
                    ]
                },
                //Grocery Store - 5400
                {
                    id: '5400',
                    syn: [
                        ['grocerystore', 'groceries', 'food'],
                        ['fredmeyer'],
                        ['safeway'],
                        ['tescos'],
                        ['wholefoods'],
                        ['tescos'],
                        ['aldi'],
                        ['traderjoes'],
                        ['kroger'],
                        ['costco'],
                        ['albertsons'],
                        ['walmart'],
                        ['marksandspencer']
                    ]
                },
                //Clothing Store - 9537
                {
                    id: '9537',
                    syn: [
                        ['clothingstore', 'store'],
                        ['walmart', 'walmartsuperstore'],
                        ['costco'],
                        ['target'],
                        ['macys'],
                        ['sears'],
                        ['kohls'],
                        ['meijer'],
                        ['nordstrom'],
                        ['gap']
                    ]
                },
                //Department Store - 9545
                {
                    id: '9545',
                    syn: [
                        ['departmentstore', 'store'],
                        ['walmart', 'walmartsuperstore'],
                        ['target'],
                        ['macys'],
                        ['sears'],
                        ['kohls'],
                        ['meijer'],
                        ['nordstrom']
                    ]
                },
                //Rental Car Agency - 7510
                {
                    id: '7510',
                    syn: [
                        ['carrentalagency', 'carrental', 'rentalcaragency'],
                        ['hertzrentacar', 'hertzcarrental'],
                        ['enterpriserentacar', 'enterprisecarrental'],
                        ['budgetrentacar', 'budgetcarrental'],
                        ['aviscarrental'],
                        ['alamorentacar']
                    ]
                },
                //Hotel - 7011
                {
                    id: '7011',
                    syn: [
                        ['motel', 'inn', 'hostel', 'lodging', 'lodge', 'accommodation'],
                        ['marriottinternational', 'marriott'],
                        ['wyndham', 'wyndhamhotel'],
                        ['intercontientalhotel', 'intercontiental']
                    ]
                },
                //Cinema - 7832
                {
                    id: '7832',
                    syn: [
                        ['cinema', 'movie', 'theater', 'theatre'],
                        ['cineplexodeon', 'cineplex'],
                        ['cinemarktheater', 'cinemark'],
                        ['ipictheater', 'ipic']
                    ]
                },
                //Auto Service & Maintenance - 7538
                {
                    id: '7538',
                    syn: [
                        ['garage', 'autorepair', 'servicestation', 'autoservice', 'automaintenance']
                    ]
                },
                //Hospital - 8060
                {
                    id: '8060',
                    syn: [
                        ['medical', 'emergencyroom', 'hospital', 'clinic', 'walkinclinic']
                    ]
                },
                //Higher Education - 8200
                {
                    id: '8200',
                    syn: [
                        ['university', 'universities', 'college', 'school', 'education']
                    ]
                },
                //Convenience Store - 9535
                {
                    id: '9535',
                    syn: [
                        ['conveniencestore'],
                        ['7eleven']
                    ]
                },
                //Pharmacy - 9565
                {
                    id: '9565',
                    syn: [
                        ['pharmacies', 'pharmacy', 'medicine'],
                        ['cvspharmacies', 'cvspharmacy', 'cvs'],
                        ['walgreens'],
                        ['riteaidpharmacies', 'riteaidpharmacy']
                    ]
                },
                //Place of Worship - 9992
                {
                    id: '9992',
                    syn: [
                        ['churches', 'mosques', 'temples', 'synagogues', 'shrines', 'chapels', 'parhishes']
                    ]
                },
                //Coffee Shop - 9996            
                {
                    id: '9996',
                    syn: [
                        ['coffee', 'cafe', 'tea', 'caffé', 'coffeeshop', 'donutshop'],
                        ['dunkindonuts'],
                        ['starbucks'],
                        ['timhortons'],
                        ['costacoffeeshops']
                    ]
                },
                //Winery - 2084
                { id: '2084', syn: [['winery', 'wine']] },
                //ATM - 3578
                { id: '3578', syn: [['atm']] },
                //Train Station - 4013
                { id: '4013', syn: [['trainstation', 'trains']] },
                //Commuter Rail Station - 4100
                { id: '4100', syn: [['commuterrailstation']] },
                //Bus Station - 4170
                {
                    id: '4170', syn: [['busstation', 'busstop']]
                },
                //Named Place - 4444
                { id: '4444', syn: [['namedplace']] },
                //Ferry Terminal - 4482
                { id: '4482', syn: [['ferryterminal']] },
                //Marina - 4493
                { id: '4493', syn: [['marina']] },
                //Public Sports Airport - 4580
                { id: '4580', syn: [['publicsportsairport']] },
                //Airport - 4581
                {
                    id: '4581', syn: [['airport', 'airfield']]
                },
                //Business Facility - 5000
                { id: '5000', syn: [['businessfacility']] },
                //Auto Dealerships - 5511
                { id: '5511', syn: [['autodealerships']] },
                //Auto Dealership-Used Cars - 5512
                { id: '5512', syn: [['autodealershipusedcars', 'cardealership', 'dealership', 'usedcars', 'usedcardealership']] },
                //Motorcycle Dealership - 5571
                { id: '5571', syn: [['motorcycledealership']] },
                //Historical Monument - 5999
                { id: '5999', syn: [['historicalmonument']] },
                //Bank - 6000
                { id: '6000', syn: [['bank']] },
                //Ski Resort - 7012
                { id: '7012', syn: [['skiresort']] },
                //Other Accommodation - 7013
                { id: '7013', syn: [['otheraccommodation']] },
                //Ski Lift - 7014
                { id: '7014', syn: [['skilift']] },
                //Tourist Information - 7389
                { id: '7389', syn: [['touristinformation']] },
                //Parking Lot - 7520
                { id: '7520', syn: [['parkinglot']] },
                //Parking Garage/House - 7521
                { id: '7521', syn: [['parkinggaragehouse']] },
                //Park & Ride - 7522
                { id: '7522', syn: [['park&ride']] },
                //Rest Area - 7897
                { id: '7897', syn: [['restarea']] },
                //Performing Arts - 7929
                { id: '7929', syn: [['performingarts']] },
                //Bowling Centre - 7933
                { id: '7933', syn: [['bowlingcentre']] },
                //Sports Complex - 7940
                { id: '7940', syn: [['sportscomplex']] },
                //Park/Recreation Area - 7947
                { id: '7947', syn: [['parkrecreationarea']] },
                //Casino - 7985
                { id: '7985', syn: [['casino']] },
                //Convention/Exhibition Centre - 7990
                { id: '7990', syn: [['conventionexhibitioncentre']] },
                //Golf Course - 7992
                { id: '7992', syn: [['golfcourse']] },
                //Civic/Community Centre - 7994
                { id: '7994', syn: [['civiccommunitycentre', 'communitycentre', 'communitycenter']] },
                //Amusement Park - 7996
                { id: '7996', syn: [['amusementpark']] },
                //Sports Centre - 7997
                { id: '7997', syn: [['sportscentre']] },
                //Ice Skating Rink - 7998
                { id: '7998', syn: [['iceskatingrink']] },
                //Tourist Attraction - 7999
                { id: '7999', syn: [['touristattraction']] },
                //School - 8211
                { id: '8211', syn: [['school', 'gradeschool', 'elementaryschool', 'middleschool']] },
                //Library - 8231
                { id: '8231', syn: [['library', 'books']] },
                //Museum - 8410
                { id: '8410', syn: [['museum']] },
                //Automobile Club - 8699
                { id: '8699', syn: [['automobileclub']] },
                //City Hall - 9121
                { id: '9121', syn: [['cityhall']] },
                //Court House - 9211
                { id: '9211', syn: [['courthouse']] },
                //Police Station - 9221
                { id: '9221', syn: [['policestation']] },
                //Campground - 9517
                { id: '9517', syn: [['campground']] },
                //Truck Stop/Plaza - 9522
                { id: '9522', syn: [['truckstopplaza', 'truckstop']] },
                //Government Office - 9525
                { id: '9525', syn: [['governmentoffice']] },
                //Post Office - 9530
                { id: '9530', syn: [['postoffice']] },
                //Home Specialty Store - 9560
                { id: '9560', syn: [['homespecialtystore']] },
                //Specialty Store - 9567
                { id: '9567', syn: [['specialtystore']] },
                //Sporting Goods Store - 9568
                { id: '9568', syn: [['sportinggoodsstore']] },
                //Medical Service - 9583
                { id: '9583', syn: [['medicalservice']] },
                //Residential Area/Building - 9590
                { id: '9590', syn: [['residentialareabuilding']] },
                //Cemetery - 9591
                { id: '9591', syn: [['cemetery']] },
                //Highway Exit - 9592
                { id: '9592', syn: [['highwayexit']] },
                //Transportation Service - 9593
                { id: '9593', syn: [['transportationservice']] },
                //Weigh Station - 9710
                { id: '9710', syn: [['weighstation']] },
                //Cargo Centre - 9714
                { id: '9714', syn: [['cargocentre']] },
                //Military Base - 9715
                { id: '9715', syn: [['militarybase']] },
                //Animal Park - 9718
                { id: '9718', syn: [['animalpark']] },
                //Truck Dealership - 9719
                { id: '9719', syn: [['truckdealership', 'truck']] },
                //Home Improvement & Hardware Store - 9986
                {
                    id: '9986', syn: [['homeimprovement', 'hardwarestore']]
                },
                //Consumer Electronics Store - 9987
                {
                    id: '9987',
                    syn: [
                        ['consumerelectronicsstore', 'electronics'],
                        ['bestbuy'],
                        ['att']
                    ]
                },
                //Office Supply & Services Store - 9988
                {
                    id: '9988', syn: [
                        ['officesupply', 'officesupplies'],
                        ['staples']
                    ]
                },
                //Industrial Zone - 9991
                { id: '9991', syn: [['industrialzone']] },
                //Embassy - 9993
                { id: '9993', syn: [['embassy']] },
                //County Council - 9994
                { id: '9994', syn: [['countycouncil']] },
                //Bookstore - 9995
                { id: '9995', syn: [['bookstore']] },
                //Hamlet - 9998
                { id: '9998', syn: [['hamlet']] },
                //Border Crossing - 9999
                { id: '9999', syn: [['bordercrossing']] }
            ];
            /**
             * A search manager that performs poi/business search queries.
             */
            var PoiSearchManager = (function () {
                /**
                 * A search manager that performs business search queries.
                 * @param map A map instance to retreive a session key from and use to perform a query.
                 */
                function PoiSearchManager(map) {
                    this._navteqNA = 'https://spatial.virtualearth.net/REST/v1/data/f22876ec257b474b82fe2ffcb8393150/NavteqNA/NavteqPOIs';
                    this._navteqEU = 'https://spatial.virtualearth.net/REST/v1/data/c2ae584bbccc4916a0acf75d1e6947b4/NavteqEU/NavteqPOIs';
                    //Words used to connect a "what" with a "where".
                    this._connectingWords = [" in ", " near ", " around ", " by ", "nearby"];
                    this._naPhoneRx = /([0-9]{3}-)([0-9]{3})([0-9]{4})/gi;
                    this._ukPhoneRx = /([0-9]{2}-)([0-9]{4})([0-9]{4})/gi;
                    this._fuzzyRx = /([-,.'\s]|s$)/gi;
                    this._map = map;
                }
                /**
                * Performs a business search based on the specified request options and returns the results to the request options callback function.
                * @param request The business search request.
                */
                PoiSearchManager.prototype.search = function (request) {
                    var _this = this;
                    if ((request.query && request.what) || !request.callback) {
                        if (this.debug) {
                            console.log('Invalid request');
                        }
                        return;
                    }
                    if (!this._searchManager) {
                        this._searchManager = new Microsoft.Maps.Search.SearchManager(this._map);
                    }
                    var self = this;
                    if (!this._sessionKey) {
                        this._map.getCredentials(function (c) {
                            self._sessionKey = c;
                            self.search(request);
                        });
                        return;
                    }
                    request.count = (request.count > 0 && request.count <= 25) ? request.count : 25;
                    request.searchRadius = (request.searchRadius > 0 && request.searchRadius <= 250) ? request.searchRadius : 25;
                    request.matchConfidence = request.matchConfidence || Microsoft.Maps.Search.MatchConfidence.medium;
                    if (request.query) {
                        this._splitQueryString(request);
                    }
                    if (request.what) {
                        request.what = request.what.toLowerCase().replace('-', ' ').replace("'", '');
                    }
                    if (request.where) {
                        if (request.where === 'me') {
                            //Request the user's location
                            navigator.geolocation.getCurrentPosition(function (position) {
                                var loc = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
                                self._performPoiSearch(request, [{
                                        address: null,
                                        bestView: new Microsoft.Maps.LocationRect(loc, 0.001, 0.001),
                                        entityType: 'userLocation',
                                        location: loc,
                                        locations: null,
                                        matchCode: null,
                                        matchConfidence: null,
                                        name: null
                                    }]);
                            });
                        }
                        else {
                            this._searchManager.geocode({
                                where: request.where,
                                callback: function (r) {
                                    if (r && r.results && r.results.length > 0) {
                                        _this._performPoiSearch(request, r.results);
                                    }
                                    else if (request.callback) {
                                        request.callback({
                                            responseSummary: {
                                                errorMessage: "No geocode results for 'where'."
                                            }
                                        }, request.userData);
                                    }
                                }
                            });
                        }
                    }
                    else {
                        this._performPoiSearch(request, null);
                    }
                };
                /**
                 * Splits a free form query string into a what and where values.
                 * @param request The request containing the free form query string.
                 */
                PoiSearchManager.prototype._splitQueryString = function (request) {
                    var query = request.query.toLowerCase();
                    if (query.indexOf('find ') === 0 || query.indexOf('get ') === 0) {
                        query = query.replace('find ', '').replace('get ', '');
                    }
                    for (var i = 0; i < this._connectingWords.length; i++) {
                        if (query.indexOf(this._connectingWords[i]) > 0) {
                            var vals = query.split(this._connectingWords[i]);
                            if (vals.length >= 2) {
                                request.what = vals[0].trim();
                                request.where = vals[1].trim();
                                break;
                            }
                            else if (vals.length == 1) {
                                request.what = vals[0].trim();
                                break;
                            }
                        }
                    }
                    if (!request.what) {
                        request.what = request.query;
                    }
                };
                /**
                 * Searches for business points of interests.
                 * @param request The search request.
                 * @param places An array of geocoded locations based on the "where" value of the request.
                 */
                PoiSearchManager.prototype._performPoiSearch = function (request, places) {
                    var _this = this;
                    var searchRegion;
                    var alternateSearchRegions;
                    if (places && places.length > 0) {
                        searchRegion = places[0];
                        if (places.length > 1) {
                            alternateSearchRegions = places.slice(1);
                        }
                    }
                    else {
                        searchRegion = {
                            bestView: this._map.getBounds(),
                            entityType: 'map',
                            location: this._map.getCenter()
                        };
                    }
                    var self = this;
                    var result = {
                        alternateSearchRegions: alternateSearchRegions,
                        searchRegion: searchRegion,
                        searchResults: [],
                        bestView: searchRegion.bestView
                    };
                    var what = null;
                    var whatRx = null;
                    var synonyms = null;
                    var filter = null;
                    if (request.what) {
                        //Remove dashes, single quotes, and trailing "s" from what and name values.
                        what = request.what.replace(this._fuzzyRx, '');
                        if (what.indexOf('restaurant') > 0) {
                            what = what.replace('restaurant', '');
                        }
                        if (what.indexOf('cuisine') > 0) {
                            what = what.replace('cuisine', '');
                        }
                        if (what.indexOf('food') > 0) {
                            what = what.replace('food', '');
                        }
                        synonyms = this._getSynonums(what);
                        filter = this._createPoiFilter(what, synonyms);
                        whatRx = new RegExp('^(.*\\s)?' + what + '(\\s.*)?$', 'gi');
                    }
                    if (this.debug) {
                        console.log('Data source: ' + ((searchRegion.location.longitude < -26) ? 'NavteqNA' : 'NavteqEU'));
                        if (filter) {
                            console.log('Filter: ' + filter.toString());
                        }
                    }
                    //Request the top 250 results for the query and then filter them down afterwards.
                    Microsoft.Maps.SpatialDataService.QueryAPIManager.search({
                        top: 250,
                        queryUrl: (searchRegion.location.longitude < -26) ? this._navteqNA : this._navteqEU,
                        inlineCount: true,
                        spatialFilter: {
                            spatialFilterType: 'nearby',
                            location: searchRegion.location,
                            radius: 25
                        },
                        filter: filter
                    }, this._map, function (r, inlineCount) {
                        if (r && r.length > 0) {
                            var locs = [];
                            var confidence;
                            if (what && _this.debug) {
                                console.log('Filtered out results\r\nEntityTypeID\tName');
                            }
                            for (var i = 0; i < r.length; i++) {
                                var s = r[i];
                                if (what) {
                                    confidence = _this._fuzzyPoiMatch(whatRx, r[i].metadata, synonyms);
                                    //Filter results client side.
                                    if (confidence === request.matchConfidence ||
                                        request.matchConfidence === Microsoft.Maps.Search.MatchConfidence.low ||
                                        request.matchConfidence === Microsoft.Maps.Search.MatchConfidence.unknown ||
                                        (request.matchConfidence === Microsoft.Maps.Search.MatchConfidence.medium && confidence === Microsoft.Maps.Search.MatchConfidence.high)) {
                                        self._convertSearchResult(r[i]);
                                        s.metadata.matchConfidence = confidence;
                                        result.searchResults.push(s);
                                        locs.push(s.getLocation());
                                    }
                                    else if (_this.debug) {
                                        console.log(r[i].metadata.EntityTypeID + '\t' + r[i].metadata.Name);
                                    }
                                }
                                else {
                                    self._convertSearchResult(r[i]);
                                    s.metadata.matchConfidence = Microsoft.Maps.Search.MatchConfidence.unknown;
                                    result.searchResults.push(s);
                                    locs.push(s.getLocation());
                                }
                                if (result.searchResults.length >= request.count) {
                                    break;
                                }
                            }
                            if (locs.length > 1) {
                                result.bestView = Microsoft.Maps.LocationRect.fromLocations(locs);
                            }
                            else if (locs.length === 1) {
                                result.bestView = new Microsoft.Maps.LocationRect(locs[0], 0.001, 0.001);
                            }
                        }
                        if (request.callback) {
                            request.callback(result, request.userData);
                        }
                    });
                };
                /**
                 * Performs a fuzzy match between the "what" parameter of the request and the metadata of a result.
                 * @param what The "what" parameter of the request.
                 * @param metadata The metadata of a result.
                 */
                PoiSearchManager.prototype._fuzzyPoiMatch = function (whatRx, metadata, synonyms) {
                    //Remove dashes, single quotes, and trailing "s" from name value.
                    var lowerName = (metadata.Name) ? metadata.Name.toLowerCase().replace(this._fuzzyRx, '') : '';
                    var eid = metadata.EntityTypeID;
                    //Check to see if the name matches the what query.
                    if (whatRx.test(lowerName)) {
                        return Microsoft.Maps.Search.MatchConfidence.high;
                    }
                    if (synonyms) {
                        for (var i = 0; i < synonyms.length; i++) {
                            for (var j = 0; j < synonyms[i].syn.length; j++) {
                                for (var k = 0; k < synonyms[i].syn[j].length; k++) {
                                    if (lowerName.indexOf(synonyms[i].syn[j][k]) > -1) {
                                        return Microsoft.Maps.Search.MatchConfidence.high;
                                    }
                                }
                            }
                        }
                    }
                    return Microsoft.Maps.Search.MatchConfidence.low;
                };
                /**
                 * Creates a filter for the Bing Spatial Data Services Query API based on the "what" parameter of the request.
                 * @param what The "what" parameter of the request.
                 */
                PoiSearchManager.prototype._createPoiFilter = function (what, synonyms) {
                    if (what) {
                        var ids = [];
                        if (synonyms) {
                            for (var i = 0; i < synonyms.length; i++) {
                                ids.push(synonyms[i].id);
                            }
                        }
                        if (ids.length > 0) {
                            return new Microsoft.Maps.SpatialDataService.Filter('EntityTypeID', Microsoft.Maps.SpatialDataService.FilterCompareOperator.isIn, ids);
                        }
                    }
                    return null;
                };
                /**
                 * Converts a result from a NAVTEQ data source into a search result.
                 * @param shape The shape result from the NAVTEQ data source.
                 */
                PoiSearchManager.prototype._convertSearchResult = function (shape) {
                    var m = shape.metadata;
                    var phone = m.Phone || '';
                    if (this._naPhoneRx.test(m.Phone)) {
                        phone = m.Phone.replace(this._naPhoneRx, '$1$2-$3');
                    }
                    else if (this._ukPhoneRx.test(m.Phone)) {
                        phone = m.Phone.replace(this._ukPhoneRx, '$1$2-$3');
                    }
                    var metadata = {
                        id: m.EntityID,
                        entityTypeId: m.EntityTypeID,
                        address: m.AddressLine,
                        adminDistrict: m.AdminDistrict,
                        district: m.AdminDistrict2,
                        city: m.Locality,
                        country: m.CountryRegion,
                        postalCode: m.PostalCode,
                        name: m.DisplayName,
                        phone: phone,
                        matchConfidence: Microsoft.Maps.Search.MatchConfidence.unknown,
                        distance: m.__distance
                    };
                    shape.metadata = metadata;
                };
                /**
                 * Finds all synonums associated with the "what" value.
                 * @param what What the user is looking for.
                 */
                PoiSearchManager.prototype._getSynonums = function (what) {
                    var synonums = [];
                    var syns = Microsoft.Maps.Search._entityTypeSynonyms;
                    for (var i = 0; i < syns.length; i++) {
                        var synonum = {
                            id: syns[i].id,
                            syn: []
                        };
                        for (var j = 0; j < syns[i].syn.length; j++) {
                            if (syns[i].syn[j].indexOf(what) > -1) {
                                synonum.syn.push(syns[i].syn[j]);
                            }
                        }
                        if (synonum.syn.length > 0) {
                            synonums.push(synonum);
                        }
                    }
                    return synonums;
                };
                return PoiSearchManager;
            }());
            Search.PoiSearchManager = PoiSearchManager;
        })(Search = Maps.Search || (Maps.Search = {}));
    })(Maps = Microsoft.Maps || (Microsoft.Maps = {}));
})(Microsoft || (Microsoft = {}));
//Load dependancies
Microsoft.Maps.loadModule(['Microsoft.Maps.Search', 'Microsoft.Maps.SpatialDataService'], function () {
    Microsoft.Maps.moduleLoaded('PoiSearchModule');
});
//# sourceMappingURL=PoiSearchModule.js.map