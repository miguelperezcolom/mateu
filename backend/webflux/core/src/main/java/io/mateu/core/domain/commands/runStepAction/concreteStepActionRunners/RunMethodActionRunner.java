package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.usecases.ManagedTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.UIIncrement;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.On;
import io.mateu.uidl.data.ClientSideEvent;
import io.mateu.uidl.interfaces.Listing;
import java.lang.reflect.*;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

  final Merger merger;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionService reflectionService;
  final SerializerService serializerService;
  final ValidationService validationService;
  final ComponentFactory componentFactory;
  final UIIncrementFactory uIIncrementFactory;
  private final MethodParametersEditorHandler methodParametersEditorHandler;
  private final MethodProvider methodProvider;
  private final ManagedTypeChecker managedTypeChecker;
  private final ResultMapper resultMapper;

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    if (viewInstance instanceof MethodParametersEditor methodParametersEditor) {
      return methodParametersEditorHandler.handles(methodParametersEditor, actionId);
    }
    return getActions(viewInstance).containsKey(actionId);
  }

  private Map<String, Method> getActions(Object viewInstance) {
    Map<String, Method> methodMap = new LinkedHashMap<>();
    methodMap.putAll(
        reflectionService.getAllMethods(viewInstance.getClass()).stream()
            .filter(
                m ->
                    m.isAnnotationPresent(Action.class)
                        || m.isAnnotationPresent(MainAction.class)
                        || m.isAnnotationPresent(On.class))
            .collect(Collectors.toMap(m -> m.getName(), m -> m)));
    reflectionService
        .getAllFields(viewInstance.getClass())
        .forEach(
            f -> {
              methodMap.putAll(
                  reflectionService.getAllMethods(f.getType()).stream()
                      .filter(m -> m.isAnnotationPresent(On.class))
                      .collect(Collectors.toMap(m -> f.getName() + "." + m.getName(), m -> m)));
            });
    reflectionService.getAllEditableFields(viewInstance.getClass()).stream()
        .filter(f -> !managedTypeChecker.isManaged(f))
        .forEach(
            f -> {
              try {
                var value = reflectionService.getValue(f, viewInstance);
                if (value == null) {
                  value = reflectionService.newInstance(f.getType());
                }
                getActions(value).forEach((k, v) -> methodMap.put(f.getName() + "." + k, v));
              } catch (NoSuchMethodException
                  | IllegalAccessException
                  | InvocationTargetException
                  | InstantiationException e) {
                throw new RuntimeException(e);
              }
            });
    if (viewInstance instanceof Listing<?, ?>) {
      if (!methodMap.containsKey("itemSelected")) {
        methodMap.put(
            "itemSelected", reflectionService.getMethod(viewInstance.getClass(), "onRowSelected"));
      }
    }
    return methodMap;
  }

  @Override
  public Mono<UIIncrement> run(
      Object viewInstance,
      String stepId,
      String actionId,
      String componentId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    if (viewInstance instanceof MethodParametersEditor methodParametersEditor) {
      Object targetInstance =
          methodParametersEditorHandler.getTargetInstance(methodParametersEditor);
      Method m =
          methodProvider.getMethod(targetInstance.getClass(), methodParametersEditor.getMethodId());
      if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
      Object result =
          m.invoke(targetInstance, injectParameters(targetInstance, m, serverHttpRequest, data));
      return resultMapper.processResult(
          targetInstance, m, m, data, serverHttpRequest, result, componentId, true);
    }

    return runMethod(viewInstance, data, serverHttpRequest, componentId, actionId);
  }

  @SneakyThrows
  private Object[] injectParameters(
      Object instance, Method m, ServerHttpRequest serverHttpRequest, Map<String, Object> data) {
    List<Object> values = new ArrayList<>();
    for (int i = 0; i < m.getParameterCount(); i++) {
      if (ServerHttpRequest.class.equals(m.getParameterTypes()[i])) {
        values.add(serverHttpRequest);
        continue;
      }
      if (ClientSideEvent.class.equals(m.getParameterTypes()[i])) {
        values.add(
            new ClientSideEvent(
                (String) data.get("__eventName"), (Map<String, Object>) data.get("__event")));
        continue;
      }
      if (instance instanceof Listing<?, ?> listing) {
        if (m.getGenericParameterTypes()[i] instanceof ParameterizedType
            && isSelectionParameter((ParameterizedType) m.getGenericParameterTypes()[i], listing)) {
          List<Map<String, Object>> rowsData =
              (List<Map<String, Object>>) data.get("_selectedRows");
          List<Object> selectedRows = new ArrayList<>();
          for (Map<String, Object> row : rowsData) {
            selectedRows.add(reflectionService.newInstance(listing.getRowClass(), row));
          }
          values.add(selectedRows);
          continue;
        }
        if (listing.getRowClass().equals(m.getGenericParameterTypes()[i])) {
          List<Map<String, Object>> rowsData =
              (List<Map<String, Object>>) data.get("_selectedRows");
          if (!rowsData.isEmpty()) {
            Map<String, Object> selectedRow = rowsData.get(0);
            values.add(reflectionService.newInstance(listing.getRowClass(), selectedRow));
          } else {
            values.add(null);
          }
          continue;
        }
        if (m.getName().equals("onRowSelected")) {
          values.add(reflectionService.newInstance(listing.getRowClass(), data));
          continue;
        }
      }
      values.add(
          actualValueExtractor.getActualValue(m.getParameterTypes()[i], data.get("param_" + i)));
    }
    return values.toArray();
  }

  boolean isSelectionParameter(ParameterizedType type, Listing listing) {
    return List.class.equals(type.getRawType())
        && reflectionService.getGenericClass(type, List.class, "E").equals(listing.getRowClass());
  }

  public Mono<UIIncrement> runMethod(
      Object actualViewInstance,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      String componentId,
      String actionId)
      throws Throwable {

    Method m = getActions(actualViewInstance).get(actionId);

    var methodOwner = getMethodOwner(actionId, actualViewInstance);

    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);

    // todo: inject parameters (ServerHttpRequest, selection for jpacrud)
    if (needsParameters(actualViewInstance, m)) {

      if (Modifier.isStatic(m.getModifiers())) {

        var result = new MethodParametersEditor(m.getDeclaringClass(), m.getName(), data);

        return resultMapper.processResult(
            actualViewInstance, m, m, data, serverHttpRequest, result, componentId, false);

      } else {

        var result = new MethodParametersEditor(actualViewInstance, m.getName(), serializerService);

        return resultMapper.processResult(
            actualViewInstance, m, m, data, serverHttpRequest, result, componentId, false);
      }

    } else {

      if (needsValidation(m)) {
        validationService.validate(actualViewInstance);
      }

      try {

        Object result =
            m.invoke(methodOwner, injectParameters(methodOwner, m, serverHttpRequest, data));

        return resultMapper.processResult(
            actualViewInstance, m, m, data, serverHttpRequest, result, componentId, false);

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }
  }

  @SneakyThrows
  private Object getMethodOwner(String actionId, Object actualViewInstance) {
    var methodOwner = actualViewInstance;
    if (actionId.contains(".")) {
      methodOwner =
          getMethodOwner(
              actionId.substring(actionId.indexOf(".") + 1),
              reflectionService.getValue(
                  actionId.substring(0, actionId.indexOf(".")), actualViewInstance));
    }
    return methodOwner;
  }

  private boolean needsParameters(Object instance, Method m) {
    if (m.getParameterCount() == 0) return false;
    boolean anyNotInjected = false;
    for (Parameter parameter : m.getParameters()) {
      if (parameter.getType().equals(ServerHttpRequest.class)) {
        continue;
      }
      if (parameter.getType().equals(ClientSideEvent.class)) {
        continue;
      }
      if (instance instanceof Listing<?, ?> listing) {
        if (m.getName().equals("onRowSelected")) {
          continue;
        }
        var isMultipleSelectionParameter =
            Arrays.stream(m.getGenericParameterTypes())
                .filter(t -> t instanceof ParameterizedType)
                .map(t -> (ParameterizedType) t)
                .anyMatch(
                    type ->
                        List.class.equals(type.getRawType())
                            && reflectionService
                                .getGenericClass(type, List.class, "E")
                                .equals(listing.getRowClass()));
        if (isMultipleSelectionParameter) {
          continue;
        }
        var isSingleSelectionParameter =
            Arrays.stream(m.getGenericParameterTypes())
                .anyMatch(type -> listing.getRowClass().equals(type));
        if (isSingleSelectionParameter) {
          continue;
        }
      }
      anyNotInjected = true;
    }
    return anyNotInjected;
  }

  private boolean needsValidation(Method m) {
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).validateBefore();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).validateBefore();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).validateBefore();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).validateBefore();
    }
    return false;
  }
}
