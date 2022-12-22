package io.mateu.mdd.vaadin.controllers.thirdLevel;

import com.vaadin.data.ValueProvider;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.FileResource;
import com.vaadin.server.Page;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.*;
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
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import javax.persistence.Entity;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.util.*;

public class MethodController extends Controller {
    private final Method method;
    private final Object instance;

    public MethodController(ViewStack stack, String path, Method method) {
        this(stack, path, null, method);
    }

    public MethodController(ViewStack stack, String path, Object instance, Method method) {
        this.method = method;
        this.instance = instance;
        try {
            if (MDDUIAccessor.getPendingResult() != null) {
                AbstractViewComponent c = procesarResultado(method, MDDUIAccessor.getPendingResult(), getLastViewComponent(stack), false);
                if (c != null) registerComponentInStack(stack, path, c);
                else MDDUIAccessor.goTo(path.substring(0, path.lastIndexOf("/")));
                MDDUIAccessor.setPendingResult(null);
            } else {

                Component lastViewComponent = getLastViewComponent(stack);

                Object _instance = instance;
                if (_instance == null) {
                    if (lastViewComponent instanceof JPACollectionFieldListViewComponent) {
                        _instance = ((JPACollectionFieldListViewComponent) lastViewComponent).getEvfc().getModel();
                    } else if (lastViewComponent instanceof EditorViewComponent) {
                        _instance = ((EditorViewComponent) lastViewComponent).getModel();
                    } else if (!Modifier.isStatic(method.getModifiers())) {
                        _instance = ReflectionHelper.newInstance(method.getDeclaringClass());
                    }
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
                    registerComponentInStack(stack, path, mpvc = new MethodParametersViewComponent(_instance, method, MDDUIAccessor.getPendingSelection()));
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
                    registerComponentInStack(stack, path,  procesarResultado(method, CoreReflectionHelper.execute(method, new MDDBinder(new ArrayList<>()), _instance, MDDUIAccessor.getPendingSelection()), getLastViewComponent(stack), false));
                }
            }
        } catch (Throwable throwable) {
            Notifier.alert(throwable);
        }
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if ("result".equalsIgnoreCase(step)) {
            Object o = MDDUIAccessor.getPendingResult();
            MDDUIAccessor.setPendingResult(null);
            registerComponentInStack(stack, path + "/" + step, procesarResultado(method, o, null, false));
        }
    }

    private Component getLastViewComponent(ViewStack stack) {
        View v = stack.getLast();
        return v != null?v.getViewComponent():null;
    }


    public static AbstractViewComponent procesarResultado(Method m, Object r, Component lastViewComponent, boolean inNewWindow) throws Throwable {
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
                    return new RpcListViewComponent((RpcView) r);
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
                    return null;
                } else if ((m != null && m.isAnnotationPresent(IFrame.class)) || r.toString().endsWith("pdf")) {
                    BrowserFrame b = new BrowserFrame("Result", new ExternalResource(r.toString()));
                    b.setSizeFull();
                    return new ComponentWrapper(null, title, b, true);
                } else {
                    return new ComponentWrapper(title, new Link("Click me to view the result", new ExternalResource(r.toString())));
                }
            } else if (File.class.equals(c)) {
                BrowserFrame b = new BrowserFrame("Result", new FileResource((File) r));
                b.setSizeFull();
                return new ComponentWrapper(null, title, b, true);
            } else if (r instanceof Collection && ((Collection) r).size() > 0 && ((Collection) r).iterator().next() != null && ((Collection) r).iterator().next().getClass().isAnnotationPresent(Entity.class)) {
                return new CollectionListViewComponent((Collection) r, ((Collection) r).iterator().next().getClass());
            } else if (Collection.class.isAssignableFrom(c) || c.isArray()) {

                Collection col = new ArrayList();
                if (Collection.class.isAssignableFrom(c)) col = (Collection) r;
                if (c.isArray()) {
                    col = new ArrayList();
                    if (r instanceof boolean[]) for (boolean b : ((boolean[]) r)) {
                        col.add(b);
                    }
                    else if (r instanceof int[]) for (int i : ((int[]) r)) {
                        col.add(i);
                    }
                    else if (r instanceof float[]) for (float v : ((float[]) r)) {
                        col.add(v);
                    }
                    else if (r instanceof double[]) for (double v : ((double[]) r)) {
                        col.add(v);
                    }
                    else if (r instanceof Object[]) for (Object o : ((Object[]) r)) {
                        col.add(o);
                    }
                    else Notifier.alert("Unsupported array type");
                }

                if (col.size() == 0) {
                    return new ComponentWrapper(null, title, new Label("Empty list", ContentMode.HTML), true);
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

                        Iterator i = col.iterator();
                        Object first = i.next();
                        while (i.hasNext() && first == null) first = i.next();

                        if (first == null) {
                            return new ComponentWrapper(null, title, new Label("List with " + col.size() + " nulls", ContentMode.HTML), true);
                        } else {
                            Class type = first.getClass();

                            Grid g = new Grid();

                            if (ReflectionHelper.isBasico(type) || type.isArray() || Collection.class.isAssignableFrom(type)) {
                                g.addColumn(new ValueProvider() {
                                    @Override
                                    public Object apply(Object o) {
                                        String s = null;
                                        if (o != null) {
                                            if (ReflectionHelper.isBasico(type)) s = "" + o;
                                            else {
                                                try {
                                                    s = Helper.toJson(o);
                                                } catch (IOException e) {
                                                    e.printStackTrace();
                                                }
                                            }
                                        }
                                        return s;
                                    }
                                }).setCaption("Value");
                            } else {
                                ListViewComponent.buildColumns(g, ListViewComponent.getColumnFields(type), false, false);
                            }

                            // añadimos columna para que no haga feo
                            if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
                            else g.addColumn((d) -> null).setWidthUndefined().setCaption("");

                            g.setWidth("100%");
                            g.setHeightByRows(col.size());

                            g.setDataProvider(new ListDataProvider(col));

                            return new ComponentWrapper(null, title, g, true);                        }

                    }

                }


            } else if (r instanceof RpcView) {

                return new RpcListViewComponent((RpcView) r);

            } else if (m != null && (m.isAnnotationPresent(Output.class) || m.isAnnotationPresent(ReadOnly.class))) {

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
