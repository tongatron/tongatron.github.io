import{a as i,b as m}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-Q2S27UIZ.js";import{a as g}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-UEOFDAP5.js";import{b as s,c as y}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-4UNIREAB.js";import{a as h}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-PJTTHMMS.js";import{b as d}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-7JMBK7IY.js";import{a,d as r}from"https://st-p.rmcdn1.net/4151880c/dist/c/c-NKV6RTLL.js";var c,n=a(()=>{"use strict";m();c={"template-common-alert":i`
	<%
		var categories = {
			'type-duplicate':				'category-upgrade',
			'type-create':					'category-upgrade',
			'type-export-pdf':				'category-upgrade',
			'type-export-code':				'category-upgrade',
			'type-more-pages':				'category-upgrade',
			'type-upload-fonts':			'category-upgrade',
			'type-custom-seo':				'category-upgrade',
			'type-custom-sharing':			'category-upgrade',
			'type-code-injection':			'category-upgrade',
			'type-widget-shots':			'category-upgrade',
			'type-publish-noemail':			'category-confirm-email',
			'type-publish-limit':			'category-upgrade',
			'type-publish-ecommerce':			'category-upgrade',
			'type-switch-desktop-create':	'category-mobile',
			'type-switch-desktop-continue':	'category-mobile',
			'type-browsers':				'category-browsers',
			'type-browsers-viewer':				'category-browsers',
			'type-shared-failed':			'category-shared-failed',
			'type-shared-unlock-page':		'category-shared-unlock-page',
		};

		var headers = {
			'category-upgrade':			'',
			'category-upgrade-skip':	'Push the Limits',
			'category-browsers':		'Browser Support',
			'category-shared-failed':	'Sorry, something<br/>went wrong.',
			'category-confirm-email':	'Account Activation',
		};

		var pricingUrl = readymagHost + "/pricing";

		var texts = {
			'type-duplicate':				'To duplicate this project you need to upgrade your account. You can find out more about our subscription plans <a href=' + pricingUrl + ' class="learn-more">here</a>.',
			'type-create':					'To create more projects you need to upgrade your account. You can find out more about our subscription plans <a href=' + pricingUrl + ' class="learn-more">here</a>.',
			'type-publish-noemail':			'Please verify your email address<br />to publish this project.',
			'type-publish-limit':			'Please upgrade your account<br />to publish more than one project.',
			'type-publish-ecommerce': 'Please upgrade your account<br />to publish project with ecommerce.',
			'type-export-pdf':				'Please upgrade your account<br/>to export the project to PDF.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-export-code':				'Please upgrade your account<br/>in order to export the source<br/>code of your projects.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-more-pages':				'Please upgrade your account<br/>to create more pages.<br><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-custom-seo':				'Please upgrade your account<br/> to customize SEO parameters.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-custom-sharing':			'Please upgrade your account<br/>to customize social sharing info.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-code-injection':			'Please upgrade your account to<br/>make custom code work after<br/>you publish the project.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-widget-shots':			'Please upgrade your account to<br/>make Shots widget work after<br/>you publish the project.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
			'type-browsers':				'Sorry, our Editor doesn’t support Internet Explorer. This may change in the future, but for now please use Chrome, Firefox or Safari.',
			'type-browsers-viewer':			'This site can\'t be displayed in Internet Explorer. Please switch to <a href="https://support.apple.com/en-jo/HT204416">Safari</a>, <a href="https://www.google.com/chrome/">Google Chrome</a>, <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>, or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.',
			'type-switch-desktop-create':	'To create a project, please use your laptop or desktop computer.',
			'type-switch-desktop-continue':	'To continue, please use your laptop or desktop computer.',
			'type-shared-failed':			'Please contact <a href="mailto:support@readymag.com" class="learn-more">support</a>.',
			'type-upload-fonts':			'Please upgrade your account<br/>to upload your own fonts.<br/><a href=' + pricingUrl + ' class="learn-more">See the pricing</a>.',
		};

		var buttons = {
			'category-upgrade':				'<a href="/settings#change-plan" class="button main upgrade">Upgrade</a><div class="cancel-wrapper">or ' + (['type-code-injection', 'type-widget-shots'].includes(opts.type) ? '<span class="button cancel" data-type="skip">Skip</span>' : '<span class="button cancel">Cancel</span>') + '</div>',
			'category-browsers':			'<div class="button main ok">Okay</div>',
			'category-mobile':				'<div class="button main ok">Okay</div>',
			'category-shared-failed':		'<div class="button close">Close</div>',
			'category-shared-unlock-page':	'<div class="button ok">OK</div>',
			'category-confirm-email':		'<div  class="button main resend">Resend</div><div class="cancel-wrapper">or <span class="button cancel">Cancel</span></div>',
		};

		var category = categories[opts.type]
		var header = headers[category]
		var text = texts[opts.type] || opts.text
		var button = buttons[category]
		var close_button = opts.close_button

		if (opts.is_contributor) {
			text = 'Please upgrade owner’s account<br/>to be able to use this feature.'
			button = '<a href="mailto:' + opts.owner_email + '" class="contact-link">Contact owner</a><div class="cancel-wrapper">' + (['type-code-injection', 'type-widget-shots'].includes(opts.type) ? 'or <span class="button cancel" data-type="skip">Skip</span>' : '<span class="button cancel">Cancel</span>') + '</div>'
		}

	%>

	<div class="alert-popup <%=category%>">
		<div class="panel-wrapper">
			<div class="center-table">
				<div class="center-cell">
					<div class="panel">

						<%=(close_button ? '<button class="close-button"><svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" role="img" class="css-4v4w9u-r e1pz65mu0"><path d="M5.95 4.536L9.778.707a1 1 0 011.414 1.414L7.364 5.95l3.828 3.828a1 1 0 01-1.414 1.414L5.95 7.364l-3.83 3.828A1 1 0 01.707 9.778L4.536 5.95.707 2.12A1 1 0 112.121.707L5.95 4.536z" fill="currentColor" fill-rule="evenodd"></path></svg></button>' : '')%>

						<%=(header ? '<div class="header">' + header + '</div>' : '')%>

						<div class="icon" <%=(opts.icon ? 'style="background-image:url(' + opts.icon + ')"' : "")%>><div class="icon-inner"></div></div>

						<%=(text ? '<div class="text">' + text + '</div>' : '')%>

						<%=(opts.type == 'type-browsers-viewer' ? '<div class="icon additional"></div>' : '')%>

						<%=(button ? '<div class="buttons">' + button + '</div>' : '')%>

					</div>
				</div>
			</div>
		</div>
	</div>
