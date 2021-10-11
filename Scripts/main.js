
const apiData = require("./data/api.json")
const regex = new RegExp(/(?=\A|\.|\(|\b)love(\.[a-zA-Z]*)*/, 'g');


exports.activate = function() {
    // Do work when the extension is activated
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
}


function taggifyResults(entries) {
    let items = [];
    for (const [name, entry] of entries) {
        if("type" in entry && entry["type"] === "function") {
            let item = new CompletionItem(name, CompletionItemKind.Function);
            
            // The text to be inserted in the editor
            item.insertText = entry['snippet'];
            item.documentation = entry['description'];
            item.detail = 'LÖVE Function';
            item.insertTextFormat = InsertTextFormat.Snippet;
            
            items.push(item);
        } else {
            let item = new CompletionItem(name, CompletionItemKind.Package);
            
            item.detail = 'LÖVE Module'
            item.insertText = name;
            item.insertTextFormat = InsertTextFormat.PlainText;
            items.push(item);
        }
    }
    
    return items;
}


class CompletionProvider {
    constructor() {
        
    }
    
    provideCompletionItems(editor, context) {
        let text = context.text;
        
        for (const scope of context.selectors) {
            console.log(scope.string);
        }
        
        let matches = context.line.match(regex);
        if(matches === null) {
            return [];
        }
        // TODO: Fix the regex to automatically split groups on periods
        matches = matches[0].split('.');
        
        let level = apiData;
        let perfectMatch = true;
        for (const match of matches) {
            if(match in level) {
                level = level[match]
            } else {
                perfectMatch = false;
                break
            }
        }
        
        if(!perfectMatch) {
            // Filter the keys of the current level by startsWith(context.text)
            const currentKeys = Object.keys(level);
            const startMatching = currentKeys.filter((key) => key.startsWith(text));
            let items = taggifyResults(startMatching.map((key) => [key, level[key]]))
            return items;
        } else {
            if("type" in level && level["type"] === "function") {
                // Display function completion and documentation
                return taggifyResults([[level['name'], level]]);
            } else {
                // Currently we assume that this is just a module
                return taggifyResults(Object.entries(level));
            }
        }
    }
}

nova.assistants.registerCompletionAssistant("lua", new CompletionProvider());

