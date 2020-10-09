package io.mateu.bpm.sample;

import io.mateu.bpm.Block;

//@MateuMDDEntity
public class SampleBlock extends Block {
    @Override
    public void run() throws Throwable {
        System.out.println("Hola!");
    }
}
