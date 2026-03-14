const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
            let filepath = path.join(dir, file);
            fs.stat(filepath, (err, stats) => {
                if (err) throw err;
                if (stats.isDirectory()) {
                    walk(filepath, callback);
                } else if (stats.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.ts'))) {
                    callback(filepath);
                }
            });
        });
    });
}

const replaceColors = (filepath) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) throw err;
        let original = data;
        
        // Replace blue-* with primary-*
        let modified = original.replace(/\bblue-/g, 'primary-');
        
        // Replace emerald-* with secondary-*
        modified = modified.replace(/\bemerald-/g, 'secondary-');

        if (original !== modified) {
            fs.writeFile(filepath, modified, 'utf8', (err) => {
                if (err) throw err;
                console.log(`Updated ${filepath}`);
            });
        }
    });
};

walk(path.join(__dirname, '../src'), replaceColors);
