import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the TaskImage provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class TaskImage {

  constructor(public http: Http) { }

  getImageByTaskID(TaskID: number, callback:(dataurl:string) => void){    
    let dataURL: string;
    this.http.get('http://taihingroast.com/soap/RepairTask/getImageData.php?taskID=' + TaskID)
    .map(res => res.json())
    .subscribe(data => {
      dataURL = data["data_url"];
      callback(dataURL);
    });
  }

}
