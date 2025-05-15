import {all} from '@vaadin/vaadin-lumo-styles/all-imports';


console.log('hola');
const sheet = document.createElement('style');
sheet.setAttribute('data-type', 'lumo-new');
sheet.innerHTML = `
${all.cssText}
`;
document.body.appendChild(sheet);