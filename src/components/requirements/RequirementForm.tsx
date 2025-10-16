import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { REQUIREMENT_TYPES, PLATFORM_OPTIONS } from '@/config/requirements';
import type { RequirementFormData } from '@/hooks/requirements/useRequirementForm';
import type { Attachment } from '@/lib/requirements-store';

/**
 * 表单字段错误映射
 */
export interface FormErrors {
  title?: string;
  description?: string;
  type?: string;
  platforms?: string;
  [key: string]: string | undefined;
}

/**
 * 需求表单组件Props
 */
export interface RequirementFormProps {
  /** 表单数据 */
  formData: RequirementFormData;
  /** 附件列表 */
  attachments: Attachment[];
  /** 表单错误 */
  errors?: FormErrors;
  /** 是否只读 */
  readOnly?: boolean;
  /** 字段修改回调 */
  onInputChange: (field: keyof RequirementFormData, value: any) => void;
  /** 需求类型修改回调 */
  onTypeChange: (type: string, checked: boolean) => void;
  /** 应用端修改回调 */
  onPlatformChange: (platform: string, checked: boolean) => void;
  /** 附件修改回调 */
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

/**
 * 需求表单组件
 * 
 * 复用于新建页和编辑页的共享表单组件
 * 
 * 功能：
 * - 标题输入
 * - 需求类型选择
 * - 应用端选择
 * - 富文本描述编辑
 * - 附件管理
 * 
 * @example
 * ```tsx
 * <RequirementForm
 *   formData={formData}
 *   attachments={attachments}
 *   errors={errors}
 *   onInputChange={handleInputChange}
 *   onTypeChange={handleTypeChange}
 *   onPlatformChange={handlePlatformChange}
 *   onAttachmentsChange={setAttachments}
 * />
 * ```
 */
export const RequirementForm = memo(function RequirementForm({
  formData,
  attachments,
  errors = {},
  readOnly = false,
  onInputChange,
  onTypeChange,
  onPlatformChange,
  onAttachmentsChange,
}: RequirementFormProps) {
  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 标题 */}
          <FormField
            label="需求标题"
            required
            error={errors.title}
          >
            <Input
              id="title"
              placeholder="请输入需求标题"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              disabled={readOnly}
              className={errors.title ? 'border-destructive' : ''}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
          </FormField>

          {/* 需求类型 */}
          <FormField label="需求类型" error={errors.type}>
            <div className="flex flex-wrap gap-4">
              {REQUIREMENT_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={formData.type === type}
                    onCheckedChange={(checked) => onTypeChange(type, !!checked)}
                    disabled={readOnly}
                  />
                  <Label 
                    htmlFor={`type-${type}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </FormField>

          {/* 应用端 */}
          <FormField label="应用端" error={errors.platforms}>
            <div className="flex flex-wrap gap-4">
              {PLATFORM_OPTIONS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={formData.platforms.includes(platform)}
                    onCheckedChange={(checked) => onPlatformChange(platform, !!checked)}
                    disabled={readOnly}
                  />
                  <Label 
                    htmlFor={`platform-${platform}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* 需求描述 + 附件 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            需求描述 <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            placeholder="请详细描述需求内容、目标和预期效果..."
            value={formData.description}
            onChange={(value) => onInputChange('description', value)}
            readOnly={readOnly}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
            showAttachments={true}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-2" id="description-error">
              {errors.description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

/**
 * 表单字段包装组件
 * 
 * 统一处理标签、必填标记、错误提示
 */
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label} 
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}




