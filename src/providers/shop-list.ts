import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the ShopList provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ShopList {

  constructor(public http: Http) {
    console.log('Hello ShopList Provider');
  }

  getShopList(userID: number, callback:(shopList:Array<{shopCode: string, shopName: string}>) => void){
    let result = new Array<{shopCode: string, shopName: string}>();
    this.http.get('http://taihingroast.com/soap/RepairTask/getShopList.php?userID=' + userID)
    .map(res => res.json())
    .subscribe(data => {
      data.forEach(v => {
        let shop = {
          shopCode: <string> v['chr_ename'],
          shopName: <string> v['txt_name']
        }
        result.push(shop);
      });
      callback(result);
    });
  }

}
