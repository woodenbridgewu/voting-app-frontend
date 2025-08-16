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
            
            <div class="results-grid">
              <div *ngFor="let option of stats.optionStats; let i = index" 
                   class="result-card"
                   [class.winner]="isWinner(option)">
                
                <div class="result-image-container">
                  <img 
                    [src]="option.imageUrl || '/assets/default-option-image.svg'" 
                    [alt]="option.text"
                    class="result-image">
                  <div class="rank-badge">{{ i + 1 }}</div>
                  <div class="winner-badge" *ngIf="isWinner(option)">
                    <mat-icon>emoji_events</mat-icon>
                  </div>
                </div>
                
                <div class="result-content">
                  <div class="result-header">
                    <h4>{{ option.text }}</h4>
                    <div class="vote-details">
                      <div class="vote-count">
                        <mat-icon>how_to_vote</mat-icon>
                        <span>{{ option.voteCount }} 票</span>
                      </div>
                      <div class="percentage">
                        <mat-icon>pie_chart</mat-icon>
                        <span>{{ option.percentage }}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="result-progress">
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
      background-color: var(--background-light);
    }

    .loading-section {
      padding: 64px 0;
      text-align: center;
    }

    .header-section {
      background-color: var(--background-white);
      color: var(--text-primary);
      padding: 32px 0;
      border-bottom: 1px solid var(--border-color);
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
      color: var(--text-secondary);
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
      color: var(--text-primary);
    }

    .header-info p {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-secondary);
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
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: var(--background-white);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-color);
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
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .charts-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 32px;
    }

    .chart-card {
      background: var(--background-white);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
    }

    .chart-card h3 {
      margin: 0 0 24px 0;
      color: var(--text-primary);
      font-size: 1.3rem;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }

    .result-card {
      background: var(--background-white);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-light);
      transition: all 0.3s ease;
      border: 2px solid var(--border-color);
    }

    .result-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-medium);
    }

    .result-card.winner {
      border-color: #ffd700;
      background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
    }

    .result-image-container {
      position: relative;
      height: 180px;
      overflow: hidden;
    }

    .result-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .rank-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1rem;
      box-shadow: var(--shadow-medium);
    }

    .winner-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 215, 0, 0.9);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-medium);
    }

    .winner-badge mat-icon {
      color: #b8860b;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .result-content {
      padding: 20px;
    }

    .result-header {
      margin-bottom: 16px;
    }

    .result-header h4 {
      margin: 0 0 12px 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }

    .vote-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .vote-count,
    .percentage {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .vote-count mat-icon,
    .percentage mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary-color);
    }

    .percentage {
      font-weight: bold;
      color: var(--primary-color);
    }

    .result-progress {
      margin-top: 12px;
    }

    .daily-table {
      background: var(--background-white);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-light);
      border: 1px solid var(--border-color);
    }

    .daily-table .table-header {
      grid-template-columns: 1fr 100px 100px;
    }

    .daily-table .table-row {
      grid-template-columns: 1fr 100px 100px;
    }

    .table-header {
      display: grid;
      grid-template-columns: 1fr 100px 100px;
      background-color: var(--background-light);
      border-bottom: 1px solid var(--border-color);
    }

    .header-cell {
      padding: 16px;
      font-weight: bold;
      color: var(--text-primary);
      border-right: 1px solid var(--border-color);
    }

    .header-cell:last-child {
      border-right: none;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 100px 100px;
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.2s;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background-color: var(--background-light);
    }

    .table-cell {
      padding: 16px;
      display: flex;
      align-items: center;
      border-right: 1px solid var(--border-color);
    }

    .table-cell:last-child {
      border-right: none;
    }

    .date {
      font-weight: 500;
    }

    .cumulative {
      font-weight: bold;
      color: #4caf50;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
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
      color: var(--text-secondary);
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
      color: var(--text-primary);
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

      .results-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .result-image-container {
        height: 150px;
      }

      .result-content {
        padding: 16px;
      }

      .vote-details {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .table-header,
      .table-row {
        grid-template-columns: 1fr 80px 80px;
        font-size: 0.9rem;
      }

      .table-cell {
        padding: 12px 8px;
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