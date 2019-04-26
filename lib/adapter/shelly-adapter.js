/**
 * Shelly Adapter.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

const shellyBrowser = require('../client/shelly-browser');
const ShellyDevice = require('./shelly-device');

const {Adapter} = require('gateway-addon');


class ShellyAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, 'ShellyAdapter', manifest.name);
    addonManager.addAdapter(this);
  }

  /**
   * Example process to add a new device to the adapter.
   *
   * @param {String} deviceId ID of the device to add.
   * @param {String} deviceDescription Description of the device to add.
   * @return {Promise} which resolves to the device added.
   */
  addDevice(deviceId, deviceDescription) {
    return new Promise((resolve, reject) => {
      if (deviceId in this.devices) {
        reject(`Device: ${deviceId} already exists.`);
      } else {
        const device = new ShellyDevice(this, deviceId, deviceDescription);
        this.handleDeviceAdded(device);
        resolve(device);
      }
    });
  }

  /**
     * Example process ro remove a device from the adapter.
     *
     * @param {String} deviceId ID of the device to remove.
     * @return {Promise} which resolves to the device removed.
     */
  removeDevice(deviceId) {
    return new Promise((resolve, reject) => {
      const device = this.devices[deviceId];
      if (device) {
        this.handleDeviceRemoved(device);
        resolve(device);
      } else {
        reject(`Device: ${deviceId} not found.`);
      }
    });
  }

  loadBulb(device) {
    console.log(`Loading bulb ${device.name}`);

    const mozillaIotDevice = new ShellyDevice(this, device.name, shellyBrowser.DEVICE_TYPE.BULB, {
      name: device.name,
      '@type': ['OnOffSwitch', 'Light', 'ColorControl'],
      type: 'onOffColorLight',
      description: 'Shelly Bulb',
      shellyType: 'bulb',
      properties: {
        on: {
          '@type': 'OnOffProperty',
          label: 'On/Off',
          name: 'on',
          type: 'boolean',
          value: false,
        },
        color: {
          '@type': 'ColorProperty',
          label: 'Color',
          name: 'on',
          type: 'string',
          value: '#ffffff',
        },
      },
    });

    this.handleDeviceAdded(mozillaIotDevice);
  }

  loadOne(device) {
    console.log(`Loading 1 ${device.name}`);

    const mozillaIotDevice = new ShellyDevice(this, device.name, shellyBrowser.DEVICE_TYPE.ONE, {
      name: device.name,
      '@type': ['OnOffSwitch'],
      type: 'onOffSwitch',
      shellyType: '1',
      properties: {
        on: {
          '@type': 'OnOffProperty',
          label: 'On/Off',
          name: 'on',
          type: 'boolean',
          value: false,
        },
      },
    });

    this.handleDeviceAdded(mozillaIotDevice);
  }

  /**
     * Start the pairing/discovery process.
     *
     * @param {Number} timeoutSeconds Number of seconds to run before timeout
     */
  startPairing(_timeoutSeconds) {
    console.log('ShellyAdapter:', this.name, 'id', this.id, 'pairing started');

    const shellyDeviceBrowser =
        new shellyBrowser.ShellyDeviceBrowser(_timeoutSeconds * 1000);

    shellyDeviceBrowser.start().on('deviceUp', (device) => {
      console.log('Device up: ', device);
      if (device.type.startsWith(shellyBrowser.DEVICE_TYPE.BULB)) {
        this.loadBulb(device);
      } else if (device.type.startsWith(shellyBrowser.DEVICE_TYPE.ONE)) {
        this.loadOne(device);
      } else {
        console.log(`Ignoring unsupported device type ${device.type}`);
      }
    });
  }

  /**
     * Cancel the pairing/discovery process.
     */
  cancelPairing() {
    console.log('ShellyAdapter:', this.name, 'id',
                this.id, 'pairing cancelled');
  }

  /**
     * Unpair the provided the device from the adapter.
     *
     * @param {Object} device Device to unpair with
     */
  removeThing(device) {
    console.log('ShellyAdapter:', this.name, 'id', this.id,
                'removeThing(', device.id, ') started');

    this.removeDevice(device.id).then(() => {
      console.log('ShellyAdapter: device:', device.id, 'was unpaired.');
    }).catch((err) => {
      console.error('ShellyAdapter: unpairing', device.id, 'failed');
      console.error(err);
    });
  }

  /**
     * Cancel unpairing process.
     *
     * @param {Object} device Device that is currently being paired
     */
  cancelRemoveThing(device) {
    console.log('ShellyAdapter:', this.name, 'id', this.id,
                'cancelRemoveThing(', device.id, ')');
  }

  startsWith(input, expected) {
    return (input.indexOf(expected) === 0);
  }
}


module.exports = ShellyAdapter;
