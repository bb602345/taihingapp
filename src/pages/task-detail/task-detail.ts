import { NavController, NavParams } from 'ionic-angular';
import { ViewController, Platform } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { Task } from '../../enitiy/task';
import { FollowerList } from '../../providers/follower-list';
import { TaskImage } from '../../providers/task-image';
import { TaskList } from '../../providers/task-list';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Camera } from 'ionic-native';
import { DrawingPage } from '../drawing-page/drawing-page';
import { RepairPartsPage } from '../repair-parts/repair-parts';
import { NewTaskListPage } from '../new-tasks-list/new-tasks-list';

@Component({
  templateUrl: 'task-detail.html',
  providers: [FollowerList, TaskImage, TaskList]
})

export class TaskDetailPage {
  selectedTask: Task;
  TaskStatus: number = 1;
  closeDate: string;
  device_num: string;
  followed_results: string;
  follower_remarks: string;
  replied: string;
  telHREF: string;
  RepairPrice: number;
  
  fRow0: Array<Array<any>>;
  fRow1: Array<Array<any>>;

  followerAssign: Array<boolean>;
  contractorAssign: Array<boolean>;

  userID: number;
  userType: number;
  followerIdList: Array<number>;
  Parent: any;

  private imageDataURL: string;
  public set data(d: string){
    this.imageDataURL = d;
    if(d != null && d != ""){
      document.getElementById("lb-upload-photo").innerHTML = "已儲存";
    }else{
      document.getElementById("lb-upload-photo").innerHTML = "";
    }
  }

