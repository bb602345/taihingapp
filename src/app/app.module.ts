import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { Storage } from '@ionic/storage';
import { Firebase } from '@ionic-native/firebase';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login-page/login-page';
import { TaskDetailPage } from '../pages/task-detail/task-detail';
import { NewTaskListPage } from '../pages/new-tasks-list/new-tasks-list';
import { UnhandleTasksListPage } from '../pages/unhandle-tasks-list/unhandle-tasks-list';
import { DrawingPage } from '../pages/drawing-page/drawing-page';
import { AssignTaskListPage } from '../pages/assign-task-list/assign-task-list';
import { FilterPage } from '../pages/filter-page/filter-page';
import { RepairPartsPage} from '../pages/repair-parts/repair-parts';


@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    LoginPage,
    TaskDetailPage,
    NewTaskListPage,
    UnhandleTasksListPage,
    AssignTaskListPage,
    DrawingPage,
    FilterPage,
    RepairPartsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    LoginPage,
    TaskDetailPage,
    NewTaskListPage,
    UnhandleTasksListPage,
    AssignTaskListPage,
    DrawingPage,
    FilterPage,
    RepairPartsPage
  ],
  providers: [
    Firebase,
    Storage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
