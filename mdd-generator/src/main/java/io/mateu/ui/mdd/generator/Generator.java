package io.mateu.ui.mdd.generator;

import com.google.common.io.CharStreams;
import io.mateu.erp.model.multilanguage.Literal;
import io.mateu.mdd.newapp.MyApp;
import io.mateu.ui.mdd.server.annotations.Caption;
import io.mateu.ui.mdd.server.interfaces.App;
import io.mateu.ui.mdd.server.interfaces.Area;
import io.mateu.ui.mdd.server.interfaces.MDDAction;
import io.mateu.ui.mdd.server.interfaces.Module;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_DELETE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;

public class Generator {
    static App app;

    static {
        if (app == null) {

            String cn = null;
            try {
                cn = CharStreams.toString(new InputStreamReader(Generator.class.getResourceAsStream("/META-INF/services/" + App.class.getName())));

                app = (App) Class.forName(cn).newInstance();
                System.out.println("app " + app.getClass().getName() + " loaded");

            } catch (IOException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }

        }


        if (app == null) System.out.println("App not found. Check META-INF/services/io.mateu.ui.App file");
    }


    public static void main(String[] args) throws Throwable {
        //generate(Class.forName(args[0]), args[1]);

        generate(MyApp.class, "/Users/miguel/tmp/mdd1");

    }



    private static void generate(Class appClass, String dstDir) throws Throwable {

        Path path = new File(dstDir).toPath();

        Files.createDirectories(path);

        generateMenu(appClass, path);

    }


    private static void watch(Path dir) throws IOException {
        WatchService watcher = FileSystems.getDefault().newWatchService();

        try {
            WatchKey key = dir.register(watcher,
                    ENTRY_CREATE,
                    ENTRY_DELETE,
                    ENTRY_MODIFY);
        } catch (IOException x) {
            System.err.println(x);
        }

    }



    private static void generateMenu(Class appClass, Path dstDir) throws Throwable {

        StringWriter sw;
        PrintWriter pw = new PrintWriter(sw = new StringWriter());

        pw.println("<app>" + MenuHelper.getHtml(app) + "</app>");

        Files.write(new File(dstDir.toFile(), "App.vue").toPath(), sw.toString().getBytes());

    }
}
