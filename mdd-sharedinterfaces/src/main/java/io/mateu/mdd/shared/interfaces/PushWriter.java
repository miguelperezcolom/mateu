package io.mateu.mdd.shared.interfaces;

public interface PushWriter {

    void push(String message);

    void done(String message);
}
