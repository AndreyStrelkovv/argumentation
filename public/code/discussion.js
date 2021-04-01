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
        _id: "",
        title: "Proposal ",
        type: "proposal",
        score: 0,
        date: 0,
        content: txt.value,
        comments: []
    };

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

async function vote_proposal(id){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;

    for (let thread of threads){
        if (thread._id == id){

            const options= {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([thread, {thread_id : id}, {action : "vote_proposal"}])
            };
            
            const response_2 = await fetch('/update_proposal', options);
            const last_response = await response_2.json();

            if( document.getElementById("score_proposal_" + id + "_" + "quad")){
                document.getElementById("score_proposal_" + id + "_" + "quad").innerHTML = "score: " + (thread.score + 1);
            }

            if(document.getElementById("score_proposal_" + id + "_" + "quad_v")){
                document.getElementById("score_proposal_" + id + "_" + "quad_v").innerHTML = "score: " + (thread.score + 1);
            }

            document.getElementById("score_proposal_" + thread._id).innerHTML = "score: " + (thread.score + 1);

            break;
        }
    }

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
                    <p class="timestamp" id="score_proposal_${thread._id}_${framework}">
                        score : ${thread.score}
                    </p>
                </div>
            </div>
            <div class="right">
                <button class="view" onclick="view_proposal(${thread._id})">View</button>
                <button onclick="vote_proposal(${thread._id})">Vote</button>
            </div>
        </div>
        <div class="content">
            <p>
                ${thread.content}
            </p>
        </div>
        `
    } else {
        // <a href="thread.html?${thread.id}">
        // </a>
        html = `
        <div class="full_width">
            <div class="left">
                <h4 class="title">
                    ${thread.title}
                </h4>
                <div class="bottom">
                    <p class="timestamp" id="score_proposal_${thread._id}">
                        score : ${thread.score}
                    </p>
                </div>
            </div>
            <div class="right">
                <button class="view" onclick="view_proposal(${thread._id})">View</button>
                <button onclick="vote_proposal(${thread._id})">Vote</button>
            </div>
        </div>
        <div class="content">
            <p>
                ${thread.content}
            </p>
        </div>
        `
    }

    return html;
}

function view_proposal(thread_id){

    var thread_id_json = {
        id: thread_id
    };

    // alert(thread_id_json);

    localStorage.setItem('thread_id', JSON.stringify(thread_id_json));
    window.location.href = `thread.html?${thread_id}`;
}

function display_prop(thread){
    
    var container = document.getElementById('list_of_proposals');
    var html = `
    <div class="row">
        ${create_proposal(thread, null)}
    </div>
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

function attach_scores(scores_list, framework){
    for (let pair of scores_list){
        score = pair[0];
        thread = pair[1];
        document.getElementById('score_proposal_' + thread._id).textContent += `; ${framework} : ${score}`;
    }
}

async function quad_v(){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;
    // console.log(threads);

    scores_list = []
    var greatest_score = null;
    var greatest_proposal = null;

    for (var thread of threads){
        var score = 0;
        for (var arg of thread.comments){
            arg_score_v(arg);

            if (arg.type === "support"){
                score += arg.score;
            } else {
                score -= arg.score;
            }
        }
        scores_list.push([score, thread]);

        // alert(greatest_score);

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
    attach_scores(scores_list, 'quad_v');
    most_popular_proposal(greatest_proposal, 'quad_v');

}

async function quad(){
    const response = await fetch('/api');
    const data = await response.json();
    const threads = data.data;

    scores_list = []
    var greatest_score = null;
    var greatest_proposal = null;

    for (var thread of threads){
        var base_score = 0;
        for (var arg of thread.comments){
            arg_score(arg);

            if (arg.type === "support"){
                base_score += arg.base_score;
            } else {
                base_score -= arg.base_score;
            }
        }
        scores_list.push([base_score, thread]);
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
    attach_scores(scores_list, 'quad');
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