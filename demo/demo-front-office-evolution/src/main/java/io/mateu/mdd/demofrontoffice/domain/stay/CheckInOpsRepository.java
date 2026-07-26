package io.mateu.mdd.demofrontoffice.domain.stay;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store of the per-stay {@link CheckInOps} flags (demo scope — restarting the backend
 * resets every operation, like the rest of the seeded snapshot).
 */
public class CheckInOpsRepository {

  private final Map<String, CheckInOps> byStay = new ConcurrentHashMap<>();

  public CheckInOps of(String stayId) {
    return byStay.getOrDefault(stayId, CheckInOps.none());
  }

  public CheckInOps save(String stayId, CheckInOps ops) {
    byStay.put(stayId, ops);
    return ops;
  }
}
