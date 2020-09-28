package io.mateu.showcase.app.complexUI;

import io.mateu.mdd.shared.annotations.MenuOption;
import org.example.domain.boundaries.common.entities.Person;
import org.example.domain.boundaries.educational.entities.*;

public class AcademicArea {

    @MenuOption
    Class plans = AcademicPlan.class;

    @MenuOption
    Class courses = Course.class;

    @MenuOption
    Class subjects = Subject.class;

    @MenuOption
    Class persons = Person.class;

    @MenuOption
    Class classrooms = Classroom.class;

    @MenuOption
    Class grades = Grade.class;
}
