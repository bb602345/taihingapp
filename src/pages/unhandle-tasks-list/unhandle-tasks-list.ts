import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, MenuController, AlertController, Platform, List} from 'ionic-angular';
import {Task} from '../../enitiy/task';
import {TaskList} from '../../providers/task-list';
import {TaskDetailPage} from '../task-detail/task-detail';
import {Geolocation, PositionError, Geoposition } from 'ionic-native';
import { FilterPage } from '../filter-page/filter-page';
import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'unhandle-tasks-list.html',
  providers: [TaskList]
})

export class UnhandleTasksListPage {
  @ViewChild(List) list: List;

  repairType: string = "all";
  search: string = "";
  
  selectedTask: Task;
  Tasks: Array<Task>;

  ShopFilter: string = "全部";
  SortChecked  : number = 0;
  SortOpt: string = "提交日期";

  userID: number;
  userType: number;
  foreigncontractor: number;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public taskList :TaskList, 
              public alertCtrl: AlertController, 
              public platform: Platform, 
              public storage: Storage) {
    this.selectedTask = navParams.get('item');
    platform.ready().then(() => {
      this.storage.get("USER").then(data=>{
        data = JSON.parse(data);
        this.userID = data["user_id"];
        this.userType = data["user_type"];
        this.foreigncontractor = data["foreigncontractor"];
      });
      
    });
  }
  ionViewWillEnter(){
    this.taskList.getUnhandleTaskList(this.userID)
        .then(data => this.Tasks = data );
    
  }
  ionViewDidEnter(){
    this.storage.get("FILTER").then((shop)=>{
      this.ShopFilter = (shop) ? shop.shopCode + " " + shop.shopName : "全部" ;
    });
  }

  showSortAlert(){
    this.SortChecked += 1;
    if(this.SortChecked > 2 ){
      this.SortChecked = 0;
    }

    let opt = this.SortChecked;
    switch(opt){
      case 0:
        this.SortOpt = "提交日期";
        break;
      case 1:
        this.SortOpt = "地點";
        break;
      case 2:
        this.SortOpt = "重要性";
        break;
    }
    this.taskList.SortTaskList(opt).then(data => this.Tasks = data);
  }


  taskTapped(event, task) {
      this.navCtrl.push(TaskDetailPage, {
        task: task,
        parentNav: this.navCtrl
      });
  }

  doInfinite(infiniteScroll) {
    if(this.Tasks.length >= this.taskList.FullList.length){
      infiniteScroll.complete();
      return;
    }

    setTimeout(() => {
      this.taskList.fetchUnhandleTaskList()
          .then(data => this.Tasks = data);
      infiniteScroll.complete();
    }, 500)
    
  }
  

  refresh(){
    console.log("doRefresh");
    this.taskList.getUnhandleTaskList(this.userID)
        .then(data => {
          this.Tasks = data;
          this.taskList.SortTaskList(this.SortChecked).then(data => this.Tasks = data);
        })
        .catch(err => console.log(err));
  }
  doRefresh(refresher){
    this.refresh();
    setTimeout(() => {
      refresher.complete();
    }, 500);
  }


  clickSearch(){
    this.navCtrl.push(FilterPage, {
      parentDelegate: this
    });
  }

}