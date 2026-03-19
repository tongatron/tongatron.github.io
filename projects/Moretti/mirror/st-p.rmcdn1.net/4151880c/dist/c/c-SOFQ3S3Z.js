import{a as ct,b as zt}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-4NKLQNAV.js";import{G as tt,H as et,J as ot,K as rt,M as nt,N as it,R as Bt,U as g,X as Rt,Z as w,_ as L,aa as st,ba as lt,h as Y,i as Ut,j as h,l as q,m as D,qa as O,ra as Nt}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-2G6CBRC3.js";import{k as N}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-ZZMJ6Q55.js";import{c as X,f as J,i as Q,p as Z,x as R}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-2EN3HULB.js";import{a as At}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-RESKZF5T.js";import{a as E,c as vt}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-6Q6BGXQG.js";import{D as It,v as G}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-YIA2NDPQ.js";import{k as Dt,l as at,m as Ot}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-KJUOHZOF.js";import{D as T,F as C}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-GLVKEI6A.js";import{a as V}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-H6G73KPB.js";import{a as m,b as B}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-YAWH3OHD.js";import{b as K,c as Ct}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-4UNIREAB.js";import{a as b,d as I}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-NKV6RTLL.js";var pt,yt,Vt,A,dt=b(()=>{"use strict";B();pt=({userId:t})=>m.get(`/api/list-styles/global/${t}`),yt=({projectId:t})=>m.get(`/api/list-styles/project/${t}`),Vt=({userId:t,styles:r})=>m.put(`/api/list-styles/global/${t}`,{styles:r}),A=({projectId:t,styles:r})=>m.put(`/api/list-styles/project/${t}`,{styles:r})});var St,mt,Xt,z,gt=b(()=>{"use strict";B();St=({userId:t})=>m.get(`/api/link-styles/global/${t}`),mt=({projectId:t})=>m.get(`/api/link-styles/project/${t}`),Xt=({userId:t,styles:r})=>m.put(`/api/link-styles/global/${t}`,{styles:r}),z=({projectId:t,styles:r})=>m.put(`/api/link-styles/project/${t}`,{styles:r})});var ft,ut,Zt,H,xt=b(()=>{"use strict";B();ft=({userId:t})=>m.get(`/api/text-styles/global/${t}`),ut=({projectId:t})=>m.get(`/api/text-styles/project/${t}`),Zt=({userId:t,styles:r})=>m.put(`/api/text-styles/global/${t}`,{styles:r}),H=({projectId:t,styles:r})=>m.put(`/api/text-styles/project/${t}`,{styles:r})});function _(){return Ht.map(t=>({...t,name:`style-${ct()}`}))}var Ht,re,ht=b(()=>{"use strict";zt();D();Ht=[{label:"H1",tag:"h1",cssProperties:{color:"22222264",fontFamily:"Roboto",fontStyle:"normal",textAlign:"left",fontSize:48,fontWeight:700,letterSpacing:0,lineHeight:60,paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0}},{label:"H2",tag:"h2",cssProperties:{color:"22222264",fontFamily:"Georgia",fontStyle:"normal",textAlign:"left",fontSize:24,fontWeight:400,letterSpacing:0,lineHeight:30,paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0}},{label:"Text",tag:"p",cssProperties:{color:"22222264",fontFamily:"Georgia",fontStyle:"normal",textAlign:"left",fontSize:18,fontWeight:400,letterSpacing:0,lineHeight:23,paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0}},{label:"Caption",tag:"p",cssProperties:{color:"22222232",fontFamily:"Georgia",fontStyle:"italic",textAlign:"left",fontSize:14,lineHeight:18,letterSpacing:0,fontWeight:400,paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0}}];re=[{label:"List item",cssProperties:{color:"22222264",fontFamily:h.fontFamily,fontStyle:h.fontStyle,textAlign:"left",fontSize:h.fontSize,fontWeight:Number(h.fontWeight),letterSpacing:0,lineHeight:h.lineHeight,paddingRight:0,paddingLeft:0,width:26}}]});var M,kt=b(()=>{"use strict";R();M=(t,r)=>t?`${t}${X(typeof r=="number"?r:100)}`:""});var F,$t,bt,wt=b(()=>{"use strict";vt();D();N();R();Ct();kt();F=(t,r)=>{let i=u=>{switch(u){case"none":return"None";case"dotted":return"Dotted";case"dashed":return"Dashed";case"solid":return"Solid";default:break}},o=u=>r?`${r}-${u}`:u,p=typeof t[o("color")]<"u"?t[o("color")]:t.color,s=typeof t[o("opacity")]<"u"?t[o("opacity")]:t.opacity,d=typeof t[o("u-color")]<"u"?t[o("u-color")]:t["u-color"],f=typeof t[o("u-opacity")]<"u"?t[o("u-opacity")]:t["u-opacity"],x=typeof t[o("u-size")]<"u"?t[o("u-size")]:t["u-size"],y=typeof t[o("u-offset")]<"u"?t[o("u-offset")]:t["u-offset"],j=typeof t[o("u-style")]<"u"?t[o("u-style")]:t["u-style"];return{textColor:M(String(p==="inherit"?t.color:p),Number(s==="inherit"?t.opacity:s)),color:M(String(d==="inherit"?t["u-color"]:d),Number(f==="inherit"?t["u-opacity"]:f)),size:Number(x==="inherit"?t["u-size"]:x),padding:Number(y==="inherit"?t["u-offset"]:y),type:i(j)}},$t=t=>t.map(i=>{let{_name:o,_caption:p}=i,s=F(i),d=F(i,"hover"),f=F(i,"current");return{name:o,label:p,style:{link:s,hover:d,current:f}}}),bt=t=>{let r=["none",0,"baseline"],i=["opacity"];return t.map(o=>{let{_name:p,_caption:s,tag:d,_sort:f,...x}=o,y=Object.keys(x).reduce((u,a)=>{let l=E(a),c=x[a];if(i.includes(a)||r.includes(c))return{...u};if(l==="textAlign"&&c==="start")c="left";else if(l==="color"){let n=Number(x.opacity),e=n>0?parseFloat((n/100).toFixed(2)):1,S=Z(String(c),e);c=Q(S)}else l.includes("padding")?c=Number(c):l==="fontWeight"&&c==="normal"&&(c=h.fontWeight);return{...u,[l]:c}},{});return y.paddingLeft=y.paddingLeft||0,y.paddingRight=y.paddingRight||0,y.paddingTop=y.paddingTop||0,y.paddingBottom=y.paddingBottom||0,{name:p,label:s,tag:d||K.AVAILABLE_TEXT_TAGS[0],cssProperties:y}})}});var U,Lt=b(()=>{"use strict";Ut();lt();D();U={...Y,...st,...q}});function Mt(t){if(!t)return T("div",{style:{width:"100%"}});let r=(0,jt.useMemo)(()=>P(t),[t.type,t.size,t.color,t.padding]);return T("div",{style:{...r,width:"100%"}})}var jt,P,Pe,Tt=b(()=>{"use strict";jt=I(V());R();N();C();P=t=>{let{type:r="None",color:i="00000064",size:o=1,padding:p=0}=t||{},{r:s,g:d,b:f,a:x}=J(i),y=`rgba(${s}, ${d}, ${f}, ${x})`,j="repeat-x",u=o+p,a=u>0?"0 100%":`0 ${100+u}%`,l={textDecoration:"none",paddingBottom:Math.max(0,u)};switch(r){case"Solid":return{...l,background:`linear-gradient(to right, ${y} 0%, ${y} 100%) ${a}/1px ${o}px ${j}`};case"Dotted":return{...l,background:`linear-gradient(to right, ${y} 0%, ${y} 50%, transparent 50%, transparent 100%) ${a}/${o*2}px ${o}px ${j}`};case"Dashed":return{...l,background:`linear-gradient(to right, ${y} 0%, ${y} 66.6666%, transparent 66.6666%, transparent 100%) ${a}/${o*3}px ${o}px ${j}`};default:return{...l,background:"none"}}};Pe=Mt});function Pt({mode:t}){let[r,i]=tt(),[o,p]=ot(),[s,d]=nt();(0,k.useEffect)(()=>{if(t==="constructor"){let a=[],l=[],c=[];if(!r.project.length){let e=window.ServerData.textStyles,S=_();if(!e||!e.project||!e.project.length){let $=window.ServerData?.editParams?.paragraph_styles;$&&$.length&&(S=bt($))}a=e?.project&&e?.project.length?e.project:S,i({global:e?.global||[],project:a})}if(!o.project.length){let e=window.ServerData.linkStyles,S=[O];if(!e||!e.project||!e.project.length){let $=window.ServerData.editParams&&window.ServerData.editParams.link_styles;$&&$.length&&(S=$t($))}l=e?.project&&e.project.length?e.project:S,p({global:e?.global||[],project:l})}if(!s.project.length){let e=window.ServerData.listStyles;c=e?.project&&e?.project.length?e.project:[],d({global:e?.global||[],project:c})}let n=[];a.length&&!(0,v.default)(a,window.ServerData.textStyles?.project||[])&&n.push(H({styles:a,projectId:window.ServerData.projectId})),l.length&&!(0,v.default)(l,window.ServerData.linkStyles?.project||[])&&n.push(z({styles:l,projectId:window.ServerData.projectId})),c.length&&!(0,v.default)(c,window.ServerData.listStyles?.project||[])&&n.push(A({styles:c,projectId:window.ServerData.projectId})),n.length&&Promise.all(n)}if(t==="viewer"||t==="screenshoter"){let a=t==="viewer",l=a?window.ServerData?.mags?.mag?.textStyles||window.RM?.viewerRouter?.mag?.textStyles:window.ServerData?.mag?.textStyles;l&&i({global:l?.global?.length?l.global:[],project:l?.project?.length?l.project:[]});let c=a?window.ServerData?.mags?.mag?.linkStyles||window.RM?.viewerRouter?.mag?.linkStyles:window.ServerData?.mag?.linkStyles;c&&p({global:c?.global?.length?c.global:[],project:c?.project?.length?c.project:[]});let n=a?window.ServerData?.mags?.mag?.listStyles||window.RM?.viewerRouter?.mag?.listStyles:window.ServerData?.mag?.listStyles;n&&d({global:n?.global?.length?n.global:[],project:n?.project?.length?n.project:[]})}},[]);let f=(0,k.useMemo)(()=>Object.keys(U).map(l=>U[l].style).join(" "),[U]),x=(0,k.useMemo)(()=>{let a=n=>{let e=Et(n.cssProperties);return`${e.textAlign}`==="justify"&&(e.whiteSpace="normal"),` .${n.name} { ${g(e)} } `},l=r.global.map(a),c=r.project.map(a);return[...l,...c].join(" ")},[r]),y=(0,k.useMemo)(()=>{let a=G(h,["fontWeights","fontVariationSettings"]);return g(a)},[]),j=(0,k.useMemo)(()=>{let a=e=>{let S={...e.cssProperties};return typeof S.width=="number"&&(S.minWidth=S.width),S.lineHeight&&delete S.lineHeight,`
        .${e.name}-preview {
          ${g(e.cssProperties)}
        }
        .${e.name}.edit-mode .editor-block-wrapper {
          display: ${!e.listPosition||e.listPosition==="inside"?"block":"flex"};
        }
        .${e.name}.edit-mode .editor-block-wrapper:before, .${e.name}.edit-mode div[data-offset-key]:before {
          display: inline-block;
          ${g(S)}
          ${!e.listPosition||e.listPosition==="inside"?"line-height: 1;":""}
          ${e.baselineShift?`transform: translateY(${e.baselineShift}px);`:""}
        }
        .${e.name}.view-mode {
          display: ${!e.listPosition||e.listPosition==="inside"?"list-item":"flex"};
        }
        .${e.name}.view-mode:before {
          display: inline-block;
          ${g(S)}
          ${!e.listPosition||e.listPosition==="inside"?"line-height: 1;":""}
          ${e.baselineShift?`transform: translateY(${e.baselineShift}px);`:""}
        }

        .unordered-list-item.${e.name}.edit-mode div[data-offset-key]:before {
          content: "${e.markerContent||"\u2022"}\\00a0";
          display: ${!e.listPosition||e.listPosition==="inside"?"inline-block":"none"};
          white-space: nowrap;
        }
        .unordered-list-item.${e.name}.edit-mode .editor-block-wrapper:before {
          content: "${e.markerContent||"\u2022"}\\00a0";
          display: ${e.listPosition&&e.listPosition==="outside"?"inline-block":"none"};
          white-space: nowrap;
        }

        .ordered-list-item.${e.name}.edit-mode div[data-offset-key]:before {
          counter-increment: ${w};
          content: counter(${w})".";
          display: ${!e.listPosition||e.listPosition==="inside"?"inline-block":"none"};
          white-space: nowrap;
        }

        .ordered-list-item.${e.name}.edit-mode .editor-block-wrapper:before {
          counter-increment: ${w};
          content: counter(${w})".";
          display: ${e.listPosition&&e.listPosition==="outside"?"inline-block":"none"};
          white-space: nowrap;
        }

        .unordered-list-item .${e.name}.view-mode:before {
          content: "${e.markerContent||"\u2022"}\\00a0";
        }`},l=`
      .unstyled {
        ${y}
      }

      .${L}.edit-mode .editor-block-wrapper {
        display: flex;
      }
      .${L}.view-mode {
        display: flex;
      }
      .${L}.view-mode:before {
        display: inline-block;
      }

      .unordered-list-item.${L}.edit-mode .editor-block-wrapper:before {
        content: "\u2022\\00a0";
        display: inline-block;
      }
      .unordered-list-item.${L}.edit-mode div[data-offset-key]:before {
        content: "\u2022\\00a0";
        display: none;
      }

      .ordered-list-item.${L}.edit-mode .editor-block-wrapper:before {
        counter-increment: ${w};
        content: counter(${w})".";
        display: inline-block;
        white-space: nowrap;
      }
      .ordered-list-item.${L}.edit-mode div[data-offset-key]:before {
        counter-increment: ${w};
        content: counter(${w})".";
        display: none;
        white-space: nowrap;
      }

      .unordered-list-item .${L}.view-mode:before {
        content: "\u2022\\00a0";
      }`,c=s.global.map(a),n=s.project.map(a);return[l,...c,...n].join(" ")},[s,y]),u=(0,k.useMemo)(()=>{let a=n=>{let e=n.style?.link?`
        .${n.name} {
          ${g(P(n.style.link))}
          ${g({color:n.style.link.textColor})}
        }

        .${n.name} * {
          ${g({color:n.style.link.textColor})}
        }`:"",S=n.style?.hover?`
        .${n.name} .hover, .${n.name}:hover {
          ${g(P(n.style.hover))}
          ${g({color:n.style.hover.textColor},!0)}
        }

        .${n.name} .hover *, .${n.name}:hover * {
            ${g({color:n.style.hover.textColor},!0)}
        }`:"",$=n.style?.current?`
        .${n.name}.current {
          ${g(P(n.style.current))}
          ${g({color:n.style.current.textColor})}
        }

        .${n.name}.current * {
          ${g({color:n.style.current.textColor})}
        }`:"";return`
        ${e}
        ${S}
        ${$}
      `},l=o.global.map(a),c=o.project.map(a);return[...l,...c].join(" ")},[o]);return T(Wt,{blockStyles:f,textStyleSheet:x,linkStyleSheet:u,listStyleSheet:j})}var k,v,W,Ft,Wt,Et,Qe,Ze,Gt=b(()=>{"use strict";k=I(V()),v=I(At());It();W=I(Dt());Ot();dt();gt();xt();ht();wt();Nt();Bt();Lt();Rt();Tt();N();lt();D();C();Ft=async()=>{let t=window.RM.constructorRouter.mag.get("_id"),r=window.RM.constructorRouter.mag.get("user")._id;if(!t||!r)throw new Error("Cannot load text styles");let[{data:i},{data:o},{data:p},{data:s},{data:d},{data:f}]=await Promise.all([ut({projectId:t}),ft({userId:r}),mt({projectId:t}),St({userId:r}),yt({projectId:t}),pt({userId:r})]);return{textStyles:{global:o&&o.length?o:[],project:i&&i.length?i:_()},linkStyles:{global:s&&s.length?s:[],project:p&&p.length?p:[O]},listStyles:{global:f&&f.length?f:[],project:d&&d.length?d:[]}}},Wt=(0,k.memo)(t=>T("style",{dangerouslySetInnerHTML:{__html:at(`
          ${t.blockStyles}
          ${t.linkStyleSheet}
          ${t.listStyleSheet}
          ${t.textStyleSheet}
        `)}}),(t,r)=>(0,v.default)(t,r)),Et=t=>Object.keys(t).reduce((r,i)=>{let o=t[i];return typeof o=="string"&&`${o}`.includes("(")&&!String(o).includes(")")&&(o=`${o})`),o&&i==="opacity"&&parseInt(String(o))>1&&(o=parseInt(`${o}`)/100),{...r,[i]:o}},{});Qe=t=>{let r="text-global-styles",i=document.querySelector(`#${r}`);i?W.default.render(T(Pt,{mode:t}),i):(i=document.createElement("div"),i.id=r,document.body.appendChild(i),W.default.render(T(Pt,{mode:t}),i))},Ze=async({newTextStyles:t,newLinkStyles:r,newListStyles:i})=>{let o=await Ft();if(t&&t.length){let p=t.filter(s=>!o.textStyles.project.some(d=>d.name===s.name));if(p.length){let s=[...o.textStyles.project,...p];et({global:o.textStyles.global,project:s}),H({styles:s,projectId:window.ServerData.projectId})}}if(i&&i.length){let p=i.filter(s=>!o.listStyles.project.some(d=>d.name===s.name));if(p.length){let s=[...o.listStyles.project,...p];it({global:o.listStyles.global,project:s}),A({styles:s,projectId:window.ServerData.projectId})}}if(r&&r.length){let p=r.filter(s=>!o.linkStyles.project.some(d=>d.name===s.name));if(p.length){let s=[...o.linkStyles.project,...p];rt({global:o.linkStyles.global,project:s}),z({styles:s,projectId:window.ServerData.projectId})}}}});export{Zt as a,H as b,xt as c,Vt as d,A as e,dt as f,Xt as g,z as h,gt as i,M as j,kt as k,$t as l,bt as m,wt as n,Pe as o,Tt as p,Ft as q,Pt as r,Qe as s,Ze as t,Gt as u};
