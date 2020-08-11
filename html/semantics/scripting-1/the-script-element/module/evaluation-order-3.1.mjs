log.push("step-3.1-1");
queueMicrotask(() => log.push("microtask-3.1"));
log.push("step-3.1-2");

import("./evaluation-order-3.2.mjs").catch(
    exception => {
      log.push("catch", exception.message);
      testDone();
    });

log.push("step-3.1-3");
