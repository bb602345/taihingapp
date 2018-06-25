
export class Task {
    sql_id: number;

    case_num: string;
    device_num: string;
    shop: string;
    shop_code: string;
    shop_tel: string;
    important: number;
    call_staff: string;
    status:  number;

    project_type_name: string;

    project_name: string;
    help_name: string;
    staff_name: string;
    details: string;

    input_date: string;
    allocation_date : string;
    dtff: number; //current - allocation_date

    followed_results: string;
    follower_remarks: string;

    replied: number;
    pending: number;
    close_date: string;

    color: string;
    lat: number;
    long: number;
    repair_price: number;
    Parts: Array<any>;
    PartsTotal: number;

    isShop: boolean;

    constructor(obj: any) {
        this.allocation_date   = obj["AllocationDate"];
        this.case_num          = obj["chr_case_num"];
        this.device_num        = obj["chr_device_number"];
        this.shop              = obj["chr_shop"];
        this.dtff              = obj["dtff1"];
        this.help_name         = obj["help_name"];
        this.input_date        = obj["input_date"];
        this.important         = obj["int_Impo"];
        this.project_name      = obj["newProjectName"];
        this.shop_code         = obj["shopCode"]; 
        this.staff_name        = obj["staffName"];
        this.details           = obj["txt_detail"];
        this.project_type_name = obj["newProjectTypeName"]; 
        this.sql_id            = obj["int_id"];
        this.call_staff        = obj["chr_call"];
        this.status            = obj["status"];
        this.followed_results  = obj["chr_followed_result"];
        this.follower_remarks  = obj["chr_follower_remarks"];
        this.close_date        = obj["date_case_close"];
        this.shop_tel          = obj["chr_tel"];
        this.lat               = obj["lat"];
        this.long              = obj["long"];
        this.repair_price      = obj["repair_price"];
        this.pending           = obj["pending"];
        if(obj.parts != null){
          this.Parts             = obj["parts"]["obj"];
          this.PartsTotal        = obj["parts"]["total"];
        }

        this.project_name = this.unicodeDecode(this.project_name);
        this.details      = this.unicodeDecode(this.details);
        this.followed_results = this.unicodeDecode(this.followed_results);
        this.follower_remarks = this.unicodeDecode(this.follower_remarks);
        switch(parseInt(this.important + "")){
            case 5:
              this.color = "#59AF59";
              break;
            case 4:
              this.color = "yellow";
              break;
            default:
              this.color = "red";
              break;
        }
        this.isShop = ( isNaN(parseInt(this.shop_code)) || this.shop_code == "") ? false : true;
        this.shop = (this.shop == "") ? "其他" : this.shop;
    }

    
    public get impo() : string {
        switch(parseInt(this.important + "")){
            case 1:
            return "特急";
            case 2:
            return "急";
            case 3:
            return "高";
            case 4:
            return "中";
            default:
            return "低";
        }
    }

    unicodeDecode(origin): string{
      let s;
      if(origin == null) return "";
      while(s = origin.match(/&#([0-9]*);/g)){
        let replace  = s[0];
        let charCode = replace.substring(2, 7);
        let text = String.fromCharCode(charCode);
        
        origin = origin.replace(replace, text);
      }
      return origin;
  }
    
}