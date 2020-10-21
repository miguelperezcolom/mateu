package org.example.application.ui;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

import javax.servlet.http.HttpServletRequest;
import java.io.File;

@MateuUI(path = "/form")
@Getter@Setter
public class SimpleForm {

    public SimpleForm(HttpServletRequest request) {
        email = request.getParameter("email");
    }


    String email;

    String subject;

    @TextArea
    String body;

    File attachment;

    File attachment2;

    @Action(icon = VaadinIcons.ENVELOPE)
    public String send() throws Throwable {
        // send the email
        return "Email sent!";
    }

    @Action(icon = VaadinIcons.FILE)
    public File seeAttachment() throws Throwable {
        return attachment;
    }

}
