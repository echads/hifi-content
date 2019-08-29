//
//  moveableCourtyardPart_server.js
//
//  Created by Rebecca Stankus on 07/16/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;

    var MOVEMENT_VELOCITY_M_PER_SEC = 0.2;
    var POSITION_CHECK_INTERVAL_MS = 70;
    var EPSILON_M = 0.01;
    
    var RAISE_SOUND = SoundCache.getSound(Script.resolvePath("resources/sounds/RAISE_SOUND.mp3"));
    var LOWER_SOUND = SoundCache.getSound(Script.resolvePath("resources/sounds/LOWER_SOUND.mp3"));
    var RAISE_VOLUME = 0.5;
    var LOWER_VOLUME = 0.5;

    var positionCheckInterval;
    var loweredPosition;
    var raisedPosition;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at specified position and volume */
    var injector;
    function playSound(sound, position, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************


    var MovableCourtyardPart = function() {
        _this = this;
    };

    MovableCourtyardPart.prototype = {
        remotelyCallable: ['lower', 'raise'],

        // Sets up each entity's raised and lowered positions
        preload: function(entityID){
            _this.entityID = entityID;
            var name = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (name === "Courtyard Floor") {
                raisedPosition = { x: 141.7535, y: -98.7992, z: -359.0804 };
                loweredPosition = { x: raisedPosition.x, y: -100.9117, z: raisedPosition.z };
            } else if (name === "Courtyard Table") {
                raisedPosition = { x: 140.7712, y: -98.2379, z: -358.2352 };
                loweredPosition = { x: raisedPosition.x, y: -101.1064, z: raisedPosition.z };
            }
        },

        // raise an object via velocity until it reaches a specific position
        raise: function() {
            // Clear check interval if one exists.
            if (positionCheckInterval) {
                Script.clearInterval(positionCheckInterval);
                positionCheckInterval = false;
            }

            // Check if already raised
            var currentPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
            if (currentPosition.y >= raisedPosition.y - EPSILON_M &&
                currentPosition.y <= raisedPosition.y + EPSILON_M) {
                return;
            }

            // Check that courtyard part has not been raised above the desired point
            if (currentPosition.y > raisedPosition.y) {
                print("RESET-------");
                Entities.editEntity(_this.entityID, {
                    position: raisedPosition
                });
                return;
            }

            playSound(RAISE_SOUND, Entities.getEntityProperties(_this.entityID, 'position').position, RAISE_VOLUME);

            // Start raising the object.
            Entities.editEntity(_this.entityID, {
                velocity: { x: 0, y: MOVEMENT_VELOCITY_M_PER_SEC, z: 0 }
            });

            // Start the check interval that stops the object when it's fully raised.
            positionCheckInterval = Script.setInterval(function() {
                var position = Entities.getEntityProperties(_this.entityID, 'position').position;
                print("POSITION.Y: ", position.y, " AND RAISEDPOSITION.Y IS: ", raisedPosition.y);
                if (position.y >= raisedPosition.y) {
                    print("OBJECT IS IN PLACE");
                    Entities.editEntity(_this.entityID, {
                        position: raisedPosition,
                        velocity: { x: 0, y: 0, z: 0 }
                    });

                    Script.clearInterval(positionCheckInterval);
                    if (injector) {
                        injector.stop();
                    }
                    positionCheckInterval = false;
                }
            }, POSITION_CHECK_INTERVAL_MS);
        },

        // lower an object via velocity until it reaches a specific position
        lower: function() {
            // Clear check interval if one exists.
            if (positionCheckInterval) {
                Script.clearInterval(positionCheckInterval);
                positionCheckInterval = false;
            }

            // Check if already lowered.
            var currentPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
            if (currentPosition.y >= loweredPosition.y - EPSILON_M &&
                currentPosition.y <= loweredPosition.y + EPSILON_M) {
                return;
            }

            // Check that courtyard part has not been lowered above the desired point
            if (currentPosition.y < loweredPosition.y) {
                Entities.editEntity(_this.entityID, {
                    position: loweredPosition
                });
                return;
            }

            playSound(LOWER_SOUND, Entities.getEntityProperties(_this.entityID, 'position').position, LOWER_VOLUME);

            // Start lowering the object.
            Entities.editEntity(_this.entityID, {
                velocity: { x: 0, y: -MOVEMENT_VELOCITY_M_PER_SEC, z: 0 }
            });

            // Start the check interval that stops the object when it's fully lowered.
            positionCheckInterval = Script.setInterval(function() {
                var position = Entities.getEntityProperties(_this.entityID, 'position').position;
                if (position.y <= loweredPosition.y) {
                    Entities.editEntity(_this.entityID, {
                        position: raisedPosition,
                        velocity: { x: 0, y: 0, z: 0 }
                    });

                    // extra check to make sure velocity gets set to 0
                    // var currentYVelocity = Entities.getEntityProperties(_this.entityID, 'velocity').velocity.y;
                    // print("CURRENT Y VELOCITY IS ", currentYVelocity);
                    Script.clearInterval(positionCheckInterval);
                    if (injector) {
                        injector.stop();
                    }
                    positionCheckInterval = false;
                }
            }, POSITION_CHECK_INTERVAL_MS);
        },

        unload: function() {
            if (positionCheckInterval) {
                Script.clearInterval(positionCheckInterval);
                positionCheckInterval = false;
                // Only reposition on script stopping if it was in the process of moving
                Entities.editEntity(_this.entityID, {
                    position: loweredPosition,
                    velocity: {x: 0, y: 0, z: 0}
                });
            }
            
        }
    };

    return new MovableCourtyardPart();
});
