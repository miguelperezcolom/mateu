package io.mateu.core.infra.uploads;

import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.interfaces.FileStorage;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * The attributes that switch an upload field from a data URI to a real upload: {@code uploadUrl},
 * {@code uploadTicket} and, for a store issuing pre-signed targets, {@code uploadDirect}. Added to
 * an EDITABLE {@code fileUpload} field (annotated, fluent or YAML alike — they all pass through the
 * field mapper) while a matching {@link FileStorage} is registered; never to a read-only field, and
 * a field the caller may not see is never mapped, so it never carries a ticket.
 */
@Slf4j
public final class UploadAttributes {

  private static final Set<String> WARNED = ConcurrentHashMap.newKeySet();

  /** The reserved storage name that keeps a field's file inline (a data URI). */
  public static final String INLINE = "inline";

  private UploadAttributes() {}

  /** The field's attributes, with the upload ones when they apply. */
  public static Map<String, String> of(FormField field, HttpRequest httpRequest) {
    return of(field, httpRequest, FileStorages.registered());
  }

  static Map<String, String> of(
      FormField field, HttpRequest httpRequest, Collection<FileStorage> stores) {
    var declared = field.attributes();
    if (field.stereotype() != FieldStereotype.fileUpload || field.readOnly() || stores.isEmpty()) {
      return declared;
    }
    var attributes = new LinkedHashMap<String, String>();
    if (declared != null) {
      attributes.putAll(declared);
    }
    var storageName = attributes.getOrDefault("storage", "");
    if (INLINE.equals(storageName)) {
      return declared;
    }
    var store = FileStorages.find(storageName, stores);
    if (store.isEmpty()) {
      if (WARNED.add(storageName)) {
        log.warn(
            "Field {} names the FileStorage '{}', which is not registered: it keeps the data-URI"
                + " upload",
            field.id(),
            storageName);
      }
      return declared;
    }
    long maxBytes = parseLong(attributes.get("maxBytes"));
    attributes.put("uploadUrl", UploadEndpoint.PATH);
    attributes.put(
        "uploadTicket",
        UploadTickets.issue(
            storageName,
            field.id(),
            maxBytes,
            attributes.getOrDefault("accept", ""),
            "true".equals(attributes.get("multiple")),
            httpRequest));
    if (store.get().directUploads()) {
      attributes.put("uploadDirect", "true");
    }
    return attributes;
  }

  private static long parseLong(String text) {
    if (text == null || text.isBlank()) {
      return 0;
    }
    try {
      return Long.parseLong(text.trim());
    } catch (NumberFormatException notANumber) {
      return 0;
    }
  }
}
