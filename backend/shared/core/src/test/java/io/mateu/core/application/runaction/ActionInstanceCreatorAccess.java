package io.mateu.core.application.runaction;

/** Test access to {@link ActionInstanceCreator}'s package-private helpers. */
public final class ActionInstanceCreatorAccess {

  private ActionInstanceCreatorAccess() {}

  public static boolean isAppShortcutAction(Class<?> appClass, String actionId) {
    return ActionInstanceCreator.isAppShortcutAction(appClass, actionId);
  }
}
