import { extend, isNil, isFunction, hasOwn } from './common';

export function isGradient(g) {
    return g && g['colorStops'];
}

export function getGradientStamp(g) {
    var keys = [g['type']];
    if (g['places']) {
        keys.push(g['places'].join());
    }
    if (g['colorStops']) {
        var stops = [];
        for (var i = g['colorStops'].length - 1; i >= 0; i--) {
            stops.push(g['colorStops'][i].join());
        }
        keys.push(stops.join(','));
    }
    return keys.join('_');
}

export function getSymbolStamp(symbol) {
    var keys = [];
    if (Array.isArray(symbol)) {
        for (var i = 0; i < symbol.length; i++) {
            keys.push(getSymbolStamp(symbol[i]));
        }
        return '[ ' + keys.join(' , ') + ' ]';
    }
    for (var p in symbol) {
        if (hasOwn(symbol, p)) {
            if (!isFunction(symbol[p])) {
                if (isGradient(symbol[p])) {
                    keys.push(p + '=' + getGradientStamp(symbol[p]));
                } else {
                    keys.push(p + '=' + symbol[p]);
                }
            }
        }
    }
    return keys.join(';');
}

export function lowerSymbolOpacity(symbol, ratio) {
    function s(_symbol, _ratio) {
        var op = _symbol['opacity'];
        if (isNil(op)) {
            _symbol['opacity'] = _ratio;
        } else {
            _symbol['opacity'] *= _ratio;
        }
    }
    var lower;
    if (Array.isArray(symbol)) {
        lower = [];
        for (var i = 0; i < symbol.length; i++) {
            var d = extend({}, symbol[i]);
            s(d, ratio);
            lower.push(d);
        }
    } else {
        lower = extend({}, symbol);
        s(lower, ratio);
    }
    return lower;
}

export function extendSymbol(symbol) {
    var sources = Array.prototype.slice.call(arguments, 1);
    if (!sources || !sources.length) {
        sources = [{}];
    }
    if (Array.isArray(symbol)) {
        var s, dest, i, ii, l, ll;
        var result = [];
        for (i = 0, l = symbol.length; i < l; i++) {
            s = symbol[i];
            dest = {};
            for (ii = 0, ll = sources.length; ii < ll; ii++) {
                if (!Array.isArray(sources[ii])) {
                    extend(dest, s, sources[ii] ? sources[ii] : {});
                } else if (!isNil(sources[ii][i])) {
                    extend(dest, s, sources[ii][i]);
                } else {
                    extend(dest, s ? s : {});
                }
            }
            result.push(dest);
        }
        return result;
    } else {
        var args = [{}, symbol];
        args.push.apply(args, sources);
        return extend.apply(this, args);
    }
}
