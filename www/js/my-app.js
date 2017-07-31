// Initialize your app
var myApp = new Framework7({
    pushState: true,
    modalTitle: 'Cordova API Demo',
    // Enable Material theme
    material: true,
    swipePanel: 'left',
    notificationHold: 1500
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

var round = function (num) {
    var dec = 3,
        result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
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

                if(magneticHeading != oldHeading) {
                    //calculate minimum rotation
                    var newRotate,
                        delta = magneticHeading - oldHeading,
                        absDelta;
                    if(Math.abs(delta) > 180) {
                        absDelta = 360 - delta;
                        if(delta > 0) {
                            newRotate = oldRotate - absDelta;
                        }
                        else {
                            newRotate = oldRotate + absDelta;
                        }
                    }
                    else {
                        absDelta = Math.abs(delta);
                        if(delta > 0) {
                            newRotate = oldRotate + absDelta;
                        }
                        else {
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
        if(color) {
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