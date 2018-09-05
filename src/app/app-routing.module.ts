import { NgModule } from '@angular/core';
import {RouterModule,Routes,CanActivate} from '@angular/router';

import {LoginComponent} from './login/login.component'
import {MainPanelComponent} from './main-panel/main-panel.component'
import { AuthorizeComponent } from './authorize/authorize.component';
import {AuthGuardService as AuthGuard} from './auth-guard.service'
const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'rediscover', component: MainPanelComponent,canActivate: [AuthGuard]},
  {path: 'callback', component: AuthorizeComponent},
  {path: '', component: LoginComponent}

]
@NgModule({
  exports:[RouterModule],
  imports:[RouterModule.forRoot(routes)]
})
export class AppRoutingModule { 
  constructor() {
    
  }
}
