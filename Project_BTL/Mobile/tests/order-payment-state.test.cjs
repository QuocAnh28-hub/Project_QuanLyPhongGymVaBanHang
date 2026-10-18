const {test}=require('node:test');const assert=require('assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function screen(responses){
 let focus,index=0,tree;const states=[],timers=[];
 const modules={react:{useState(initial){const i=index++;if(!(i in states))states[i]=initial;return[states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v;}];},useCallback:fn=>fn},
  'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
  '@/components/backend-image':{__esModule:true,default:'BackendImage'},'react-native-qrcode-svg':{__esModule:true,default:'QRCode'},
  'expo-clipboard':{},'expo-router':{router:{replace:()=>{}},useFocusEffect:fn=>{focus=fn;},useLocalSearchParams:()=>({orderId:'12'})},
  'react-native':{ActivityIndicator:'Spinner',Text:'Text',View:'View'},
  '@/components/shop-checkout-ui':{ShopButton:'ShopButton',ShopPage:'ShopPage',ShopRow:'ShopRow',checkoutStyles:{}},
  '@/constants/shop-image':{DEFAULT_PRODUCT_IMAGE:1},'@/context/AuthContext':{useAuth:()=>({user:{accountId:7}})},
  '@/lib/shop-api':{formatPrice:String},'@/lib/checkout-api':{orderStatus:{PENDING:'Pending',CONFIRMED:'Confirmed'},paymentStatus:{PENDING:'Unpaid',SUCCESS:'Paid'},getShopOrder:async()=>{const value=responses.shift();if(value instanceof Error)throw value;return value;}}
 };
 const context={exports:{},Error,require:key=>{assert(modules[key],key);return modules[key];},setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout:()=>{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/order-payment.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const render=()=>{index=0;tree=context.exports.default();};
 const all=node=>node&&typeof node==='object'?[node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flatMap(all)]:[];
 return{render,focus:()=>focus(),poll:()=>timers.shift()(),nodes:()=>all(tree)};
}
const order={DonHangID:12,ThanhToanID:34,TrangThai:'PENDING',TrangThaiThanhToan:'PENDING',PhuongThucThanhToan:'CHUYEN_KHOAN',TongTien:12000,PhiVanChuyen:0,TenNguoiNhan:'Member',SoDienThoai:'0912345678',CachNhan:'PICKUP',items:[],transfer:{qrPayload:'test-qr',accountNo:'1234',accountName:'TEST'}};
test('polling SUCCESS removes payment QR and leaves the confirmed state',async()=>{
 const s=screen([order,{...order,TrangThai:'CONFIRMED',TrangThaiThanhToan:'SUCCESS',HoaDonID:9,transfer:null}]);
 s.render();s.focus();await tick();s.render();assert(s.nodes().some(n=>n.type==='QRCode'));
 s.poll();await tick();s.render();assert(!s.nodes().some(n=>n.type==='QRCode'));
 assert(s.nodes().some(n=>n.type==='ShopRow'&&n.props?.value==='#9'));
});
test('lost polling response hides stale QR; retry restores current server status',async()=>{
 const s=screen([order,new Error('Network lost'),{...order,TrangThai:'CONFIRMED',TrangThaiThanhToan:'SUCCESS',HoaDonID:9,transfer:null}]);
 s.render();s.focus();await tick();s.render();s.poll();await tick();s.render();
 assert(!s.nodes().some(n=>n.type==='QRCode'));assert(s.nodes().some(n=>n.props?.children==='Network lost'));
 s.focus();await tick();s.render();assert(s.nodes().some(n=>n.type==='ShopRow'&&n.props?.value==='#9'));
});
test('cancelled order and bank/stock block never offer a payment QR',async()=>{
 for(const blocked of [{...order,TrangThai:'CANCELLED'},{...order,transfer:null,paymentBlockReason:'Stock blocked'}]){
  const s=screen([blocked]);s.render();s.focus();await tick();s.render();assert(!s.nodes().some(n=>n.type==='QRCode'));
 }
});

