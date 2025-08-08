import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PollService, PollStats } from '../../../../services/poll.service';

@Component({
    selector: 'app-poll-stats',
    template: `
    <div class="poll-stats-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-section">
        <app-loading-spinner message="載入統計資料中..."></app-loading-spinner>
      </div>

      <!-- Stats Content -->
      <div *ngIf="!isLoading && stats" class="stats-content">
        <!-- Header Section -->
        <div class="header-section">
          <div class="header-content">
            <div class="back-button">
              <button mat-icon-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
            
            <div class="header-info">
              <h1>{{ stats.pollTitle }}</h1>
              <p>投票統計分析</p>
            </div>
          </div>
        </div>

        <!-- Overview Stats -->
        <div class="overview-section">
          <div class="overview-content">
            <h3>總覽統計</h3>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalStats.uniqueVoters }}</div>
                  <div class="stat-label">參與人數</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <mat-icon>how_to_vote</mat-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.totalStats.totalVotes }}</div>
                  <div class="stat-label">總投票數</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <mat-icon>schedule</mat-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatDate(stats.totalStats.firstVote) }}</div>
                  <div class="stat-label">首次投票</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <mat-icon>update</mat-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ formatDate(stats.totalStats.lastVote) }}</div>
                  <div class="stat-label">最後投票</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="charts-content">
            <!-- Pie Chart -->
            <div class="chart-card">
              <h3>選項投票分布</h3>
              <div class="chart-container">
                <canvas baseChart
                  [data]="pieChartData"
                  [type]="pieChartType"
                  [options]="pieChartOptions">
                </canvas>
              </div>
            </div>

            <!-- Bar Chart -->
            <div class="chart-card">
              <h3>每日投票趨勢</h3>
              <div class="chart-container">
                <canvas baseChart
                  [data]="barChartData"
                  [type]="barChartType"
                  [options]="barChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Results -->
        <div class="results-section">
          <div class="results-content">
            <h3>詳細結果</h3>
            
            <div class="results-table">
              <div class="table-header">
                <div class="header-cell">排名</div>
                <div class="header-cell">選項</div>
                <div class="header-cell">票數</div>
                <div class="header-cell">百分比</div>
                <div class="header-cell">進度條</div>
              </div>

              <div *ngFor="let option of stats.optionStats; let i = index" 
                   class="table-row"
                   [class.winner]="isWinner(option)">
                <div class="table-cell rank">
                  <div class="rank-number">{{ i + 1 }}</div>
                  <div class="winner-badge" *ngIf="isWinner(option)">
                    <mat-icon>emoji_events</mat-icon>
                  </div>
                </div>
                
                <div class="table-cell option">
                  <div class="option-content">
                    <img *ngIf="option.imageUrl" 
                         [src]="option.imageUrl" 
                         [alt]="option.text"
                         class="option-image">
                    <span class="option-text">{{ option.text }}</span>
                  </div>
                </div>
                
                <div class="table-cell votes">
                  {{ option.voteCount }} 票
                </div>
                
                <div class="table-cell percentage">
                  {{ option.percentage }}%
                </div>
                
                <div class="table-cell progress">
                  <div class="progress-bar">
                    <div class="progress-fill" 
                         [style.width.%]="option.percentage">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily Stats Table -->
        <div class="daily-stats-section">
          <div class="daily-stats-content">
            <h3>每日投票統計</h3>
            
            <div class="daily-table">
              <div class="table-header">
                <div class="header-cell">日期</div>
                <div class="header-cell">投票數</div>
                <div class="header-cell">累計投票數</div>
              </div>

              <div *ngFor="let day of stats.dailyStats; let i = index" 
                   class="table-row">
                <div class="table-cell date">
                  {{ formatDate(day.date) }}
                </div>
                <div class="table-cell votes">
                  {{ day.voteCount }} 票
                </div>
                <div class="table-cell cumulative">
                  {{ getCumulativeVotes(i) }} 票
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !stats" class="error-state">
        <mat-icon>error</mat-icon>
        <h3>無法載入統計資料</h3>
        <p>統計資料可能不存在或您沒有權限查看</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          返回投票
        </button>
      </div>
    </div>
  `,
    styles: [`
    .poll-stats-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 0;
    }

    .header-content {
      max-width: 1200px;
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

    .overview-section,
    .charts-section,
    .results-section,
    .daily-stats-section {
      padding: 32px 0;
    }

    .overview-content,
    .charts-content,
    .results-content,
    .daily-stats-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .overview-content h3,
    .charts-content h3,
    .results-content h3,
    .daily-stats-content h3 {
      margin: 0 0 24px 0;
      color: rgba(0,0,0,0.8);
      font-size: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: rgba(0,0,0,0.8);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.6);
    }

    .charts-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 32px;
    }

    .chart-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-card h3 {
      margin: 0 0 24px 0;
      color: rgba(0,0,0,0.8);
      font-size: 1.3rem;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .results-table,
    .daily-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .table-header {
      display: grid;
      grid-template-columns: 80px 1fr 100px 100px 200px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .daily-table .table-header {
      grid-template-columns: 1fr 100px 100px;
    }

    .header-cell {
      padding: 16px;
      font-weight: bold;
      color: rgba(0,0,0,0.8);
      border-right: 1px solid #e0e0e0;
    }

    .header-cell:last-child {
      border-right: none;
    }

    .table-row {
      display: grid;
      grid-template-columns: 80px 1fr 100px 100px 200px;
      border-bottom: 1px solid #e0e0e0;
      transition: background-color 0.2s;
    }

    .daily-table .table-row {
      grid-template-columns: 1fr 100px 100px;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background-color: #f8f9fa;
    }

    .table-row.winner {
      background-color: #fffbf0;
      border-left: 4px solid #ffd700;
    }

    .table-cell {
      padding: 16px;
      display: flex;
      align-items: center;
      border-right: 1px solid #e0e0e0;
    }

    .table-cell:last-child {
      border-right: none;
    }

    .rank {
      justify-content: center;
      position: relative;
    }

    .rank-number {
      font-weight: bold;
      color: #3f51b5;
    }

    .winner-badge {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .winner-badge mat-icon {
      color: #ffd700;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .option-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
    }

    .option-text {
      font-weight: 500;
    }

    .votes,
    .percentage {
      font-weight: bold;
      color: #3f51b5;
    }

    .progress {
      padding: 16px 24px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3f51b5, #667eea);
      transition: width 0.3s ease;
    }

    .date {
      font-weight: 500;
    }

    .cumulative {
      font-weight: bold;
      color: #4caf50;
    }

    .error-state {
      text-align: center;
      padding: 64px 24px;
      color: rgba(0,0,0,0.6);
    }

    .error-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .error-state h3 {
      margin: 0 0 8px 0;
      color: rgba(0,0,0,0.8);
    }

    .error-state p {
      margin: 0 0 24px 0;
    }

    @media (max-width: 768px) {
      .header-content,
      .overview-content,
      .charts-content,
      .results-content,
      .daily-stats-content {
        padding: 0 16px;
      }

      .header-info h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .charts-content {
        grid-template-columns: 1fr;
        gap: 24px;
      }

      .chart-container {
        height: 250px;
      }

      .table-header,
      .table-row {
        grid-template-columns: 60px 1fr 80px 80px 120px;
        font-size: 0.9rem;
      }

      .daily-table .table-header,
      .daily-table .table-row {
        grid-template-columns: 1fr 80px 80px;
      }

      .table-cell {
        padding: 12px 8px;
      }

      .option-image {
        width: 30px;
        height: 30px;
      }
    }
  `]
})
export class PollStatsComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    stats: PollStats | null = null;
    isLoading = false;

    // Pie Chart Configuration
    pieChartType: ChartType = 'pie';
    pieChartData: ChartData<'pie'> = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                '#3f51b5',
                '#667eea',
                '#764ba2',
                '#f093fb',
                '#f5576c',
                '#4facfe',
                '#00f2fe',
                '#43e97b'
            ]
        }]
    };
    pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} 票 (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Bar Chart Configuration
    barChartType: ChartType = 'bar';
    barChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: '#3f51b5',
            borderColor: '#667eea',
            borderWidth: 1
        }]
    };
    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} 票`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private pollService: PollService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const pollId = params['id'];
            if (pollId) {
                this.loadPollStats(pollId);
            }
        });
    }

    loadPollStats(pollId: string) {
        this.isLoading = true;
        this.pollService.getPollStats(pollId).subscribe({
            next: (stats) => {
                this.stats = stats;
                this.updateCharts();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading poll stats:', error);
                this.isLoading = false;
                this.snackBar.open('載入統計資料失敗', '關閉', { duration: 3000 });
            }
        });
    }

    updateCharts() {
        if (!this.stats) return;

        // Update Pie Chart
        this.pieChartData.labels = this.stats.optionStats.map(option => option.text);
        this.pieChartData.datasets[0].data = this.stats.optionStats.map(option => option.voteCount);

        // Update Bar Chart
        this.barChartData.labels = this.stats.dailyStats.map(day => 
            new Date(day.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
        );
        this.barChartData.datasets[0].data = this.stats.dailyStats.map(day => day.voteCount);

        // Trigger chart update
        if (this.chart) {
            this.chart.update();
        }
    }

    isWinner(option: any): boolean {
        if (!this.stats) return false;
        const maxVotes = Math.max(...this.stats.optionStats.map(opt => opt.voteCount));
        return option.voteCount === maxVotes && option.voteCount > 0;
    }

    getCumulativeVotes(index: number): number {
        if (!this.stats) return 0;
        return this.stats.dailyStats
            .slice(0, index + 1)
            .reduce((sum, day) => sum + day.voteCount, 0);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    goBack() {
        this.router.navigate(['/polls']);
    }
} 