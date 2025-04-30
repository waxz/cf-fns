

//https://stackoverflow.com/questions/7975005/format-a-javascript-string-using-placeholders-and-an-object-of-substitutions
//https://stackoverflow.com/questions/15877362/declare-and-initialize-a-dictionary-in-typescript

interface Dictionary<T> {
    [Key: string]: T;
}

export function template_replace(stringWithPlaceholders:string, replacements:Dictionary<any>):string{
    
    const data = stringWithPlaceholders.replace(
      /{(\w+)}/g, 
      (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
      replacements.hasOwnProperty(placeholderWithoutDelimiters) ? 
        replacements[placeholderWithoutDelimiters] : placeholderWithDelimiters
    );
    return data;
}