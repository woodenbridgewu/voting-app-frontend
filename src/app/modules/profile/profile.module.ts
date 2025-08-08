import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AuthGuard } from '../../guards/auth.guard';

import { ProfileComponent } from './components/profile/profile.component';
import { VoteHistoryComponent } from './components/vote-history/vote-history.component';

const routes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'history',
        component: VoteHistoryComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    declarations: [
        ProfileComponent,
        VoteHistoryComponent
    ],
    imports: [
        SharedModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ]
})
export class ProfileModule { } 