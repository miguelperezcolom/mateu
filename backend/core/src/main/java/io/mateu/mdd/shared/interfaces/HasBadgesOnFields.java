package io.mateu.mdd.shared.interfaces;

import io.mateu.mdd.shared.data.Badge;
import java.util.List;

public interface HasBadgesOnFields {

  List<Badge> getBadgesOnField(String fieldName);
}
