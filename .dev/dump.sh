#!/bin/bash

install_cmd() {
  local name=$1
  local dest="/usr/local/bin/$name"

  cat > "/tmp/$name" << 'EOF_MARKER'
CONTENT_PLACEHOLDER
EOF_MARKER

  sudo mv "/tmp/$name" "$dest"
  sudo chmod +x "$dest"
  echo "✓ $name instalado en $dest"
}

# --- dumpjava ---
cat > /tmp/dumpjava << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Uso: dumpjava <fichero-salida> [directorio]"
  exit 1
fi
output="$1"; dir="${2:-.}"; cat /dev/null > "$output"; find "$dir" -path "$dir/target" -prune -o \( -name "*.java" -o -name "*.ftl" -o -name "*.json" -o -name "pom.xml" \) -print0 | while IFS= read -r -d '' file; do
  echo "===== FILE: $file =====" >> "$output"
  cat "$file" >> "$output"
  echo >> "$output"
done
EOF
sudo mv /tmp/dumpjava /usr/local/bin/dumpjava
sudo chmod +x /usr/local/bin/dumpjava
echo "✓ dumpjava instalado en /usr/local/bin/dumpjava"

# --- dumpmd ---
cat > /tmp/dumpmd << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Uso: dumpmd <fichero-salida> [directorio]"
  exit 1
fi
output="$1"; dir="${2:-.}"; cat /dev/null > "$output"; find "$dir" \( -name "*.md" \) -print0 | while IFS= read -r -d '' file; do
  echo "===== FILE: $file =====" >> "$output"
  cat "$file" >> "$output"
  echo >> "$output"
done
EOF
sudo mv /tmp/dumpmd /usr/local/bin/dumpmd
sudo chmod +x /usr/local/bin/dumpmd
echo "✓ dumpmd instalado en /usr/local/bin/dumpmd"

echo ""
echo "Instalación completada. Prueba con:"
echo "  which dumpjava"
echo "  which dumpmd"