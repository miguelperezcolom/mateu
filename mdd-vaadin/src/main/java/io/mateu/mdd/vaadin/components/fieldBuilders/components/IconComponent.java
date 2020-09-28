package io.mateu.mdd.vaadin.components.fieldBuilders.components;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.util.Helper;
import io.mateu.util.interfaces.GeneralRepository;
import io.mateu.util.interfaces.IIcon;

import java.util.*;

public class IconComponent extends Composite implements HasValue<IIcon>, Component.Focusable {
    private final MDDBinder binder;
    private final Button b;
    private List<IIcon> icons;
    private IIcon icon;
    private Map<UUID, ValueChangeListener> listeners = new HashMap<>();

    public IconComponent(FieldInterfaced field, MDDBinder binder) {
        this.binder = binder;

        try {
            icons = Helper.getImpl(GeneralRepository.class).findAllIcons();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
            icons = new ArrayList<>();
        }

        b = new Button();
        b.setCaptionAsHtml(true);

        b.addClickListener(e -> {
            //abrir diálogo con todos los iconos en css layout
            // al hacer click, seleccionamos
            abrirListaIconos();
        });

        setCompositionRoot(b);

    }

    private void abrirListaIconos() {
        // lo mismo para buscar y para navegar en profundidad
        Window w = new Window("Select an Icon");

        w.addStyleName("miapp");

        w.setWidth("700px");
        w.setHeight("600px");

        CssLayout l = new CssLayout();

        VerticalLayout vl = new VerticalLayout();
        TextField tf;
        vl.addComponent(tf = new TextField());
        tf.addValueChangeListener(e -> {
            rellenar(l, e.getValue(), w);
        });

        rellenar(l, "", w);

        l.setSizeUndefined();
        vl.addComponent(l);

        w.setContent(new Panel(vl));

        w.center();
        w.setModal(true);

        w.addCloseListener(e -> {
        });

        UI.getCurrent().addWindow(w);
    }

    private void rellenar(CssLayout l, String text, Window w) {
        try {
            l.removeAllComponents();
            icons.stream().filter(i -> Strings.isNullOrEmpty(text) || i.getId().toLowerCase().contains(text.toLowerCase())).forEach(i -> {
                VerticalLayout c;
                l.addComponent(c = new VerticalLayout());
                Label h;
                c.addComponent(h = new Label(i.getHtml(), ContentMode.HTML));
                h.addStyleName("icono");
                c.addComponent(new Label(i.getId()));
                c.setSizeUndefined();
                c.addStyleName("cardicono");
                c.addLayoutClickListener(e -> {
                    IIcon old = icon;
                    setValue(i);
                    ValueChangeEvent ce = new ValueChangeEvent(this, old, true);
                    listeners.values().forEach(x -> x.valueChange(ce));
                    w.close();
                });
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }

    @Override
    public void setValue(IIcon o) {
        icon = o;
        b.setCaption(icon != null?icon.getHtml(): VaadinIcons.QUESTION.getHtml());
    }

    @Override
    public IIcon getValue() {
        return icon;
    }

    @Override
    public void setRequiredIndicatorVisible(boolean b) {

    }

    @Override
    public boolean isRequiredIndicatorVisible() {
        return false;
    }

    @Override
    public void setReadOnly(boolean b) {
        //b.disa
    }

    @Override
    public boolean isReadOnly() {
        return false;
    }

    @Override
    public Registration addValueChangeListener(ValueChangeListener<IIcon> valueChangeListener) {
        UUID _id = UUID.randomUUID();
        listeners.put(_id, valueChangeListener);
        return new Registration() {

            UUID id = _id;

            @Override
            public void remove() {
                listeners.remove(id);
            }
        };
    }

    @Override
    public void focus() {
        b.focus();
    }

    @Override
    public int getTabIndex() {
        return b.getTabIndex();
    }

    @Override
    public void setTabIndex(int i) {
        b.setTabIndex(i);
    }
}
