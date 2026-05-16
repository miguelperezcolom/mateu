package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.StatusType;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

enum ItemStatus {
    Active, Inactive
}

@UI("/status-demo")
@Title("Status Demo")
@Getter
@Setter
public class StatusDemoForm {

    @NotEmpty
    String name;

    @Status(
            defaultStatus = StatusType.NONE,
            mappings = {
                    @StatusMapping(from = "Active", to = StatusType.SUCCESS),
                    @StatusMapping(from = "Inactive", to = StatusType.DANGER)
            }
    )
    ItemStatus status = ItemStatus.Active;

    @Button
    public Message activate() {
        status = ItemStatus.Active;
        return new Message("Activated!");
    }

    @Button
    public Message deactivate() {
        status = ItemStatus.Inactive;
        return new Message("Deactivated!");
    }
}
