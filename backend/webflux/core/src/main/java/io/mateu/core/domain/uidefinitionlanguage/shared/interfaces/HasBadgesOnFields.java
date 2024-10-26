package io.mateu.core.domain.uidefinitionlanguage.shared.interfaces;

import io.mateu.core.domain.uidefinitionlanguage.shared.data.Badge;
import java.util.List;

public interface HasBadgesOnFields {

  List<Badge> getBadgesOnField(String fieldName);
}
