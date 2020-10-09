package io.mateu.bpm;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

//@MateuMDDEntity
@Getter@Setter
public abstract class Process<T> {

    private ProcessStatus status = ProcessStatus.RUNNING;

    private T state;

    public abstract List<Block> process(T state);

    public abstract T getNextState();

    public Process(T initialState) {
        this.state = initialState;
    }
}
