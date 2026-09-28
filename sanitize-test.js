function verifyOutputs(inputArray, outputArray) {
  const uniqueTracker = new Set();
  let allPassed = true;

  if (inputArray.length !== outputArray.length) {
    console.error(`Fail (input/output mismatch): Expected ${inputArray.length} outputs, got ${outputArray.length}.`);
    allPassed = false;
  }

  outputArray.forEach((key, idx) => {
    console.log(`Checking output[${idx}]: "${key}"`);

    if (!key || key.length === 0) {
      console.error(`Fail (a): Index ${idx} is empty.`);
      allPassed = false;
    }

    if (!/^[a-z0-9_]+$/.test(key)) {
      console.error(`Fail (b): Index ${idx} contains invalid characters.`);
      allPassed = false;
    }

    if (/^[0-9]/.test(key)) {
      console.error(`Fail (c): Index ${idx} starts with a number.`);
      allPassed = false;
    }

    if (uniqueTracker.has(key)) {
      console.error(`Fail (d): Index ${idx} is a duplicate key.`);
      allPassed = false;
    }

    uniqueTracker.add(key);
  });

  if (allPassed) {
    console.log("\n SUCCESS: Every single rule was perfectly satisfied across all nasty inputs.");
  } else {
    console.log("\n FAILURE: One or more constraints leaked.");
  }
}

verifyOutputs(maliciousInputs, processedHeaders);