package io.mateu.util.mail;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.mail.Email;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter@Slf4j
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
