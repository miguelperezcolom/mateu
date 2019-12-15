package io.mateu.bpm;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public abstract class Block {

    public abstract void run() throws Throwable;

}
