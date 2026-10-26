package io.mateu.ijp.live;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A small, dependency-free QR Code encoder (ISO/IEC 18004), byte mode only — what the IDE needs to
 * show the phone link of a launched app. A copy of the bundle plugin's {@code QrCode}
 * (backend/mateu-bundle-maven-plugin), itself a line-for-line port of the web lib's encoder ({@code
 * libs/mateu/.../ui/qr/qrEncoder.ts}); {@code QrCodeTest} pins it to the same golden corpus: the same
 * text gives the same symbol, module for module.
 *
 * <p>Scope: byte mode (UTF-8), versions 1–40, the four error-correction levels, the eight masks
 * with the standard penalty rules.
 */
final class QrCode {

  /** Error-correction level. */
  enum Ecc {
    L(1),
    M(0),
    Q(3),
    H(2);

    final int formatBits;

    Ecc(int formatBits) {
      this.formatBits = formatBits;
    }
  }

  // Error-correction codewords per block and number of blocks, indexed [level][version].
  private static final int[][] ECC_PER_BLOCK = {
    {
      -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30,
      30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
    },
    {
      -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28,
      28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28
    },
    {
      -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30,
      30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
    },
    {
      -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24,
      30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30
    },
  };
  private static final int[][] BLOCKS = {
    {
      -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13,
      14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25
    },
    {
      -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23,
      25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49
    },
    {
      -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29,
      34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68
    },
    {
      -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35,
      37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81
    },
  };

  final int version;
  final int size;

  /** {@code modules[y][x]}, true = dark. */
  final boolean[][] modules;

  private final boolean[][] isFunction;

  private QrCode(int version) {
    this.version = version;
    this.size = version * 4 + 17;
    this.modules = new boolean[size][size];
    this.isFunction = new boolean[size][size];
  }

  /**
   * Encodes {@code text} (as UTF-8 bytes) in the smallest version that holds it at {@code ecc},
   * with the mask of lowest penalty.
   *
   * @throws IllegalArgumentException when the text does not fit a version-40 symbol
   */
  static QrCode encode(String text, Ecc ecc) {
    byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
    int version = 1;
    for (; version <= 40; version++) {
      int headerBits = 4 + (version <= 9 ? 8 : 16);
      if (headerBits + bytes.length * 8 <= dataCodewords(version, ecc) * 8) {
        break;
      }
    }
    if (version > 40) {
      throw new IllegalArgumentException("Text too long for a QR code");
    }
    int[] codewords = withErrorCorrection(dataCodewordsFor(bytes, version, ecc), version, ecc);
    QrCode best = null;
    int bestScore = Integer.MAX_VALUE;
    for (int mask = 0; mask < 8; mask++) {
      var m = new QrCode(version);
      m.drawFunctionPatterns();
      m.drawCodewords(codewords);
      m.applyMask(mask);
      m.drawFormatBits(ecc, mask);
      int score = penalty(m.modules);
      if (score < bestScore) {
        bestScore = score;
        best = m;
      }
    }
    return best;
  }

  /** Modules available for data + ECC in a version (everything but the function patterns). */
  static int rawDataModules(int version) {
    int result = (16 * version + 128) * version + 64;
    if (version >= 2) {
      int numAlign = version / 7 + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (version >= 7) {
        result -= 36;
      }
    }
    return result;
  }

  /** Data codewords a version holds at an error-correction level. */
  static int dataCodewords(int version, Ecc ecc) {
    return rawDataModules(version) / 8
        - ECC_PER_BLOCK[ecc.ordinal()][version] * BLOCKS[ecc.ordinal()][version];
  }

  // ---- GF(256) Reed–Solomon ----

