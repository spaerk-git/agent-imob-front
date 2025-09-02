import React from 'react';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
      DialogClose,
    } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Loader2 } from 'lucide-react';

    export const ConfirmationDialog = ({
      isOpen,
      onOpenChange,
      title,
      description,
      onConfirm,
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      isLoading = false,
    }) => {
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isLoading}>
                  {cancelText}
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant={title?.toLowerCase().includes('exclu') ? 'destructive' : 'default'}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