  private partsData: {Parts: Array<any>, Total: any};
  public set parts(p: {Parts: Array<any>, Total: any}){
    if(p.Parts == null) return;
    console.log(p);
    this.partsData = p;
    if(p.Parts.length >= 1){
      document.getElementById("lb-repair-parts").innerHTML = "$" + p.Total;
    }else{
      document.getElementById("lb-repair-parts").innerHTML = "";
    }
  }
  

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public http:Http, 
              public alertCtrl: AlertController, 
              public storage: Storage, 
              public followerList :FollowerList, 
              public taskImage: TaskImage, 
              public taskList: TaskList,
              public loadCtrl: LoadingController) {
    this.imageDataURL = "";
    this.selectedTask = navParams.get('task');
    this.Parent = navParams.get('delegate');

    this.TaskStatus = this.selectedTask.status;
    this.followed_results = this.selectedTask.followed_results;
    this.follower_remarks = this.selectedTask.follower_remarks;
    this.telHREF = "tel:" + this.selectedTask.shop_tel;
    this.RepairPrice = this.selectedTask.repair_price;
    this.fRow0 = new Array();
    this.fRow1 = new Array();
    this.followerAssign = new Array();
    this.contractorAssign = new Array();

    storage.get("USER").then((val)=>{
      let data = JSON.parse(val);
      this.userID = data.user_id;
      this.userType = data.user_type;
    });
  }

  ionViewWillEnter(){
    this.storage.get("USER").then((val)=>{
      let data = JSON.parse(val);
      this.userID = data.user_id;
      this.userType = data.user_type;
      if(this.userType < 2) return;

      if(this.TaskStatus == 2){
        this.followerList.getTaskFollower(this.selectedTask.sql_id, (followerIdList)=>{
          this.followerIdList = followerIdList;
          this.initFollowerList();
        });
      }else{
          this.initFollowerList();
      }
    });
  }

  initFollowerList(){
    this.followerList.getFollowerList(()=>{
      let fList = this.followerList.FollowerList;

      let fRow0 = fList.filter((value)=>{ return value.type == 0; })
      let fRow1 = fList.filter((value)=>{ return value.type == 1; })

      var row: Array<any>;
      for(let i=0;i<fRow0.length;i++){
        if(i % 3 == 0)
          row = new Array<any>();

        if(this.TaskStatus == 2){
          if(this.followerIdList.indexOf(fRow0[i]["int_id"]) >= 0){
            fRow0[i]["checked"] = true;
            this.followerAssign[fRow0[i]["int_id"]] = true;
          }
        }
        row.push(fRow0[i]);

        if(row.length == 3 || i + 1 == fRow0.length)
          this.fRow0.push(row);
      }
      
      for(let i=0;i<fRow1.length;i++){
        if(i % 3 == 0)
          row = new Array<any>();
        
        if(this.TaskStatus == 2){
          if(this.followerIdList.indexOf(fRow1[i]["int_id"]) >= 0){
            fRow1[i]["checked"] = true;
            this.contractorAssign[fRow1[i]["int_id"]] = true;
          }
        }
        row.push(fRow1[i]);

        if(row.length == 3 || i + 1 == fRow1.length)
          this.fRow1.push(row);
      }
    });
  }
  ionViewDidLoad(){
    if(this.TaskStatus == 0 || this.TaskStatus == 2) return;
    if(this.selectedTask.close_date != null && this.selectedTask.close_date != ""){
      this.closeDate = this.selectedTask.close_date.split(" ")[0];
    }else{
       let mm = new Date().getMonth() + 1; // getMonth() is zero-based
       let dd = new Date().getDate();
       let date = [new Date().getFullYear(), (mm>9 ? '' : '0') + mm,  (dd>9 ? '' : '0') + dd ].join('-');

      this.closeDate = date;
      let datetime   = document.getElementById('closeDate');
      let dtText     = datetime.getElementsByClassName('datetime-text').item(0);
      dtText.innerHTML = "";
    }

    this.parts = { Parts: this.selectedTask.Parts, Total: this.selectedTask.PartsTotal };
    this.taskImage.getImageByTaskID(this.selectedTask.sql_id, 
      (dataURL)=>{
        this.data = dataURL;
    });
    
  }

  updateFolloweResult(){
    let loading = this.loadCtrl.create({content: "請稍侯"});
    loading.present();

    let datetime = document.getElementById('closeDate');
    let dtText   = datetime.getElementsByClassName('datetime-text').item(0);

    this.selectedTask.device_num = this.device_num;
    this.selectedTask.followed_results = this.followed_results;
    this.selectedTask.follower_remarks = this.follower_remarks;
    this.selectedTask.close_date = (dtText.innerHTML == "") ? "" : this.closeDate;
    this.selectedTask.replied = this.replied ? 1 : 0;

    let link = "http://taihingroast.com/soap/RepairTask/updateTaskInfo.php";
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let data = JSON.stringify({
        sql_id: this.selectedTask.sql_id,
        device_num: this.selectedTask.device_num,
        followedResult: this.getTextWithEncode(this.selectedTask.followed_results),
        followerRemark: this.getTextWithEncode(this.selectedTask.follower_remarks),
        replied: this.selectedTask.replied,
        closeDate: this.selectedTask.close_date,
        dataURL: this.imageDataURL,
        repairPrice: this.RepairPrice,
        partsData: this.partsData?this.partsData.Parts:null,
        userID: this.userID
    });
    this.http.post(link, data, options).subscribe(resp => {
      console.log(resp.text());
      let title = "";
      let button: {text: string, handler:() => void};
      if(resp.text().trim() == "1"){
        title = "更新成功";
        button = 
        { 
          text: '確定',
          handler:()=>{ 
            this.navCtrl.pop(); 
            let l = this.Parent as NewTaskListPage;
          } 
        }
      }else{
        title = "更新失敗，請重試";
        button = { text: '確定', handler:()=>{ } }
      }

      loading.dismiss();
      this.alertCtrl.create({
        title: title,
        buttons: [button]
      }).present();
    })
    
  }
  getTextWithEncode(text:string) : any{
    let a: {text: string, charCode: Array<string>};
    
    let title = encodeURIComponent(text);

    let cArray = new Array<string>();
    for(let i=0;i<text.length;i++){
      let l = this.toUTF16(text.codePointAt(i));
      if(l.substring(0, 5) == "55357" || l.substring(0, 5) == "55358" || l.substring(0, 5) == "55356"){
        l = l.substring(0, 5) + ";&#" + l.substring(5);
        i++;
      }
      console.log(l);
      cArray.push(l);
    }
    a = {
      text: title,
      charCode: cArray
    }
    return a;
  }
  toUTF16(codePoint) {
    let TEN_BITS = parseInt('1111111111', 2);
    function u(codeUnit) {
      return codeUnit.toString(10).toUpperCase();
    }

    if (codePoint <= 0xFFFF) {
      return u(codePoint);
    }
    codePoint -= 0x10000;
    let leadSurrogate = 0xD800 + (codePoint >> 10);
    let tailSurrogate = 0xDC00 + (codePoint & TEN_BITS);

    return u(leadSurrogate) + u(tailSurrogate);
  }

  followTask(){
    let loading = this.loadCtrl.create({content: "請稍侯"});
    loading.present();

    let title = "";
    let button: {text: string, handler:() => void};

    this.taskList.ApplyTask(this.selectedTask.sql_id, this.userID)
        .then (resp => {
          if(resp == 1){
            title = `編號: ${this.selectedTask.case_num}，已成功領取`;
            button = { text: '確定', handler:()=>{ this.navCtrl.pop(); } }
          }else{
            title = "領取失敗，請重試";
            button = { text: '確定', handler:()=>{ } }
          }

          loading.dismiss();
          let alert = this.alertCtrl.create({
            title: title,
            buttons: [button]
          });
          alert.present();
        })
        .catch(err  => console.log(err));
  }
  assignFollower(){
    let loading = this.loadCtrl.create({content: "請稍侯"});
    loading.present();

    let link = "http://taihingroast.com/soap/RepairTask/assignToFollower.php";
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let data = JSON.stringify({
      taskID: this.selectedTask.sql_id,
      followerList: this.followerAssign,
      contractorList: this.contractorAssign
    });

    this.http.post(link, data, options).subscribe(resp => {
      let title = "";
      let button: {text: string, handler:() => void};

      console.log(resp.text().length);
      if(resp.text().trim() == "1"){
        title = "更新成功";
        button = { text: '確定', handler:()=>{ this.navCtrl.pop(); } }
      }else{
        title = "更新失敗，請重試";
        button = { text: '確定', handler:()=>{ } }
      }

      loading.dismiss();
      let alert = this.alertCtrl.create({
        title: title,
        buttons: [button]
      });
      alert.present();
    });
  }

  clearDate(){
    let datetime = document.getElementById('closeDate');
    let dtText   = datetime.getElementsByClassName('datetime-text').item(0);
    dtText.innerHTML = "";
  }

  alertInfo(text){
    let alert = this.alertCtrl.create({
          title: text,
          buttons: ['確定']
        });
    alert.present();
  }

  openParts(){
    this.navCtrl.push(RepairPartsPage, {
      PartsData: this.partsData,
      delegate: this
    });
  }
  
  checkboxChange(event, type, id){
    let checked = event.checked; 
    let sql_id  = id;
    switch(type){
      case 1:
        this.followerAssign[sql_id] = checked;
        break;
      case 2:
        this.contractorAssign[sql_id] = checked;
        break;
    }
  }

  testing2(event){
    let datetime = document.getElementById('closeDate');
    let dtText   = datetime.getElementsByClassName('datetime-text').item(0);
    dtText.innerHTML = event;
    this.closeDate = event;
  }

  testing(){
    if(this.imageDataURL != null && this.imageDataURL != ""){
      this.hideTabBar();
      this.navCtrl.push(DrawingPage, {
        imageData: this.imageDataURL,
        delegate: this
      });
    }
    else{
      let options = {
        destinationType   : Camera.DestinationType.DATA_URL,
        sourceType        : Camera.PictureSourceType.PHOTOLIBRARY
      };
      Camera.getPicture(options).then((imageData) => {
        this.hideTabBar();
        this.navCtrl.push(DrawingPage, {
          imageData: imageData,
          delegate: this
        });
      }, (err) => {
          console.log(err);
      });
    }
    //let tabBarElement = <HTMLElement> document.getElementsByClassName("tabbar")[0];
    //tabBarElement.style.display = 'none';
    //this.hideTabBar();
  }
  hideTabBar(){
    let scrollContentElement = <HTMLElement> document.getElementsByClassName("scroll-content")[0]
    scrollContentElement.style.marginBottom = "0px";

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
}
