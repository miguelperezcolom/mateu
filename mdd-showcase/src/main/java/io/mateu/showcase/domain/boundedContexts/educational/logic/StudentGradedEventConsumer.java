package io.mateu.showcase.domain.boundedContexts.educational.logic;

import io.mateu.mdd.util.Helper;
import io.mateu.showcase.domain.boundedContexts.educational.model.Grade;
import io.mateu.showcase.domain.events.StudentGradedEvent;

import java.util.function.Consumer;

public class StudentGradedEventConsumer implements Consumer<StudentGradedEvent> {
    @Override
    public void accept(StudentGradedEvent studentGradedEvent) {
        System.out.println("student graded. grade id = " + studentGradedEvent.getGradeId());
        try {
            Helper.transact(em -> {
                Grade g = em.find(Grade.class, studentGradedEvent.getGradeId());
                //todo: actualizar media
                //g.getStudent().
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
    }
}
