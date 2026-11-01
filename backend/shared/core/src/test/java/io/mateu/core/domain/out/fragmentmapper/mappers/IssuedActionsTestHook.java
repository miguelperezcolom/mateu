package io.mateu.core.domain.out.fragmentmapper.mappers;

/** Lets tests in other packages start from "no response has handed out any action id yet". */
public final class IssuedActionsTestHook {

  private IssuedActionsTestHook() {}

  public static void forget() {
    IssuedActions.clear();
  }
}
