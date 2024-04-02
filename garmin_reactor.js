
/*
 * Copyright 2024 Jörgen Karlsson <jorgen@karlsson.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const successRes = { state: 'SUCCESS' };
const failureRes = { state: 'FAILURE' };

const generateMsg = (n2kAddr, ccuAddr, message) => `${(new Date()).toISOString()},7,126720,${n2kAddr},${ccuAddr},${message}`;
const changeHeadingCommand = (code) => `09,E5,98,10,17,04,04,26,${code},00,FF,FF,FF,FF`;
const changeStateCommand = (code)   => `0B,E5,98,10,17,04,04,05,0A,00,${code},00,FF,FF`;
const headingCodeMap = new Map([
  [1, "02"],
  [15, "03"],
  [-1, "00"],
  [-15, "01"],
]);
const stateCodeMap = {
  auto:     `05`,
  standby:  `02`,
  wind:     `11`,
};


module.exports = function(app) {
  var srcAddr = '3'; // TODO: Calculate automatically
  var ccuAddr = '0';  // Will be discovered
  var pilot = { id: ccuAddr };
  var discovered = false;
  var hwVersion;

  pilot.start = (props) => {
    ccuAddr = props.ccuAddr || ccuAddr;
    srcAddr = props.srcAddr; // TODO: Calculate automatically
    pilot.id = ccuAddr;
    app.debug('Garmin autopilot started:', ccuAddr);
  };

  pilot.stop = () => {
    // Placeholder if needed
  };

  function sendNmea2000(msg) {
    app.debug("nmea2000out: " + msg);
    app.emit('nmea2000out', msg);
  }

  pilot.putState = (context, path, value, cb) => {
    app.debug(`putState: ${value}`);
    var code = stateCodeMap[value];
    if (code === undefined) {
      return { message: `Invalid state: ${value}`, ...failureRes };
    } else {
      let msg = generateMsg(srcAddr, ccuAddr, changeStateCommand(code));
      sendNmea2000(msg);
      return successRes;
    }
  };

  pilot.putAdjustHeading = (context, path, value, cb) => {
    app.debug(`putAdjustHeading: ${value}`);
    const code = headingCodeMap.get(value);
    if (code === undefined) { 
      console.log("Unimplemented code for /" + value + "/");
      return { message: `Invalid adjustment: ${value}`, ...failureRes };
    } else {
      sendNmea2000(generateMsg(srcAddr, ccuAddr, changeHeadingCommand(code)));
      return successRes;
    }
  };

  pilot.properties = () => {
    let description = 'No Garmin Reactor found';

    if (!discovered) {
      const sources = app.getPath('/sources');
      if (sources) {
        Object.values(sources).forEach(v => {
          if (typeof v === 'object') {
            Object.keys(v).forEach(id => {
              if (v[id] && v[id].n2k && v[id].n2k.hardwareVersion && v[id].n2k.hardwareVersion.startsWith('Garmin Reactor')) {
                discovered = true;
                ccuAddr = id;
                hwVersion = v[id].n2k.hardwareVersion;
                description = `Discovered a ${hwVersion} with id ${ccuAddr}`;
                app.debug(description);
              }
            });
          }
        });
      }
    }

    description = discovered ? `Discovered a ${hwVersion} with address ${ccuAddr}` : `No CCU discovered, using address ${ccuAddr}`;
    app.debug(description);
    pilot.id = ccuAddr;  
    return {
      ccuAddr: {
        type: "string",
        title: "Garmin CCU NMEA2000 ID",
        description: description,
        default: ccuAddr
      },
      srcAddr: {
        type: "string",
        title: "Source Address for plugin",
        description: "Use a free adress.",
        default: "3"
      }
    };
  };

  return pilot;
};
