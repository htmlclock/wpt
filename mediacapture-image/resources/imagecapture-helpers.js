'use strict';

// These tests rely on the User Agent providing an implementation of
// platform image capture backends.
//
// In Chromium-based browsers this implementation is provided by a polyfill
// in order to reduce the amount of test-only code shipped to users. To enable
// these tests the browser must be run with these options:
//
//   --enable-blink-features=MojoJS,MojoJSTest

let loadChromiumResources = Promise.resolve().then(() => {
  if (!('MojoInterfaceInterceptor' in self)) {
    // Do nothing on non-Chromium-based browsers or when the Mojo bindings are
    // not present in the global namespace.
    return;
  }

  let chain = Promise.resolve();
  [
    '/resources/chromium/mojo_bindings.js',
    '/resources/chromium/image_capture.mojom.js',
    '/resources/chromium/mock-imagecapture.js',
  ].forEach(path => {
    // Use importScripts for workers.
    if (typeof document === 'undefined') {
      chain = chain.then(() => importScripts(path));
      return;
    }
    let script = document.createElement('script');
    script.src = path;
    script.async = false;
    chain = chain.then(() => new Promise(resolve => {
      script.onload = () => resolve();
    }));
    document.head.appendChild(script);
  });

  return chain;
});

async function initialize_image_capture_tests() {
  if (typeof ImageCaptureTest === 'undefined') {
    await loadChromiumResources;
  }
  assert_true(typeof ImageCaptureTest !== 'undefined');
  let imageCaptureTest = new ImageCaptureTest();
  await imageCaptureTest.initialize();
  return imageCaptureTest;
}

function image_capture_test(func, name, properties) {
  promise_test(async (t) => {
    let imageCaptureTest = await initialize_image_capture_tests();
    try {
      await func(t, imageCaptureTest);
    } finally {
      await imageCaptureTest.reset();
    };
  }, name, properties);
}

function assert_point2d_array_approx_equals(actual, expected, epsilon) {
  assert_equals(actual.length, expected.length, 'length');
  for (var i = 0; i < actual.length; ++i) {
    assert_approx_equals(actual[i].x, expected[i].x, epsilon, 'x');
    assert_approx_equals(actual[i].y, expected[i].y, epsilon, 'y');
  }
}
