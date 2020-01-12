package io.mateu.bpm;

import io.mateu.mdd.core.util.Helper;

public class BPMEngine implements Runnable {

    @Override
    public void run() {

        boolean dentro = true;
        while (dentro) {
            try {

                Helper.transact(em -> {

                    Helper.getStreams().streamAll(em, Process.class).filter(p -> ProcessStatus.GOINGTONEXTSTATE.equals(p.getStatus())).forEach(p -> {
                        p.setState(p.getNextState());
                        p.setStatus(ProcessStatus.RUNNING);
                    });

                });

                Helper.transact(em -> {

                    Helper.getStreams().streamAll(em, Process.class).filter(p -> ProcessStatus.RUNNING.equals(p.getStatus())).forEach(p -> {
                        p.setStatus(ProcessStatus.WAITING);
                        p.process(p.getState()).forEach(b -> em.persist(b));
                    });

                });

                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
                dentro = false;
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }

    }
}
