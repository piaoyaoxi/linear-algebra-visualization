import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const routes = [
  'linear-map-definition','linear-map-operations','matrix-of-linear-map',
  'eigenvalues-eigenvectors','diagonal-matrices','image-and-kernel',
  'invariant-subspaces','jordan-form-introduction','minimal-polynomial',
];
const base='http://127.0.0.1:4173/learn.html';
const out='test-results/ch7-visual-audit';
await mkdir(out,{recursive:true});
const report=[];
const browser=await chromium.launch({headless:true});

async function capture({theme='light', viewport={width:1440,height:1000}, reducedMotion='no-preference', prefix}){
 const context=await browser.newContext({viewport,reducedMotion});
 const page=await context.newPage();
 const errors=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(`console:${m.text()}`)});
 page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
 await page.goto(`${base}#ch7`,{waitUntil:'networkidle'});
 await page.evaluate(t=>localStorage.setItem('la-visual-theme',t),theme);
 for(const route of routes){
   await page.goto(`${base}#ch7/${route}`,{waitUntil:'networkidle'});
   await page.waitForTimeout(200);
   const metrics=await page.evaluate(()=>({
     pageWidth:document.documentElement.scrollWidth,
     viewportWidth:document.documentElement.clientWidth,
     pageHeight:document.documentElement.scrollHeight,
     labRect:(()=>{const e=document.querySelector('.ch7-lab');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})(),
     h1:document.querySelector('h1')?.textContent?.trim(),
     labTitle:document.querySelector('.interactive-block h2,.ch7-lab h3')?.textContent?.trim(),
     controls:document.querySelectorAll('.ch7-lab button,.ch7-lab input').length,
     paragraphs:document.querySelectorAll('.ch7-lab p').length,
   }));
   report.push({prefix,theme,viewport,route,errors:[...errors],...metrics});
   await page.screenshot({path:`${out}/${prefix}-${route}-full.png`,fullPage:true});
   const lab=page.locator('.ch7-lab');
   if(await lab.count()) await lab.screenshot({path:`${out}/${prefix}-${route}-lab.png`});
 }
 await context.close();
}

await capture({theme:'light',prefix:'desktop-light'});
await capture({theme:'dark',prefix:'desktop-dark'});
await capture({theme:'light',viewport:{width:390,height:844},reducedMotion:'reduce',prefix:'mobile-light-reduced'});

const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
await page.goto(`${base}#ch4/matrix-language`,{waitUntil:'networkidle'});
await page.screenshot({path:`${out}/reference-ch4-section1-full.png`,fullPage:true});
const blocks=page.locator('.ch4-section1-presentation,.interactive-block');
for(let i=0;i<await blocks.count();i++) await blocks.nth(i).screenshot({path:`${out}/reference-ch4-section1-block-${i}.png`});
await context.close();
await browser.close();
await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));
console.log('visual audit captured',report.length,'section states');
