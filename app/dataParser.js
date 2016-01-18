// Create object
var parser = function(){};

parser.parse = function(str) {
    var tmp = str.split('\n');
    
    var region = tmp[0].substr(0, tmp[0].indexOf(','));
    var dateStr = tmp[0].substr(tmp[0].indexOf(',') + 5, 10).split('.');
    var date = new Date(dateStr[2], dateStr[1] - 1, dateStr[0]);
    
    var altitudes = [];
    var start = 0;
    if (tmp[2].substr(14, 21).indexOf('1') > -1) {
        start = 1000 - 200 * tmp[2].substr(14, 21).indexOf('1');
    } else {
        start = 2000 - 200 * tmp[2].substr(14, 21).indexOf('2');
    }

    for (var i = 0; i < 21; i++) {
        altitudes.push(start + i * 200);
    }

    tmp = tmp.slice(3);
    tmp.pop();

    var data = {
        region: region,
        date: date,
        altitudes: altitudes,
        hours: [],
        data: []
    };
    tmp.forEach(function(line) {
        data.data.push({
            time: line.substr(0, 5),
            temp: line.substr(7, 2),
            tD: line.substr(11, 2),
            vario: line.substr(14, 21),
            therm: line.substr(37, 3),
            cumuli: line.substr(41, 8),
            top: line.substr(50, 9),
            cl: line.substr(61, 1),
            cm: line.substr(64, 1),
            ch: line.substr(67, 1),
            wind_deg: line.substr(70, 3),
            wind_kt: line.substr(74, 2),
            turb: line.substr(78, 1),
            ns: line.substr(80, 4),
            tPFD: line.substr(86, 3),
            kum: line.substr(91, 3)
        });
    });

    data.data.forEach(function(line) {
        var time = new Date();
        time.setHours(parseInt(line.time.substr(0, 2)));
        time.setMinutes(parseInt(line.time.substr(3, 2)));
        time.setSeconds(0, 0);

        data.hours.push(time);
        
        var vario = line.vario.split('');
        vario = vario.map(function(item) {
            item = item.replace(':', '-');
            
            if (!isNaN(item)) {
                item = parseInt(item) * 0.5;
            }
            
            return item;
        });

        line.time = time;
        line.temp = parseInt(line.temp);
        line.tD = parseInt(line.tD);
        line.vario = vario;
        line.therm = line.therm.trim().length > 0 ? parseFloat(line.therm) : null;
        line.cumuli = line.cumuli.trim().length;
        line.top = line.top.split('-');
        line.cl = parseInt(line.cl);
        line.cm = parseInt(line.cm);
        line.ch = parseInt(line.ch);
        line.wind_deg = parseInt(line.wind_deg);
        line.wind_kt = parseInt(line.wind_kt);
        line.wind_kmh = Math.round(line.wind_kt * 1.852);
        line.turb = line.turb.trim().length > 0 ? line.turb.trim() : null;
        line.ns = line.ns.trim().length > 0 ? line.ns.trim() : null;
        line.tPFD = line.tPFD.trim().length > 0 ? parseInt(line.tPFD) : null;
        line.kum = line.kum.trim().length > 0 ? parseInt(line.kum) : null;
    });

    return data;
};

module.exports = parser;
