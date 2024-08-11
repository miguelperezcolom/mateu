package io.mateu.core.domain.model.outbound.modelToDtoMappers;

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
import io.mateu.core.domain.uidefinition.core.interfaces.HasSubtitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinition.core.interfaces.RpcCrudViewExtended;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import io.mateu.dtos.JourneyContainer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
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
      if (SlotName.main.equals(slot) && uiInstanceParts.size() == 0) {
        uiInstanceParts.add(new UIInstancePart("", actualUiInstance, List.of()));
      }

      uiInstanceParts.forEach(
          p -> {
            ViewMetadata metadata =
                viewMetadataBuilder.getMetadata(
                        p.getDataPrefix(),
                    stepId, uiInstance, p.getUiInstance(), p.getFields());
            rules.addAll(rulesBuilder.buildRules(metadata, p.getUiInstance()));
            componentsPerSlot
                .get(slot)
                .add(Component.builder().metadata(metadata).attributes(new HashMap<>()).build());
          });
    }

    addComponentIds(left, main, right, rules);

    View view =
        View.builder()
            .messages(List.of())
            .left(ViewPart.builder().components(left).build())
            .main(ViewPart.builder().components(main).build())
            .right(ViewPart.builder().components(right).build())
            .header(ViewPart.builder().components(header).build())
            .footer(ViewPart.builder().components(footer).build())
            .build();

    return view;
  }

  public void unnestPartialFormData(Map<String, Object> data, Object form) {

    if (form == null) {
      return;
    }

    for (Field field : reflectionHelper.getAllEditableFields(form.getClass())) {
      if (PartialForm.class.isAssignableFrom(field.getType())) {
        var nestedData = data.get(field.getId());
        if (nestedData != null && nestedData instanceof Map) {
          Map<String, Object> nestedMap = (Map<String, Object>) nestedData;
          for (String key : nestedMap.keySet()) {
            data.put("__nestedData__" + field.getId() + "__" + key, nestedMap.get(key));
          }
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
        && journeyContainer.getInitialStep() != null
        && "io.mateu.domain.uidefinition.ui.cruds.JpaRpcCrudView"
            .equals(journeyContainer.getInitialStep().getType())) { // todo: check si es un crud jpa
      RpcCrudViewExtended rpcCrudView =
          (RpcCrudViewExtended)
              applicationContext
                  .getBean(JourneyContainerService.class)
                  .getViewInstance(
                      journeyContainer,
                      journeyContainer.getInitialStep().getId(),
                      serverHttpRequest);
      actualUiInstance =
          entityProvider.find(
              rpcCrudView.getEntityClass(), ((EntityEditor) uiInstance).getData().get("id"));
    } else if (uiInstance instanceof Class
        && Listing.class.isAssignableFrom((Class<?>) uiInstance)) {
      actualUiInstance = reflectionHelper.newInstance((Class) uiInstance);
    }
    return actualUiInstance;
  }

  private void addComponentIds(
      List<Component> left, List<Component> main, List<Component> right, List<Rule> rules) {
    int i = 0;
    for (Component component :
        List.of(left, main, right).stream().flatMap(l -> l.stream()).collect(Collectors.toList())) {
      component.setId("component-" + i++);
      if (component.getMetadata() instanceof Crud) {
        Crud crud = (Crud) component.getMetadata();
        crud.setActions(crud.getActions().stream().map(a -> new Action(
                component.getId() + "___" + a.id(),
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
                a.href()
        )).toList());
      }

      if (component.getMetadata() instanceof Form form) {
          component.setMetadata(new Form(
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
                setIdAndAddRuleForActions(form.actions(), component.getId(), rules),
                setIdAndAddRuleForActions(form.mainActions(), component.getId(), rules),
                form.validations()
        ));
      }

    }
  }

  private List<Action> setIdAndAddRuleForActions(List<Action> actions, String componentId, List<Rule> rules) {
    addRuleForActions(actions, componentId, rules);
    return setIdForActions(actions, componentId, rules);
  }

  private List<Action> setIdForActions(List<Action> actions, String componentId, List<Rule> rules) {
    return actions.stream().map(a -> new Action(
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
            a.href()
    )).toList();
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
