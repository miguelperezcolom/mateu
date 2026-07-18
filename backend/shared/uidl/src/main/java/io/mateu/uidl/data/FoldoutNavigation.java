package io.mateu.uidl.data;

import lombok.Builder;

/**
 * Navigation Header of a {@link FoldoutLayout} (RDS Foldout Layout Page Template anatomy): a top
 * bar for navigating to other objects of the same type — previous / next record — or going to the
 * parent.
 *
 * <p>Each *ActionId names a method on the {@code Foldout} subclass that Mateu runs when the
 * corresponding control is clicked (typically returning a {@code URI}/{@code NavigateTo} or new
 * state). A {@code null}/blank actionId hides that control, so a subclass at the first/last record
 * simply omits the previous/next id.
 *
 * @param title current object title shown in the header (optional)
 * @param parentLabel label of the go-to-parent control (e.g. "Bookings")
 * @param parentActionId method run on go-to-parent (null = no parent control)
 * @param previousActionId method run on "previous record" (null = hidden)
 * @param nextActionId method run on "next record" (null = hidden)
 */
@Builder
public record FoldoutNavigation(
    String title,
    String parentLabel,
    String parentActionId,
    String previousActionId,
    String nextActionId) {}
