import { NgModule } from '@angular/core';
import {RouterModule,Routes} from '@angular/router';

import {LoginComponent} from './login/login.component'
import {MainPanelComponent} from './main-panel/main-panel.component'
import { AuthorizeComponent } from './authorize/authorize.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'main', component: MainPanelComponent},
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
