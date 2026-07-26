package io.mateu.mdd.demofrontoffice.domain.stay;

/**
 * The operational side of a check-in — the tasks the front desk performs around the arrival,
 * beyond the stay lifecycle itself: creating the wifi card, encoding the key/wristband, capturing
 * the guest's signature on the tablet, charging/pre-authorizing the payment and closing the
 * ancillaries selection. Two more operations are DERIVED, not stored here: the guests'
 * documentation (from the companions' identity) and the room readiness (from housekeeping).
 *
 * <p>Each flag flips exactly once per stay, from the Reserva 360 quick actions or from the
 * check-in wizard's steps — both write here, so the 360 checklist and the wizard's
 * "only what's missing" branching always agree.
 */
public record CheckInOps(
    boolean wifi, boolean llave, boolean firma, boolean cobro, boolean extras) {

  public static CheckInOps none() {
    return new CheckInOps(false, false, false, false, false);
  }

  public CheckInOps withWifi(boolean wifi) {
    return new CheckInOps(wifi, llave, firma, cobro, extras);
  }

  public CheckInOps withLlave(boolean llave) {
    return new CheckInOps(wifi, llave, firma, cobro, extras);
  }

  public CheckInOps withFirma(boolean firma) {
    return new CheckInOps(wifi, llave, firma, cobro, extras);
  }

  public CheckInOps withCobro(boolean cobro) {
    return new CheckInOps(wifi, llave, firma, cobro, extras);
  }

  public CheckInOps withExtras(boolean extras) {
    return new CheckInOps(wifi, llave, firma, cobro, extras);
  }
}
