// Initialize your app
var myApp = new Framework7({
    pushState: true,
    modalTitle: 'Cordova API Demo',
    // Enable Material theme
    material: true,
    swipePanel: 'left',
    notificationHold: 1500,
    cache: false
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {});

var loadInitialPage = function () {
    if (!mainView.activePage) {
        mainView.router.load({
            url: 'battery.html',
            animatePages: false
        });
    }
};

var isCordova = false;
if (typeof window.PhoneGap != 'undefined' || typeof window.Cordova != 'undefined' || typeof window.cordova != 'undefined') {
    isCordova = true;
    document.addEventListener('deviceready', function () {
        loadInitialPage();
        if (navigator.splashscreen) navigator.splashscreen.hide();
    }, false);
} else {
    loadInitialPage();
}


//round a number
var round = function (num, digit) {
    if (digit === undefined) digit = 3;
    var result = Math.round(num * Math.pow(10, digit)) / Math.pow(10, digit);
    return result;
};
var myPrompt = function(title, message, defaultValue, callbackOk, callbackCancel) {
    if(navigator.notification) {
        navigator.notification.prompt(message || '', function(obj){
            if(obj.buttonIndex == 2) {
                if(callbackOk) callbackOk(obj.input1);
            }
            else {
                if(callbackCancel) callbackCancel(obj.input1);
            }
        }, title || '', ["Cancel", "OK"], defaultValue || '');
    }
    else {
        myApp.prompt('Please enter the name', 'New Folder', callbackOk, callbackCancel);
    }
};

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('battery', function (page) {
    var el = $$(page.container).find('.content-block-inner');
    var onBatteryStatus = function (status) {
        el.prepend('<div>' + "Level: " + status.level + " isPlugged: " + status.isPlugged + '</div>');
    }
    var onBatteryLow = function (status) {
        el.prepend('<div>' + "Battery Level Low " + status.level + "%" + '</div>');
    }
    var onBatteryCritical = function (status) {
        el.prepend('<div>' + "Battery Level Critical " + status.level + "%\nRecharge Soon!" + '</div>');
    }

    window.addEventListener("batterystatus", onBatteryStatus, false);
    window.addEventListener("batterylow", onBatteryLow, false);
    window.addEventListener("batterycritical", onBatteryCritical, false);

    myApp.onPageBeforeRemove('battery', function (page) {
        window.removeEventListener("batterystatus", onBatteryStatus, false);
        window.removeEventListener("batterylow", onBatteryLow, false);
        window.removeEventListener("batterycritical", onBatteryCritical, false);
    });
});

myApp.onPageInit('camera', function (page) {
    var onPhotoSuccess = function (imageURI) {
        console.log('camera onPhotoSuccess', imageURI);
        var cameraImage = $$(page.container).find('.camera-image');
        cameraImage.css('visibility', 'visible').attr('src', imageURI);
    };
    $$(page.container).find('.btn-camera').on('click', function () {
        navigator.camera.getPicture(onPhotoSuccess, function (ex) {
            myApp.alert("Camera Error!");
        }, {
            quality: 50,
            sourceType: navigator.camera.PictureSourceType.CAMERA,
            destinationType: navigator.camera.DestinationType.FILE_URI
        });
    });
    $$(page.container).find('.btn-library').on('click', function () {
        navigator.camera.getPicture(onPhotoSuccess, function (ex) {
            myApp.alert("Camera Error!");
        }, {
            quality: 50,
            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
            destinationType: navigator.camera.DestinationType.FILE_URI
        });
    });
});

myApp.onPageInit('console', function (page) {
    $$(page.container).find('.button').on('click', function (e) {
        var type = $$(e.target).attr('data-type');
        if (!(type in console)) {
            myApp.alert('console do not support ' + type + ' function');
            return;
        }
        if (type == 'log' || type == 'error' || type == 'exception' || type == 'warn' || type == 'info' || type == 'debug') {
            console[type]('this is console.' + type);
        } else if (type == 'assert') {
            var a = 2;
            console.assert(a == 3, "Assertion of 'a == 3' failed");
        } else if (type == 'dir') {
            console.dir({
                "name": "miao",
                "age": 2,
                "score": [6, 8, 7]
            });
        } else if (type == 'dirxml') {
            console.dirxml(e.target);
        } else if (type == 'time' || type == 'timeEnd') {
            console[type]('label');
        } else if (type == 'table') {
            console.table([{
                    name: "JavaScript",
                    fileExtension: ".js"
                },
                {
                    name: "TypeScript",
                    fileExtension: ".ts"
                },
                {
                    name: "CoffeeScript",
                    fileExtension: ".coffee"
                }
            ]);
        }
    });
});


myApp.onPageInit('contacts', function (page) {
    var form = $$(page.container).find('form');

    // save to contacts
    $$(page.container).find('.btn-save').on('click', function () {
        var data = myApp.formToJSON(form);
        console.log(data);

        var contact = navigator.contacts.create();
        contact.displayName = data.name || '';
        contact.nickname = data.name || ''; // specify both to support all devices

        if (data.phone) {
            var phoneNumbers = [];
            phoneNumbers[0] = new ContactField('mobile', data.phone, true);
            contact.phoneNumbers = phoneNumbers;
        }
        if (data.email) {
            var emails = [];
            emails[0] = new ContactField('email', data.email, true);
            contact.emails = emails;
        }
        if (data.birthday) {
            contact.birthday = new Date(data.birthday);
        }
        contact.note = data.note || '';

        contact.save(function (contact) {
            myApp.addNotification({
                message: "Save Success"
            });
        }, function (err) {
            myApp.alert("Save Failed: " + err);
        });
    });

    //pick a contact
    $$(page.container).find('.btn-pick').on('click', function () {
        navigator.contacts.pickContact(function (contact) {
            console.log('The following contact has been selected:' + JSON.stringify(contact));
            form[0].reset();

            var data = {
                name: contact.displayName || contact.nickname || '',
                note: contact.note || ''
            };
            var d = contact.birthday;
            if (d && (d instanceof Date)) {
                var str = d.getFullYear() + '-',
                    month = (d.getMonth() + 1).toString();
                if (month.length < 2) {
                    str += '0';
                }
                str += month + '-';
                str += d.getDate();

                data.birthday = str;
            }
            var phones = contact.phoneNumbers;
            if (phones && phones.length) {
                data.phone = phones[0].value;
            }
            var emails = contact.emails;
            if (emails && emails.length) {
                data.phone = emails[0].value;
            }
            console.log('Form Data: ' + JSON.stringify(data));
            myApp.formFromJSON(form, data);
        }, function (err) {
            myApp.alert('Error: ' + err);
        });
    });
});

myApp.onPageInit('searchcontacts', function (page) {
    var searchbarDom = $$(page.container).find('.searchbar'),
        foundDom = $$(page.container).find('.searchbar-found');

    myApp.onPageAfterAnimation('searchcontacts', function () {
        searchbarDom.find('input[type="search"]')[0].focus();
    });

    var searchbar = myApp.searchbar(searchbarDom, {
        customSearch: true,
        onSearch: function (s, q) {
            var search = s.query;
            if (search.trim() === '') {
                foundDom.html('');
                return;
            }
            var options = new ContactFindOptions();
            options.filter = search;
            options.multiple = true;
            options.desiredFields = ['id', 'displayName', 'nickname', 'name', 'phoneNumbers'];
            options.hasPhoneNumber = true;
            var fields = ['displayName', 'nickname', 'name', 'phoneNumbers'];
            navigator.contacts.find(fields, function onSuccess(contacts) {
                var html = '';
                $$.each(contacts, function (i, c) {
                    console.log(JSON.stringify(c));
                    var phones = c.phoneNumbers,
                        phone = '';
                    if (phones && phones.length) {
                        phone = phones[0].value;
                    }
                    console.log(c.displayName, c.nickname, c.name);
                    html += [
                        '<li class="item-content">',
                        '<div class="item-inner">',
                        '<div class="item-title">' + (c.displayName || c.nickname) + '</div>',
                        '<div class="item-subtitle">' + phone + '</div>',
                        '</div>',
                        '</li>'
                    ].join('')
                });
                foundDom.html('<ul>' + html + '</ul>');

            }, function onError(err) {
                console.log(err);
            }, options);
        },
        onClear: function (s) {
            foundDom.html('');
        }
    });
});

myApp.onPageInit('device', function (page) {
    var ct = $$(page.container);
    if (window.device) {
        ct.find(".model").html(device.model);
        ct.find(".manufacturer").html(device.manufacturer);
        ct.find(".pgversion").html(device.cordova);
        ct.find(".platform").html(device.platform);
        ct.find(".uuid").html(device.uuid);
        ct.find(".serial").html(device.serial);
        ct.find(".version").html(device.version);
    }
    if (window.screen) {
        ct.find(".width").html(screen.width);
        ct.find(".height").html(screen.height);
        ct.find(".availwidth").html(screen.availWidth);
        ct.find(".availheight").html(screen.availHeight);
        ct.find(".colorDepth").html(screen.colorDepth);
    }

});


myApp.onPageInit('devicemotion', function (page) {
    var ct = $$(page.container),
        oldAccel = {
            x: null,
            y: null,
            z: null
        },
        shakeBoundary = 3,
        watchId = null,
        notify;
    var updateAcceleration = function (acceleration) {
        ct.find('.accel-x > span').html(round(acceleration.x));
        ct.find('.accel-y > span').html(round(acceleration.y));
        ct.find('.accel-z > span').html(round(acceleration.z));
        ct.find('.timestamp > span').html(acceleration.timestamp);
    };
    ct.find('.btn-toggle').on('click', function () {
        if (watchId) {
            navigator.accelerometer.clearWatch(watchId);
            if (notify) myApp.closeNotification(notify);
            updateAcceleration({
                x: "",
                y: "",
                z: "",
                timestamp: ""
            });
            watchId = null;
        } else {
            var options = {
                frequency: 300
            };
            watchId = navigator.accelerometer.watchAcceleration(
                function (accel) {
                    updateAcceleration(accel);

                    var changes = {};
                    if (oldAccel.x !== null) {
                        changes.x = Math.abs(oldAccel.x - accel.x);
                        changes.y = Math.abs(oldAccel.y - accel.y);
                        changes.z = Math.abs(oldAccel.z - accel.z);
                    }
                    if (changes.x > shakeBoundary && changes.y > shakeBoundary && changes.z > shakeBoundary) {
                        myApp.addNotification({
                            message: 'Shaking detected.'
                        });
                    }
                    oldAccel = accel;
                },
                function (ex) {
                    myApp.alert("watchAcceleration Error: " + ex);
                }, options);
            notify = myApp.addNotification({
                message: 'Please try shaking your phone.'
            });
        }
    });

    ct.find('.btn-current').on('click', function () {
        if (watchId) {
            navigator.accelerometer.clearWatch(watchId);
            if (notify) myApp.closeNotification(notify);
            updateAcceleration({
                x: "",
                y: "",
                z: "",
                timestamp: ""
            });
            watchId = null;
        }
        navigator.accelerometer.getCurrentAcceleration(
            updateAcceleration,
            function (ex) {
                myApp.alert("getCurrentAcceleration Error: " + ex);
            });
    });
});


myApp.onPageInit('accelerationball', function (page) {
    var ct = $$(page.container),
        canvas = ct.find('canvas.ball')[0],
        ctx = canvas.getContext('2d'),
        oldX = 10,
        oldY = 10,
        watchId;

    var clearCanvas = function () {
        ctx.clearRect(0, 0, 200, 200);
        ctx.fillStyle = "#eee";
        ctx.fillRect(0, 0, 200, 200);
    }
    var drawCircle = function (x, y) {
        var rd = 10;
        ctx.beginPath();

        ctx.arc(x, y, rd, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = "red";

        ctx.fill();
    };

    document.addEventListener("deviceready", function () {
        clearCanvas();
        drawCircle(oldX, oldY);

        watchId = navigator.accelerometer.watchAcceleration(
            function (newValue) {
                var newX = oldX - newValue.x / 3,
                    newY = oldY + newValue.y / 3;
                if (10 <= newX && newX < 180 && 10 <= newY && newY < 180) {
                    clearCanvas();
                    drawCircle(oldX, oldY);

                    oldX = newX;
                    oldY = newY;
                }
            },
            function (ex) {
                myApp.alert("Accelerometer Error: " + ex);
            }, {
                frequency: 10
            });
    }, false);

    myApp.onPageBeforeRemove('accelerationball', function (page) {
        if (watchId) {
            navigator.accelerometer.clearWatch(watchId);
            watchId = null;
        }
    });
});


myApp.onPageInit('deviceorientation', function (page) {
    var ct = $$(page.container),
        watchId = null;
    var updateHeading = function (heading) {
        ct.find('.heading-magnetic > span').html(round(heading.magneticHeading));
        ct.find('.heading-true > span').html(round(heading.trueHeading));
        ct.find('.heading-accuracy > span').html(round(heading.headingAccuracy));
        ct.find('.timestamp > span').html(heading.timestamp);
    };
    ct.find('.btn-toggle').on('click', function () {
        if (watchId) {
            navigator.compass.clearWatch(watchId);
            updateHeading({
                x: "",
                y: "",
                z: "",
                timestamp: ""
            });
            watchId = null;
        } else {
            var options = {
                frequency: 300
            };
            watchId = navigator.compass.watchHeading(
                updateHeading,
                function (ex) {
                    myApp.alert("watchHeading Error: " + ex);
                }, options);
        }
    });

    ct.find('.btn-current').on('click', function () {
        if (watchId) {
            navigator.compass.clearWatch(watchId);
            updateHeading({
                x: "",
                y: "",
                z: "",
                timestamp: ""
            });
            watchId = null;
        }
        navigator.compass.getCurrentHeading(
            updateHeading,
            function (ex) {
                myApp.alert("getCurrentHeading Error: " + ex);
            });
    });
});



myApp.onPageInit('compass', function (page) {
    var ct = $$(page.container),
        headingDiv = ct.find('.compass-heading'),
        rose = ct.find('.rose'),
        watchId;
    var convertToText = function (mh) {
        var textDirection = '';
        if (typeof mh !== "number") {
            textDirection = '';
        } else if (mh >= 337.5 || (mh >= 0 && mh <= 22.5)) {
            textDirection = 'N';
        } else if (mh >= 22.5 && mh <= 67.5) {
            textDirection = 'NE';
        } else if (mh >= 67.5 && mh <= 112.5) {
            textDirection = 'E';
        } else if (mh >= 112.5 && mh <= 157.5) {
            textDirection = 'SE';
        } else if (mh >= 157.5 && mh <= 202.5) {
            textDirection = 'S';
        } else if (mh >= 202.5 && mh <= 247.5) {
            textDirection = 'SW';
        } else if (mh >= 247.5 && mh <= 292.5) {
            textDirection = 'W';
        } else if (mh >= 292.5 && mh <= 337.5) {
            textDirection = 'NW';
        }
        return textDirection;
    };

    document.addEventListener("deviceready", function () {
        var oldHeading = 0,
            oldRotate = 0;
        watchId = navigator.compass.watchHeading(
            function (heading) {
                var magneticHeading = round(heading.magneticHeading);
                headingDiv.html(
                    'Heading: ' + magneticHeading + '&#xb0; ' +
                    convertToText(magneticHeading) + '<br />' +
                    'True Heading: ' + round(heading.trueHeading) + '<br />' +
                    'Accuracy: ' + round(heading.headingAccuracy)
                );

                if (magneticHeading != oldHeading) {
                    //calculate minimum rotation
                    var newRotate,
                        delta = magneticHeading - oldHeading,
                        absDelta;
                    if (Math.abs(delta) > 180) {
                        absDelta = 360 - delta;
                        if (delta > 0) {
                            newRotate = oldRotate - absDelta;
                        } else {
                            newRotate = oldRotate + absDelta;
                        }
                    } else {
                        absDelta = Math.abs(delta);
                        if (delta > 0) {
                            newRotate = oldRotate + absDelta;
                        } else {
                            newRotate = oldRotate - absDelta;
                        }
                    }
                    var transform = "rotate(" + (-newRotate) + "deg)",
                        duration = Math.max(Math.round((1500 * absDelta) / 360), 100);

                    rose.css({
                        "-webkit-transform": transform,
                        "transform": transform,
                        "-webkit-transition": "-webkit-transform " + duration + "ms ease-out",
                        "transition": "transform " + duration + "ms ease-out"
                    });
                    oldHeading = magneticHeading;
                    oldRotate = newRotate;
                }
            },
            function (ex) {
                myApp.alert("watchHeading Error: " + ex);
            }, {
                frequency: 10
            });
    }, false);

    myApp.onPageBeforeRemove('compass', function (page) {
        if (watchId) {
            navigator.compass.clearWatch(watchId);
            watchId = null;
        }
    });
});




myApp.onPageInit('globalization', function (page) {
    var ct = $$(page.container);
    document.addEventListener("deviceready", function () {
        var g = navigator.globalization;
        g.getPreferredLanguage(function (language) {
            ct.find(".preferredlanguage").html(language.value);
        }, function () {
            ct.find(".preferredlanguage").html('Error!');
        });

        g.getLocaleName(function (locale) {
            ct.find(".localename").html(locale.value);
        }, function () {
            ct.find(".localename").html('Error!');
        });

        g.getDatePattern(function (date) {
            ct.find(".datepattern").html(date.pattern);
        }, function () {
            ct.find(".datepattern").html('Error!');
        }, {
            formatLength: 'full',
            selector: 'date and time'
        });

        g.dateToString(new Date(), function (date) {
            ct.find(".datetostring").html(date.value);
        }, function () {
            ct.find(".datetostring").html('Error!');
        }, {
            formatLength: 'full',
            selector: 'date and time'
        });

        g.getDateNames(
            function (names) {
                var strArr = [];
                for (var i = 0; i < names.value.length; i++) {
                    strArr.push(names.value[i]);
                }
                ct.find(".monthnames").html(strArr.join(', '));
            },
            function () {
                ct.find(".monthnames").html('Error!');
            }, {
                type: 'wide',
                item: 'months'
            }
        );
        g.getDateNames(
            function (names) {
                var strArr = [];
                for (var i = 0; i < names.value.length; i++) {
                    strArr.push(names.value[i]);
                }
                ct.find(".daynames").html(strArr.join(', '));
            },
            function () {
                ct.find(".daynames").html('Error!');
            }, {
                type: 'wide',
                item: 'days'
            }
        );

        g.getFirstDayOfWeek(function (day) {
            ct.find(".firstdayofweek").html(day.value);
        }, function () {
            ct.find(".firstdayofweek").html('Error!');
        });

        g.getNumberPattern(function (pattern) {
            ct.find(".numberpattern").html('pattern: ' + pattern.pattern + '<br>' +
                'symbol: ' + pattern.symbol + '<br>' +
                'fraction: ' + pattern.fraction + '<br>' +
                'rounding: ' + pattern.rounding + '<br>' +
                'positive: ' + pattern.positive + '<br>' +
                'negative: ' + pattern.negative + '<br>' +
                'decimal: ' + pattern.decimal + '<br>' +
                'grouping: ' + pattern.grouping);
        }, function () {
            ct.find(".numberpattern").html('Error!');
        }, {
            type: 'decimal'
        });

        g.getCurrencyPattern('USD', function (pattern) {
            ct.find(".currencypattern").html('pattern: ' + pattern.pattern + '<br>' +
                'code: ' + pattern.code + '<br>' +
                'fraction: ' + pattern.fraction + '<br>' +
                'rounding: ' + pattern.rounding + '<br>' +
                'decimal: ' + pattern.decimal + '<br>' +
                'grouping: ' + pattern.grouping);
        }, function () {
            ct.find(".currencypattern").html('Error!');
        });

        g.numberToString(
            31415926535.89793,
            function (number) {
                ct.find(".numbertostring").html(number.value);
            },
            function () {
                ct.find(".numbertostring").html('Error!');
            }, {
                type: 'decimal'
            });

    }, false);


});



myApp.onPageInit('dialogs', function (page) {
    var ct = $$(page.container);
    ct.find('.button-alert').on('click', function (e) {
        navigator.notification.alert(
            'You are the winner!', // message
            function () {}, // callback
            'Game Over', // title
            'Done' // buttonName
        );
    });

    ct.find('.button-confirm').on('click', function (e) {
        navigator.notification.confirm(
            'You are the winner!', // message
            function (buttonIndex) { // callback to invoke with index of button pressed
                myApp.addNotification({
                    message: 'You selected button ' + buttonIndex
                });
            },
            'Game Over', // title
            ['Restart', 'Exit'] // buttonLabels
        );
    });

    ct.find('.button-prompt').on('click', function (e) {
        navigator.notification.prompt(
            'Please enter your name', // message
            function (results) {
                myApp.addNotification({ // callback to invoke
                    message: "You selected button number " + results.buttonIndex + " and entered " + results.input1
                });
            },
            'Registration', // title
            ['Ok', 'Exit'], // buttonLabels
            'Jane Doe' // defaultText
        );
    });

    ct.find('.button-beep').on('click', function (e) {
        // Beep twice!
        navigator.notification.beep(2);
    });
});


myApp.onPageInit('statusbar', function (page) {
    var ct = $$(page.container);
    ct.find('.button[data-color]').on('click', function (e) {
        var color = $$(e.target).attr('data-color');
        if (color) {
            StatusBar.backgroundColorByHexString(color);
        }
    });
    ct.find('.btn-show').on('click', function (e) {
        StatusBar.show();
    });
    ct.find('.btn-hide').on('click', function (e) {
        StatusBar.hide();
    });

    myApp.onPageBeforeRemove('statusbar', function (page) {
        StatusBar.backgroundColorByHexString('#2196f3');
        StatusBar.show();
    });
});


myApp.onPageInit('geolocation', function (page) {
    var ct = $$(page.container),
        watchId = null;
    var onSuccess = function (position) {

        ct.find('.row').html('<div class="col-100">Latitude: ' + position.coords.latitude + '</div>' +
            '<div class="col-100">Longitude: ' + position.coords.longitude + '</div>' +
            '<div class="col-100">Altitude: ' + position.coords.altitude + '</div>' +
            '<div class="col-100">Accuracy: ' + position.coords.accuracy + '</div>' +
            '<div class="col-100">Altitude Accuracy: ' + position.coords.altitudeAccuracy + '</div>' +
            '<div class="col-100">Heading: ' + position.coords.heading + '</div>' +
            '<div class="col-100">Speed: ' + position.coords.speed + '</div>' +
            '<div class="col-100">Timestamp: ' + position.timestamp + '</div>');

        var googleMap = ct.find('.map.google'),
            gMapWidth = parseInt(googleMap.css("width"), 10), // remove 'px' from width value
            gMapHeight = parseInt(googleMap.css("height"), 10),
            scale = (window.devicePixelRatio || 0) > 1 ? '2' : '1';

        googleMap.css('visibility', 'visible')
            .attr('src', "http://maps.googleapis.com/maps/api/staticmap?center=" +
                position.coords.latitude + "," + position.coords.longitude +
                "&zoom=15&size=" + gMapWidth + "x" + gMapHeight + "&maptype=roadmap&markers=color:green%7C" +
                position.coords.latitude + "," + position.coords.longitude +
                "&sensor=false&scale=" + scale);


        var baiduMap = ct.find('.map.baidu'),
            bMapWidth = parseInt(baiduMap.css("width"), 10), // remove 'px' from width value
            bMapHeight = parseInt(baiduMap.css("height"), 10),
            dpiType = (window.devicePixelRatio || 0) > 1 ? 'ph' : 'pl';

        baiduMap.css('visibility', 'visible')
            .attr('src', "http://api.map.baidu.com/staticimage/v2?ak=PPMMOv61cLvXx4EGINx28U3N&width=" + bMapWidth + "&height=" + bMapHeight +
                "&center=" + position.coords.longitude + "," + position.coords.latitude +
                "&zoom=15&markers=" + position.coords.longitude + "," + position.coords.latitude +
                "&coordtype=wgs84ll&dpiType=" + dpiType + "&scale=" + scale);
    };
    var onError = function (error) {
        myApp.alert('code: ' + error.code + '<br>' +
            'message: ' + error.message);
    };
    var clearWatch = function () {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            ct.find('.row').html('');
            ct.find('.map').css('visibility', 'hidden');
        }
    };

    ct.find('.btn-toggle').on('click', function () {
        if (watchId) {
            clearWatch();
        } else {
            watchId = navigator.geolocation.watchPosition(
                onSuccess, onError, {
                    frequency: 3000,
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 5000
                });
        }
    });
    ct.find('.btn-current').on('click', function () {
        clearWatch();
        navigator.geolocation.getCurrentPosition(
            onSuccess, onError);
    });
});


myApp.onPageInit('inappbrowser', function (page) {
    var ct = $$(page.container),
        form = ct.find('form');

    ct.find('.button').on('click', function (e) {
        var data = myApp.formToJSON(form),
            url = data.url;
        if (!url) {
            myApp.alert('The url is empty');
            return;
        }

        var mode = data.mode,
            location;
        if (data.location && data.location.length) {
            location = data.location[0];
        }
        location = location || 'no';
        mode = mode || '_blank';

        cordova.InAppBrowser.open(url, mode, 'location=' + location);
    });
});


myApp.onPageInit('media', function (page) {
    //MediaError 
    var CONSTANT = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_NONE_SUPPORTED'
    };
    //Play Audio
    var ct = $$(page.container),
        progressbar = ct.find('.progressbar'),
        btnPlayPause = ct.find('.button-playpause'),
        audioPosition = ct.find('.audioPosition'),
        mediaDuration = ct.find('.mediaDuration'),
        duration = -1,
        audioMedia = null,
        audioTimer = null,
        is_paused = false;

    var formatSeconds = function (seconds) {
        var minutes = parseInt(seconds / 60).toString(),
            secondsLeft = (seconds % 60).toString();
        if (minutes.length < 2) minutes = '0' + minutes;
        if (secondsLeft.length < 2) secondsLeft = '0' + secondsLeft;
        return minutes + ':' + secondsLeft;
    };

    var setAudioPosition = function (position) {
        mediaDuration.html(formatSeconds(Math.max(duration, 0)));
        audioPosition.html(formatSeconds(Math.max(position, 0)));

        if (position == 0) {
            myApp.setProgressbar(progressbar, 0);
        } else {
            if (duration > 0) {
                var p = round((position * 100) / duration, 2);
                myApp.setProgressbar(progressbar, p);
            } else {
                myApp.setProgressbar(progressbar, 0);
            }
        }
    };
    var onSuccess = function onSuccess() {
        setAudioPosition(duration);
        clearInterval(audioTimer);
        audioTimer = null;
        audioMedia = null;
        is_paused = false;
        duration = -1;
    };

    var onError = function (error) {
        myApp.addNotification({
            message: 'code: ' + error.code + '<br>' +
                'message: ' + (error.message || CONSTANT[error.code] || '')
        });
        clearInterval(audioTimer);
        audioTimer = null;
        audioMedia = null;
        is_paused = false;
        setAudioPosition(0);
        btnPlayPause.html('Play');
    };

    var pauseAudio = function () {
        if (is_paused) return;
        if (audioMedia) {
            is_paused = true;
            audioMedia.pause();
            btnPlayPause.html('Play');
        }
    };
    var stopAudio = function stopAudio() {
        if (audioMedia) {
            audioMedia.stop();
            audioMedia.release();
            audioMedia = null;
        }
        if (audioTimer) {
            clearInterval(audioTimer);
            audioTimer = null;
        }

        is_paused = false;
        duration = 0;
        btnPlayPause.html('Play');
        setAudioPosition(0);
    };
    var playAudio = function (src) {

        if (audioMedia === null) {
            mediaDuration.html("Loading...");
            audioPosition.html(formatSeconds(0));
            audioMedia = new Media(src, onSuccess, onError);
            audioMedia.play();
        } else {
            if (is_paused) {
                is_paused = false;
                audioMedia.play();
            }
        }
        btnPlayPause.html('Pause');

        if (audioTimer === null) {
            audioTimer = setInterval(function () {
                audioMedia.getCurrentPosition(
                    function (position) {
                        if (position > -1) {
                            if (duration <= 0) {
                                duration = audioMedia.getDuration();
                                if (duration > 0) {
                                    duration = Math.round(duration);
                                }
                            }
                            if (position >= duration)
                                stopAudio();
                            setAudioPosition(Math.round(position));
                        }
                    },
                    function (error) {
                        myApp.addNotification({
                            message: "Error getting position: " + error
                        });
                    }
                );
            }, 500);
        }
    };

    btnPlayPause.on('click', function (e) {
        if (audioMedia && !is_paused) {
            pauseAudio();
        } else {
            var src = 'audio/CFHour_Intro.mp3';
            if (myApp.device.android) {
                src = '/android_asset/www/' + src;
            }
            playAudio(src);
        }
    });
    ct.find('.button-stop').on('click', function (e) {
        stopAudio();
    });

    //Live Audio Recording
    var is_recording = false,
        audioRecording = null,
        btnRecord = ct.find('.button-record'),
        waveLoader = ct.find('.wave-loader'),
        src = null;

    var stopRecord = function () {
        if (audioRecording) {
            audioRecording.stopRecord();
        }
        audioRecording = null;
        is_recording = false;
        btnRecord.html('Start Record').addClass('disabled');
        waveLoader.css('visibility', 'hidden');
    };

    var startRecord = function () {
        src = "new_test_recording_" + Math.round(new Date().getTime() / 1000);
        if (myApp.device.android) {
            src = src + ".aac";
        } else if (myApp.device.ios) {
            src = src + ".m4a"; //or wav
        }

        audioRecording = new Media(src, function () {
            //fired when recording is stopped and file is saved
            myApp.addNotification({
                message: 'Audio file successfully created:<br />' + src
            });
            btnRecord.removeClass('disabled');
        }, function (err) {
            myApp.addNotification({
                message: 'code: ' + err.code + '<br>' +
                    'message: ' + (err.message || CONSTANT[err.code] || '')
            });
            if (audioRecording) audioRecording.release();
            btnRecord.removeClass('disabled');
        });

        audioRecording.startRecord();
        is_recording = true;
        btnRecord.html('Stop Record');
        waveLoader.css('visibility', 'visible');
    };
    btnRecord.on('click', function () {
        if (is_recording && audioRecording) { //stop record
            stopRecord();
        } else { //start record
            startRecord();
        }
    });

    myApp.onPageBeforeRemove('media', function (page) {
        stopAudio();
        stopRecord();
    });
});


