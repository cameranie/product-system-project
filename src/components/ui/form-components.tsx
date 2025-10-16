// 通用表单组件
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { X, Upload, File, Image } from 'lucide-react';
import { ValidationResult } from '@/lib/validation';

// 表单字段包装器
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ 
  label, 
  required, 
  error, 
  description, 
  className, 
  children 
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// 验证输入框
export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  validation?: ValidationResult;
  required?: boolean;
  description?: string;
}

export function ValidatedInput({ 
  label, 
  validation, 
  required, 
  description, 
  className,
  ...props 
}: ValidatedInputProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={validation?.error}
      description={description}
      className={className}
    >
      <Input 
        {...props}
        className={cn(
          validation?.error && 'border-red-500 focus-visible:ring-red-500',
          props.className
        )}
      />
    </FormField>
  );
}

// 验证文本域
export interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  validation?: ValidationResult;
  required?: boolean;
  description?: string;
}

export function ValidatedTextarea({ 
  label, 
  validation, 
  required, 
  description, 
  className,
  ...props 
}: ValidatedTextareaProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={validation?.error}
      description={description}
      className={className}
    >
      <Textarea 
        {...props}
        className={cn(
          validation?.error && 'border-red-500 focus-visible:ring-red-500',
          props.className
        )}
      />
    </FormField>
  );
}

// 标签输入组件
export interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  validation?: ValidationResult;
  required?: boolean;
  description?: string;
  className?: string;
}

export function TagInput({ 
  label,
  tags, 
  onTagsChange, 
  placeholder = '输入标签后按回车添加',
  maxTags = 10,
  validation,
  required,
  description,
  className
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <FormField
      label={label}
      required={required}
      error={validation?.error}
      description={description}
      className={className}
    >
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
          className={validation?.error ? 'border-red-500' : ''}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags} 个标签
        </p>
      </div>
    </FormField>
  );
}

// 文件上传组件
export interface FileUploadProps {
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  validation?: ValidationResult;
  required?: boolean;
  description?: string;
  className?: string;
}

export function FileUpload({
  label,
  files,
  onFilesChange,
  accept,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  validation,
  required,
  description,
  className
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // 验证文件数量
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    // 验证文件大小
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`文件过大：${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    onFilesChange([...files, ...selectedFiles]);
    
    // 清空input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <FormField
      label={label}
      required={required}
      error={validation?.error}
      description={description}
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= maxFiles}
          >
            <Upload className="h-4 w-4 mr-2" />
            选择文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="text-sm text-muted-foreground">
            {files.length}/{maxFiles} 个文件
          </span>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(file)}
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}

// 复选框组
export interface CheckboxGroupProps {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  multiple?: boolean;
  validation?: ValidationResult;
  required?: boolean;
  description?: string;
  className?: string;
}

export function CheckboxGroup({
  label,
  options,
  selectedValues,
  onSelectionChange,
  multiple = true,
  validation,
  required,
  description,
  className
}: CheckboxGroupProps) {
  const handleChange = (value: string, checked: boolean) => {
    if (multiple) {
      if (checked) {
        onSelectionChange([...selectedValues, value]);
      } else {
        onSelectionChange(selectedValues.filter(v => v !== value));
      }
    } else {
      onSelectionChange(checked ? [value] : []);
    }
  };

  return (
    <FormField
      label={label}
      required={required}
      error={validation?.error}
      description={description}
      className={className}
    >
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`checkbox-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={option.disabled}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label 
              htmlFor={`checkbox-${option.value}`}
              className={cn(
                'text-sm',
                option.disabled && 'text-muted-foreground'
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </FormField>
  );
}

// 表单操作按钮组
export interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  className?: string;
}

export function FormActions({
  onSubmit,
  onCancel,
  submitText = '提交',
  cancelText = '取消',
  submitLoading = false,
  submitDisabled = false,
  className
}: FormActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {onCancel && (
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={submitLoading}
        >
          {cancelText}
        </Button>
      )}
      {onSubmit && (
        <Button 
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled || submitLoading}
        >
          {submitLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />}
          {submitText}
        </Button>
      )}
    </div>
  );
} 