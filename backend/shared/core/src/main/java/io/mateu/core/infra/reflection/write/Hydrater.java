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
                    warnOnce(object.getClass(), entry.getKey(), ex);
                  }
                });
      }
    }
    return object;
  }

  /** The (class, field) pairs already reported, per class so an unloaded class takes them along. */
  private static final ClassValue<java.util.Set<String>> REPORTED =
      new ClassValue<>() {
        @Override
        protected java.util.Set<String> computeValue(Class<?> type) {
          return java.util.concurrent.ConcurrentHashMap.newKeySet();
        }
      };

  /**
   * A value that could not be written into a field: the field silently kept its server-side value
   * (initializer) — a typed value reset, a form that "forgets" what the user entered. That deserves
   * a WARN, but once per (class, field), not once per request. A key that names no field at all is
   * client noise (or probing) and stays at DEBUG, so the set stays bounded by the real fields.
   */
  static void warnOnce(Class<?> type, String key, Exception ex) {
    var field = getFieldByName(type, key);
    if (field != null && REPORTED.get(type).add(key)) {
      // the exception's message is left to DEBUG: it often quotes the rejected VALUE
      log.warn(
          "Could not hydrate field '{}' of {}: {} (the field kept its server-side value; further"
              + " failures of this field are logged at DEBUG)",
          key,
          type.getName(),
          ex.getClass().getSimpleName());
      return;
    }
    log.debug(
        "Could not hydrate field '{}' of {}: {} - {}",
        key,
        type.getSimpleName(),
        ex.getClass().getSimpleName(),
        ex.getMessage());
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
    // A dependency the container injected (or a static) is not view state: writing wire data into
    // it would replace — or, for a container bean, mutate — the service itself.
    if (java.lang.reflect.Modifier.isStatic(field.getModifiers())
        || io.mateu.core.application.security.WireTypes.isInjected(field)) {
      return false;
    }
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
