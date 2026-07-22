package io.mateu.core.infra.reflection.write;

import static io.mateu.core.infra.reflection.read.ActualValueExtractor.getActualValue;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.HolderFieldChecker.isNonDataHolder;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.domain.Authorizer;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import java.lang.reflect.Field;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Hydrater {

  public static <T> T hydrate(
      T object,
      Map<String, Object> data,
      InstanceFactory instanceFactory,
      HttpRequest httpRequest) {
    if (!(object instanceof Hydratable)) {
      if (data != null) {
        data.entrySet()
            .forEach(
                entry -> {
                  try {
                    // Callable/Supplier/Component holder fields never round-trip as data —
                    // writing their state entry back (always null) would destroy the initializer.
                    var field = getFieldByName(object.getClass(), entry.getKey());
                    if (field != null && isNonDataHolder(field)) {
                      return;
                    }
                    if (field != null && !isClientWritable(field, httpRequest)) {
                      log.debug(
                          "Dropped client state for permission-protected field '{}' of {}",
                          entry.getKey(),
                          object.getClass().getSimpleName());
                      return;
                    }
                    Object actualValue =
                        getActualValue(entry, object, instanceFactory, httpRequest);
                    setValue(entry.getKey(), object, actualValue);
                  } catch (Exception ex) {
                    log.debug(
                        "Could not hydrate field '{}': {} - {}",
                        entry.getKey(),
                        ex.getClass().getSimpleName(),
                        ex.getMessage());
                  }
                });
      }
    }
    return object;
  }

  /**
   * Write-side enforcement of the field-level access-control annotations: the browser is untrusted,
   * so a field the UI hides ({@link EyesOnly}) or locks ({@link ReadOnlyUnless}) for this request
   * must not be writable by tampering with the component state either. The read side (what is
   * rendered) is enforced by FormFieldFilter / PageFormBuilder; this is its symmetric counterpart.
   * Unauthorized entries are dropped, so the field keeps the server-side value (initializer or
   * whatever load()/actions set) — protected values must be computed server-side, never trusted
   * from the round-tripped state. Class-level restrictions are intentionally not enforced here: a
   * fully read-only view still legitimately round-trips state its actions need (e.g. the id).
   */
  private static boolean isClientWritable(Field field, HttpRequest httpRequest) {
    var eyesOnly = MetaAnnotations.find(field, EyesOnly.class);
    if (eyesOnly != null && !Authorizer.isAuthorized(eyesOnly, httpRequest)) {
      return false;
    }
    var readOnlyUnless = MetaAnnotations.find(field, ReadOnlyUnless.class);
    if (readOnlyUnless != null && !Authorizer.isAuthorized(readOnlyUnless, httpRequest)) {
      return false;
    }
    return true;
  }

  public static void setValue(String fn, Object o, Object v) throws Exception {
    ValueWriter.setValue(fn, o, v);
  }
}
