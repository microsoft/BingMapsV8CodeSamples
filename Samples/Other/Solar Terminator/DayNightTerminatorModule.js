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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../Common/typings/MicrosoftMaps/Microsoft.Maps.d.ts"/>
var DayNightTerminator = (function (_super) {
    __extends(DayNightTerminator, _super);
    /**********************
    * Constructor
    ***********************/
    /**
     * @contructor
     */
    function DayNightTerminator(dateTime, options) {
        _super.call(this, [], options || {
            strokeColor: 'rgba(0,0,0,0)',
            fillColor: 'rgba(0,0,0,0.5)'
        });
        this._R2D = 180 / Math.PI;
        this._D2R = Math.PI / 180;
        this.setLocations(this.computeLocations());
    }
    /**********************
    * Public Functions
    ***********************/
    DayNightTerminator.prototype.getDateTime = function () {
        return this.dateTime;
    };
    DayNightTerminator.prototype.setDateTime = function (dateTime) {
        this.dateTime = dateTime;
        this.setLocations(this.computeLocations());
    };
    /**********************
    * Private Functions
    ***********************/
    DayNightTerminator.prototype.computeLocations = function () {
        this.dateTime = this.dateTime || new Date();
        var julianDay = this.getJulian(this.dateTime);
        var gst = this.getGMST(this.dateTime);
        var latLng = [];
        var ha, lat, lng;
        var sunEclPos = this._sunEclipticPosition(julianDay);
        var eclObliq = this._eclipticObliquity(julianDay);
        var sunEqPos = this._sunEquatorialPosition(sunEclPos.lambda, eclObliq);
        for (var i = 0; i <= 360; i++) {
            lng = -180 + i;
            ha = this._hourAngle(lng, sunEqPos, gst);
            lat = this._latitude(ha, sunEqPos);
            latLng[i + 1] = new Microsoft.Maps.Location(lat, lng);
        }
        if (sunEqPos.delta < 0) {
            latLng[0] = new Microsoft.Maps.Location(90, -179.999999);
            latLng[latLng.length] = new Microsoft.Maps.Location(90, 179.999999);
        }
        else {
            latLng[0] = new Microsoft.Maps.Location(-90, -179.999999);
            latLng[latLng.length] = new Microsoft.Maps.Location(-90, 179.999999);
        }
        return latLng;
    };
    DayNightTerminator.prototype.getJulian = function (date) {
        /* Calculate the present UTC Julian Date. Function is valid after
         * the beginning of the UNIX epoch 1970-01-01 and ignores leap
         * seconds. */
        return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
    };
    DayNightTerminator.prototype.getGMST = function (date) {
        /* Calculate Greenwich Mean Sidereal Time according to
            https://aa.usno.navy.mil/faq/docs/GAST.php */
        var julianDay = this.getJulian(date);
        var d = julianDay - 2451545.0;
        // Low precision equation is good enough for our purposes.
        return (18.697374558 + 24.06570982441908 * d) % 24;
    };
    DayNightTerminator.prototype._sunEclipticPosition = function (julianDay) {
        /* Compute the position of the Sun in ecliptic coordinates at
           julianDay.  Following
           https://en.wikipedia.org/wiki/Position_of_the_Sun */
        // Days since start of J2000.0
        var n = julianDay - 2451545.0;
        // mean longitude of the Sun
        var L = 280.460 + 0.9856474 * n;
        L %= 360;
        // mean anomaly of the Sun
        var g = 357.528 + 0.9856003 * n;
        g %= 360;
        // ecliptic longitude of Sun
        var lambda = L + 1.915 * Math.sin(g * this._D2R) +
            0.02 * Math.sin(2 * g * this._D2R);
        // distance from Sun in AU
        var R = 1.00014 - 0.01671 * Math.cos(g * this._D2R) -
            0.0014 * Math.cos(2 * g * this._D2R);
        return { "lambda": lambda, "R": R };
    };
    DayNightTerminator.prototype._eclipticObliquity = function (julianDay) {
        // Following the short term expression in
        // https://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29
        var n = julianDay - 2451545.0;
        // Julian centuries since J2000.0
        var T = n / 36525;
        var epsilon = 23.43929111 -
            T * (46.836769 / 3600
                - T * (0.0001831 / 3600
                    + T * (0.00200340 / 3600
                        - T * (0.576e-6 / 3600
                            - T * 4.34e-8 / 3600))));
        return epsilon;
    };
    DayNightTerminator.prototype._sunEquatorialPosition = function (sunEclLng, eclObliq) {
        /* Compute the Sun's equatorial position from its ecliptic
         * position. Inputs are expected in degrees. Outputs are in
         * degrees as well. */
        var alpha = Math.atan(Math.cos(eclObliq * this._D2R)
            * Math.tan(sunEclLng * this._D2R)) * this._R2D;
        var delta = Math.asin(Math.sin(eclObliq * this._D2R)
            * Math.sin(sunEclLng * this._D2R)) * this._R2D;
        var lQuadrant = Math.floor(sunEclLng / 90) * 90;
        var raQuadrant = Math.floor(alpha / 90) * 90;
        alpha = alpha + (lQuadrant - raQuadrant);
        return { "alpha": alpha, "delta": delta };
    };
    DayNightTerminator.prototype._hourAngle = function (lng, sunPos, gst) {
        /* Compute the hour angle of the sun for a longitude on
         * Earth. Return the hour angle in degrees. */
        var lst = gst + lng / 15;
        return lst * 15 - sunPos.alpha;
    };
    DayNightTerminator.prototype._latitude = function (ha, sunPos) {
        /* For a given hour angle and sun position, compute the
         * latitude of the terminator in degrees. */
        var lat = Math.atan(-Math.cos(ha * this._D2R) /
            Math.tan(sunPos.delta * this._D2R)) * this._R2D;
        return lat;
    };
    return DayNightTerminator;
}(Microsoft.Maps.Polygon));
//Call the module loaded function.
Microsoft.Maps.moduleLoaded('DayNightTerminatorModule');
//# sourceMappingURL=DayNightTerminatorModule.js.map