var canvas = document.getElementById('c'),
    ctx = canvas.getContext('2d'),
    w = canvas.width,
    h = canvas.height,
    hw = Math.round(w / 2),
    hh = Math.round(h / 2),
    vw = x => {
        return x * (w * 0.01);
    },
    vh = y => {
        return y * (h * 0.01);
    },
    sectionLength = 50,
    π = 3.141592653589793,
    𝜏 = π * 2;


(r = () => {
    canvas.width = 300;
    canvas.height = 300;
    w = canvas.width;
    h = canvas.height;
    hw = Math.round(w / 2);
    hh = Math.round(h / 2);
})();

class vec {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;

        this.rot = (angle, length) => {
            this.x = length * Math.cos(angle) + 50;
            this.y = length * Math.sin(angle) + 50;
            return this;
        }

        this.add = v => {
            return new vec(this.x + v.x, this.y + v.y);
        }

        this.div = n => {
            return new vec(this.x / n, this.y / n);
        }

        this.distance = v => {
            let a = this.x - v.x,
                b = this.y - v.y;
            return a * a + b * b
        }
    }
}

class Section {
    constructor(val, sections) {
        this._sects = sections;
        this._n = ~~val;
        this._pos = [
            new vec().rot(𝜏 * (this._n / sections), sectionLength),
            new vec().rot(𝜏 * (this._n / sections) - (π / (sections * 0.5)), sectionLength)
        ];

        this._render = () => {
            ctx.beginPath();
            ctx.moveTo(vw(this._pos[0].x), vh(this._pos[0].y));
            ctx.lineTo(vw(this._pos[1].x), vh(this._pos[1].y));
            ctx.lineTo(hw, hh);
            ctx.closePath();

            ctx.fillStyle = 'hsla(' + this._n / this._sects * 360 + ', 100%, ' + '50%, 100)';
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.fill();


            let avgV = this.avgPos;
            ctx.font = (this._n == 10 ? 20 : 40) + 'px Comic Sans MS';
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = '#000';

            ctx.save();
            ctx.translate(vw(avgV.x), vh(avgV.y));
            ctx.rotate(𝜏 * (this._n / sections) + this.rotAmt + π * 0.5);
            ctx.fillText(this._n == 10 ? 'reset' : this._n, 0, 0);
            ctx.restore();
        }

        this.rotAmt = 0;
    }

    get avgPos() {
        let v = this._pos[0].add(this._pos[1]).add(new vec(50, 50))
        return v.div(3);
    }
}

class Wheel {
    constructor(sections) {
        this._sections = [];
        for (let i = 0; i < sections; ++i) {
            this._sections.push(new Section(i, sections));
        }

        this.rotSpeed = 0;
        this.spinning = false;

        this.update = () => {
            let nSects = this._sections.length;

            if (this.rotSpeed > 0.001) {

                for (let s of this._sections) {
                    s.rotAmt += this.rotSpeed;

                    let offset = 𝜏 * (s._n / nSects) + s.rotAmt

                    s._pos = [
                        new vec().rot(offset, sectionLength),
                        new vec().rot(offset - (π / (nSects * 0.5)), sectionLength)
                    ];
                }
                this.rotSpeed *= 0.99;
            } else if (this.spinning) {
                let winningSection,
                    winningDistance = Infinity;
                for (let s of this._sections) {
                    let d = s.avgPos.distance(new vec(50, 0))
                    if (d < winningDistance) {
                        winningDistance = d;
                        winningSection = s;

                    }
                }
                if (winningSection._n == 10) {
                    document.getElementById('number').value = '';
                } else {
                    document.getElementById('number').value += winningSection._n;
                }
                this.spinning = false;
            }
        }

        this.spin = () => {
            if (this.spinning) return;
            this.spinning = true;
            this.rotSpeed = Math.random() * (2.5 - 0.5) + 0.5;
        }
        this.render = () => {
            for (let s of this._sections) {
                s._render();
            }

            ctx.beginPath();
            ctx.moveTo(hw, 0);
            ctx.lineTo(hw + 7, 10);
            ctx.lineTo(hw, 40);
            ctx.lineTo(hw - 7, 10);
            ctx.closePath();

            ctx.fillStyle = '#401911';
            ctx.fill();
        }
    }
};

const wheel = new Wheel(11);

(f = i => {
    requestAnimationFrame(f);
    ctx.clearRect(0, 0, w, h);

    wheel.update();
    wheel.render();
})();