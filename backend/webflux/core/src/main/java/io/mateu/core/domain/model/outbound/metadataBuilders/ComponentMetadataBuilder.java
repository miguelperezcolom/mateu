package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.*;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.TabDto;
import io.mateu.uidl.annotations.Attribute;
import io.mateu.uidl.annotations.Content;
import io.mateu.uidl.annotations.HorizontalLayouted;
import io.mateu.uidl.annotations.On;
import io.mateu.uidl.annotations.SplitLayouted;
import io.mateu.uidl.annotations.TabLayouted;
import io.mateu.uidl.annotations.VerticalLayouted;
import io.mateu.uidl.data.RemoteJourney;
import io.mateu.uidl.data.Result;
import io.mateu.uidl.data.Stepper;
import io.mateu.uidl.interfaces.Card;
import io.mateu.uidl.interfaces.Container;
import io.mateu.uidl.interfaces.JpaCrud;
import io.mateu.uidl.interfaces.JpaRpcCrudFactory;
import io.mateu.uidl.interfaces.Listing;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ComponentMetadataBuilder {

  @Autowired JpaRpcCrudFactory jpaRpcCrudFactory;

  @Autowired FormMetadataBuilder formMetadataBuilder;

  @Autowired CardMetadataBuilder cardMetadataBuilder;

  @Autowired StepperMetadataBuilder stepperMetadataBuilder;

  @Autowired CrudMetadataBuilder crudMetadataBuilder;

  @Autowired ResultMetadataBuilder resultMetadataBuilder;

  @Autowired RemoteJourneyMetadataBuilder remoteJourneyMetadataBuilder;

  @Autowired MethodParametersEditorMetadataBuilder methodParametersEditorMetadataBuilder;

  @Autowired ReflectionService reflectionService;
  @Autowired private DataExtractor dataExtractor;
  @Autowired private BasicTypeChecker basicTypeChecker;

  @Qualifier("captionProvider")
  @Autowired
  private CaptionProvider captionProvider;

  @Autowired private ServerSideObjectMapper serverSideObjectMapper;
  @Autowired private DirectoryMetadataBuilder directoryMetadataBuilder;
  @Autowired private SerializerService serializerService;

  public ComponentMetadataDto getMetadata(
      boolean form,
      Object componentInstance,
      Field field,
      List<Field> slotFields,
      Map<String, Object> data,
      String baseUrl,
      ServerHttpRequest serverHttpRequest,
      boolean autoFocusDisabled) {
    ComponentMetadataDto metadata;
    if (componentInstance instanceof List<?> list
        && field != null
        && field.isAnnotationPresent(HorizontalLayouted.class)) {
      metadata = getHorizontalLayout(list, componentInstance, field);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(HorizontalLayouted.class)) {
      metadata = getHorizontalLayout(componentInstance);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(TabLayouted.class)) {
      metadata = getTabLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance.getClass().isAnnotationPresent(TabLayouted.class)) {
      metadata = getTabLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance.getClass().isAnnotationPresent(HorizontalLayouted.class)) {
      metadata = getHorizontalLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance.getClass().isAnnotationPresent(VerticalLayouted.class)) {
      metadata = getVerticalLayout(componentInstance);
    } else if (componentInstance instanceof List<?> list
        && field != null
        && field.isAnnotationPresent(VerticalLayouted.class)) {
      metadata = getVerticalLayout(list, componentInstance, field);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(VerticalLayouted.class)) {
      metadata = getVerticalLayout(componentInstance);
    } else if (componentInstance instanceof List<?> list
        && field != null
        && field.isAnnotationPresent(SplitLayouted.class)) {
      metadata = getSplitLayout(list, componentInstance, field);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(SplitLayouted.class)) {
      metadata = getSplitLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance.getClass().isAnnotationPresent(SplitLayouted.class)) {
      metadata = getSplitLayout(componentInstance);
    } else if (componentInstance instanceof io.mateu.uidl.interfaces.MicroFrontend) {
      metadata = getJourneyStarter((io.mateu.uidl.interfaces.MicroFrontend) componentInstance);
    } else if (componentInstance instanceof ElementDto) {
      metadata = getElement((ElementDto) componentInstance);
    } else if (componentInstance
        .getClass()
        .isAnnotationPresent(io.mateu.uidl.annotations.Element.class)) {
      metadata = buildElement(componentInstance);
    } else if (componentInstance instanceof MethodParametersEditor) {
      metadata = getMethodParametersEditor((MethodParametersEditor) componentInstance);
    } else if (componentInstance instanceof Result) {
      metadata = getResult((Result) componentInstance);
    } else if (componentInstance instanceof RemoteJourney remoteJourney) {
      metadata = getRemoteJourney(remoteJourney, serverHttpRequest);
    } else if (componentInstance instanceof io.mateu.uidl.interfaces.Directory directory) {
      metadata = getDirectory(directory, baseUrl, serverHttpRequest);
    } else if (componentInstance instanceof Listing) {
      metadata = getCrud("main", (Listing) componentInstance);
    } else if (componentInstance instanceof RpcViewWrapper) {
      metadata =
          getCrud(
              ((RpcViewWrapper) componentInstance).getId(),
              ((RpcViewWrapper) componentInstance).getRpcView());
    } else if (componentInstance instanceof Stepper) {
      metadata = getStepper();
    } else if (componentInstance instanceof Card card) {
      metadata = getCard(card, slotFields);
    } else if (componentInstance instanceof JpaCrud) {
      metadata = getCrud("main", (JpaCrud) componentInstance);
    } else if (componentInstance instanceof ObjectWrapper objectWrapper) {
      metadata = wrap(objectWrapper.getValue());
    } else if (basicTypeChecker.isBasic(componentInstance)
        && !(componentInstance instanceof String)) {
      metadata =
          getResult(
              new Result(
                  "Result",
                  io.mateu.uidl.data.ResultType.Success,
                  "" + componentInstance,
                  List.of(),
                  null,
                  null,
                  null));
    } else {
      if (form) {
        metadata = getForm(componentInstance, slotFields, data, autoFocusDisabled);
      } else {
        metadata = getNonForm(componentInstance);
      }
    }

    return metadata;
  }

  private ComponentMetadataDto getRemoteJourney(
      RemoteJourney remoteJourney, ServerHttpRequest serverHttpRequest) {
    return remoteJourneyMetadataBuilder.build(remoteJourney);
  }

  private ComponentMetadataDto getDirectory(
      io.mateu.uidl.interfaces.Directory directory,
      String baseUrl,
      ServerHttpRequest serverHttpRequest) {
    return directoryMetadataBuilder.build(directory, baseUrl, serverHttpRequest);
  }

  private ComponentMetadataDto wrap(Object value) {
    return new ElementDto(
        "div",
        Map.of(),
            """
            <vaadin-vertical-layout
            theme='spacing padding'
              style='justify-content: center;align-items: center;'>
              <h3>%s</h3>
            </vaadin-vertical-layout>
            """
            .formatted("" + value));
  }

  private ComponentMetadataDto getVerticalLayout(Object componentInstance) {
    return new VerticalLayoutDto();
  }

  private ComponentMetadataDto getHorizontalLayout(Object componentInstance) {
    return new HorizontalLayoutDto();
  }

  private ComponentMetadataDto getTabLayout(Object componentInstance) {
    List<TabDto> tabs = new ArrayList<>();
    if (componentInstance != null) {
      reflectionService
          .getAllFields(componentInstance.getClass())
          .forEach(
              f -> {
                tabs.add(new TabDto(f.getName(), false, captionProvider.getCaption(f)));
              });
    }
    return new TabLayoutDto(tabs);
  }

  private ComponentMetadataDto getSplitLayout(Object componentInstance) {
    return new SplitLayoutDto();
  }

  private ComponentMetadataDto getNonForm(Object componentInstance) {
    if (componentInstance instanceof Container) {
      return new VerticalLayoutDto();
    }
    return new ElementDto("div", Map.of(), "" + componentInstance);
  }

  private ComponentMetadataDto buildElement(Object componentInstance) {
    return new ElementDto(
        getElementName(componentInstance),
        getElementAttributes(componentInstance),
        getElementContent(componentInstance));
  }

  private String getElementContent(Object componentInstance) {
    return reflectionService.getAllFields(componentInstance.getClass()).stream()
        .filter(f -> f.isAnnotationPresent(Content.class))
        .map(
            f -> {
              try {
                return "" + reflectionService.getValue(f, componentInstance);
              } catch (NoSuchMethodException
                  | IllegalAccessException
                  | InvocationTargetException e) {
                throw new RuntimeException(e);
              }
            })
        .findAny()
        .orElse("");
  }

  private Map<String, Object> getElementAttributes(Object componentInstance) {
    Map<String, Object> attributes = new HashMap<>();
    reflectionService.getAllFields(componentInstance.getClass()).stream()
        .filter(f -> f.isAnnotationPresent(Attribute.class))
        .forEach(
            f -> {
              try {
                String name = f.getAnnotation(Attribute.class).value();
                if (name.isEmpty()) {
                  name = f.getName();
                }
                attributes.put(name, "" + reflectionService.getValue(f, componentInstance));
              } catch (NoSuchMethodException
                  | IllegalAccessException
                  | InvocationTargetException e) {
                throw new RuntimeException(e);
              }
            });
    List<PairDto> listeners = new ArrayList<>();
    reflectionService.getAllMethods(componentInstance.getClass()).stream()
        .filter(m -> m.isAnnotationPresent(On.class))
        .forEach(
            m -> {
              var on = m.getAnnotation(On.class);
              listeners.add(
                  new PairDto("listener", new ListenerDto(on.value(), m.getName(), on.js())));
            });
    if (!listeners.isEmpty()) {
      attributes.put("listeners", listeners);
    }
    return attributes;
  }

  private String getElementName(Object componentInstance) {
    return componentInstance
        .getClass()
        .getAnnotation(io.mateu.uidl.annotations.Element.class)
        .value();
  }

  private ComponentMetadataDto getElement(ElementDto element) {
    return new ElementDto(element.name(), element.attributes(), element.content());
  }

  private ComponentMetadataDto getHorizontalLayout(List<?> list, Object model, Field field) {
    return new HorizontalLayoutDto();
  }

  private ComponentMetadataDto getVerticalLayout(List<?> list, Object model, Field field) {
    return new VerticalLayoutDto();
  }

  private ComponentMetadataDto getSplitLayout(List<?> list, Object model, Field field) {
    if (list.size() > 2) {
      log.warn(
          "Split layout cannot have more than 2 elements"
              + (field != null ? " for field " + field.getName() : ""));
    }
    return new SplitLayoutDto();
  }

  @SneakyThrows
  private ComponentMetadataDto getCrud(String listId, JpaCrud crud) {
    Listing listing = jpaRpcCrudFactory.create(crud);
    return crudMetadataBuilder.build(listId, listing);
  }

  @SneakyThrows
  private MicroFrontendDto getJourneyStarter(io.mateu.uidl.interfaces.MicroFrontend microFrontend) {
    return new MicroFrontendDto(
        microFrontend.baseUrl(),
        microFrontend.journeyTypeId(),
        serializerService.toJson(microFrontend.contextData()));
  }

  private FormDto getMethodParametersEditor(MethodParametersEditor uiInstance) {
    return methodParametersEditorMetadataBuilder.build(uiInstance);
  }

  private ResultDto getResult(Result uiInstance) {
    return resultMetadataBuilder.build(uiInstance);
  }

  private StepperDto getStepper() {
    return stepperMetadataBuilder.build();
  }

  private CardDto getCard(Card uiInstance, List<Field> slotFields) {
    return cardMetadataBuilder.build(uiInstance, slotFields);
  }

  private FormDto getForm(
      Object uiInstance,
      List<Field> slotFields,
      Map<String, Object> data,
      boolean autoFocusDisabled) {
    return formMetadataBuilder.build(uiInstance, slotFields, data, autoFocusDisabled);
  }

  private CrudDto getCrud(String listId, Listing rpcView) {
    return crudMetadataBuilder.build(listId, rpcView);
  }

  public ComponentMetadataDto getFormMetadata(
      Object form,
      Map<String, Object> data,
      String baseUrl,
      ServerHttpRequest serverHttpRequest,
      boolean autoFocusDisabled) {
    return getMetadata(
        true,
        form,
        null,
        reflectionService.getAllEditableFields(form.getClass()),
        data,
        baseUrl,
        serverHttpRequest,
        autoFocusDisabled);
  }
}
