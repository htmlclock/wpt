log.push("step-3.2-1");
queueMicrotask(() => log.push("microtask-3.2"));
log.push("step-3.2-2");

throw new Error("error");
