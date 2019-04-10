package io.mateu.mdd.core.model.util;

import lombok.Getter;
import lombok.Setter;
import org.apache.commons.mail.Email;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class EmailMock {

    private List<Email> sent = new ArrayList<>();

    public void send(Email email) {
        sent.add(email);
    }


    public void print() {
        sent.forEach(m -> {
            System.out.println(">>>" + m.getSubject() + " to " + m.getToAddresses() + " from " + m.getFromAddress());
        });
    }

    public void reset() {
        sent.clear();
    }

}
