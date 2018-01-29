import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, MenuController, AlertController, Platform, List} from 'ionic-angular';
import {Task} from '../../enitiy/task';
import {TaskList} from '../../providers/task-list';
import {TaskDetailPage} from '../task-detail/task-detail';
import { FilterPage } from '../filter-page/filter-page';
import { Storage } from '@ionic/storage';
import {Geolocation, PositionError, Geoposition } from 'ionic-native';

/*
  Generated class for the AssignTaskList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-assign-task-list',
  templateUrl: 'assign-task-list.html',
  providers: [TaskList]
})
export class AssignTaskListPage {
  @ViewChild(List) list: List;

  selectedTask: Task;
  TaskFull: Array<Task>;
  Tasks: Array<Task>;

  FilterChecked: Map<string, boolean>; 

  SortChecked: number = 0;
  SortOpt: string = "提交日期";

  ShopFilter: string = "全部";
  lat:number;
  long:number; 
  subscription: any;

  userID: number;
  userType: number;
  foreigncontractor: number;

  constructor(public menuCtrl: MenuController, public alertCtrl: AlertController,
      public navCtrl: NavController, navParams: NavParams, platform: Platform,
      public taskList :TaskList, public storage:Storage) {
    // If we navigated to this page, we will have an item available as a nav param
    platform.ready().then(() => {
      this.storage.get("USER").then(data=>{
        data = JSON.parse(data);
        this.userID = data["user_id"];
        this.userType = data["user_type"];
        this.foreigncontractor = data["foreigncontractor"];
      });
      /*
      Geolocation.getCurrentPosition().then((resp) => {
         this.lat  = resp.coords.latitude;
         this.long = resp.coords.longitude;
      }).catch((error) => {
      });

      let watch = Geolocation.watchPosition();
      this.subscription = watch.subscribe((data) => {
        if(data as Geoposition){
          let pos = (data as Geoposition);
          this.lat  = pos.coords.latitude;
          this.long = pos.coords.longitude;
        }else{
          let err = (data as PositionError);
        }
      });  
      */
    });
    
  }
  
  Bundle:{
    FilterChecked: Map<string, boolean>;

    SortChecked: number;
    SortOpt: string;
  }
  backup(){
    let temp = new Map(this.FilterChecked);
    temp['all'] = this.FilterChecked['all'];
    temp['shop'] = this.FilterChecked['shop'];
    temp['logi'] = this.FilterChecked['logi'];

    this.Bundle = {
      FilterChecked: temp,
      SortChecked: this.SortChecked,
      SortOpt: this.SortOpt
    };
  }
  restore(){
    this.FilterChecked['all'] = this.Bundle.FilterChecked['all'];
    this.FilterChecked['shop'] = this.Bundle.FilterChecked['shop'];
    this.FilterChecked['logi'] = this.Bundle.FilterChecked['logi'];

    this.SortChecked = this.Bundle.SortChecked;
    this.SortOpt = this.Bundle.SortOpt;
  }

  ionViewDidLoad(){
    console.log("ionViewDidLoad");
    this.FilterChecked = new Map();
    this.FilterChecked['all'] = true;
    this.FilterChecked['shop'] = false;
    this.FilterChecked['logi'] = false;
  }
  ionViewDidEnter(){
    if(this.Bundle)
      this.restore();
    this.storage.get("FILTER").then((shop)=>{
      this.ShopFilter = (shop) ? shop.shopCode + " " + shop.shopName : "全部" ;
    });
    this.taskList.getAllUserTaskList(this.userID, ()=>{
      this.TaskFull = this.taskList.currentTaskList; 
      this.Tasks = this.taskList.currentTaskList;

      this._sort(this.SortChecked);
      for(let l in this.FilterChecked){
        if(this.FilterChecked[l])
          this._filter(l);
      }
      (<HTMLElement> this.list._elementRef.nativeElement).style.display = "";
    });
  }
  ionViewDidLeave(){
    console.log("ionViewDidLeave");
    //this.subscription.unsubscribe();
    this.backup();
  }
  ionViewWillLeave(){
    //(<HTMLElement> this.list._elementRef.nativeElement).style.display = "none";
  }


  showFilterAlert(){
    console.log("showFilterAlert");
    let alert = this.alertCtrl.create();
    
    alert.setTitle("篩選");
    alert.addInput({ type: 'radio', label: '全部', checked: this.FilterChecked['all'],  value: 'all' });
    alert.addInput({ type: 'radio', label: '分店', checked: this.FilterChecked['shop'], value: 'shop' });
    alert.addInput({ type: 'radio', label: '後勤', checked: this.FilterChecked['logi'], value: 'logi' });

    alert.addButton('取消');
    alert.addButton({
      text: '確定',
      handler: (data) => {
        console.log(data);
        this.FilterChecked['all']  = false;
        this.FilterChecked['shop'] = false;
        this.FilterChecked['logi'] = false;

        this.FilterChecked[data] = true;
        this._filter(data);
      }
    });
    alert.present();
  }
  private _filter(opt: string){
    this.storage.get("FILTER").then((shop)=>{
      switch(opt){
        case 'all':
          this.Tasks = this.TaskFull;
          break;
        case 'shop':
          this.Tasks = this.taskList.FullList.filter( (value:Task) => { return value.isShop});
          break;
        case 'logi':
          this.Tasks = this.taskList.FullList.filter( (value:Task) => { return !value.isShop });
          break;
      }
      this._sort(this.SortChecked);
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
        parentNav: this.navCtrl
      },{
        animate: true,
        direction: "forward"
    });
  }

  refresh(){
    console.log("refresh");
    this.taskList.getAllUserTaskList(this.userID, ()=>{
      this.TaskFull = this.taskList.currentTaskList; 
      this.Tasks = this.taskList.currentTaskList;

      this._sort(this.SortChecked);
      for(let l in this.FilterChecked){
        if(this.FilterChecked[l])
          this._filter(l);
      }
      (<HTMLElement> this.list._elementRef.nativeElement).style.display = "";
    });
    
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

/*
  hideTabBar(){
    console.log("hideTabBar");
    let scrollEleList = document.getElementsByClassName("scroll-content");
    let scrollEle = <HTMLElement> scrollEleList[scrollEleList.length - 1];
    scrollEle.style.marginBottom = "0px";

    let tabBarElement = <HTMLElement> document.getElementsByClassName("tabbar")[0];
    let pos = 0
    let id = setInterval(frame, 1);
    function frame() {
      if (pos <= -60) {
        clearInterval(id);
      } else {
        pos -= 2; 
        tabBarElement.style.bottom = pos + 'px'; 
      }
    }
  }
  showTabBar(){
    console.log("showTabBar");
    function frame() {
      if (pos >= 0) {
        clearInterval(id);
      } else {
        pos += 2; 
        tabBarElement.style.bottom = pos + 'px'; 
      }
    }
    let tabBarElement = <HTMLElement> document.getElementsByClassName("tabbar")[0];
    let pos = -60
    let id = setInterval(frame, 1);
  }
*/
}
