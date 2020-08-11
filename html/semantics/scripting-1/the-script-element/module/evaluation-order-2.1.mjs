log.push("step-2.1-1");
queueMicrotask(() => log.push("microtask-2.1"));
log.push("step-2.1-2");

// import is evaluated first.
import "./evaluation-order-2.2.mjs";

log.push("step-2.1-3");
