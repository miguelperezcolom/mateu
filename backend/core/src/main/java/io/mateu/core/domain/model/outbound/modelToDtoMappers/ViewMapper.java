package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.outbound.metadataBuilders.ViewMetadataBuilder;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.*;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.RpcCrudViewExtended;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import io.mateu.dtos.JourneyContainer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ViewMapper {

  private final EntityProvider entityProvider;
  private final ApplicationContext applicationContext;
  private final FieldExtractor fieldExtractor;
  private final ViewMetadataBuilder viewMetadataBuilder;
  private final DataExtractor dataExtractor;
  private final RulesBuilder rulesBuilder;
  private final UIInstancePartsExtractor uiInstancePartsExtractor;
  private final ReflectionHelper reflectionHelper;
  private final Serializer serializer;
  private final CaptionProvider captionProvider;

  public ViewMapper(
      EntityProvider entityProvider,
      ApplicationContext applicationContext,
      FieldExtractor fieldExtractor,
      ViewMetadataBuilder viewMetadataBuilder,
      DataExtractor dataExtractor,
      RulesBuilder rulesBuilder,
      UIInstancePartsExtractor uiInstancePartsExtractor,
      ReflectionHelper reflectionHelper,
      Serializer serializer,
      CaptionProvider captionProvider) {
    this.entityProvider = entityProvider;
    this.applicationContext = applicationContext;
    this.fieldExtractor = fieldExtractor;
    this.viewMetadataBuilder = viewMetadataBuilder;
    this.dataExtractor = dataExtractor;
    this.rulesBuilder = rulesBuilder;
    this.uiInstancePartsExtractor = uiInstancePartsExtractor;
    this.reflectionHelper = reflectionHelper;
    this.serializer = serializer;
    this.captionProvider = captionProvider;
  }

  public View map(
      JourneyContainer journeyContainer,
      String stepId,
      Object uiInstance,
      Map<String, Object> data,
      List<Rule> rules,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    // mddopencrudaction, crud class

    Object actualUiInstance =
        getActualUiInstance(journeyContainer, stepId, uiInstance, serverHttpRequest);

    data.putAll(dataExtractor.getData(uiInstance, actualUiInstance));

    unnestPartialFormData(data, actualUiInstance);

    // todo: build left, main and right in a separate manner
    List<Component> left = new ArrayList<>();
    List<Component> main = new ArrayList<>();
    List<Component> right = new ArrayList<>();
    List<Component> header = new ArrayList<>();
    List<Component> footer = new ArrayList<>();

    Map<SlotName, List<Component>> componentsPerSlot =
        Map.of(
            SlotName.left, left,
            SlotName.main, main,
            SlotName.right, right,
            SlotName.header, header,
            SlotName.footer, footer);

    for (SlotName slot :
        List.of(SlotName.main, SlotName.left, SlotName.right, SlotName.header, SlotName.footer)) {

      List<Field> slotFields = fieldExtractor.getFields(actualUiInstance, slot);

      List<UIInstancePart> uiInstanceParts =
          uiInstancePartsExtractor.getUiParts(actualUiInstance, slotFields, slot);
      if (SlotName.main.equals(slot) && uiInstanceParts.isEmpty()) {
        uiInstanceParts.add(new UIInstancePart("", actualUiInstance, List.of()));
      }

      uiInstanceParts.forEach(
          p -> {
            ViewMetadata metadata =
                viewMetadataBuilder.getMetadata(
                    p.getDataPrefix(), stepId, uiInstance, p.getUiInstance(), p.getFields());
            rules.addAll(rulesBuilder.buildRules(metadata, p.getUiInstance()));
            componentsPerSlot.get(slot).add(new Component(metadata, "", Map.of()));
          });
    }

    AtomicInteger componentCounter = new AtomicInteger();
    left = addComponentIds(componentCounter, left, rules);
    main = addComponentIds(componentCounter, main, rules);
    right = addComponentIds(componentCounter, right, rules);

    return new View(
        null,
        null,
        List.of(),
        new ViewPart(null, header),
        new ViewPart(null, left),
        new ViewPart(null, main),
        new ViewPart(null, right),
        new ViewPart(null, footer));
  }

  public void unnestPartialFormData(Map<String, Object> data, Object form) {

    if (form == null) {
      return;
    }

    var copyOfData = new HashMap<>(data);
    for (Field field : reflectionHelper.getAllEditableFields(form.getClass())) {
      if (PartialForm.class.isAssignableFrom(field.getType())) {
        var nestedData = copyOfData.get(field.getId());
        if (nestedData instanceof Map nestedMap) {
          nestedMap.forEach((k, v) -> data.put("__nestedData__" + field.getId() + "__" + k, v));
        }
        data.remove(field.getId());
      }
    }
  }

  private Object getActualUiInstance(
      JourneyContainer journeyContainer,
      String stepId,
      Object uiInstance,
      ServerHttpRequest serverHttpRequest)
      throws Exception {
    Object actualUiInstance = uiInstance;
    if (uiInstance instanceof EntityEditor) {
      EntityEditor entityEditor = (EntityEditor) uiInstance;
      actualUiInstance =
          entityProvider.find(entityEditor.getEntityClass(), entityEditor.getData().get("__id"));
    } else if (uiInstance instanceof ObjectEditor) {
      ObjectEditor objectEditor = (ObjectEditor) uiInstance;
      actualUiInstance = reflectionHelper.newInstance(objectEditor.getType());
      Object filled =
          serializer.fromJson(serializer.toJson(objectEditor.getData()), objectEditor.getType());
      reflectionHelper.copy(filled, actualUiInstance);
    } else if (uiInstance instanceof FieldEditor) {
      FieldEditor fieldEditor = (FieldEditor) uiInstance;
      actualUiInstance =
          serializer.fromJson(serializer.toJson(fieldEditor.getData()), fieldEditor.getType());
    } else if (uiInstance instanceof MethodParametersEditor) {
      MethodParametersEditor methodParametersEditor = (MethodParametersEditor) uiInstance;
      // actualUiInstance = Helper.fromJson(Helper.toJson(fieldEditor.getData()),
      // fieldEditor.getType());
    } else if (("view".equals(stepId) || "edit".equals(stepId))
        && journeyContainer.initialStep() != null
        && "io.mateu.domain.uidefinition.ui.cruds.JpaRpcCrudView"
            .equals(journeyContainer.initialStep().type())) { // todo: check si es un crud jpa
      RpcCrudViewExtended rpcCrudView =
          (RpcCrudViewExtended)
              applicationContext
                  .getBean(JourneyContainerService.class)
                  .getViewInstance(
                      journeyContainer, journeyContainer.initialStep().id(), serverHttpRequest);
      actualUiInstance =
          entityProvider.find(
              rpcCrudView.getEntityClass(), ((EntityEditor) uiInstance).getData().get("id"));
    } else if (uiInstance instanceof Class
        && Listing.class.isAssignableFrom((Class<?>) uiInstance)) {
      actualUiInstance = reflectionHelper.newInstance((Class) uiInstance);
    }
    return actualUiInstance;
  }

  private List<Component> addComponentIds(
      AtomicInteger componentCounter, List<Component> components, List<Rule> rules) {

    return components.stream()
        .map(
            c ->
                new Component(
                    c.metadata(),
                    "component-" + componentCounter.getAndIncrement(),
                    c.attributes()))
        .map(
            c -> new Component(updateMetadata(c.id(), c.metadata(), rules), c.id(), c.attributes()))
        .toList();
  }

  private ViewMetadata updateMetadata(String componentId, ViewMetadata metadata, List<Rule> rules) {
    if (metadata instanceof Crud crud) {
      return new Crud(
          crud.dataPrefix(),
          crud.listId(),
          crud.title(),
          crud.subtitle(),
          crud.canEdit(),
          crud.searchForm(),
          crud.columns(),
          crud.actions().stream()
              .map(
                  a ->
                      new Action(
                          componentId + "___" + a.id(),
                          a.caption(),
                          a.type(),
                          a.visible(),
                          a.validationRequired(),
                          a.confirmationRequired(),
                          a.rowsSelectedRequired(),
                          a.confirmationTexts(),
                          a.target(),
                          a.modalStyle(),
                          a.customEvent(),
                          a.href()))
              .toList());
    }

    if (metadata instanceof Form form) {
      return new Form(
          form.dataPrefix(),
          form.icon(),
          form.title(),
          form.readOnly(),
          form.subtitle(),
          form.status(),
          form.badges(),
          form.tabs(),
          form.banners(),
          form.sections(),
          setIdAndAddRuleForActions(form.actions(), componentId, rules),
          setIdAndAddRuleForActions(form.mainActions(), componentId, rules),
          form.validations());
    }
    return metadata;
  }

  private List<Action> setIdAndAddRuleForActions(
      List<Action> actions, String componentId, List<Rule> rules) {
    addRuleForActions(actions, componentId, rules);
    return setIdForActions(actions, componentId, rules);
  }

  private List<Action> setIdForActions(List<Action> actions, String componentId, List<Rule> rules) {
    return actions.stream()
        .map(
            a ->
                new Action(
                    componentId + "___" + a.id(),
                    a.caption(),
                    a.type(),
                    a.visible(),
                    a.validationRequired(),
                    a.confirmationRequired(),
                    a.rowsSelectedRequired(),
                    a.confirmationTexts(),
                    a.target(),
                    a.modalStyle(),
                    a.customEvent(),
                    a.href()))
        .toList();
  }

  private void addRuleForActions(List<Action> actions, String componentId, List<Rule> rules) {
    actions.forEach(
        action -> {
          rules.stream()
              .filter(
                  r ->
                      RuleAction.HideAction.equals(r.getAction())
                          || RuleAction.ShowAction.equals(r.getAction())
                          || RuleAction.EnableAction.equals(r.getAction())
                          || RuleAction.DisableAction.equals(r.getAction()))
              .filter(r -> action.id().equals(((String[]) r.getData())[0]))
              .forEach(
                  r -> {
                    r.setData(new String[] {componentId + "___" + action.id()});
                  });
        });
  }
}
