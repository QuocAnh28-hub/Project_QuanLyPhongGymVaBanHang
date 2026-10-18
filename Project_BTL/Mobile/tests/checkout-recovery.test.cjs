const {test}=require('node:test');
const assert=require('assert/strict');
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function screen({lostResponse=false}={}){
 const draft={requestKey:'persisted-original-key',cartVersion:'a'.repeat(64),name:'Test Member',phone:'0912345678',delivery:'PICKUP',address:'',note:'original',paymentMethod:'TIEN_MAT'};
 let saved=JSON.stringify(draft),existing=null,focus,tree,stateIndex=0,refIndex=0;
 const states=[],refs=[],requests=[],routes=[];
 const hooks={useState(initial){const i=stateIndex++;if(!(i in states))states[i]=initial;return[states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v;}];},useRef(initial){const i=refIndex++;return refs[i]||=( {current:initial} );},useCallback:fn=>fn};
 const modules={react:hooks,'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},'expo-image':{Image:'Image'},'expo-router':{router:{replace:r=>routes.push(r),push:()=>{}},useFocusEffect:fn=>{focus=fn;}},'react-native':{ActivityIndicator:'ActivityIndicator',Text:'Text',View:'View'},'@/components/shop-checkout-ui':{ShopButton:'ShopButton',ShopField:'ShopField',ShopPage:'ShopPage',ShopRow:'ShopRow',checkoutStyles:{}},'@/constants/shop-image':{DEFAULT_PRODUCT_IMAGE:1},'@/context/AuthContext':{useAuth:()=>({user:{accountId:7}})},'@/lib/local-store':{readLocal:async()=>saved,writeLocal:async(_k,v)=>{saved=v;}},'@/lib/shop-api':{formatPrice:String,ShopApiError:class extends Error{}},'@/lib/checkout-api':{
  checkoutStorageKey:()=> 'draft',findCheckoutOrder:async()=>existing,
  getCheckout:async()=>({requestKey:'new-preview-key',cartVersion:'a'.repeat(64),customer:{HoTen:'Member'},items:[],subtotal:'10000',shipping:'0'}),
  createShopOrder:async(_id,input)=>{requests.push(input);existing={DonHangID:42};if(lostResponse)throw new Error('Network response lost');return existing;},
 }};
 modules['@/components/backend-image']={__esModule:true,default:'BackendImage'};
 const context={exports:{},require:name=>{assert(modules[name],name);return modules[name];}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/checkout.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const render=()=>{stateIndex=0;refIndex=0;tree=context.exports.default();return tree;};
 const all=node=>node&&typeof node==='object'?[node,...(Array.isArray(node.props?.children)?node.props.children:[node.props?.children]).flatMap(all)]:[];
 const retry=()=>all(tree).find(n=>n.type==='ShopButton'&&n.props.title==='Thử lại yêu cầu đặt hàng');
 return{draft,requests,routes,render,retry,focus:()=>focus(),saved:()=>saved};
}
test('reopening uncertain checkout retries original persisted key/body and prevents double tap',async()=>{
 const s=screen();s.render();s.focus();await tick();s.render();
 const button=s.retry();assert(button,'Persisted attempt must remain locked and retryable');
 button.props.onPress();button.props.onPress();await tick();
 assert.equal(s.requests.length,1);assert.equal(JSON.stringify(s.requests[0]),JSON.stringify(s.draft));
 assert.equal(s.saved(),null);assert.equal(s.routes[0].params.orderId,42);
});
test('lost response keeps draft then restores committed order without creating another',async()=>{
 const s=screen({lostResponse:true});s.render();s.focus();await tick();s.render();s.retry().props.onPress();await tick();
 assert.equal(s.requests.length,1);assert(s.saved());
 s.render();s.focus();await tick();
 assert.equal(s.requests.length,1);assert.equal(s.saved(),null);assert.equal(s.routes[0].params.orderId,42);
});