`}});var t,p,o,b,x,f=a(()=>{"use strict";t=r(h()),p=r(g()),o=r(d());n();y();b=p.default.View.extend({template:c["template-common-alert"],events:{"click .button":"onButtonClick","click .close-button":"hideOnCloseBtnClick",click:"hideOnBgClick","click .button.upgrade":"upgrade","click .button.cancel":"hide","click .button.close":"hide","click .button.ok":"hide","click .contact-link":"hide","click .button.resend":"resendConfirmationEmail"},initialize:function(e){o.default.bindAll(this),o.default.extend(this,e),this.opts=this.opts||{},this.router=this.router||RM.collectorRouter||RM.constructorRouter},render:function(){this.setElement((0,t.default)(this.template({opts:this.opts,readymagHost:s.readymag_host}))),this.$parent&&(this.$parent instanceof Element&&(this.$parent=(0,t.default)(this.$parent)),this.$parent.append(this.$el).addClass("visible")),o.default.delay(o.default.bind(function(){this.$el.addClass("show")},this),50),(0,t.default)("body").on("keyup",this.onBodyKeyUp),RM.common.disableShortcuts.alert=!0},hide:function(){delete RM.common.disableShortcuts.alert,(0,t.default)("body").off("keyup",this.onBodyKeyUp),this.$el.removeClass("show").addClass("hide"),o.default.delay(o.default.bind(function(){this.remove(),this.$parent&&this.$parent.removeClass("visible")},this),400),this.trigger("hide",{lastButtonClicked:this.lastButtonClicked})},upgrade:function(e){Modernizr.sessionstorage&&window.sessionStorage.setItem("rm.accountUpgradeReturnUrl",window.location.pathname),!(e.which==2||e.metaKey||e.ctrlKey)&&this.router&&this.router==RM.collectorRouter&&(this.hide(),this.router.navigate("/settings#change-plan",{trigger:!0}),e.preventDefault())},onBodyKeyUp:function(e){e.keyCode==27&&(e.stopPropagation(),e.preventDefault(),this.hide())},hideOnBgClick:function(e){(0,t.default)(e.target).closest(".panel").length||this.hide()},hideOnCloseBtnClick:function(){this.hide()},resendConfirmationEmail:function(){t.default.get("/auth/confirm/resend"),this.hide()},onButtonClick:function(e){let l=(0,t.default)(e.currentTarget),u=l.attr("data-type");this.lastButtonClicked=u}}),x=b});export{x as a,f as b};
