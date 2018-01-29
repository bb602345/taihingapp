import { Component, ViewChild  } from '@angular/core';
import { NavController, NavParams, Tab, Content  } from 'ionic-angular';
import { ShopList } from  '../../providers/shop-list';
import { Storage } from '@ionic/storage';
import { Keyboard } from 'ionic-native';

/*
  Generated class for the FilterPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-filter-page',
  templateUrl: 'filter-page.html',
  providers:[ShopList]
})
export class FilterPage {
  @ViewChild(Content) content: Content;

  searchInput: HTMLInputElement;
  parentDelegate: any;
  FullShopList: Array<{
    shopCode: string,
    shopName: string  
  }>;
  shopList: Array<{
    shopCode: string,
    shopName: string  
  }>;

  constructor(public navCtrl: NavController, navParams: NavParams, shopList: ShopList, public storage: Storage) {
    this.parentDelegate = navParams.get("parentDelegate");
    shopList.getShopList(this.parentDelegate.userID, (shopList) => {
      shopList.unshift({shopCode: "全部", shopName: ""});
      if(this.parentDelegate.foreigncontractor == null){
        shopList.unshift({shopCode: "後勤", shopName: ""});
      }
      this.FullShopList = shopList;
      this.shopList = shopList;
    });
  }
  initElement(){
    let scrollEle = this.getScrollElement();
    //scrollEle.style.marginBottom = "174px";
    scrollEle.style.padding = "0px";

    document.getElementById('content').style.display = "";
    document.getElementById('filter-search-bar').style.display = "";

    this.searchInput = <HTMLInputElement> document.getElementsByClassName('searchbar-input')[0];
    this.searchInput.type = "tel";

    let test = this.content._fixedEle;
    this.searchInput.addEventListener("focusin", function(){
      scrollEle.style.marginBottom = "220px";
      Keyboard.disableScroll(true);
    });
    this.searchInput.addEventListener("focusout", function(){
      scrollEle.style.marginBottom = "";
      Keyboard.disableScroll(false);
    });
  }

  ionViewDidLoad() {
    console.log('filter::ionViewDidLoad');
  }
  ionViewDidEnter(){
    console.log('ionViewDidEnter');
    this.hideTabBar();
    this.initElement();
  }
  ionViewWillLeave(){
    //document.getElementById('numPad').style.display = "none";
    document.getElementById('filter-search-bar').style.display = "none";
    this.searchInput.blur();
  }
  ionViewDidLeave(){
    console.log('ionViewDidLeava');
    this.showTabBar();
  }

  hideTabBar(){
    console.log("hideTabBar");
    let scrollEle = this.getScrollElement();
    scrollEle.style.marginBottom = "0px";

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
  showTabBar(){
    console.log("showTabBar");
    function frame() {
      if (pos >= 0) {
        clearInterval(id);
      } else {
        pos += 2; 
        tabBarElement.style.bottom = pos + 'px'; 
      }
    }
    let tabBarElement = <HTMLElement> document.getElementsByClassName("tabbar")[0];
    let pos = -60
    let id = setInterval(frame, 1);
  }

  getScrollElement(): HTMLElement{
    return this.content._scrollEle;
    /*
    let pages = document.getElementsByClassName("ion-page");
    for(let i=0;i<pages.length;i++){
      if(pages[i].parentElement.className == "show-tab"){
        let scrollEleList = document.getElementsByClassName("scroll-content");
        return <HTMLElement> scrollEleList[i + 1];
      }
    }
    */
  }

  inputSearch(ev: any){
    let val = ev.target.value;

    this.shopList = this.FullShopList.filter((shop)=>{
      return shop.shopCode.indexOf(this.searchInput.value) > -1;
    });
    this.content.scrollToTop();
  }
  shopFilterClick(shop: {shopCode: string, shopName:string} ){
    this.storage.set("FILTER", shop);
    this.navCtrl.pop();
  } 
}
