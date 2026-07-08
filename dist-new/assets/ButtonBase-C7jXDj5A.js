import{a as e,n as t,t as n}from"./jsx-runtime-DWSWI4JT.js";import{L as r,S as i,a,b as o,g as s,l as c,x as l,z as u}from"./Box-BXx8GWiY.js";var d=e(t(),1),f=typeof window<`u`?d.useLayoutEffect:d.useEffect;function p(e){let t=d.useRef(e);return f(()=>{t.current=e}),d.useRef((...e)=>(0,t.current)(...e)).current}var m=p;function h(...e){let t=d.useRef(void 0),n=d.useCallback(t=>{let n=e.map(e=>{if(e==null)return null;if(typeof e==`function`){let n=e,r=n(t);return typeof r==`function`?r:()=>{n(null)}}return e.current=t,()=>{e.current=null}});return()=>{n.forEach(e=>e?.())}},e);return d.useMemo(()=>e.every(e=>e==null)?null:e=>{t.current&&=(t.current(),void 0),e!=null&&(t.current=n(e))},e)}var g=h;function _(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function v(e,t){return v=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},v(e,t)}function y(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,v(e,t)}var b=d.createContext(null);function x(e){if(e===void 0)throw ReferenceError(`this hasn't been initialised - super() hasn't been called`);return e}function S(e,t){var n=function(e){return t&&(0,d.isValidElement)(e)?t(e):e},r=Object.create(null);return e&&d.Children.map(e,function(e){return e}).forEach(function(e){r[e.key]=n(e)}),r}function C(e,t){e||={},t||={};function n(n){return n in t?t[n]:e[n]}var r=Object.create(null),i=[];for(var a in e)a in t?i.length&&(r[a]=i,i=[]):i.push(a);var o,s={};for(var c in t){if(r[c])for(o=0;o<r[c].length;o++){var l=r[c][o];s[r[c][o]]=n(l)}s[c]=n(c)}for(o=0;o<i.length;o++)s[i[o]]=n(i[o]);return s}function w(e,t,n){return n[t]==null?e.props[t]:n[t]}function T(e,t){return S(e.children,function(n){return(0,d.cloneElement)(n,{onExited:t.bind(null,n),in:!0,appear:w(n,`appear`,e),enter:w(n,`enter`,e),exit:w(n,`exit`,e)})})}function ee(e,t,n){var r=S(e.children),i=C(t,r);return Object.keys(i).forEach(function(a){var o=i[a];if((0,d.isValidElement)(o)){var s=a in t,c=a in r,l=t[a],u=(0,d.isValidElement)(l)&&!l.props.in;c&&(!s||u)?i[a]=(0,d.cloneElement)(o,{onExited:n.bind(null,o),in:!0,exit:w(o,`exit`,e),enter:w(o,`enter`,e)}):!c&&s&&!u?i[a]=(0,d.cloneElement)(o,{in:!1}):c&&s&&(0,d.isValidElement)(l)&&(i[a]=(0,d.cloneElement)(o,{onExited:n.bind(null,o),in:l.props.in,exit:w(o,`exit`,e),enter:w(o,`enter`,e)}))}}),i}var E=Object.values||function(e){return Object.keys(e).map(function(t){return e[t]})},D={component:`div`,childFactory:function(e){return e}},O=function(e){y(t,e);function t(t,n){var r=e.call(this,t,n)||this;return r.state={contextValue:{isMounting:!0},handleExited:r.handleExited.bind(x(r)),firstRender:!0},r}var n=t.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},t.getDerivedStateFromProps=function(e,t){var n=t.children,r=t.handleExited;return{children:t.firstRender?T(e,r):ee(e,n,r),firstRender:!1}},n.handleExited=function(e,t){var n=S(this.props.children);e.key in n||(e.props.onExited&&e.props.onExited(t),this.mounted&&this.setState(function(t){var n=u({},t.children);return delete n[e.key],{children:n}}))},n.render=function(){var e=this.props,t=e.component,n=e.childFactory,r=_(e,[`component`,`childFactory`]),i=this.state.contextValue,a=E(this.state.children).map(n);return delete r.appear,delete r.enter,delete r.exit,t===null?d.createElement(b.Provider,{value:i},a):d.createElement(b.Provider,{value:i},d.createElement(t,r,a))},t}(d.Component);O.propTypes={},O.defaultProps=D;var k={};function A(e,t){let n=d.useRef(k);return n.current===k&&(n.current=e(t)),n}var j=[];function te(e){d.useEffect(e,j)}var M=class e{static create(){return new e}currentId=null;start(e,t){this.clear(),this.currentId=setTimeout(()=>{this.currentId=null,t()},e)}clear=()=>{this.currentId!==null&&(clearTimeout(this.currentId),this.currentId=null)};disposeEffect=()=>this.clear};function N(){let e=A(M.create).current;return te(e.disposeEffect),e}function P(e){try{return e.matches(`:focus-visible`)}catch{}return!1}function ne(e){let{focusableWhenDisabled:t,disabled:n,composite:r=!1,tabIndex:i=0,isNativeButton:a}=e,o=r&&t!==!1,s=r&&t===!1;return d.useMemo(()=>{let e={onKeyDown(e){n&&t&&e.key!==`Tab`&&e.preventDefault()}};return r||(e.tabIndex=i,!a&&n&&(e.tabIndex=t?i:-1)),(a&&(t||o)||!a&&n)&&(e[`aria-disabled`]=n),a&&(!t||s)&&(e.disabled=n),e},[r,n,t,o,s,a,i])}var F={};function re(e){let{nativeButton:t,nativeButtonProp:n,internalNativeButton:r=t,allowInferredHostMismatch:i=!1,disabled:a,type:o,hasFormAction:s=!1,tabIndex:c=0,focusableWhenDisabled:l,stopEventPropagation:u=!1,onBeforeKeyDown:f,onBeforeKeyUp:p}=e,m=d.useRef(null),h=l===!0,g=ne({focusableWhenDisabled:h,disabled:a,isNativeButton:t,tabIndex:c}),_=d.useCallback(()=>{let e=m.current;return e==null?t:e.tagName===`BUTTON`?!0:!!(e.tagName===`A`&&e.href)},[t]),v=d.useMemo(()=>{let e=h?{}:{tabIndex:a?-1:c};return t?(e.type=o===void 0&&!s?`button`:o,h||(e.disabled=a)):(e.role=`button`,!h&&a&&(e[`aria-disabled`]=a)),h?{...e,...g}:e},[a,h,g,s,t,c,o]);return{getButtonProps:d.useCallback((e=F)=>{let{onClick:t,onKeyDown:n,onKeyUp:r,...i}=e,o=e=>{if(u&&e.stopPropagation(),a){e.preventDefault();return}t?.(e)},s=e=>{if(h&&g.onKeyDown(e),!a&&(f?.(e),n?.(e),!(e.target!==e.currentTarget||_()))){if(e.key===` `){e.preventDefault();return}e.key===`Enter`&&(e.preventDefault(),e.currentTarget.click())}},c=e=>{a||(p?.(e),r?.(e),e.target===e.currentTarget&&!_()&&e.key===` `&&!e.defaultPrevented&&e.currentTarget.click())};return{...v,...i,onClick:o,onKeyDown:s,onKeyUp:c}},[v,a,h,g,_,f,p,u]),rootRef:m}}var I=class e{static create(){return new e}static use(){let t=A(e.create).current,[n,r]=d.useState(!1);return t.shouldMount=n,t.setShouldMount=r,d.useEffect(t.mountEffect,[n]),t}constructor(){this.ref={current:null},this.mounted=null,this.didMount=!1,this.shouldMount=!1,this.setShouldMount=null}mount(){return this.mounted||(this.mounted=L(),this.shouldMount=!0,this.setShouldMount(this.shouldMount)),this.mounted}mountEffect=()=>{this.shouldMount&&!this.didMount&&this.ref.current!==null&&(this.didMount=!0,this.mounted.resolve())};start(...e){this.mount().then(()=>this.ref.current?.start(...e))}stop(...e){this.mount().then(()=>this.ref.current?.stop(...e))}pulsate(...e){this.mount().then(()=>this.ref.current?.pulsate(...e))}};function ie(){return I.use()}function L(){let e,t,n=new Promise((n,r)=>{e=n,t=r});return n.resolve=e,n.reject=t,n}var R=n();function z(e){let{className:t,classes:n,pulsate:r=!1,rippleX:a,rippleY:o,rippleSize:s,in:c,onExited:l,timeout:u}=e,[f,p]=d.useState(!1),m=i(t,n.ripple,n.rippleVisible,r&&n.ripplePulsate),h={width:s,height:s,top:-(s/2)+o,left:-(s/2)+a},g=i(n.child,f&&n.childLeaving,r&&n.childPulsate);return!c&&!f&&p(!0),d.useEffect(()=>{if(!c&&l!=null){let e=setTimeout(l,u);return()=>{clearTimeout(e)}}},[l,c,u]),(0,R.jsx)(`span`,{className:m,style:h,children:(0,R.jsx)(`span`,{className:g})})}var B=o(`MuiTouchRipple`,[`root`,`ripple`,`rippleVisible`,`ripplePulsate`,`child`,`childLeaving`,`childPulsate`]),V=550,H=r`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`,U=r`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`,W=r`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`,G=c(`span`,{name:`MuiTouchRipple`,slot:`Root`})({overflow:`hidden`,pointerEvents:`none`,position:`absolute`,zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:`inherit`}),K=c(z,{name:`MuiTouchRipple`,slot:`Ripple`})`
  opacity: 0;
  position: absolute;

  &.${B.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${H};
    animation-duration: ${V}ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
  }

  &.${B.ripplePulsate} {
    animation-duration: ${({theme:e})=>e.transitions.duration.shorter}ms;
  }

  & .${B.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${B.childLeaving} {
    opacity: 0;
    animation-name: ${U};
    animation-duration: ${V}ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
  }

  & .${B.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${W};
    animation-duration: 2500ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`,ae=d.forwardRef(function(e,t){let{center:n=!1,classes:r={},className:o,...s}=a({props:e,name:`MuiTouchRipple`}),[c,l]=d.useState([]),u=d.useRef(0),f=d.useRef(null);d.useEffect(()=>{f.current&&=(f.current(),null)},[c]);let p=d.useRef(!1),m=N(),h=d.useRef(null),g=d.useRef(null),_=d.useCallback(e=>{let{pulsate:t,rippleX:n,rippleY:a,rippleSize:o,cb:s}=e;l(e=>[...e,(0,R.jsx)(K,{classes:{ripple:i(r.ripple,B.ripple),rippleVisible:i(r.rippleVisible,B.rippleVisible),ripplePulsate:i(r.ripplePulsate,B.ripplePulsate),child:i(r.child,B.child),childLeaving:i(r.childLeaving,B.childLeaving),childPulsate:i(r.childPulsate,B.childPulsate)},timeout:V,pulsate:t,rippleX:n,rippleY:a,rippleSize:o},u.current)]),u.current+=1,f.current=s},[r]),v=d.useCallback((e={},t={},r=()=>{})=>{let{pulsate:i=!1,center:a=n||t.pulsate,fakeElement:o=!1}=t;if(e?.type===`mousedown`&&p.current){p.current=!1;return}e?.type===`touchstart`&&(p.current=!0);let s=o?null:g.current,c=s?s.getBoundingClientRect():{width:0,height:0,left:0,top:0},l,u,d;if(a||e===void 0||e.clientX===0&&e.clientY===0||!e.clientX&&!e.touches)l=Math.round(c.width/2),u=Math.round(c.height/2);else{let{clientX:t,clientY:n}=e.touches&&e.touches.length>0?e.touches[0]:e;l=Math.round(t-c.left),u=Math.round(n-c.top)}if(a)d=Math.sqrt((2*c.width**2+c.height**2)/3),d%2==0&&(d+=1);else{let e=Math.max(Math.abs((s?s.clientWidth:0)-l),l)*2+2,t=Math.max(Math.abs((s?s.clientHeight:0)-u),u)*2+2;d=Math.sqrt(e**2+t**2)}e?.touches?h.current===null&&(h.current=()=>{_({pulsate:i,rippleX:l,rippleY:u,rippleSize:d,cb:r})},m.start(80,()=>{h.current&&=(h.current(),null)})):_({pulsate:i,rippleX:l,rippleY:u,rippleSize:d,cb:r})},[n,_,m]),y=d.useCallback(()=>{v({},{pulsate:!0})},[v]),b=d.useCallback((e,t)=>{if(m.clear(),e?.type===`touchend`&&h.current){h.current(),h.current=null,m.start(0,()=>{b(e,t)});return}h.current=null,l(e=>e.length>0?e.slice(1):e),f.current=t},[m]);return d.useImperativeHandle(t,()=>({pulsate:y,start:v,stop:b}),[y,v,b]),(0,R.jsx)(G,{className:i(B.root,r.root,o),ref:g,...s,children:(0,R.jsx)(O,{component:null,exit:!0,children:c})})});function q(e){return l(`MuiButtonBase`,e)}var J=o(`MuiButtonBase`,[`root`,`disabled`,`focusVisible`]),oe=e=>{let{disabled:t,focusVisible:n,focusVisibleClassName:r,suppressFocusVisible:i,classes:a}=e,o=s({root:[`root`,t&&`disabled`,n&&!i&&`focusVisible`]},q,a);return n&&!i&&r&&(o.root+=` ${r}`),o},se=c(`button`,{name:`MuiButtonBase`,slot:`Root`})({display:`inline-flex`,alignItems:`center`,justifyContent:`center`,position:`relative`,boxSizing:`border-box`,WebkitTapHighlightColor:`transparent`,backgroundColor:`transparent`,outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:`pointer`,userSelect:`none`,verticalAlign:`middle`,MozAppearance:`none`,WebkitAppearance:`none`,textDecoration:`none`,color:`inherit`,"&::-moz-focus-inner":{borderStyle:`none`},[`&.${J.disabled}`]:{pointerEvents:`none`,cursor:`default`},"@media print":{colorAdjust:`exact`}}),Y=d.forwardRef(function(e,t){let n=a({props:e,name:`MuiButtonBase`}),{action:r,centerRipple:o=!1,children:s,className:c,component:l=`button`,disabled:u=!1,disableRipple:f=!1,disableTouchRipple:p=!1,focusRipple:h=!1,focusVisibleClassName:_,focusableWhenDisabled:v,suppressFocusVisible:y=!1,internalNativeButton:b,LinkComponent:x=`a`,nativeButton:S,onBlur:C,onClick:w,onContextMenu:T,onDragLeave:ee,onFocus:E,onFocusVisible:D,onKeyDown:O,onKeyUp:k,onMouseDown:A,onMouseLeave:j,onMouseUp:te,onTouchEnd:M,onTouchMove:N,onTouchStart:ne,tabIndex:F=0,TouchRippleProps:I,touchRippleRef:L,type:z,...B}=n,V=!!(B.href||B.to),H=!!B.formAction,U=l;U===`button`&&V&&(U=x);let W=typeof U==`string`?U===`button`:b??!1,G=S??W,K=ie(),q=g(K.ref,L),[J,Y]=d.useState(!1);(u||y)&&J&&Y(!1);let ce=m(e=>{h&&!e.repeat&&J&&e.key===` `&&K.stop(e,()=>{K.start(e)})}),le=m(e=>{h&&e.key===` `&&J&&!e.defaultPrevented&&K.stop(e,()=>{K.pulsate(e)})}),{getButtonProps:ue,rootRef:Z}=re({nativeButton:G,nativeButtonProp:S,internalNativeButton:W,allowInferredHostMismatch:V||typeof U==`string`,disabled:u,type:z,hasFormAction:H,tabIndex:F,onBeforeKeyDown:ce,onBeforeKeyUp:le}),{onClick:de,onKeyDown:fe,onKeyUp:pe,...me}=ue({onClick:w,onKeyDown:O,onKeyUp:k});d.useImperativeHandle(r,()=>({focusVisible:()=>{Y(!0),Z.current.focus()}}),[Z]);let he=K.shouldMount&&!f&&!u;d.useEffect(()=>{J&&h&&!f&&K.pulsate()},[f,h,J,K]);let ge=X(K,`start`,A,p),_e=X(K,`stop`,T,p),ve=X(K,`stop`,ee,p),ye=X(K,`stop`,te,p),be=X(K,`stop`,e=>{J&&e.preventDefault(),j&&j(e)},p),xe=X(K,`start`,ne,p),Se=X(K,`stop`,M,p),Ce=X(K,`stop`,N,p),we=X(K,`stop`,e=>{P(e.target)||Y(!1),C&&C(e)},!1),Te=m(e=>{Z.current||=e.currentTarget,!y&&P(e.target)&&(Y(!0),D&&D(e)),E&&E(e)}),Q={};V&&(Q.tabIndex=u?-1:F,u&&(Q[`aria-disabled`]=u),Q.type=z);let Ee=g(t,Z),$={...n,centerRipple:o,component:l,disabled:u,disableRipple:f,disableTouchRipple:p,focusRipple:h,suppressFocusVisible:y,tabIndex:F,focusVisible:J},De=oe($);return(0,R.jsxs)(se,{as:U,className:i(De.root,c),ownerState:$,onBlur:we,onClick:de,onContextMenu:_e,onFocus:Te,onKeyDown:fe,onKeyUp:pe,onMouseDown:ge,onMouseLeave:be,onMouseUp:ye,onDragLeave:ve,onTouchEnd:Se,onTouchMove:Ce,onTouchStart:xe,ref:Ee,...V?Q:me,...B,children:[s,he?(0,R.jsx)(ae,{ref:q,center:o,...I}):null]})});function X(e,t,n,r=!1){return m(i=>(n&&n(i),r||e[t](i),!0))}export{b as a,g as c,p as d,f,N as i,h as l,P as n,y as o,M as r,_ as s,Y as t,m as u};