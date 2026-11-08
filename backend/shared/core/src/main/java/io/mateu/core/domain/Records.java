package io.mateu.core.domain;

import java.lang.reflect.RecordComponent;
import java.util.concurrent.atomic.AtomicLong;

/**
 * The record components of a class, read ONCE per class.
 *
 * <p>{@link Class#getRecordComponents()} is not cached by the JVM: every call goes native, looks
 * the accessors up by name and builds a new array — under load it serialises on the VM's
 * symbol-table locks. Mateu's generic walks of the wire records (the referenced REST sources, the
 * advertised action ids, the self-naming tree…) called it for EVERY node of EVERY response:
 * profiled in 2026-11 (design/performance/baseline-2026-11.md) the walk that adds the referenced
 * REST sources to a response was 66% of the CPU of a listing load on Spring MVC. Every walk reads
 * the shape from here; {@code RequestBudgetTest} pins that a warm request reads none.
 *
 * <p>The returned array is shared: callers must not modify it.
 */
public final class Records {

  private static final AtomicLong SHAPE_READS = new AtomicLong();

  private static final ClassValue<RecordComponent[]> COMPONENTS =
      new ClassValue<>() {
        @Override
        protected RecordComponent[] computeValue(Class<?> type) {
          SHAPE_READS.incrementAndGet();
          var components = type.getRecordComponents();
          if (components == null) {
            return new RecordComponent[0];
          }
          for (var component : components) {
            try {
              // the wire records are public, but a record nested in a non-public class is not
              component.getAccessor().setAccessible(true);
            } catch (RuntimeException e) {
              // left as it is: invoking it reports the same failure the walk already tolerates
            }
          }
          return components;
        }
      };

  private Records() {}

  /**
   * The record components of {@code type} (empty for a class that is not a record), from the
   * per-class cache. Do not modify the array.
   */
  public static RecordComponent[] components(Class<?> type) {
    return COMPONENTS.get(type);
  }

  /** How many times a class's components were read from the JVM (cache misses), for budgets. */
  public static long shapeReads() {
    return SHAPE_READS.get();
  }
}
