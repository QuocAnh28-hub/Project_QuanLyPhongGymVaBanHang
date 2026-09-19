export type SubCategory={id:number;name:string;description:string;slug:string;skuCount:number;image:string;visibleOnApp:boolean;filters:string[]};
export type Category={id:string;name:string;icon:string;itemCount:number;revenueShare:number;pinned:boolean;position:number;enabled:boolean;subcategories:SubCategory[]};
const sub=(id:number,name:string,slug:string,count:number):SubCategory=>({id,name,description:`Sản phẩm ${name.toLowerCase()} chính hãng`,slug,skuCount:count,image:"▧",visibleOnApp:true,filters:["Hãng","Khối lượng"]});
export const shopCategories:Category[]=[
 {id:"supplements",name:"Thực phẩm Bổ sung & Protein",icon:"nutrition",itemCount:82,revenueShare:58,pinned:true,position:1,enabled:true,subcategories:[sub(1,"Whey Isolate Siêu tinh khiết","/shop/whey-isolate",26),sub(2,"Whey Blend & Hỗn hợp","/shop/whey-blend",19),sub(3,"Mass Gainer Tăng cân","/shop/mass-gainer",15)]},
 {id:"energy",name:"Năng lượng & Tăng sức mạnh",icon:"bolt",itemCount:28,revenueShare:14,pinned:false,position:2,enabled:true,subcategories:[sub(4,"Pre-workout","/shop/pre-workout",16),sub(5,"Creatine","/shop/creatine",12)]},
 {id:"recovery",name:"Vitamin & Phục hồi",icon:"health_and_safety",itemCount:32,revenueShare:12,pinned:false,position:3,enabled:true,subcategories:[sub(6,"Vitamin tổng hợp","/shop/vitamins",18),sub(7,"BCAA Phục hồi","/shop/bcaa",14)]},
 {id:"apparel",name:"Quần áo & Trang phục QA Active",icon:"checkroom",itemCount:24,revenueShare:9,pinned:false,position:4,enabled:true,subcategories:[sub(8,"Áo tập QA Active","/shop/active-shirts",14),sub(9,"Quần tập","/shop/active-pants",10)]},
 {id:"accessories",name:"Phụ kiện tập Gym",icon:"sports_gymnastics",itemCount:16,revenueShare:5,pinned:false,position:5,enabled:true,subcategories:[sub(10,"Đai & Găng tay","/shop/gym-accessories",16)]},
 {id:"drinks",name:"Thức uống pha sẵn & Bar dinh dưỡng",icon:"local_drink",itemCount:4,revenueShare:2,pinned:false,position:6,enabled:true,subcategories:[sub(11,"Protein Bar & RTD","/shop/rtd-bars",4)]},
];
