package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record AvatarGroup(List<Avatar> avatars, int maxItemsVisible) implements Component {}
