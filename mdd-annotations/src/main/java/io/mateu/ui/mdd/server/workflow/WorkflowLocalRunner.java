package io.mateu.ui.mdd.server.workflow;

import java.util.concurrent.ConcurrentLinkedQueue;

public class WorkflowLocalRunner {

    private ConcurrentLinkedQueue queue = new ConcurrentLinkedQueue();
    private Thread hilo;
    private boolean dentro = true;


    public void add(Runnable task) {
        System.out.println("añadiendo tarea " + task.getClass().getName());
        queue.add(task);
        start();
    }

    private void start() {
        if (hilo == null) {
            hilo = new Thread(new Runnable() {
                @Override
                public void run() {

                    while (dentro) {

                        if (queue.size() == 0) {
                            try {
                                Thread.sleep(100);
                            } catch (InterruptedException e) {
                                e.printStackTrace();
                            }
                        }

                        while (queue.size() > 0) {
                            try {
                                Object o = queue.poll();
                                System.out.println("Runing thread local task " + o.getClass().getName());
                                Runnable task = (Runnable) o;
                                task.run();
                            } catch (Throwable e) {
                                e.printStackTrace();
                            }
                        }

                    }

                }
            });
            hilo.start();
        }
    }


    public void waitForEmpty() {
        System.out.println("waiting for empty local runner");
        dentro = false;
        while (queue.size() > 0) {
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println("local runner is empty");
    }

}
