package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.dtos.*;
import io.mateu.dtos.Element;
import io.mateu.dtos.Tab;
import io.mateu.uidl.annotations.Attribute;
import io.mateu.uidl.annotations.Content;
import io.mateu.uidl.annotations.On;
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

  @Autowired MethodParametersEditorMetadataBuilder methodParametersEditorMetadataBuilder;

  @Autowired ReflectionService reflectionService;
  @Autowired private DataExtractor dataExtractor;
  @Autowired private BasicTypeChecker basicTypeChecker;

  @Qualifier("captionProvider")
  @Autowired
  private CaptionProvider captionProvider;

  @Autowired private ServerSideObjectMapper serverSideObjectMapper;
  @Autowired private DirectoryMetadataBuilder directoryMetadataBuilder;

  public ComponentMetadata getMetadata(
      boolean form,
      Object componentInstance,
      Field field,
      List<Field> slotFields,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest) {
    ComponentMetadata metadata;
    if (componentInstance instanceof List<?> list
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.HorizontalLayout.class)) {
      metadata = getHorizontalLayout(list, componentInstance, field);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.HorizontalLayout.class)) {
      metadata = getHorizontalLayout(componentInstance);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.TabLayout.class)) {
      metadata = getTabLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance
            .getClass()
            .isAnnotationPresent(io.mateu.uidl.annotations.TabLayout.class)) {
      metadata = getTabLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance
            .getClass()
            .isAnnotationPresent(io.mateu.uidl.annotations.HorizontalLayout.class)) {
      metadata = getHorizontalLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance
            .getClass()
            .isAnnotationPresent(io.mateu.uidl.annotations.VerticalLayout.class)) {
      metadata = getVerticalLayout(componentInstance);
    } else if (componentInstance instanceof List<?> list
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.VerticalLayout.class)) {
      metadata = getVerticalLayout(list, componentInstance, field);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.VerticalLayout.class)) {
      metadata = getVerticalLayout(componentInstance);
    } else if (componentInstance instanceof List<?> list
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.SplitLayout.class)) {
      metadata = getSplitLayout(list, componentInstance, field);
    } else if (componentInstance != null
        && field != null
        && field.isAnnotationPresent(io.mateu.uidl.annotations.SplitLayout.class)) {
      metadata = getSplitLayout(componentInstance);
    } else if (componentInstance != null
        && componentInstance
            .getClass()
            .isAnnotationPresent(io.mateu.uidl.annotations.SplitLayout.class)) {
      metadata = getSplitLayout(componentInstance);
    } else if (componentInstance instanceof io.mateu.uidl.interfaces.JourneyStarter) {
      metadata = getJourneyStarter((io.mateu.uidl.interfaces.JourneyStarter) componentInstance);
    } else if (componentInstance instanceof Element) {
      metadata = getElement((Element) componentInstance);
    } else if (componentInstance
        .getClass()
        .isAnnotationPresent(io.mateu.uidl.annotations.Element.class)) {
      metadata = buildElement(componentInstance);
    } else if (componentInstance instanceof MethodParametersEditor) {
      metadata = getMethodParametersEditor((MethodParametersEditor) componentInstance);
    } else if (componentInstance instanceof Result) {
      metadata = getResult((Result) componentInstance);
    } else if (componentInstance instanceof io.mateu.uidl.interfaces.Directory directory) {
      metadata = getDirectory(directory, serverHttpRequest);
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
    } else if (componentInstance != null && basicTypeChecker.isBasic(componentInstance)) {
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
        metadata = getForm(componentInstance, slotFields, data);
      } else {
        metadata = getNonForm(componentInstance);
      }
    }

    return metadata;
  }

  private ComponentMetadata getDirectory(
      io.mateu.uidl.interfaces.Directory directory, ServerHttpRequest serverHttpRequest) {
    return directoryMetadataBuilder.build(directory, serverHttpRequest);
  }

  private ComponentMetadata wrap(Object value) {
    return new io.mateu.dtos.Element(
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

  private ComponentMetadata getVerticalLayout(Object componentInstance) {
    return new io.mateu.dtos.VerticalLayout();
  }

  private ComponentMetadata getHorizontalLayout(Object componentInstance) {
    return new io.mateu.dtos.HorizontalLayout();
  }

  private ComponentMetadata getTabLayout(Object componentInstance) {
    List<Tab> tabs = new ArrayList<>();
    if (componentInstance != null) {
      reflectionService
          .getAllFields(componentInstance.getClass())
          .forEach(
              f -> {
                tabs.add(new Tab(f.getName(), false, captionProvider.getCaption(f)));
              });
    }
    return new io.mateu.dtos.TabLayout(tabs);
  }

  private ComponentMetadata getSplitLayout(Object componentInstance) {
    return new io.mateu.dtos.SplitLayout();
  }

  private ComponentMetadata getNonForm(Object componentInstance) {
    if (componentInstance instanceof Container) {
      return new io.mateu.dtos.VerticalLayout();
    }
    return new io.mateu.dtos.Element("div", Map.of(), "" + componentInstance);
  }

  private ComponentMetadata buildElement(Object componentInstance) {
    return new io.mateu.dtos.Element(
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
    List<Pair> listeners = new ArrayList<>();
    reflectionService.getAllMethods(componentInstance.getClass()).stream()
        .filter(m -> m.isAnnotationPresent(On.class))
        .forEach(
            m -> {
              var on = m.getAnnotation(On.class);
              listeners.add(new Pair("listener", new Listener(on.value(), m.getName(), on.js())));
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

  private ComponentMetadata getElement(Element element) {
    return new io.mateu.dtos.Element(element.name(), element.attributes(), element.content());
  }

  private ComponentMetadata getHorizontalLayout(List<?> list, Object model, Field field) {
    return new io.mateu.dtos.HorizontalLayout();
  }

  private ComponentMetadata getVerticalLayout(List<?> list, Object model, Field field) {
    return new io.mateu.dtos.VerticalLayout();
  }

  private ComponentMetadata getSplitLayout(List<?> list, Object model, Field field) {
    if (list.size() > 2) {
      log.warn(
          "Split layout cannot have more than 2 elements"
              + (field != null ? " for field " + field.getName() : ""));
    }
    return new io.mateu.dtos.SplitLayout();
  }

  @SneakyThrows
  private ComponentMetadata getCrud(String listId, JpaCrud crud) {
    Listing listing = jpaRpcCrudFactory.create(crud);
    return crudMetadataBuilder.build(listId, listing);
  }

  private JourneyStarter getJourneyStarter(io.mateu.uidl.interfaces.JourneyStarter journeyStarter) {
    return new JourneyStarter(
        journeyStarter.uiId(),
        journeyStarter.baseUrl(),
        journeyStarter.journeyTypeId(),
        journeyStarter.contextData());
  }

  private Form getMethodParametersEditor(MethodParametersEditor uiInstance) {
    return methodParametersEditorMetadataBuilder.build(uiInstance);
  }

  private io.mateu.dtos.Result getResult(Result uiInstance) {
    return resultMetadataBuilder.build(uiInstance);
  }

  private io.mateu.dtos.Stepper getStepper() {
    return stepperMetadataBuilder.build();
  }

  private io.mateu.dtos.Card getCard(Card uiInstance, List<Field> slotFields) {
    return cardMetadataBuilder.build(uiInstance, slotFields);
  }

  private Form getForm(Object uiInstance, List<Field> slotFields, Map<String, Object> data) {
    return formMetadataBuilder.build(uiInstance, slotFields, data);
  }

  private Crud getCrud(String listId, Listing rpcView) {
    return crudMetadataBuilder.build(listId, rpcView);
  }

  public ComponentMetadata getFormMetadata(
      Object form, Map<String, Object> data, ServerHttpRequest serverHttpRequest) {
    return getMetadata(
        true,
        form,
        null,
        reflectionService.getAllEditableFields(form.getClass()),
        data,
        serverHttpRequest);
  }
}
