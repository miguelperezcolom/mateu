package io.mateu.javafx;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.javafx.ui.MainView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.InputStream;
import java.util.Map;
import java.util.Properties;

public class MateuApp extends Application {

    public static void main(String[] args) {
        // Surface uncaught exceptions (incl. JavaFX-thread ones during drag/dock) to the console.
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            System.err.println("[Mateu] Uncaught exception on thread " + t.getName() + ": " + e);
            e.printStackTrace();
        });
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) throws Exception {
        Properties props = new Properties();
        try (InputStream in = getClass().getResourceAsStream("/application.properties")) {
            if (in != null) props.load(in);
        }

        String baseUrl = props.getProperty("mateu.baseUrl", "http://localhost:8080");
        String route = props.getProperty("mateu.route", "/");
        String configJson = props.getProperty("mateu.config", "{}");

        Map<String, Object> config = Map.of();
        try {
            config = new ObjectMapper().readValue(configJson, new TypeReference<>() {});
        } catch (Exception e) {
            System.err.println("[Mateu] Could not parse mateu.config: " + e.getMessage());
        }

        MainView mainView = new MainView(baseUrl, route, config);
        mainView.getShell().primaryStage = primaryStage;

        Scene scene = new Scene(mainView.getRoot(), 1280, 800);
        String css = getClass().getResource("/app.css") != null
                ? getClass().getResource("/app.css").toExternalForm() : null;
        if (css != null) scene.getStylesheets().add(css);

        primaryStage.setTitle("Mateu");
        primaryStage.setScene(scene);
        primaryStage.show();

        mainView.load();
    }
}
