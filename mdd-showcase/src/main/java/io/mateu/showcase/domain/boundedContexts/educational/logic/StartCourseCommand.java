package io.mateu.showcase.domain.boundedContexts.educational.logic;

import io.mateu.mdd.core.util.Notifier;
import io.mateu.mdd.shared.ScheduledCommand;
import io.mateu.mdd.util.DDDHelper;
import io.mateu.showcase.domain.boundedContexts.educational.model.CourseRepository;

import java.time.LocalDateTime;

public class StartCourseCommand implements ScheduledCommand {
    @Override
    public String getSchedule() {
        //"0 0/2 8-17 * * ?"
        // segundos minutos horas dia-del-mes mes dia-semana año(opcional)
        return "0/6 * * * * ?"; // cada cada 6 segundos (0,6,12,18,24,30,36,42,48,54)
    }

    @Override
    public void run() {
        System.out.println("start course command run! " + LocalDateTime.now());

        try {

            DDDHelper.transact(ctx -> {

                CourseRepository repo = ctx.getRepo(CourseRepository.class);

                repo.findAll().stream().forEach(System.out::println);

                repo.findAll().stream().forEach(c -> {
                    c.setName(c.getName() + " x ");
                    // save hace un merge, así que devuelve una nueva instancia controlada por el em
                    // los cambios que hagamos a partir de este momento deben hacerse sobre la nueva instancia
                    // ya que la original está desconectada del em
                    c = repo.save(c);
                });

            });

        } catch (Throwable throwable) {
            Notifier.alert(throwable);
        }

    }
}
