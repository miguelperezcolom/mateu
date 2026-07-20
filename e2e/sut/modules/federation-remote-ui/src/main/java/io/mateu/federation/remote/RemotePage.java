package io.mateu.federation.remote;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@Title("Remote Page")
@Getter
@Setter
public class RemotePage {

    String value;

    @Button
    public Message submit() {
        return new Message("Remote submitted: " + value);
    }

}
