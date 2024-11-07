package io.mateu.uidl.core.interfaces;

import io.mateu.uidl.core.data.Badge;
import java.util.List;

public interface HasBadgesOnFields {

  List<Badge> getBadgesOnField(String fieldName);
}
