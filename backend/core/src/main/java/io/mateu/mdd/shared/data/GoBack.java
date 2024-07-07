package io.mateu.mdd.shared.data;

import io.mateu.remote.dtos.ResultType;

public class GoBack {

    private final ResultType resultType;
    private final String message;


    public GoBack() {
        resultType = ResultType.Success;
        message = null;
    }

    public GoBack(ResultType resultType, String message) {
        this.resultType = resultType;
        this.message = message;
    }

    public ResultType getResultType() {
        return resultType;
    }

    public String getMessage() {
        return message;
    }
}
