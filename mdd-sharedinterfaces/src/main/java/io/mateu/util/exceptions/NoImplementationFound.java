package io.mateu.util.exceptions;

public class NoImplementationFound extends Exception {

    private final String msg;

    public NoImplementationFound(Class anInterface) {
        this.msg = "No implementation found for interface " + anInterface.getSimpleName();
    }

    @Override
    public String getMessage() {
        return msg;
    }
}
