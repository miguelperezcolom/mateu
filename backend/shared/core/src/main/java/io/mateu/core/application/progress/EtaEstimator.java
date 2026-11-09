package io.mateu.core.application.progress;

import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.ProgressStateDto;

/**
 * The time left of ONE task, estimated from the rate its progress is observed to advance — only
 * when that is honest: a determinate task ({@code fraction}, else {@code done/total}) that has
 * advanced twice and been watched for two seconds. Never for an indeterminate or finished task.
 *
 * <p>The rate is an exponentially smoothed average (α = 0.3) of the segments that advance: a burst
 * moves the estimate without taking over, and a stall lowers the next segment's rate. Progress
 * going backwards starts over. The rules — and the reference implementation — are the corpus {@code
 * conformance/progress/eta.json}, shared with the .NET and Python ports.
 */
public final class EtaEstimator {

  static final double ALPHA = 0.3;
  static final int MIN_RATE_UPDATES = 2;
  static final long MIN_ELAPSED_MILLIS = 2000;

  private long firstAt;
  private long prevAt;
  private double prevP = Double.NaN;
  private Double ema;
  private int updates;

  /** The estimate (seconds) for {@code progress} observed at {@code nowMillis}, or null. */
  public synchronized Integer observe(ProgressDto progress, long nowMillis) {
    if (progress.state() != null && progress.state() != ProgressStateDto.running) {
      return null;
    }
    var p = valueOf(progress);
    if (p == null) {
      return null;
    }
    return observe(p, nowMillis);
  }

  /** The estimate (seconds) for progress {@code p} (0..1) observed at {@code t}, or null. */
  synchronized Integer observe(double p, long t) {
    if (Double.isNaN(prevP) || p < prevP || t < prevAt) {
      firstAt = t;
      prevAt = t;
      prevP = p;
      ema = null;
      updates = 0;
      return null;
    }
    if (p > prevP && t > prevAt) {
      var rate = (p - prevP) / (t - prevAt);
      ema = ema == null ? rate : ALPHA * rate + (1 - ALPHA) * ema;
      updates++;
      prevAt = t;
      prevP = p;
    }
    if (updates < MIN_RATE_UPDATES
        || t - firstAt < MIN_ELAPSED_MILLIS
        || ema == null
        || !(ema > 0)
        || !(p > 0 && p < 1)) {
      return null;
    }
    // a hair under an exact second is that second: floating point noise must not add one
    return (int) Math.ceil((1 - p) / ema / 1000 - 1e-6);
  }

  /** {@code fraction}, else {@code done/total}, else null (indeterminate). */
  static Double valueOf(ProgressDto progress) {
    if (progress.fraction() != null) {
      return Double.isFinite(progress.fraction()) ? progress.fraction() : null;
    }
    if (progress.total() != null && progress.total() > 0) {
      return (progress.done() != null ? progress.done() : 0) / (double) progress.total();
    }
    return null;
  }
}