myApp.onPageInit('mediacapture', function (page) {
    //CaptureError 
    var CONSTANT = {
        0: 'CAPTURE_INTERNAL_ERR',
        1: 'CAPTURE_APPLICATION_BUSY',
        2: 'CAPTURE_INVALID_ARGUMENT',
        3: 'CAPTURE_NO_MEDIA_FILES',
        4: 'CAPTURE_PERMISSION_DENIED',
        5: 'CAPTURE_NOT_SUPPORTED'
    };
    var ct = $$(page.container),
        log = ct.find('.log');
    ct.find('.button-audio').on('click', function (e) {
        navigator.device.capture.captureAudio(function (files) {
            var i, output = '';
            for (i = 0; i < files.length; i++) {
                output += '<div>Name: ' + files[i].name + '<br />' +
                    'Full Path: ' + files[i].fullPath + '<br />' +
                    'Type: ' + files[i].type + '<br />' +
                    'Created: ' + new Date(files[i].lastModifiedDate) + '<br />' +
                    'Size: ' + files[i].size + '</div><br/>';
            }
            log.prepend(output);
        }, function (err) {
            console.log(JSON.stringify(err));
            var msg = '';
            if (typeof err === 'string') msg = err;
            else if (err.code) msg = CONSTANT[err.code];
            myApp.alert(msg);
        }, {
            limit: 2,
            duration: 10
        });
    });
    ct.find('.button-video').on('click', function (e) {
        navigator.device.capture.captureVideo(function (files) {
            var i, output = '';
            for (i = 0; i < files.length; i++) {
                output += '<div>Name: ' + files[i].name + '<br />' +
                    'Full Path: ' + files[i].fullPath + '<br />' +
                    'Type: ' + files[i].type + '<br />' +
                    'Created: ' + new Date(files[i].lastModifiedDate) + '<br />' +
                    'Size: ' + files[i].size + '</div><br/>';
            }
            log.prepend(output);
        }, function (err) {
            console.log(JSON.stringify(err));
            var msg = '';
            if (typeof err === 'string') msg = err;
            else if (err.code) msg = CONSTANT[err.code];
            myApp.alert(msg);
        }, {
            limit: 1
        });
    });
    ct.find('.button-image').on('click', function (e) {
        navigator.device.capture.captureImage(function (files) {
            var i, output = '';
            for (i = 0; i < files.length; i++) {
                output += '<div>Name: ' + files[i].name + '<br />' +
                    'Full Path: ' + files[i].fullPath + '<br />' +
                    'Type: ' + files[i].type + '<br />' +
                    'Created: ' + new Date(files[i].lastModifiedDate) + '<br />' +
                    'Size: ' + files[i].size + '</div><br/>';
            }
            log.prepend(output);
        }, function (err) {
            console.log(JSON.stringify(err));
            var msg = '';
            if (typeof err === 'string') msg = err;
            else if (err.code) msg = CONSTANT[err.code];
            myApp.alert(msg);
        }, {
            limit: 2
        });
    });
});


