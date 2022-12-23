package io.mateu.mdd.vaadin.pojos;

public class Error {

    private String message;
    private Throwable throwable;

    public Error(String message) {
        this.message = message;
    }

    public Error(Throwable throwable) {
        this.throwable = throwable;
    }


    public String getMessage() {
        return message;
    }

    public Throwable getThrowable() {
        return throwable;
    }
}
