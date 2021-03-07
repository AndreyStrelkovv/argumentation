let threads = []

if (localStorage && localStorage.getItem('threads')) {
    threads = JSON.parse(localStorage.getItem('threads'));
} else {
    localStorage.setItem('threads', JSON.stringify(threads));
}

threads = JSON.parse(localStorage.getItem('threads'));

function addProposal(txt){

    var thread = {
        id: '' + (threads.length + 1),
        title: "Proposal " + (threads.length + 1),
        author: "Aaron",
        date: 0,
        content: txt.value,
        support_list: [] ,
        oppose_list: [] ,
        comments: []
    }

    txt.value = '';
    threads.push(thread)
    localStorage.setItem('threads', JSON.stringify(threads));
    window.location.reload(true)

    displayProposal(thread)
}

function displayProposal(thread){
    var html = `
    <li class="row">
        <a href="thread.html?${thread.author}">
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

function displayCom(comment){
    commentHtml = create_comment(comment)
    // document.getElementById('temp_text_area').remove()

    if(comment.id.length == 2){
        comments.insertAdjacentHTML('beforeend', commentHtml);
    } else {
        expand(comment.id.slice(0, comment.id.length - 1))
    }

    // document.getElementById('temp_text_area').remove()
}

function create_comment(comment){
    var commentHtml = `
    <div id="${comment.id}" class="comment">
        <div class="top-comment">
            <p class="user">
                id: ${comment.id}
            </p>
            <p id="score_${comment.id}" class="comment-ts">
                score: ${comment.score}
            </p>
            <p class="comment-ts">
                    ${comment.type}
            </p>
        </div>
        <div class="comment-content">
            ${comment.content}
        </div>
        <div>
            <button class="comment_options" id="expand" type="button" onclick="expand(${comment.id})">expand</button>
            <button class="comment_options" id="collapse" type="button" onclick="collapse(${comment.id})">collapse</button>
            <button class="comment_options" id="reply" type="button" onclick="reply(${comment.id})">reply</button>
            <button class="comment_options" type="button" onclick="upvote(${comment.id})">upvote</button>
        </div>
    </div>`
    return commentHtml
}

// function display_comments(comments){

//     for(var com of comments){
//         expand()
//     }
// }

function reply(comment_id){
    if(document.getElementById('temp_text_area') == null){
        replyHtml = `
        <div id="temp_text_area">
        <textarea id="arg_reply"></textarea>
        <div class="com">
            <button class="oppose" type="button" onclick="
                addCom(document.getElementById('arg_reply'), ${comment_id},'oppose')">oppose</button>
            <button class="support" type="button" onclick="
                addCom(document.getElementById('arg_reply'), ${comment_id},'support')">support</button>
        </div>
        </div>
        `
        document.getElementById(comment_id).innerHTML += replyHtml
    } else {
        document.getElementById('temp_text_area').remove()
    }
}

function expand(comment_id){
    for(var com of thread.comments){
        if(com.id == comment_id && com.comments.length > 0){
            for(var c of com.comments){
                if(document.getElementById(c.id) == null){
                    document.getElementById(com.id).innerHTML += create_comment(c)
                }
            }
            break;
        }
    }
}

function collapse(comment_id){
    for(var com of thread.comments){
        if(com.id == comment_id && com.comments.length > 0){
            if (document.getElementById(com.comments[0].id) !== null){
                for(var c of com.comments){
                    document.getElementById(c.id).remove()
                }
                break;
            }
        }
    }
}

function upvote(comment_id){

    for(var com of thread.comments){
        if(com.id == comment_id){
            com.score += 1;
            document.getElementById("score_" + com.id).innerHTML = "score: " + com.score;
        }
    }

    localStorage.setItem('threads', JSON.stringify(threads));
}

function addCom(txt, parrent_comment_id, t){
    // alert(parrent_comment_id)

    var parent_comment;
    for(var com of thread.comments){
        if(com.id == parrent_comment_id){
        // if(com.id == parrent_comment_id.value){
            parent_comment = com;
        }
    }

    // alert(parent_comment)

    var new_comment_id;
    if(parent_comment == null){
            new_comment_id = '' + thread.id + (thread.support_list.length + thread.oppose_list.length + 1);
    } else {
            new_comment_id = '' + parent_comment.id + (parent_comment.support_list.length + parent_comment.oppose_list.length + 1);
    }

    var comment = {
        content: txt.value,
        score: 0,
        id: new_comment_id,
        type: t,
        base_score: 1,
        comments: [],
        support_list: [],
        oppose_list: []
    }

    txt.value = '';
    // parrent_comment_id = '';
    // parrent_comment_id.value = '';
    if(parent_comment == null){
        // alert("here")
        if(t == "support"){
            thread.support_list.push(comment)
        } else {
            thread.oppose_list.push(comment)
        }
    } else {
        parent_comment.comments.push(comment)
        if(t == "support"){
            parent_comment.support_list.push(comment)
        } else {
            parent_comment.oppose_list.push(comment)
        }
    }

    // alert(document.getElementById('temp_text_area'))
    if(document.getElementById('temp_text_area') != null){
        document.getElementById('temp_text_area').remove()
    }

    thread.comments.push(comment);
    localStorage.setItem('threads', JSON.stringify(threads));

    displayCom(comment);
}

function clear_proposals(){
    localStorage.clear();
    window.location.reload(true);
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