  private static int gfMul(int x, int y) {
    int z = 0;
    for (int i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
  }

  private static int[] rsDivisor(int degree) {
    int[] result = new int[degree];
    result[degree - 1] = 1;
    int root = 1;
    for (int i = 0; i < degree; i++) {
      for (int j = 0; j < degree; j++) {
        result[j] = gfMul(result[j], root);
        if (j + 1 < degree) {
          result[j] ^= result[j + 1];
        }
      }
      root = gfMul(root, 0x02);
    }
    return result;
  }

  private static int[] rsRemainder(int[] data, int[] divisor) {
    int[] result = new int[divisor.length];
    for (int b : data) {
      int factor = b ^ result[0];
      System.arraycopy(result, 1, result, 0, result.length - 1);
      result[result.length - 1] = 0;
      for (int i = 0; i < divisor.length; i++) {
        result[i] ^= gfMul(divisor[i], factor);
      }
    }
    return result;
  }

  // ---- encoding ----

  private static void appendBits(List<Integer> bits, int value, int length) {
    for (int i = length - 1; i >= 0; i--) {
      bits.add((value >>> i) & 1);
    }
  }

  /** The data codewords (mode, count, payload, terminator, padding) for a version. */
  private static int[] dataCodewordsFor(byte[] bytes, int version, Ecc ecc) {
    int capacityBits = dataCodewords(version, ecc) * 8;
    var bits = new ArrayList<Integer>();
    appendBits(bits, 0b0100, 4); // byte mode
    appendBits(bits, bytes.length, version <= 9 ? 8 : 16);
    for (byte b : bytes) {
      appendBits(bits, b & 0xff, 8);
    }
    appendBits(bits, 0, Math.min(4, capacityBits - bits.size()));
    appendBits(bits, 0, (8 - (bits.size() % 8)) % 8);
    for (int pad = 0xec; bits.size() < capacityBits; pad ^= 0xec ^ 0x11) {
      appendBits(bits, pad, 8);
    }
    int[] out = new int[bits.size() / 8];
    for (int i = 0; i < bits.size(); i += 8) {
      int value = 0;
      for (int j = 0; j < 8; j++) {
        value = (value << 1) | bits.get(i + j);
      }
      out[i / 8] = value;
    }
    return out;
  }

  /** Splits into blocks, appends each block's ECC and interleaves (the final codeword sequence). */
  private static int[] withErrorCorrection(int[] data, int version, Ecc ecc) {
    int numBlocks = BLOCKS[ecc.ordinal()][version];
    int blockEccLen = ECC_PER_BLOCK[ecc.ordinal()][version];
    int rawCodewords = rawDataModules(version) / 8;
    int numShortBlocks = numBlocks - rawCodewords % numBlocks;
    int shortBlockLen = rawCodewords / numBlocks;
    int[] divisor = rsDivisor(blockEccLen);
    var blocks = new ArrayList<int[]>();
    for (int i = 0, k = 0; i < numBlocks; i++) {
      int len = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
      int[] dat = Arrays.copyOfRange(data, k, k + len);
      k += len;
      int[] eccBytes = rsRemainder(dat, divisor);
      int[] block = new int[shortBlockLen + 1];
      System.arraycopy(dat, 0, block, 0, dat.length);
      // a short block carries a padding 0 where a long one has its last data byte (skipped below)
      System.arraycopy(
          eccBytes, 0, block, i < numShortBlocks ? dat.length + 1 : dat.length, eccBytes.length);
      blocks.add(block);
    }
    int[] result = new int[rawCodewords];
    int n = 0;
    for (int i = 0; i < blocks.get(0).length; i++) {
      for (int j = 0; j < blocks.size(); j++) {
        if (i != shortBlockLen - blockEccLen || j >= numShortBlocks) {
          result[n++] = blocks.get(j)[i];
        }
      }
    }
    return result;
  }

  // ---- the matrix ----

  private static int[] alignmentPositions(int version, int size) {
    if (version == 1) {
      return new int[0];
    }
    int numAlign = version / 7 + 2;
    int step =
        version == 32 ? 26 : (int) Math.ceil((version * 4 + 4) / (double) (numAlign * 2 - 2)) * 2;
    var result = new ArrayList<Integer>();
    result.add(6);
    for (int pos = size - 7; result.size() < numAlign; pos -= step) {
      result.add(1, pos);
    }
    return result.stream().mapToInt(Integer::intValue).toArray();
  }

  private static boolean mask(int mask, int x, int y) {
    return switch (mask) {
      case 0 -> (x + y) % 2 == 0;
      case 1 -> y % 2 == 0;
      case 2 -> x % 3 == 0;
      case 3 -> (x + y) % 3 == 0;
      case 4 -> (x / 3 + y / 2) % 2 == 0;
      case 5 -> (x * y) % 2 + (x * y) % 3 == 0;
      case 6 -> ((x * y) % 2 + (x * y) % 3) % 2 == 0;
      default -> ((x + y) % 2 + (x * y) % 3) % 2 == 0;
    };
  }

  private void setFunction(int x, int y, boolean dark) {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  }

  private void drawFunctionPatterns() {
    for (int i = 0; i < size; i++) {
      setFunction(6, i, i % 2 == 0);
      setFunction(i, 6, i % 2 == 0);
    }
    int[][] finders = {{3, 3}, {size - 4, 3}, {3, size - 4}};
    for (int[] c : finders) {
      for (int dy = -4; dy <= 4; dy++) {
        for (int dx = -4; dx <= 4; dx++) {
          int dist = Math.max(Math.abs(dx), Math.abs(dy));
          int x = c[0] + dx;
          int y = c[1] + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) {
            setFunction(x, y, dist != 2 && dist != 4);
          }
        }
      }
    }
    int[] align = alignmentPositions(version, size);
    int n = align.length;
    for (int i = 0; i < n; i++) {
      for (int j = 0; j < n; j++) {
        if ((i == 0 && j == 0) || (i == 0 && j == n - 1) || (i == n - 1 && j == 0)) {
          continue;
        }
        for (int dy = -2; dy <= 2; dy++) {
          for (int dx = -2; dx <= 2; dx++) {
            setFunction(align[i] + dx, align[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
          }
        }
      }
    }
    drawFormatBits(Ecc.M, 0); // reserves the area; redrawn with the real values later
    if (version >= 7) {
      int rem = version;
      for (int i = 0; i < 12; i++) {
        rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      }
      int bits = (version << 12) | rem;
      for (int i = 0; i < 18; i++) {
        boolean bit = ((bits >>> i) & 1) != 0;
        int a = size - 11 + i % 3;
        int b = i / 3;
        setFunction(a, b, bit);
        setFunction(b, a, bit);
      }
    }
  }

  private void drawFormatBits(Ecc ecc, int mask) {
    int data = (ecc.formatBits << 3) | mask;
    int rem = data;
    for (int i = 0; i < 10; i++) {
      rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    }
    int bits = ((data << 10) | rem) ^ 0x5412;
    for (int i = 0; i <= 5; i++) {
      setFunction(8, i, bit(bits, i));
    }
    setFunction(8, 7, bit(bits, 6));
    setFunction(8, 8, bit(bits, 7));
    setFunction(7, 8, bit(bits, 8));
    for (int i = 9; i < 15; i++) {
      setFunction(14 - i, 8, bit(bits, i));
    }
    for (int i = 0; i < 8; i++) {
      setFunction(size - 1 - i, 8, bit(bits, i));
    }
    for (int i = 8; i < 15; i++) {
      setFunction(8, size - 15 + i, bit(bits, i));
    }
    setFunction(8, size - 8, true); // the dark module
  }

  private static boolean bit(int bits, int i) {
    return ((bits >>> i) & 1) != 0;
  }

  private void drawCodewords(int[] codewords) {
    int i = 0;
    for (int right = size - 1; right >= 1; right -= 2) {
      if (right == 6) {
        right = 5;
      }
      for (int vert = 0; vert < size; vert++) {
        for (int j = 0; j < 2; j++) {
          int x = right - j;
          boolean upward = ((right + 1) & 2) == 0;
          int y = upward ? size - 1 - vert : vert;
          if (!isFunction[y][x] && i < codewords.length * 8) {
            modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) != 0;
            i++;
          }
        }
      }
    }
  }

  private void applyMask(int mask) {
    for (int y = 0; y < size; y++) {
      for (int x = 0; x < size; x++) {
        if (!isFunction[y][x] && mask(mask, x, y)) {
          modules[y][x] = !modules[y][x];
        }
      }
    }
  }

  /** The standard penalty score (rules N1–N4): lower is easier to read. */
  static int penalty(boolean[][] modules) {
    int size = modules.length;
    int score = 0;
    for (int line = 0; line < size * 2; line++) {
      boolean[] cells = new boolean[size];
      for (int i = 0; i < size; i++) {
        cells[i] = line < size ? modules[line][i] : modules[i][line - size];
      }
      int run = 1;
      for (int i = 1; i < size; i++) {
        if (cells[i] == cells[i - 1]) {
          run++;
          if (run == 5) {
            score += 3;
          } else if (run > 5) {
            score++;
          }
        } else {
          run = 1;
        }
      }
      // N3: 1:1:3:1:1 finder-like pattern with 4 light modules on either side
      for (int i = 0; i + 6 < size; i++) {
        if (cells[i]
            && !cells[i + 1]
            && cells[i + 2]
            && cells[i + 3]
            && cells[i + 4]
            && !cells[i + 5]
            && cells[i + 6]) {
          boolean lightBefore = true;
          for (int k = 1; k <= 4; k++) {
            lightBefore &= i - k < 0 || !cells[i - k];
          }
          boolean lightAfter = true;
          for (int k = 7; k <= 10; k++) {
            lightAfter &= i + k >= size || !cells[i + k];
          }
          if (lightBefore || lightAfter) {
            score += 40;
          }
        }
      }
    }
    for (int y = 0; y + 1 < size; y++) {
      for (int x = 0; x + 1 < size; x++) {
        boolean c = modules[y][x];
        if (c == modules[y][x + 1] && c == modules[y + 1][x] && c == modules[y + 1][x + 1]) {
          score += 3;
        }
      }
    }
    int dark = 0;
    for (boolean[] row : modules) {
      for (boolean cell : row) {
        if (cell) {
          dark++;
        }
      }
    }
    int total = size * size;
    score += (int) Math.ceil(Math.abs(dark * 20 - total * 10) / (double) total - 1) * 10;
    return score;
  }

  /**
   * The symbol for a terminal: two module rows per text line (the upper half block, coloured with
   * ANSI foreground = upper module, background = lower module), dark on white whatever the
   * terminal's own colours, with a quiet zone of {@code border} modules.
   */
  String toTerminal(int border) {
    var out = new StringBuilder();
    int dim = size + border * 2;
    for (int y = 0; y < dim; y += 2) {
      for (int x = 0; x < dim; x++) {
        boolean top = dark(x - border, y - border);
        boolean bottom = dark(x - border, y + 1 - border);
        out.append("\u001b[")
            .append(top ? "30" : "97")
            .append(';')
            .append(bottom ? "40" : "107")
            .append("m▀");
      }
      out.append("\u001b[0m\n");
    }
    return out.toString();
  }

  private boolean dark(int x, int y) {
    return x >= 0 && y >= 0 && x < size && y < size && modules[y][x];
  }
}
