package io.mateu.uidl.interfaces;

/**
 * Implemented by a listing whose {@code @GroupAction} buttons are not always applicable: the
 * backend asks per group and per action, and the group header row only renders the actions that
 * answer true (e.g. hide "Cancel file" on a file whose reservations are all cancelled already).
 */
public interface GroupActionVisibility {

  boolean groupActionVisible(String methodName, String groupValue, HttpRequest httpRequest);
}
