console.log('If you\'re opening this because you were editing a response');
console.log('and opened a different response, losing data, please in the');
console.log('future use notepad/notepad++ where you can save easily and');
console.log('copy+paste into here.')
console.log('Your only hope of recovery is localStorage; here is the');
console.log('command you should run:');
console.log('tryRecoverResponses()');

function tryRecoverResponses() {
    let ents = Object.entries(localStorage);

    let found = [];
    for(var i = 0, len = ents.length; i < len; i++) {
        let key = ents[i][0];
        if(!key.startsWith('ResponseWidget-') || !key.endsWith('-body'))
            continue;

        let body = ents[i][1];
        let desc = localStorage.getItem(key.slice(0, -4) + 'desc');
        let reason = localStorage.getItem(key.slice(0, -4) + 'reason');

        let tm = parseInt(key.split('-')[2]);

        found.push([tm, body, desc, reason]);
    }

    found.sort();

    for(var i = 0, len = found.length; i < len; i++) {
        let ele = found[i];
        let dt = new Date(ele[0]);
        console.log(dt.toLocaleString());
        console.log(`body: ${ele[1]}`);
        console.log(`desc: ${ele[2]}`);
        console.log(`reason: ${ele[3]}`);
    }

    console.log('finished enumerating found responses');
}

ReactDOM.render(
    React.createElement(React.Fragment, null, [
        React.createElement(NavbarLoader, {key: 'navbar', currentPage: 'responses'}),
        React.createElement('div', {key: 'main', className: 'main'}, [
            React.createElement(ResponsesWidget, {
                key: 'responses'
            })
        ]),
        React.createElement(Footer, {key: 'footer'})
    ]),
    document.getElementById('content')
);
