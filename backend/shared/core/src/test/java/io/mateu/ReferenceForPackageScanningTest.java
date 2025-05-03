package io.mateu;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class ReferenceForPackageScanningTest {

  @Test
  void exists() {
    var referenceForPackageScanning = new ReferenceForPackageScanning();
    assertNotNull(referenceForPackageScanning);
    assertEquals(
        "io.mateu.ReferenceForPackageScanning", referenceForPackageScanning.getClass().getName());
  }
}
