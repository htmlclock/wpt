import '/resources/testharness.js'

globalThis.setup({allow_uncaught_exception: true});

globalThis.log = [];

globalThis.addEventListener("error",
    ev => log.push("globalThis-error", ev.error.message));
globalThis.addEventListener("onunhandledrejection", unreachable);

globalThis.test_load = async_test("Test evaluation order of modules");

globalThis.addEventListener("load", ev => testDone());

function unreachable() { log.push("unexpected"); }
globalThis.testDone = function() {
  globalThis.test_load.step(() => {
    assert_array_equals(log, [
        "message", "post-message",
        "step-2.2-1", "step-2.2-2",
        "microtask-2.2",
        "import-error", "error",
      ]);
  });
  globalThis.test_load.done();
}


globalThis.addEventListener("message", (event) => {
  log.push("message", event.data);
});

import("./evaluation-order-2.1.mjs").catch(
  error => log.push("import-error", error.message));

done();
