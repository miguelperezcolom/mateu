package io.mateu.mdd.core.interfaces;

public interface PushWriter {

    void push(String message);

    void done(String message);
}
