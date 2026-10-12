package io.mateu.core.infra;

/**
 * A component tree that renders ANOTHER object — an {@code @AutoPage} class composed as a dashboard
 * or a welcome page, a domain object drawn by its {@code ComponentAdapter}. What belongs to the
 * page itself (its title, the methods its actions run) is the model's, not the bridge's.
 */
public interface ModelBridge {

  Object model();

  /** The object that owns the page: the model behind a bridge, else the instance itself. */
  static Object ownerOf(Object instance) {
    return instance instanceof ModelBridge bridge ? bridge.model() : instance;
  }
}
