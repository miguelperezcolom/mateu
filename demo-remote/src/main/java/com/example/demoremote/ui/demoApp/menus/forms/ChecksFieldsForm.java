package com.example.demoremote.ui.demoApp.menus.forms;

import com.example.demoremote.domains.nfl.dtos.Conference;
import com.example.demoremote.domains.nfl.dtos.Division;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeType;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.mdd.shared.interfaces.MateuSecurityManager;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.util.Helper;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Caption("Checks")
public class ChecksFieldsForm {

    @Section("Checks")
    private boolean check;

    @UseRadioButtons
    private boolean usingRadioButtons;

    @Toggle
    private boolean toggle;

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = "" + check
                + ", " + usingRadioButtons
                + ", " + toggle
        ;
    }
}
