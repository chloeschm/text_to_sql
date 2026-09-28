function processHeaders(rawHeaders) {
  const seenKeys = new Set();

  return rawHeaders.map((rawHeader, index) => {
    let clean = String(rawHeader);

    clean = clean
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (clean.length > 60) {
      clean = clean.slice(0, 60).replace(/_+$/, '');
    }

    if (!clean) {
      clean = `column_${index + 1}`;
    }

    if (/^[0-9]/.test(clean)) {
      clean = 'num_' + clean;
    }

    let finalKey = clean;
    let counter = 1;

    while (seenKeys.has(finalKey)) {
      finalKey = `${clean}_${counter}`;
      counter++;
    }

    seenKeys.add(finalKey);
    return finalKey;
  });
}


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