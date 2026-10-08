const {test}=require('node:test');const assert=require('assert/strict');
const fs=require('fs'),vm=require('vm'),ts=require('typescript');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function page(){
 const states=[],refs=[],effects=[];let index=0,refIndex=0,effectIndex=0,tree,saves=0,stops=0,rejectSave;
 const service={getPromotions:async()=>[{KhuyenMaiID:1,MaKhuyenMai:'AUTUMN10',TenKhuyenMai:'Autumn',PhanTramGiam:10,SoTienGiam:0,NgayBatDau:'2026-10-01 00:00:00',NgayKetThuc:'2026-10-31 23:59:59',TrangThai:'ACTIVE',LuotSuDung:0,TongSoTienGiam:0}],getPromotionStats:async()=>({SoChuongTrinh:1}),getPromotionHistory:async()=>[],savePromotion:()=>{saves++;return new Promise((_resolve,reject)=>{rejectSave=reject;});},deactivatePromotion:async()=>{stops++;}};
 const helpers={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/services/promotions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Error,Intl,Date});
 const modules={react:{useState(initial){const i=index++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v;}];},useRef(initial){return refs[refIndex++]||=( {current:initial} );},useEffect(fn){const i=effectIndex++;if(!effects[i])effects[i]=fn;}},
 'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
 '../components/AdminLayout':{Modal:'Modal'},'../components/CommerceUi':{PageTop:'PageTop'},'../components/MemberUi':{Pagination:'Pagination'},
 '../data/admin-utils':{money:String},'../services/catalog':{searchText:s=>s.toLowerCase()},'../services/admin-finance':service,'../services/promotions':helpers};
 const context={exports:{},Error,Promise,window:{setInterval:()=>1,clearInterval:()=>{}},FormData:class{constructor(data){this.data=data}get(key){return this.data[key]??null}},require:key=>{assert(modules[key],key);return modules[key];}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/pages/Promotions.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const all=node=>{if(!node||typeof node!=='object')return[];return[node,...Object.values(node).flatMap(value=>typeof value==='object'?all(value):[])];};
 const render=()=>{index=0;refIndex=0;effectIndex=0;tree=context.exports.default();};
 const nodes=()=>all(tree),button=text=>nodes().find(n=>n.type==='button'&&n.props.children===text);
 return{render,nodes,button,effects:()=>effects.forEach(fn=>fn()),reject:()=>rejectSave(new Error('Duplicate fixture code')),saves:()=>saves,stops:()=>stops};
}
test('submit is locked and errors stay inside the editor without closing it',async()=>{
 const p=page();p.render();p.effects();await tick();p.render();p.button('Sửa').props.onClick();p.render();
 const form=p.nodes().find(n=>n.type==='form');
 const event={preventDefault:()=>{},currentTarget:{code:'AUTUMN10',name:'Autumn',from:'2026-10-01T00:00:00',to:'2026-10-31T23:59:59',status:'ACTIVE',condition:''}};
 const pending=form.props.onSubmit(event);form.props.onSubmit(event);assert.equal(p.saves(),1);
 p.render();p.nodes().find(n=>n.type==='Modal').props.onClose();p.render();assert(p.nodes().some(n=>n.type==='Modal'));
 p.reject();await pending;p.render();assert(p.nodes().some(n=>n.type==='Modal'));assert(p.nodes().some(n=>n.props?.role==='alert'&&n.props.children==='Duplicate fixture code'));
});
test('stopping requires confirmation and sends one request on a double click',async()=>{
 const p=page();p.render();p.effects();await tick();p.render();p.button('Ngừng').props.onClick();p.render();assert.equal(p.stops(),0);
 const confirm=p.button('Xác nhận ngừng');confirm.props.onClick();confirm.props.onClick();assert.equal(p.stops(),1);await tick();p.render();assert(!p.nodes().some(n=>n.type==='Modal'));
});
