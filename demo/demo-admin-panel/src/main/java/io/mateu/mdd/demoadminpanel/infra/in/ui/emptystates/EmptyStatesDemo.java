package io.mateu.mdd.demoadminpanel.infra.in.ui.emptystates;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Skeleton;
import io.mateu.uidl.data.SkeletonVariant;
import io.mateu.uidl.fluent.Component;

/** Demo of the {@link EmptyState} component and the {@link Skeleton} loading placeholders. */
@UI("/empty-skeleton-demo")
@Title("Empty states & skeletons")
public class EmptyStatesDemo {

  @Section("Empty state")
  Component empty =
      EmptyState.builder()
          .icon("📭")
          .title("No bookings yet")
          .description("When you create a booking it will show up here.")
          .actionId("createBooking")
          .actionLabel("Create your first booking")
          .build();

  @Section("Skeletons")
  Component skeletons =
      new HorizontalLayout(
          Skeleton.builder().variant(SkeletonVariant.text).count(4).build(),
          Skeleton.builder().variant(SkeletonVariant.form).count(3).build(),
          Skeleton.builder().variant(SkeletonVariant.card).count(1).build(),
          Skeleton.builder().variant(SkeletonVariant.grid).count(5).build());

  @Action
  Object createBooking() {
    return new Message("This would open the booking form");
  }
}
