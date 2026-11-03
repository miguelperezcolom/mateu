package io.mateu.core.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The proxied leg's evaluator gives a template the browser's meaning; the shared corpus ({@code
 * conformance/client/source-templates.json}) pins whole urls, this pins the corners of the subset.
 */
class ProxyExpressionTest {

  private static final Map<String, Object> STATE =
      Map.of(
          "s",
          "Apollo",
          "n",
          1.0,
          "tags",
          List.of("a", "b", "c"),
          "price",
          -2.345,
          "blank",
          "  x  ");

  private static String text(String expr) {
    return ProxyExpression.text(ProxyExpression.evaluate(expr, STATE, key -> "K-" + key));
  }

  @Test
  void numberLiteralsTakeAnExponent() {
    assertThat(text("1e3")).isEqualTo("1000");
    assertThat(text("2.5E-1 * 4")).isEqualTo("1");
    assertThat(text("1e3 + 1")).isEqualTo("1001");
  }

  @Test
  void strictEqualityComparesTypeAndValue() {
    assertThat(text("state.n === 1")).isEqualTo("true");
    assertThat(text("state.n === '1'")).isEqualTo("false");
    assertThat(text("state.n !== '1'")).isEqualTo("true");
    assertThat(text("state.n == '1'")).isEqualTo("true");
    assertThat(text("null === undefined")).isEqualTo("false");
    assertThat(text("null == undefined")).isEqualTo("true");
    assertThat(text("state.missing === undefined")).isEqualTo("true");
    assertThat(text("true === 1")).isEqualTo("false");
    assertThat(text("state.tags === state.tags")).isEqualTo("true");
  }

  @Test
  void aStringIsIndexable() {
    assertThat(text("state.s[0]")).isEqualTo("A");
    assertThat(text("state.s[99]")).isEmpty();
    assertThat(text("state.s['x']")).isEmpty();
  }

  @Test
  void stringMethods() {
    assertThat(text("state.s.toLowerCase()")).isEqualTo("apollo");
    assertThat(text("state.s.toUpperCase()")).isEqualTo("APOLLO");
    assertThat(text("state.blank.trim()")).isEqualTo("x");
    assertThat(text("state.s.includes('pol')")).isEqualTo("true");
    assertThat(text("state.s.startsWith('Ap')")).isEqualTo("true");
    assertThat(text("state.s.endsWith('x')")).isEqualTo("false");
    assertThat(text("state.s.indexOf('o')")).isEqualTo("2");
    assertThat(text("state.s.slice(1, 3)")).isEqualTo("po");
    assertThat(text("state.s.slice(-2)")).isEqualTo("lo");
    assertThat(text("state.s.slice(4, 1)")).isEmpty();
    assertThat(text("state.s.substring(3, 1)")).isEqualTo("po");
    assertThat(text("state.s.substring(2)")).isEqualTo("ollo");
    assertThat(text("'7'.padStart(3, '0')")).isEqualTo("007");
    assertThat(text("'7'.padEnd(3)")).isEqualTo("7  ");
    assertThat(text("'7'.padStart(2, '')")).isEqualTo("7");
    assertThat(text("'abc'.padStart(2)")).isEqualTo("abc");
    assertThat(text("state.s.toString()")).isEqualTo("Apollo");
  }

  @Test
  void numberMethods() {
    assertThat(text("state.price.toFixed(2)")).isEqualTo("-2.35");
    assertThat(text("(3).toFixed()")).isEqualTo("3");
    assertThat(text("state.n.toString()")).isEqualTo("1");
  }

  @Test
  void listMethods() {
    assertThat(text("state.tags.join('|')")).isEqualTo("a|b|c");
    assertThat(text("state.tags.join()")).isEqualTo("a,b,c");
    assertThat(text("state.tags.includes('b')")).isEqualTo("true");
    assertThat(text("state.tags.includes('z')")).isEqualTo("false");
    assertThat(text("state.tags.indexOf('c')")).isEqualTo("2");
    assertThat(text("state.tags.indexOf('z')")).isEqualTo("-1");
    assertThat(text("state.tags.slice(1)")).isEqualTo("b,c");
    assertThat(text("state.tags.slice(2, 1)")).isEmpty();
    assertThat(text("state.tags.toString()")).isEqualTo("a,b,c");
  }

  @Test
  void mathFunctions() {
    assertThat(text("Math.round(2.5)")).isEqualTo("3");
    assertThat(text("Math.round(-2.5)")).isEqualTo("-2");
    assertThat(text("Math.floor(2.7) + Math.ceil(2.1)")).isEqualTo("5");
    assertThat(text("Math.abs(-4)")).isEqualTo("4");
    assertThat(text("Math.min(3, 1, 2)")).isEqualTo("1");
    assertThat(text("Math.max(state.missing ?? 0, 1)")).isEqualTo("1");
    assertThat(text("Math.max(1, 'x')")).isEqualTo("NaN");
    assertThat(text("Math.max()")).isEqualTo("-Infinity");
  }

  @Test
  void optionalChainingSkipsTheCall() {
    assertThat(text("state.missing?.toLowerCase() ?? 'none'")).isEqualTo("none");
    assertThat(text("state.n ? 'y' : state.missing.toLowerCase()")).isEqualTo("y");
  }

  @Test
  void outsideTheSubsetIsUnsupported() {
    assertThatThrownBy(() -> text("state.s.replace('a', 'b')"))
        .isInstanceOf(ProxyExpression.Unsupported.class);
    assertThatThrownBy(() -> text("Math.random()")).isInstanceOf(ProxyExpression.Unsupported.class);
    assertThatThrownBy(() -> text("state.s.slice(1 2)"))
        .isInstanceOf(ProxyExpression.Unsupported.class);
    assertThat(ProxyExpression.isSupported("state.code.toLowerCase()")).isTrue();
    assertThat(ProxyExpression.isSupported("state.code.split(',')")).isFalse();
  }

  @Test
  void aMethodOfNothingRendersEmptyLikeAMemberOfNothing() {
    assertThatThrownBy(() -> text("state.missing.toLowerCase()"))
        .isInstanceOf(IllegalStateException.class);
    assertThat(text("true.toString()")).isEqualTo("true");
    assertThatThrownBy(() -> text("true.trim()")).isInstanceOf(IllegalStateException.class);
    assertThatThrownBy(() -> text("state.n.toFixed(101)"))
        .isInstanceOf(IllegalStateException.class);
  }
}
