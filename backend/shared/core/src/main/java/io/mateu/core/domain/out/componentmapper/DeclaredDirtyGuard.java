package io.mateu.core.domain.out.componentmapper;

/**
 * A page that says in its definition, not by an annotation on a class, whether leaving it with
 * unsaved changes asks first (a YAML page's {@code confirmOnNavigationIfDirty}).
 */
public interface DeclaredDirtyGuard {
  boolean confirmOnNavigationIfDirty();
}
