package io.mateu.core.infra.declarative.orchestrators.crud;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A @Lookup field without label= (and a view that is no LookupLabelSupplier) resolves to a null
 * supplier; the writer must fall back to the raw id instead of throwing an NPE.
 */
class LookupFieldDataWriterTest {

  static class View {
    String agencia = "DIRECTOS";
    List<String> agencias = List.of("DIRECTOS", "ACME");
  }

  @Test
  void nullLabelSupplierFallsBackToRawIdOnSingleValue() throws Exception {
    var data = new HashMap<String, Object>();

    LookupFieldDataWriter.writeField(
        View.class.getDeclaredField("agencia"), new View(), null, data, null);

    assertEquals("DIRECTOS", data.get("agencia-label"));
  }

  @Test
  void nullLabelSupplierFallsBackToRawIdsOnCollection() throws Exception {
    var data = new HashMap<String, Object>();

    LookupFieldDataWriter.writeField(
        View.class.getDeclaredField("agencias"), new View(), null, data, null);

    assertEquals("DIRECTOS, ACME", data.get("agencias-label"));
  }
}
