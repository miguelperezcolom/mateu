import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

public class ReactorTests {

    @Test
    public void shouldDoSomething() {
        Mono.empty().flatMap(o -> {
            System.out.println("Hola!!!!!");
            return Mono.empty();
        }).subscribe();
    }

}
