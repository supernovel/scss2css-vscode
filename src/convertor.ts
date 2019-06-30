import * as sass from 'sass';
import { cssToScss } from './css2scss';

export interface ConvertResult{
    text: string;
}

export async function scss2css(options: sass.Options): Promise<ConvertResult>{
    const { data } = options;

    if(data && data.length){
        return new Promise((resolve, reject) => {
            sass.render({
                ...options,
                outputStyle: 'expanded',
            }, (error, result) => {
                if(error){
                    reject(new Error(
                        `${error.name} 
                        ${error.message}`
                    ));
                }else{
                    resolve({
                        text: result.css.toString()
                    });
                }
            });
        });
    }else{
        throw new Error('Require not empty string.');
    }
} 

export async function css2sass({ data }: { data: string }): Promise<ConvertResult>{
    const scssContent = await cssToScss(data);

    return {
        text: scssContent
    };
} 