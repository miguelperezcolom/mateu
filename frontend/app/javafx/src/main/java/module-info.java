module io.mateu.javafx {
    requires javafx.controls;
    requires javafx.fxml;
    requires com.fasterxml.jackson.databind;
    requires java.net.http;
    requires tiwulfx.dock;

    opens io.mateu.javafx to javafx.graphics;
}
