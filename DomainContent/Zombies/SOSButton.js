//
// SOSButton.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Pointers */

(function() {
    var AUDIO_VOLUME_LEVEL = 0.2;
    var DOWN_TIME_MS = 3000;
    var DISABLED_TIME_MS = 10000;
    var BOAT = "{4691d6ad-93f5-4456-90b9-95c9f2ef00b2}";
    var BLOCK_BOAT_ACCESS = "{db90802f-2990-459f-a4e5-c25dd1c992a3}";
    var BOAT_HORN_SOUND = "https://echads.github.io/hifi-content/DomainContent/Zombies/sounds/346108__limetoe__boat-horn.wav";
    var BOAT_SOUND_POSITION = {
        x:-4.8,
        y:4.5,
        z:-52
    };
    var POSITION_INACTIVE = {
        x: -6.2397,
        y: 4.4977,
        z: -51.5015
    };
    var POSITION_ACTIVE = {
        x: -6.2397,
        y: 4.4031,
        z: -51.5015
    };

    var YELLOW = {
        red: 237,
        green: 220,
        blue: 26
    };

    var RED = {
        red: 255,
        green: 0,
        blue: 0
    };

    var GREEN = {
        red: 28,
        green: 165,
        blue: 23
    };

    var _this;
    var currentHand = 0;
    var sound;
    var boatSound;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        /*
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath(BOAT_HORN_SOUND));
            _this.reset();
        },
        */
        preload: function(entityID) {
            _this.entityID = entityID;
            var childIDs = Entities.getChildrenIDs(_this.entityID);
            if (childIDs[0]) {
                _this.childButton = childIDs[0];
                _this.color = RED;
                if (DEBUG) {
                    print("one red button");
                }
            } else {
                _this.color = GREEN;
                if (DEBUG) {
                    print("one green button");
                }
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'name']);
            position = properties.position;
            _this.type = _this.getButtonType();
            if (DEBUG) {
                print("searching for a gate...");
            }
            var gateNumber = properties.name.charAt(GATE_NUMBER_INDEX);
            if (DEBUG) {
                print("gate number is " + gateNumber);
            }
            Entities.findEntities(properties.position, SEARCH_RADIUS).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (DEBUG) {
                    // print(name);
                }
                if ((name.indexOf("Zombie Gate") !== NEGATIVE) && (name.indexOf(gateNumber) !== NEGATIVE)) {
                    if (DEBUG) {
                        print("button " + _this.entityID + " is attached to gate " + element);
                    }
                    gate = element;
                    return;
                }
            });
        },
        /*
        reset: function() {
            if (boatSound) {
                boatSound.stop();
            }
            _this.color = RED;
            _this.changeColorToRed();
            _this.raiseButton();
        },
        */
        /*
        pressButton: function(){
            if (_this.color === GREEN) {
                _this.lowerButton();
                _this.changeColorToYellow();
                if (sound.downloaded) {
                    if (boatSound) {
                        boatSound.stop();
                    }
                    boatSound = Audio.playSound(sound, {
                        position: BOAT_SOUND_POSITION,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                    Entities.editEntity(BLOCK_BOAT_ACCESS, {
                        collisionless: true
                    });
                    Entities.callEntityServerMethod(BOAT, 'approachIsland');
                }
                Script.setTimeout(function() {
                    _this.changeColorToRed();
                    _this.raiseButton();
                }, DOWN_TIME_MS);
                Script.setTimeout(function() {
                    _this.changeColorToGreen();
                }, DISABLED_TIME_MS);
            }
        },
        */
        pressButton: function(){
            if (_this.color === GREEN) {
                if (_this.type === "open") {
                    if (DEBUG) {
                        print("open button pressed");
                    }
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    Entities.callEntityServerMethod(gate, 'openGate');
                    Script.setTimeout(function() {
                        _this.changeColorToRed();
                        _this.raiseButton();
                    }, DOWN_TIME_MS);
                    Script.setTimeout(function() {
                        _this.changeColorToGreen();
                    }, DISABLED_TIME_MS);
                    return;
                } if (_this.type === "close") {
                    if (DEBUG) {
                        print("close button pressed");
                    }
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    Entities.callEntityServerMethod(gate, 'closeGate');
                    Script.setTimeout(function() {
                        _this.changeColorToRed();
                        _this.raiseButton();
                    }, DOWN_TIME_MS);
                    Script.setTimeout(function() {
                        _this.changeColorToGreen();
                    }, DISABLED_TIME_MS);
                    return;
                } else if (_this.type === "hold") {
                    if (DEBUG) {
                        print("button pressed");
                    }
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    if (DEBUG) {
                        print("calling gate open method");
                    }
                    Entities.callEntityServerMethod(gate, 'openGate');
                    return;
                } else if (_this.type === "synch") {
                    if (DEBUG) {
                        print("button pressed is synch");
                    }
                    _this.changeColorToYellow();
                    _this.lowerButton();
                    var sisterColor = Entities.getEntityProperties(_this.sisterButton, 'color').color;
                    if (DEBUG) {
                        print("now the sister color is " + JSON.stringify(sisterColor));
                        print("yellow is " + JSON.stringify(YELLOW));
                    }
                    if (JSON.stringify(sisterColor) === (JSON.stringify(YELLOW))) {
                        Entities.callEntityServerMethod(gate, 'openGate');
                    }
                    return;
                } else if (_this.type === "order") {
                    if (DEBUG) {
                        print("pressed an order button");
                    }
                    if (_this.childButton) {
                        if (DEBUG) {
                            print("button has child, " + JSON.stringify(_this.childButton) + ", that must be pressed first");
                        }
                        var childColor = Entities.getEntityProperties(_this.childButton, 'modelURL').modelURL;
                        if (DEBUG) {
                            print("now the child color is " + JSON.stringify(childColor));
                            print("yellow is " + JSON.stringify(YELLOW));
                        }
                        if (JSON.stringify(childColor) === (JSON.stringify(YELLOW))) {
                            if (DEBUG) {
                                print("child button is yellow, pushing this button now");
                                print("button pressed");
                            }
                            _this.lowerButton();
                            _this.changeColorToYellow();
                            Script.setTimeout(function() {
                                _this.changeColorToRed();
                                _this.raiseButton();
                            }, DOWN_TIME_MS);
                            if (_this.parentID !== NO_ID) {
                                _this.changeParentColorToGreen();
                            } else {
                                if (DEBUG) {
                                    print("last node...calling gate open method");
                                }
                                Entities.callEntityServerMethod(gate, 'openGate');
                            }
                        } else {
                            if (DEBUG) {
                                print("child is not yellow...cannot push this one yet");
                            }
                        }
                    } else {
                        if (DEBUG) {
                            print("no child button...pressing this one...should be yellow now");
                        }
                        _this.lowerButton();
                        _this.changeColorToYellow();
                        Script.setTimeout(function() {
                            _this.changeColorToGreen();
                            _this.raiseButton();
                        }, DOWN_TIME_MS);
                        if (_this.parentID) {
                            _this.changeParentColorToGreen();
                        }
                    }
                    return;
                }
            }
        },
        changeColorToGreen: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: GREEN
            });
            _this.color = GREEN;
        },
        changeColorToRed: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: RED
            });
            _this.color = RED;
        },
        changeColorToYellow: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: YELLOW
            });
            _this.color = YELLOW;
        },
        raiseButton: function() {
            Entities.editEntity(_this.entityID, {
                position: position //POSITION_INACTIVE
            });
        },
        lowerButton: function() {
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            position.y -= BUTTON_PRESS_OFFSET;
            Entities.editEntity(_this.entityID, {
                position: position //POSITION_ACTIVE
            });
        },
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (!Pointers.isMouse(mouseEvent.id)) {
                if (Pointers.isLeftHand(mouseEvent.id)) {
                    currentHand = 0;
                } else if (Pointers.isRightHand(mouseEvent.id)) {
                    currentHand = 1;
                }
            }
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        startNearTrigger: function(entityID, mouseEvent) {
            if (Pointers.isLeftHand(mouseEvent.id)) {
                currentHand = 0;
            } else if (Pointers.isRightHand(mouseEvent.id)) {
                currentHand = 1;
            }
            if (DEBUG) {
                print("trigger on button");
            }
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (DEBUG) {
                if (!mouseEvent.button === "Primary") {
                    return;
                }
                if (_this.type === "hold") {
                    Entities.callEntityServerMethod(gate, 'stopMovement');
                    _this.changeColorToGreen();
                    _this.raiseButton();
                    return;
                } else if (_this.type === "synch") {
                    Entities.callEntityServerMethod(gate, 'stopMovement');
                    _this.changeColorToGreen();
                    _this.raiseButton();
                    return;
                }
            }
        },
        stopNearTrigger: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (!Pointers.isMouse(mouseEvent.id)) {
                if (Pointers.isLeftHand(mouseEvent.id)) {
                    currentHand = 0;
                } else if (Pointers.isRightHand(mouseEvent.id)) {
                    currentHand = 1;
                }
            }
            if (DEBUG) {
                print("stop near trigger on button");
            }
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        unload: function() {
            if (boatSound) {
                boatSound.stop();
            }
        }
    };

    return new Button();
});
