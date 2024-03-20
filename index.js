/*
 * Copyright 2024 Jörgen Karlsson <jorgen@karlsson.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const modules = {
  garmin: require('./garmin_reactor')
};


module.exports = function (app) {
  var plugin = {};
  var autopilot;


  plugin.start = function (props) {
    const type = props.type;
    app.debug(`Initializing autopilot of type ${type}...`);
    if (!modules[type]) {
      app.error(`Autopilot type '${type}' is not recognized.`);
      return;
    }
    try {
      const initModule = modules[type];
      if (typeof initModule !== 'function') {
        throw new Error(`Module for type '${type}' does not export a function.`);
      }
      autopilot = initModule(app);
      if (!autopilot || typeof autopilot.start !== 'function') {
        throw new Error(`Module for type '${type}' did not initialize correctly.`);
      }

      app.debug(`Starting autopilot of type '${type}'`);
      autopilot.start(props);
      app.registerPutHandler('vessels.self', "steering.autopilot.state", autopilot.putState);
      app.registerPutHandler('vessels.self', "steering.autopilot.actions.adjustHeading", autopilot.putAdjustHeading);
      /*  TODO in future the following put handlers could be added:  
      targetHeadingPath = "steering.autopilot.target.headingMagnetic";
      targetWindPath = "steering.autopilot.target.windAngleApparent";
      tack = "steering.autopilot.actions.tack";
      advance = "steering.autopilot.actions.advanceWaypoint";
      */
    } catch (error) {
      app.error(`Failed to initialize autopilot type '${type}': ${error.message}`);
    }
  };

  plugin.stop = function () {
    if (autopilot) {
      autopilot.stop();
    }
  };

  plugin.id = "autopilot-garmin";
  plugin.name = "Autopilot Garmin Control";
  plugin.description = "Plugin that controls a Garmin Reactor autopilot";

  plugin.schema = function () {
    let config = {
      title: "Autopilot Control",
      type: "object",
      properties: {
        type: {
          type: 'string',
          title: 'Autopilot Type',
          enum: [
            'garmin'
          ],
          enumNames: [
            'Garmin Reactor'
          ],
          default: 'garmin'
        }
      }
    };

    config.properties = { ...autopilot.properties(), ...config.properties };
    return config;
  };

  return plugin;
};

