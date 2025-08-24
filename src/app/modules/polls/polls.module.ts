import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard } from '../../guards/auth.guard';

import { PollListComponent } from './components/poll-list/poll-list.component';
import { PollDetailComponent } from './components/poll-detail/poll-detail.component';
import { CreatePollComponent } from './components/create-poll/create-poll.component';
import { MyPollsComponent } from './components/my-polls/my-polls.component';
import { PollStatsComponent } from './components/poll-stats/poll-stats.component';

const routes: Routes = [
    {
        path: '',
        component: PollListComponent
    },
    {
        path: 'create',
        component: CreatePollComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'my',
        component: MyPollsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':id/stats',
        component: PollStatsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':pollId/options/:optionId',
        loadComponent: () => import('./components/option-detail/option-detail.component').then(m => m.OptionDetailComponent)
    },
    {
        path: ':id',
        component: PollDetailComponent
    }
];

@NgModule({
    declarations: [
        PollListComponent,
        PollDetailComponent,
        CreatePollComponent,
        MyPollsComponent,
        PollStatsComponent
    ],
    imports: [
        SharedModule,
        ReactiveFormsModule,
        NgChartsModule,
        RouterModule.forChild(routes)
    ]
})
export class PollsModule { }