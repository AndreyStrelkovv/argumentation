function displayCom(comment, thread){
    
    // document.getElementById('temp_text_area').remove()
    if(comment._id.length == thread._id.length+1){
        commentHtml = create_comment(comment);
        comments.insertAdjacentHTML('beforeend', commentHtml);
    } else {
        expand(comment._id.slice(0, comment._id.length - 1), thread)
    }
    // document.getElementById('temp_text_area').remove()
}

async function display_comments(comments, thread){
    // console.log(comments);
    for(var com of comments){
        // console.log(com);
        expand(com._id.slice(0, com._id.length - 1), thread)
        display_comments(com.comments, thread)
    }
}

function create_comment(comment){
    var commentHtml = `
    <div id="${comment._id}" class="comment">
        <div class="top-comment">
            <p class="user">
                id: ${comment._id}
            </p>
            <p id="score_${comment._id}" class="comment-ts">
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
            <button class="comment_options" id="reply" type="button" onclick="reply(${comment._id})">reply</button>
            <button class="comment_options" type="button" onclick="vote(${comment._id}, 1)">upvote</button>
            <button class="comment_options" type="button" onclick="vote(${comment._id}, -1)">downvote</button>
        </div>
    </div>`
    return commentHtml
}


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

async function expand(comment_id, thread){
    var comment = find_comment(thread, comment_id, thread._id.length+1);
    // console.log()
    if (comment != null){
        for(var c of comment.comments){
            if(document.getElementById(c._id) == null){
                document.getElementById(comment._id).innerHTML += create_comment(c)
            }
        }
    }
}

async function vote(comment_id, diff){
    var id = window.location.search.slice(1);
    // var thread = db_threads.find(t => t._id == id);

    const options = {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({thread_id : id})
    };

    const response = await fetch('/get_proposal', options);
    var thread = await response.json();

    var comment = find_comment(thread, ""+comment_id, thread._id.length+1);
    document.getElementById("score_" + comment._id).innerHTML = "score: " + (comment.upvote - comment.downvote + diff);
    

    const options_2 = {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([thread, {com_id : comment_id}, {action : "vote"}, {diff: diff}])
    };
    
    const response_2 = await fetch('/update_proposal', options_2);
    // const output = await response_2.json();
}

function find_comment(thread, comment_id, depth){
    for (let comment of thread.comments){
       if(comment._id == comment_id.slice(0, depth)){
          if(comment_id.length == depth){
            //  console.log(comment);
             return comment;
          } else {
             return find_comment(comment, comment_id, depth+1);
          }
       }
    }
 }

async function addCom(txt, parrent_comment_id, t){

    var id = window.location.search.slice(1);

    const options= {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({thread_id : id})
    };

    const response = await fetch('/get_proposal', options);
    var thread = await response.json();

    var comment = {
        content: txt.value,
        score: 0,
        upvote: 0,
        downvote: 0,
        _id: "",
        parent_id: parrent_comment_id,
        type: t,
        base_score: 1,
        comments: [],
    }

    txt.value = '';

    if(document.getElementById('temp_text_area') != null){
        document.getElementById('temp_text_area').remove()
    }

    const options_2 = {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([thread, comment, {action: "comment"}])
    };

    const response_2 = await fetch('/update_proposal', options_2);
    const temp = await response_2.json();
    thread = temp[0];
    comment = temp[1];

    displayCom(comment, thread);
}