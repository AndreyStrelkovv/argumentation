function clear_proposals(){
    localStorage.clear();
    window.location.reload(true);
    clear_db();
}

function clear_db(){
    const options = {
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
        score: 0,
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
async function vote_proposal(id){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;

    for (let thread of threads){
        if (thread.id == id){

            const options= {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([thread, {thread_id : id}, {action : "vote_proposal"}])
            };
            
            const response_2 = await fetch('/update_proposal', options);
            const last_response = await response_2.json();

            document.getElementById("score_proposal_" + id).innerHTML = "score: " + (thread.score + 1);
            break;
        }
    }

}

function display_page(){
    // document.getElementById("log_in").remove();

    var container_top_page = document.getElementById("top_page");
    var container_functionality = document.getElementById("functionality");
    // alert(container_functionality);
    html_top_page = `
    <div class="top-bar">
        <h1>
            Proposals
        </h1>
    </div>
    <div class="main">
        <ol>

        </ol>
    </div>`

    html_functionality = `
    <div id = "proposal">
        <textarea id="proposal_arg"></textarea>
        <button id = "add_button" onclick="addProposal(document.getElementById('proposal_arg'))">add proposal</button>
    </div>

    <div id="decision_buttons">
        <button class="decision" onclick="eval()">Evaluate</button>
        <button class="decision" onclick="clear_proposals()">Clear</button>
    </div>`

    container_top_page.innerHTML = html_top_page;
    container_functionality.innerHTML = html_functionality;
}

function create_proposal(thread, framework){
    var html = '';

    if(framework != null){
        // <a href="thread.html?${thread.id}">
        // </a>
        html = `
        <div class="full_width">
            <div class="left">
                <h4 class="title">
                    ${framework}
                </h4>
                <div class="bottom">
                    <p class="timestamp" id="score_proposal_${thread.id}_${framework}">
                        score : ${thread.score}
                    </p>
                </div>
            </div>
            <div class="right">
                <button onclick="vote_proposal(${thread.id})">Vote</button>
            </div>
        </div>
        <div class="content">
            <p>
                ${thread.content}
            </p>
        </div>
        `
    } else {
        html = `
        <a href="thread.html?${thread.id}">
            <h4 class="title">
                ${thread.title}
            </h4>
            <div class="bottom">
                <p class="timestamp">
                    ${new Date(thread.date).toLocaleString()}
                </p>
            </div>
            <div class="content">
                <p>
                    ${thread.content}
                </p>
            </div>
        </a>
        `
    }

    return html;
}

function display_prop(thread){
    
    var container = document.querySelector('ol');
    var html = `
    <li class="row">
        ${create_proposal(thread, null)}
    </li>
    `
    container.insertAdjacentHTML('beforeend', html);
}

function most_popular_proposal(thread, framework){
    
    if(document.getElementById(`prop_${framework}`) != null){
        // document.getElementById(`prop_${framework}`).remove()
        document.getElementById(`prop_${framework}`).innerHTML = create_proposal(thread, framework);
    } else {
        var container = document.getElementById('results');
        var html = `
        <div id="prop_${framework}" class="most_popular_proposal">
            ${create_proposal(thread, framework)}
        </div>
        `
        container.insertAdjacentHTML('beforeend', html)
    }
    
}

function eval(){
    // alert("works");
    quad_v();
    quad();
}

async function quad_v(){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;
    // console.log(threads);

    scores_v = []
    var greatest_score = null;
    var greatest_proposal = null;

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
        scores_v.push([score, thread]);

        if(greatest_score < score || greatest_score == null){
            greatest_score = score;
            greatest_proposal = thread;
        }
    }

    // var l = '';
    // for (var n of scores_v){
    //     l += ' ' + n[0];
    // }
    // alert(greatest_score)
    // alert(l)
    most_popular_proposal(greatest_proposal, 'quad_v');

}

async function quad(){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;

    scores = []
    var greatest_score = null;
    var greatest_proposal = null;

    for (var thread of threads){
        var base_score = 0;
        for (var arg of thread.comments){
            if (arg.id.length === 2){
                arg_score(arg);
    
                if (arg.type === "support"){
                    base_score += arg.base_score;
                } else {
                    base_score -= arg.base_score;
                }
            }
        }
        // scores.push(score);
        if(greatest_score < base_score || greatest_score == null){
            greatest_score = base_score;
            greatest_proposal = thread;
        }
    }

    // var l = '';
    // for (var n of scores){
    //     l += ' ' + n;
    // }
    // alert(l)
    most_popular_proposal(greatest_proposal, 'quad');

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