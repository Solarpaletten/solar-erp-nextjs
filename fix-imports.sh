#!/bin/bash

# Скрипт автоматического обновления импортов после миграции
# Использование: chmod +x fix-imports.sh && ./fix-imports.sh

set -e

echo "🔧 Начинаем обновление импортов..."
echo "===================================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функция для замены импортов в файлах
fix_imports_in_dir() {
    local dir=$1
    echo -e "${BLUE}Обрабатываем: $dir${NC}"
    
    find "$dir" -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' file; do
        # Пропускаем node_modules
        if [[ $file == *"node_modules"* ]]; then
            continue
        fi
        
        echo "  Проверяем: $file"
        
        # Создаём временный файл
        temp_file="${file}.tmp"
        cp "$file" "$temp_file"
        
        # Заменяем старые импорты на новые
        # Авторизация
        sed -i.bak 's|@/app/(auth)/|@/app/(products)/itsolar/(auth)/|g' "$temp_file"
        sed -i.bak 's|from "(auth)/|from "(products)/itsolar/(auth)/|g' "$temp_file"
        
        # Дашборд
        sed -i.bak 's|@/app/(dashboard)/|@/app/(products)/itsolar/(dashboard)/|g' "$temp_file"
        sed -i.bak 's|from "(dashboard)/|from "(products)/itsolar/(dashboard)/|g' "$temp_file"
        
        # API
        sed -i.bak 's|@/app/api/auth/|@/app/api/itsolar/auth/|g' "$temp_file"
        sed -i.bak 's|@/app/api/account/|@/app/api/itsolar/account/|g' "$temp_file"
        sed -i.bak 's|@/app/api/company/|@/app/api/itsolar/company/|g' "$temp_file"
        
        # API пути в fetch
        sed -i.bak 's|/api/auth/|/api/itsolar/auth/|g' "$temp_file"
        sed -i.bak 's|/api/account/|/api/itsolar/account/|g' "$temp_file"
        sed -i.bak 's|/api/company/|/api/itsolar/company/|g' "$temp_file"
        
        # Проверяем, изменился ли файл
        if ! cmp -s "$file" "$temp_file"; then
            mv "$temp_file" "$file"
            echo -e "    ${GREEN}✓ Обновлён${NC}"
        else
            rm "$temp_file"
        fi
        
        # Удаляем backup файлы sed
        rm -f "${file}.bak"
    done
}

# Обрабатываем все директории с новой структурой
echo -e "\n${BLUE}Обновляем импорты в auth...${NC}"
fix_imports_in_dir "src/app/(products)/itsolar/(auth)"

echo -e "\n${BLUE}Обновляем импорты в dashboard...${NC}"
fix_imports_in_dir "src/app/(products)/itsolar/(dashboard)"

echo -e "\n${BLUE}Обновляем импорты в API...${NC}"
fix_imports_in_dir "src/app/api/itsolar"

echo -e "\n${BLUE}Обновляем импорты в компонентах...${NC}"
if [ -d "src/app/components" ]; then
    fix_imports_in_dir "src/app/components"
fi

if [ -d "src/components" ]; then
    fix_imports_in_dir "src/components"
fi

echo -e "\n${GREEN}✅ Импорты обновлены!${NC}"
echo ""
echo -e "${YELLOW}Проверьте следующие файлы вручную:${NC}"
echo "1. src/middleware.ts - обновите пути роутинга"
echo "2. Файлы с динамическими импортами (import())"
echo "3. Конфигурационные файлы"
