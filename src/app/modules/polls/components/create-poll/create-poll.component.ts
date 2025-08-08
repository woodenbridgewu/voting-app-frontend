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
          <div class="back-button">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>
          
          <div class="header-info">
            <h1>創建新投票</h1>
            <p>設計您的投票，讓社群參與決策</p>
          </div>
        </div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="form-content">
          <form [formGroup]="pollForm" (ngSubmit)="onSubmit()">
            <!-- Basic Information -->
            <div class="form-card">
              <h3>基本資訊</h3>
              
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

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>投票描述</mat-label>
                <textarea matInput formControlName="description" 
                         placeholder="描述投票的目的和背景（可選）"
                         rows="3"></textarea>
                <mat-error *ngIf="pollForm.get('description')?.hasError('maxlength')">
                  描述不能超過 500 個字元
                </mat-error>
              </mat-form-field>

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

            <!-- Poll Options -->
            <div class="form-card">
              <div class="card-header">
                <h3>投票選項</h3>
                <button type="button" mat-button color="primary" (click)="addOption()">
                  <mat-icon>add</mat-icon>
                  新增選項
                </button>
              </div>

              <div formArrayName="options" class="options-container">
                <div *ngFor="let option of optionsArray.controls; let i = index" 
                     [formGroupName]="i" 
                     class="option-item">
                  
                  <div class="option-header">
                    <h4>選項 {{ i + 1 }}</h4>
                    <button type="button" mat-icon-button color="warn" 
                            (click)="removeOption(i)" 
                            [disabled]="optionsArray.length <= 2">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="option-content">
                    <mat-form-field appearance="outline" class="option-text">
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
                             class="option-image">
                        
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
                              (click)="removeImage(i)">
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
            </div>

            <!-- Preview Section -->
            <div class="form-card" *ngIf="pollForm.valid">
              <h3>預覽</h3>
              <div class="preview-content">
                <h4>{{ pollForm.get('title')?.value || '投票標題' }}</h4>
                <p *ngIf="pollForm.get('description')?.value">
                  {{ pollForm.get('description')?.value }}
                </p>
                
                <div class="preview-options">
                  <div *ngFor="let option of optionsArray.controls; let i = index" 
                       class="preview-option">
                    <div class="preview-option-content">
                      <img *ngIf="optionImages[i]" 
                           [src]="optionImages[i]" 
                           [alt]="option.get('text')?.value"
                           class="preview-image">
                      <span>{{ option.get('text')?.value || '選項 ' + (i + 1) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Actions -->
            <div class="submit-actions">
              <button type="button" mat-button (click)="goBack()">
                取消
              </button>
              <button type="submit" 
                      mat-raised-button 
                      color="primary"
                      [disabled]="!pollForm.valid || isSubmitting">
                <mat-icon>create</mat-icon>
                {{ isSubmitting ? '創建中...' : '創建投票' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .create-poll-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 0;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
    }

    .back-button {
      margin-bottom: 16px;
    }

    .back-button button {
      color: white;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .header-info p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .form-section {
      padding: 32px 0;
    }

    .form-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .form-card {
      background: white;
      border-radius: 8px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-card h3 {
      margin: 0 0 24px 0;
      color: rgba(0,0,0,0.8);
      font-size: 1.3rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .card-header h3 {
      margin: 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .options-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .option-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background-color: #fafafa;
    }

    .option-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .option-header h4 {
      margin: 0;
      color: rgba(0,0,0,0.8);
    }

    .option-content {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: start;
    }

    .option-text {
      width: 100%;
    }

    .image-upload-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .upload-area {
      width: 120px;
      height: 120px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      overflow: hidden;
    }

    .upload-area:hover {
      border-color: #3f51b5;
      background-color: #f3f4ff;
    }

    .upload-area.has-image {
      border-style: solid;
      border-color: #3f51b5;
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #666;
      text-align: center;
    }

    .upload-placeholder mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .upload-placeholder span {
      font-size: 0.8rem;
    }

    .option-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
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

    .preview-content {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }

    .preview-content h4 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.8);
    }

    .preview-content p {
      margin: 0 0 16px 0;
      color: rgba(0,0,0,0.6);
      line-height: 1.5;
    }

    .preview-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-option {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
    }

    .preview-option-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .preview-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
    }

    .submit-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
    }

    .submit-actions button {
      padding: 12px 24px;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .header-content,
      .form-content {
        padding: 0 16px;
      }

      .header-info h1 {
        font-size: 2rem;
      }

      .form-card {
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

      .submit-actions {
        flex-direction: column;
      }

      .submit-actions button {
        width: 100%;
      }
    }
  `]
})
export class CreatePollComponent implements OnInit {
    pollForm: FormGroup;
    optionImages: (string | null)[] = [];
    isSubmitting = false;

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

            this.pollService.createPoll(pollData, images.length > 0 ? images : undefined).subscribe({
                next: (response) => {
                    this.snackBar.open('投票創建成功！', '關閉', { duration: 3000 });
                    this.router.navigate(['/polls', response.poll.id]);
                },
                error: (error) => {
                    console.error('Error creating poll:', error);
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