import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

@Component({
    selector: 'app-confirm-dialog',
    template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || '取消' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.isDestructive ? 'warn' : 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText || '確認' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .dialog-container {
      min-width: 300px;
    }
    
    mat-dialog-content {
      margin: 16px 0;
    }
    
    mat-dialog-content p {
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class ConfirmDialogComponent {
    public dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
    public data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}