export type InventoryItem = {sku:string;name:string;image:string;category:string;brand:string;stockHQ:number;stockQ7:number;stockThaoDien:number;stockWestLake:number;total:number;minimum:number;status:string};
export const inventoryItems:InventoryItem[] = [
 {sku:"R1-WHEY-5LB",name:"Rule 1 Isolate 5lbs Vanilla",image:"🥛",category:"Whey",brand:"Rule One",stockHQ:120,stockQ7:38,stockThaoDien:26,stockWestLake:19,total:203,minimum:25,status:"Tồn tối ưu"},
 {sku:"C4-ORIGINAL",name:"C4 Original Pre-workout",image:"⚡",category:"Pre-workout",brand:"Nutrabolt",stockHQ:16,stockQ7:5,stockThaoDien:2,stockWestLake:0,total:23,minimum:30,status:"Low stock"},
 {sku:"ON-GOLD-5LB",name:"ON Gold Standard Whey",image:"🥛",category:"Whey",brand:"Optimum Nutrition",stockHQ:86,stockQ7:33,stockThaoDien:27,stockWestLake:20,total:166,minimum:25,status:"Tồn tối ưu"},
 {sku:"QA-SHAKER-700",name:"QA Gym Shaker 700ml",image:"◈",category:"Phụ kiện",brand:"QA Active",stockHQ:220,stockQ7:95,stockThaoDien:72,stockWestLake:61,total:448,minimum:30,status:"Overstock"},
 {sku:"BCAA-2-1-1",name:"BCAA Recovery 2:1:1",image:"✦",category:"Vitamin/BCAA",brand:"Rule One",stockHQ:0,stockQ7:0,stockThaoDien:0,stockWestLake:0,total:0,minimum:20,status:"Stockout"},
 {sku:"QA-TEE-BLK",name:"QA Performance Tee",image:"▣",category:"Trang phục",brand:"QA Active",stockHQ:40,stockQ7:15,stockThaoDien:12,stockWestLake:9,total:76,minimum:15,status:"Tồn tối ưu"},
];
export const expiryAlerts = [{product:"C4 Original Pre-workout",batch:"B-2408-C4",expiry:"28/11/2025",quantity:12,location:"Kho Q7"},{product:"BCAA Recovery 2:1:1",batch:"B-2406-BC",expiry:"05/12/2025",quantity:8,location:"Kho HQ"}];
