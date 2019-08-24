import * as sass from 'sass';

export async function convert(options: sass.Options): Promise<ConvertResult>{
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

export async function scssToCss(options: sass.Options): Promise<ConvertResult>{
    return convert({
        ...options,
        indentedSyntax: false,
    });
}

export async function sassToCss(options: sass.Options): Promise<ConvertResult>{
    return convert({
        ...options,
        indentedSyntax: true,
    });
}