import{Y as S,Z as D,ba as ee,fb as E,gb as P,hb as R,sc as oe}from"./c-2G6CBRC3.js";import{k as te}from"./c-ZZMJ6Q55.js";import{f as g,x as Y}from"./c-2EN3HULB.js";import{a as $,b as I}from"./c-LT324MZS.js";import{b as N,f as O,j as ie}from"./c-3MDRDWJ2.js";import{c,g as re}from"./c-XZD65RK5.js";import{a as v,d as X}from"./c-QMQK2I3J.js";import{k as L,l as _}from"./c-6Q6BGXQG.js";import{r as B,v as T}from"./c-AIHM4PPQ.js";import{a as C,j as J}from"./c-KJUOHZOF.js";import{c as h}from"./c-PV5ANMYI.js";import{D as a,F as f}from"./c-GLVKEI6A.js";import{a as H}from"./c-H6G73KPB.js";import{a as k,d as G}from"./c-NKV6RTLL.js";var V,ne,ae,Te,se=k(()=>{"use strict";V=G(H());X();T();J();_();te();Y();I();re();ie();f();ne=4,ae=(0,V.forwardRef)(({textDirection:t,autosize:r,columns:e,verticalAlign:u,bgColor:d,shouldShowSelectionBorder:x,scale:i,viewport:n,viewerOptions:m,children:M,useBaseline:U,isEditMode:F,selectionColor:s,disableSelectionHighlight:y,pointerEvents:j,applyStylesForNewViewer:z},A)=>{let{bg:K,selectionBg:b,selectionTextColor:w}=L(()=>{let o=d?g(d):void 0,Q=o?`rgba(${o.r}, ${o.g}, ${o.b}, ${o.a})`:void 0,l=s?.backgroundColor?g(s.backgroundColor):void 0,Z=y?"transparent":l?`rgba(${l.r}, ${l.g}, ${l.b}, ${l.a})`:void 0,p=s?.textColor?g(s.textColor):void 0,q=y?"inherit":p?`rgba(${p.r}, ${p.g}, ${p.b}, ${p.a})`:void 0;return{bg:Q,selectionBg:Z,selectionTextColor:q}},[d,y,s]);return a(v,{display:"flex",ref:A,height:!r||e&&e.count>1?"100%":"auto",flexDirection:"column",justifyContent:!u||u==="top"?"flex-start":"flex-end",backgroundColor:K,pointerEvents:j,css:h`
          // Цвет рамки выделенного блока
          --editor-border-color: ${x?C.blue:"transparent"};

          direction: ${t};

          // При включенных колонках обязательно устанавливаем hidden, чтобы большое кол-во контента
          // не выходило за пределы контейнера
          overflow: ${e&&e.count>1||!r?"hidden":"visible"};
          ${F?`padding: 0 ${ne}px;`:""};

          // Для вьювера
          // Сбрасывает зум у текста, и вместо него применяет трансформ.
          // Трансформ вместо зума нужен из-за того, что если коэффициент зума * line-height = дробное число,
          // высота строки рендерится с погрешностью,
          // и через несколько строчек начинает заметно не совпадать с линейками, выставленными по высоте строки.
          // (Высота самого блока текста при этом рендерится правильно. То же самое в конструкторе)
          // При трансформе высота строки рассчитывается правильно.
          ${i&&$.isOnForRatio(n||"default",i,m||{})&&$.isCSSZoom()?`
              width: ${`${1/i*100}%`};
              height: ${`${1/i*100}%`};
              zoom: ${1/i};
              transform: ${`scale(${i})`};
              transform-origin: left top;
            `:""}

          // Same for the 'viewer.next'
          ${z?N(O({width:`calc(1 / ${c`${o=>o.pageScale}`} * 100%)`,height:`calc(1 / ${c`${o=>o.pageScale}`} * 100%)`,zoom:`calc(1 / ${c`${o=>o.pageScale}`})`,transform:`scale(${c`${o=>o.pageScale}`})`,transformOrigin:"left top"})):""}

          // Колонки
          & > div {
            // т.к. обертка является флекс элементом, то колонки не будут работать на этом элементе
            // поэтому задаем стиль внутреннему компоненту (draft-root)
            ${e&&e.count>1&&`
            min-height: 100%;
            column-fill: auto;
            column-count: ${e.count};
            column-gap: ${e.gap}px;
          `}
          }

          // Custom text selection
          *::selection {
            ${w?`color: ${w};`:""}
            ${b?`background-color: ${b};`:""}
          }

          // Все что ниже: унаследовано из старого виджета
          .public-DraftEditor-content {
            white-space: normal !important;
            overflow-wrap: break-word;
          }

          .text-viewer {
            overflow-wrap: break-word;
            white-space: normal;
          }

          ${U?"":`
          .text-viewer span,
          .text-viewer a,
          & div[data-contents='true'] span,
          & div[data-contents='true'] a {
            line-height: inherit;
            vertical-align: top;
          }
        `}

          & div[data-contents='true'],
          .text-viewer {
            // Отключаем лигатуры, которые включены по-умолчанию
            font-feature-settings: 'liga' 0, 'rlig' 0, 'dlig' 0, 'hlig' 0, 'smcp' 0;
            -webkit-nbsp-mode: normal;
            -webkit-line-break: after-white-space;
            white-space: pre-wrap;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
          }
        `,children:M})}),Te=ae});function le({children:t,type:r,...e}){return r==="ordered-list-item"?a("ol",{style:{counterReset:D},...e,children:t}):a("ul",{...e,children:t})}var Re,Ne,Oe,W,Ve,pe=k(()=>{"use strict";T();oe();ee();f();Re=B(({children:t,...r})=>a(le,{...r,children:a("li",{children:t})}))``,Ne=t=>t==="ordered-list-item"||t==="unordered-list-item",Oe=({editorState:t,block:r})=>{let e=E({editorState:t,block:r,key:S});return typeof e=="string"?e:""},W=({block:t,editorState:r,styleName:e})=>P({editorState:r,block:t,key:S,value:e}),Ve=({style:t,currentStyle:r,editorState:e})=>R(e).reduce((x,i)=>{let n=x,m=n.getCurrentContent().getBlockForKey(i);return t===null?n=W({editorState:n,block:m,styleName:void 0}):t.name!==r&&(n=W({editorState:n,block:m,styleName:t.name})),n},e)});export{ne as a,Te as b,se as c,le as d,Re as e,Ne as f,Oe as g,Ve as h,pe as i};
