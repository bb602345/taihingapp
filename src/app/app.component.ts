import { Component, ViewChild, Input} from '@angular/core';
import { Platform, MenuController, Nav, AlertController} from 'ionic-angular';
import { StatusBar, Splashscreen} from 'ionic-native';
import { Geolocation, PositionError, Geoposition } from 'ionic-native';
import { Firebase } from '@ionic-native/firebase';
import { Storage } from '@ionic/storage';

import { PushNotificationService } from '../providers/push-notification-service';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login-page/login-page';


@Component({
  templateUrl: 'app.html',
  providers: [PushNotificationService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  pages: Array<{title: string, component: any}>;
  userName: string;
  subscription: any;

  constructor(public platform: Platform, 
              public menu: MenuController, 
              public storage: Storage, 
              public alertCtrl: AlertController,
              public firebase: Firebase,
              public pushNotificationService: PushNotificationService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.hide();
      Splashscreen.hide();
      //this.initGeolocation();
      this.initPushNotification();

      storage.get('USER').then((val)=>{
        if(val != null){
          let user = JSON.parse(val);
          this.rootPage = TabsPage;
          this.userName = user.user_name;
          
          this.storage.get("DEVICE_TOKEN").then(value=>{
            let deviceToken = value;
            let userID = user.user_id;
            this.pushNotificationService.RegisterToken(userID, deviceToken);
          });

        }
      })

    });

    this.pages = [
      { title: '登出', component: LoginPage }
    ];

  }

  openPage(page) {
    this.menu.close();
    this.nav.push(page.component);
  }

  logout(){
    this.userName = null;
    this.storage.remove("USER");
    this.menu.close();
    this.nav.setRoot(LoginPage);
  }

  initGeolocation(){
    let watch = Geolocation.watchPosition();
    this.subscription = watch.subscribe((data) => {
      console.log(data);
      if(data as Geoposition){
        let pos = (data as Geoposition);
        this.storage.set("LAT", pos.coords.latitude);
        this.storage.set("LON", pos.coords.longitude);
        console.log("LAT::", pos.coords.latitude);
        console.log("LON::", pos.coords.longitude);
      }else{
        let err = (data as PositionError);
      }
    });
  }
  initPushNotification() {
    this.firebase.getToken().then(token => this.storage.set("DEVICE_TOKEN", token));
    this.firebase.onTokenRefresh().subscribe(token => this.storage.set("DEVICE_TOKEN", token));
    this.firebase.onNotificationOpen().subscribe(message => console.log(message));
  }

}
