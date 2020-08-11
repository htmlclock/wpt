log.push("step-1-1");
queueMicrotask(() => log.push("microtask"));
log.push("step-1-2");
