import{a as t,b as a}from"./c-Q2S27UIZ.js";import{a as e}from"./c-NKV6RTLL.js";var l,r=e(()=>{"use strict";a();l={"template-constructor-block-twitter-type_tweet":t`
	<a href="https://twitter.com/share" class="twitter-share-button" data-url="<%-url%>" data-lang="en" data-size="<%=large_button ? 'large' : 'medium'%>" data-text="<%- typeof text !== 'undefined' ? text : ''%>">Tweet</a>
	<div class="overlay"></div>
`,"template-constructor-block-twitter-type_follow":t`
	<a href="https://twitter.com/<%-username ? username : 'Readymag'%>" class="twitter-follow-button" data-show-count="false" data-show-screen-name="<%=show_name ? 'true' : 'false'%>" data-lang="en" data-size="<%=large_button ? 'large' : 'medium'%>">Follow @<%-username%></a>
	<div class="overlay"></div>
`,"template-constructor-block-twitter-type_hashtag":t`
	<a href="https://twitter.com/intent/tweet?button_hashtag=<%-hash%>" class="twitter-hashtag-button" data-size="<%=large_button ? 'large' : 'medium'%>">Tweet #<%-hash%></a>
	<div class="overlay"></div>
`,"template-constructor-block-twitter-type_timeline":t`
	<%=code%>
	<div class="overlay"></div>
`,"template-constructor-block-twitter-type_embed":t`
	<%=code%>
	<div class="overlay"></div>
`}});export{l as a,r as b};
