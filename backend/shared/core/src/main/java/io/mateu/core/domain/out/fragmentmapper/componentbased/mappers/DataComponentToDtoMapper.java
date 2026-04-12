package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.ValueMapping;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.StatusType;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import lombok.SneakyThrows;

public class DataComponentToDtoMapper {

  public static UIFragmentDto mapDataToDto(
      Data data, String targetComponentId, Object componentSupplier) {
    return new UIFragmentDto(
        targetComponentId, null, mapItem(data.newState()), transformData(data.data()), null);
  }

  private static Object transformData(Object data) {
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
          newContent.add(mapItem(item, (page.pageNumber() * page.pageSize()) + i));
        }
        var newPage = page.withContent(newContent);
        newData.put("crud", listingData.withPage(newPage));
        return newData;
      }
    }
    return data;
  }

  public static Object mapItem(Object item) {
    return mapItem(item, 0);
  }

  public static Object mapItem(Object item, int position) {
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
    var map = mapPojo(item);
    map.put("_rowNumber", position);
    return map;
  }

  @SneakyThrows
  public static Map<String, Object> mapPojo(Object item) {
    Map<String, Object> map = new HashMap<>();
    for (Field field : item.getClass().getDeclaredFields()) {
      if (!item.getClass().isRecord() && Modifier.isFinal(field.getModifiers())) {
        continue;
      }
      if (field.isAnnotationPresent(Status.class)) {
        var ann = field.getAnnotation(Status.class);
        Map<String, StatusType> mapping = new HashMap<>();
        for (StatusMapping statusMapping : ann.mappings()) {
          mapping.put(statusMapping.from(), statusMapping.to());
        }
        StatusType defaultType = ann.defaultStatus();
        var value = "" + getValue(field, item);
        map.put(
            field.getName(),
            new io.mateu.uidl.data.Status(mapping.getOrDefault(value, defaultType), value));
      } else if (field.isAnnotationPresent(MappedValue.class)) {
        var ann = field.getAnnotation(MappedValue.class);
        Map<String, String> mapping = new HashMap<>();
        for (ValueMapping statusMapping : ann.mappings()) {
          mapping.put(statusMapping.from(), statusMapping.to());
        }
        String defaultType = ann.defaultValue();
        var value = "" + getValue(field, item);
        map.put(field.getName(), mapping.getOrDefault(value, defaultType));
      } else {
        map.put(field.getName(), getValue(field, item));
      }
    }
    return map;
  }
}
