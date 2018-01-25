import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the PushNotificationService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PushNotificationService {

  constructor(public http: Http) { }

  RegisterToken(userID: number, token:string){
    if (token == undefined || token.length == 0)
      return;

    let link = "http://taihingroast.com/soap/RepairTask/updateToken.php";
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let data = JSON.stringify({
      id: userID,
      token: token
    })
    
    this.http.post(link, data, options).subscribe(resp=>{
      console.log(`RegisterToken: ${resp.text()}`);
    })
  }

}
