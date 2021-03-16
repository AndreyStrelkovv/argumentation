let threads = []

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
} else {
    localStorage.setItem('threads', JSON.stringify(threads));
}

threads = JSON.parse(localStorage.getItem('threads'));

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

function display_comments(comments){
    for(var com of comments){
        expand(com.id.slice(0, com.id.length - 1))
        display_comments(com.comments)
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
        <button class="comment_options" type="button" onclick="upvote(${comment.id})">upvote</button>
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

function upvote(comment_id){

    for(var com of thread.comments){
        if(com.id == comment_id){
            com.score += 1;
            document.getElementById("score_" + com.id).innerHTML = "score: " + com.score;
        }
    }
    send_update_to_server();
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
            new_comment_id = "" + thread.id + (thread.support_list.length + thread.oppose_list.length + 1);
    } else {
            new_comment_id = "" + parent_comment.id + (parent_comment.support_list.length + parent_comment.oppose_list.length + 1);
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
    send_update_to_server();
    localStorage.setItem('threads', JSON.stringify(threads));

    displayCom(comment);
}