'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const password = value as string || '';

    // 密码强度检查（规则：至少6位，包含大小写和特殊字符）
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const strength = passedChecks < 3 ? 'weak' : passedChecks === 3 ? 'medium' : 'strong';

    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500',
    };

    const strengthLabels = {
      weak: '弱',
      medium: '中等',
      strong: '强',
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
            ref={ref}
            value={value}
            onChange={onChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {showStrength && password && (
          <div className="space-y-2">
            {/* 强度条 */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    level <= passedChecks
                      ? strengthColors[strength]
                      : 'bg-gray-200'
                  )}
                />
              ))}
            </div>

            {/* 强度标签 */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">密码强度</span>
              <span
                className={cn(
                  'font-medium',
                  strength === 'weak' && 'text-red-500',
                  strength === 'medium' && 'text-yellow-500',
                  strength === 'strong' && 'text-green-500'
                )}
              >
                {strengthLabels[strength]}
              </span>
            </div>

            {/* 检查列表 */}
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex items-center gap-2">
                {checks.length ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={checks.length ? 'text-green-600' : 'text-red-600'}>
                  至少6个字符
                </span>
              </div>
              <div className="flex items-center gap-2">
                {checks.lowercase ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={checks.lowercase ? 'text-green-600' : 'text-red-600'}>
                  包含小写字母
                </span>
              </div>
              <div className="flex items-center gap-2">
                {checks.uppercase ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={checks.uppercase ? 'text-green-600' : 'text-red-600'}>
                  包含大写字母
                </span>
              </div>
              <div className="flex items-center gap-2">
                {checks.special ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={checks.special ? 'text-green-600' : 'text-red-600'}>
                  包含特殊字符
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
