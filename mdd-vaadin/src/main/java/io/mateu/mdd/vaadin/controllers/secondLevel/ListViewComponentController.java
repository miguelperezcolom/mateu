package io.mateu.mdd.vaadin.controllers.secondLevel;

import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.components.app.views.secondLevel.FiltersViewFlowComponent;
import io.mateu.mdd.vaadin.components.views.JPAListViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.MethodCall;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.JPAHelper;

import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class ListViewComponentController extends Controller {

    private final ListViewComponent listViewComponent;

    public ListViewComponentController(ListViewComponent listViewComponent) {
        this.listViewComponent = listViewComponent;
    }


    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {

        if (!"".equals(cleanStep)) {
            if ("filters".equals(step)) {
                return new FiltersViewFlowComponent(listViewComponent);
            } else if ("new".equals(step)) {
                Object form = null;
                if (listViewComponent instanceof RpcListViewComponent) {
                    form = ((RpcListViewComponent)listViewComponent).getRpcListView().onNew();
                }
                if (form != null) {
                    return form;
                } else {
                    try {
                        return ReflectionHelper.newInstance(listViewComponent.getModelType());
                    } catch (IllegalArgumentException e) {
                        throw new Exception(listViewComponent.getModelType().getSimpleName() + " needs a no args constructor");
                    }
                }
            } else {

                Method method = listViewComponent.getMethod(step);

                if (method != null) {
                    if (listViewComponent instanceof RpcListViewComponent) {
                        return new MethodCall(((RpcListViewComponent)listViewComponent).getRpcListView()
                                , method, null).process();
                    }
                    return new MethodCall(null, method, null).process();
                } else {
                    if (listViewComponent instanceof JPAListViewComponent) {
                        Class type = listViewComponent.getModelType();
                        return JPAHelper.find(type, ReflectionHelper.toId(type, new String(Base64.getUrlDecoder().decode(step))));
                    } else if (listViewComponent instanceof RpcListViewComponent) {
                        Object form = ((RpcListViewComponent) listViewComponent).onEdit(new String(Base64.getUrlDecoder().decode(step)));
                        Class type = listViewComponent.getModelType();
                        if (form == null) {
                            form = ReflectionHelper.newInstance(type);
                        } else if (!form.getClass().equals(type)) {
                            try {
                                form = ReflectionHelper.newInstance(type, form);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                        return form;
                    }

                }

            }
        }
        return null;
    }
}
