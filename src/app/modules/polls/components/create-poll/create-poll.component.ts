import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollService, CreatePollRequest, CreatePollOption } from '../../../../services/poll.service';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-create-poll',
    template: `
    <div class="create-poll-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <div class="back-button">
              <button mat-icon-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
            
            <div class="title-section">
              <h1>創建新投票</h1>
              <p>設計您的投票，讓社群參與決策</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div *ngIf="isSubmitting" class="loading-section">
            <app-loading-spinner message="創建投票中..."></app-loading-spinner>
          </div>

          <!-- Form Content -->
          <div *ngIf="!isSubmitting">
            <form [formGroup]="pollForm" (ngSubmit)="onSubmit()" class="poll-form">
              <!-- Basic Information -->
              <div class="form-section">
                <h3>基本資訊</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>投票標題 *</mat-label>
                    <input matInput formControlName="title" placeholder="輸入投票標題">
                    <mat-error *ngIf="pollForm.get('title')?.hasError('required')">
                      標題為必填項目
                    </mat-error>
                    <mat-error *ngIf="pollForm.get('title')?.hasError('minlength')">
                      標題至少需要 3 個字元
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>投票描述</mat-label>
                    <textarea matInput formControlName="description" 
                             placeholder="描述投票的目的和背景（可選）"
                             rows="3"></textarea>
                    <mat-error *ngIf="pollForm.get('description')?.hasError('maxlength')">
                      描述不能超過 500 個字元
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>結束日期</mat-label>
                    <input matInput [matDatepicker]="endDatePicker" 
                           formControlName="endDate" 
                           placeholder="選擇結束日期（可選）">
                    <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
                    <mat-datepicker #endDatePicker></mat-datepicker>
                    <mat-error *ngIf="pollForm.get('endDate')?.hasError('invalidDate')">
                      請選擇有效的日期
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Cover Image Upload -->
                <div class="form-row">
                  <h4>投票封面圖（可選）</h4>
                  <div class="cover-upload-area" [class.has-image]="coverImagePreview" (click)="triggerCoverUpload()">
                    <ng-container *ngIf="!coverImagePreview; else coverPreview">
                      <mat-icon>image</mat-icon>
                      <span>點擊上傳封面圖（建議 1200x630）</span>
                    </ng-container>
                    <ng-template #coverPreview>
                      <img [src]="coverImagePreview!" alt="封面預覽">
                    </ng-template>
                    <input id="cover-file" type="file" accept="image/*" (change)="onCoverSelected($event)" style="display:none;" />
                  </div>
                  <div class="cover-actions" *ngIf="coverImagePreview">
                    <button mat-button color="warn" type="button" (click)="removeCover()">
                      <mat-icon>delete</mat-icon>
                      移除封面
                    </button>
                  </div>
                </div>
              </div>

              <!-- Poll Options -->
              <div class="form-section">
                <div class="options-header">
                  <h3>投票選項</h3>
                  <button type="button" mat-button color="primary" (click)="addOption()">
                    <mat-icon>add</mat-icon>
                    新增選項
                  </button>
                </div>

                <div formArrayName="options" class="options-section">
                  <div *ngFor="let option of optionsArray.controls; let i = index" 
                       [formGroupName]="i" 
                       class="option-item">
                    
                    <div class="option-header">
                      <div class="option-number">{{ i + 1 }}</div>
                      <button type="button" mat-icon-button color="warn" 
                              (click)="removeOption(i)" 
                              [disabled]="optionsArray.length <= 2"
                              class="remove-option-btn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>

                    <div class="option-content">
                      <mat-form-field appearance="outline" class="option-text-field">
                        <mat-label>選項文字 *</mat-label>
                        <input matInput formControlName="text" 
                               [placeholder]="'選項 ' + (i + 1) + ' 的文字'">
                        <mat-error *ngIf="option.get('text')?.hasError('required')">
                          選項文字為必填項目
                        </mat-error>
                      </mat-form-field>

                      <div class="image-upload-section">
                        <div class="upload-area" 
                             [class.has-image]="optionImages[i]"
                             (click)="triggerImageUpload(i)">
                          
                          <div *ngIf="!optionImages[i]" class="upload-placeholder">
                            <mat-icon>add_photo_alternate</mat-icon>
                            <span>新增圖片（可選）</span>
                          </div>
                          
                          <img *ngIf="optionImages[i]" 
                               [src]="optionImages[i]" 
                               [alt]="'選項 ' + (i + 1) + ' 圖片'"
                               class="image-preview">
                          
                          <input #fileInput type="file" 
                                 [id]="'file-' + i"
                                 accept="image/*"
                                 (change)="onImageSelected($event, i)"
                                 style="display: none;">
                        </div>
                        
                        <button *ngIf="optionImages[i]" 
                                type="button" 
                                mat-button 
                                color="warn" 
                                (click)="removeImage(i)"
                                class="upload-button">
                          <mat-icon>delete</mat-icon>
                          移除圖片
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div *ngIf="optionsArray.length < 2" class="min-options-warning">
                  <mat-icon>warning</mat-icon>
                  <span>至少需要 2 個選項</span>
                </div>

                <div class="add-option-section">
                  <button type="button" mat-button (click)="addOption()" class="add-option-btn">
                    <mat-icon>add</mat-icon>
                    新增選項
                  </button>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" mat-button (click)="goBack()" class="cancel-btn">
                  取消
                </button>
                <button type="submit" 
                        mat-raised-button 
                        color="primary"
                        [disabled]="!pollForm.valid || isSubmitting"
                        class="submit-btn">
                  <mat-icon>create</mat-icon>
                  {{ isSubmitting ? '創建中...' : '創建投票' }}
                </button>
              </div>

              <!-- Success/Error Messages -->
              <div *ngIf="successMessage" class="success-message">
                {{ successMessage }}
              </div>
              <div *ngIf="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .create-poll-container {
      min-height: 100vh;
      background-color: var(--background-light);
    }

    .header-section {
      background-color: var(--background-white);
      color: var(--text-primary);
      padding: 32px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .back-button {
      flex-shrink: 0;
    }

    .back-button button {
      color: var(--text-secondary);
    }

    .title-section {
      flex: 1;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .title-section p {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-secondary);
      font-weight: 400;
    }

    .content-section {
      padding: 32px 0;
    }

    .content-wrapper {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .poll-form {
      background: var(--background-white);
      border-radius: 12px;
      padding: 32px;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: var(--text-primary);
      font-size: 1.3rem;
      font-weight: 500;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .options-header h3 {
      margin: 0;
    }

    .options-section {
      margin-top: 24px;
    }

    .option-item {
      background: var(--background-light);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      transition: all 0.2s ease;
    }

    .option-item:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-light);
    }

    .option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .option-number {
      background: var(--primary-color);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .remove-option-btn {
      color: var(--accent-color);
    }

    .option-content {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: start;
    }

    .option-text-field {
      width: 100%;
    }

    .image-upload-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 120px;
    }

    .upload-area {
      width: 120px;
      height: 120px;
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      overflow: hidden;
      background-color: var(--background-light);
    }

    .upload-area:hover {
      border-color: var(--primary-color);
      background-color: rgba(33, 150, 243, 0.04);
    }

    .upload-area.has-image {
      border-style: solid;
      border-color: var(--primary-color);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
    }

    .upload-placeholder mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .upload-placeholder span {
      font-size: 0.8rem;
      text-align: center;
    }

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-button {
      font-size: 0.8rem;
      padding: 4px 8px;
      min-width: 80px;
    }

    .cover-upload-area {
      width: 100%;
      padding-top: 52.5%;
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      background: var(--background-light);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      overflow: hidden;
      position: relative;
      margin-bottom: 8px;
    }

    .cover-upload-area.has-image {
      border-style: solid;
      border-color: var(--primary-color);
      background: var(--background-white);
    }

    .cover-upload-area img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-upload-area mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .cover-upload-area span {
      font-size: 1rem;
    }

    .cover-actions {
      margin-top: 8px;
      text-align: right;
    }

    .min-options-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f57c00;
      font-size: 0.9rem;
      margin-top: 16px;
    }

    .min-options-warning mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .add-option-section {
      text-align: center;
      margin-top: 24px;
    }

    .add-option-btn {
      background-color: var(--primary-color);
      color: white;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
    }

    .submit-btn {
      background-color: var(--primary-color);
      color: white;
      padding: 12px 32px;
      font-size: 1.1rem;
    }

    .cancel-btn {
      color: var(--text-secondary);
    }

    .error-message {
      color: var(--accent-color);
      font-size: 0.9rem;
      margin-top: 8px;
    }

    .success-message {
      color: #4caf50;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .header-content,
      .content-wrapper {
        padding: 0 16px;
      }

      .header-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .title-section h1 {
        font-size: 2rem;
      }

      .poll-form {
        padding: 20px;
      }

      .option-content {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .upload-area {
        width: 100px;
        height: 100px;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .submit-btn,
      .cancel-btn {
        width: 100%;
      }
    }
  `]
})
export class CreatePollComponent implements OnInit {
    pollForm: FormGroup;
    optionImages: (string | null)[] = [];
    isSubmitting = false;
    coverFile: File | null = null;
    coverImagePreview: string | null = null;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private pollService: PollService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.pollForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.maxLength(500)]],
            endDate: [''],
            options: this.fb.array([
                this.fb.group({
                    text: ['', Validators.required],
                    hasImage: [false]
                }),
                this.fb.group({
                    text: ['', Validators.required],
                    hasImage: [false]
                })
            ])
        });
    }

    ngOnInit() {
        // Initialize option images array
        this.optionImages = new Array(this.optionsArray.length).fill(null);
    }

    get optionsArray() {
        return this.pollForm.get('options') as FormArray;
    }

    addOption() {
        const option = this.fb.group({
            text: ['', Validators.required],
            hasImage: [false]
        });
        this.optionsArray.push(option);
        this.optionImages.push(null);
    }

    removeOption(index: number) {
        if (this.optionsArray.length > 2) {
            this.optionsArray.removeAt(index);
            this.optionImages.splice(index, 1);
        }
    }

    triggerImageUpload(index: number) {
        const fileInput = document.getElementById(`file-${index}`) as HTMLInputElement;
        fileInput?.click();
    }

    triggerCoverUpload() {
        const fileInput = document.getElementById('cover-file') as HTMLInputElement;
        fileInput?.click();
    }

    onImageSelected(event: any, index: number) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                this.snackBar.open('圖片大小不能超過 5MB', '關閉', { duration: 3000 });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.optionImages[index] = e.target.result;
                this.optionsArray.at(index).patchValue({ hasImage: true });
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(index: number) {
        this.optionImages[index] = null;
        this.optionsArray.at(index).patchValue({ hasImage: false });
        const fileInput = document.getElementById(`file-${index}`) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    onCoverSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            this.snackBar.open('封面圖大小不能超過 5MB', '關閉', { duration: 3000 });
            return;
        }
        this.coverFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.coverImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    removeCover() {
        this.coverFile = null;
        this.coverImagePreview = null;
        const input = document.getElementById('cover-file') as HTMLInputElement;
        if (input) input.value = '';
    }

    onSubmit() {
        if (this.pollForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;

            const formValue = this.pollForm.value;
            const pollData: CreatePollRequest = {
                title: formValue.title,
                description: formValue.description || undefined,
                endDate: formValue.endDate ? formatDate(formValue.endDate, 'yyyy-MM-dd', 'en-US') : undefined,
                options: formValue.options.map((option: any, index: number) => ({
                    text: option.text,
                    hasImage: this.optionImages[index] !== null
                }))
            };

            // Prepare images for upload
            const images: File[] = [];
            this.optionImages.forEach((imageData, index) => {
                if (imageData) {
                    // Convert base64 to file
                    const byteString = atob(imageData.split(',')[1]);
                    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const file = new File([ab], `option-${index}.jpg`, { type: mimeString });
                    images.push(file);
                }
            });

            this.pollService.createPoll(pollData, images.length > 0 ? images : undefined, this.coverFile || undefined).subscribe({
                next: (response) => {
                    this.successMessage = '投票創建成功！';
                    this.errorMessage = '';
                    this.snackBar.open('投票創建成功！', '關閉', { duration: 3000 });
                    this.router.navigate(['/polls', response.poll.id]);
                },
                error: (error) => {
                    console.error('Error creating poll:', error);
                    this.errorMessage = '創建投票失敗，請稍後再試';
                    this.successMessage = '';
                    this.snackBar.open('創建投票失敗，請稍後再試', '關閉', { duration: 3000 });
                    this.isSubmitting = false;
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/polls']);
    }
} 