package io.mateu.core.domain.out.fragmentmapper.mappers;

/**
 * The wire id of a display component that carries no id of its own. It used to be the shared
 * placeholder {@code "fieldId"}: two charts, diagrams or cards on one page got the same DOM id, and
 * a renderer keying its container by it (Redwood's {@code mateuBpmn-<id>}) painted both into one.
 * The id is the declared one when there is, else derived from the component's definition — stable
 * across re-renders of the same screen, like {@code ElementMapper.idOf}.
 */
final class WireIds {

  private WireIds() {}

  static String idOf(Object component, String declaredId) {
    if (declaredId != null && !declaredId.isBlank()) {
      return declaredId;
    }
    return component.getClass().getSimpleName().toLowerCase()
        + "-"
        + Integer.toHexString(component.hashCode());
  }
}
