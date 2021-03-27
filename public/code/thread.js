// let threads = []

// fetch('/api')
// .then(response => response.json())
// .then((proposals) =>{
//     localStorage.setItem('threads', JSON.stringify(proposals.data));
//     // threads = JSON.parse(JSON.stringify(proposals.data));
//     // console.log(proposals.data);
//     // return proposals.data;
// })


// if (localStorage && localStorage.getItem('threads')) {
//     threads = JSON.parse(localStorage.getItem('threads'));
// } else {
//     localStorage.setItem('threads', JSON.stringify(threads));
// }

// threads = JSON.parse(localStorage.getItem('threads'));

// getData();

// async function getData() {
//     const response = await fetch('/api');
//     const data = await response.json();
//     threads = data.data;
//     console.log(threads);
// }


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

function displayCom(comment, thread){
    
    // document.getElementById('temp_text_area').remove()
    if(comment.id.length == 2){
        commentHtml = create_comment(comment);
        comments.insertAdjacentHTML('beforeend', commentHtml);
    } else {
        // console.log(comment.id.slice(0, comment.id.length - 1));
        expand(comment.id.slice(0, comment.id.length - 1), thread)
    }
    // document.getElementById('temp_text_area').remove()
}

async function display_comments(comments, thread){
    // console.log(comments);
    for(var com of comments){
        // console.log(com);
        expand(com.id.slice(0, com.id.length - 1), thread)
        display_comments(com.comments, thread)
    }
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
        <button class="comment_options" id="reply" type="button" onclick="reply(${comment.id})">reply</button>
        <button class="comment_options" type="button" onclick="vote(${comment.id}, 1)">upvote</button>
        <button class="comment_options" type="button" onclick="vote(${comment.id}, -1)">downvote</button>
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
    var comment = find_comment(thread, comment_id, 2);
    if (comment != null){
        for(var c of comment.comments){
            if(document.getElementById(c.id) == null){
                document.getElementById(comment.id).innerHTML += create_comment(c)
            }
        }
    }
}

async function vote(comment_id, diff){

    const response = await fetch('/api');
    const data = await response.json();
    const db_threads = data.data;

    var id = window.location.search.slice(1);
    var thread = db_threads.find(t => t.id == id);

    // for(var com of thread.comments){
    //     if(com.id == comment_id){
    //         // com.score += 1;
    //         document.getElementById("score_" + com.id).innerHTML = "score: " + com.score;
    //     }
    // }
    
    var comment = find_comment(thread, ""+comment_id, 2);
    document.getElementById("score_" + comment.id).innerHTML = "score: " + (comment.score + diff);
    

    const options= {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([thread, {com_id : comment_id}, {action : "vote"}, {diff: diff}])
    };
    
    const response_2 = await fetch('/update_proposal', options);
    const last_response = await response_2.json();
}

function find_comment(thread, comment_id, depth){
    for (let comment of thread.comments){
       if(comment.id == comment_id.slice(0, depth)){
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
    // alert(parrent_comment_id)

    const response = await fetch('/api');
    const data = await response.json();
    const db_threads = data.data;

    var id = window.location.search.slice(1);
    var thread = db_threads.find(t => t.id == id);

    var comment = {
        content: txt.value,
        score: 0,
        id: "",
        parent_id: parrent_comment_id,
        type: t,
        base_score: 1,
        comments: [],
    }

    txt.value = '';

    if(document.getElementById('temp_text_area') != null){
        document.getElementById('temp_text_area').remove()
    }

    const options= {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([thread, comment, {action: "comment"}])
    };

    const response_2 = await fetch('/update_proposal', options);
    const temp = await response_2.json();
    thread = temp[0];
    comment = temp[1];
    // console.log(thread);
    // console.log(thread);

    displayCom(comment, thread);
}