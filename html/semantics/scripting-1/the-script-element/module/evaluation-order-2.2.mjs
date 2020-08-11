log.push("step-2.2-1");
queueMicrotask(() => log.push("microtask-2.2"));
log.push("step-2.2-2");

test_load.step_timeout(() => testDone(), 0);

throw new Error("error");
