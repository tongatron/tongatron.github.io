import{a as s,b as I}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-Q2S27UIZ.js";import{q as g,r as P}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-O3W7LXDX.js";import{a as W}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-UEOFDAP5.js";import{a as k}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-PJTTHMMS.js";import{b as O}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-7JMBK7IY.js";import{a as n,d as b}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-NKV6RTLL.js";var h,m=n(()=>{"use strict";I();h={"template-common-hotspot-widget":s`

    <div class="common-hotspot">
      <div class="pin"></div>
    </div>

`,"template-common-hotspot-widget-mobile-wrapper":s`

    <div class="hotspot-fullscreen-wrapper invisible">
        <div class="center-table">
            <div class="center-cell">

            </div>
        </div>
    </div>
    
`,"template-common-hotspot-widget-mobile-wrapper-for-constructor":s`
  
  <div class="hotspot-fullscreen-wrapper invisible"></div>

  `}});var f=n(()=>{"use strict"});var o,L,x,A,y=n(()=>{"use strict";f();o={w:30,h:30,x:"center",pinPosRelativeTip:"above",pin_type:"icon",bg_color:"ff8888",bg_opacity:1,borders:0,color:"000000",opacity:1,tip_x:null,tip_y:null,tip_w:240,tip_h:120,tip_show_on:"click","tip_background-color":"ffffff","tip_background-color-opacity":100,"tip_border-radius":8,"tip_box-shadow":!0,"tip_box-fullscreen":!1,tipBorder:0,tipBorderColor:"000000",tipBorderOpacity:100,wids:[],flags:{tipFreePosition:!0}},L=280,x=15,A={WIDTH_OF_BLOCK_WITHOUT_WIDGET:o.tip_w,HEIGHT_OF_BLOCK_WITHOUT_WIDGET:o.tip_h,MIN_WORKSPACE_SIZE_TO_DISPLAY_CONTROL_VERTICALLY:365}});var T,w,v,E,V,B=n(()=>{"use strict";T=b(k()),w=b(W()),v=b(O());m();P();y();E=w.default.View.extend({initialize:function(t){t&&(v.default.bindAll(this),this.block=t.block,this.model=t.model,this.$container=t.$container,this.environment=t.environment,this.mag=t.mag,this.template=h["template-common-hotspot-widget"],this.render())},render:function(){this.setElement((0,T.default)(this.template({data:this.model}))),this.environment==="viewer"&&(this.apply_tip_container_size({width:this.model.tip_w,height:this.model.tip_h}),this.apply_tip_position(this.model)),this.$el.appendTo(this.$container)},apply_tip_container_size:function(t){t&&this.$(".tip").css(t)},apply_tip_bg_color:function(t){this.$(".blocks-wrapper").css("background-color",g.getRGBA(t["tip_background-color"],t["tip_background-color-opacity"]/100))},apply_tip_border_radius:function(t){this.$(".blocks-wrapper").add(this.$(".tip")).css("border-radius",t["tip_border-radius"]+"px")},applyTipBorder:function(t){this.$(".border-wrapper").css("border",`${t.tipBorder||o.tipBorder}px solid ${g.getRGBA(t.tipBorderColor||o.tipBorderColor,(t.tipBorderOpacity||o.tipBorderOpacity)/100)}`)},apply_tip_box_shadow:function(t){this.$(".tip").toggleClass("box-shadow",!!t["tip_box-shadow"])},apply_tip_position:function(t){if(t.flags?.tipFreePosition||!1){let c=this.$(".tip"),i={};return t.fixed_position==="sw"||t.fixed_position==="s"?(i.bottom=t.tip_y-t.y,i.left=t.tip_x-t.x,i.top="",i.right=""):t.fixed_position==="se"?(i.bottom=t.tip_y-t.y,i.right=t.tip_x-t.x,i.top="",i.left=""):t.fixed_position==="e"||t.fixed_position==="ne"?(i.top=t.tip_y-t.y,i.right=t.tip_x-t.x,i.left="",i.bottom=""):(i.top=t.tip_y-t.y,i.left=t.tip_x-t.x,i.right="",i.bottom=""),c.css(i),i}else{let c=this.$(".tip"),i=t.tip_pos,l=t.tip_w,_=t.tip_h||120,a=t.w,d=t.h,e="",r="",p=x,u;return i==="top"?(e=-(p+_),r=a/2-l/2):i==="right"?(e=d/2-_/2,r=a+p):i==="bottom"?(e=d+p,r=a/2-l/2):i==="left"&&(e=d/2-_/2,r=-(p+l)),u={top:e,left:r},c.css(u),u}},destroy:function(){this.remove()}}),V=E});export{f as a,h as b,m as c,o as d,L as e,A as f,y as g,V as h,B as i};
