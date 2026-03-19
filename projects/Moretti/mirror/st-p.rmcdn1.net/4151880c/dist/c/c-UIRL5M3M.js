import{d as se,g as Ge}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-AXYSZWKV.js";import{a as ie,b as pe,k as Ue}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-UTRPI77Q.js";import{a as le,b as qe}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-EONLXWVS.js";import{a as M,d as Se}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-QMQK2I3J.js";import{m as j,r as k,v as Fe}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-AIHM4PPQ.js";import{h as E,i as Ie}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-5HNNIVUM.js";import{D as i,E as H,F}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-GLVKEI6A.js";import{a as C}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-H6G73KPB.js";import{a as g,d as b}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-NKV6RTLL.js";function Be(e){let o=(0,P.useRef)();return(0,P.useEffect)(()=>{o.current=e},[e]),o.current}var P,ce,ue=g(()=>{"use strict";P=b(C());ce=Be});function Ke({children:e}){let{current:o}=(0,s.useRef)(new Map),[n,a]=(0,s.useState)(null),v=ce(n),T=(0,s.useCallback)((p,c)=>(o.has(p)||o.set(p,c),()=>{o.delete(p)}),[]),h=(0,s.useCallback)(p=>{Array.from(o.entries()).filter(([c])=>c!==p).map(c=>c[1]).forEach(c=>c())},[]),x=(0,s.useCallback)(p=>p?v!==null:n!==null,[n,v]);return i(Je,{value:{subscribe:T,notifyTooltipsToClose:h,registerOpenedTooltip:p=>{a(p)},unregisterOpenedTooltip:()=>{a(null)},checkOpenedTooltips:x},children:e})}var s,de,Je,me,I=g(()=>{"use strict";s=b(C());ue();F();de=(0,s.createContext)({subscribe:()=>()=>{},notifyTooltipsToClose:()=>{},registerOpenedTooltip:()=>{},unregisterOpenedTooltip:()=>{},checkOpenedTooltips:()=>!1}),{Provider:Je}=de;me=()=>(0,s.useContext)(de)});var fe,Ne,S,U=g(()=>{"use strict";fe=b(C());F();Ne=(0,fe.forwardRef)(function(e,o){return i("svg",{width:"16",height:"8",xmlns:"http://www.w3.org/2000/svg",...e,ref:o,children:i("path",{d:"M12 4a4 4 0 1 1-8 0c0-2.21-1.795-4-4-4h16c-2.205 0-4 1.79-4 4z",fill:"currentColor",fillRule:"evenodd"})})}),S=Ne});function ge({controlled:e,default:o}){let n=e!==void 0,[a,v]=(0,R.useState)(o),T=n?e:a,h=(0,R.useCallback)(x=>{n||v(x)},[n]);return[T,h]}var R,ve=g(()=>{"use strict";R=b(C())});var Te,he=g(()=>{"use strict";Te={name:"reference-resize",enabled:!0,phase:"write",fn(){},effect:({state:e,instance:o})=>{let n=e.elements.reference,a=new ResizeObserver(()=>{window.requestAnimationFrame(()=>{o.update()})});return a.observe(n),function(){a&&a.disconnect()}}}});function G(e,o){return n=>{o&&o(n),e(n)}}var t,Qe,xe,Ve,We,we,Xe,be=g(()=>{"use strict";t=b(C());Ge();Ue();U();I();Se();qe();ve();Fe();Ie();he();F();Qe=M.withComponent(k("span")`
  line-height: 0;
  color: ${j("darkGray",.96)};
  position: absolute;
`),xe=M.withComponent(k("div")`
  display: flex;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${j("darkGray",.96)};
  font-weight: 500;
  font-size: 12px;
  letter-spacing: -0.08px;
`),Ve=k(M,{excludeProps:["interactive","indent"]})`
  pointer-events: ${e=>e.interactive?"auto":"none"};
  z-index: 9999;

  &[data-popper-placement^='top'] {
    [data-popper-tooltip] {
      margin-bottom: ${e=>e.indent}px;
    }

    [data-popper-arrow] {
      top: 100%;
    }
  }

  &[data-popper-placement^='bottom'] {
    [data-popper-tooltip] {
      margin-top: ${e=>e.indent}px;
    }

    [data-popper-arrow] {
      bottom: 100%;
      svg {
        transform: rotate(180deg);
      }
    }
  }

  &[data-popper-placement^='left'] {
    [data-popper-tooltip] {
      margin-right: ${e=>e.indent}px;
    }

    [data-popper-arrow] {
      left: calc(100% - 4px);
      svg {
        transform: rotate(-90deg);
      }
    }
  }

  &[data-popper-placement^='right'] {
    [data-popper-tooltip] {
      margin-left: ${e=>e.indent}px;
    }

    [data-popper-arrow] {
      right: calc(100% - 4px);
      svg {
        transform: rotate(90deg);
      }
    }
  }
