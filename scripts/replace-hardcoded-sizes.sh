#!/bin/bash

# 批量替换硬编码尺寸为配置化尺寸
# 自动为未导入 UI_SIZES 的文件添加导入

FILES_TO_UPDATE=(
  "src/components/requirements/AttachmentsSection.tsx"
  "src/components/requirements/HistorySection.tsx"
  "src/components/requirements/QuickActionsCard.tsx"
  "src/components/requirements/ScheduledReviewCard.tsx"
  "src/components/requirements/EndOwnerOpinionCard.tsx"
)

for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # 检查是否已经导入 UI_SIZES
    if ! grep -q "UI_SIZES" "$file"; then
      # 在第一个 lucide-react 或 @/lib 导入后添加 UI_SIZES 导入
      sed -i '' "/from 'lucide-react';/a\\
import { UI_SIZES } from '@/config/requirements';
" "$file" || sed -i '' "/from '@\/lib/a\\
import { UI_SIZES } from '@/config/requirements';
" "$file"
    fi
    
    # 替换 Avatar 尺寸
    sed -i '' 's/Avatar className="h-8 w-8"/Avatar className={UI_SIZES.AVATAR.MEDIUM}/g' "$file"
    sed -i '' 's/Avatar className="h-6 w-6"/Avatar className={UI_SIZES.AVATAR.SMALL}/g' "$file"
    sed -i '' 's/<Avatar className="h-10 w-10"/<Avatar className={UI_SIZES.AVATAR.LARGE}/g' "$file"
    
    # 替换按钮尺寸
    sed -i '' 's/className="h-8 w-8 p-0"/className={UI_SIZES.BUTTON.ICON_MEDIUM}/g' "$file"
    sed -i '' 's/className="h-6 w-6 p-0"/className={UI_SIZES.BUTTON.ICON_SMALL}/g' "$file"
    sed -i '' 's/className="h-8"/className={UI_SIZES.BUTTON.INPUT_HEIGHT}/g' "$file"
    
    # 替换图标尺寸
    sed -i '' 's/className="h-3 w-3"/className={UI_SIZES.ICON.SMALL}/g' "$file"
    sed -i '' 's/className="h-4 w-4"/className={UI_SIZES.ICON.MEDIUM}/g' "$file"
    sed -i '' 's/className="h-6 w-6"/className={UI_SIZES.ICON.LARGE}/g' "$file"
    sed -i '' 's/className="h-8 w-8"/className={UI_SIZES.ICON.XLARGE}/g' "$file"
    
    echo "✅ $file updated"
  else
    echo "⚠️  $file not found"
  fi
done

echo ""
echo "🎉 All files processed!"
echo ""
echo "请检查修改的文件，确保替换正确。"
echo "如有问题，可以使用 git diff 查看变更。" 