import { Component } from '@angular/core';
import { NavController, AlertController, Platform} from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { TabsPage } from '../../pages/tabs/tabs';
import { Storage } from '@ionic/storage';
import { PushNotificationService } from '../../providers/push-notification-service';

/*
  Generated class for the LoginPagePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login-page.html',
  providers: [PushNotificationService]
})
export class LoginPage {
  loginID: string;
  pwd: string;

  constructor(private navCtrl: NavController, 
              public alertCtrl: AlertController, 
              public http:Http, 
              public storage: Storage, 
              public loadCtrl: LoadingController,
              public pushNotificationService: PushNotificationService) { }

  login(){
     let link = "http://taihingroast.com/soap/RepairTask/auth.php";
     let headers = new Headers({ 'Content-Type': 'application/json' });
     let options = new RequestOptions({ headers: headers });

     let data = JSON.stringify({
       loginID: this.loginID,
       pwd: this.pwd
     })

     let loading = this.loadCtrl.create({content: "請稍侯"});
     loading.present();
     this.http.post(link, data, options).subscribe(resp => {
       let obj = resp.json();
       switch (obj["result"]){
         case "OK":
         console.log(obj);
          let data = JSON.stringify({
            user_id: obj.int_id,
            user_type: obj.int_type,
            user_name: obj.txt_name,
            foreigncontractor: obj.int_foreigncontractor_id
          });
          document.getElementById("app-menu").style.display = "";
          document.getElementById("lb-user-name").innerHTML = obj.txt_name;
          this.storage.set("USER", data);
          this.navCtrl.setRoot(TabsPage);

          
          this.storage.get("DEVICE_TOKEN").then(value=>{
            let deviceToken = value;
            let userID = obj.int_id as number;
            this.pushNotificationService.RegisterToken(userID, deviceToken);
          });
          
          break;
         case "NO_OK":
          let alert = this.alertCtrl.create({ 
            title: '登入失敗，請重試。',
            buttons: ['確定']
          });
          alert.present();
          this.pwd = "";
          break;
       }
       loading.dismiss();
     });

  }

}
