import {NavController, NavParams} from 'ionic-angular';
import {ViewController, Platform} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';
import {Tabs, Tab} from 'ionic-angular';
import { Storage } from '@ionic/storage';

import {TestingPage} from '../testing-page/testing-page';
import {NewTaskListPage} from '../new-tasks-list/new-tasks-list';
import {UnhandleTasksListPage} from '../unhandle-tasks-list/unhandle-tasks-list';
import {AssignTaskListPage} from '../assign-task-list/assign-task-list';


@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  @ViewChild('tabsCtrl') tabRef: Tabs;

  tab1 = NewTaskListPage;
  tab2 = UnhandleTasksListPage;
  tab3 = AssignTaskListPage;

  userPermission: string;
  showTab2: boolean;
  showTab3: boolean;

  constructor(public platform: Platform, public storage: Storage){

    platform.ready().then(() => {
      this.storage.get("USER").then(data => {
        console.log(data);
        data = JSON.parse(data);
        this.userPermission = data["user_type"];
        switch(this.userPermission){
            case "0":
              this.showTab2 = false;
              this.showTab3 = false;
              break;
            case "1":
              this.showTab2 = true;
              this.showTab3 = false;
              break;
            case "2":
              this.showTab2 = true;
              this.showTab3 = true;
              break;
        }
      });
    });
    
  }
  
}