/**
 * refer to https://github.com/Firebrand/styleflux
 */
import * as sass from 'sass';
import * as prettier from 'prettier';
import { merge } from 'lodash'; 

const BLOCK_REGEXP = /\s*(([^\{\}]+)\{([^\{\}]+)\})\s*/;

function processCssHead(headContent: string){
    headContent = headContent.trim();
  
    if (headContent.substr(0, 6) !== '@media') {
        headContent = headContent
            .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g, '')
            .replace(/"/g, '\\"')
            .replace(/([^\s\(])(\.)([^\s])/g, '$1{&$2$3')
            .replace(/(\s*::\s*)(?=([^\(]*\([^\(\)]*\))*[^\)]*$)/g, '{&:')
            .replace(/([^&])\s*:\s*(?=([^\(]*\([^\(\)]*\))*[^\)]*$)/g, '$1{&:')
            .replace(/(\s*>\s*)/g, '{>')
            .replace(/(\s*\+\s*)/g, '{+')
            .replace(/\s(?=([^"]*"[^"]*")*[^"]*$)/g, '{')
            .replace(/(\s*{\s*)/g, '":{"');
    }
  
    return `"${headContent}"`;
}

function processCssBody(bodyContent: string): string{
    const bodyContentArray = bodyContent.replace(/(\s*;(?![a-zA-Z\d]+)\s*)(?=([^\(]*\([^\(\)]*\))*[^\)]*$)/g, '~').split('~');
    
    return bodyContentArray.reduce((result, attributeText) => {
        if(attributeText){
            result += `"${attributeText.replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/(\s*;\s*)(?=([^\(]*\([^\(\)]*\))*[^\)]*$)/g, '","')
                .replace(/(\s*:\s*)/, '":"')
                .trim()}",`;
        }

        return result;
    }, '').slice(0, -1);
}

function cssToSingleLine(cssContent:string): string{
    return cssContent.replace(/(?:\r\n|\r|\n)/g, '')
        .replace(/^\s*\/\/.*/gm, '')
        .replace(/\/\*.*\*\//g, '');
}

function cssToArray(cssContent:string): Array<string>{
    return (cssContent.match(new RegExp(BLOCK_REGEXP, 'g')) || []).slice();
}

function cssArrayToObject(cssArray:Array<string>): object{
    return cssArray.reduce((result, block) => {
        let [ head, body ] = (BLOCK_REGEXP.exec(block) || []).slice(2);
        let headContents;

        head = head.trim();
        
        if(head.substr(0, 1) === '@'){
            headContents = [head];
        }else{
            headContents = head.split(',').map(text => text.trim());
        }

        headContents.forEach((headContent) => {
            headContent = processCssHead(headContent);
            const bodyContent = processCssBody(body);

            const closingBracketsInHead = (headContent.match(/{/g) || []).length;
            const completeClause = `${headContent}:{${bodyContent}${'}'.repeat(closingBracketsInHead + 1)}`;
        
            const objectClause = JSON.parse(`{${completeClause}}`);
            merge(result, objectClause);
        });

        return result;
    }, {});
}

function cssObjectToScss(cssObject: any): string{
    const keys = Object.keys(cssObject);
  
    return keys.reduce((result, key) => {
        const value = cssObject[key];
        if(typeof value === 'string'){
            result += `${key}:${value};`;
        }else if(value){
            result += `${key}{${cssObjectToScss(value)}}`;
        }

        return result;
    }, '');
}

export async function cssToObject(cssContent: string): Promise<{
    charset: string,
    data: object   
}> {
    let plainCss: string;
    
    const result: sass.Result = await new Promise((resolve, reject) => {
        sass.render({data: cssContent}, (error, reulst) => {
            if(error){
                reject(error);
            }else{
                resolve(reulst);
            }
        });
    });

    const charsetRegExp = /^@charset\s\"([^\"]+)\";/;
    
    plainCss = result.css.toString();
    plainCss = cssToSingleLine(plainCss);
    
    const charset = (plainCss.match(charsetRegExp) || [])[0];
    
    plainCss = plainCss.replace(charsetRegExp, '');
    
    const cssArray = cssToArray(plainCss);
    const cssObject = cssArrayToObject(cssArray);

    return {
        charset,
        data: cssObject
    };
}
 
export async function cssToScss(cssContent: string){
    const { charset = '', data:cssObject } = await cssToObject(cssContent);
    let scssContent = cssObjectToScss(cssObject);
    return prettier.format(`${charset}${scssContent}`, { parser: 'scss' });
}