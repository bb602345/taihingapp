import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import { Camera } from 'ionic-native';
import { TaskDetailPage } from '../task-detail/task-detail';
/*
  Generated class for the DrawingPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-drawing-page',
  templateUrl: 'drawing-page.html'
})
export class DrawingPage {

  canvas: any;
  ctx : any;

  preX: number = 0;
  preY: number = 0;
  currX: number = 0;
  currY: number = 0;

  drawingOffset: number;
  base64Image: string;
  platform: Platform;
  imageData: string;

  tabBarElement: HTMLElement;
  footerElement: HTMLElement;
  scrollContentElement: HTMLElement;

  ParentDelegate: TaskDetailPage;

  constructor(platform: Platform, public navCtrl: NavController, navParams: NavParams, public http: Http) {
    this.platform = platform;
    this.imageData = navParams.get("imageData");
    this.ParentDelegate = navParams.get("delegate");
    this.init();
  }
  ionViewDidEnter(){
    this.scrollContentElement = <HTMLElement> document.getElementsByClassName("scroll-content")[0]
    this.scrollContentElement.style.marginBottom = "0px";

    this.footerElement = <HTMLElement> document.getElementsByClassName("footer")[0]
    this.footerElement.style.bottom = "0px";

    //register element
    this.canvas = <HTMLCanvasElement> document.getElementById("drawCanvas");
    this.ctx = this.canvas.getContext("2d");

    //set drawing offset Height
    var header = document.getElementById("ion-header");
    this.drawingOffset = header.offsetHeight;

    this.footerElement.style.display = "";
  }
  ionViewDidLeave(){
    this.showTabBar();
  }
  showTabBar(){
      let tabBarElement = <HTMLElement> document.getElementsByClassName("tabbar")[0];
      let pos = -60
      let id = setInterval(frame, 1);
      function frame() {
        if (pos >= 0) {
          clearInterval(id);
        } else {
          pos += 2; 
          tabBarElement.style.bottom = pos + 'px'; 
        }
      }
  }

  init() {
    //console.log(this.imageData.substring(0, 4));
    if(this.imageData.substring(0, 4) == "data")
      this.base64Image = this.imageData;
    else
      this.base64Image = "data:image/jpeg;base64," + this.imageData;

    var image = new Image();
    image.onload = ()=> {
      this.initCanvasSizeByImage(image);
    };
    image.src = this.base64Image;
  }
  initCanvasSizeByImage(image){
      var content = document.getElementById("ion-content");
      var temp    = <HTMLElement>content.firstChild;

      var bCanvas = <HTMLCanvasElement> document.getElementById("baseCanvas"), bCtx = bCanvas.getContext("2d");
      var dCanvas = <HTMLCanvasElement> document.getElementById("drawCanvas");

      //set base canvas size
      
      if(image.width > image.height){
        bCanvas.width  = temp.offsetWidth - 2;
        bCanvas.height = bCanvas.width * (image.height / image.width);
      }else{
      
        bCanvas.height  = temp.offsetHeight * 0.8;
        bCanvas.width   = bCanvas.height * (image.width / image.height);
      }

      //set drawing canvas size
      dCanvas.height = bCanvas.height;
      dCanvas.width  = bCanvas.width
      

      //resize image
      var tc = document.createElement('canvas'), tctx = tc.getContext('2d');
      tc.width = image.width;
      tc.height = image.height;
      tctx.drawImage(image, 0, 0, tc.width, tc.height);

      //base canvas
      bCtx.drawImage(tc, 0, 0, tc.width, tc.height, 0, 0, dCanvas.width, dCanvas.height);
  }

  chooseImage(){
    let options = {
      destinationType   : Camera.DestinationType.DATA_URL,
      sourceType        : Camera.PictureSourceType.PHOTOLIBRARY
    };
    Camera.getPicture(options).then((imageData) => {
      this.imageData = imageData;
      this.init();
    }, (err) => {
        console.log(err);
    });
  }

  confirm(){
    var baseCanvas = <HTMLCanvasElement> document.getElementById("baseCanvas");
    var drawCanvas = <HTMLCanvasElement> document.getElementById("drawCanvas");

    var tc = document.createElement('canvas'), tctx = tc.getContext('2d');
    tc.width = baseCanvas.width;
    tc.height = baseCanvas.height;

    tctx.drawImage(baseCanvas, 0, 0);
    tctx.drawImage(drawCanvas, 0, 0);

    this.ParentDelegate.data = tc.toDataURL();
    this.navCtrl.pop();
  }
  trash(){
    this.ParentDelegate.data = "";
    this.navCtrl.pop();
  }

  draw(){
    this.ctx.beginPath();
    this.ctx.moveTo(this.preX, this.preY);
    this.ctx.lineTo(this.currX, this.currY);
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.closePath();
  }
  downEvent(event): void {
      this.preX = this.currX;
      this.preY = this.currY;
      this.currX = event.touches[0].clientX;
      this.currY = event.touches[0].clientY - this.drawingOffset;
      
  }
  dragEvent(event): void {
      this.preX = this.currX;
      this.preY = this.currY;
      this.currX = event.touches[0].clientX;
      this.currY = event.touches[0].clientY - this.drawingOffset;
      this.draw();
  }

}
