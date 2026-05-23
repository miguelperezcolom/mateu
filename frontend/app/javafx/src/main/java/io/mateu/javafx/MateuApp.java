package io.mateu.javafx;

import io.mateu.javafx.ui.MainView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.InputStream;
import java.util.Properties;

public class MateuApp extends Application {

    public static void main(String[] args) {
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

        MainView mainView = new MainView(baseUrl, route);
        mainView.getCtx().primaryStage = primaryStage;

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
