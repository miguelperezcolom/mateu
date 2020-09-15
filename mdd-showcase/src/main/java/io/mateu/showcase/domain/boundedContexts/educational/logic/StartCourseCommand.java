package io.mateu.showcase.domain.boundedContexts.educational.logic;

import io.mateu.mdd.shared.ScheduledCommand;

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
    }
}
