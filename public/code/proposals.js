function clear_proposals(){
    localStorage.clear();
    window.location.reload(true);
    clear_db();
}

function clear_db(){
    const options= {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: ""
    };
    fetch('/clear', options);
}

async function addProposal(txt){

    var thread = {
        id: "",
        title: "Proposal ",
        type: "proposal",
        date: 0,
        content: txt.value,
        comments: []
    }

    const options= {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(thread)
    };

    const response = await fetch('/proposal', options);
    thread = await response.json();
    // console.log("here")
    console.log(thread);
    txt.value = '';
    // threads.push(thread)
    // localStorage.setItem('threads', JSON.stringify(threads));
    // window.location.reload(true)

    display_prop(thread)
}

async function display_proposals(){
    const response = await fetch('/api');
    const data = await response.json();
    threads = data.data;
    console.log(threads);

    for (let thread of threads) {
        display_prop(thread);
    }
    // console.log(threads);
}


// function display_proposals(threads){
//     // alert("here")
//     // console.log(threads);
//     // alert(threads.length)
//     for (let thread of threads) {
//         display_prop(thread);
//     }
// }


function display_prop(thread){
    
    var container = document.querySelector('ol');
    var html = `
    <li class="row">
        <a href="thread.html?${thread.id}">
            <h4 class="title">
                ${thread.title}
            </h4>
            <div class="bottom">
                <p class="timestamp">
                    ${new Date(thread.date).toLocaleString()}
                </p>
            </div>
            <div>
                ${thread.content}
            </div>
        </a>
    </li>
    `
    container.insertAdjacentHTML('beforeend', html);
}

async function quad_v(){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;
    // console.log(threads);

    scores_v = []

    for (var thread of threads){
        var score = 0;
        for (var arg of thread.comments){
            if (arg.id.length === 2){
                arg_score_v(arg);
    
                if (arg.type === "support"){
                    score += arg.score;
                } else {
                    score -= arg.score;
                }
            }
        }
        scores_v.push(score);
    }

    var l = '';
    for (var n of scores_v){
        l += ' ' + n;
    }
    alert(l)
}

async function quad(){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;

    scores = []

    for (var thread of threads){
        var score = 0;
        for (var arg of thread.comments){
            if (arg.id.length === 2){
                arg_score(arg);
    
                if (arg.type === "support"){
                    score += arg.base_score;
                } else {
                    score -= arg.base_score;
                }
            }
        }
        scores.push(score);
    }

    var l = '';
    for (var n of scores){
        l += ' ' + n;
    }
    alert(l)
}

function arg_score(arg){
    // alert(arg.base_score)
    for (var argument of arg.comments){
        arg_score(argument);
    }

    // alert("here")

    for (var argument of arg.comments){
        // alert(arg.type)
        if (argument.type === "support"){
            // alert("here")
            arg.base_score += 0.5 * argument.base_score;
        } else if(argument.type === "oppose") {
            arg.base_score -= 0.5 * argument.base_score;
        }
    }

    if (arg.type === "support" && arg.base_score < 0){
        arg.base_score = 0;
    }

    if (arg.type === "oppose" && arg.base_score < 0){
        arg.base_score = 0;
    }
}

function arg_score_v(arg){
    // alert(arg.base_score)
    for (var argument of arg.comments){
        arg_score_v(argument);
    }

    for (var argument of arg.comments){
        // alert(arg.type)
        if (argument.type === "support"){
            // alert("here")
            arg.score += 0.5 * argument.score;
        } else if(argument.type === "oppose") {
            arg.score -= 0.5 * argument.score;
        }
    }

    if (arg.type === "support" && arg.score < 0){
        arg.score = 0;
    }

    if (arg.type === "oppose" && arg.score < 0){
        arg.score = 0;
    }
}