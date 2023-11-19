package io.mateu.mdd.core.interfaces;

import io.mateu.remote.dtos.ResultType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter@NoArgsConstructor@AllArgsConstructor
public class Message {

    String id;

    ResultType type;

    String title;

    String text;

}
