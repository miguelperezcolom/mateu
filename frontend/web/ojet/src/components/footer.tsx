/**
 * @license
 * Copyright (c) 2014, 2025, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
import { h } from "preact";

type Props = {
  links?: FooterLink[]
}

type FooterLink = {
  name: string;
  linkId: string;
  linkTarget: string;
}

const _DEFAULT_LINKS: FooterLink[] = [
  {
    name: "About Oracle",
    linkId: "aboutOracle",
    linkTarget: "http://www.oracle.com/us/corporate/index.html#menu-about"
  },
  {
    name: "Contact Us",
    linkId: "contactUs",
    linkTarget: "http://www.oracle.com/us/corporate/contact/index.html"
  },
  {
    name: "Legal Notices",
    linkId: "legalNotices",
    linkTarget: "http://www.oracle.com/us/legal/index.html"
  },
  {
    name: "Terms Of Use",
    linkId: "termsOfUse",
    linkTarget: "http://www.oracle.com/us/legal/terms/index.html"
  },
  {
    name: "Your Privacy Rights",
    linkId: "yourPrivacyRights",
    linkTarget: "http://www.oracle.com/us/legal/privacy/index.html"
  }
]

export function Footer({ links = _DEFAULT_LINKS } : Props ) {
  return (
    <footer class="oj-web-applayout-footer" role="contentinfo">
      <div class="oj-web-applayout-footer-item oj-web-applayout-max-width">
        <ul>
          {links.map((item) => (
            <li>
              <a id={item.linkId} href={item.linkTarget} target="_blank">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div class="oj-web-applayout-footer-item oj-web-applayout-max-width oj-text-color-secondary oj-typography-body-sm">
        Copyright © 2014, 2025 Oracle and/or its affiliates All rights reserved.
      </div>
    </footer>
  );
}
