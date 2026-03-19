import{a,b as e}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-Q2S27UIZ.js";import{a as t}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-NKV6RTLL.js";var s,d=t(()=>{"use strict";e();s={"template-constructor-block-facebook-type_like_button":a`
	<div class="fb-like fb" data-href="<%-data.url ? data.url : 'http://readymag.com'%>" <%=data.share_button || data.send_button ? 'data-share="true"' : ''%> data-width="<%=data.w%>" data-show-faces="<%=data.show_faces%>" data-colorscheme="<%=data.theme%>" data-layout="<%=data.layout%>" data-type="data.type_like_button"></div>
	<div class="overlay"></div>
`,"template-constructor-block-facebook-type_page":a`
	<div class="fb-page fb" data-href="<%-data.url ? data.url : 'https://www.facebook.com/readymag'%>" data-width="<%=data.w%>" data-height="<%=data.h%>" data-show-facepile="<%=data.show_faces%>" data-colorscheme="<%=data.theme%>" data-tabs="<%=data.show_stream ? 'timeline, events, messages' : ''%>" data-show-border="true" data-small-header="<%=data.small_header%>" data-adapt-container-width="true"></div>
	<div class="overlay"></div>
`,"template-constructor-block-facebook-type_comments":a`
	<div class="fb-comments fb" data-href="<%-data.url ? data.url : 'http://readymag.com'%>" data-width="<%=data.w%>" data-num-posts="<%=data.num_posts%>" data-colorscheme="<%=data.theme%>"></div>
	<div class="overlay"></div>
`}});export{s as a,d as b};
