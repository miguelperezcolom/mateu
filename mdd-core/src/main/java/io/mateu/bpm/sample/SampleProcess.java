package io.mateu.bpm.sample;

import com.google.common.collect.Lists;
import io.mateu.bpm.Block;
import io.mateu.bpm.Process;
import lombok.MateuMDDEntity;

import java.util.List;

@MateuMDDEntity
public class SampleProcess extends Process<SampleProcessSate> {

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
