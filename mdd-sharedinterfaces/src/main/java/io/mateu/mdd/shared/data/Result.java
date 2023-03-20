package io.mateu.mdd.shared.data;

import java.util.List;

public class Result {

    private final ResultType type;
    private final String message;
    private final List<Destination> interestingLinks;
    private final Destination nowTo;

    public Result(ResultType type, String message, List<Destination> interestingLinks, Destination nowTo) {
        this.type = type;
        this.message = message;
        this.interestingLinks = interestingLinks;
        this.nowTo = nowTo;
    }

    public ResultType getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public List<Destination> getInterestingLinks() {
        return interestingLinks;
    }

    public Destination getNowTo() {
        return nowTo;
    }
}
