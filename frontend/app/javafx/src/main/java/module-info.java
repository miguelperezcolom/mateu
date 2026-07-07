module io.mateu.javafx {
    requires javafx.controls;
    requires javafx.fxml;
    // signature capture: canvas snapshot → BufferedImage → PNG data URI
    requires javafx.swing;
    requires java.desktop;
    requires com.fasterxml.jackson.databind;
    requires java.net.http;
    requires tiwulfx.dock;

    opens io.mateu.javafx to javafx.graphics;
}
