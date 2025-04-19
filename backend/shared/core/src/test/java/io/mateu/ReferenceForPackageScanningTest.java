package io.mateu;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ReferenceForPackageScanningTest {

    @Test
    void exists() {
        var referenceForPackageScanning = new ReferenceForPackageScanning();
        assertNotNull(referenceForPackageScanning);
        assertEquals(
                "io.mateu.ReferenceForPackageScanning",
                referenceForPackageScanning.getClass().getName());
    }

}