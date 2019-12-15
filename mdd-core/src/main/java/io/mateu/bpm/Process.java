package io.mateu.bpm;

import lombok.MateuMDDEntity;

import java.util.List;

@MateuMDDEntity
public abstract class Process<T> {

    private ProcessStatus status = ProcessStatus.RUNNING;

    private T state;

    public abstract List<Block> process(T state);

    public abstract T getNextState();

    public Process(T initialState) {
        this.state = initialState;
    }
}
