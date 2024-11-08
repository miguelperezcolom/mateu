package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Badge;
import java.util.List;

public interface HasBadgesOnFields {

  List<Badge> getBadgesOnField(String fieldName);
}
