package io.mateu.core.domain.out.componentmapper;

public final class ExporterContext {

  private static final ThreadLocal<Boolean> EXCEL = new ThreadLocal<>();
  private static final ThreadLocal<Boolean> PDF = new ThreadLocal<>();
  private static final ThreadLocal<Boolean> CSV = new ThreadLocal<>();

  static void set(boolean excel, boolean pdf, boolean csv) {
    EXCEL.set(excel);
    PDF.set(pdf);
    CSV.set(csv);
  }

  static void clear() {
    EXCEL.remove();
    PDF.remove();
    CSV.remove();
  }

  public static boolean isExcelAvailable() {
    return Boolean.TRUE.equals(EXCEL.get());
  }

  public static boolean isPdfAvailable() {
    return Boolean.TRUE.equals(PDF.get());
  }

  public static boolean isCsvAvailable() {
    return Boolean.TRUE.equals(CSV.get());
  }
}
