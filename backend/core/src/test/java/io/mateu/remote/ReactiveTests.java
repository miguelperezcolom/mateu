package io.mateu.remote;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@Slf4j
public class ReactiveTests {

    @Test
    void monoWorks1() {

        var t = Mono.just("Hellos Mateu").doOnNext(s -> log.info("ssss->" + s)).log();

        StepVerifier.create(t)
                .expectNext("Hellos Mateu")
                // .expectNext("Hellos Antonia")
                .verifyComplete();
    }


    @Test
    void monoWorks2() {

        var t = Mono.just("a").log("zzz")
                .then().log("www")
                .then(Mono.just("Hellos Antonia").log("qqq")
                        .then(Mono.just("Hellos Mateu").log("xxx"))
                ).log("yyy");

       //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNext("Hellos Mateu")
                // .expectNext("Hellos Antonia")
                .verifyComplete();
    }


    @Test
    void monoWorks3() {

        var t = Mono.empty()
                .then(Mono.just(2).doOnNext(x -> System.out.println("x=" + x)))
                .then(Mono.just(3).doOnNext(y -> System.out.println("y=" + y)))
                .then(Mono.just(4).doOnNext(z -> System.out.println("z=" + z)))
                ;

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(1)
                .verifyComplete();
    }


    @Test
    void monoWorks4() {

        var t = Mono.just(1)
                .flatMap(a -> Mono.just(2).doOnNext(x -> System.out.println("x=" + x)))
                .flatMap(b -> Mono.just(3).doOnNext(y -> System.out.println("y=" + y)))
                .flatMap(c -> Mono.just(4).doOnNext(z -> System.out.println("z=" + z)))
                ;

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void monoWorks5() {

        var t = Mono.empty()
                .flatMap(a -> Mono.just(2).doOnNext(x -> System.out.println("x=" + x)))
                .flatMap(b -> Mono.just(3).doOnNext(y -> System.out.println("y=" + y)))
                .flatMap(c -> Mono.just(4).doOnNext(z -> System.out.println("z=" + z)))
                .switchIfEmpty(Mono.just(10).doOnNext(w -> System.out.println("w=" + w)))
                ;

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void monoWorks6() {

        var t = Mono.empty()
                .switchIfEmpty(Mono.just(10).doOnNext(w -> System.out.println("w=" + w)))
                .flatMap(a -> Mono.just(2).doOnNext(x -> System.out.println("x=" + x)))
                .flatMap(b -> Mono.just(3).doOnNext(y -> System.out.println("y=" + y)))
                .flatMap(c -> Mono.just(4).doOnNext(z -> System.out.println("z=" + z)))
                ;

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void monoWorks7() {

        var t = Mono.just(1)
                .switchIfEmpty(Mono.just(10).doOnNext(w -> System.out.println("w=" + w)))
                .flatMap(a -> Mono.just(2).doOnNext(x -> System.out.println("x=" + x)))
                .flatMap(b -> Mono.empty())
                .flatMap(c -> Mono.just(4).doOnNext(z -> System.out.println("z=" + z)))
                ;

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(0)
                .verifyComplete();
    }

    @Test
    void monoWorks8() {

        var t = Mono.empty();

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(0)
                .verifyComplete();
    }

    @Test
    void monoWorks9() {

        var t = Mono.empty().then();

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNextCount(0)
                .verifyComplete();
    }


    @Test
    void monoWorks10() {

        var a = 1;

        var t = Mono.empty().then(switch (a) {
            case 1 -> Mono.just(1);
            default -> Mono.just(-1);
        });

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNext(1)
                .verifyComplete();
    }

    @Test
    void monoWorks11() {

        var a = 2;

        var t = switch (a) {
            case 1 -> Mono.just(1);
            case 3 -> Mono.just(0);
            default -> Mono.just(-1);
        };

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNext(-1)
                .verifyComplete();
    }

    @Test
    void monoWorks12() {

        var a = 2;

        var t = (switch (a) {
            case 1 -> Mono.just(1);
            case 3 -> Mono.just(0);
            default -> Mono.just(-1);
        }).flatMap(x -> Mono.just(x * 2));

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNext(-2)
                .verifyComplete();
    }

    @Test
    void monoWorks13() {

        var t = Mono.empty().switchIfEmpty(Mono.just(-2));

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNext(-2)
                .verifyComplete();
    }

    @Test
    void monoWorks14() {

        var t = Mono.empty().switchIfEmpty(Mono.just(-2));

        //var t = Mono.empty().then();

        StepVerifier.create(t)
                .expectNext(-2)
                .verifyComplete();
    }


}
