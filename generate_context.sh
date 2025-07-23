#!/bin/bash

# Nom du fichier de sortie
OUTPUT_FILE="docs_context.txt"
# Nom du script actuel pour l'exclure
SCRIPT_NAME=$(basename "$0")

# Vider/créer le fichier de sortie avec un en-tête
# Note: 'pwd' in Git Bash gives the correct path in a format Bash understands.
# The project name is extracted from the current directory's full path.
echo "# Contexte de la Documentation du Projet : $(basename "$(pwd)")" > "$OUTPUT_FILE"
echo "Généré le : $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# --- 1. Structure du Répertoire ---
echo "## Arborescence de la documentation" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"

# Alternative à la commande 'tree' pour la compatibilité avec Git Bash par défaut.
# Cette commande 'find' liste les répertoires et fichiers jusqu'à une profondeur de 4 niveaux.
find . -maxdepth 3 -not -path "./.git*" -not -name "$SCRIPT_NAME" -not -name "$OUTPUT_FILE" | sed -e 's;[^/]*;/|--;g;s;--|; |;g' >> "$OUTPUT_FILE"

echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# --- 2. Contenu des Fichiers Markdown ---
echo "## Contenu des Fichiers" >> "$OUTPUT_FILE"

# Cette partie du script est déjà compatible avec Git Bash.
find . -type f -name "*.md" \
    -not -path "./.git/*" \
    -not -name "README.md" \
    -print0 | while IFS= read -r -d '' file; do

    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "### Fichier : \`$file\`" >> "$OUTPUT_FILE"
    echo "\`\`\`markdown" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
done

# Ajoute le README.md principal à la fin
if [ -f "README.md" ]; then
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "### Fichier : \`README.md\`" >> "$OUTPUT_FILE"
    echo "\`\`\`markdown" >> "$OUTPUT_FILE"
    cat "README.md" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
fi

echo "✅ Contexte de la documentation généré avec succès dans : $OUTPUT_FILE"```