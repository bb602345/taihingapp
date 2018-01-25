import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the RepairParts provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FetchRepairParts {

  constructor(public http: Http) {
    console.log('Hello RepairParts Provider');
  }

  getPartList(): Promise<Part[]>{
    let h = this.http;
    return new Promise<Part[]>((resolve, reject)=>{
      h.get('http://taihingroast.com/soap/RepairTask/getRepairParts.php')
        .map(res => res.json())
        .subscribe(
        data => {
          let r = new Array<Part>();
          data.forEach(v => {
            r.push(new Part(v));
          });
          resolve(r);
        },
        err => {
          reject(err);
        });  
    });
  }
  getCatList(): Promise<string[]>{
    let h = this.http;
    return new Promise<string[]>((resolve, reject)=>{
      h.get('http://taihingroast.com/soap/RepairTask/getRepairPartsCat.php')
        .map(res => res.json())
        .subscribe(
        data => {
          let r = new Array<string>();
          data.forEach(v => {
            r.push(v["name"]);
          });
          resolve(r);
        },
        err => {
          reject(err);
        });  
    });
  }

}

export class Part{
  sqlID: number;
  name: string;
  cat : string;
  remark: string;
  price: number;
  unit: string;
  constructor(v: any){
    this.cat = v["chr_cat"]
    this.sqlID = v["int_id"];
    this.name = v["txt_name"];
    this.price = v["int_price"];
    this.remark = v["remark"];
    this.unit = v["UoM"];
  }
}
