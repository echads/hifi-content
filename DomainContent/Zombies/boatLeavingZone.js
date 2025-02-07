//
// boatLeavingZone.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    var BOAT = "{4691d6ad-93f5-4456-90b9-95c9f2ef00b2}";
    var DEBUG = 0;
    var AUDIO_VOLUME_LEVEL = 0.5;
    var NEGATIVE = -1;
    var SURVIVOR_SCRIPT = "https://echads.github.io/hifi-content/DomainContent/Zombies/zombieSurvivorScript.js";
    var BOAT_HORN_SOUND = "https://echads.github.io/hifi-content/DomainContent/Zombies/sounds/346108__limetoe__boat-horn.wav";

    var hasLeft = false;
    var sound;

    var BoatLeavingZone = function() {
    };

    BoatLeavingZone.prototype = {
        preload: function(entityID) {
            sound = SoundCache.getSound(Script.resolvePath(BOAT_HORN_SOUND));
        },
        reset: function(){
            hasLeft = false;
        },
        enterEntity: function() {
            if (DEBUG) {
                print("entered boatLeaving zone");
            }
            if (!hasLeft) {
                hasLeft = true;
                var runningScripts = JSON.stringify(ScriptDiscoveryService.getRunning());
                if (DEBUG) {
                    print(runningScripts);
                }
                if (runningScripts.indexOf(SURVIVOR_SCRIPT) !== NEGATIVE) {
                    if (DEBUG) {
                        print("avatar is a survivor");
                    }
                    if (sound.downloaded) {
                        Audio.playSound(sound, {
                            position: Entities.getEntityProperties(BOAT, 'position').position,
                            volume: AUDIO_VOLUME_LEVEL
                        });
                    }
                    Entities.callEntityServerMethod(BOAT, 'leaveIsland');
                }
            }
        }
    };

    return new BoatLeavingZone();
});
