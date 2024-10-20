package io.mateu.core.domain.uidefinition.shared.interfaces;

import io.mateu.core.domain.uidefinition.shared.data.Badge;
import java.util.List;

public interface HasBadgesOnFields {

  List<Badge> getBadgesOnField(String fieldName);
}
