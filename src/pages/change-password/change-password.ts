import { Component } from '@angular/core';
import { NavController, AlertController, Platform} from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { TabsPage } from '../../pages/tabs/tabs';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {
  oldPwd: string;
  newPwd: string;
  confirmPwd: string;
  userID: number;

  constructor(private navCtrl: NavController, 
              public alertCtrl: AlertController, 
              public http:Http, 
              public storage: Storage, 
              public platform: Platform, 
              public loadCtrl: LoadingController) { 

    platform.ready().then(() => {
      this.storage.get("USER").then(data=>{
        data = JSON.parse(data);
        this.userID = data["user_id"];
      });
    });
  }
  back(){
    this.navCtrl.setRoot(TabsPage);
  }
  changePassword(){
    let f = false;
    let title;
    if(this.newPwd != this.confirmPwd){
        title = '確認密碼不正確，\r\n請重試。';
        f = true;
    }
    if(this.newPwd == this.oldPwd){
        title = "新舊密碼重覆，請重新輸入。";
        f = true;
    }
    if(this.newPwd == undefined || this.oldPwd == undefined || this.confirmPwd == undefined){
        title = "請輸入所有資料。";
        f = true;
    }

    if(f){
        let alert = this.alertCtrl.create({ 
            title: title,
            buttons: ['確定']
        });
        alert.present();
        return;
    }
    console.log(f);


    let link = "http://taihingroast.com/soap/RepairTask/changePassword.php";
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let data = JSON.stringify({
        oldPwd: this.oldPwd,
        newPwd: this.newPwd,
        confirmPwd: this.confirmPwd,
        userID: this.userID
    })
    let loading = this.loadCtrl.create({content: "請稍侯"});
    loading.present();
    this.http.post(link, data, options).subscribe(resp => {
        let obj = resp.json();
        let alert;
        switch (obj["result"]){
            case "OK":
                console.log(obj);
                this.navCtrl.setRoot(TabsPage);
                alert = this.alertCtrl.create({ 
                title: "密碼修改成功。",
                    buttons: ['確定']
                });
                alert.present();
                break;
            case "OLD_PWD_NOT_MATCH":
                alert = this.alertCtrl.create({ 
                title: "舊密碼不正確，\r\n請重試。",
                    buttons: ['確定']
                });
                alert.present();
                break;
        }
        loading.dismiss();
    });
  }

}
