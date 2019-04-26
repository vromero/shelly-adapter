/**
 * Shelly device type.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

const ShellyProperty = require('./shelly-property');

const {Device} = require('gateway-addon');

class ShellyDevice extends Device {
  constructor(adapter, id, shellyType, deviceDescription) {
    super(adapter, id);
    this.name = deviceDescription.name;
    this.type = deviceDescription.type;
    this['@type'] = deviceDescription['@type'];
    this.description = deviceDescription.description;
    this.shellyType = shellyType;

    for (const propertyName in deviceDescription.properties) {
      const propertyDescription = deviceDescription.properties[propertyName];
      const property = new ShellyProperty(this, propertyName, propertyDescription);
      this.properties.set(propertyName, property);
    }
  }
}

module.exports = ShellyDevice;
