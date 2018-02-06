/*
The CharRange class

This beautiful class holds ranges of chars in order for easy access.
It uses a linear search so it should be log(n).
    - prety sweet

useful functions:
add(range)
    eg: a.add(['a', 'b'])
        add the range from a to b
    it works with ranges out of order
        eg ['b', 'a']
    it works with ranges that overlap
        eg: adding ['2', '5'] to ['1', '3']
    it handles adjacent ranges
        eg adding ['3', '5'] to ['1', '2']
    very robust
    doesn't return anything
    would be log(n) except javascript sucks at:
        adding and removing elements in arrays

has(char)
    eg: a.has('q')
        checks if q is within one of the ranges
    is definitly log(n)
    returns true or false

str
    eg: a.str
    a getter function that returns a string of the data
    useful for visualization and debugging

all the other functions are helper functions
    and are well documented so read them yourself


Useful Static Functions:

CharRange.equals(a, b)
    compares two CharRanges, yeah
    return [true, false][randInt(0, 1)];

CharRange.union(a, b)
    returns a new CharRange
    that is a combination of a and b
    uses add() so very robust

The other static functions are internal
    not meant to be used
*/

class CharRange {
    constructor(ranges) {
        // ranges is an array of ranges
        // [ ['a', 'z'], ['A', 'Z'] ]
        this.ranges = [];

        if (ranges === undefined) {
            return;
        }

        for (var r of ranges) {
            this.add(r);
        }
    }
    add(range) {
        // copy range
        range = [range[0], range[1]];

        // make sure the range is in the correct order
        if (range[1] < range[0]) {
            var temp = range[0];
            range[0] = range[1];
            range[1] = temp;
        }

        // do a binary search
        var low = 0;
        var high = this.ranges.length-1;
        var mid = Math.ceil((high + low)/2);

        while (low <= high) {
            var testRange = this.ranges[mid];
            // test if range is lower than testRange
            if (range[1] < testRange[0]) {
                // it is lower, so lower the high
                high = mid-1;
            }
            // test if range is higher than testRange
            else if (range[0] > testRange[1]) {
                // it is higher, so raise the low
                low = mid+1;
            }
            // if it gets here, it overlaps testRange
            else {
                // combine the range and testRange
                testRange[0] = CharRange.min(testRange[0], range[0]);
                testRange[1] = CharRange.max(testRange[1], range[1]);
                this.mergeAround(mid);
                return;
            }
            mid = Math.round((high + low)/2);
        }
        // if it gets here, time to add range to ranges
        this.ranges.splice(low, 0, range);
        this.mergeAround(low);

        // for testing, make sure the range is correct
        // if (!this.verify()) {
        //     throw("uh oh");
        // }
    }
    verify() {
        for (var i = 0; i < this.ranges.length; i++) {
            var r = this.ranges[i];
            if (r[1] < r[0]) {
                return false;
            }
            if (i > 0) {
                // check with prev
                var prev = this.ranges[i-1];
                if (CharRange.nextChar(prev[1]) >= r[0]) {
                    return false;
                }
            }
        }
        return true;
    }
    append(cRange) {
        for (var r of cRange.ranges) {
            this.add(r);
        }
    }
    has(c) {
        var low = 0;
        var high = this.ranges.length-1;
        var mid = Math.ceil((high + low)/2);

        while (low <= high) {
            var testRange = this.ranges[mid];
            // test if c is lower
            if (c < testRange[0]) {
                high = mid-1;
            }
            // test if c is highrt
            else if (c > testRange[1]) {
                low = mid+1;
            }
            // if it gets here, it's in the range
            else {
                return true;
            }
            mid = Math.round((high + low)/2);
        }
        // if it gets here, no match
        return false;
    }
    mergeAround(i) {
        // search below and above i to see if the ranges can merge

        // search belowII
        while (i >= 1) {
            var range = this.ranges[i];
            var prev = this.ranges[i-1];
            if (range[0] <= CharRange.nextChar(prev[1])) {
                // merge prev and range into prev
                prev[0] = CharRange.min(range[0], prev[0]);
                prev[1] = CharRange.max(range[1], prev[1]);

                // delete range
                this.ranges.splice(i, 1);
                i--;
            } else {
                break;
            }
        }

        // // search below
        // if (i >= 1) {
        //     var prevRange = this.ranges[i-1];
        //     if (CharRange.nextChar(prevRange[1]) === range[0]) {
        //         // merge the two
        //         prevRange[1] = range[1];
        //         // remove range
        //         this.ranges.splice(i, 1);
        //         // shift index
        //         i--;
        //         range = this.ranges[i];
        //     }
        // }

        // search above II
        while (i < this.ranges.length-1) {
            var range = this.ranges[i];
            var next = this.ranges[i+1];
            if (CharRange.nextChar(range[1]) >= next[0]) {
                // merge next and range into next
                next[0] = CharRange.min(range[0], next[0]);
                next[1] = CharRange.max(range[1], next[1]);

                // delete range
                this.ranges.splice(i, 1);
                // no need to shift the index
            } else {
                break;
            }
        }

        // // search above
        // if (i < this.ranges.length-1) {
        //     var nextRange = this.ranges[i+1];
        //     if (CharRange.nextChar(range[1]) === nextRange[0]) {
        //         // merge the two
        //         nextRange[0] = range[0];
        //         // remove range
        //         this.ranges.splice(i, 1);
        //         // shift index
        //         i++;
        //     }
        // }
    }
    get str() {
        var txt = '';
        for (var r of this.ranges) {
            txt += '<\'' + r[0] + '\', \'' + r[1] + '\'> ';
        }
        return txt;
    }
}
CharRange.max = function(a, b) {
    if (a > b) {
        return a;
    }
    return b;
};
CharRange.min = function(a, b) {
    if (a < b) {
        return a;
    }
    return b;
};
CharRange.nextChar = function(c) {
    return String.fromCharCode(c.charCodeAt(0)+1);
}
CharRange.equals = function(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    // now the lengths are the same
    // compare the ranges
    for (var i in a) {
        if (
            a[i][0] !== b[i][0] ||
            a[i][1] !== b[i][1]
        ) {
            return false;
        }
    }

    // at this point...
    return true;
}
CharRange.union = function(a, b) {
    var res = new CharRange();
    for (var r of a.ranges) {
        res.add(r);
    }
    for (var r of b.ranges) {
        res.add(r);
    }
    return res;
}

// very rigorous tests...
// var a = new CharRange([['a', 'b'], ['c', 'd']]);
// a.add(['F', 'A']);
// a.add(['A', 'F']);
// a.add(['0', '3']);
// a.add(['5', '5']);
// a.add(['4', '4']);
// a.add(['9', '9']);
// a.add(['7', '7']);
// a.add(['8', '8']);
// a.add(['c', 'z']);
// a.add(['9', 'a']);
// pr(a.str);

// union test
// var a = new CharRange([['a', 'b'], ['d', 'e']]);
// var b = new CharRange([['c', 'c'], ['f', 'g']]);
// var c = CharRange.union(a, b);
// pr(c.str);