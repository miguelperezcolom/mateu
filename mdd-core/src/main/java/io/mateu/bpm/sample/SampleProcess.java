package io.mateu.bpm.sample;

import com.google.common.collect.Lists;
import io.mateu.bpm.Block;
import io.mateu.bpm.Process;

import java.util.List;

//@MateuMDDEntity
public class SampleProcess extends Process<SampleProcessSate> {

    public SampleProcess(SampleProcessSate initialState) {
        super(initialState);
    }

    @Override
    public List<Block> process(SampleProcessSate state) {
        if (SampleProcessSate.INITIAL.equals(state)) return Lists.newArrayList(new SampleBlock());
        return null;
    }

    @Override
    public SampleProcessSate getNextState() {
        return SampleProcessSate.END;
    }
}
