import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading-spinner',
    template: `
    <div class="loading-container" [class.overlay]="overlay">
      <mat-spinner [diameter]="size" [color]="color"></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
    styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 32px;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .loading-message {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
  `]
})
export class LoadingSpinnerComponent {
    @Input() size: number = 40;
    @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
    @Input() message?: string;
    @Input() overlay: boolean = false;
}