`,We=ie.div,we=(0,t.forwardRef)(function(e,o){return i(Qe,{...e,ref:o,children:i(S,{})})}),Xe=(0,t.forwardRef)(function(e,o){let{children:n,text:a,arrow:v=!0,enterDelay:T=400,leaveDelay:h=0,open:x,placement:p="top",onOpen:c,onClose:q,disableHoverListeners:B=!1,closeOnTargetClick:Ce=!1,popperOptions:O,indent:J=0,skidding:K=0,preventOverflow:N=0,components:Q,componentsProps:A,instance:w=!1,disabled:Oe,stopPropagation:V,interactive:W=!1,listenReferenceResize:X=!1,popperRef:Y}=e,D=(0,t.useId)(),d=me(),[Z,ye]=(0,t.useState)(null),[ke,Me]=(0,t.useState)(null),[y,Pe]=(0,t.useState)(null),Re=E(ye,o),Ae=E(n.ref,Re),u=(0,t.useRef)(),m=(0,t.useRef)(),[_,ee]=ge({controlled:x,default:!1}),De=(0,t.useMemo)(()=>{let r=[{name:"arrow",enabled:!!y,options:{element:y}},{name:"offset",enabled:!0,options:{offset:[K,0]}},{name:"preventOverflow",enabled:!!N,options:{padding:N}},{...Te,enabled:X}];return O?.modifiers&&(r=r.concat(O.modifiers)),{placement:p,...O,modifiers:r}},[y,O,p,K,J,X]),l=se(Z,ke,De);(0,t.useEffect)(()=>{if(Y){let r={forceUpdate:l.forceUpdate,state:l.state,update:l.update};Y.current=r}},[l.forceUpdate,l.update,l.state]);let te=r=>{w&&(d.registerOpenedTooltip(D),d.notifyTooltipsToClose(D)),ee(!0),c&&c(r)},z=(r,He=!0)=>{He&&w&&d.unregisterOpenedTooltip(),u.current&&clearTimeout(u.current),ee(!1),q&&q(r)},oe=r=>{u.current&&clearTimeout(u.current),m.current&&clearTimeout(m.current),T&&!d.checkOpenedTooltips()?u.current=setTimeout(()=>{te(r)},T):te(r)},re=r=>{u.current&&clearTimeout(u.current),m.current&&clearTimeout(m.current),m.current=setTimeout(()=>{z(r)},h)};(0,t.useEffect)(()=>{if(w)return d.subscribe(D,()=>{u.current&&clearTimeout(u.current),m.current&&clearTimeout(m.current),z(void 0,!1)})},[w]);let ne=typeof a=="string",f={title:!_&&ne&&B?a:void 0,"aria-label":ne?a:void 0,...n.props,ref:Ae},L={interactive:W,indent:(y?.clientHeight??0)+J};B||(f.onMouseOver=G(oe,f.onMouseOver),f.onMouseLeave=G(re,f.onMouseLeave),W&&(L.onMouseOver=oe,L.onMouseLeave=re)),Ce&&(f.onClick=G(z,f.onClick));let ze={style:l.styles?.arrow,placement:l.state?.placement,"data-placement":l.attributes?.popper?.["data-popper-placement"],"data-popper-arrow":!0,...A?.arrow},Le={"data-popper-tooltip":!0,...A?.tooltip},$e=Q?.Tooltip||xe,je=Q?.Arrow||we,ae=Z?_:!1;Oe&&(ae=!1);let $={initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.2},...A?.motion};w&&(d.checkOpenedTooltips(!0)&&($.initial=!1),d.checkOpenedTooltips()&&($.exit=void 0));let Ee=(0,t.useCallback)(r=>{V&&(r.preventDefault(),r.stopPropagation())},[V]);return H(t.Fragment,{children:[(0,t.cloneElement)(n,f),i(pe,{children:ae?i(le,{children:i(Ve,{...l.attributes.popper,role:"tooltip",ref:Me,style:l.styles.popper,...L,children:i(We,{...$,children:H($e,{...Le,onClick:Ee,children:[a,v?i(je,{...ze,ref:Pe}):null]})})})}):null})]})})});var Ye=g(()=>{"use strict";be();U();I()});export{S as a,ce as b,ue as c,Ke as d,xe as e,we as f,Xe as g,Ye as h};
