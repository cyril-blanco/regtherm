// Load styles
require('./styles.less');

// Load libs
var parser = require('./dataParser');
var app = require('./widget/widget');

// Set language
var lang = navigator.language || navigator.userLanguage;
app.lang = lang.split('-')[0];

// Render app
app.render('#svg_container');

// Set titles
document.getElementById('title').innerHTML = app.getTranslation('title');
document.getElementById('load_file').innerHTML = app.getTranslation('load_file');
document.getElementById('load_paste').innerHTML = app.getTranslation('load_paste');
document.getElementById('load_paste_submit').innerHTML = app.getTranslation('load_paste_submit');
document.getElementById('load_paste_clear').innerHTML = app.getTranslation('load_paste_clear');

// Open data load form on click
document.getElementById('toggle_form').innerHTML = app.getTranslation('load');
document.getElementById('toggle_form').onclick = function() {
    if (document.getElementById('input_data').className !== 'open') {
        document.getElementById('input_data').className = 'open';
    } else {
        document.getElementById('input_data').className = '';
    }
};

// Save
document.getElementById('save').innerHTML = app.getTranslation('save');
document.getElementById('save').onclick = function() {
    var imgName = 'Regtherm';
    if (app.title) {
        imgName = imgName + ' - ' + app.title.replace(',', ' -');
    }
    imgName = imgName + '.png';
    
    saveAsImage(imgName);
};

// Input file
document.getElementById('input_file').onchange = function() {
    var file = this.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('data_input').value = e.target.result;
            document.getElementById('input_file').value = null;
            textAreaValidate();
        };
    
        reader.readAsText(file);
    }
};

// Textarea on validate
var textarea = document.getElementById('data_input');
document.getElementById('load_paste_submit').onclick = textAreaValidate;

function textAreaValidate() {
    document.getElementById('input_data').className = '';
    app.updateData(parser.parse(document.getElementById('data_input').value.trim()));
}

// Clear textarea
document.getElementById('load_paste_clear').onclick = function() {
    textarea.value = '';
};

/**
 * Save as image
 * 
 * @param imgName
 */
function saveAsImage(imgName) {
    var svg = document.getElementById('svg_container');
    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');

    // Update canvas size
    d3.select('canvas').attr({
        width: app.width,
        height: app.height
    });

    var image = new Image();
    image.src = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(svg.innerHTML.trim())));
    image.onload = function() {
        context.drawImage(image, 0, 0);

        var a = document.createElement('a');
        a.download = imgName;
        a.href = canvas.toDataURL('image/png');
        a.click();
    };
}
