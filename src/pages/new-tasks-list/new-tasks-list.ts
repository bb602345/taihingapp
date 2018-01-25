import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, MenuController, AlertController, Platform, List} from 'ionic-angular';
import {Task} from '../../enitiy/task';
import {TaskList} from '../../providers/task-list';
import {TaskDetailPage} from '../task-detail/task-detail';
import { Storage } from '@ionic/storage';
import { FilterPage } from '../filter-page/filter-page';

@Component({
  templateUrl: 'new-tasks-list.html',
  providers: [TaskList]
})


export class NewTaskListPage {
  @ViewChild(List) list: List;

  selectedTask: Task;
  TaskFull: Array<Task>;
  Tasks: Array<Task>;

  userID: number;
  FilterChecked: Map<string, boolean>; 

  ShopFilter: string = "全部";
  SortChecked: number = 0;
  SortOpt: string = "提交日期";

  lat:number;
  long:number; 
  subscription: any;

  constructor(public menuCtrl: MenuController, public alertCtrl: AlertController,
      public navCtrl: NavController, navParams: NavParams, platform: Platform,
      public taskList :TaskList, public storage:Storage) {
    // If we navigated to this page, we will have an item available as a nav param

    platform.ready().then(() => {
      this.storage.get("USER").then(data=>{
        data = JSON.parse(data);
        this.userID = data["user_id"];
        this.refresh(this.userID);
      });
      
    });
    
  }

  ionViewWillEnter(){
    if(this.userID != null)
      this.refresh(this.userID);
  }
  ionViewDidLoad(){
    console.log("ionViewDidLoad");
    this.FilterChecked = new Map();
    this.FilterChecked['all'] = true;
    this.FilterChecked['shop'] = false;
    this.FilterChecked['logi'] = false;
  }
  ionViewDidEnter(){
    this.storage.get("FILTER")
        .then(shop => this.ShopFilter = (shop) ? shop.shopCode + " " + shop.shopName : "全部");
  }
  ionViewDidLeave(){
    console.log("ionViewDidLeave");
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
    this._sort(opt);
  }
  private _sort(opt:number){
    this.Tasks.sort((a, b)=>{ 
      let comp1: number;
      let comp2: number;
      switch(opt){
        case 0:
          comp1 = Date.parse(b.input_date);
          comp2 = Date.parse(a.input_date);
          break;
        case 1:
          comp1 = this.calDistance(a.lat, a.long);
          comp2 = this.calDistance(b.lat, b.long);
          break;
        case 2:
          comp1 = a.important;
          comp2 = b.important;
          break;
      }
      return comp1 - comp2;
    });
  }
  private calDistance(lat: number, long:number): number{
    let d = 0;
    d = Math.pow(this.lat - lat, 2) + Math.pow(this.long - long, 2);
    d = Math.sqrt(d);
    return d;
  }

  taskTapped(event, task) {
      this.navCtrl.push(TaskDetailPage, {
        task: task,
        parentNav: this.navCtrl,
        delegate: this
      });
  }

  refresh(userID: number){
    console.log("refresh");
    this.taskList.getUserTaskList(userID, ()=>{
      this.TaskFull = this.taskList.currentTaskList; 
      this.Tasks = this.taskList.currentTaskList;

      this._sort(this.SortChecked);
      (<HTMLElement> this.list._elementRef.nativeElement).style.display = "";
    });
    
  }

  doRefresh(refresher){
    this.refresh(this.userID);
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

 