import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Geolocation, PositionError, Geoposition } from 'ionic-native';
import { Task } from '../enitiy/task';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

/*
  Generated class for the TaskList provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class TaskList {
  currentTaskList: Array<Task>;
  FullList: Array<Task>;
  index: number;
  lat : number;
  lon: number;
  constructor(private http: Http, private storage: Storage) { 
    this.initGeolocation()
  }

  getUserTaskList(userId: number, callBack: Function){
    let link = 'http://taihingroast.com/soap/RepairTask/getRepairTaskList.php?uid=' + userId;
    this.http.get(link)
    //this.http.get('http://taihingroast.com/soap/RepairTask/getRepairTaskList.php?uid=' + 438)
    .map(res => res.json())
    .subscribe(data => {
        this.currentTaskList = [];
        this.FullList = [];
        this.FetchTask(data, 1, callBack);
    },
    err => console.log("HEEE:", err));
  }

  getAllUserTaskList(callBack: Function){
    this.http.get('http://taihingroast.com/soap/RepairTask/getRepairTaskList.php')
    .map(res => res.json())
    .subscribe(data => {
        this.currentTaskList = [];
        this.FullList = [];
        this.FetchTask(data, 2, callBack);
    },
    err => {
        //console.log("HEEE:", err);
    });
  }

  fetchUnhandleTaskList(): Promise<Task[]>{
    return new Promise<Task[]>((resolve, reject)=>{
      this.currentTaskList = this.FullList.slice(0, this.index * 20);
      resolve(this.currentTaskList);
      console.log(this.currentTaskList.length);
      this.index++;
    });
  }
  getUnhandleTaskList(): Promise<Task[]>{
    let h = this.http;
    this.index = 1;
    return new Promise<Task[]>((resolve, reject)=>{
      h.get('http://taihingroast.com/soap/RepairTask/getUnhandleTaskList.php')
        .map(res => res.json())
        .subscribe(data => {
          this.FullList = [];
          this.currentTaskList = [];
          this.FetchTask(data, 0, ()=>{
            this.currentTaskList = this.FullList.slice(0, this.index * 20);
            this.index++;
            resolve(this.currentTaskList);
          });
        },
        err => {
          reject(err);
        });  
    });
  }
  SortTaskList(SortOpt: number): Promise<Task[]>{
    this._sort(SortOpt);
    return new Promise<Task[]>((resolve, reject)=>{
      this.currentTaskList = [];
      this.currentTaskList = this.FullList.slice(0, this.index * 20);
      resolve(this.currentTaskList);
    });
  }
  ApplyTask(TaskID: number, userID: number): Promise<number>{
    let h = this.http;
    let resp: Promise<number> = new Promise<number>( (resolve, reject)=>{
      let link = "http://taihingroast.com/soap/RepairTask/applyTask.php";
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      let data = JSON.stringify({ sql_id: TaskID, user_id: userID });

      h.post(link, data, options)
        .map(res => res.json())
        .subscribe(
          data => resolve(data.result), 
          err  => reject(err)
       );
    });
    return resp;
  }

  private _sort(opt:number){
    this.FullList.sort((a, b)=>{ 
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
    let lat2, long2: number;
    d = Math.pow(this.lat - lat, 2) + Math.pow(this.lon - long, 2);
    d = Math.sqrt(d);
    return d;
  }
  private FetchTask(taskList, status, callBack?: Function){
    this.storage.get("FILTER").then((shop)=>{
      taskList.forEach(task => {
        task["status"] = status;
        let t = new Task(task);
        if(!shop || shop.shopCode == "全部"){
          this.FullList.push(t);
          this.currentTaskList.push(t);
        }else if(shop.shopCode == "後勤" && !t.isShop){
          this.FullList.push(t);
          this.currentTaskList.push(t);
        }else if(t.shop_code == shop.shopCode){
          this.FullList.push(t);
          this.currentTaskList.push(t);
        }
      });
      if(callBack != null)
        callBack();
    });
  }
  private initGeolocation(){
    let watch = Geolocation.watchPosition();
    watch.subscribe((data) => {
      if(data as Geoposition){
        let pos = (data as Geoposition);
        this.lat = pos.coords.latitude;
        this.lon = pos.coords.longitude;
        console.log("LAT::", pos.coords.latitude);
        console.log("LON::", pos.coords.longitude);
      }else{
        let err = (data as PositionError);
      }
    });
  }
  
}

