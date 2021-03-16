let threads = []

// console.log(threads);
// function getData(){
fetch('/api')
.then(response => response.json())
.then((proposals) =>{
    localStorage.setItem('threads', JSON.stringify(proposals.data));
    // threads = JSON.parse(JSON.stringify(proposals.data));
    // console.log(proposals.data);
    // return proposals.data;
})

if (localStorage && localStorage.getItem('threads')) {
    threads = JSON.parse(localStorage.getItem('threads'));
    // console.log(threads);
} else {
    localStorage.setItem('threads', JSON.stringify(threads));
}

// threads = JSON.parse(localStorage.getItem('threads'));


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

async function get_data() {
    const response = await fetch('/api');
    const data = await response.json();
    // threads = data.data;
    // for (var item of data.data){
    //     threads.push(item);
    // }
    console.log(data.data);
    // console.log(threads);
    // threads = JSON.parse(JSON.stringify(data.data));
    // console.log(threads);
}
// console.log(getData());


async function send_update_to_server(){
    const options= {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(threads)
    };

    const response = await fetch('/api', options);
    const json = await response.json();
    // console.log(json);

    // fetch('/api', options)
    // .then(response => response.json())
    // .then((proposals) => {
    //     // console.log(proposals);
    // })
}

function addProposal(txt){

    var thread = {
        id: "" + (threads.length + 1),
        title: "Proposal " + (threads.length + 1),
        type: "proposal",
        date: 0,
        content: txt.value,
        support_list: [] ,
        oppose_list: [] ,
        comments: []
    }

    txt.value = '';
    threads.push(thread)
    send_update_to_server();
    localStorage.setItem('threads', JSON.stringify(threads));
    // window.location.reload(true)

    display_prop(thread)
}


function display_proposals(threads){
    // alert("here")
    // console.log(threads);
    // alert(threads.length)
    for (let thread of threads) {
        display_prop(thread);
    }
}


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
                <p class="comment-count">
                    ${thread.comments.length} comments
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

function quad_v(){
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

function quad(){
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