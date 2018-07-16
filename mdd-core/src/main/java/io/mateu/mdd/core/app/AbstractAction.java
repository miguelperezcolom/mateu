package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;

import java.util.UUID;

/**
 * Created by miguel on 8/8/16.
 */
public abstract class AbstractAction implements MenuEntry {

    private VaadinIcons icon = VaadinIcons.BOLT;
    private String confirmationMessage;
    private String name;
    private boolean callOnEnterKeyPressed = false;
    private boolean modifierPressed;
    private final String id = UUID.randomUUID().toString();


    public AbstractAction(String name) {
        this.name = name;
    }

    public AbstractAction(String name, boolean callOnEnterKeyPressed) {
        this.name = name;
        this.callOnEnterKeyPressed = callOnEnterKeyPressed;
    }


    public String getName() {
        return name;
    };

    public boolean isCallOnEnterKeyPressed() {
        return callOnEnterKeyPressed;
    }

    public AbstractAction setCallOnEnterKeyPressed(boolean callOnEnterKeyPressed) {
        this.callOnEnterKeyPressed = callOnEnterKeyPressed;
        return this;
    }

    public AbstractAction setModifierPressed(boolean modifierPressed) {
        this.modifierPressed = modifierPressed;
        return this;
    }

    public boolean isModifierPressed() {
        return modifierPressed;
    }

    public abstract void run(MDDExecutionContext context);

    public String getId() {
        return id;
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    public VaadinIcons getIcon() {
        return icon;
    }

    public AbstractAction setIcon(VaadinIcons icon) {
        this.icon = icon;
        return this;
    }

    public String getConfirmationMessage() {
        return confirmationMessage;
    }

    public AbstractAction setConfirmationMessage(String confirmationMessage) {
        this.confirmationMessage = confirmationMessage;
        return this;
    }
}
