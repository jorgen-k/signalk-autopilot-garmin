# signalk-autopilot


`signalk-autopilot-garmin` is composed of 2 modules:
- [A graphical interface that emulates a GHC-20]
- A back-end API described below.

This currently has limited support for Garmin Reactor. 

Also, signalk-to-nmea0183 plugin with APB (for route control) and MWV (for wind steer) should be enabled.

# Current State

The current state of the autopilot is not implemented. Will later be found at the following paths:

- steering.autopilot.target.headingMagnetic
- steering.autopilot.target.windAngleApparent
- steering.autopilot.state (standby, wind, route, or auto)

# API

All messages to plugin are done using PUT requests. These can be done via HTTP or over WebSockets.

Detailed info on [PUT](https://signalk.org/specification/1.3.0/doc/put.html) and [Request/Response](https://signalk.org/specification/1.3.0/doc/request_response.html)


## Set Autopilot State

The `value` can be `auto` or `standby`. The states `wind` and `route` is not yet supported.

```
PUT http://localhost:3000/signalk/v1/api/vessels/self/steering/autopilot/state
{
  "value": "auto"
}
```

Increase/decrease of heading is supported with steps of 1 or 15 degrees.

