import{p as c,m as l,E as u,T as h,P as m,i as f,a as p,x as y,d as N}from"./mateu-vaadin.js";function T(t,i){for(const{name:o}of t.attributes)i.hasAttribute(o)||t.removeAttribute(o);for(const{name:o,value:r}of i.attributes)t.setAttribute(o,r)}function s(t,i){const o=Array.from(i.childNodes),r=Array.from(t.childNodes),d=Math.max(o.length,r.length);for(let a=0;a<d;a++){const e=o[a],n=r[a];if(e&&!n){t.appendChild(e.cloneNode(!0));continue}if(!e&&n){t.removeChild(n);continue}if(e&&n){if(e.nodeType!==n.nodeType||e.nodeName!==n.nodeName){t.replaceChild(e.cloneNode(!0),n);continue}e.nodeType===Node.ELEMENT_NODE?(T(n,e),s(n,e)):e.nodeType===Node.TEXT_NODE&&n.nodeValue!==e.nodeValue&&(n.nodeValue=e.nodeValue)}}}function C(t,i){const o=document.createElement("template");o.innerHTML=c.sanitize(l.parse(i||""),{CUSTOM_ELEMENT_HANDLING:{tagNameCheck:r=>!0}}),s(t,o.content)}class E extends u(h(m(f))){static get is(){return"vaadin-markdown"}static get styles(){return p`
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    `}static get properties(){return{content:{type:String,sync:!0}}}render(){return y`<slot></slot>`}updated(i){super.updated(i),i.has("content")&&C(this,this.content)}}N(E);export{E as Markdown};
