## Introduction

`signalk-autopilot-garmin` is a plugin for the Signal K server that provides limited support for controlling a Garmin Reactor autopilot. This plugin allows users to set the autopilot state and adjust heading via Signal K PUT requests.

**Compatibility Note**: This plugin is tested with Signal K Server version 2.6.2 only. 

## Tested Hardware

- Reactor™ 40 CCU
- GHC-20

NMEA200 connection via an [YDEN-02](https://www.yachtdevices.com.au/nmea-2000-ethernet-gateway-yden-02/)

Note that a GHC-20 or GHC-50 needs to be installed in the system following Garmins recommendations.


## Alpha Version Warning

**Caution**: This is an alpha version of the software. Use with caution as there may be bugs and incomplete features. We welcome bug reports and feature requests on our [GitHub issues page](https://github.com/jorgen-k/signalk-autopilot-garmin/issues).

## Getting Started

### Installation

For now has to be manually installed, will be available in the appstore in a comming version.

### Configuration Options

- `deviceID`: The NMEA 2000 device ID of your Garmin Reactor.

# Current State

The current state of the autopilot is *not implemented* in SignalK, since the Garmin proprietary NMEA PGNS's has not been reveresed engineered. When possible, it will later be found at the following paths to be compatible with other autopilots:

- steering.autopilot.target.headingMagnetic
- steering.autopilot.target.windAngleApparent
- steering.autopilot.state (standby, wind, route, or auto)

Inm the meantime you *must use your physical instruments*, a GHC-20 or similar, to check the state of the autopilot.

# API

All messages to plugin are done using PUT requests. These can be done via HTTP or over WebSockets.

Detailed info on [PUT](https://signalk.org/specification/1.7.0/doc/put.html) and [Request/Response](https://signalk.org/specification/1.7.0/doc/request_response.html)

This is *not* the new V2 API for autopilots. Will be available when it is available for the server. 

## Set Autopilot State

The `value` can be `auto` or `standby`. The states `wind` and `route` is *not yet supported* but might or will be in the future.

```
PUT http://localhost:3000/signalk/v1/api/vessels/self/steering/autopilot/state
{
  "value": "auto"
}
```

Increase/decrease of heading is supported with steps of 1 or 15 degrees. The autopilot must be in auto state for this to work.

```
PUT http://localhost:3000/signalk/v1/api/vessels/self/steering/actions/adjustHeading
{
  "value": -15
}
```


