/**
 * 评审对话框组件
 * 
 * 用于填写评审意见
 * 
 * @module ReviewDialog
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Requirement } from '@/lib/requirements-store';
import { validateReviewOpinion } from '@/lib/input-validation';

/**
 * 组件属性
 */
interface ReviewDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭对话框 */
  onClose: () => void;
  /** 需求数据 */
  requirement: Requirement | null;
  /** 评审级别 */
  level: number;
  /** 提交评审（包含通过/不通过状态） */
  onSubmitReview: (status: 'approved' | 'rejected') => void;
  /** 评审意见（受控） */
  opinion: string;
  /** 设置评审意见 */
  onOpinionChange: (opinion: string) => void;
}

/**
 * 评审对话框组件
 */
export function ReviewDialog({
  open,
  onClose,
  requirement,
  level,
  onSubmitReview,
  opinion,
  onOpinionChange,
}: ReviewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (status: 'approved' | 'rejected') => {
    if (!requirement) return;

    // 验证评审意见
    const validation = validateReviewOpinion(opinion);
    if (!validation.valid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview(status);
    } catch (error) {
      console.error('评审提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!requirement) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {level === 1 ? '一级' : '二级'}评审意见 - {requirement.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opinion">
              {level === 1 ? '一级' : '二级'}评审意见
            </Label>
            <Textarea
              id="opinion"
              placeholder={`请输入${level === 1 ? '一级' : '二级'}评审意见...`}
              value={opinion}
              onChange={(e) => onOpinionChange(e.target.value)}
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-sm text-muted-foreground text-right">
              {opinion.length}/1000
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubmit('rejected')}
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '不通过'}
            </Button>
            <Button
              onClick={() => handleSubmit('approved')}
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '通过'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}