myApp.onPageInit('networkinformation', function (page) {
    var ct = $$(page.container),
        log = ct.find('.log');


    var logConnectionType = function () {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        log.append('Your connection type is: ' + states[networkState]);
    };

    var onOnLine = function () {
        log.html('You are online: ' + new Date().toLocaleString() + '<br>');
        logConnectionType();
    };
    var onOffLine = function () {
        log.html('You are offline: ' + new Date().toLocaleString() + '<br>');
        logConnectionType();
    };

    document.addEventListener('deviceready', function () {
        logConnectionType();
        document.addEventListener("online", onOnLine, false);
        document.addEventListener("offline", onOffLine, false);
    }, false);

    myApp.onPageBeforeRemove('networkinformation', function (page) {
        document.removeEventListener("online", onOnLine, false);
        document.removeEventListener("offline", onOffLine, false);
    });
});



myApp.onPageInit('splashscreen', function (page) {
    $$(page.container).find('.btn-show').on('click', function (e) {
        if (navigator.splashscreen) {
            navigator.splashscreen.show();
            setTimeout(function () {
                navigator.splashscreen.hide();
            }, 3000);
        }
    });
});

myApp.onPageInit('vibrate', function (page) {
    var ct = $$(page.container);
    ct.find('.btn-vibrate1').on('click', function (e) {
        navigator.vibrate(3000);
    });
    ct.find('.btn-vibrate2').on('click', function (e) {
        navigator.vibrate([1000, 1000, 3000, 1000, 5000]);
    });
    ct.find('.btn-cancel').on('click', function (e) {
        navigator.vibrate(0);
    });
});



