package io.mateu.core.domain.queries;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.shared.data.DatesRange;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@SuppressFBWarnings("EI_EXPOSE_REP2")
@Service
public class FiltersDeserializer {

  private final ReflectionHelper reflectionHelper;

  private final Serializer serializer;

  public FiltersDeserializer(ReflectionHelper reflectionHelper, Serializer serializer) {
    this.reflectionHelper = reflectionHelper;
    this.serializer = serializer;
  }

  public Object deserialize(
      Listing<?, ?> listing, Map<String, Object> raw, ServerHttpRequest serverHttpRequest)
      throws Exception {
    Map<String, Object> map = new HashMap<>();
    for (Field field : reflectionHelper.getAllEditableFields(listing.getSearchFormClass())) {
      if (DatesRange.class.equals(field.getType())) {
        String rawDatesRangeValue = "";
        if (raw.containsKey(field.getId() + "_from") && raw.get(field.getId() + "_from") != null) {
          rawDatesRangeValue += raw.get(field.getId() + "_from");
        }
        rawDatesRangeValue += "#";
        if (raw.containsKey(field.getId() + "_to") && raw.get(field.getId() + "_to") != null) {
          rawDatesRangeValue += raw.get(field.getId() + "_to");
        }
        map.put(field.getId(), rawDatesRangeValue);
      } else if (boolean.class.equals(field.getType())) {
        boolean value = false;
        if (raw.get(field.getId()) != null) {
          Object object = raw.get(field.getId());
          if (List.class.isAssignableFrom(object.getClass())) {
            List list = (List) object;
            if (list.size() > 0) {
              value = "on".equals(list.get(0));
            }
          }
        }
        map.put(field.getId(), value);
      } else if (raw.containsKey(field.getId()) && field.getType().isEnum()) {
        if (Strings.isNullOrEmpty((String) raw.get(field.getId()))) {
          map.remove(field.getId());
        } else {
          map.put(
              field.getId(),
              Enum.valueOf((Class) field.getType(), (String) raw.get(field.getId())));
        }
      } else {
        map.put(field.getId(), raw.get(field.getId()));
      }
    }
    return serializer.fromJson(serializer.toJson(map), listing.getSearchFormClass());
  }
}
