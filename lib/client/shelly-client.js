/**
 * shelly-client.js - Shelly client.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */
'use strict';

const fetch = require('node-fetch');
const {URL} = require('url');
const {URLSearchParams} = require('url');

/**
 * Client for Shelly devices
 *
 */
class ShellyClient {

  basicInfo(host) {
    var url = "http://" + host + "/shelly";

    return fetch(url, {
      method: "POST",
    }).then(res => res.json());
  }

  constructor() {
    this.bulb = new ShellyBulbClient();
    this.one = new Shelly1Client();
  }
}

class ShellyBulbClient {

  /**
   * Turns the bulb on/off.
   *
   * @param {string} host hostName of the device.
   * @param {string} state The desired radius of the circle.
   */
  turn(host, state) {
    console.log("turning to : " + host + " " + state);
    var url = "http://" + host + "/light/0";
    const params = new URLSearchParams();
    params.append('turn', state);

    return fetch(url, {
      method: "POST",
      body: params,
    }).then(res => res.json());
  };

  /**
   * Sets Mode, white or color.
   *
   * @param {string} host hostName of the device.
   * @param {string} mode The desired mode `white` or `color`.
   */
  setMode(host, mode) {
    var url = "http://" + host + "/settings";
    const params = new URLSearchParams();
    params.append('mode', mode);

    return fetch(url, {
      method: "POST",
      body: params,
    }).then(res => res.json());
  };

  /**
   * Sets the color.
   * @see ShellyBulbClient#setMode
   *
   * @param {string} host hostName of the device.
   * @param {number} red The amount of red, from 0 to 255.
   * @param {number} green The amount of green, from 0 to 255.
   * @param {number} blue The amount of blue, from 0 to 255.
   * @param {number} white The amount of white, from 0 to 255.
   */
  setColor(host, red, green, blue, white) {
    var url = "http://" + host + "/light/0";
    const params = new URLSearchParams();
    params.append('red', red);
    params.append('green', green);
    params.append('blue', blue);
    params.append('white', white);

    return fetch(url, {
      method: "POST",
      body: params,
    }).then(res => res.json());
  };

  /**
   * Sets the brightness.
   * @see ShellyBulbClient#setMode
   * 
   * @param {string} host hostName of the device.
   * @param {number} brightness How bright, from 0 to 100.
   * @param {number} brightness Temperature in K from 3000 to 6500.
   */
  setBrightness(host, brightness, temperature) {
    var url = "http://" + host + "/light/0";
    const params = new URLSearchParams();
    params.append('brightness', brightness);
    params.append('temp', temperature);

    return fetch(url, {
      method: "POST",
      body: params,
    }).then(res => res.json());
  };

}

class Shelly1Client {

  /**
   * Turns the relay on/off.
   *
   * @param {string} host hostName of the device.
   * @param {string} state on or off.
   */
  turn(host, state) {
    console.log("turning relay to : " + host + " " + state);
    var url = "http://" + host + "/relay/0";
    const params = new URLSearchParams();
    params.append('turn', state);

    return fetch(url, {
      method: "POST",
      body: params,
    }).then(res => res.json());
  };
}


module.exports = {
  ShellyClient,
};

