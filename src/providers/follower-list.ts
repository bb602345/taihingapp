import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the FollowerList provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FollowerList {
  FollowerList: Array<any>;
  
  constructor(private http: Http) {}

  getFollowerList(callBack: Function){
    this.http.get('http://taihingroast.com/soap/RepairTask/getFollowerList.php')
    .map(res => res.json())
    .subscribe(data => {

        this.FollowerList = [];
        data.forEach(f => {
          this.FollowerList.push(f);
        });
        callBack();
    },
    err => {
        console.log(err);
    });  
  }

  getTaskFollower(TaskID: number, callBack: (followerIdList: Array<number>) => void ){
    this.http.get('http://192.168.2.250/soap/RepairTask/getTaskFollower.php?rid=' + TaskID)
     .map(res => res.json())
     .subscribe(data => {
       let result = new Array<number>();
       data.forEach(ele => {
         result.push(ele);
       });
       callBack(result);
     });
  }
}

