/**
 * shelly-client.js - Shelly client.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */
'use strict';

const dnssd = require('dnssd');
const EventEmitter = require('events');

const STATE = {STOPPED: 'stopped', STARTED: 'started'};
const DEVICE_TYPE = {BULB: 'bulb', ONE: '1'};

class ShellyDeviceBrowser {

  /**
   * Creates a new Browser
   *
   * @param {number} timeout - number milliseconds to spend browsing
   */
  constructor(timeout) {
    this.state = STATE.STOPPED;
    this.timeout = timeout;
    this.bulbRegex = new RegExp("shelly" + DEVICE_TYPE.BULB + "-.*", "g");
    this.oneRegex = new RegExp("shelly" + DEVICE_TYPE.ONE + "-.*", "g");
    this.emitter = new EventEmitter();
  }

  /**
   * Creates a new Browser
   *
   * @emits 'deviceUp'
   * @emits 'error'
   */
  start() {
    if (this.state === STATE.STARTED) {
      return;
    }

    this.state = STATE.STARTED;

    const browser = dnssd.Browser(dnssd.tcp('_http'))
      .on('serviceUp', service => {
        if (service.name.match(this.bulbRegex)) {
          this.emitter.emit('deviceUp', new ShellyDevice(DEVICE_TYPE.BULB, service.name, service.host, service.txt.fw_id, service.txt.arch));
        } else if (service.name.match(this.oneRegex)) {
          this.emitter.emit('deviceUp', new ShellyDevice(DEVICE_TYPE.ONE, service.name, service.host, service.txt.fw_id, service.txt.arch));
        }
      })
      .start();

    setTimeout(function () {
      this.state = STATE.STOPPED;
      return browser.stop();
    }, this.timeout);

    return this.emitter;
  }
}

class ShellyDevice {
  constructor(type, name, hostName, firmwareId, architecture) {
    this.type = type;
    this.name = name;
    this.hostName = hostName;
    this.firmwareId = firmwareId;
    this.architecture = architecture;
  }
}

module.exports = {
  ShellyDeviceBrowser, DEVICE_TYPE
};