var fileSystem;
//File and DIrectory List Template
var fileExplorerTpl;
//Constants
var FILEERROR = {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR'
};
myApp.onPageInit('fileexplorer', function (page) {
    var ct = $$(page.container),
        navBar = ct.find('.navbar'),
        navTitle = navBar.find('.center'),
        speedDial = ct.find('.speed-dial'),
        pageContent = ct.find('.page-content'),
        listBlock = pageContent.find('.list-block'),
        query = page.query,
        currentDirEntry;

    console.log(query);

    var fail = function (error) {
        console.log(error);
        myApp.addNotification({
            message: "error: " + error.code + ', message: ' + FILEERROR[error.code]
        });
    };

    var successDir = function (dirEntry, callback) {
        var root = dirEntry.filesystem.root,
            isRootDir = root.fullPath === dirEntry.fullPath;

        if (!isRootDir) {
            navTitle.html(dirEntry.name);
        }

        var dirReader = dirEntry.createReader();
        dirReader.readEntries(function (entries) {
            var arr = [];
            for (var i = 0; i < entries.length; i++) {
                arr.push({
                    name: entries[i].name || '',
                    isDirectory: entries[i].isDirectory ? 1 : 0,
                    isFile: entries[i].isFile ? 1 : 0,
                    entry: entries[i],
                    path: entries[i].fullPath
                });
            }
            arr.sort(function (a, b) {
                var f1 = b.isDirectory - a.isDirectory;
                if (f1 == 0) {
                    return a.name.localeCompare(b.name);
                }
                return f1;
            });

            if (!isRootDir) { //非根目录
                arr.unshift({
                    name: '...',
                    back: true
                });
            }
            if (!fileExplorerTpl) {
                fileExplorerTpl = Template7.compile('\
                    <ul>\
                        {{#each items}}\
                            {{#if back}}\
                                <li>\
                                    <a href="#" class="back item-link item-content">\
                                        <div class="item-media"><i class="icon icon-levelup"></i></div>\
                                        <div class="item-inner">\
                                            <div class="item-title">{{name}}</div>\
                                        </div>\
                                    </a>\
                                </li>\
                            {{else}}\
                                {{#if isDirectory}}\
                                    <li class="swipeout" data-type="folder">\
                                        <a href="fileexplorer.html?dir={{js "encodeURIComponent(this.path)"}}" class="swipeout-content item-link item-content">\
                                            <div class="item-media"><i class="icon icon-folder"></i></div>\
                                            <div class="item-inner">\
                                                <div class="item-title">{{name}}</div>\
                                            </div>\
                                        </a>\
                                        <div class="swipeout-actions-right">\
                                            <a href="#" class="action action-rename swipeout-close">Rename</a>\
                                            <a href="#" class="action action-delete bg-red swipeout-close">Delete</a>\
                                        </div>\
                                    </li>\
                                {{else}}\
                                    <li class="swipeout" data-type="file">\
                                        <div class="swipeout-content item-content">\
                                            <div class="item-media"><i class="icon icon-file"></i></div>\
                                            <div class="item-inner">\
                                                <div class="item-title">{{name}}</div>\
                                            </div>\
                                        </div>\
                                        <div class="swipeout-actions-right">\
                                            <a href="#" class="action action-rename swipeout-close">Rename</a>\
                                            <a href="#" class="action action-delete bg-red swipeout-close">Delete</a>\
                                        </div>\
                                    </li>\
                                {{/if}}\
                            {{/if}}\
                        {{/each}}\
                    </ul>\
                ');
            }
            var html = fileExplorerTpl({
                items: arr
            });
            listBlock.html(html);
            if (callback) {
                callback();
            }
        }, fail);
    };

    var listEntriesOfDir = function (dir) {
        console.log('list entries of directory: ' + dir);
        if (dir) {
            fileSystem.root.getDirectory(dir, {
                create: false
            }, function (dirEntry) {
                currentDirEntry = dirEntry;
                successDir(dirEntry);
            }, fail);
        } else {
            currentDirEntry = fileSystem.root;
            successDir(fileSystem.root);
        }
    };

    document.addEventListener('deviceready', function () {
        if (!fileSystem) {
            window.requestFileSystem(
                LocalFileSystem.PERSISTENT,
                0,
                function (fs) {
                    fileSystem = fs;
                    listEntriesOfDir(query.dir || '');
                },
                fail
            );
        } else {
            listEntriesOfDir(query.dir || '');
        }
    }, false);

    var scrollToDom = function(item){
        var top = item.offset().top - navBar.height() + pageContent[0].scrollTop;
        pageContent.scrollTop(Math.min(top, pageContent[0].scrollHeight), 600, function(){
            //hightlight the file just created
            item.addClass('highlight');
            setTimeout(function(){
                item.removeClass('highlight');
            }, 600);
        });
    };

    var scrollToEntry = function(type, name) {
        var selector;
        if(type == 'folder') {
            selector = 'a.item-content .item-title';
        }
        else if(type == 'file') {
            selector = 'div.item-content .item-title';
        }
        $$.each(listBlock.find(selector), function (i, d) {
            if (d.innerHTML == name) {
                var item = $$(d).parents('li');
                scrollToDom(item);
            }
        });
    };

    var createFolder = function () {
        speedDial.removeClass('speed-dial-opened');

        if (!currentDirEntry) return;

        myPrompt('New Folder', 'Please enter the name', '', function (value) {
            //detect if folder already exists
            currentDirEntry.getDirectory(value, {
                create: false
            }, function (entry) {
                myApp.alert('The folder named ' + value + ' already exists');
            }, function (err) {
                if (err.code == 1) { //not found
                    //then create a new folder
                    currentDirEntry.getDirectory(value, {
                        create: true, 
                        exclusive: false
                    }, function (entry) {
                        successDir(currentDirEntry, function () {
                            //scroll to the folder just created
                            scrollToEntry('folder', value);
                        });
                    }, fail);

                } else {
                    fail(err);
                }
            });
        });
    };

    var createFile = function () {
        speedDial.removeClass('speed-dial-opened');

        if (!currentDirEntry) return;
        
        myPrompt('New Text File', 'Please enter the name', '', function (value) {
            if(!/^.*\.txt$/i .test(value)) {
                value += '.txt';
            }
            //detect if folder already exists
            currentDirEntry.getFile(value, {
                create: false
            }, function (entry) {
                myApp.alert('The file named ' + value + ' already exists');
            }, function (err) {
                if (err.code == 1) { //not found
                    //then create a new file
                    currentDirEntry.getFile(value, {
                        create: true, 
                        exclusive: false
                    }, function (entry) {
                        successDir(currentDirEntry, function () {
                            //scroll to the file just created
                            scrollToEntry('file', value);
                        });
                    }, fail);

                } else {
                    fail(err);
                }
            });
        });
    };

    speedDial.find('.create-folder').on('click', function(){
        createFolder();
    });
    speedDial.find('.create-file').on('click', function(){
        createFile();
    });

    //swipe out action button click listeners
    listBlock.on('click', 'a.action', function(e){
        if(!currentDirEntry) return;

        var t = $$(e.target),
            li = t.parents('li'),        
            type = li.attr('data-type'),
            nameEl = li.find('.item-title'),
            name = nameEl.html();
        if(t.hasClass('action-rename')) {
            myPrompt('Rename', 'Please enter a new name', name, function(value){
                if(type == 'folder') {
                    currentDirEntry.getDirectory(name, {
                        create: false
                    }, function (entry) {
                        entry.moveTo(currentDirEntry, value, function(){
                            nameEl.html(value);
                        }, fail);
                    }, fail);
                }
                else if(type == 'file') {
                    currentDirEntry.getFile(name, {
                        create: false
                    }, function (entry) {
                        entry.moveTo(currentDirEntry, value, function(){
                            nameEl.html(value);
                        }, fail);
                    }, fail);
                }
            });
        }
        else if(t.hasClass('action-delete')) {
            myApp.confirm('Are you sure you want to delete this ' + type + '?', 'Confirm', function(){
                if(type == 'folder') {
                    currentDirEntry.getDirectory(name, {
                        create: false
                    }, function (entry) {
                        entry.removeRecursively(function(){
                            myApp.swipeoutDelete(li);
                        }, fail);
                    }, fail);
                }
                else if(type == 'file') {
                    currentDirEntry.getFile(name, {
                        create: false
                    }, function (entry) {
                        entry.remove(function(){
                            myApp.swipeoutDelete(li);
                        }, fail);
                    }, fail);
                }
            });
        }

    });
});