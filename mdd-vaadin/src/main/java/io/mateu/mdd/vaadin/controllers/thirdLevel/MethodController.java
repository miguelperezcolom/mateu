package io.mateu.mdd.vaadin.controllers.thirdLevel;

import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.Page;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.IFrame;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.annotations.Pdf;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.views.*;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.views.BrokenLinkView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import javax.persistence.Entity;
import javax.persistence.Query;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class MethodController extends Controller {
    private final Method method;

    public MethodController(ViewStack stack, String path, Method method) {
        this.method = method;
        try {
            if (MDDUIAccessor.getPendingResult() != null) {
                register(stack, path, procesarResultado(method, MDDUIAccessor.getPendingResult(), getLastViewComponent(stack), false));
                MDDUIAccessor.setPendingResult(null);
            } else {

                Component lastViewComponent = getLastViewComponent(stack);

                Object instance = null;

                if (lastViewComponent instanceof JPACollectionFieldListViewComponent) {
                    instance = ((JPACollectionFieldListViewComponent) lastViewComponent).getEvfc().getModel();
                } else if (lastViewComponent instanceof EditorViewComponent) {
                    instance = ((EditorViewComponent) lastViewComponent).getModel();
                }

                if (method.isAnnotationPresent(Action.class) && method.getAnnotation(Action.class).refreshOnBack()) {
                    if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
                } else if (lastViewComponent != null && lastViewComponent instanceof ListViewComponent) {
                    if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
                }


                boolean hasNonInjectedParameters = false;

                for (Parameter p : method.getParameters()) if (!ReflectionHelper.isInjectable(method, p)) {
                    hasNonInjectedParameters = true;
                    break;
                }

                if (hasNonInjectedParameters) {
                    MethodParametersViewComponent mpvc;
                    register(stack, path, mpvc = new MethodParametersViewComponent(instance, method, MDDUIAccessor.getPendingSelection()));
                    mpvc.addEditorListener(new EditorListener() {
                        @Override
                        public void preSave(Object model) throws Throwable {

                        }

                        @Override
                        public void onSave(Object model) {

                        }

                        @Override
                        public void onGoBack(Object model) {
                            if (lastViewComponent != null && lastViewComponent instanceof ListViewComponent) {
                                try {
                                    ((ListViewComponent) lastViewComponent).search(((ListViewComponent) lastViewComponent).getModelForSearchFilters());
                                } catch (Throwable throwable) {
                                    Notifier.alert(throwable);
                                }
                            }
                        }
                    });
                } else {
                    register(stack, path,  procesarResultado(method, CoreReflectionHelper.execute(method, new MDDBinder(new ArrayList<>()), instance, MDDUIAccessor.getPendingSelection()), getLastViewComponent(stack), false));
                }
            }
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
        }
    }

    private Component getLastViewComponent(ViewStack stack) {
        View v = stack.getLast();
        return v != null?v.getViewComponent():null;
    }


    private AbstractViewComponent procesarResultado(Method m, Object r, Component lastViewComponent, boolean inNewWindow) throws Throwable {
        String title = m != null?"Result of " + Helper.capitalize(m.getName()):"Result";

        if (m != null && m.isAnnotationPresent(Action.class) && m.getAnnotation(Action.class).refreshOnBack()) {
            if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
        } else if (lastViewComponent != null && lastViewComponent instanceof ListViewComponent) {
            if (lastViewComponent != null) lastViewComponent.addStyleName("refreshOnBack");
        }

        if (r == null && void.class.equals(m.getReturnType())) {
            ComponentWrapper cw = new ComponentWrapper(title, new Label("Void method", ContentMode.HTML));
            cw.addAttachListener(e -> {
                MDDUIAccessor.goBack();
            });
            return cw;
        } else if (r == null) {
            return new ComponentWrapper(title, new Label("Empty result", ContentMode.HTML));
        } else {
            Class c = r.getClass();

            if (r instanceof Class) {
                c = (Class) r;
                if (c.isAnnotationPresent(Entity.class)) {
                    return new JPAListViewComponent(c);
                } else if (RpcView.class.isAssignableFrom(c)) {
                    r = c.getConstructor().newInstance();
                    if (m != null && m.isAnnotationPresent(Output.class)) {
                        try {
                            return new ComponentWrapper(title, new PdfComponent((RpcView) r, r, null));
                        } catch (Throwable throwable) {
                            Notifier.alert(throwable);
                        }
                    } else {
                        return new RpcListViewComponent((RpcView) r);
                    }
                }
            } else if (int.class.equals(c)
                    || Integer.class.equals(c)
                    || long.class.equals(c)
                    || Long.class.equals(c)
                    || double.class.equals(c)
                    || Double.class.equals(c)
                    || String.class.equals(c)
                    || boolean.class.equals(c)
                    || Boolean.class.equals(c)
                    || float.class.equals(c)
                    || Float.class.equals(c)
            ) {
                return new ComponentWrapper(title, new Label("" + r, ContentMode.HTML));
            } else if (URL.class.equals(c)) {
                if (r.toString().contains("google")) {
                    Page.getCurrent().open(r.toString(), "_blank");
                } else if ((m != null && m.isAnnotationPresent(IFrame.class)) || r.toString().endsWith("pdf")) {
                    BrowserFrame b = new BrowserFrame("Result", new ExternalResource(r.toString()));
                    b.setSizeFull();
                    return new ComponentWrapper(null, title, b, true);
                } else {
                    return new ComponentWrapper(title, new Link("Click me to view the result", new ExternalResource(r.toString())));
                }
            } else if (r instanceof Collection && ((Collection) r).size() > 0 && ((Collection) r).iterator().next() != null && ((Collection) r).iterator().next().getClass().isAnnotationPresent(Entity.class)) {
                return new CollectionListViewComponent((Collection) r, ((Collection) r).iterator().next().getClass());
            } else if (Collection.class.isAssignableFrom(c)) {

                Collection col = (Collection) r;

                if (col.size() == 0) {
                    return new ComponentWrapper(null, title, new Label("Empty list", ContentMode.HTML), true);
                } else if (m != null && m.isAnnotationPresent(Pdf.class) || Query.class.isAssignableFrom(m.getReturnType())) {
                    try {
                        return new ComponentWrapper(null, title, new PdfComponent((List) r), true);
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                } else {

                    if (MDDUIAccessor.isMobile()) {

                        VerticalLayout vl = new VerticalLayout();
                        boolean primero = true;
                        for (Object o : col) {

                            if (primero) primero = false;
                            else vl.addComponent(new Label("--------------"));

                            if (ReflectionHelper.isBasico(o)) {
                                vl.addComponent(new Label("" + o));
                            } else {
                                for (FieldInterfaced f : ReflectionHelper.getAllFields(o.getClass())) {
                                    Label l;
                                    vl.addComponent(l = new Label("" + ReflectionHelper.getCaption(f)));
                                    l.addStyleName(ValoTheme.LABEL_BOLD);
                                    l.addStyleName(CSS.NOPADDING);
                                    vl.addComponent(l = new Label("" + ReflectionHelper.getValue(f, o)));
                                    l.addStyleName(CSS.NOPADDING);
                                }
                            }

                        }

                        return new ComponentWrapper(title, vl);

                    } else {

                        Object primerElemento = col.iterator().next();

                        Grid g = new Grid();

                        ListViewComponent.buildColumns(g, ListViewComponent.getColumnFields(primerElemento.getClass()), false, false);

                        //g.setSelectionMode(Grid.SelectionMode.MULTI);

                        // añadimos columna para que no haga feo
                        if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
                        else g.addColumn((d) -> null).setWidthUndefined().setCaption("");

                        g.setWidth("100%");
                        g.setHeightByRows(col.size());

                        g.setDataProvider(new ListDataProvider((Collection) r));

                        return new ComponentWrapper(null, title, g, true);
                    }

                }


            } else if (r instanceof Query) {

                try {
                    return new ComponentWrapper(title, new PdfComponent((Query) r));
                } catch (Throwable throwable) {
                    Notifier.alert(throwable);
                }

            } else if (r instanceof RpcView) {

                if (m != null && m.isAnnotationPresent(Output.class)) {
                    try {
                        return new ComponentWrapper(title, new PdfComponent((RpcView) r, r, null));
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                } else {
                    return new RpcListViewComponent((RpcView) r);
                }

            } else if (m != null && m.isAnnotationPresent(Output.class)) {

                return new ComponentWrapper(title, new PrintPOJOComponent(r));

            } else if (r.getClass().isAnnotationPresent(Entity.class) || PersistentPojo.class.isAssignableFrom(r.getClass())) {
                return new EditorViewComponent(r, lastViewComponent);
            } else if (r instanceof Component) {
                return new ComponentWrapper(title, (Component) r);
            } else if (r instanceof AbstractAction) {
                new AcctionRunner().run((AbstractAction) r);
            } else if (r instanceof WizardPage) {
                return new WizardComponent((WizardPage) r);
            } else {
                return new EditorViewComponent(r) {
                    @Override
                    public void goBack() {
                        // no vuelve atrás
                    }
                };
            }

        }
        return new ComponentWrapper("Error", new Label("Result type not supported"));
    }
}
