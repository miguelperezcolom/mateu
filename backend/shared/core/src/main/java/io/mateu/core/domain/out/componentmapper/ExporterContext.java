package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.data.ExportFormat;
import java.util.EnumSet;
import java.util.Set;

/**
 * The export formats some registered {@link io.mateu.uidl.interfaces.ListingExporter} writes, for
 * the duration of one mapping (the listing builders read it to decide which Export buttons to
 * offer).
 */
public final class ExporterContext {

  private static final ThreadLocal<Set<ExportFormat>> AVAILABLE = new ThreadLocal<>();

  private ExporterContext() {}

  static void set(Set<ExportFormat> available) {
    AVAILABLE.set(available);
  }

  static void clear() {
    AVAILABLE.remove();
  }

  /** The formats an exporter is registered for (empty outside a mapping). */
  public static Set<ExportFormat> available() {
    var available = AVAILABLE.get();
    return available != null ? available : EnumSet.noneOf(ExportFormat.class);
  }
}
