package io.mateu.mdd.demofrontoffice.domain.stay;

/** The kind of incident — drives triage (who gets notified) and the ficha's icon. */
public enum IncidentType {
  TV("TV", "\uD83D\uDCFA"),
  CLIMA("Climatización", "\uD83C\uDF21"),
  SERVICIO("Servicio de habitaciones", "\uD83D\uDECE"),
  RESTAURANTE("Restaurante", "\uD83C\uDF7D"),
  LIMPIEZA("Limpieza", "\uD83E\uDDF9"),
  GENERAL("General", "\u26A0");

  private final String label;
  private final String icon;

  IncidentType(String label, String icon) {
    this.label = label;
    this.icon = icon;
  }

  public String label() {
    return label;
  }

  public String icon() {
    return icon;
  }
}
