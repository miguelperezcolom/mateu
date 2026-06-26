package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Emits;

/** Resolves the logical source name a component emits events under (see {@link Emits}). */
public class EmitsMapper {

  /**
   * Returns the {@code @Emits(name = ...)} declared on the component's class, or null when absent
   * or blank. Stamped into {@code ServerSideComponentDto.emitsName} so the frontend can tag emitted
   * events with their origin for {@code COMPONENT}-scoped subscriptions.
   */
  public static String emitsName(Object instance) {
    if (instance == null) {
      return null;
    }
    var emits = MetaAnnotations.find(instance.getClass(), Emits.class);
    if (emits == null || emits.name().isBlank()) {
      return null;
    }
    return emits.name();
  }

  private EmitsMapper() {}
}
