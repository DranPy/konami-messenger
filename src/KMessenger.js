window.KMessenger = (function() {
    const KM = {
        konamiCode: 'injects3crets',
        init: function(options) {
            this._codeLength = this.konamiCode.length;
            this.options = Object.assign({}, this.options, options);
            document.addEventListener('keydown', keydownHandler.bind(this));
        },
        options: {
            selector: undefined
        },
        destroy: function() {
            this._codeLength = 0;
            this._passCount = 0;

            document.removeEventListener('keydown', keydownHandler);

            this._timer.stop();
        },
        resetCode: function() {
            this._passCount = 0;
            this._timer.stop();
        },
        _timer: {
            start:  function(timestamp, callback) {
                clearInterval(this._timerId);
                let seconds = 0;

                this._timerId = setInterval(() => {
                    seconds++;
                    
                    if(seconds === timestamp) {
                        callback && callback();
                        this.stop();
                    }
                }, 1000);
            },
            stop: function(){
                clearInterval(this._timerId);
                this._timerId = undefined;
            },
            _timerId: undefined
        },
        showMessage: function() {
            fetch('https://api.github.com/repos/elixir-lang/elixir/issues')
                .then(resp => resp.json())
                .then(issues => {
                    let output = '';
                    const container = document.querySelector(this.options.selector);

                    const messages = issues
                        .sort((a, b) =>  { return Date.parse(a.updated_at) <= Date.parse(b.updated_at) ? 1 : -1; })
                        .slice(0, 5)
                        .map(function(issue) {
                            return {
                                title: issue.title,
                                nickname: issue.user.login
                            };
                        });

                    messages.forEach((e) => { 
                        output += `${e.title} <strong>${e.nickname}</strong><br/>`; 
                    });

                    container.innerHTML = output;

                    this._timer.start(15, () => {
                        container.innerHTML = '';
                    });
                })
                .catch(e => console.error(e.message));
        },
        _codeLength: 0,
        _passCount: 0
    };

    function keydownHandler(e) {
        const KEYCODE_ESC = 27; 
        const char = String.fromCharCode(e.keyCode).toLowerCase();

        if(e.keyCode === KEYCODE_ESC) 
            this.resetCode();

        if(char == this.konamiCode[this._passCount]) {
            this._passCount++;

             if(this._passCount > 0)
                this._timer.start(5, () => { this._passCount = 0; });

            if(this._passCount === this._codeLength)
                this.showMessage();
        } else {
            this.resetCode();
        }
    }

    return KM;
})();
