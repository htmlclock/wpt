'use strict';

// These tests rely on the User Agent providing an implementation of the
// WebUSB Testing API (https://wicg.github.io/webusb/test/).
//
// In Chromium-based browsers this implementation is provided by a polyfill
// in order to reduce the amount of test-only code shipped to users. To enable
// these tests the browser must be run with these options:
//
//   --enable-blink-features=MojoJS,MojoJSTest

(() => {
  // Load scripts needed by the test API on context creation.
  if (isChromiumBased) {
    loadScript('/resources/chromium/webusb-child-test.js');
  }
})();

// This function is shared between blink/web_tests/usb and external/wpt/webusb.
// Only include "/gen/" paths here, which are available in both places.
async function loadChromiumResources() {
  const chromiumResources = [
    '/gen/mojo/public/mojom/base/big_buffer.mojom.js',
    '/gen/mojo/public/mojom/base/string16.mojom.js',
    '/gen/url/mojom/url.mojom.js',
    '/gen/services/device/public/mojom/usb_device.mojom.js',
    '/gen/services/device/public/mojom/usb_enumeration_options.mojom.js',
    '/gen/services/device/public/mojom/usb_manager_client.mojom.js',
    '/gen/third_party/blink/public/mojom/usb/web_usb_service.mojom.js',
  ];
  await loadMojoResources(chromiumResources);
}

function usb_test(func, name, properties) {
  promise_test(async () => {
    if (navigator.usb.test === undefined) {
      // Try loading a polyfill for the WebUSB Testing API.
      if (isChromiumBased) {
        await loadChromiumResources();
        await loadScript('/resources/chromium/webusb-test.js');
      } else {
        assert_implements(false, "missing navigator.usb.test");
      }
    }

    await navigator.usb.test.initialize();
    try {
      await func();
    } finally {
      await navigator.usb.test.reset();
    }
  }, name, properties);
}

// Returns a promise that is resolved when the next USBConnectionEvent of the
// given type is received.
function connectionEventPromise(eventType) {
  return new Promise(resolve => {
    let eventHandler = e => {
      assert_true(e instanceof USBConnectionEvent);
      navigator.usb.removeEventListener(eventType, eventHandler);
      resolve(e.device);
    };
    navigator.usb.addEventListener(eventType, eventHandler);
  });
}

// Creates a fake device and returns a promise that resolves once the
// 'connect' event is fired for the fake device. The promise is resolved with
// an object containing the fake USB device and the corresponding USBDevice.
function getFakeDevice() {
  let promise = connectionEventPromise('connect');
  let fakeDevice = navigator.usb.test.addFakeDevice(fakeDeviceInit);
  return promise.then(device => {
    return { device: device, fakeDevice: fakeDevice };
  });
}

// Disconnects the given device and returns a promise that is resolved when it
// is done.
function waitForDisconnect(fakeDevice) {
  let promise = connectionEventPromise('disconnect');
  fakeDevice.disconnect();
  return promise;
}

function assertRejectsWithError(promise, name, message) {
  return promise.then(() => {
    assert_unreached('expected promise to reject with ' + name);
  }, error => {
    assert_equals(error.name, name);
    if (message !== undefined)
      assert_equals(error.message, message);
  });
}

function assertDeviceInfoEquals(usbDevice, deviceInit) {
  for (var property in deviceInit) {
    if (property == 'activeConfigurationValue') {
      if (deviceInit.activeConfigurationValue == 0) {
        assert_equals(usbDevice.configuration, null);
      } else {
        assert_equals(usbDevice.configuration.configurationValue,
                      deviceInit.activeConfigurationValue);
      }
    } else if (Array.isArray(deviceInit[property])) {
      assert_equals(usbDevice[property].length, deviceInit[property].length);
      for (var i = 0; i < usbDevice[property].length; ++i)
        assertDeviceInfoEquals(usbDevice[property][i], deviceInit[property][i]);
    } else {
      assert_equals(usbDevice[property], deviceInit[property], property);
    }
  }
}

function callWithTrustedClick(callback) {
  return new Promise(resolve => {
    let button = document.createElement('button');
    button.textContent = 'click to continue test';
    button.style.display = 'block';
    button.style.fontSize = '20px';
    button.style.padding = '10px';
    button.onclick = () => {
      resolve(callback());
      document.body.removeChild(button);
    };
    document.body.appendChild(button);
    test_driver.click(button);
  });
}
