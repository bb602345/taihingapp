import { Component, ViewChild, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TaskDetailPage } from '../task-detail/task-detail';
import { FetchRepairParts, Part } from '../../providers/repair-parts';
import { TextInput } from 'ionic-angular';
/*
  Generated class for the RepairParts page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-repair-parts',
  templateUrl: 'repair-parts.html',
  providers:[FetchRepairParts]
})
export class RepairPartsPage {
  PartsData: {Parts: Array<any>,};
  Parent: TaskDetailPage;
  
  PartCat: string[];
  Parts: Part[];

  TotalList: number[];
  FiltedParts: Object;
  ChooseCats: Object;
  ChooseParts: Object;

  Checker: Map<string, any>;
  CurrentID: number;

  constructor(public navCtrl: NavController, navParams: NavParams, public fetchParts: FetchRepairParts) {
    this.Parent = navParams.get('delegate');
    this.PartsData = navParams.get('PartsData');

    this.TotalList = new Array<number>();

    this.ChooseCats = new Object();
    this.ChooseParts = new Object();
    this.FiltedParts = new Object();
    
    this.Checker = new Map<string, any>();
    this.CurrentID = 0;
  }

  ionViewDidLoad() {
    this.fetchParts.getPartList().then(parts => {
      this.Parts = parts; 
      if(this.PartsData == null || this.PartsData.Parts.length == 0){
        this.addPartsItem();
      }
      else{
        this.PartsData.Parts.forEach(v=>{
          this.addPartsItem(v.pid, v.qty);
        });
      }
    });
    this.fetchParts.getCatList().then(cats => this.PartCat = cats);
  }
  ionViewDidLeave(){
    let resp: {Parts: Array<any>, Total: any};
    let pary = new Array<any>();
    this.TotalList.forEach(id => {
      let v = document.getElementById("uom-" + id).children.item(0) as HTMLInputElement;
      if(this.ChooseParts[id] && parseInt(v.value) > 0){
        let obj = { pid: this.ChooseParts[id], qty: v.value }
        pary.push(obj);
      }
    });
    resp = { Parts: null, Total: null };
    resp.Parts = pary;
    resp.Total = document.getElementById("totalPrice").innerHTML.substring(1);

    this.Parent.parts = resp;
  }

  addPartsItem(PartsID?:number, Qty?:number){
    this.TotalList.push(this.CurrentID);
    this.ChooseCats[this.CurrentID] = "all";
    this.ChooseParts[this.CurrentID] = (PartsID) ? PartsID : -1;
    this.FiltedParts[this.CurrentID] = JSON.parse(JSON.stringify(this.Parts));
    let tempID = this.CurrentID;
    setTimeout(()=>{
      let master = document.getElementById("uom-" + tempID);
      let v = master.children.item(0) as HTMLInputElement;
      let inputCover = master.lastChild;
      if(Qty > 0){
        v.value = Qty.toString();
        this.syncPrice(tempID);
      }
      if(inputCover.attributes.getNamedItem("class").value == "input-cover"){
        master.removeChild(inputCover);
      }
    }, 150);
    this.CurrentID++;
    this.MapGetDifferentID(this.ChooseParts, "PARTS");
  }
  pickCat(){
    let id = this.MapGetDifferentID(this.ChooseCats, "CAT");
    if(this.ChooseCats[id] == "all"){
      this.FiltedParts[id] = this.Parts;
    }else{
      this.FiltedParts[id] = this.Parts.filter(v=>{return v.cat == this.ChooseCats[id]});  
    }
  }
  pickPart(){
    let id = this.MapGetDifferentID(this.ChooseParts, "PARTS");
    let p = this.Parts.find( (v) => { return v.sqlID == this.ChooseParts[id]; } );
    if(p){
      document.getElementById("uom-" + id).setAttribute("name", p.unit || "個") ;
      document.getElementById("price-" + id).innerHTML = "$0";
      
      let v = document.getElementById("uom-" + id).children.item(0) as HTMLInputElement;
      if(parseInt(v.value) == 0){
        this.add(null, id);
      }
      this.syncPrice(id);
      
    }
  }
  delete(id){
    this.TotalList = this.TotalList.filter(v => { return v != id; })
    delete this.ChooseCats[id];
    delete this.ChooseParts[id];

    this.MapGetDifferentID(this.ChooseCats, "CAT");
    this.MapGetDifferentID(this.ChooseParts, "PARTS");
    this.totalPrice();
  }
  remove(event, id){
    let v = document.getElementById("uom-" + id).children.item(0) as HTMLInputElement;
    if(v.value == "0") return;
    v.value = (parseInt(v.value) - 1).toString();
    this.syncPrice(id);
  }
  add(event: MouseEvent, id){
    let v = document.getElementById("uom-" + id).children.item(0) as HTMLInputElement;
    v.value = (parseInt(v.value) + 1).toString();
    this.syncPrice(id);
  }
  syncPrice(id){
    let v = document.getElementById("uom-" + id).children.item(0) as HTMLInputElement;
    let p = this.Parts.find( (v) => { return v.sqlID == this.ChooseParts[id]; } );
    if(p){
      let num = parseInt(v.value) * p.price;
      let n = num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      document.getElementById("price-" + id).innerHTML = "$" + n;
      this.totalPrice();
    }
  }
  totalPrice(){
    let t = 0;
    this.TotalList.forEach(id => {
      let p = this.Parts.find( (v) => { return v.sqlID == this.ChooseParts[id]; } );
      let v = document.getElementById("uom-" + id).children.item(0) as HTMLInputElement;
      if(p){
        let num = parseInt(v.value) * p.price;
        t += num;
      }
    });
    let n = t.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    document.getElementById("totalPrice").innerHTML = "$" + n;
  }

  private MapGetDifferentID(current: Object, a: string): number{
    let resultID: number = 0;
    let last = this.Checker.get(a);

    if(last != undefined){
      for(let id of this.TotalList){
        if(last[id] != current[id]){
          resultID = id;
          break;
        }
      }
    }
    this.Checker.set(a, JSON.parse(JSON.stringify(current)));
    return resultID;
  }
}