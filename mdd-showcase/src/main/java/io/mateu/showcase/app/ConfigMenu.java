package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.MenuOption;
import org.example.domain.boundaries.common.entities.Person;
import org.example.domain.boundaries.educational.entities.AcademicPlan;
import org.example.domain.boundaries.educational.entities.Classroom;
import org.example.domain.boundaries.educational.entities.Course;

public class ConfigMenu {

    @MenuOption
    Class plans = AcademicPlan.class;

    @MenuOption
    Class courses = Course.class;

    @MenuOption
    Class persons = Person.class;

    @MenuOption
    Class classrooms = Classroom.class;



}
