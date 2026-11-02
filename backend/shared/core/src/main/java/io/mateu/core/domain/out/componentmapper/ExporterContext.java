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

  /**
   * The formats an exporter is registered for. A page can also be mapped without going through the
   * component mapper bean (a view embedded in a menu or a drawer is mapped straight to its page),
   * so with no mapping in progress the registered exporters are asked directly: otherwise such a
   * listing loses its Export buttons although the action behind them works. Empty before Mateu has
   * booted.
   */
  public static Set<ExportFormat> available() {
    var available = AVAILABLE.get();
    if (available != null) {
      return available;
    }
    try {
      return io.mateu.core.domain.act.ListingExporters.formats(
          io.mateu.uidl.di.MateuBeanProvider.getSingletonBeans(
              io.mateu.uidl.interfaces.ListingExporter.class));
    } catch (RuntimeException notInitialised) {
      return EnumSet.noneOf(ExportFormat.class);
    }
  }
}
