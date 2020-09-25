package io.mateu.showcase.app.complexUI;

import io.mateu.mdd.core.annotations.MenuOption;
import org.example.domain.boundaries.maintenance.entities.Building;
import org.example.domain.boundaries.maintenance.entities.Issue;
import org.example.domain.boundaries.maintenance.entities.Provider;
import org.example.domain.boundaries.maintenance.entities.Technician;

public class MaintenanceArea {

    @MenuOption
    Class buildings = Building.class;

    @MenuOption
    Class providers = Provider.class;

    @MenuOption
    Class technicians = Technician.class;

    @MenuOption
    Class issues = Issue.class;

}
