package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.FieldAccess;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;

public class DataMapper {

  public static UIFragmentDto mapDataToDto(
      Data data, String targetComponentId, Object componentSupplier) {
    return mapDataToDto(data, targetComponentId, componentSupplier, null);
  }

  /**
   * The data fragment an action answered, rows included — without the values the caller may not
   * read: an {@code @EyesOnly} field of a row (or of anything nested in it) is left out, exactly as
   * its column is (GA review S2: the column was drawn and the value sent).
   */
  public static UIFragmentDto mapDataToDto(
      Data data, String targetComponentId, Object componentSupplier, HttpRequest httpRequest) {
    return new UIFragmentDto(
        targetComponentId,
        null,
        mapItem(data.newState(), 0, httpRequest),
        transformData(data.data(), httpRequest),
        null,
        null);
  }

  private static Object transformData(Object data, HttpRequest httpRequest) {
    if (data == null) {
      return null;
    }
    if (data instanceof Map map) {
      var crud = map.get("crud");
      if (crud instanceof ListingData listingData) {
        var page = listingData.page();
        var newData = new HashMap<>(map);
        var newContent = new ArrayList();
        for (int i = 0; i < page.content().size(); i++) {
          var item = page.content().get(i);
          newContent.add(mapItem(item, (page.pageNumber() * page.pageSize()) + i, httpRequest));
        }
        var newPage = page.withContent(newContent);
        newData.put("crud", listingData.withPage(newPage));
        return newData;
      }
    }
    return data;
  }

  public static Object mapItem(Object item) {
    return mapItem(item, 0, null);
  }

  public static Object mapItem(Object item, int position) {
    return mapItem(item, position, null);
  }

  public static Object mapItem(Object item, int position, HttpRequest httpRequest) {
    if (item == null) {
      return null;
    }
    if (item instanceof Map) {
      return item;
    }
    if (item instanceof Collection) {
      return item;
    }
    if (isBasic(item)) {
      return item;
    }
    var map = mapPojo(item, httpRequest);
    map.put("_rowNumber", position);
    return map;
  }

  public static Map<String, Object> mapPojo(Object item) {
    return mapPojo(item, null);
  }

  public static Map<String, Object> mapPojo(Object item, HttpRequest httpRequest) {
    Map<String, Object> map = new HashMap<>();
    for (Field field : getAllFields(item.getClass())) {
      if (!item.getClass().isRecord() && Modifier.isFinal(field.getModifiers())) {
        continue;
      }
      if (!FieldAccess.mayRead(field, httpRequest)) {
        continue; // the caller may not see it: not drawn as a column, not sent as a value
      }
      if (MetaAnnotations.isPresent(field, JsonIgnore.class)) {
        continue;
      }
      if (MetaAnnotations.isPresent(field, Status.class)) {
        map.put(field.getName(), StatusFieldMapper.mapStatusValue(field, item));
      } else if (MetaAnnotations.isPresent(field, MappedValue.class)) {
        map.put(field.getName(), MappedValueFieldMapper.mapMappedValue(field, item));
      } else {
        var value = getValue(field, item);
        if (!(value instanceof Component)) {
          if (value != null && List.class.isAssignableFrom(value.getClass())) {
            map.put(
                field.getName(),
                ((List<?>) value).stream().map(child -> mapItem(child, 0, httpRequest)).toList());
          } else if (value != null && FieldAccess.isGuarded(value.getClass())) {
            // a nested object carrying restricted fields: written out as a map, without them
            map.put(field.getName(), mapPojo(value, httpRequest));
          } else {
            map.put(field.getName(), value);
          }
        }
      }
    }
    return map;
  }
}
