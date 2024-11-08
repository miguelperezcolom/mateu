package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.uidl.annotations.File;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.interfaces.Card;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class DataExtractor {

  final ReflectionService reflectionService;
  final SerializerService serializerService;

  public Map<String, Object> getData(Object uiInstance, Object actualUiInstance) {
    if (uiInstance instanceof ObjectEditor) {
      Map<String, Object> data = new HashMap<>();
      data.putAll(((ObjectEditor) uiInstance).getData());
      data.put("__entityClassName__", ((ObjectEditor) uiInstance).getType().getName());
      return data;
    }
    return getData(actualUiInstance);
  }

  @SneakyThrows
  public Map<String, Object> getData(Object uiInstance) {
    if (uiInstance instanceof Element element) {
      return Map.of("content", element.content());
    }
    if (uiInstance instanceof Card card) {
      return Map.of(
          "headerText", card.headerText(),
          "subhead", card.subhead(),
          "media", card.media(),
          "supportingText", card.supportingText());
    }
    Map<String, Object> data = new HashMap<>();
    if (uiInstance instanceof ObjectEditor) {
      data.putAll(((ObjectEditor) uiInstance).getData());
      data.put("__entityClassName__", ((ObjectEditor) uiInstance).getType().getName());
    }
    data.putAll(serializerService.toMap(uiInstance));
    convertStringsToFiles(uiInstance, data);
    addStringValueForObjects(uiInstance, data);
    return data;
  }

  private void convertStringsToFiles(Object uiInstance, Map<String, Object> data) {
    reflectionService.getAllEditableFields(uiInstance.getClass()).stream()
        .filter(f -> String.class.equals(f.getType()))
        .filter(f -> f.isAnnotationPresent(File.class))
        .forEach(
            f -> {
              try {
                var value = (String) reflectionService.getValue(f, uiInstance);
                if (value != null) {
                  var url = new URL(value);
                  var targetUrl = url.toString().substring(0, url.toString().lastIndexOf("/"));
                  data.put(
                      f.getId(),
                      Map.of(
                          "targetUrl",
                          targetUrl,
                          "id",
                          extractId(url.getFile()),
                          "name",
                          extractFileFime(url.getFile()),
                          "type",
                          URLConnection.guessContentTypeFromName(url.getFile())));
                }
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
    reflectionService.getAllEditableFields(uiInstance.getClass()).stream()
        .filter(f -> List.class.isAssignableFrom(f.getType()))
        .filter(f -> String.class.equals(reflectionService.getGenericClass(f.getGenericType())))
        .filter(f -> f.isAnnotationPresent(File.class))
        .forEach(
            f -> {
              try {
                var value = (List<String>) reflectionService.getValue(f, uiInstance);
                if (value != null) {
                  var targetList = new ArrayList<>();
                  value.forEach(
                      v -> {
                        URL url = null;
                        try {
                          url = new URL(v);
                          var targetUrl =
                              url.toString().substring(0, url.toString().lastIndexOf("/"));
                          targetList.add(
                              Map.of(
                                  "targetUrl",
                                  targetUrl,
                                  "id",
                                  extractId(url.getFile()),
                                  "name",
                                  extractFileFime(url.getFile()),
                                  "type",
                                  URLConnection.guessContentTypeFromName(url.getFile())));
                        } catch (MalformedURLException e) {
                          e.printStackTrace();
                        }
                      });
                  data.put(f.getId(), targetList);
                }
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
  }

  private String extractId(String path) {
    var tokens = path.split("/");
    return tokens[tokens.length - 2];
  }

  private String extractFileFime(String path) {
    return path.substring(path.lastIndexOf("/") + 1);
  }

  private void addStringValueForObjects(Object uiInstance, Map<String, Object> data) {
    reflectionService.getAllEditableFields(uiInstance.getClass()).stream()
        .filter(f -> !reflectionService.isBasic(f.getType()))
        .filter(f -> !f.getType().isArray())
        .filter(f -> !f.getType().isEnum())
        .filter(f -> !Collection.class.isAssignableFrom(f.getType()))
        .filter(f -> !Map.class.isAssignableFrom(f.getType()))
        .filter(f -> data.get(f.getId()) instanceof Map)
        .forEach(
            f -> {
              try {
                ((Map) data.get(f.getId()))
                    .put("__toString", "" + reflectionService.getValue(f, uiInstance));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
  }
}
