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
    boolean wifi,
    boolean llave,
    boolean firma,
    boolean cobro,
    boolean extras,
    java.util.Set<Integer> noShowPax) {

  public static CheckInOps none() {
    return new CheckInOps(false, false, false, false, false, java.util.Set.of());
  }

  public CheckInOps withWifi(boolean wifi) {
    return new CheckInOps(wifi, llave, firma, cobro, extras, noShowPax);
  }

  public CheckInOps withLlave(boolean llave) {
    return new CheckInOps(wifi, llave, firma, cobro, extras, noShowPax);
  }

  public CheckInOps withFirma(boolean firma) {
    return new CheckInOps(wifi, llave, firma, cobro, extras, noShowPax);
  }

  public CheckInOps withCobro(boolean cobro) {
    return new CheckInOps(wifi, llave, firma, cobro, extras, noShowPax);
  }

  public CheckInOps withExtras(boolean extras) {
    return new CheckInOps(wifi, llave, firma, cobro, extras, noShowPax);
  }

  /** Whether the front desk marked this pax (1 = main guest) as a no-show. */
  public boolean isNoShow(int pax) {
    return noShowPax != null && noShowPax.contains(pax);
  }

  /** Marks / unmarks a pax as no-show (toggle — the desk can revert a mistake). */
  public CheckInOps toggleNoShow(int pax) {
    var set = new java.util.HashSet<>(noShowPax == null ? java.util.Set.<Integer>of() : noShowPax);
    if (!set.add(pax)) {
      set.remove(pax);
    }
    return new CheckInOps(wifi, llave, firma, cobro, extras, java.util.Set.copyOf(set));
  }
}
