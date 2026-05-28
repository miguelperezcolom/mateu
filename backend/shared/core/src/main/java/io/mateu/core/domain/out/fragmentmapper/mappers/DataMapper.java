package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.fluent.Component;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;
import lombok.SneakyThrows;

public class DataMapper {

  public static UIFragmentDto mapDataToDto(
      Data data, String targetComponentId, Object componentSupplier) {
    return new UIFragmentDto(
        targetComponentId, null, mapItem(data.newState()), transformData(data.data()), null, null);
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
    for (Field field : getAllFields(item.getClass())) {
      if (!item.getClass().isRecord() && Modifier.isFinal(field.getModifiers())) {
        continue;
      }
      if (field.isAnnotationPresent(JsonIgnore.class)) {
        continue;
      }
      if (field.isAnnotationPresent(Status.class)) {
        map.put(field.getName(), StatusFieldMapper.mapStatusValue(field, item));
      } else if (field.isAnnotationPresent(MappedValue.class)) {
        map.put(field.getName(), MappedValueFieldMapper.mapMappedValue(field, item));
      } else {
        var value = getValue(field, item);
        if (!(value instanceof Component)) {
          if (value != null && List.class.isAssignableFrom(value.getClass())) {
            map.put(field.getName(), ((List<?>) value).stream().map(DataMapper::mapItem).toList());
          } else {
            map.put(field.getName(), value);
          }
        }
      }
    }
    return map;
  }
}
