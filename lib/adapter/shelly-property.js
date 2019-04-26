/**
 * Shelly property type.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

const {Property} = require('gateway-addon');

const {ShellyClient, DEVICE_TYPE} = require('../../lib/client');

class ShellyProperty extends Property {
  constructor(device, name, propertyDescription) {
    super(device, name, propertyDescription);
    this.setCachedValue(propertyDescription.value);
    this.device.notifyPropertyChanged(this);
  }

  /**
   * Set the value of the property.
   *
   * @param {*} value The new value to set
   * @returns a promise which resolves to the updated value.
   *
   * @note it is possible that the updated value doesn't match
   * the value passed in.
   */
  setValue(value) {
    let ret;
    switch (this.device.shellyType) {
      case DEVICE_TYPE.BULB:
        ret = this.setBulbValue(value);
        break;
      case DEVICE_TYPE.ONE:
        ret = this.setOneValue(value);
        break;
    }

    this.device.notifyPropertyChanged(this);
    return ret;
  }

  setBulbValue(value) {
    return new Promise((resolve, reject) => {
      super.setValue(value).then((updatedValue) => {
        resolve(value);
        const client = new ShellyClient.ShellyClient();

        switch (this.name) {
          case 'on':
            client.bulb.turn(`${this.device.name}.local.`, updatedValue ? 'on' : 'off')
              .then(() => {
                this.setCachedValue(value);
                this.device.notifyPropertyChanged(this);
              });

            break;
          case 'color':
            const rgb = hexToRgb(this.value);
            client.bulb.setColor(`${this.device.name}.local.`, rgb.r, rgb.g, rgb.b, 0)
              .then(() => {
                this.setCachedValue(value);
                this.device.notifyPropertyChanged(this);
              });
            break;
        }

        this.device.notifyPropertyChanged(this);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }

  setOneValue(value) {
    return new Promise((resolve, reject) => {
      super.setValue(value).then((updatedValue) => {
        resolve(value);
        const client = new ShellyClient.ShellyClient();

        client.one.turn(`${this.device.name}.local.`, updatedValue ? 'on' : 'off')
          .then(() => {
            this.setCachedValue(value);
            this.device.notifyPropertyChanged(this);
          });

        this.device.notifyPropertyChanged(this);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }
}

function hexToRgb(hex) {
  const groups = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return groups ?
    {
      r: parseInt(groups[1], 16),
      g: parseInt(groups[2], 16),
      b: parseInt(groups[3], 16),
    } :
    null;
}


module.exports = ShellyProperty;
