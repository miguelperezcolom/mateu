package io.mateu.ui.mdd.server.workflow;

import java.util.concurrent.ConcurrentLinkedQueue;

public class WorkflowEngine {

    private static ConcurrentLinkedQueue queue;
    private static ThreadLocal<Boolean> uselocalRunners = new ThreadLocal<>();

    static {
        start();
    }

    public static void activateLocalRunner() {
        uselocalRunners.set(true);
    }

    public static void add(Runnable task) {
        System.out.println("añadiendo tarea " + task.getClass().getName());

        if (false && uselocalRunners.get() != null && uselocalRunners.get()) {
            System.out.println("va al runner del thread");
            try {
                task.run();
            } catch (Throwable e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("va al workflow global");
            queue.add(task);
        }
    }

    private static synchronized void start() {

        System.out.println("start workflowengine");

        if (queue == null) {

            queue = new ConcurrentLinkedQueue();

            new Thread(new Runnable() {
                @Override
                public void run() {

                    while (true) {

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
                                System.out.println("Runing task " + o.getClass().getName());
                                Runnable task = (Runnable) o;
                                task.run();
                            } catch (Throwable e) {
                                e.printStackTrace();
                            }
                        }
                    }

                }
            }).start();

        }


    }




}
