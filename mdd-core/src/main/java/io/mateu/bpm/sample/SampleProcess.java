package io.mateu.bpm.sample;

import io.mateu.bpm.Block;
import io.mateu.bpm.Process;
import lombok.Getter;
import lombok.MateuMDDEntity;
import lombok.Setter;

import java.util.List;

//@MateuMDDEntity
public class SampleProcess extends Process<SampleProcessSate> {

    public SampleProcess(SampleProcessSate initialState) {
        super(initialState);
    }

    @Override
    public List<Block> process(SampleProcessSate state) {
        if (SampleProcessSate.INITIAL.equals(state)) return List.of(new SampleBlock());
        return null;
    }

    @Override
    public SampleProcessSate getNextState() {
        return SampleProcessSate.END;
    }
}
