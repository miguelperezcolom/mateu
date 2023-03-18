package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import lombok.Getter;

import java.util.Objects;
import java.util.UUID;

/**
 * Created by miguel on 8/8/16.
 */
@Getter
public abstract class AbstractAction implements MenuEntry {

    private VaadinIcons icon;
    private String style = "";
    private String confirmationMessage;
    private String caption;
    private boolean callOnEnterKeyPressed = false;
    private boolean modifierPressed;
    private String id = UUID.randomUUID().toString();
    private String group = "";
    private boolean validationNeeded;
    private int order = 10000;


    public AbstractAction(String caption) {
        this.caption = caption;
    }


    public void addShortCut(Button b) {

    }

    public boolean isVisible() {
        return true;
    }

    public int getOrder() {
        return order;
    }

    public AbstractAction setOrder(int order) {
        this.order = order;
        return this;
    }

    public AbstractAction setCaption(String caption) {
        this.caption = caption;
        return this;
    }

    public AbstractAction setIcon(VaadinIcons icon) {
        this.icon = icon;
        return this;
    }

    public AbstractAction setStyle(String style) {
        this.style = style;
        return this;
    }

    public AbstractAction setConfirmationMessage(String confirmationMessage) {
        this.confirmationMessage = confirmationMessage;
        return this;
    }

    public AbstractAction setCallOnEnterKeyPressed(boolean callOnEnterKeyPressed) {
        this.callOnEnterKeyPressed = callOnEnterKeyPressed;
        return this;
    }

    public AbstractAction setModifierPressed(boolean modifierPressed) {
        this.modifierPressed = modifierPressed;
        return this;
    }

    public AbstractAction setGroup(String group) {
        this.group = group;
        return this;
    }

    public AbstractAction setValidationNeeded(boolean validationNeeded) {
        this.validationNeeded = validationNeeded;
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public AbstractAction setFluentId(String id) {
        this.id = id;
        return this;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AbstractAction that = (AbstractAction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
