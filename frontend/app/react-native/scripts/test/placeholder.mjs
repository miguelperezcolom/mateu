// Replaced by mock.module in the test that stubs this package; importing it unmocked is a test bug.
throw new Error(`unmocked native package: ${new URL(import.meta.url).searchParams.get('pkg')}`);
